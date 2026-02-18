#!/usr/bin/env python3
"""Local verifier for CA resource registry used by Dcon.

Checks:
1) Domain is in allowed list.
2) Resource has at least one cross-verification source.
3) Cross-verification source IDs exist.
"""

from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
RESOURCE_FILE = ROOT / "data" / "ca_india_resources_2026.json"


def normalize_domain(url: str) -> str:
    host = urlparse(url).netloc.lower()
    if host.startswith("www."):
        host = host[4:]
    return host


def main() -> int:
    data = json.loads(RESOURCE_FILE.read_text(encoding="utf-8"))
    allowed = set(data["policy"]["allowed_domains"])
    resources = data["resources"]
    by_id = {item["id"]: item for item in resources}

    errors: list[str] = []
    for item in resources:
        domain = normalize_domain(item["url"])
        if domain not in allowed:
            errors.append(f"{item['id']}: domain '{domain}' is not in allowed_domains")

        cross = item.get("verification", {}).get("cross_verified_with", [])
        if not cross:
            errors.append(f"{item['id']}: missing cross_verified_with")

        for linked_id in cross:
            if linked_id not in by_id:
                errors.append(
                    f"{item['id']}: cross_verified_with refers to unknown id '{linked_id}'"
                )

    if errors:
        print("FAILED verification checks:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(
        f"OK: {len(resources)} resources satisfy domain + cross-reference checks in {RESOURCE_FILE.relative_to(ROOT)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
