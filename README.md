# Synthetic security workflow datasets

Explore fictional SOC incident and vendor-assessment records for local workflow prototypes, ingestion checks, and data inspection.

| Package | Free preview | Commercial package | Guide |
| --- | --- | --- | --- |
| Phishing remediation reports | 10,000 records | 100,000 separate records / USD 100 | [Samples, schema and local example](https://haseebdev.github.io/synthetic-data-checkout/phishing-remediation-dataset.html) |
| Third-party vendor risks | 10,000 records | 100,000 separate records / USD 100 | [Samples, schema and local example](https://haseebdev.github.io/synthetic-data-checkout/vendor-risk-assessment-dataset.html) |

[Browse the catalog](https://haseebdev.github.io/synthetic-data-checkout/) · [Full Hugging Face portfolio](https://huggingface.co/HaseebDev)

Download a preview and `inspect_preview.py`, then run:

```sh
python inspect_preview.py --dataset phishing_remediation_reports --file demo.jsonl --csv demo-cases.csv
```

Python 3 standard library only. The example loads and checks fields and IDs, prints a summary, and optionally exports the same records to CSV. It makes no API calls and is not a model benchmark.

Free previews retain their existing non-commercial dataset licenses. Commercial purchases include the existing commercial terms and private Hugging Face repository access through the dataset-specific access page and Lemon Squeezy.

The two featured packages use six configured workflow families each. Rows are synthetic variants; volume and internal quality scores do not demonstrate model-training gains. Vendor-risk records contain High/Critical findings, not a balanced set of all risk levels. Older portfolio packages retain the counts stated on their dataset cards.

Support: Discord `xomohappy`. [Terms](https://haseebdev.github.io/synthetic-data-checkout/terms.html), [privacy](https://haseebdev.github.io/synthetic-data-checkout/privacy.html), [refunds](https://haseebdev.github.io/synthetic-data-checkout/refund.html).
