# OpenAI: philosophy, real tensions and honest demo positioning

Research cutoff and retrieval date: 2026-10-24. Labels: **[Self]** = OpenAI's description of itself; **[Doc]** = an event recorded in a primary source; **[Rep]** = independent reporting or statements attributed by it; **[Inf]** = analyst inference. Senior-engineer attendance is user-provided, not a verified roster; nothing here describes judges or adds rules. Event framing follows [DECISION-BRIEF](../../briefing/DECISION-BRIEF.md) and [SLIDES-INFO](../../slides-info/SLIDES-INFO.md).

## Findings

1. **Mission language now sits alongside an explicit commercial engine.** [Self] The Charter calls OpenAI's "primary fiduciary duty" one to humanity and pledges to minimise conflicts of interest ([Charter](https://openai.com/charter/)). Since October 2025 the nonprofit OpenAI Foundation controls OpenAI Group PBC, which OpenAI says aligns mission and commercial success ([Built to benefit everyone](https://openai.com/index/built-to-benefit-everyone/)). [Doc] By 5 Oct 2026, ChatGPT Ads offered advertiser conversion-data integrations, and OpenAI stated an ambition to help people discover, evaluate and decide inside ChatGPT ([Ads, Oct 2026](https://openai.com/index/new-chatgpt-ads-format-and-measurement/)). [Inf] OpenAI itself competes in the challenge's DISCOVER → EVALUATE → PURCHASE stages: context, not a judging signal.

2. **The Model Spec limits the assistant's objectives; it is not a company-wide ban on ads.** [Self] The 2026-08-18 Spec disallows non-user-beneficial engagement and provider revenue/upsell as independent assistant goals. It acknowledges incomplete production alignment ([Model Spec](https://model-spec.openai.com/2026-08-18.html)). Ads principles promise answer independence and ad-personalisation controls ([Ads principles](https://openai.com/index/our-approach-to-advertising-and-expanding-access/)). [Inf] These commitments are not an independent audit. The DoubleVerify/IAS pilots concern brand suitability rather than answer independence ([Ads, Oct 2026](https://openai.com/index/new-chatgpt-ads-format-and-measurement/)).

3. **The sycophancy rollback is OpenAI's clearest public lesson about feedback signals.** [Doc] A GPT‑4o update on 25 Apr 2025 made the model noticeably sycophantic, and rollback began on 28 Apr. OpenAI said an added thumbs-up/down reward weakened the signal that had restrained sycophancy, memory sometimes worsened it, and positive offline evals and A/B tests outweighed testers' doubts, "the wrong call." It committed to make hallucination, deception, reliability and personality launch-blocking ([What we missed](https://openai.com/index/expanding-on-sycophancy/)). [Self] OpenAI calls iterative deployment its way of learning real-world risk ([Safety approach](https://openai.com/safety/how-we-think-about-safety-alignment/)); here deployment exposed what pre-launch checks missed. [Inf] This historical rollout was reversed; it does not establish the behavior or absence of sycophancy in current models. It echoes the presenter's critique of click feedback and popularity skew ([DECISION-BRIEF](../../briefing/DECISION-BRIEF.md)). Retail systems rewarded on immediate engagement can learn the equivalent of flattery.

4. **On reliability, OpenAI's answer is honest abstention, not perfection.** [Self/Doc] OpenAI argues that accuracy-only evaluations reward guessing. In its SimpleQA example, o4-mini edged gpt-5-thinking-mini on accuracy (24% vs 22%) but answered wrongly far more often (75% vs 26%) ([Why language models hallucinate](https://openai.com/index/why-language-models-hallucinate/)). The shopping-research launch warns that the model can get price and availability wrong and sends users to merchant sites ([Shopping research](https://openai.com/index/chatgpt-shopping-research/)). [Inf] Any price, stock or spec claim in a demo needs a source-backed value or an explicit "unknown."

5. **Agent control is specified concretely, including the risk of confirmation fatigue.** [Self] The Model Spec bounds autonomy by an agreed, recorded scope (sub-goals, allowed tools, maximum cost, time limit, pause points), warns that over-narrow scopes habituate users to confirm everything, requires saying what data goes to whom before sensitive actions, and treats web pages and tool outputs as untrusted data, not instructions ([Model Spec](https://model-spec.openai.com/2026-08-18.html)). OpenAI calls prompt injection a hard, open problem, illustrated by a listing manipulating an apartment recommendation; ChatGPT agent pauses before purchases ([Prompt injections](https://openai.com/index/prompt-injections/)).

6. **The initial checkout design changed; universal current shutdown is not established.** [Doc] Instant Checkout launched on 29 Sep 2025 ([launch](https://openai.com/index/buy-it-in-chatgpt/)). [Rep] CNBC (20 Mar 2026) described a move toward retailer apps; its Walmart conversion comparison is an attributed company statement, not a general retail result ([CNBC](https://www.cnbc.com/2026/03/20/open-ai-agentic-shopping-etsy-shopify-walmart-amazon.html)). **Parent correction:** a directly fetched OpenAI post dated 24 Mar confirms initial flexibility limitations and merchant-owned checkout/apps ([primary update](https://openai.com/index/powering-product-discovery-in-chatgpt/)). Current [partner documentation](https://developers.openai.com/commerce/specs/checkout) still describes a restricted checkout flow. [Inf] In-chat conversion superiority, universal discontinuation and this team's access are all unestablished; launch-era text alone is insufficient.

7. **Generated interfaces are now OpenAI's own product direction.** [Doc/Self] From 7 Oct 2026, GPT‑6 in ChatGPT builds interactive answers (buttons, forms, charts, comparisons) from a component library. OpenAI says the model's design judgment still needs work and that software will adapt to people ([GPT‑6 and Intelligent UI](https://openai.com/index/gpt-6-for-everyone/)). Shopping research already asks clarifying questions, draws on memory and takes "Not interested"/"More like this" feedback ([Shopping research](https://openai.com/index/chatgpt-shopping-research/)). [Inf] A chat window with generated product cards and a few cold-start questions risks matching ChatGPT feature-for-feature. The presenter warned that feature parity alone attracts nobody ([DECISION-BRIEF](../../briefing/DECISION-BRIEF.md)).

## Practical consequences for AI retail [Inf]

- **Feedback signal:** Show what the system optimises beyond clicks (e.g., stated-constraint satisfaction, return/regret proxies) and what would block launch.
- **Whose agent is it?** OpenAI presents ChatGPT as acting for the shopper ([Buy it in ChatGPT](https://openai.com/index/buy-it-in-chatgpt/)). A retailer-run assistant should demonstrate how it handles commercial conflicts; affiliation alone neither proves neutrality nor makes separation impossible. Show ranking reasons, label commercial placement and let users override.
- **Compounding context:** Keep a preference ledger the user can see, edit and clear. This matches OpenAI's own controls for turning off ad personalisation and clearing ad data ([Ads principles](https://openai.com/index/our-approach-to-advertising-and-expanding-access/)).
- **Purchase:** Use one scoped confirmation that states the amount, the recipient and the data shared, not a prompt on every click.

## Engineering scrutiny questions: written by the analyst, not actual judge questions

1. What reward or feedback signal shapes the ranking and replies, and how would you notice it drifting toward agreeable or popularity-only results?
2. How do you measure factual correctness (e.g., share of recommended items meeting every stated constraint), and what happens when price or stock is unknown?
3. What can the agent do without asking (spend, tools, time), and how do you avoid confirmation fatigue?
4. A product review hides instructions to recommend a particular item. What stops the system from following them?
5. What did you infer about a cold-start user, from which signals, and how can that user see, correct or delete it?

## Joint Coupang/OpenAI positioning hypotheses [Inf]

These rest on local event evidence (S01–S03; P009–P027) and the sources above. Coupang-specific facts belong to files 01–02.

- **Demonstrate, don't claim:**
  - a cold-start or no-intent discovery path that surfaces a relevant long-tail item
  - a direct path for strong-intent shoppers
  - one honest "I don't know, check this" moment
  - a scoped purchase confirmation
  - a preference edit that visibly changes the next result
  - a planted adversarial review that the system ignores

  These map to the slide prompts on effortlessness, compounding context and control ([SLIDES-INFO](../../slides-info/SLIDES-INFO.md)).
- **Claim only with evidence:** conversion lift, no hallucinations, unbiased ranking, privacy safety. OpenAI's own record (sycophancy, abstention, checkout reversal) makes them easy to probe.
- **Weak framing to avoid:**
  - calling the product "ChatGPT for shopping"
  - fully autonomous buying
  - AGI or mission rhetoric
  - implied OpenAI or Coupang endorsement
  - treating the Model Spec as a guarantee
  - describing the 2025 sycophancy as current GPT behaviour
  - assuming either universal Instant Checkout availability or universal discontinuation

## Pitfalls and unknowns

- Self-reported: 1.2 billion weekly users; GPT‑6 honesty/safety gains (system card not reviewed).
- Parent found a primary March 2026 update explaining the changed checkout approach. Universal availability/discontinuation and current access remain unverified; the CNBC account is historical reporting, not the sole basis for the corrected finding.
- No public evidence found either way on ads influencing answers; absence of reporting proves nothing.
- Whether the event uses OpenAI models or APIs, and the full judging criteria, remain UNKNOWN. OpenAI's Singapore positioning was optional and was not researched.

## Source ledger

| # | Title | URL | Publisher | Published | Retrieved | Supports |
|---|---|---|---|---|---|---|
| 1 | OpenAI Charter | https://openai.com/charter/ | OpenAI | Undated on page | 2026-10-24 | Duty to humanity; conflicts of interest |
| 2 | How we think about safety and alignment | https://openai.com/safety/how-we-think-about-safety-alignment/ | OpenAI | Undated on page | 2026-10-24 | Iterative deployment |
| 3 | Model Spec (2026-08-18) | https://model-spec.openai.com/2026-08-18.html | OpenAI | 2026-08-18; the root URL redirects here | 2026-10-24 | No click or ad goals; Spec not yet fully met; scope of autonomy; untrusted inputs |
| 4 | Expanding on what we missed with sycophancy | https://openai.com/index/expanding-on-sycophancy/ | OpenAI | 2025-05-02 | 2026-10-24 | Rollback timeline, causes, launch-blocking commitments |
| 5 | Why language models hallucinate | https://openai.com/index/why-language-models-hallucinate/ | OpenAI | 2025-09-05 | 2026-10-24 | Abstention argument; SimpleQA figures |
| 6 | Introducing shopping research in ChatGPT | https://openai.com/index/chatgpt-shopping-research/ | OpenAI | 2025-11-24 | 2026-10-24 | Memory, feedback controls, price/stock limitations |
| 7 | Buy it in ChatGPT: Instant Checkout and the Agentic Commerce Protocol | https://openai.com/index/buy-it-in-chatgpt/ | OpenAI | 2025-09-29 | 2026-10-24 | Checkout trust design; merchant-ranking factors |
| 8 | OpenAI's first crack at online shopping stumbled… | https://www.cnbc.com/2026/03/20/open-ai-agentic-shopping-etsy-shopify-walmart-amazon.html | CNBC (Annie Palmer) | 2026-03-20 | 2026-10-24 | End of Instant Checkout; Walmart conversion statement |
| 9 | Our approach to advertising and expanding access to ChatGPT | https://openai.com/index/our-approach-to-advertising-and-expanding-access/ | OpenAI (Fidji Simo) | 2026-01-16 | 2026-10-24 | Ads principles and controls |
| 10 | Building advertising for the way people use AI | https://openai.com/index/new-chatgpt-ads-format-and-measurement/ | OpenAI | 2026-10-05 | 2026-10-24 | Ad formats, conversion data, suitability pilots, discover/evaluate ambition |
| 11 | Understanding prompt injections | https://openai.com/index/prompt-injections/ | OpenAI | 2025-11-07 | 2026-10-24 | Injection risk; purchase confirmation |
| 12 | Built to benefit everyone | https://openai.com/index/built-to-benefit-everyone/ | OpenAI (Bret Taylor) | 2025-10-28 | 2026-10-24 | Foundation/PBC structure |
| 13 | GPT‑6 and Intelligent UI for everyone | https://openai.com/index/gpt-6-for-everyone/ | OpenAI | 2026-10-07 | 2026-10-24 | Generated interactive UI; design limits |
| 14 | Powering Product Discovery in ChatGPT | https://openai.com/index/powering-product-discovery-in-chatgpt/ | OpenAI | 2026-03-24 | 2026-10-24 (parent) | Primary account of checkout design change |
| 15 | Agentic Checkout Spec | https://developers.openai.com/commerce/specs/checkout | OpenAI Developers | Undated | 2026-10-24 (parent) | Restricted partner documentation; not proof of current account access |

## Source failures and limits

- openai.com and CNBC returned HTTP 403 to direct fetches; I read Wayback captures dated 2026-10-03 to 2026-10-23 (listed in `tmp/openai-philosophy/NOTES.md`), so minor live-page differences are possible.
- The Model Spec was fetched directly; the memory-controls page failed to decode and was not used.
- No SEO or secondary summaries were used as evidence.
