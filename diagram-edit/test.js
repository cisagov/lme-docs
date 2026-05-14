#!/usr/bin/env node
// @decision DEC-TEST-001
// @title Integration tests for drawio-editor-tool server
// @status accepted
// @rationale Tests the server startup, WebSocket messaging, inject/load/state
// APIs, and HTML dashboard generation without needing a browser.

const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const HTTP_PORT = 18080;
const WS_PORT = 18081;
const OUTPUT_DIR = path.join(__dirname, 'test_output');

let serverProcess;
let passed = 0;
let failed = 0;

function test(name, fn) {
  return fn()
    .then(() => {
      passed++;
      console.log(`  PASS: ${name}`);
    })
    .catch((err) => {
      failed++;
      console.log(`  FAIL: ${name}`);
      console.log(`        ${err.message}`);
    });
}

function httpGet(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${HTTP_PORT}${urlPath}`, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
    }).on('error', reject);
  });
}

function wsConnect() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${WS_PORT}/ws`);
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('WebSocket connection timeout'));
    }, 5000);
    ws.on('open', () => {
      clearTimeout(timeout);
      resolve(ws);
    });
    ws.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

function wsSendAndReceive(ws, payload) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('WS response timeout')), 5000);
    ws.once('message', (data) => {
      clearTimeout(timeout);
      resolve(JSON.parse(data.toString()));
    });
    ws.send(JSON.stringify(payload));
  });
}

async function startServer() {
  // Clean up test output
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }

  serverProcess = spawn('node', [path.join(__dirname, 'server.js')], {
    env: {
      ...process.env,
      DRAWIO_HTTP_PORT: String(HTTP_PORT),
      DRAWIO_WS_PORT: String(WS_PORT),
      DRAWIO_OUTPUT_DIR: OUTPUT_DIR,
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  // Wait for server to be ready
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      const ws = new WebSocket(`ws://localhost:${WS_PORT}/ws`);
      await new Promise((resolve, reject) => {
        ws.on('open', () => { ws.close(); resolve(); });
        ws.on('error', reject);
      });
      return;
    } catch {
      // retry
    }
  }
  throw new Error('Server failed to start');
}

async function stopServer() {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    await new Promise((r) => setTimeout(r, 500));
  }
  // Clean up test output
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
}

async function runTests() {
  console.log('\n[drawio-tool] Running tests...\n');

  await startServer();

  // --- HTTP Tests ---
  await test('HTTP: serves index.html at /', async () => {
    const res = await httpGet('/');
    assert.strictEqual(res.status, 200);
    assert(res.body.includes('Draw.io AI Co-Pilot'), 'Should contain page title');
    assert(res.body.includes('embed.diagrams.net'), 'Should contain Draw.io iframe URL');
    assert(res.body.includes(String(WS_PORT)), 'Should contain WS port');
  });

  await test('HTTP: returns 404 for unknown paths', async () => {
    const res = await httpGet('/nonexistent.xyz');
    assert.strictEqual(res.status, 404);
  });

  await test('HTTP: serves index.html with correct content type', async () => {
    const res = await httpGet('/index.html');
    assert.strictEqual(res.status, 200);
    assert(res.headers['content-type'].includes('text/html'));
  });

  // --- Dashboard HTML Tests ---
  await test('Dashboard: HTML file generated in output dir', async () => {
    const htmlPath = path.join(OUTPUT_DIR, 'index.html');
    assert(fs.existsSync(htmlPath), 'index.html should exist');
    const content = fs.readFileSync(htmlPath, 'utf8');
    assert(content.includes('drawio-frame'), 'Should contain drawio iframe');
    assert(content.includes('render-pane'), 'Should contain render pane');
    assert(content.includes('togglePane'), 'Should contain toggle function');
    assert(content.includes('changeZoom'), 'Should contain zoom function');
  });

  // --- WebSocket Tests ---
  await test('WebSocket: connects successfully', async () => {
    const ws = await wsConnect();
    ws.close();
  });

  await test('WebSocket: state is null initially', async () => {
    const ws = await wsConnect();
    const response = await wsSendAndReceive(ws, { type: 'get_state' });
    assert.strictEqual(response.xml, null);
    ws.close();
  });

  await test('WebSocket: load sets diagram state', async () => {
    const ws = await wsConnect();
    const testXml = '<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/></root></mxGraphModel>';

    // Load the XML
    ws.send(JSON.stringify({ type: 'load', xml: testXml }));
    await new Promise((r) => setTimeout(r, 200));

    // Check state
    const response = await wsSendAndReceive(ws, { type: 'get_state' });
    assert.strictEqual(response.xml, testXml);
    ws.close();
  });

  await test('WebSocket: state_update updates server state', async () => {
    const ws = await wsConnect();
    const updatedXml = '<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="test_1" value="Test" vertex="1" parent="1"/></root></mxGraphModel>';

    ws.send(JSON.stringify({ type: 'state_update', xml: updatedXml }));
    await new Promise((r) => setTimeout(r, 200));

    const response = await wsSendAndReceive(ws, { type: 'get_state' });
    assert.strictEqual(response.xml, updatedXml);
    ws.close();
  });

  await test('WebSocket: inject broadcasts merge to other clients', async () => {
    const ws1 = await wsConnect();
    const ws2 = await wsConnect();

    const injectXml = '<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="ai_node_1" value="Injected" vertex="1" parent="1"/></root></mxGraphModel>';

    // Listen on ws2 for the broadcast
    const broadcastPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('No broadcast received')), 3000);
      ws2.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.action === 'merge') {
          clearTimeout(timeout);
          resolve(msg);
        }
      });
    });

    // Send inject from ws1
    ws1.send(JSON.stringify({ type: 'inject', xml: injectXml }));

    const broadcast = await broadcastPromise;
    assert.strictEqual(broadcast.action, 'merge');
    assert.strictEqual(broadcast.xml, injectXml);

    ws1.close();
    ws2.close();
  });

  // --- Module export tests ---
  await test('Module: server.js exports required functions', async () => {
    // We can't require the running server module, but we can check the file exports
    const serverSrc = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    assert(serverSrc.includes('module.exports'), 'Should have module.exports');
    assert(serverSrc.includes('injectXml'), 'Should export injectXml');
    assert(serverSrc.includes('loadXml'), 'Should export loadXml');
    assert(serverSrc.includes('renderHighFidelityPng'), 'Should export renderHighFidelityPng');
    assert(serverSrc.includes('getCurrentState'), 'Should export getCurrentState');
  });

  // --- Tool definition tests ---
  await test('Tools: tools.json is valid and complete', async () => {
    const tools = JSON.parse(fs.readFileSync(path.join(__dirname, 'tools.json'), 'utf8'));
    assert(Array.isArray(tools), 'Should be an array');
    assert(tools.length >= 4, 'Should have at least 4 tools');

    const names = tools.map((t) => t.function.name);
    assert(names.includes('init_diagram_workspace'), 'Should include init tool');
    assert(names.includes('inject_drawio_components'), 'Should include inject tool');
    assert(names.includes('render_high_fidelity_png'), 'Should include render tool');
    assert(names.includes('get_diagram_state'), 'Should include state tool');
  });

  // --- Skill definition tests ---
  await test('Skill: skill.md exists and contains key sections', async () => {
    const skill = fs.readFileSync(path.join(__dirname, 'skill.md'), 'utf8');
    assert(skill.includes('Initialization'), 'Should document initialization');
    assert(skill.includes('Co-Editing'), 'Should document co-editing');
    assert(skill.includes('Observe and Repeat'), 'Should document observe/repeat loop');
    assert(skill.includes('Rendering'), 'Should document rendering');
    assert(skill.includes('mxGraphModel'), 'Should reference mxGraphModel XML format');
  });

  // --- Cleanup ---
  await stopServer();

  // --- Report ---
  console.log(`\n[drawio-tool] Tests complete: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error(`\n[drawio-tool] Test suite error: ${err.message}\n`);
  stopServer().then(() => process.exit(1));
});
