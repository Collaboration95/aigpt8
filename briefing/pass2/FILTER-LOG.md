# Second-pass filter log

## Completion gate and inputs

Second pass began only after the parent reported **all four first-pass agents COMPLETED**. Read the complete original transcript, P001–P027 indexed copy, and all four completed extracts:

- `pass1/01-framing-and-early-qa.md`
- `pass1/02-experience-and-signals.md`
- `pass1/03-rubric-logistics-and-intent.md`
- `pass1/04-speaker-and-ambiguity-audit.md`

`RUN-LOG.md` still contained an earlier Sonnet-pending progress entry when read; the current parent completion handoff and completed fourth extract govern this gate. No delegation occurred in this pass. Parent remains integration owner.

## Filtering policy

Retain information that changes product choice, demo proof, or questions needing clarification. Merge repeated framing; remove historical exposition and turn-taking. Preserve audience question versus captured answer, inferred speaker roles, preferences, optional examples, announcements, and analyst inference. Raw transcript wins over extraction consensus. UNKNOWN survives when ambiguity could change architecture, delivery, or resource assumptions. The written official brief remains authoritative; this pass did not obtain or reconstruct it.

## Source coverage ledger

Destinations refer to headings in `DECISION-BRIEF.md`; “log only” means excluded from the short brief with the reason retained here. Mixed labels apply to different content within a paragraph.

| Source | Disposition | Destination / reason |
|---|---|---|
| P001 | merge | Challenge; CX setup only, missing antecedent omitted. |
| P002 | merge | Challenge; store/compare/checkout history compressed away. |
| P003 | merge / uncertain | Challenge; mall/e-commerce history compressed; entity garble log only. |
| P004 | keep | Challenge; AI-core distinction and component-ban caveat. |
| P005 | keep | Challenge; market gap, unfamiliar catalogues, no-intent priority. |
| P006 | drop-filler | Log only; invitation to questions. |
| P007 | merge | Challenge; catalogue/feedback limits; initiating question absent. |
| P008 | keep / merge | Challenge and Preferences; popularity/long tail and unity preference. |
| P009 | keep / uncertain | Challenge, Preferences, Unknowns; cold start, examples, integration and monetization ambiguities. |
| P010 | uncertain | Preferences; account-bridging question remains unresolved. |
| P011 | keep / merge | Challenge, Intent, Preferences; warm/new distinction, useful context. |
| P012 | keep | Preferences; unified preferred, three separate approaches allowed. |
| P013 | uncertain / merge | Preferences; one-funnel benefit; purchase-handoff suggestion with uncertain speaker. |
| P014 | keep / uncertain | Preferences; question chat-only assumptions; speculative forecast log only. |
| P015 | keep | Challenge and Recommendations; key signals, unspecified mechanism. |
| P016 | merge | Preferences; game optional; repeated invitations removed. |
| P017 | keep | Preferences; audience asks about realistic access/consent assumptions. |
| P018 | keep | Preferences and Recommendations; bounded demo response, optional integration and conversion to value. |
| P019 | merge | Preferences; creativity; acknowledgment removed. |
| P020 | keep / uncertain | Evaluation and Unknowns; rubric themes, damaged labels/continuation. |
| P021 | keep / uncertain | Evaluation; incorrect-answer/harness safety; interruption and names omitted. |
| P022 | keep | Preferences and Resources; modality encouragement, credit announcement only. |
| P023 | keep / merge | Resources and Unknowns; tools/APIs claimed, prior exercises compressed. |
| P024 | keep / uncertain | Logistics and Unknowns; seats, 14 teams, 9 am, 2 hours, 7 minutes; missing schedule details. |
| P025 | drop-filler / uncertain | Log only; incomplete “how do we get” question/answer cannot be recovered. |
| P026 | keep | Intent and Recommendations; strong definition, product example. |
| P027 | keep / uncertain | Intent and Recommendations; weak explanation, incomplete no-intent example, preserve strong intent. |

## Important reconciliations

- **Agreement:** AI-core framing, no-intent/cold-start emphasis, preserved strong intent, optional modalities, and unified preference with three separate approaches expressly allowed are retained without creating scoring gates. [P004–P005, P009, P012, P020, P027]
- **P013 attribution:** section extractors read a presenter aspiration; Sonnet identifies ambiguous “Go ahead” boundaries. Adopt the conservative shared content: **SUGGESTION WITH UNCERTAIN SPEAKER**, never verified permission or checkout mandate. No native payments/autonomous buying inferred. [P013–P014]
- **P009 restriction:** keep the ambiguity, not a repaired rule. Sonnet's suggestion that later integrations rule out a blanket ban overreaches: unclear scope cannot establish permission or prohibition in either direction. [P009, P013, P018]
- **Q&A limits:** usage-history restatement does not answer garbled monetization permission; warm/cold framing does not approve cross-account bridging; demonstrator willingness does not establish general-user consent. [P009–P011, P017–P018]
- **Intent:** literal no-intent example is incomplete; “no predetermined product target” is expressly analyst shorthand. Do not adopt Sonnet's expanded “browsing” as a literal definition or interpret “degrade on no-intent discovery.” [P005, P011, P027]
- **Rubric/resources:** themes survive, exact category certainty and weights do not. Safety is clear, its scored status is not. Sonnet's later “credits…are available” nugget overstates the raw announcement: no receipt, provider, currency, balance, or allocation verified. [P020–P023]
- **Identity/order:** no company-name normalization, named speaker assignment, or chronology reconstruction adopted. Preserve paragraph IDs without asserting the speculative reordering Sonnet proposed. [P003, P005, P020–P027]

## Exclusions and why ambiguities survive

Dropped detailed shopping history, repeated recommendations/creativity phrasing, small-talk, the speculative OpenAI marketplace forecast, and unrecoverable garbles. Their useful surrounding content remains: AI-core change, unique value over feature parity, interface choice, signal use, and safety. [P001–P004, P006–P009, P014–P016, P019, P021, P025–P027]

Uncertain integration wording could change architecture/data preparation; missing artifact/channel/cutoff and schedule could invalidate delivery; incomplete rubric could change demo emphasis; credit/tool assumptions could block execution; Q&A/speaker ambiguity could turn an audience idea into a false obligation. These uncertainties therefore remain decision inputs rather than filler. [P009–P013, P017–P018, P020–P024]

## Local execution and checks

Read with local file commands; an initial optional-path discovery returned exit 2 because an optional path was absent, then explicit reads succeeded. A combined extraction read exceeded output limits; repeated bounded reads recovered all omitted content. Created only the two assigned artifacts and `tmp/filter/` verification files. No external research, GitHub, cloud, services, deployment, delegation, commits, or pushes. Source-hash snapshot and final verification are recorded under `tmp/filter/`. Next action: parent integration/source review, then resolve unknowns against governing material.

Validation: **886 whitespace-delimited words** in the brief (target 650–950; maximum 1,100); **5** labeled team recommendations; **27/27** source paragraphs covered once in this ledger; all four first-pass inputs listed. Original/indexed reconstruction matches exactly and all six protected input hashes are unchanged. Manual source review checked claim citations, Q&A distinctions, resource-announcement caveats, and unresolved permissions/deadlines. These are local document checks, not event compliance or submission evidence.

Integrator completion: independent Sonnet source review returned PASS with no material issues. Applied its two optional wording improvements (precise attribution of history/signals; retain one/few-question cold-start suggestion). Final brief: **899 words**. Parent rechecked the unchanged six source hashes, exact indexed reconstruction, word target, source IDs and README navigation after those edits. See `SOURCE-REVIEW.md` for the review and follow-up.
