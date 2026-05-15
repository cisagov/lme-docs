# Draw.io AI Co-Pilot
# Single-port server with full render pipeline:
#   Draw.io XML → drawio CLI → SVG → Inkscape 300 DPI → PNG
FROM node:22-slim

#TODO: fix this
# Install rendering pipeline: drawio CLI (Electron), xvfb (headless display), Inkscape (high-DPI raster)
# Download drawio .deb to the build context first:
#   wget -q https://github.com/jgraph/drawio-desktop/releases/download/v30.0.1/drawio-amd64-30.0.1.deb -O drawio.deb
COPY drawio.deb /tmp/drawio.deb

RUN apt-get update && apt-get install -y --no-install-recommends \
    inkscape xvfb xauth \
    libasound2 libgbm1 libnss3 libatk-bridge2.0-0 libgtk-3-0 \
    libdrm2 libxcomposite1 libxdamage1 libxrandr2 libxss1 \
    fonts-inter fonts-roboto \
    && (dpkg -i /tmp/drawio.deb || apt-get install -f -y) \
    && rm -f /tmp/drawio.deb \
    && rm -rf /var/lib/apt/lists/*

RUN DRAWIO_BIN=$(find / -name "drawio" -type f 2>/dev/null | grep -v node_modules | head -1) \
    && if [ -n "$DRAWIO_BIN" ]; then ln -sf "$DRAWIO_BIN" /usr/local/bin/drawio && echo "drawio linked: $DRAWIO_BIN"; \
    else echo "drawio not found as file, checking alternatives..." && (which drawio || which draw.io || ls /opt/drawio/drawio) && ln -sf $(which drawio || which draw.io || echo /opt/drawio/drawio) /usr/local/bin/drawio; fi \
    && ls -la /usr/local/bin/drawio

WORKDIR /app

# Copy package files and install deps
COPY package.json package-lock.json* ./
RUN npm ci --production 2>/dev/null || npm install --production

# Copy application files
COPY server.js claude-tool.js dashboard.html tools.json skill.md ./
COPY icons/ ./icons/

# Create output directory
RUN mkdir -p /app/public

# Single port serves HTTP + WebSocket
EXPOSE 8081

ENV DRAWIO_HTTP_PORT=8081

CMD ["node", "server.js"]
