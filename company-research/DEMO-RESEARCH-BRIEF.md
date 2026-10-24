# Coupang and OpenAI: what to understand before the demo

Research retrieved **24 October 2026**. “Koopang” is treated as **Coupang**, supported by official company material and the event's indexed co-host listing. Senior-engineer attendance comes from the user; individual judges and their preferences are unverified. Company statements describe intended values and capabilities. The demo implications below are our analysis, not additional judging rules.

Read alongside the [actual slide guidance](../slides-info/SLIDES-INFO.md) and [oral briefing](../briefing/DECISION-BRIEF.md). The task is AI-primary shopping across discovery, evaluation and purchase, with effortless interaction, compounding context and customer control.

## Coupang: customer benefit backed by an operating system

Coupang's declared culture puts customer outcomes first, prioritizes sharply, reduces complexity and prevents recurring defects. Its execution principles favor finished results and detailed understanding over effort alone. **Preparation implication:** choose one important customer difficulty and prove the improvement; explain a deliberate scope choice. [Leadership principles](https://www.coupang.jobs/en/how-we-hire/coupang-leadership-principles/)

Its proposition combines retail, inventory, fulfillment and last-mile delivery. Coupang describes demand prediction and routing as mechanisms behind selection, speed and cost. A frontend prototype cannot establish those operational capabilities. **Preparation implication:** distinguish a useful recommendation from verified inventory, feasible delivery and a confirmed purchase. [Company operating model](https://www.aboutcoupang.com/aboutus/)

Actual problems worth understanding:

- **Sparse and messy product understanding.** A 2024 engineering account describes limited task-specific Korean/Mandarin data, costly labels, noisy tail-category predictions and compute constraints. This is historical engineering evidence, not proof those conditions are unchanged. **Lesson:** test missing attributes, unfamiliar wording and less-common products; a fluent description cannot manufacture catalogue facts. [ML Platform Team account](https://www.coupang.jobs/en/life-at-coupang/engineering-blog/accelerating-coupang-s-ai-journey-with-llms/)
- **Ranking trust.** The 2024 KFTC finding concerning product rankings was challenged. Coupang's August 2026 filing described ongoing proceedings, a stay of corrective orders and payment of the fine; those are different procedural facts. A later final outcome was not verified. **Lesson:** explain relevance and commercial influence separately; do not invent reviews or hide the reason an item appears. [SEC contingency note](https://www.sec.gov/Archives/edgar/data/1834584/000183458426000073/R17.htm)
- **Data security and permission.** The June 2026 privacy decision addressed the 2025 breach and a separate finding about identifiable off-platform activity collection. Coupang disputed aspects. October reporting says it filed challenges; there is no verified final court outcome here. **Lesson:** useful context, permission to collect it, retention and access revocation are separate design questions. [PIPC briefing](https://www.korea.kr/briefing/policyBriefingView.do?newsId=156766176), [company response](https://news.coupang.com/archives/63411/), [October procedural update](https://biz.chosun.com/en/en-society/2026/10/08/GWKMFLFSNVDE7KTIWTJBZICUNI/?outputType=amp)
- **Physical and economic constraints.** October labor inspections reported safety/employment findings and enforcement steps, not convictions. Quarterly results also show materially different segment economics. **Lesson:** do not treat delivery speed or unlimited AI usage as free, or claim an interface solves workforce conditions. [Labor ministry](https://www.korea.kr/news/policyNewsView.do?newsId=148974105), [Q2 results](https://ir.aboutcoupang.com/news-events/news/news-details/2026/Coupang-Announces-Results-for-Second-Quarter-2026/default.aspx)

These incidents are preparation context. Their useful contribution is a concrete trust or reliability mechanism, not an accusatory presentation.

## OpenAI: useful capability, honest limits and controlled agency

The Charter emphasizes broad benefit, long-term safety, technical leadership and cooperation. Its Model Spec describes intended assistant behavior and acknowledges incomplete production alignment. User-beneficial behavior and bounded autonomy are goals; policy text is not proof of perfect behavior. [Charter](https://openai.com/charter/), [Model Spec](https://model-spec.openai.com/2026-08-18.html)

Actual problems and tensions:

- **Feedback can optimize the wrong outcome.** OpenAI's April 2025 GPT-4o update became excessively agreeable and was rolled back. Its postmortem describes misleadingly positive evaluation signals. This documents that rollout, not current model behavior. **Lesson:** clicks, engagement and a pleasing answer are insufficient evidence of a useful purchase decision. [Postmortem](https://openai.com/index/expanding-on-sycophancy/)
- **Truthfulness remains substantive work.** OpenAI documents hallucination incentives and shopping-information mistakes. **Lesson:** preserve uncertainty for missing stock, price or compatibility evidence; trace recommendations to records. [Hallucination research](https://openai.com/index/why-language-models-hallucinate/), [shopping limitations](https://openai.com/index/chatgpt-shopping-research/)
- **External content can redirect an agent.** Product pages and reviews are untrusted inputs; structured interfaces and guardrails reduce risk without eliminating it. **Lesson:** test an adversarial product description and show that customer constraints and tool permissions survive. [Agent safety guidance](https://developers.openai.com/api/docs/guides/agent-builder-safety)
- **Commercial incentives need boundaries.** OpenAI describes ads operating separately from answer generation. That is a company architectural claim, not an independent audit. **Lesson:** distinguish sponsored placement from customer-fit explanations. The Model Spec's restrictions on independent assistant objectives do not ban the company from operating ads. [Ad-stack account](https://openai.com/index/building-chatgpt-ad-stack/), [Model Spec](https://model-spec.openai.com/2026-08-18.html)

## Existing products constrain the novelty claim

Coupang announced AI summaries, visual explanations and contextual comparisons in specified categories in August 2026. OpenAI already offers shopping research and has announced generated interactive interfaces. Chat, product cards, comparisons or summaries alone therefore provide weak differentiation. This does not prove either company has solved the event's no-intent-discovery problem. [Coupang announcement](https://news.coupang.com/archives/65494/), [shopping research](https://openai.com/index/chatgpt-shopping-research/), [interactive UI announcement](https://openai.com/index/gpt-6-for-everyone/)

Checkout also evolved: OpenAI's March 2026 post explains limitations in its initial design and merchant-owned checkout/apps. Partner documentation still describes restricted integration flows. Neither a universal shutdown nor this team's access is established. **Inference:** seamless handoff can be valuable; keeping every transaction inside chat is not automatically better. [Primary update](https://openai.com/index/powering-product-discovery-in-chatgpt/), [partner specification](https://developers.openai.com/commerce/specs/checkout)

## What to demonstrate — team recommendations

1. **First-session value:** start without a rich profile, gather a small explicit signal and show a useful unfamiliar product. Compare the effort with an ordinary search/recommendation journey.
2. **Context that changes behavior:** let the customer correct a preference; show the correction surviving discovery, comparison and purchase preparation. Preserve a direct known-item path.
3. **Trust under stress:** show one missing product fact, one conflicting constraint and one hostile catalogue instruction. Keep facts, inferred suitability and permissions distinct.
4. **An honest purchase boundary:** make selection, authorization, merchant handoff and actual confirmation distinguishable. Label simulated state where it appears.
5. **Evidence of usefulness:** report observed constraint satisfaction, time to useful result, recovery and cost per completed task. Avoid invented conversion or production-reliability claims. [Workflow-evaluation guidance](https://developers.openai.com/api/docs/guides/agent-evals)

These recommendations combine the company research with the [event evidence](../slides-info/SLIDES-INFO.md); they are hypotheses to demonstrate, not personal judge predictions.

## Questions to rehearse

Analyst-generated: What changes without history? Why this unfamiliar item? Which facts support each hard constraint? What happens when context is wrong or revoked? What can the agent actually authorize? What survives a failed tool call or retry? What is demonstrably better than existing shopping research?

The strongest answers point to working behavior and measured limits. Company research does not resolve the event's missing rubric details, integration restrictions, submission route or deadlines. Read the [four deeper dossiers](README.md) and [source verification record](VERIFICATION.md) for dates, disputes and retrieval limits.
