# Team 8 briefing evidence

This folder captures and interprets the user-supplied event transcript. It is a working basis for Team 8 decisions, subject to the official written brief and any later organizer clarification. No web research or external rule assumptions are part of this extraction.

- `transcript-original.txt`: original transcript body as supplied, including errors and incomplete sentences.
- `transcript-indexed.md`: identical paragraph text with P001–P027 source IDs added.
- `pass1/`: parallel, deliberately inclusive extraction notes; not the final rules.
- `pass2/FILTER-LOG.md`: source coverage ledger, removed filler, and ambiguity resolutions.
- `pass2/SOURCE-REVIEW.md`: independent Sonnet source check of the filtered brief.
- `DECISION-BRIEF.md`: final concise working brief, created after all first-pass extracts finished.
- `RUN-LOG.md`: execution, agent settings, checks, limitations, and next action.

Speaker labels are inferred roles, not verified identities. A paragraph may contain several speakers. Questions from attendees, examples, preferences, rubric criteria, and explicit event logistics must remain distinct. Unclear transcription stays uncertain; do not silently repair it into a requirement.

The parent agent is the sole integration owner. Workers own only their assigned output files and temporary directories. All new files and task output stay under `team8/`; existing game services and the frozen Sites shell are outside this task.

Read the decision brief first. First-pass notes are intentionally more inclusive and contain tentative interpretations that the filter log resolves; do not treat them as a competing rules document.
