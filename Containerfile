# Containerfile — LME Docs (Docusaurus 3.x)
#
# Builds the static site and serves it with nginx.
# Pull and run: podman run -d -p 3000:80 ghcr.io/cisagov/lme-docs:develop
#
# @decision DEC-005
# @title Two-stage Containerfile: Node 20 build → nginx:alpine serve
# @status accepted
# @rationale Keeps the final image minimal (~25MB). BASE_URL build arg
#            allows serving at / for local preview or /lme-docs/ for
#            GitHub Pages.

# ── Stage 1: Build the static site ──────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG BASE_URL=/
ENV BASE_URL=$BASE_URL

RUN npm run build

# ── Stage 2: Serve with nginx ───────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
