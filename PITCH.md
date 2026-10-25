# Pitch notes: what to say (draft, 25 Oct 2026)

**Tagline (chosen): 척하면 척 (*cheok-hamyeon cheok*), "gets you before you finish".** It's a Korean idiom for someone who understands you from half a word, and that is our context story. **App name: Click.** "We just clicked" means instant understanding, the English twin of 척하면 척, and every answer in the app is a tap. Open with the tagline, then show toothpaste: "Reorder my toothpaste. 척. Done."

## One-line idea
Shopping where the AI *is* the interface: every request builds its own screen from your context, and games turn browsing into learning.

## Technical lines, per demo moment

### 1. Strong intent: "reorder my toothpaste"
- **What happens:** the live LLM reads the user's order history, so this is retrieval, not search. It sees toothpaste ordered on 13 Sep and composes a "Buy again" card plus Ship it.
- **Line:** "It already knows what you use. One tap to reorder, and Undo if you change your mind."
- **Tech:**
  - The LLM chooses UI **tool calls**: 23 tools and 127 pre-built visual variants. It never writes UI code.
  - The server checks every product ID and price against the catalogue before anything renders.
  - The first lookup appears in under 2 s; a full screen takes about 3–4 s.

### 2. Weak intent: "mosquitoes keep biting me at night"
- **What happens:** the AI infers context from past orders (King bed in Mar, baby monitor in Aug) and asks with tappable choices, not chat.
- **Line:** "✦ King, from your March bed order. Tap to see why, change it, or tell it not to use it."
- **Tech:**
  - Inferences are grounded: each one cites a real order.
  - A correction becomes a confirmed fact that overrides memory for the rest of the session.

### 3. No intent: Surprise me, then games
- **What happens:** 30 seconds of play (Rapid fire, Price guess, Bracket) is 30 seconds of labelled data.
- **Line:** "Every tap trains your personal model. Here's the before and after."
- **Tech:**
  - **The preference model is a logistic regression** with about 190 features: category, brand, tags, price band, and recency of order history.
  - **Population prior:** trained on 2,000 synthetic shoppers, split 1,600 train / 400 held-out.
    - Held-out log-loss is 0.521 against a 0.539 baseline.
    - AUC is 0.62, and calibration error is 1.3%.
    - Training takes about 0.2 s.
  - **Each game builds the dataset differently:**
    - Want/Nope and Swipe give yes/no labels.
    - Bracket gives pairwise choices (Bradley–Terry).
    - Price guess gives a willingness-to-pay signal.
  - **Online learning:** each tap is a gradient update, anchored to the user's prior so one tap can't swing everything. Undo replays the history exactly.
  - **Closed loop:** the updated model reranks the next shopping request, shown as "✦ tuned by your Rapid fire picks".
  - **Cold start:** a brand-new user gets the population prior, and one game warms them up.
  - **Rewards:** coins pay for *finishing* a game, not for particular answers, so the data stays unbiased. Coins are spent at checkout (100 coins = ₩200 off). This makes the game a sales funnel.

### 4. The dashboard ("this is who Guru is")
- Shows before and after buy-intent probabilities, the learned traits, the evidence behind each trait, and the coin ledger.

## Be honest about
- The prior is synthetic, the order history is demo data, and fulfilment is simulated.
- The model predicts buy-intent; we have not measured conversion uplift.

## Names and taglines (Korean-flavoured, about being lively and adaptive)
Recommended: **Nunchi** (눈치, reading the room) or **Araseo** (알아서, "I'll take care of it").

| Tagline | Meaning |
|---|---|
| **알아서, 딱.** *Araseo, ttak.* | "It figures it out, just right." |
| **척하면 척.** *Cheok-hamyeon cheok.* | An idiom: understands you before you finish. |
| **The shop that reads the room.** | Goes with Nunchi. |
| **매번 새롭게.** *Every screen, made for this moment.* | "New every time": the UI is rebuilt for each request. |
| **살아있는 쇼핑.** *Shopping that's alive.* | Every screen is built live. |
| **빨리빨리, but personal.** | Coupang speed with personal context. |
| **Play, pick, ship. 두근두근 delivered.** | 두근두근 = heart-racing excitement (games). |
| **Ask once. The store reshapes itself.** | Generative UI in plain words. |
