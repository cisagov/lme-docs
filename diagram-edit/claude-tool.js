#!/usr/bin/env node
// @decision DEC-TOOL-001
// @title Claude Code tool wrapper for Draw.io co-editing
// @status accepted
// @rationale This file provides the CLI interface that Claude Code invokes
// via Bash. It starts the server (if not running), then dispatches commands
// (inject, load, render, state) via the WebSocket. This keeps the tool
// stateless from Claude's perspective — each call is a fire-and-forget command.

const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const DRAWIO_HOST = process.env.DRAWIO_HOST || 'localhost';
const HTTP_PORT = parseInt(process.env.DRAWIO_HTTP_PORT || '8081', 10);
// WS now runs on the same port as HTTP (single-port architecture)
const WS_PORT = parseInt(process.env.DRAWIO_WS_PORT || process.env.DRAWIO_HTTP_PORT || '8081', 10);
const WS_URL = `ws://${DRAWIO_HOST}:${WS_PORT}/ws`;

// --- Parse CLI arguments ---
const args = process.argv.slice(2);
const command = args[0];

function usage() {
  console.log(`Usage: node claude-tool.js <command> [options]

Commands:
  init                        Start the Draw.io workspace server
  inject <xml>                Merge XML into the active diagram
  inject-file <path>          Merge XML from a file into the diagram
  load <xml>                  Load complete diagram XML (replaces current)
  load-file <path>            Load diagram XML from a file
  render [--no-shadows]       Render current state to high-fidelity PNG
  state                       Print current diagram XML state

Environment:
  DRAWIO_HTTP_PORT            HTTP server port (default: 8080)
  DRAWIO_WS_PORT              WebSocket server port (default: 8081)
  DRAWIO_OUTPUT_DIR           Output directory (default: ./public)
  DRAWIO_RENDER_DPI           Render DPI (default: 300)
`);
}

// --- Check if server is already running ---
function isServerRunning() {
  return new Promise((resolve) => {
    const ws = new WebSocket(WS_URL);
    const timeout = setTimeout(() => {
      ws.close();
      resolve(false);
    }, 2000);

    ws.on('open', () => {
      clearTimeout(timeout);
      ws.close();
      resolve(true);
    });

    ws.on('error', () => {
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

// --- Start the server as a background process ---
async function startServer() {
  const running = await isServerRunning();
  if (running) {
    console.log(`[drawio-tool] Server already running on ports ${HTTP_PORT}/${WS_PORT}`);
    return;
  }

  const serverPath = path.join(__dirname, 'server.js');
  const child = spawn('node', [serverPath], {
    detached: true,
    stdio: 'ignore',
    env: { ...process.env },
  });
  child.unref();

  // Wait for server to be ready
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await isServerRunning()) {
      console.log(`[drawio-tool] Server started successfully`);
      console.log(`[drawio-tool] Dashboard: http://localhost:${HTTP_PORT}`);
      console.log(`[drawio-tool] WebSocket: ws://localhost:${WS_PORT}/ws`);
      console.log('');
      console.log('[drawio-tool] If running in a container, tunnel with chisel:');
      console.log(`  chisel client <host>:<chisel_port> ${HTTP_PORT}:localhost:${HTTP_PORT} ${WS_PORT}:localhost:${WS_PORT}`);
      console.log('');
      console.log(`[drawio-tool] Open http://localhost:${HTTP_PORT} in your browser`);
      return;
    }
  }
  console.error('[drawio-tool] Server failed to start within 10 seconds');
  process.exit(1);
}

// --- Send a command over WebSocket ---
function sendCommand(payload) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('WebSocket timeout — is the server running? Try: node claude-tool.js init'));
    }, 5000);

    ws.on('open', () => {
      clearTimeout(timeout);
      // For state queries, skip the initial status message and wait for the xml response
      if (payload.type === 'get_state') {
        ws.on('message', (data) => {
          const msg = JSON.parse(data.toString());
          // Skip status/welcome messages, wait for the actual state response
          if (msg.action === 'status') return;
          resolve(msg);
          ws.close();
        });
        // Send after attaching listener
        ws.send(JSON.stringify(payload));
      } else {
        ws.send(JSON.stringify(payload));
        resolve({ success: true });
        ws.close();
      }
    });

    ws.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Cannot connect to server: ${err.message}. Run: node claude-tool.js init`));
    });
  });
}

// --- Main ---
async function main() {
  if (!command) {
    usage();
    process.exit(1);
  }

  switch (command) {
    case 'init':
      await startServer();
      break;

    case 'inject': {
      const xml = args.slice(1).join(' ');
      if (!xml) {
        console.error('Error: xml_payload required. Usage: node claude-tool.js inject "<mxGraphModel>...</mxGraphModel>"');
        process.exit(1);
      }
      await sendCommand({ type: 'inject', xml });
      console.log('[drawio-tool] XML injected (merge) successfully');
      break;
    }

    case 'inject-file': {
      const filePath = args[1];
      if (!filePath || !fs.existsSync(filePath)) {
        console.error('Error: valid file path required. Usage: node claude-tool.js inject-file <path>');
        process.exit(1);
      }
      const xml = fs.readFileSync(filePath, 'utf8');
      await sendCommand({ type: 'inject', xml });
      console.log(`[drawio-tool] XML from ${filePath} injected (merge) successfully`);
      break;
    }

    case 'load': {
      const xml = args.slice(1).join(' ');
      if (!xml) {
        console.error('Error: xml_payload required. Usage: node claude-tool.js load "<mxGraphModel>...</mxGraphModel>"');
        process.exit(1);
      }
      await sendCommand({ type: 'load', xml });
      console.log('[drawio-tool] Full diagram loaded successfully');
      break;
    }

    case 'load-file': {
      const filePath = args[1];
      if (!filePath || !fs.existsSync(filePath)) {
        console.error('Error: valid file path required. Usage: node claude-tool.js load-file <path>');
        process.exit(1);
      }
      const xml = fs.readFileSync(filePath, 'utf8');
      await sendCommand({ type: 'load', xml });
      console.log(`[drawio-tool] Diagram from ${filePath} loaded successfully`);
      break;
    }

    case 'render': {
      const shadows = !args.includes('--no-shadows');
      await sendCommand({ type: 'render', apply_shadows: shadows });
      console.log('[drawio-tool] Render triggered — check the dashboard PNG panel');
      break;
    }

    case 'state': {
      const result = await sendCommand({ type: 'get_state' });
      if (result.xml) {
        console.log(result.xml);
      } else {
        console.log('[drawio-tool] No diagram state available yet');
      }
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      usage();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`[drawio-tool] Error: ${err.message}`);
  process.exit(1);
});
