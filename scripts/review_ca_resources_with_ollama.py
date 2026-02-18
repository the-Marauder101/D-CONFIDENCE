#!/usr/bin/env python3
"""Review CA resources with local Ollama and stamp model_review fields.

This does not fetch the internet; it asks the local model to sanity-check whether each
entry *looks* like an official/formal source given domain + title + purpose + cross refs.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
RESOURCE_FILE = ROOT / "data" / "ca_india_resources_2026.json"
OLLAMA_URL = "http://localhost:11434/api/chat"
DEFAULT_MODEL = "llama3.1:8b"


def ask_ollama(model: str, prompt: str) -> dict:
    payload = json.dumps(
        {
            "model": model,
            "stream": False,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are validating source registry entries for India CA exam prep. "
                        "Respond ONLY as JSON with keys: verdict, confidence, notes. "
                        "verdict must be one of: approved, rejected, needs_human_review."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "options": {"temperature": 0},
        }
    ).encode("utf-8")

    req = Request(OLLAMA_URL, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    with urlopen(req, timeout=60) as resp:  # nosec - local Ollama endpoint
        data = json.loads(resp.read().decode("utf-8"))
    content = data.get("message", {}).get("content", "{}").strip()
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {"verdict": "needs_human_review", "confidence": "low", "notes": f"Non-JSON response: {content[:200]}"}


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default=DEFAULT_MODEL)
    args = parser.parse_args()

    registry = json.loads(RESOURCE_FILE.read_text(encoding="utf-8"))
    now = datetime.now(timezone.utc).isoformat()

    approved = 0
    for entry in registry["resources"]:
        prompt = (
            f"ID: {entry['id']}\n"
            f"Title: {entry['title']}\n"
            f"URL: {entry['url']}\n"
            f"Type: {entry['type']}\n"
            f"Purpose: {entry['purpose']}\n"
            f"Cross-verified-with: {entry.get('verification', {}).get('cross_verified_with', [])}\n"
            "Question: Is this likely an official/formal source suitable for CA prep registry policy?"
        )

        try:
            result = ask_ollama(args.model, prompt)
        except URLError as exc:
            print("Could not connect to Ollama at http://localhost:11434. Start Ollama, then rerun this script.")
            print(f"Details: {exc}")
            return 1
        verdict = result.get("verdict", "needs_human_review")
        notes = result.get("notes", "")

        entry.setdefault("model_review", {})
        entry["model_review"]["status"] = verdict
        entry["model_review"]["reviewed_at"] = now
        entry["model_review"]["model"] = args.model
        entry["model_review"]["notes"] = notes

        if verdict == "approved":
            approved += 1

    RESOURCE_FILE.write_text(json.dumps(registry, indent=2) + "\n", encoding="utf-8")
    print(f"Reviewed {len(registry['resources'])} resources with {args.model}; approved={approved}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
