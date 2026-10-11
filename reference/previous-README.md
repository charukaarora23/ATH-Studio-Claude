# ATH My Studio explorations

Three coded visual directions, one shared artist-writing workflow. Buildless HTML/CSS/JavaScript. The app runs from dist/index.html.

## Working
Design switcher, bio and statement journals, validation, local template generation, direct editing, word count, filing, reopening, search, copy, TXT export, print layout, archive backup download, opt-in generated paper sound, reduced-motion support, responsive styles.

## Boundaries
No live AI, account integration, subscription billing, cloud storage or cross-device sync. Local templates use only entered information; they do not interpret opportunity briefs. Paid entitlements are deliberately deferred. Browser storage may be cleared; export important work. Sound is a small synthesised noise cue, not a recorded asset. The logo is a text placeholder.

## Source layout
- dist/index.html: application shell
- dist/style.css: responsive styles and three layout directions
- dist/logic.js: pure writing utilities, shared with tests
- dist/app.js: view state, editing and persistence
- dist/fonts.css and dist/fonts/: selected font resources from the supplied ATH v24 page
- tests/logic.test.cjs: constraint and grammar tests

## Fonts
Hanken Grotesk (authorised v24 web fallback), Newsreader and DM Mono are provisional. Font faces were extracted from the user's bundled brand guide, not substituted with unrelated families. These families are distributed under SIL Open Font License; production handover should include upstream licence notices and approved Nord/Proxima assets if selected. No commercial Nord or Proxima files are included.

## Developer integration
Replace localStorage persistence with ATH's account-owned document service. Keep versioned records and distinguish draft autosave from filing. Replace StudioLogic.compose with a server generation adapter that validates confirmed facts and constraints. Keep editing, failure and quota handling separate from animation. Before production: concurrency control, archive import, revision history, user auth, retention/deletion policy, live AI evaluations, browser/device QA and backend tests.

## Verification
Run node --check dist/app.js and node --test tests/logic.test.cjs. Browser visual QA is limited by the preview tools available in this session; no rendered screenshot approval is claimed.

## Material experience revision

The Files direction now uses a light Blush desk with Burgundy accents. Folders expose paper inserts on hover and keyboard focus. The writing journey has an explicit progress strip and contextual instructions, textured pages, restrained page-opening movement and a filing stamp. Sound is off initially; enabling it resumes Web Audio and plays a paper cue. Test sound provides a repeatable filing cue. Reduced-motion preferences disable transitions and animations. All three directions and existing browser-local documents remain available.

Verification: JavaScript syntax and six composition tests pass. Browser visual and listening QA remains pending because the supported browser-control capability is unavailable in this environment.

## Binder revision
Floating paper inserts, rotated covers and shadows removed. Straight folder covers lead into a journal with three restrained binder rings and a crease at the binding. Transitions use an 800ms gentle page reveal; reduced motion skips it. Browser visual verification remains pending.

## Folder and page-turn revision

The closed covers and open writing surface now share a folder silhouette. Loose sheets replace binder rings. Each cover reports actual saved document counts for its document type, with up to four visible file markers and an overflow marker. Chapters appear as index tabs. Next, previous and chapter navigation use a Web Animations page turn, cloning the outgoing sheet over the incoming one, preserving field values, removing duplicate IDs and marking the clone inert. Repeated navigation is blocked during the 950ms turn. Reduced-motion preferences and missing animation support use immediate navigation. Existing writing logic and storage schema are unchanged. Syntax and six composition tests pass; visual browser verification remains pending.

## Contrast and motion revision

Fixed inherited pale text on My files. Folder covers use Paper on Burgundy (11.77:1 nominal contrast), Paper on Petrol (8.57:1), and Burgundy on Paper. Covers have restrained dashed stitching, dotted paper margins and no cast shadows. A 24-second moving CSS gradient lights the desk; Motion pauses it and disables folder/page animations. Reduced motion disables movement. Folder selection now opens the cover before entering the writing area. Sound gains a visible volume slider and longer synthesized paper cue, plus a low filing tap. No recorded paper audio is claimed. Syntax and composition tests pass; browser visual and listening QA remain pending.

## Binding and paper-white comparison
Added a fourth Paper white canvas using the ATH Paper token. The gradient is omitted in this variation. Three restrained split rings sit at the writing edge on desktop; mobile keeps tabs without rings. The page turn is now clipped within a sheet-stage, uses a slower 1250ms curve under 90 degrees, and retains the outgoing sheet height until completion before settling to the new height. JavaScript syntax and six composition tests pass. Screenshot reviewed; live browser animation QA remains pending.

## Poster bio experience imported

The supplied Claude HTML now serves as the main index.html. Its GSAP library, full-screen poster compositions, live answer typography, SVG ribbons, diagonal wipes and final poster export are retained. The former studio remains at studio.html, including the statement writer and archive. The bio folder leads to the poster writer. Fonts use existing self-hosted ATH files. Eight-question counters corrected. Draft answers autosave locally; uploaded artwork remains session-only. File in My Studio saves a snapshot into the existing browser archive. Motion control respects the initial reduced-motion preference and allows pausing. Bio generation remains local templates, with no AI API. Inline scripts and studio JS pass syntax checks; visual browser QA remains pending.
