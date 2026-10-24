# First-pass visual reading: IMG02 and IMG04

Scope: only `IMG02.txt`, `IMG04.txt` and these notes. No canonical slide text or information extraction was created.

## Coverage and method

- Read `SOURCE-MANIFEST.json` and `README.md` before transcription.
- Individually opened both original local JPEGs with `view_image`, using `detail: original`. Each source is 2000 × 1500 pixels, confirmed with `sips -g pixelWidth -g pixelHeight`.
- Additionally opened IMG04 in native Preview and visually zoomed/panned its illustrated panel. This changed only the view, not the image. Automatic accessibility/OCR output was not used to fill missing pixels.
- No image crops, image enhancements, image generation, network access, oral-transcript reading, or second-pass extraction.
- Main slide text follows top-to-bottom order. Columns in IMG02 follow left-to-right order. IMG04's illustration is separated into editorial region labels so its phrases are not mixed with the left-side prompts. All square brackets are editorial.

## IMG02 uncertainties

- Top centre: a very faint line is visible above the title; wording cannot be reliably read. It is explicitly marked unreadable.
- Left VOICE quotation: `Nike` is fully visible. The following line visibly starts `Super`; the remainder and subsequent fragments are covered by a hand. No brand/model continuation, closing quotation mark, or extra words have been reconstructed. The additional obscured line marker records covered continuation without claiming its wording or exact line count.
- Left card's bottom journey line: `DECIDE → BUY` is readable; preceding text and any preceding connector are covered. The transcription does not complete them.
- Footer: the printed section label is `05 / POSSIBILITY SPACE`, while the slide page label is `06`. They are transcribed separately.
- The nonalphabetic symbols above VISION and Personalize are treated as graphic icons rather than guessed text. The clear exclamation mark in the VOICE icon is included.

## IMG04 uncertainties

- The five illustrated region headings, central `AI`, tagline, small checkout `Pay` button, and lower-left sign are visually readable and transcribed separately.
- DISCOVER reads `AI FINDS / WHAT YOU'LL / LOVE`; TRY ON reads `VIRTUALLY / SEE IT ON / YOU`.
- CHECKOUT reads `FASTER`, `EASIER`, `ANYWHERE`. The small separator after each of the first two words is not clearly distinguishable as comma versus full stop, so the two lines explicitly mark the comma reading as uncertain.
- IN STORE reads `SMARTER / SHOPPING / IN REAL LIFE`.
- BEYOND reads `POST-PURCHASE / CARE FOR A / LONGER JOURNEY`.
- Beneath BEYOND, the three tiny captions beside the shield, star and leaf icons cannot be reliably read, including their exact case/spelling. They are three separate unreadable markers in left-to-right order. No familiar slogan or label was substituted.
- Tiny horizontal marks within the illustrated phone interfaces and the payment card cannot be reliably distinguished as actual words versus decorative strokes. They are flagged in a separate editorial region, rather than expanded into invented interface labels.
- Tagline punctuation is transcribed as visible full stops: `PERSONAL. INTELLIGENT. SEAMLESS.`
- `YOUR TURN` is the upper-left label and `07` is the page label; no section number was added.

## Local actions and limits

- `view_image`: both assigned photos successfully opened and visually read.
- `sips`: confirmed both source dimensions.
- `rg --files pass1 tmp/sol-b ...`: returned no matching owned files (exit 1); no existing transcription was used.
- Native Preview: IMG04 opened successfully and its illustration was inspected at larger display scales. A subsequent attempt to open IMG02 in the native file dialog did not complete reliably; no text was derived from that dialog. IMG02 had already been fully opened with `view_image`.
- Source preservation is checked against the manifest hashes after writing. Remaining ambiguities are limited to the locations above. Next action belongs to the parent integrator: reconcile these first-pass files with the independent visual reading before any extraction.
