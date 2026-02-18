# Dcon

Dcon is a private, low-cost, chat-style web assistant for:

1. emotional reflection and confidence rebuilding, and
2. India CA exam preparation support.

> Dcon is **not** a medical diagnosis system and does not replace licensed mental-health professionals.

## Llama vs Kimi 2.5 (recommended default)

For this project goal (private + low cost + local control), **Llama via Ollama** is the better default.

- **Default chosen**: `llama3.1:8b`
- Why: local inference, no per-token cloud billing, private data stays on your machine, simple setup.
- Kimi 2.5 can be strong, but usually requires external hosted API usage and account/billing dependency.

## Does this website have a public link right now?

No. By default it runs locally on your machine.

To view now:

```bash
python3 -m http.server 8000
```

Open:

- `http://localhost:8000`

If you want public access later, you can deploy static files (e.g., GitHub Pages) **but** chat will not work there unless you also deploy a secure backend that can reach a model endpoint.

## CA Knowledge Base (2026 curated registry)

Dcon now includes a local CA resource registry in:

- `data/ca_india_resources_2026.json`

It contains official and formal references (ICAI portals + government legal sources + open course sources) with a local double-verification policy:

1. domain allowlist validation, and
2. cross-verification reference to another official source.

### Validate knowledge-base integrity

```bash
python3 scripts/verify_ca_resources.py
```

This validates structural authenticity rules for every resource entry.

## Run with local model (no cloud token spend)

1. Install Ollama.
2. Pull model:
   ```bash
   ollama pull llama3.1:8b
   ```
3. Run Ollama (default on `http://localhost:11434`).
4. Start Dcon static site:
   ```bash
   python3 -m http.server 8000
   ```
5. Open `http://localhost:8000`.

## Dcon behavior controls

Dcon is configured to:

- avoid dismissive emotional responses,
- avoid inventing ICAI procedures/dates,
- prioritize local verified CA references,
- show uncertainty if evidence is insufficient,
- produce actionable timetables and quick revision outputs.

## Safety guidance

If there is any risk of self-harm or harm to others, seek immediate emergency support in your local area and contact a trusted person immediately.
