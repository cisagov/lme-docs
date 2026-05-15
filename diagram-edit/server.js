#!/usr/bin/env node
// @decision DEC-ARCH-001
// @title Single-process HTTP+WebSocket bridge server
// @status accepted
// @rationale Combines HTTP (dashboard serving) and WebSocket (AI<->browser bridge)
// into one process. Eliminates separate bridge server. The AI agent starts this
// server, which writes index.html to the output dir and exposes inject/render
// APIs over WebSocket and as module exports for Claude Code tool integration.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');
const { execSync } = require('child_process');

// --- Configuration ---
const HTTP_PORT = parseInt(process.env.DRAWIO_HTTP_PORT || '8080', 10);
const WS_PORT = parseInt(process.env.DRAWIO_WS_PORT || '8081', 10);
const OUTPUT_DIR = process.env.DRAWIO_OUTPUT_DIR || path.join(__dirname, 'public');
const RENDER_DPI = parseInt(process.env.DRAWIO_RENDER_DPI || '300', 10);

// --- State ---
let currentXmlState = null;
const wsClients = new Set();

// --- Ensure output directory exists ---
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// --- Generate and write the dashboard HTML ---
function generateDashboardHtml() {
  const htmlPath = path.join(__dirname, 'dashboard.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  // Inject runtime config
  html = html.replace('{{WS_PORT}}', String(WS_PORT));
  html = html.replace('{{RENDER_DPI}}', String(RENDER_DPI));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), html);
  console.log(`[drawio-tool] Dashboard written to ${path.join(OUTPUT_DIR, 'index.html')}`);
}

// --- HTTP Server ---
const httpServer = http.createServer((req, res) => {
  let filePath;

  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(OUTPUT_DIR, 'index.html');
  } else if (req.url.startsWith('/icons/')) {
    // Serve local icon assets
    const iconName = path.basename(req.url.split('?')[0]);
    filePath = path.join(__dirname, 'icons', iconName);
  } else if (req.url.startsWith('/render')) {
    // Serve the standalone PNG render viewer with render trigger button
    const renderHtml = `<!DOCTYPE html>
<html><head><title>Render Viewer</title>
<style>
body,html{margin:0;height:100%;background:#1a1a1a;display:flex;flex-direction:column;font-family:sans-serif;color:#fff;}
.toolbar{background:#333;padding:8px 15px;display:flex;gap:10px;align-items:center;}
.toolbar button{background:#444;border:1px solid #555;color:#fff;padding:5px 10px;cursor:pointer;border-radius:3px;font-size:12px;}
.toolbar button:hover{background:#555;}
#render-btn{background:#1565C0;border:1px solid #0D47A1;font-weight:bold;padding:6px 16px;}
#render-btn:hover{background:#0D47A1;}
#render-btn:disabled{background:#666;cursor:wait;}
#status-msg{font-size:11px;color:#aaa;}
#viewport{flex:1;overflow:auto;display:flex;align-items:center;justify-content:center;padding:20px;}
#render{max-width:none;box-shadow:0 10px 40px rgba(0,0,0,0.4);transform-origin:center;transition:transform 0.1s;background:#fff;}
</style></head><body>
<div class="toolbar">
<button id="render-btn" onclick="doRender()">Render PNG (Inkscape 300 DPI)</button>
<span id="status-msg">Ready</span>
<span style="flex:1"></span>
<button onclick="z(0.1)">Zoom +</button><button onclick="z(-0.1)">Zoom -</button><button onclick="currentZoom=1;u()">Reset</button>
<span id="zl" style="color:#aaa;font-size:11px;">100%</span>
</div>
<div id="viewport"><img id="render" src="output.png" onerror="this.style.opacity=0" onload="this.style.opacity=1"/></div>
<script>
var currentZoom=1,img=document.getElementById('render'),zl=document.getElementById('zl');
var btn=document.getElementById('render-btn'),msg=document.getElementById('status-msg');
function z(d){currentZoom=Math.max(0.1,currentZoom+d);u();}
function u(){img.style.transform='scale('+currentZoom+')';zl.textContent=Math.round(currentZoom*100)+'%';}
document.getElementById('viewport').addEventListener('wheel',function(e){if(e.ctrlKey){e.preventDefault();z(e.deltaY>0?-0.1:0.1);}},{passive:false});
var ws=new WebSocket('ws://'+window.location.host+'/ws');
ws.onopen=function(){msg.textContent='Connected';};
ws.onclose=function(){msg.textContent='Disconnected';setTimeout(function(){ws=new WebSocket('ws://'+window.location.host+'/ws');},2000);};
ws.onmessage=function(e){
  var p=JSON.parse(e.data);
  if(p.action==='refresh_render'){img.src='output.png?t='+Date.now();btn.disabled=false;msg.textContent='Render complete!';}
  if(p.action==='status')msg.textContent=p.message||'Connected';
  if(p.action==='render_error'){btn.disabled=false;msg.textContent='Error: '+p.error;}
};
function doRender(){
  btn.disabled=true;
  msg.textContent='Rendering via Inkscape...';
  ws.send(JSON.stringify({type:'render',apply_shadows:false}));
}
</script></body></html>`;
    res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
    res.end(renderHtml);
    return;
  } else {
    // Serve static files from output dir (output.png, etc.)
    const safePath = path.basename(req.url.split('?')[0]);
    filePath = path.join(OUTPUT_DIR, safePath);
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
  };

  res.writeHead(200, {
    'Content-Type': mimeTypes[ext] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*',
  });
  fs.createReadStream(filePath).pipe(res);
});

// --- WebSocket Server (attached to HTTP server — single port) ---
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', (ws) => {
  wsClients.add(ws);
  console.log(`[drawio-tool] WebSocket client connected (total: ${wsClients.size})`);

  if (currentXmlState) {
    ws.send(JSON.stringify({ action: 'status', message: 'Connected - state loaded' }));
  }

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'state_update') {
        currentXmlState = msg.xml;
        console.log(`[drawio-tool] State updated from browser (${msg.xml.length} chars)`);
      }

      if (msg.type === 'editor_ready') {
        console.log('[drawio-tool] Draw.io editor ready');
        if (currentXmlState) {
          ws.send(JSON.stringify({ action: 'load', xml: currentXmlState }));
        }
      }

      // --- CLI tool commands (from claude-tool.js) ---
      if (msg.type === 'inject') {
        injectXml(msg.xml);
      }

      if (msg.type === 'load') {
        loadXml(msg.xml);
      }

      // Render request — full pipeline: XML → drawio CLI → SVG → Inkscape → PNG
      if (msg.type === 'render') {
        console.log('[drawio-tool] Render requested — running full pipeline');
        const drawioPath = path.join(OUTPUT_DIR, 'diagram.drawio');
        const svgPath = path.join(OUTPUT_DIR, 'diagram.svg');
        const pngPath = path.join(OUTPUT_DIR, 'output.png');

        if (!currentXmlState) {
          broadcast({ action: 'render_error', error: 'No diagram state — make an edit first' });
          return;
        }

        // Write current XML state as .drawio file
        fs.writeFileSync(drawioPath, currentXmlState);
        broadcast({ action: 'status', message: 'Converting to SVG...' });

        try {
          // Step 1: drawio CLI converts .drawio XML → SVG
          execSync(`xvfb-run --auto-servernum --server-args="-screen 0 1920x1080x24" drawio --no-sandbox --disable-gpu -x -f svg -o "${svgPath}" "${drawioPath}"`, { timeout: 300000 });
          console.log('[drawio-tool] SVG generated by drawio CLI');

          // Step 2: Inkscape renders SVG → high-DPI PNG
          broadcast({ action: 'status', message: 'Rendering with Inkscape...' });
          execSync(`inkscape "${svgPath}" --export-type=png --export-dpi=${RENDER_DPI} --export-filename="${pngPath}"`, { timeout: 60000 });
          console.log(`[drawio-tool] PNG rendered at ${RENDER_DPI} DPI`);

          broadcast({ action: 'refresh_render' });
        } catch (e) {
          console.error('[drawio-tool] Render pipeline failed:', e.message);
          broadcast({ action: 'render_error', error: e.message.substring(0, 200) });
        }
      }

      if (msg.type === 'get_state') {
        ws.send(JSON.stringify({ xml: currentXmlState || null }));
      }
    } catch (e) {
      console.error('[drawio-tool] Failed to parse WebSocket message:', e.message);
    }
  });

  ws.on('close', () => {
    wsClients.delete(ws);
    console.log(`[drawio-tool] WebSocket client disconnected (total: ${wsClients.size})`);
  });
});

// --- Broadcast to all connected browser clients ---
function broadcast(payload) {
  const msg = JSON.stringify(payload);
  for (const client of wsClients) {
    if (client.readyState === 1) {
      client.send(msg);
    }
  }
}

// --- API: Inject XML into Draw.io (merge action — non-destructive) ---
function injectXml(xmlPayload) {
  broadcast({ action: 'merge', xml: xmlPayload });
  console.log(`[drawio-tool] Injected XML merge (${xmlPayload.length} chars)`);
  return { success: true, action: 'merge', length: xmlPayload.length };
}

// --- API: Load full diagram state (replaces current diagram) ---
function loadXml(xmlPayload) {
  currentXmlState = xmlPayload;
  broadcast({ action: 'load', xml: xmlPayload });
  console.log(`[drawio-tool] Loaded full diagram (${xmlPayload.length} chars)`);
  return { success: true, action: 'load', length: xmlPayload.length };
}

// --- API: Render high-fidelity PNG via Inkscape + ImageMagick ---
function renderHighFidelityPng(fullXmlState, applyShadows = true) {
  const svgPath = path.join(OUTPUT_DIR, 'diagram.svg');
  const rawPngPath = path.join(OUTPUT_DIR, 'raw_output.png');
  const finalPngPath = path.join(OUTPUT_DIR, 'output.png');
  const drawioPath = path.join(OUTPUT_DIR, 'diagram.drawio');

  const xmlToRender = fullXmlState || currentXmlState;
  if (!xmlToRender) {
    return { success: false, error: 'No diagram state available. Load or inject XML first.' };
  }

  fs.writeFileSync(drawioPath, xmlToRender);

  try {
    // Step 1: Convert to SVG
    let svgGenerated = false;
    try {
      execSync(`drawio -x -f svg -o "${svgPath}" "${drawioPath}" 2>/dev/null`, { timeout: 30000 });
      svgGenerated = true;
    } catch {
      console.log('[drawio-tool] drawio CLI not available, trying direct xvfb approach');
    }

    if (!svgGenerated) {
      // Minimal SVG placeholder
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <rect width="800" height="600" fill="white"/>
  <text x="20" y="40" font-family="Inter, sans-serif" font-size="14" fill="#333">
    Install drawio CLI for full SVG rendering: snap install drawio
  </text>
</svg>`;
      fs.writeFileSync(svgPath, svgContent);
    }

    // Step 2: Render SVG to high-DPI PNG
    let pngGenerated = false;
    try {
      execSync(`inkscape "${svgPath}" --export-type=png --export-dpi=${RENDER_DPI} --export-filename="${rawPngPath}" 2>/dev/null`, { timeout: 60000 });
      pngGenerated = true;
    } catch {
      console.log('[drawio-tool] Inkscape not found, trying ImageMagick');
    }

    if (!pngGenerated) {
      try {
        execSync(`magick -density ${RENDER_DPI} "${svgPath}" "${rawPngPath}" 2>/dev/null`, { timeout: 30000 });
        pngGenerated = true;
      } catch {
        try {
          execSync(`convert -density ${RENDER_DPI} "${svgPath}" "${rawPngPath}" 2>/dev/null`, { timeout: 30000 });
          pngGenerated = true;
        } catch {
          return { success: false, error: 'No rendering tool available. Install inkscape or imagemagick.' };
        }
      }
    }

    // Step 3: Post-process with ImageMagick
    if (applyShadows && pngGenerated) {
      try {
        execSync(
          `magick "${rawPngPath}" -unsharp 0x1 \\( +clone -background black -shadow 20x3+0+4 \\) +swap -background none -layers merge +repage "${finalPngPath}" 2>/dev/null`,
          { timeout: 30000 }
        );
      } catch {
        fs.copyFileSync(rawPngPath, finalPngPath);
      }
    } else if (pngGenerated) {
      fs.copyFileSync(rawPngPath, finalPngPath);
    }

    broadcast({ action: 'refresh_render' });
    console.log(`[drawio-tool] High-fidelity PNG rendered at ${RENDER_DPI} DPI`);
    return { success: true, path: finalPngPath, dpi: RENDER_DPI };
  } catch (e) {
    console.error('[drawio-tool] Render failed:', e.message);
    return { success: false, error: e.message };
  }
}

// --- API: Get current diagram state ---
function getCurrentState() {
  return currentXmlState;
}

// --- Start servers ---
generateDashboardHtml();

httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`[drawio-tool] HTTP server listening on http://0.0.0.0:${HTTP_PORT}`);
  console.log(`[drawio-tool] WebSocket server listening on ws://0.0.0.0:${WS_PORT}/ws`);
  console.log(`[drawio-tool] Dashboard: http://localhost:${HTTP_PORT}`);
  console.log('');
  console.log('[drawio-tool] If running in a container, tunnel with chisel:');
  console.log(`  chisel client <container_ip>:<chisel_port> ${HTTP_PORT}:localhost:${HTTP_PORT} ${WS_PORT}:localhost:${WS_PORT}`);
  console.log('');
  console.log(`[drawio-tool] Then open http://localhost:${HTTP_PORT} in your browser`);
});

// --- Export for module usage (Claude Code tool integration) ---
module.exports = {
  injectXml,
  loadXml,
  renderHighFidelityPng,
  getCurrentState,
  broadcast,
  HTTP_PORT,
  WS_PORT,
};
