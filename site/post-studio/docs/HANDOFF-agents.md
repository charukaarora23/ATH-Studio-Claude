# Handoff: build the ATH design + copy agents (from the session of 28 Nov 2026)

Read `CLAUDE.md` first (all of it). It is the project memory. Then this file.

## The user's goal
- Every open-call post must be powerful, convert, and not look like the others: about 2,000 comments per post and about 5,000 submissions per call.
- She wants a **design agent** and a **copywriting agent** that hold enough references to produce real design, strategy, branding and conversion quality, so she stops getting generic output.
- She will give **10 reference sets → 10 styles**. Each style gets a design sheet built inside the ATH brand guide, then becomes a template set in the studio.

## What exists now
- **Agents** (draft v1, committed):
  - `.claude/agents/ath-designer.md`: art director. Reads the Social guide, the open-call system, the references and the data; renders with Playwright; self-reviews against a checklist.
  - `.claude/agents/ath-copywriter.md`: conversion copy per call. No fee, keyword in lines 1–2, playbook phases, banned AI words.
  - They register as agent types in this new session (`subagent_type: "ath-designer"` / `"ath-copywriter"`).
- **Brand law:** `design/guidelines/src/social.html` (ATH Social and Graphics guide v1: surfaces, accents, Inter Tight + Libre Baskerville only, corners, logo files, the "never" list, carousel order) and `design/guidelines/src/playbook.html`.
- **Approved open-call system:** `design/campaigns/open-calls/ATH-open-call-system.html` (from her 13 references), `ATH-open-call-playbook.html` (18 posts per call in phases, "Calling all ___ artists"), `deadlines-v2.html` (the approved deadline card).
- **Data:** `site/post-studio/docs/open-call-review-2026-11-28.md`, the Instagram review of her three accounts. The offer in line 1 converts; repeated posts die; no keyword gets about 1 comment; a fee in the caption kills comments.
- **Style 01 · Specimen:**
  - Design sheet: `site/post-studio/styles/style-01.html`. v2 is a 7-slide Issue 16 launch on one White surface.
  - References: `reference/images/open-call-styles/style-01/` (5 images). Notes in `reference/images/open-call-styles/README.md`.
  - Her feedback on v1: "terrible design sequence"; use the ATH branding guidelines; don't abandon the style.
- **Studio state (live, https://ath-post-studio.vercel.app):**
  - The Call manager is shared.
  - The month covers are in the approved open-call system (`site/post-studio/campaign.js`).
  - The fee is never shown.
  - The keyword is in caption line 2.
  - Empty boxes and repeated slides are held back.
  - All 15 posts per call are kept.
  - The inside slides and the launch carousel are still old templates.

## Mistakes not to repeat (she was angry about each)
- Designing without reading her references and the guide: Burgundy split covers, grids of small artworks, a full-width keyword band. All rejected and reverted.
- Superficial changes (new words on the same templates) presented as a fix.
- Adding a fee anywhere, or cutting posts per call.
- Drifting from the brand: Instrument Serif and DM Mono are not brand fonts, there are no tilted stickers, and every carousel keeps one surface and one accent.

## Next steps for this session
1. Strengthen both agent files with her feedback:
   - **Designer:** a reference-analysis step (extract each reference's devices → map to brand), a quality bar with examples of approved versus rejected work, and a fixed sequence per post type.
   - **Copywriter:** the hook bank from the data, per-phase formulas, and examples of good and bad lines from her accounts.
2. Run `ath-designer` on Style 01 until it passes, show her the renders, and iterate.
3. Run `ath-copywriter` on Issue 16 (all 15 posts) and show her the copy deck.
4. Ask for the Style 02 references, and repeat for each style.
5. Then wire the approved styles and copy into the studio (`campaign.js` / `month.js`), keeping positional edits safe (see CLAUDE.md).

Deploy steps and testing rules are in CLAUDE.md. Work on the branch `claude/wonderful-cori-nknrbi`.
