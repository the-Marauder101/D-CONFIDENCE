# Dcon

Dcon is a private, low-cost, local web assistant for:

1. emotional reflection and confidence rebuilding, and
2. India CA exam preparation support.

> Dcon is not a medical diagnosis system and does not replace licensed mental-health professionals.

## Direct answers to your questions

### 1) Llama or Kimi 2.5?
Default remains **Llama via Ollama** (`llama3.1:8b`) for local/private use and zero cloud token billing by default.

### 2) How do I view the website now? Public link?
Currently this project runs locally; no public link is created by default.

Run:

```bash
python3 -m http.server 8000
```

Open:

- `http://localhost:8000`

### 3) Why did you see "could not connect to Ollama"?
Because the website frontend works independently, but chat responses require a running local Ollama server at `http://localhost:11434`.

So previous UI/testing steps were valid for website rendering, but **LLM chat requires Ollama running**.

## CA Final resources (local registry)

File:

- `data/ca_india_resources_2026.json`

Now includes explicit CA Final-focused entries (study material host, RTP, MTP, PYQ/suggested answers, exam notifications, application workflows) and formal sources.

## Model-review workflow (your "Llama must read first" requirement)

Dcon now supports a two-step pipeline:

1. Structural verification:
   ```bash
   python3 scripts/verify_ca_resources.py
   ```
2. Llama review + approval stamping:
   ```bash
   python3 scripts/review_ca_resources_with_ollama.py --model llama3.1:8b
   ```

Only entries marked `model_review.status = approved` are used by Dcon chat context.

## Full local setup

1. Install Ollama.
2. Pull model:
   ```bash
   ollama pull llama3.1:8b
   ```
3. Start Ollama (keeps API on `http://localhost:11434`).
4. Review and approve references:
   ```bash
   python3 scripts/review_ca_resources_with_ollama.py --model llama3.1:8b
   ```
5. Start Dcon site:
   ```bash
   python3 -m http.server 8000
   ```
6. Open `http://localhost:8000`.

## Safety guidance

If there is any risk of self-harm or harm to others, seek immediate emergency support and contact a trusted person immediately.
