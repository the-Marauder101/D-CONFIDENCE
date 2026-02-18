# D-CONFIDENCE

A private, low-cost, chat-style support web app intended for reflective coaching and emotional support.

> This tool is **not a medical diagnosis system** and should not replace licensed mental-health care. It helps with structured reflection, emotional labeling, and action planning.

## Why this exists

This app is designed for someone who feels "behind" in life despite having fought through hard circumstances. It aims to:

- validate effort and resilience without empty reassurance,
- identify thinking patterns (self-criticism, comparison, all-or-nothing thinking),
- convert emotional overwhelm into small, concrete action steps.

## Cost strategy (near-zero API spend)

Use a **local model** through [Ollama](https://ollama.com/):

1. Install Ollama.
2. Pull a model (example):
   ```bash
   ollama pull llama3.1:8b
   ```
3. Start Ollama (usually runs at `http://localhost:11434`).

The app in this repo calls Ollama directly from the browser, so there are no per-token cloud API charges.

## Run the website

From this folder:

```bash
python3 -m http.server 8000
```

Open:

- `http://localhost:8000`

## Features

- Chat-style conversation UI.
- "Reflection mode" system prompt to avoid shallow, dismissive replies.
- Optional quick check-in fields (sleep, stress, confidence, focus).
- A visible safety note with immediate-help guidance.

## Important safety guidance

If there is any risk of self-harm or harm to others, seek immediate emergency support in your local area.

For better outcomes, combine this app with:

- one trusted human supporter,
- a weekly study plan,
- and (ideally) a qualified therapist/counselor for deeper trauma and confidence rebuilding.
