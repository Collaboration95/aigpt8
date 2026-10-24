# Pass 1 / 04 — Speaker and ambiguity audit (P001–P027)

First-pass, deliberately inclusive. Not final filtering. Source: `transcript-original.txt` / `transcript-indexed.md` (text verified identical after whitespace normalisation; P-IDs only added). Original line numbers below refer to `transcript-original.txt`. No web, cloud or repo-wide work was done; the only files touched are this file (`tmp/sonnet/` was not needed and is empty).

Agent setting: Sonnet 5.5, supported high-effort reasoning. No fast mode was enabled or claimed.

**Authority:** the official written brief governs. Everything here is an interpretation of a noisy transcript. Anything not literally in the transcript is marked UNKNOWN.

## 0. Legend

Classification of each claim:

| Code | Meaning |
|---|---|
| **E** | Explicit statement in the transcript (fact, logistics, stated criterion, stated permission) |
| **PP** | Presenter preference / belief / hope ("would be great", "I'm looking for", "should") — not a formal rule |
| **OX** | Optional example or illustration ("let me throw a random idea", "say Netflix") |
| **AQ** | Audience question (the asker's own words, not an organizer position) |
| **UF** | Unclear / garbled fragment; meaning not safe to rely on |
| **NAR** | Slide narrative / background framing |
| **INF** | Analyst inference (mine) — not in the source |

Confidence: **H** = wording and attribution both solid; **M** = wording solid, attribution or scope uncertain; **L** = guess.

Speaker labels are **inferred roles**, not identities: **PRES** = main presenter; **AUD** = audience asker(s) (count unknown); **ORG2** = a second organizer/speaker; **?** = cannot tell.

---

## 1. Coverage, inferred role map and speaker turns

All 27 paragraphs audited. Transcription has no speaker labels, no timestamps and no marked boundaries; the only boundary cues are line breaks (new paragraph = often a new turn), "Any questions?" / "Go ahead" hand-offs, answer-shaped vs question-shaped text, and first-person company language.

### 1.1 Role map (inferred)

| Role | Evidence | Confidence |
|---|---|---|
| **PRES** — main presenter, speaks for a retail company with a CX function | Walks through slides (P001–P005); "my last slide" (P005); "Our goal at coupon right now" (P005); "At Coupon, we talk about…" (P020); invites/answers questions ("Does that answer your question?" P008; "Go ahead" P013); gives the rubric (P020) and strong-intent steer (P027). Company language in P005 and P020 matches, so likely the same speaker. | H that P001–P006, P008, P011, P016, P020 are one presenter; M for the rest |
| **AUD** — audience askers | Question-shaped, first-person-builder text: P009 (several), P010, P012 (partial), P014, P017, plus truncated P025. Number of distinct people is UNKNOWN. | H that they are questions; L on count |
| **ORG2** — a second organizer / event-side speaker | P022–P024 shift topic from the challenge to event logistics ("in your inbox", "our APIs", "team numbers… your seats"); P022 refers to "what Alex said" in third person, so the speaker is not Alex. | M |
| **Alex** (named in P022) | P022 says "what Alex said… be creative and explore multimodality". PRES says "creativity, thinking outside the box" (P019) and floats chat/voice/video modalities (P009, P014). So Alex is plausibly PRES. | M-L (name may be mis-transcribed; identity not verified) |
| **Tyler** (named in P021) | "Sorry, Tyler has something" — someone wants to speak. If Tyler is the P022 speaker, then P021 → P022 is a hand-off. | L-M (two-step inference; nothing says Tyler spoke) |
| **Alice** (named in P024) | Put team numbers on seats; a staff/organizer helper. Not a speaker here. | M |

Inference chain worth stating plainly: "PRES = Alex, ORG2 = Tyler" is a coherent reading (P019 creativity → P021 hand-off → P022 echo), but each link is inference. Do not record as fact.

### 1.2 Paragraph-by-paragraph speaker map

| P | Orig line | Inferred speaker turn(s) | Boundary confidence / notes |
|---|---|---|---|
| P001 | 1 | PRES. Starts mid-sentence ("here, what we're looking for…") so the start of the session is missing. | H speaker; antecedent of "something we're working towards on the CX side" is lost |
| P002 | 3 | PRES (slide: pre-internet shopping, store level) | H |
| P003 | 5 | PRES (slide: mall → e-commerce) | H |
| P004 | 7 | PRES (slide: unbounded discovery → "AI at the core") | H |
| P005 | 9 | PRES: "last slide", market-gap ask, company goal | H |
| P006 | 11 | PRES: closes slides, opens Q&A | H |
| P007 | 13 | **Probably PRES answering a question that is not in the transcript** (P008 ends "Does that answer your question?"). | M. The audience question that triggered P007–P008 is missing. Alternative (L): P007 is the asker's framing. |
| P008 | 15 | PRES (answer; closes with "Does that answer your question?") | H |
| P009 | 17–19 | **Mixed, at least 4 turns** — see §1.3 | M; internal boundaries are inference |
| P010 | 21 | AUD question | H |
| P011 | 23 | PRES answer to P010 (indirect) | M-H |
| P012 | 25 | PRES hand-off, then AUD question (cut off), then PRES answer | M — see §1.3 |
| P013 | 27 | PRES (continuation of answer), "Go ahead", then **unclear speaker** for the "link products / redirect to checkout" passage, then "Go ahead" | M for first sentence; L for the middle passage — see §1.3 |
| P014 | 29–31 | AUD question (apps as shopping interface; OpenAI marketplace) then PRES numbered answer | H boundary at "1." (the numbering is the transcriber's); attribution of each item M |
| P015 | 33 | PRES probably (continuation of P014 point 2, or answer to an unrecorded question) | L-M; "they" is unresolved |
| P016 | 35 | PRES ("Do note…", "Any other questions?") | H |
| P017 | 37 | AUD question | H |
| P018 | 39 | PRES answer to P017 | H |
| P019 | 41 | Probably AUD ack ("Okay, makes sense, correct?") then PRES ("I am looking for that creativity…") | M; break at the question mark |
| P020 | 43–49 | PRES: rubric read-out. The text breaks mid-sentence at "How great is" / "Minute of the key points" (lines 48–49) so a chunk is lost or garbled. | M-H speaker; text integrity broken |
| P021 | 51 | Mixed: PRES invites questions and gives a chatbot-safety scenario; "Sorry, what?" (second voice or PRES hearing an inaudible question); PRES "Do note…"; PRES yields to "Tyler" | M-L; see §1.3 |
| P022 | 53 | ORG2 (see §1.1) | M |
| P023 | 55 | ORG2 | M |
| P024 | 57 | ORG2 ("One last thing") | M |
| P025 | 59 | PRES invites Qs; AUD question truncated at "how do we get"; PRES "very critical question. Next: intent." | M-L; the question text is lost |
| P026 | 61 | PRES (defining intent via example) | H |
| P027 | 63 | PRES, with an inaudible audience question inside ("any other questions? That's what you're saying.") | M — see §1.3 |

### 1.3 Probable transitions inside paragraphs

| Where | Transition (my reading) | Cue | Conf. |
|---|---|---|---|
| P009 | **AUD**: "Two questions: 1. What do we assume… right?" → **PRES** (probably) "Correct." | one-word answer after a "right?" question | L-M — the only answer cue for Q1; the question itself is garbled (G03) |
| P009 | **AUD** Q2 (TikTok Shop algorithm; "Is that somewhere what you're looking at, or is it different from what they want?") | question mark ends it | M |
| P009 | **PRES**: "Or we could even put it this way: one of the big challenges with TikTok is, how do you do cold start?" through "…yet to find the right application for today" | reframing + "Let me just throw a random idea" is presenter-style | M. The break may be at "Or we could even put it this way", but it could be the asker's own continuation (L) |
| P009 | PRES: "I think we're all navigating what this AI could do… Any questions?" → **AUD** Q3: "Customer user experience or business model: are we allowed to develop overfullicency…" | "Any questions?" hand-off | M-H |
| P009 | **PRES** restates: "Your question is: can we make the assumption that they spend thousands of hours on the platform?" → answer on chicken-and-egg/cold start → differentiation → "Any other questions?" | "Your question is…" | H boundary; but the restatement does not match Q3 (see QA04) |
| P012 | PRES "Any other questions? Oh wow… that would be exceptional." → **AUD** "If you do three different…" (cut off) → PRES "Oh, so it's asking there. I gave three examples… Do we have to solve that in a unified way?" (restating the question) → PRES answer "That would be great, right?…" | "Oh, so it's asking there" | M |
| P013 | PRES finishes answer ("one funnel") → "Go ahead." → **passage of unclear speaker** "I would love to see… end-to-end funnel done." → "Go ahead." | two "Go ahead" invitations | L for who speaks the middle passage; see QA07 |
| P014 | AUD ("Where you add what you're eating… Do you think OpenAI could have a version of that…?") → PRES "1. If I knew the future, I might not be here." "2. I think the chat interface…" | numbered list; "If I knew the future" is a presenter-style deflection | M. The two numbers may not map one-to-one to the two questions |
| P019 | AUD/PRES "Okay, makes sense, correct?" → PRES "I am looking for that creativity…" | question mark | M |
| P020 | PRES rubric → **break at "How great is"** → "Minute of the key points that you would get across: responsibility and AI safety. I could ask any questions…" | line 48/49 break | M; the second part may belong to a different list item or speaker |
| P021 | PRES "Any questions, guys? I could ask any questions if you make it a chatbot, let's say. What if it answers something incorrectly? You have to think about the harness and safety aspect." → ("Sorry, what?" — second voice or PRES asking for a repeat) → PRES "Do note: it is a problem we solve right now." → PRES "Sorry, Tyler has something, but I also think safety is very important, by the way." | "Sorry, what?" / "Sorry, Tyler" | M-L |
| P025 | PRES "Any other questions? Great questions. Oh wow, keep going." → AUD "how do we get" (cut) → PRES "That was a very critical question. Next: intent." | cut-off sentence | L-M |
| P027 | PRES (weak/no-intent) → "any other questions?" → [audience question, **not transcribed**] → PRES "That's what you're saying. The real question is…" | "That's what you're saying" is a restatement cue | M |

### 1.4 Ordering caveat (important)

The transcript order may not be chronological.

- P005 says "it's my last slide" and P006 closes, and P024 says "One last thing", yet Q&A and new content continue afterwards (P007…, P025–P027).
- P008 ("all three pillars") and P012 ("I gave three examples… Strong, weak, and no intent") refer to the three intents as already presented, but the only definitions of strong/weak/no intent are at P026–P027, the **end** of the file. P005 also mentions "no intent" before any definition.
- P025 "Next: intent." reads like a slide/topic transition.

So either (a) P025–P027 are later chunks that were appended or a recap, or (b) they were recorded earlier and the chunks are mis-ordered. Cannot be resolved from the text. Consequence: do not infer "who answered what" purely from file order across P024 → P025.

---

## 2. Q&A ledger (all material question–answer pairs, including unanswered)

"Answer" is only what the transcript shows. Nothing is inferred about unheard answers.

| ID | Q source | Question (paraphrase; asker = AUD unless noted) | Answer in transcript (PRES unless noted) | Status / what cannot be concluded |
|---|---|---|---|---|
| QA00 | P006 | PRES: "Any questions?" | — | Opens Q&A |
| QA01 | *(missing)*, answer P007–P008 | Unknown. Answer discusses recommendation limits. | Recommendation is limited to your catalogue and click/consumption feedback (P007); skew to best-sellers over the long tail; "recommendation" is vague; "It would be great if you create this one experience that covers all three pillars." (P008) | Question absent. Cannot say what was asked. |
| QA02 | P009 (Q1) | What do we assume/expect as a product? New consumer experience "but it should not be integrated live into a capture. Everything has to be downloaded, right?" | "Correct." (single word; speaker probably PRES) | **Garbled (G03).** The confirmed proposition is unclear — which system must not be live-integrated, what "downloaded" means (data? catalogue? the app?). Not safe to state as a rule. Ambiguity: PRES says in P018 that integrating one's own Instagram/Gmail is fine, so "downloaded" cannot simply mean "no external connections". |
| QA03 | P009 (Q2) | TikTok Shop has a good non-curated, algorithm-driven feed; is that what you're looking at, or something different? | Reframes to the cold-start challenge ("You don't know anything about me… If you can solve that challenge, then you are able to help with the discovery from the start"). Then an OX: a game / one question ("what are you looking for? Shoes") / video feed / "chat, voice, who knows" / "a really big capability that we have yet to find the right application for". | Does not say whether TikTok-style is what they want or not. The cold-start framing is the answer's substance. Ideas are examples. |
| QA04 | P009 (Q3) | "Customer user experience or business model: are we allowed to develop **overfullicency**, offering the **scouts** after they spend enough time or browse enough products…? Or must it stay true to not offering more monetized means, but more exploration of product categories?" | PRES: "Your question is: can we make the assumption that they spend thousands of hours on the platform? That could be a way, but… an egg in the chicken pot. Your platform is only good if you have enough feedback…" then cold start / differentiation / unique value. | **The restatement does not match the question as transcribed** (time-on-platform assumption vs monetised features). Either a separate question was lost, PRES misparaphrased, or the transcript is damaged. **Whether monetised features (offers, rewards, etc.) are allowed or forbidden is NOT answered.** Do not infer either. |
| QA05 | P010 | Does a service need existing accounts/recommendations ("Type 1 accounts"); if I start a new account, do you want a service that can bridge it? "Can an AI service bridge multiple accounts?" | P011 (indirect): "both avenues… a warm customer who's been there, and a cool start: how would you recreate the experience?"; Netflix example; "if AI has the right context, I think there is value to deliver". | Cross-account bridging is **not** answered. P011 answers the warm-vs-cold framing instead. |
| QA06 | P012 | "If you do three different…" → restated: "Do we have to solve that [strong, weak, no intent] in a unified way?" | "That would be great, right? If you can, you can take three separate approaches, but that means you dump… the workload on the customer to navigate three different products." Then P013: "If you satisfy both in a unified product, then you basically offloaded my work by going through one funnel." | Clear enough: unified = preferred; three separate approaches = permitted ("you can") with a stated downside. This is a preference, not a ban on separate approaches. Whether it affects scoring is UNKNOWN. |
| QA07 | P013 (middle) | **Question absent** or the passage itself may be an audience comment. | "I would love to see, I think, one exceptional thing I would strive for: can I link some of the products that are already out there and then just make me check out, right?… you just redirect me to the product where I can actually make that purchase. Then you now have the end-to-end funnel done." | Two readings: (a) PRES preference — redirecting to existing products for the purchase counts as an acceptable end-to-end funnel; (b) an audience member's proposal with no organizer response recorded. "I would love to see" fits PRES; "I would strive for" fits a builder. Treat as **PP at best, speaker uncertain**. |
| QA08 | P014 (a) | Could apps where you log what you eat become the shopping interface? They know your needs/likes; how would you imagine that experience (end-to-end, all three intents)? | P014 item 2 (probably): "I have this gut feeling that we are narrowly focused on the chat interface. Does it always have to [serve] from chat? … Is it because you do need all that discussion and conversation with the customer before you know what he wants?" | Item 2 may answer the interface part only; the "apps become the shopping interface" idea gets no explicit yes/no. Part of the question is garbled (G11–G12). |
| QA09 | P014 (b) | "Do you think OpenAI could have a version of that, a marketplace which would eat up the entire thing?" | "1. If I knew the future, I might not be here." | Deflecting answer. No position on OpenAI or marketplaces. |
| QA10 | *(missing)*, P015 | Unknown. | "What are the key signals that you need in the end? … they slowly, slowly narrow down the signal so it makes sense for you." | Possible continuation of P014 item 2 or a separate unrecorded question. "They" is unresolved. |
| QA11 | P017 | What can we assume about user behaviour — e.g. users' enthusiasm to onboard Gmail read access, or grant TikTok-following permissions? What assumptions are we allowed to make? Is the user okay with this, or what's the realistic step? | P018: "you guys are doing the demo… I'm sure you guys are okay to integrate your Instagram or Gmail because it's confined and bounded… You can integrate your social media if you want, but then show us how you're using those signals, how you're converting it, and why you think it solves the customer problem." | Answered conditionally. The permission is about the demonstrators' own accounts in a demo ("your Instagram or Gmail"). Silent on other people's data, privacy/consent rules, or real-user permission flows. |
| QA12 | P019 | "Okay, makes sense, correct?" (acknowledgement) | "I am looking for that creativity, thinking outside the box." | Not really a Q&A. |
| QA13 | P021 | PRES scenario: if it's a chatbot and answers incorrectly — think about "the harness and safety aspect". "Sorry, what?" (inaudible) | "Do note: it is a problem we solve right now." / "I also think safety is very important, by the way." | The "what" is not transcribed. "it is a problem we solve right now" — referent of "it" (hallucination? safety?) and "we" (the company?) unclear. |
| QA14 | P021 | "Tyler has something." | Not transcribed unless P022 is Tyler's (INF, L-M). | Content of Tyler's comment unknown. |
| QA15 | P025 | "The question is: how do we get…" (cut off) | "That was a very critical question. Next: intent." | The question content and the answer are both missing. **Do not attach "very critical" to any particular topic.** |
| QA16 | P027 (middle) | **Question absent** ("any other questions? That's what you're saying.") | "The real question is: your new shopping experience, does this solve the strong intent? Well, it could degrade on no-intent discovery. It should still solve the strong intent, right, because if it doesn't, now I got to go somewhere else." | The asker's point is unknown; the answer is a PRES steer (see F18). |

No audience question in the transcript is about: submission format, repo/code requirements, tool/model limits, team composition, the scoring weights, or the judging panel. These stay UNKNOWN (§6) — absence of a question is not an answer.

---

## 3. Atomic findings (each with class / confidence / source)

### 3.1 Event logistics (ORG2 block)

| ID | Finding | Class | Conf. | Source |
|---|---|---|---|---|
| F01 | Teams are already set, assigned **by seat**; team numbers were placed by seat ("Alice… putting on the team numbers"). | E | H | P024 |
| F02 | "There are 14 teams." | E | H | P024 |
| F03 | "14 teams at 9 am will have a 2-hour demo across 7 minutes each." Reading: demos start at 9 am; roughly 7 minutes per team; ~2-hour session. | E (garbled grammar) | M | P024 |
| F03a | Arithmetic: 14 × 7 min = 98 min, which fits inside "2-hour". Whether the 7 minutes includes Q&A, setup or changeover is not stated. | INF | M | P024 |
| F03b | "9 am": no date, day, time zone, venue or pre-demo deadline is given. A deadline must **not** be derived from it. | UNKNOWN | H | P024 |
| F04 | Each participant should "now, in your inbox, have $50 in credit." | E | H on statement; currency/provider/expiry UNKNOWN | P022 |
| F05 | "Please use those. Use it for voice, use it for images. Who knows, right? … explore different modalities." | PP (request / encouragement) | M-H | P022 |
| F06 | ORG2 relays that "we want you to be creative and explore multimodality" (attributed to "Alex"). | PP | M | P022 |
| F07 | "You can use our APIs"; "you can deliver working demos, as an example"; "All of the tools you need are ready for you, so please do use them." | E (availability) + PP (please use) | M; which APIs/tools = UNKNOWN | P023 |
| F08 | Earlier event activities exist: "the challenges which we were supposed to do", "the game thing", "All of you made sites just now"; they are "supposed to kind of equip you". Whether this relates to this repo's own prior activity is not stated. | E / UF | L-M | P023 |

### 3.2 Rubric and evaluation signals (PRES, P020–P021)

| ID | Finding | Class | Conf. | Source |
|---|---|---|---|---|
| F09 | A "Rating rubric" is read out with five bullets: (1) **AI-first transformation** — how core is the AI; (2) **"Same retail experience"** (term garbled) — AI-core vs assistance, customer value, experience; (3) customer problem / market gap / unique value; (4) **Innovation and differentiation** — creativity; (5) **Execution and feasibility** — demo presentation (cut off). | E | H on bullets 1, 3, 4; M on 2 and 5 (garbled) | P020 |
| F10 | No weights, scoring scale, point values or priority order are given. Bullet order should not be read as weight. | UNKNOWN | H | P020 |
| F11 | Company vocabulary: "AI-assisted versus AI-core"; goal is "all the tools are built around AI versus human" (phrase garbled). | E / UF | M | P020 |
| F12 | Fragment: "Minute of the key points that you would get across: responsibility and AI safety." Plausibly signals responsibility/safety as something to cover in the demo, but the surrounding words are broken and the bullet head is lost. | UF | L-M | P020 |
| F13 | "I could ask any questions, and it would be ideal that you only answer questions that position the company to be reliable." Appears to be about Q&A after demos. Which "company" (PRES's or the team's) and whether Q&A sits inside the 7 minutes are unclear. | UF / PP | L-M | P020 |
| F14 | Safety scenario: if the product is a chatbot, "what if it answers something incorrectly? You have to think about the harness and safety aspect." and "safety is very important." | PP (emphasis) | M-H | P021 |
| F15 | "Execution and feasibility: Demo presentation" ties to PRES in P018 ("you guys are doing the demo"). Demo is the evaluated artifact in the transcript's own words; the exact deliverable format is UNKNOWN. | E / INF | M | P018, P020 |

### 3.3 Challenge framing and steer (PRES)

| ID | Finding | Class | Conf. | Source |
|---|---|---|---|---|
| F16 | Reimagine shopping with **AI at the core, not AI-assisted**. "Search the index then recommend" is called AI-assisted. Repeated as rubric bullets 1–2. Cross-confirmed. | PP framing + E (rubric) | H | P004, P020 |
| F17 | "I really want you guys to find the market gap. There is a market gap." Belief: **no-intent discovery** is not solved today; recommendations are browsed but not really looked at. | PP | H | P005 |
| F18 | Company goal: bring catalogues not known to the user and let them discover. | E (company goal) | M-H | P005 |
| F19 | Strong-intent steer: the new experience may "degrade" on no-intent discovery, but "should still solve the strong intent… because if it doesn't, now I got to go somewhere else." | PP (strong "should") | M-H | P027 |
| F20 | Intent taxonomy: **strong** (know exactly what/brand, e.g. specific mosquito spray), **weak** (know the need, not the product: net vs spray), **no intent** (browsing; "sitting on my bed"). "Three examples" (P012), "three pillars" (P008), "funnels" (P027), "three intents" (P014 asker) appear to be the same set, but the terms are not equated by the speaker. | E for definitions of strong/weak (via examples); UF for no-intent (cut off); INF for term equivalence | M | P008, P012, P014, P026–P027 |
| F21 | A **unified** experience covering all three is preferred ("would be great"); three separate approaches are allowed but offload work to the customer. | PP + E (permission) | H | P008, P012, P013 |
| F22 | Cold start is the "biggest challenge" for consumption; need differentiation and unique value over feature parity ("You could build the greatest Instagram…"). | PP | M-H | P009 |
| F23 | Ideas floated as examples only: a **game**; ask one question ("what are you looking for?" → shoes); a **video feed**; "chat, voice, who knows". "Do note: you can make it into a game too. To start, it's open-ended." Not a requirement. | OX | H | P009, P016 |
| F24 | Gut feeling that people are "narrowly focused on the chat interface"; asks "Does it always have to… [serve] from chat?" Signal toward non-chat or multi-modal; not a ban on chat. | PP | M | P014 |
| F25 | Signals: "what are the key signals that you need in the end?… slowly narrow down." | PP / UF | L-M | P015 |
| F26 | Own-account integration (Instagram, Gmail, social media) is OK "if you want", but you must "show us how you're using those signals, how you're converting it, and why you think it solves the customer problem." | E (conditional permission) | H on wording; scope M | P018 |
| F27 | "I am looking for that creativity, thinking outside the box." | PP | H | P019 |
| F28 | Possible preference: link to already-existing products and redirect the user to purchase = "end-to-end funnel done". Speaker uncertain (QA07). | PP? | L-M | P013 |
| F29 | Critique of recommendations: dependent on a clean catalogue and click feedback ("Just because I like it, do you like it?"); skewed to best-sellers vs the long tail; "recommendation is a very vague word". | NAR / PP | H | P007–P008 |
| F30 | Slide narrative: store → mall → e-commerce; discovery looks unbounded; "Dimensions of criteria." (fragment). | NAR | H (narrative), L (last phrase) | P002–P004 |
| F31 | Netflix example: users scroll the home screen and never watch the recommended content. "We're all struggling with discovery, with no-intent search." "If AI has the right context, I think there is value to deliver." | OX + PP | M-H | P011 |
| F32 | Brand/product examples are all illustrative: Foot Locker, Nike, Adidas (P002); Google (P004); TikTok / TikTok Shop, Instagram (P009, P017–P018); Netflix (P011); OpenAI (P014 asker); Gmail (P017–P018). None is a mandated platform. | OX / AQ | H | various |

---

## 4. Rule vs preference vs optional example (compact matrix)

| Topic | What the transcript supports | NOT supported |
|---|---|---|
| AI-core, not AI-assisted | Rubric bullets 1–2 (E) + repeated framing (PP) → strongest-signalled theme | A numerical weight |
| Market gap / unique value | Rubric bullet 3 (E); "find the market gap" (PP) | A required specific gap — but no-intent is where PRES believes the gap is (PP) |
| Creativity / differentiation | Rubric bullet 4 (E); P019, P022 (PP) | Which creative direction |
| Unified vs separate intent handling | Unified preferred (PP); separate allowed (E "you can") | A requirement to unify |
| Strong intent must still work | "should still solve the strong intent" (PP, strongly phrased) | A pass/fail gate |
| Game, video feed, chat, voice, "start with shoes" | OX only | Any mandate to use a game / shoes / video / chat |
| Own-account integration | Allowed "if you want" with signal explanation (E) | A requirement to integrate; any privacy/consent rule |
| Multimodality / $50 credits | Encouraged (PP) | A requirement or scoring item |
| Using organizer tools/APIs | "please do use them" (PP/E availability) | Exclusivity; ban on other tools; list of the tools |
| Safety / responsibility | Emphasised twice (PP) + a rubric-adjacent fragment (UF) | Defined criteria for "responsibility and AI safety" |
| Demo | "you guys are doing the demo"; "Demo presentation" (E) | Length of live demo vs 7-minute slot split; required artifacts |
| Schedule | 14 teams; 2-hour; 7 min each; "9 am" (E, garbled) | Date, location, time zone, order, submission deadline |
| Monetisation features | Asked (AQ) | Any answer |
| Live integration / "downloaded" | Asked and "Correct." (AQ + short reply) | A usable rule |

---

## 5. Names, brand and garbled fragments

### 5.1 "coupon" / "Coupon"

| Occurrence | Text | Reading |
|---|---|---|
| P003 | "Then, next coupon. E-commerce online with internet…" | In a store → mall → *next* stage sequence a brand name is out of place. Most likely a mis-hearing of the next stage (e.g. "commerce"/"e-commerce"), but that is conjecture. Cannot conclude it is the same entity as the other two. (INF, M) |
| P005 | "Our goal at coupon right now is: how can we bring catalogues that are not known to you…" (lower-case) | Appears to name the presenter's company. |
| P020 | "At Coupon, we talk about AI-assisted versus AI-core…" (capitalised) | Same, with proper-noun capitalisation. Capitalisation is the transcriber's choice, not evidence. |

What can be said safely: the transcript contains the token "coupon/Coupon" where the speaker refers to their employer. **The spelling is unverified.** A discount-coupon business, a different company with a similar-sounding name, and a transcription error are all possible. A phonetic guess that it could be a similarly sounding e-commerce brand exists, but I could not verify it and no source supports it; **do not propagate any such name** and do not use "Coupon" as a branded noun in deliverables without confirming against the official brief. Also, P009's "integrated live into a capture" may contain the same garbled brand or "catalogue" (G03) — unverified.

### 5.2 Other proper names

| Name | Where | Notes |
|---|---|---|
| Alex | P022 | Third-person reference by ORG2; probably PRES (INF M-L); spelling unverified |
| Tyler | P021 | Someone with "something" to say; role unknown (INF L-M: ORG2) |
| Alice | P024 | Staff who set team numbers; spelling unverified |
| Foot Locker, Nike, Adidas, TikTok (Shop), Instagram, Netflix, Gmail, OpenAI, Google | various | Likely accurate transcription; all examples/asker references, not requirements |

### 5.3 Garbled / fragmentary passages

| ID | Fragment (short anchor) | Source | Possible readings (hypotheses only — not adopted) | What cannot safely be concluded |
|---|---|---|---|---|
| G01 | "Then, next coupon." | P003 | next stage ("commerce"); brand | Nothing; see §5.1 |
| G02 | "Dimensions of criteria." | P004 | slide heading about evaluation dimensions; or truncated thought | That it introduces the rubric |
| G03 | "should not be integrated live into a capture. Everything has to be downloaded" | P009 | "capture" ≈ brand or catalogue (unverified); "downloaded" = static data / local build | That a "no live integration" rule exists, what is exempt, or what is to be downloaded; this conflicts at face value with P013/P018 external links |
| G04 | "the intent that no intent" | P008 | "all the intents, that is no intent" | The exact claim |
| G05 | "overfullicency, offering the scouts" | P009 | rewards/offers/monetisation features? (pure conjecture) | What was asked, beyond "monetised means vs exploration" |
| G06 | "an egg in the chicken pot" | P009 | chicken-and-egg problem (idiom garble) | Only that the presenter is describing a feedback/data chicken-and-egg problem |
| G07 | "The cold start would be an exceptional change" | P009 | "…challenge" | Just that cold start is described as the biggest challenge ("always the biggest challenge" is clear) |
| G08 | "I'm not in the picture of the video, but the algorithm is" | P009 | creators vs algorithm; non-curated | Meaning |
| G09 | "Type 1 accounts", "view things from the inside" | P010 | Unknown | What kind of account is meant |
| G10 | "a cool start" | P011 | cold start | Probably a mishearing; not safe to re-spell in a rule |
| G11 | "Where you add what you're eating" | P014 | food/diet-logging app (conjecture) | Which apps |
| G12 | "a dog can find me, like, hey, you were good" | P014 | unknown | Anything |
| G13 | "surf from chat"; "Well, call" | P014 | "serve from chat"; "voice call" | Exact claim |
| G14 | "Same retail experience" | P020 | a different rubric title (garbled) | The title of bullet 2; do not rename it |
| G15 | "How great is / Minute of the key points" | P020 | lost words between lines 48–49 | What "Execution and feasibility" measures beyond "Demo presentation" |
| G16 | "all the tools are built around AI versus human" | P020 | AI-built vs human-built tooling | The implication for the challenge |
| G17 | "harness", "it is a problem we solve right now" | P021 | guardrails / evaluation harness; company solves safety | The referent of "it" and "we" |
| G18 | "Sorry, what?" | P021 | inaudible interjection | Who and why |
| G19 | "messing around with the voice here" | P022 | live demo of voice | Whether any voice demo or provider was shown |
| G20 | "All of the challenges which we were supposed to do, but we did the game thing too." | P023 | the earlier activities | Which challenges, what the "game thing" was |
| G21 | "14 teams at 9 am will have a 2-hour demo across 7 minutes each" | P024 | session starts 9 am; slot ≈ 7 min | Date; start vs arrival time; whether 2 hours is the full block |
| G22 | "The question is: how do we get" | P025 | unknown | Anything |
| G23 | "I need a mosquito. No, I got to go fight a mosquito tomorrow." / "snowgun" / "No intent, as I'm sitting on my bed. It's kind of a question." | P027 | spoken self-correction; humour; cut-off no-intent definition | A formal definition of no-intent; "snowgun" is illustrative |
| G24 | "three pillars" / "three examples" / "three intents" / "funnels" | P008, P012, P014, P027 | same strong/weak/no-intent triple | That "pillars" are a rubric item — they are not in P020 |

---

## 6. Official facts that remain UNKNOWN from this transcript

- Submission format, required artifacts, code/repo/hosted demo requirements, and the actual submission channel/deadline. (The 9 am demo is not a submission deadline.)
- Date, time zone, venue, demo order, equipment and whether the 7 minutes covers Q&A, setup and changeover.
- Scoring weights, scale, number of judges, who judges, tie-breaks. The five-bullet rubric has no weights; one bullet is garbled and one is truncated.
- Whether "responsibility and AI safety" is a scored criterion, a required demo point, or just a hint.
- Which tools, APIs and models are allowed; what "our APIs" are; whether other providers are permitted; $50 credit provider, currency, expiry and caps.
- Rules on collaboration, team size, outside help, pre-built assets, and use of earlier work.
- Rules on data, privacy, user consent and real accounts (beyond "your Instagram or Gmail… confined and bounded").
- Whether monetised mechanics are allowed (QA04), whether cross-account bridging is expected (QA05), what the "downloaded / not live-integrated" constraint is (QA02), and the "very critical question" in P025.
- The exact identity and spelling of the presenter's company ("coupon/Coupon") and of the named individuals.
- Whether the first part of the session and anything before P001 changes the above (the transcript starts mid-sentence).

---

## 7. Nuggets and decision implications

### 7.1 Nuggets (low-risk, directly supported)

1. Judging language is **AI-core vs AI-assisted** — mentioned in framing (P004), rubric (P020) and company vocabulary (P020). Highest-confidence theme (F16).
2. The presenter wants a **named customer problem / market gap**, with **unique value** (F09, F17).
3. "Show your work": if signals from personal accounts are used, **show how the signals are used and converted** and why this solves the customer problem (F26).
4. The three-intent framing (strong / weak / no) is the presenter's mental model for the whole challenge (F20).
5. Cold start is named as the biggest challenge; the presenter volunteers games, one-question onboarding and non-chat modalities as examples of ways to approach it (F22–F24).
6. Safety/harness for a chatbot answering incorrectly is raised twice (F14).
7. 14 teams, ~7 minutes each, "9 am" (F02–F03).
8. $50 credit and provided APIs/tools are available for voice and images (F04–F07).
9. A one-line steer from the P027 anecdote: users leave if the strong-intent case fails (F19).

### 7.2 Decision implications — **analyst inference only (INF), not rules**

- **DI-1 (INF, M):** An entry that is a chatbot or search bar with a recommender behind it risks reading as "AI-assisted" per P004 and P020. Design the AI as the product's core decision-maker.
- **DI-2 (INF, M):** Since a unified experience is preferred and strong intent "should" still work (F19, F21), a single flow that visibly handles all three intents, with the strong-intent path not degraded, is the safest reading of the presenter's preference. Treat it as a preference, not a gate.
- **DI-3 (INF, M):** Make the demo explicitly show the cold-start path, the signals used, and why it solves the customer problem (P009, P018).
- **DI-4 (INF, M):** Prepare a short, honest safety/harness answer (how wrong answers are handled; limits) because it was raised twice (P020–P021) and P020 mentions the presenter may ask questions.
- **DI-5 (INF, L-M):** Plan the demo to fit comfortably within 7 minutes (14 × 7 = 98 min inside "2 hours"), but confirm with the official brief whether Q&A counts inside it.
- **DI-6 (INF, M):** If using personal accounts (Gmail, Instagram), use only the demonstrator's own accounts — this is what P018 literally permits. Do not assume permission to use other people's data.
- **DI-7 (INF, L):** Avoid depending on a "downloaded / not live-integrated" assumption in either direction until it is confirmed (QA02). Where possible keep demo data local or replayable, while not assuming that this is required.
- **DI-8 (INF, M):** Do not build to the examples (game, shoes, TikTok-style feed, mosquito spray) as if they were requirements; each is explicitly offered as an example.
- **DI-9 (INF, M):** No numerical weighting is available. Do not assume the rubric order reflects priority.
- **DI-10 (INF, L):** Confirm that the brand token ("Coupon") is correct before writing it into any deliverable.

---

## 8. Unresolved wording and questions (for verification against the official brief or an organizer)

1. What is the exact company name behind "coupon/Coupon" (P005, P020), and what, if anything, does P003's "next coupon" mean?
2. What does "Same retail experience" (P020 bullet 2) actually say, and what is the tail of bullet 5 ("How great is…")?
3. What does the sentence beginning "Minute of the key points… responsibility and AI safety" originally say? Is AI safety a scored item or a required talking point?
4. Does "7 minutes each" include Q&A? When and where is "9 am" (date, time zone, venue)? Is there a pre-demo submission cut-off?
5. What is the "should not be integrated live into a capture. Everything has to be downloaded" constraint (P009 Q1), and what did "Correct." confirm?
6. Are monetised mechanics (offers, rewards, etc.) allowed (QA04)? The transcript contains an unmatched answer.
7. Is cross-account bridging in scope (QA05)?
8. Who said the "link products and redirect to checkout" passage in P013 (QA07), and is a redirect-out checkout acceptable?
9. Is P025–P027 later than P024 or mis-ordered (§1.4)? What was the "very critical question" in P025?
10. Which "company" must be positioned as "reliable" (P020)?
11. Who are Alex, Tyler and Alice, and are the spellings correct? What did Tyler want to say (P021)?
12. What are "our APIs" and "all of the tools" (P023), what are the $50 credit's provider, currency, expiry and limits (P022), and are other tools permitted?
13. Does anything said before P001 (the transcript starts mid-sentence) change these points?

## 9. Run notes

- Coverage: P001–P027 all read twice (indexed and original). Original/indexed texts match after whitespace normalisation.
- Reported counts: 27 paragraphs; 17 Q&A ledger rows (QA00–QA16); 34 atomic findings (F01–F32 plus F03a/F03b); 24 garbled-item rows.
- No external search, no repo changes beyond this file. `tmp/sonnet/` unused.
