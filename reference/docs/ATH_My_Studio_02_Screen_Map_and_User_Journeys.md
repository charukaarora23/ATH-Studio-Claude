# ATH My Studio: Journal-to-file experience
## Screen map and behaviour specification v0.2
10 October 2026 | Proposed original experience; no final visual styling

### 1. Core interaction
Open a labelled file tab. Take out a journal. Add thoughts across a small sequence of pages. Review a finished document. Name it and file it. Return later to that exact document.
“Offline feeling” describes the sensory design, not guaranteed offline AI or cloud access.
A document has one stable identity across its representations. Moving visually from journal to file must not create duplicate records.

### 2. Screen and state map
| ID | View | Purpose | Primary action |
|---|---|---|---|
| ST01 | My Studio files | Bio, statement, future tools; recent documents | Open tool or resume |
| ST02 | File contents | Existing documents and new document entry | New / open |
| ST03 | Journal cover / brief | Document type, purpose, limit, start method | Begin |
| ST04 | Journal pages | Guided questions grouped by meaning | Continue / skip optional |
| ST05 | Fact review | Confirm imported/extracted facts, choose highlights | Draft |
| ST06 | Draft page | Editable result, actual length, issues | Edit / revise |
| ST07 | Revision comparison | Current and proposed wording | Accept / keep current |
| ST08 | Filing panel | Name, destination, save status | File |
| ST09 | Reopened document | Text, source brief, versions, export | Continue / adapt |
| ST10 | Usage panel | Allowances and optional upgrade | Continue available work |
| ST11 | Preferences | Sound, motion, local backup/import | Apply |

These can share routes/components. No new full ATH navigation is prescribed.

### 3. First-use journey
ST01 → ST02 → ST03 → ST04 → ST05 → ST06 → ST08 → ST02.
Purpose is asked before a long interview. Offer “General bio”, “Website”, “Gallery”, “Application”, “Press”, and “Other”; preserve document type separately.
Journal pages use clear functional titles: Your practice; Your work; Your background; The thinking. Different tools use a relevant subset.
Show progress as meaningful page groups, not a misleading percentage of required labour.
Optional questions say why they help. “Skip for now” remains available.
A live preview can show a restrained excerpt; do not continuously rewrite the final document while the artist is composing answers.

### 4. Returning journey
Open file → select named page/document → review → edit or create a version.
Resume where the artist stopped without replaying an introduction.
A changed profile produces an optional “Use updated details” action. Existing text remains unchanged until accepted.
“Adapt for another purpose” duplicates a version/brief, not the entire source profile.

### 5. Interaction contracts
| Action | Material response | Functional condition |
|---|---|---|
| Open file | Tab moves and pages become available | Route and focus update |
| Enter journal | Cover/page transition | Inputs available without waiting |
| Turn page | Small page transition with visible next/back controls | Save draft inputs; never hide long content |
| Generate | Honest working state on result page | Real job or explicitly labelled sample |
| Review | Clean editable page | Text selectable; corrections accessible |
| File | Page joins selected file | Animate only after persistence succeeds |
| Mark saved | Subtle date/status mark | “Saved on this device” or confirmed cloud state |
| Reopen | Selected page expands | Restore correct document and cursor where practical |

Stamp treatment is a status/date mark, not an “ATH verified” quality seal. It must not imply institutional approval of the artist.

### 6. Sound
User-controlled, default off; offer unobtrusive “Studio sounds” preference.
Candidate events: one page-turn sound, one filing sound, one brief save-mark sound.
No sound on every keystroke, mouse move, hover, or regeneration token. No background loop or autoplay.
Start audio only following permitted user interaction; failure is silent. Remember the preference. Every audible cue has a visual equivalent.
Use owned/licensed samples and a small asset budget; mobile performance and quiet environments take priority.

### 7. Mobile and keyboard
Desktop may show an open spread. Mobile shows one readable page with labelled tabs and next/back controls.
Swiping is optional; no gesture-only navigation. Do not hijack browser back gestures.
Keep editor controls accessible above the phone keyboard without obscuring the active line.
Keyboard users can select tabs, advance pages, edit, revise, file, and reopen. Move focus to the new page heading where appropriate.
Reduced motion replaces page turns with simple transitions. It does not remove status feedback.
Long text scrolls naturally inside the page flow; never force it into a fixed simulated paper rectangle.

### 8. State coverage
Required: empty file, populated file, unfinished journal, generating, result, dirty edit, saving, saved, failed save, over-limit text, expired request, stale generation, quota exhausted, no search result, missing record.
Save failures keep text visible and offer download. A failed generation keeps answers and the prior result.
Paid controls explain entitlement before consuming work. No automatic demo upgrade when the user exceeds a limit.
Deleting asks about the named item and provides recovery behaviour. Opening an example must not overwrite live inputs.

### 9. Example page prompts
Bio: “What are you preparing this for?”; “How would you describe what you make?”; “What is one detail that makes your work specific?”; “Which parts of your background belong in this version?”
Statement: “Describe one work or series”; “What keeps bringing you back to this subject?”; “Why do you make it this way?”; “What should a reader understand that the image alone may not explain?”
Do not force artists to write literary answers. Notes and fragments are accepted.
Page copy is draft wording, to be reconciled with ATH’s design and voice system.

### 10. Review evidence
First prototype must demonstrate:
- One file opening into the bio journal.
- A quick interview and manual document editing.
- Filing and reopening with persistent local data.
- A phone layout using the same interaction language.
- Muted and reduced-motion modes.
- Save failure and over-limit cases.
Test with real tasks and realistic content before expanding all tools.

### 11. Handover boundary
Frontend owns presentation and interaction states. Storage/generation/entitlement adapters expose real success/failure and version identifiers.
Developers receive the event/state contracts, source code, asset licences, setup instructions, tested workflows, and list of simulated services.
No final fonts, colours, spacing scale, textures, or shadows are specified here. Those come from the supplied design system and approved references.
