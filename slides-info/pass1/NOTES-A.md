# Pass 1 visual reading: IMG01 and IMG03

## Coverage and method

- Read `SOURCE-MANIFEST.json` and `README.md` in `team8/slides-info`.
- Individually opened both original local JPEGs with `view_image`, using `detail: original`:
  - IMG01: `sources/E69C1359-B0CF-40C3-A0EA-8ECB6FDFA275.jpg`
  - IMG03: `sources/A2541977-AE49-4AE3-9484-1A6B9C8A5EA2.jpg`
- Read the slide text directly from each photograph, then compared their visible wording. No OCR, earlier oral transcript, network, image enhancement, regenerated imagery, or additional delegation was used.
- These are two independent photographs of the same main-challenge slide. Their visible headings, quotation and arrow labels agree. Each transcription retains its own photograph's footer visibility limits.
- Bracketed region labels and uncertainty markers are editorial. Quotation marks represent the large visible opening and closing quotation glyphs. The quotation's four text lines follow the slide's line breaks; arrow labels are ordered left to right.
- The printed `04 / MAIN CHALLENGE` section label is separate from the small bottom-right page number. It has not been substituted for that number.

## Specific uncertainties and limits

- IMG01, bottom-left footer: obscured; no footer wording has been supplied from IMG03 or reconstructed from context.
- IMG03, bottom-left footer: the beginning is obscured. Immediately before the readable `PRIX`, the visible suffix appears to be `ND`, but is too small and soft for an unqualified reading. The transcription marks that suffix as uncertain and does not complete the hidden beginning. `PRIX | REIMAGINE RETAIL` is readable in this photograph.
- IMG01 and IMG03, bottom-right page number: visually appears to be `03`, but both small white labels are soft. Both transcriptions preserve this as `[uncertain: 03]`.
- No uncertainty was found in the title, subtitle, four-line quotation, or three arrow labels. No additional legible decorative diagram text was found in either assigned slide image.

## Actions and outcome

- Inspected the manifest and README with `cat`; succeeded.
- Opened IMG01 and IMG03 separately with `view_image`; both succeeded.
- Checked the assigned output paths before writing; the three assigned files did not yet exist. The shell existence check returned status 1 for those absent files; no image-view failure occurred.
- Created only `pass1/IMG01.txt`, `pass1/IMG03.txt`, and `pass1/NOTES-A.md`. Original JPEGs were not modified.
- Read back all three output files with `cat`; succeeded. Ran `shasum -a 256` on the two assigned original JPEGs; both hashes exactly match `SOURCE-MANIFEST.json`.
- First-pass work only. No canonical slide, information extraction, inferred event rule, or integration output was created. Parent integration should retain the photo-specific uncertainty markers when reconciling the footer and page label.
