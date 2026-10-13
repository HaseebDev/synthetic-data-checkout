"""Inspect a downloaded synthetic workflow dataset without accounts or paid APIs.

Example: python inspect_preview.py --dataset phishing_remediation_reports --file demo.jsonl
Data use remains governed by the matching dataset card's license.
"""
import argparse
import csv
import json
from collections import Counter
from pathlib import Path

SCHEMAS = {
    "phishing_remediation_reports": (
        ["ticket_id", "employee_name", "sender_address", "subject_line", "containment_action", "incident_notes"],
        "subject_line",
    ),
    "third_party_vendor_risks": (
        ["ticket_id", "vendor_name", "assessment_type", "findings_risk_score", "remediation_plan"],
        "findings_risk_score",
    ),
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset", choices=SCHEMAS, required=True)
    parser.add_argument("--file", type=Path, required=True)
    parser.add_argument("--csv", type=Path, help="Optional CSV export of the same records")
    args = parser.parse_args()
    if args.csv and args.csv.resolve() == args.file.resolve():
        parser.error("CSV output must be different from the input file")
    if args.csv and args.csv.exists():
        parser.error("CSV output already exists; choose a new path")
    fields, group_field = SCHEMAS[args.dataset]
    records = []
    ids = set()
    groups = Counter()
    with args.file.open(encoding="utf-8-sig") as source:
        for number, line in enumerate(source, 1):
            if not line.strip():
                continue
            row = json.loads(line)
            if not isinstance(row, dict) or any(not isinstance(row.get(f), str) or not row[f].strip() for f in fields):
                raise ValueError(f"Line {number}: expected non-empty strings for {fields}")
            if row["ticket_id"] in ids:
                raise ValueError(f"Line {number}: duplicate ticket_id")
            ids.add(row["ticket_id"])
            groups[row[group_field]] += 1
            records.append(row)
    if not records:
        raise ValueError("The input has no records")
    if args.csv:
        with args.csv.open("x", encoding="utf-8", newline="") as target:
            writer = csv.DictWriter(target, fields, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(records)
    print(json.dumps({"dataset": args.dataset, "records": len(records), "fields": fields,
                      "group_counts": dict(sorted(groups.items())), "first_record": records[0],
                      "limits": "Format and ID checks only. No model-performance or real-world validity evaluation."}, indent=2))


if __name__ == "__main__":
    main()
