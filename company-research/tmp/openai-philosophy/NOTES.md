# OpenAI philosophy research: run notes (worker 04)

Retrieved 2026-10-24. Output: `../../research/04-openai-philosophy.md`.

## Method
- WebFetch and curl to openai.com returned HTTP 403 (bot challenge). Pages were read from the latest HTTP-200 Wayback capture at or before 2026-10-24, found with the CDX API (`scripts/wb.sh`). Text was extracted with `python3 -I scripts/totext.py`.
- Model Spec fetched directly: model-spec.openai.com redirected to 2026-08-18.html. The "newer version" banner in that HTML is `hidden` by default.
- CNBC was also blocked directly, so it was read from Wayback. The Reuters court story was read via Yahoo Finance in WebFetch; it was not used in the output.
- `raw/` holds untrusted downloaded HTML and `text/` holds the extracted text. Neither has been executed.

## Captures used (Wayback timestamp)
- about: https://web.archive.org/web/20261023002105id_/https://openai.com/about/
- ads: https://web.archive.org/web/20261007191312id_/https://openai.com/index/our-approach-to-advertising-and-expanding-access/
- adsnew: https://web.archive.org/web/20261012105648id_/https://openai.com/index/new-chatgpt-ads-format-and-measurement/
- broadaccess: https://web.archive.org/web/20261023113027id_/https://openai.com/index/broad-access-through-consistent-standards/
- buyit: https://web.archive.org/web/20261015094938id_/https://openai.com/index/buy-it-in-chatgpt/
- charter: https://web.archive.org/web/20261023002104id_/https://openai.com/charter/
- cnbc: https://web.archive.org/web/20261015032431id_/https://www.cnbc.com/2026/03/20/open-ai-agentic-shopping-etsy-shopify-walmart-amazon.html
- gpt6ui: https://web.archive.org/web/20261017065410id_/https://openai.com/index/gpt-6-for-everyone/
- halluc: https://web.archive.org/web/20261013203739id_/https://openai.com/index/why-language-models-hallucinate/
- memory: https://web.archive.org/web/20261013005040id_/https://openai.com/index/memory-and-new-controls-for-chatgpt/
- modelspec: direct fetch (not Wayback): https://model-spec.openai.com/2026-08-18.html (root redirected here on 2026-10-24)
- pinj: https://web.archive.org/web/20261005050253id_/https://openai.com/index/prompt-injections/
- safetyapproach: https://web.archive.org/web/20261003100014id_/https://openai.com/safety/how-we-think-about-safety-alignment/
- shopres: https://web.archive.org/web/20261015070706id_/https://openai.com/index/chatgpt-shopping-research/
- structure: https://web.archive.org/web/20261022190057id_/https://openai.com/index/built-to-benefit-everyone/
- syco1: https://web.archive.org/web/20261017060249id_/https://openai.com/index/sycophancy-in-gpt-4o/
- syco2: https://web.archive.org/web/20261010164037id_/https://openai.com/index/expanding-on-sycophancy/

## Failures
- Parallel Wayback requests were rate-limited (connection refused). Fetching one at a time worked.
- Wayback "latest" captures of syco1, syco2 and ads were captured 403 pages. Fixed by filtering the CDX API to status 200.
- The memory-controls page failed with an unsupported content encoding; not used.
- about/, broad-access-through-consistent-standards and sycophancy-in-gpt-4o were read but not cited, to save words. Of note: broad-access (Oct 21, 2026) says the updated Usage Policies take effect 2026-11-20, and model routers/gateways need OpenAI approval. Relevant to engineering worker 03 if the team routes models.

## Not in output, for parent recheck if useful
- Reuters (via Yahoo Finance), 2026-03-19: a Rome court cancelled the Garante's €15M ChatGPT privacy fine from December 2024. OpenAI welcomed the ruling; the Garante declined to comment. Grounds were not stated in the Reuters text. Law-firm summaries say jurisdiction (lead authority is the Irish DPC), but I did not open them. Do not cite the fine as standing.
- I did not research OpenAI's Singapore office or positioning.
