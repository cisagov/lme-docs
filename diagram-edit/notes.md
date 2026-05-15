● Here's the complete setup. Run these on your host:

  Step 1 — Build and run the drawio-copilot container:
  podman build -t drawio-copilot
  ~/claude-container-home/drawio-editor-tool/.worktrees/drawio-tool/

  podman network create drawio-net

  podman run -d --name drawio-copilot \
    --network drawio-net \
    -p 8081:8081 \
    drawio-copilot

  Step 2 — Open in your browser:
  http://localhost:8081/        (editor)
  http://localhost:8081/render  (PNG viewer + render button)

  Step 3 — Start Claude on the same network:
  podman run -it --rm \
    --network drawio-net \
    -v ~/claude-container-home/:/root/ \
    --env CLAUDE_CODE_OAUTH_TOKEN="$CLAUDE_CODE_OAUTH_TOKEN" \
    --entrypoint bash \
    claude-code

  Step 4 — Inside Claude, I use the tool like this:
  # Set the hostname to the drawio container
  export DRAWIO_HOST=drawio-copilot

  # Read diagram
  node ~/drawio-editor-tool/.worktrees/drawio-tool/claude-tool.js state

  # Inject elements
  node ~/drawio-editor-tool/.worktrees/drawio-tool/claude-tool.js inject '<mxGraphModel>...'

  # Load full diagram
  node ~/drawio-editor-tool/.worktrees/drawio-tool/claude-tool.js load-file
  ~/drawio-editor-tool/.worktrees/drawio-tool/examples/lme-architecture.drawio

  # Trigger render
  node ~/drawio-editor-tool/.worktrees/drawio-tool/claude-tool.js render

  The key is DRAWIO_HOST=drawio-copilot — podman's DNS resolves the container name on the
  shared network. Your browser hits localhost:8081 via the -p port mapping, and I hit
  drawio-copilot:8081 via the shared network.

