# Draw.io AI Co-Pilot

Real-time co-editing tool that lets AI agents and humans collaborate on Draw.io diagrams simultaneously. AI injects mxGraphModel XML via WebSocket while you edit visually in the browser.

## Architecture

```
 Browser (You)                          Container (AI)
 ┌──────────────────┐                  ┌──────────────────────────┐
 │  /  (editor)     │                  │  server.js               │
 │  ┌──────────────┐│  WebSocket       │  ├─ HTTP + WS on :8081   │
 │  │  Draw.io     ││◄────────────────►│  │                       │
 │  │  iframe      ││  autosave sync   │  │  claude-tool.js (CLI) │
 │  └──────────────┘│                  │  ├─ state   (read XML)   │
 │                  │                  │  ├─ inject  (merge XML)  │
 │  /render         │                  │  ├─ load    (replace)    │
 │  ┌──────────────┐│                  │  └─ render  (pipeline)   │
 │  │  PNG Viewer  ││                  │                          │
 │  │  [Render btn]││  ──trigger──►    │  Render Pipeline:        │
 │  └──────────────┘│                  │  XML → drawio CLI → SVG  │
 └──────────────────┘                  │      → Inkscape 300 DPI  │
                                       │      → output.png        │
                                       └──────────────────────────┘
```

## Quick Start

### Container (recommended)

```bash
# Build
podman build -t drawio-copilot .

# Run
podman run -d --name drawio-copilot -p 8081:8081 drawio-copilot

# Open in browser
# Editor:  http://localhost:8081/
# Render:  http://localhost:8081/render
```

### Local

```bash
npm install

# Requires: inkscape, drawio CLI, xvfb
node server.js
```

## Browser Usage

- **`http://<host>:8081/`** — Full-screen Draw.io editor. Edits auto-sync to server via WebSocket.
- **`http://<host>:8081/render`** — Click "Render PNG" to run the full pipeline. Image auto-refreshes.

## AI Agent Usage (CLI)

```bash
# Read current diagram state
node claude-tool.js state

# Add elements (non-destructive merge)
node claude-tool.js inject '<mxGraphModel>...</mxGraphModel>'
node claude-tool.js inject-file path/to/snippet.xml

# Replace entire diagram
node claude-tool.js load '<mxGraphModel>...</mxGraphModel>'
node claude-tool.js load-file path/to/diagram.drawio

# Trigger render pipeline (XML → SVG → 300 DPI PNG)
node claude-tool.js render
```

## Render Pipeline

```
Current XML state (from autosave)
  → drawio CLI (via xvfb-run, headless)
  → SVG export
  → Inkscape --export-dpi=300
  → output.png served at /output.png
  → /render page auto-refreshes
```

## Local Icons

Place icon files in `./icons/` and reference them as `/icons/filename.png` in your XML styles. This ensures Inkscape can render them (external URLs often fail in headless environments).

Included icons: `windows.png`, `linux.png`, `slack.png`, `elastic.png`, `wazuh.png`

## Exposing to AI Sessions

### Shared podman network
```bash
podman network create drawio-net
podman run -d --name drawio-copilot --network drawio-net -p 8081:8081 drawio-copilot
podman run -it --network drawio-net ... claude-code
# Inside: node claude-tool.js state  (uses drawio-copilot:8081)
```

### Host networking
```bash
podman run -d --name drawio-copilot --network host drawio-copilot
# Everything on localhost:8081
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DRAWIO_HTTP_PORT` | `8081` | HTTP + WebSocket port |
| `DRAWIO_OUTPUT_DIR` | `./public` | Where index.html and output.png are written |
| `DRAWIO_RENDER_DPI` | `300` | Inkscape render resolution |

## XML Injection Rules

- Wrap payloads in `<mxGraphModel><root>...</root></mxGraphModel>`
- Always include root cells: `<mxCell id="0"/>` and `<mxCell id="1" parent="0"/>`
- Use unique string IDs prefixed with `ai_` to avoid collisions with user-drawn shapes
- Use `fontFamily=Inter`, `strokeWidth=2` for boundaries, `strokeWidth=1` for connectors
- Reference local icons as `/icons/filename.png` for reliable rendering
