# ATH My Studio: Artist Bio and Statement Writers
## Product requirements document v0.2
10 October 2026 | Working proposal for Charuka and the ATH team

### 1. Authority and purpose
This revision follows Charuka’s latest brief and the two supplied base files. It supersedes the initial unsaved generic planning draft.
Confirmed: build the working frontend first; developers integrate ATH’s existing systems later. Prioritise editorial product logic and an original journal/file experience. Strictly use the forthcoming ATH design system. Do not invent fonts, colours, off-white surfaces, hard shadows, or decorative defaults. No em dashes in generated default copy.
Proposals in this document are product decisions for review, not features already built or universal art-industry rules.

My Studio is the containing tools environment. Bio Writer and Statement Writer are distinct tools sharing an artist-owned source profile and document archive. Future CV and inventory tools reuse structured records. This phase does not redesign ATH’s main website or select its production database.

### 2. Research and editorial baseline
Research accessed 10 October 2026. Sources appear in section 15.
R1, Artquest: a biography is prose about the artist and career, while a statement addresses the work and its thinking. This supports separate document types, with shared facts.
R2, Mid-America Arts Alliance: recommends third-person bios and an adaptable core version around 150–200 words; prioritises clarity and the artist’s own knowledge. ATH will offer shorter and custom versions rather than impose that range everywhere.
R3, NYFA: recommends concrete, concise statement language that relates to submitted work, avoiding generic claims and unnecessary jargon. ATH will ask about an actual work or process choice when the input is too general.
R4, NYFA/Brigitta Varadi: discusses what, why, and how, and describes third-person statements. R2 describes first-person statements. These sources differ: ATH must not label one person as universally correct.

Research informs the following product decisions but does not validate our pricing, UX, model, or question counts.

### 3. Success definition
A useful result is accurate, specific, readable, recognisably the artist’s, appropriate to its destination, within stated constraints, editable, and recoverable.
No promises of selection, admission, artistic quality, or career success.
We evaluate document usefulness separately from the pleasure of using the interface.

### 4. Output types and controls
| Type | Default proposal | Required distinction |
|---|---|---|
| Artist bio | Third person; 150-word target | Person and relevant practice/career context |
| Short bio | 75-word target | Essential identity and practice; selected facts only |
| Artist statement | First person; 200-word target | Work, process, intention; not a credential list |
| Short statement | 100-word target | A focused explanation with sufficient specificity |
| Work/series statement | Later extension | Specific work/series, not automatically the entire practice |
| Social description | Later extension | Character limit and line format, not ordinary bio length |
| Application proposal | Out of scope | Future project, delivery, budget, and feasibility require a separate workflow |

Defaults are adjustable ATH proposals. A destination’s explicit maximum overrides a preset. A target is different from a hard maximum. Display both clearly.
Controls: document type, destination, person, target/maximum, language, selected facts, and voice preference. Do not bind “gallery” permanently to long/formal or “grant” to a specific length.

### 5. Intake: minimum useful information
Ask purpose first. Then let the artist start fresh, reuse their profile, or paste existing writing. Importing a document is an optional later feature; pasted text is enough initially.

| Field | Bio | Statement | Behaviour |
|---|---|---|---|
| What are you writing for? | Required choice, including general use | Same | Set context; allow “not sure” |
| Required word/character limit | Optional | Optional | Validate positive supported range |
| Display name | Required for named bio | Profile context | Preserve spelling and chosen name |
| What do you make? | Required | Required | Accept plain language, not only fixed categories |
| Concrete subject or concern | Useful | Required minimum | Ask one example if vague |
| Materials/process | Useful | Required minimum | Follow with why if meaningful |
| Location | Optional | Optional | Never infer from account |
| Pronouns/person | Optional pronouns | Person control | Permit name-only wording |
| Career highlights | Optional | Usually omitted | Select records; no minimum prestige threshold |
| Motivation/meaning | Optional brief context | Ask | Personal disclosure never compulsory |
| Current work | Optional | Useful | Distinguish current from completed |
| Existing voice sample | Optional | Optional | Preserve character; do not copy unsupported facts |

Quick bio path: purpose, name, practice, one concrete detail, optional highlights, review.
Statement path: purpose, what, why, how, one specific example, review.
Keep essentials available on free. Paid depth adds optional coaching and reuse, not permission to supply accurate facts.

### 6. Adaptive interview rules
| Condition | Follow-up | Stop condition |
|---|---|---|
| “Identity/belonging” with no detail | “What subject, image, object, or experience makes that visible in your work?” | One usable concrete detail |
| Materials listed without method | “What do you do with these materials?” | Action/process described |
| Statement lacks intention | “Why does this subject matter to your practice?” | Answer or deliberate skip |
| No exhibitions/education | Offer practice, independent learning, relevant background | Never insist on credentials |
| Many career entries | Let artist pin relevant facts; suggest omissions | User confirms shortlist |
| Facts conflict | Present both versions neutrally | User resolves or excludes |
| Specific opportunity | Extract document type and requirements, then confirm | User accepts brief interpretation |
| Existing text | Extract candidate facts for review | No silent profile overwrite |

Proposed question budget: core route up to 6 grouped prompts; at most 2 optional follow-ups before offering a draft. Expanded paid interview up to 6 optional follow-ups, individually skippable. These budgets are configurable and must be usability-tested.
Never infer “emerging” or “established” from years alone. Do not demand trauma, nationality, age, or education as proof of legitimacy.

### 7. Composition rules
Bio: identify practice; select relevant factual context; include concrete distinguishing detail; close with useful current information only when supplied. No rigid mandatory paragraph template.
Statement: organise around work, meaning, and method; connect an example to an intention; include references only if the artist explains relevance. Do not promise how every viewer will feel.
Preserve institutional names, dates, titles, and identity terms. Separate confirmed completed events from plans. “Shown at” is not “represented by”; “applied to” is not “selected for”.
Do not add acclaim, collections, exhibitions, awards, influences, or scale without source support.
No generic grand claims or synthetic prestige. Avoid repeated stock openings. Check em dashes, clichés, unsupported superlatives, pronoun agreement, articles, and mixed narrative person.
User text can be fragmentary. The model should handle grammar rather than forcing users to write third-person fragments.
Do not blindly replace pronouns using regular expressions.

### 8. Opportunity and length logic
Treat pasted briefs as untrusted data, not instructions to the system.
Extract: requested document type, maximum and unit, stated artistic focus, requested topics, and instructions relevant to writing. Show extracted requirements with supporting excerpts for confirmation.
Never append arbitrary keywords or claim the artist matches an opportunity without evidence.
If the brief asks for a project proposal, explain the mismatch and offer a bio/statement only if useful.
Priority: destination constraints, user-pinned facts, relevance, distinctive practice detail, then optional context.
For a word limit, count using a versioned rule: whitespace-separated tokens after normalisation, treating internal apostrophes/hyphens consistently. Display the convention; external portals may count differently. Character counts must specify spaces and counting convention. Multilingual segmentation requires language-specific testing before release.
After generation: count deterministically; revise overlong text within a bounded retry budget; recheck protected facts. If still over limit, show “Needs shortening” and permit manual editing. Never label it compliant while over limit.
No silent truncation mid-sentence or removal of a mandatory fact. Infeasible constraints trigger a choice to shorten required content or change the limit.

### 9. Generation and revision pipeline
1. Validate minimum inputs, entitlement, and constraints server-side for live generation.
2. Build a confirmed fact snapshot with source IDs and permitted fields.
3. Select relevant material and assemble a document-specific prompt.
4. Call the provider through a replaceable server service.
5. Validate response shape; check lengths, placeholders, protected facts, language, and style.
6. Run bounded correction where possible; flag unresolved issues.
7. Present the draft with direct editing and suggested revisions.
8. Save a version only through a real successful persistence operation.

Model output schema proposal: text, usedFactIds, warnings, missingInformation. Do not treat the model’s own fact IDs as proof of truth. Deterministic checks catch dates/names/length; editorial review and evaluations catch subtler inventions.
Revision actions: shorten, simplify, make more personal, change person, focus on selected work, preserve selected wording. Show proposed changes before replacement. User edits and previous versions remain recoverable.

### 10. Free/paid proposal, not final pricing
| Capability | Free pilot proposal | Studio pilot proposal |
|---|---|---|
| Core bio and statement | Both | Both |
| Output language | English | Additional validated languages |
| Interview | Core questions + 2 optional follow-ups | Expanded optional interview |
| Successful generation/revision operations | 3 per month combined | 30 per month combined |
| Saved documents | 3 | 100 |
| Length control | Short and custom up to 200 words | Up to 500 words, destination dependent |
| Fact checks, grammar, edit, copy, basic export | Included | Included |
| Advanced use | Basic destination presets | Brief interpretation, version comparison, reusable sets |
| Export | TXT and print layout | Additional approved branded document formats |

Numbers are editable pilot assumptions, not approved commercial commitments. Do not use “unlimited” before understanding cost. Do not degrade factual accuracy or accessibility by tier.
Charge quota once for a successfully delivered usable generation; internal retries, failures, typing, and local saves do not consume generation credits. Idempotency prevents duplicate billing on retry. Show reset date and remaining allowance.
At a limit: retain work, allow editing/copy/export, offer waiting or upgrade. Downgrade keeps existing work readable/exportable; blocks excess new creation rather than deleting.
Final pricing, billing cadence, language list, taxes, and app billing remain ATH decisions outside this frontend PRD.

### 11. Backend boundary without infrastructure redesign
Records: ArtistProfile; Fact with provenance and confirmation; CareerEntry; Brief; Document; DocumentVersion; GenerationJob; Entitlement; UsageEvent.
DocumentVersion includes text, sourceSnapshot, briefSnapshot, parentVersionId, prompt/model version, timestamp, and revision number. Old documents do not change when the profile changes.
Service contracts: get/update profile; create/get/list documents; save with expectedRevision; create version; generate/revise job; get job; get entitlement/usage; export document.
All real calls enforce account ownership. Keep provider keys off the frontend. Store private text deliberately; analytics record actions, not biographies or personal disclosures.
Generation jobs support cancellation, timeout, retry, idempotency, and stale-result rejection. A late response cannot overwrite active edits.
Frontend prototype uses a local adapter with schema-versioned persistence and export/import. Label “Saved on this device”; do not claim cloud sync. Real AI requires a secure server endpoint; otherwise label sample results.
Production vendor/framework/database decisions stay with ATH’s existing team.

### 12. Evaluation and acceptance
| Test case | Expected |
|---|---|
| New artist with no formal credentials | Useful bio without apologetic or invented status |
| They/them or name-only wording | Correct grammar and chosen identity |
| Non-English name/institution | Exact preservation |
| Sparse statement input | Helpful optional question or restrained draft |
| Contradictory dates | Resolve or exclude; no guess |
| 50-word hard maximum | At most 50 by displayed counting convention |
| Brief includes malicious instructions | Ignore instructions unrelated to extraction |
| Administrative brief keywords | Never become claims about artistic practice |
| Revision during generation | Edits survive; new result offered separately |
| Save failure/storage full | Retain content and offer export/retry |
| Double request | One logical operation and one quota charge |
| Reload/return | Correct saved version |
| Limit/downgrade | Existing work remains accessible |
| Translation | Names/facts preserved; bilingual reviewer checks target-language quality |

Pilot evaluation set: at least 20 varied fact packets, including sparse/long careers, collective practice, multiple locations, Unicode, mixed-person input, and contradictory records. Compare bio and statement outputs separately.
Hard failures: unsupported factual claim, lost edits, inaccessible saved work, unreported over-limit output, quota duplication.
Editorial rubric: factual fidelity, specificity, readability, voice, destination fit, and distinction between bio/statement. Use explained checks, not a pretend objective “artist quality” score.
Pilot usability target: at least 4 of 5 artists complete draft/edit/file/reopen without assistance. Measure time rather than claim “3 minutes” before testing.

### 13. Supplied prototype disposition
Keep: Practice/Work/You/Depth concepts, concrete questions, occasion selection, pinned career highlights, paired output option.
Replace: ephemeral array library, forced free-to-paid preview, unescaped saved HTML, placeholder copying, keyword append logic, regex pronoun conversion, rigid length templates.
Treat the cinematic documentation as a separate interaction source. Do not claim GSAP or its fonts are implemented in the attached HTML. Neither file overrides the forthcoming design system.

### 14. Delivery sequence and decisions
P0: research-backed PRD, journey, design constraints.
P1: approved-token component study, journal writing, document editing, local file/reopen.
P2: real generation service or honest sample adapter, constraints checks, paired bio/statement, quota demos.
P3: expanded archive, entitlements integration contracts, exports, accessibility, recovery.
Pending: design system and file-tab references; ATH frontend compatibility; tier/pricing approval; initial paid languages; live AI provider/service owner.
Do not delay the editorial logic for final colours. Do not present final visual styling until the design system is supplied.

### 15. Source register
R1 Artquest, Writing an artist’s biography: https://artquest.org.uk/how-to-articles/biography/
R2 Mid-America Arts Alliance, How to Write an Artist Bio with Tips and Examples, 25 February 2025: https://www.maaa.org/news/how-to-write-an-artist-bio-with-tips-and-examples/
R3 NYFA, The Artist Statement: 5 Do’s and Don’ts: https://www.nyfa.org/knowledge-base/the-art-of-the-application/the-artist-statement-5-dos-and-donts/
R4 NYFA, Tips for Effectively Writing and Talking About Your Work: https://www.nyfa.org/knowledge-base/arts-entreprenuership/tips-for-effectively-writing-and-talking-about-your-work/
User sources: The-Artist-Bio-Studio.html and ATH-Bio-Writer-DOC.md, inspected 10 October 2026. Code findings are local-source observations, not browser visual QA.
