---
title: TonyAI Workshop
emoji: 🤖
colorFrom: gray
colorTo: indigo
sdk: docker
sdk_version: "1.0.0"
app_file: app.py
app_port: 7860
pinned: false
---

# TonyAI Workshop

A sophisticated AI system combining swarm intelligence, tactical awareness, and advanced memory systems.

## Features

- Multi-agent swarm system with primary and support agents
- Advanced spatial awareness using Three.js
- Tactical overlay system for situational awareness
- Self-evaluating trainer component
- Real-time voice synthesis
- Industrial warehouse aesthetic UI

## Development

```bash
npm install
npm run dev
```

## Docker

To build and run locally:

```bash
docker build -t tonyai-workshop .
docker run -p 7860:7860 tonyai-workshop
```

## Environment Variables

Required environment variables:
- DEEPGRAM_API_KEY
- LIVEKIT_API_KEY
- LIVEKIT_SECRET_KEY