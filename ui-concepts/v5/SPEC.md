# v5 shared spec (each builder owns ONE flow file)

Frontend-only scripted demo: a Coupang phone app where AI is the interface.

## Shell (identical in every file)
- **Home is plain and white, like the Claude mobile app.**
  - White background, a small Coupang wordmark top-left, and the cart icon top-right.
  - Centred: a small mark and "Hey Guru, what are you planning to buy?"
  - At the bottom: a rounded composer (+, text input, mic, send).
  - One small "Surprise me" chip above the composer.
  - NOTHING ELSE: no mood picker, no dial, no chips, no illustrations, no customization on home.
- **The persistent chrome after home** is only the top bar (logo, cart) and the composer. Never put a mood picker or settings in the persistent chrome.
- **Customization lives INSIDE the generated screens,** as part of the generated UI and only where it makes sense for that request (e.g. a season dial inside the camping screen, a mood row inside the discovery screen). Once the user moves on to the next turn, the earlier block's controls freeze; they do not follow the user.
- **Each turn appends a new generated block** below the previous one, as one scrolling page (like a long marketing email). The user's message appears as a small right-aligned bubble between blocks. Smoothly scroll to each new block.
- **Generated blocks use colour, illustration and layout freely** (vibrant, fun, cute), contrasting with the white home. That contrast IS the aha.
- **Copy:** product names, prices, "Rocket · tomorrow", button labels, chips of up to 3 words. No quips, no AI narration sentences.
- **Inline SVG or CSS illustrations only.** No external images or libraries.
- **Mobile:** the default URL is the full-bleed app (100dvh, safe areas). `?board=1` on desktop shows a centred phone mock plus a left column of step buttons that type and send each turn. Arrow keys step. Every turn also works by typing in the composer and pressing Enter.
- **Check before finishing:** no horizontal overflow at 390x844 and 375x667; buttons at least 44px; text never overlaps. A quick check with Playwright at /tmp/t8pw (`require('playwright-core')`, executablePath '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'; the server is http://127.0.0.1:8817/v5/<file>) is enough. Do not loop endlessly.
