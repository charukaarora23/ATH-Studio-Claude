# ATH Creative Director Agent — PRD

Oct 12, 2026 · @Charuka

> This is a snapshot of the live, editable PRD: https://claude.ai/code/artifact/f8524439-d613-48c0-8e9e-f45731fdcc3f. The live version has the diagrams and the latest edits.


## Problem and goals

ATH needs a creative director it doesn't have: an agent that owns how every open call, article, artist feature and engagement post looks, reads and sells, so the feed stops looking haywired and starts converting.

**What goes wrong today**

- Each open call is designed from scratch, so carousels, titles and colours change from call to call and from post to post.
- No one decides *why* a post exists (awareness, urgency, trust, entries) before it gets designed, so the copy and layout don't drive a clear action.
- Artwork gets crowded by text, effects and mixed type. The work should lead every frame.
- There's no planned feed. Posts are judged one at a time, never as a grid or a sequence.
- Performance data (reach, saves, shares, comments, entries) sits in Instagram and never feeds back into what we make next.

**Goals**

1. **Cohesion:** every asset is built from the ATH design system and a fixed template family, so the feed reads as one luxury editorial brand.
2. **Conversion:** every open call post has one job and one call to action, and moves people from seeing it to submitting.
3. **Shareability:** design and write for saves and shares (checklists, deadlines, prize details, artist stories), not just likes.
4. **Intelligence:** the agent pulls ATH's Instagram history and live numbers, learns what works and uses that in every brief.
5. **Leverage:** the agent acts as head of the creative team. It writes briefs, produces drafts and checks them against the brand. People approve the work and publish it.

**Non-goals for v1:** paid ads management, auto-publishing without human approval, and designing new logos. Logos plug in once they're final.

## The agent: ATH Creative Director

The agent works as ATH's creative director and head of brand. It starts every asset from a strategy (who it's for, why it exists, what it should make people do), then turns that strategy into art direction, typography, copy and a slot in the feed.

**Skills it combines**

| Discipline | What the agent does |
| --- | --- |
| Art direction | Chooses the hero image, crop and composition, and lets the artwork lead every frame |
| Brand and identity | Enforces the palette, type, logo use, spacing and template family. Flags anything off-brand |
| Typography | Sets the title hierarchy: one display line, one support line, a short CTA. No mixed fonts or effects |
| UI/UX | Designs swipe flow in carousels, story sequences, link-in-bio pages, ManyChat message UX and landing pages so every step is clear and easy to tap |
| Content strategy | Decides what to post, when and why, across professional, real, engagement and conversion content, day to day and month to month |
| Trends and virality | Reads Gen Z formats, hooks, sounds and memes, and adapts them so they fit a luxury editorial brand |
| Storytelling | Turns calls, articles and artist stories into a narrative across carousel slides and reels |
| Copywriting | Writes headlines, carousel text, captions, hooks, CTAs, DM scripts and hashtags in the ATH voice |
| Sales and marketing psychology | Matches each post to a funnel stage and a persuasion lever (aspiration, social proof, scarcity, urgency, clarity) |
| Funnels and lead strategy | Designs a funnel for every service, from first post to lead to sale, and segments leads into the right one |
| Marketing automation | Plans ManyChat keywords, flows, tags and follow-ups, and writes the copy for them |
| Feed planning | Plans the grid and the posting sequence across accounts so the whole network reads as one |
| Analytics | Reads performance, comments, DMs and leads, and says what to repeat, fix or stop |
| Team coaching | Gives each team member clear briefs, ready-to-use prompts and the reason behind every task |

**What it decides vs. what people approve**

- **The agent decides:** brief, template choice, layout, colour block, copy drafts, posting slot, and pass/fail on the brand check.
- **People approve:** final visuals, any claim about prizes, fees or dates, artist consent to be featured, and every publish.
- **The agent never** invents facts (prizes, jurors, deadlines), edits an artwork itself (it crops only), or posts without sign-off.

**How it works with the team:** the designer, the poster and the reels person each get a clear brief from the agent and send drafts back to it for review. It also keeps the open call calendar and the feed plan.

## Brand inputs

The agent works from a versioned **Brand Kit** that's loaded before any task. When the brand changes (for example when the new logos land), the kit gets a new version and every template updates from it.

**What goes into the kit**

| Input | Current state | Source |
| --- | --- | --- |
| Colour palette | Burgundy #6A0620, Chilli #AA0003, Petrol #025054, Orange #DD4E28, Cocoa #4C4240, Peony #FAD2E1, Ballet #FFD6DE, Hot Rose #FFA1C2, Pistachio #D0D996, Lemon #FFF3B2, Cool Blue #B7D9FF, Sand #EAD6CB, Cream #F9ECE5, Paper #FBF6EF, Ink #2A0A12 | ATH brand guide v24 |
| Approved colour pairings | e.g. Petrol with Pistachio type, Burgundy with Peony. The full pair list needs extracting from the guide | ATH brand guide v24 |
| Typography | Nord (display and statements), Proxima Nova (interface and body), Newsreader (editorial serif). Both Nord and Proxima Nova need a licence before use | ATH brand guide v24 |
| Logos | Pending. New logos are in progress | To add once final |
| Rules | Gradients only on headlines. Radii 4/12/20/pill | ATH brand guide v24 |
| Voice and tone | To write: warm, expert, artist-first, never hype | Workshop with Rabia |
| Photo and artwork rules | To write: crop ratios, no filters on artwork, credit format | This PRD → kit |
| Past best posts | Pulled automatically from Instagram (see Insights) | Instagram API |

**Rules the agent enforces on every asset**

1. Only kit colours, only approved pairings, at most 2 brand colours plus Paper or Ink per slide.
2. At most two typefaces per asset, a fixed type scale and no outlines, shadows or warped text.
3. The artwork takes at least 60% of the frame on image-led posts. It's never covered by text and never recoloured.
4. The logo always appears in the same place at the same size, from the template.
5. Every slide has an artist credit (name, title, medium, year) whenever artwork appears.
6. One idea and one CTA per post.

## Dashboard structure

The agent dashboard has one tab per content type, plus three shared views: the feed, insights and the brand.

| Tab | What lives here | Main actions | Phase |
| --- | --- | --- | --- |
| **Post Studio** | Start any post: brief intake, reference review, proposed structure and design details | Answer the brief, upload references, generate draft, save as template | 1 |
| **Open Calls** | One workspace per call: brief, colour block, the full post sequence from launch to winners, entry numbers | Create call, generate sequence, review drafts, approve, schedule | 1 |
| **Templates** | Saved templates with versions, slots, locked rules and a performance scorecard | Reuse, refresh or retire a template | 1 |
| **Feed Planner** | 9 to 12 week grid preview, calendar, content mix meter | Drag to reorder, check grid cohesion, fill gaps | 1 |
| **Brand Health** | Feed consistency score and trend, per-post brand scores, template adoption, off-brand flags | Spot drift, open the off-brand post, fix the template | 1 |
| **Insights** | Every post and reel with reach, saves, shares, comments, profile visits and link clicks, plus what the agent concludes from them | Ask why a post worked, compare calls, export a report | 1 |
| **Brand Kit** | Palette, type, logos, templates, voice and rules, all versioned | Update kit, preview templates | 1 |
| **Articles** | Article to carousel, quote cards and teaser reel scripts | Paste an article link, generate post set | 2 |
| **Artist Features** | Clean, image-led artist spotlights | Upload artwork and bio, generate feature | 2 |
| **Engagement Posts** | Questions, polls, prompts, community reposts, behind the scenes | Generate ideas, schedule fillers | 2 |

Every item in every tab carries the same card: **purpose · audience · funnel stage · lever · CTA · status · scheduled slot**. The agent's reasoning is always visible, not just the output.

## Dashboard experience: visual, role-based, fun to use

The dashboard should feel like a game board, not a report. Every screen leads with a picture of the numbers and one obvious next action. Text only appears when someone asks for it.

> **Diagram: home screen wireframe · Today view, sample numbers.** View it in the [live PRD](https://claude.ai/code/artifact/f8524439-d613-48c0-8e9e-f45731fdcc3f).

Each person lands on their own **Today** view: their numbers, their tasks with one button each, the live open call goal, and an "ask the agent" bar.

### UX principles

1. **Visual first:** every number is a tile, bar, gauge or chart. Reports become a chart plus 3 bullets, and the full reasoning sits behind a "Why?" link.
2. **One card, one action:** every card ends in a clear button: Approve, Fix, Post now, Reply, Make this reel, Save as template.
3. **Five-second rule:** anyone can tell how things are going in 5 seconds. Colour shows status, and arrows show change since last week.
4. **Images over rows:** posts, templates and drafts appear as thumbnails and grid previews, not lists.
5. **Phone-ready:** approving, replying and checking numbers all work on a phone.
6. **On-brand:** the tool uses ATH's own palette, type and Paper background, so it models the brand it protects.
7. **Ask anywhere:** a chat bar on every screen. Questions get answered with a chart and a suggested action, not an essay.
8. **Coaching inline:** the agent's tips appear as small cards next to the work ("This hook runs 3 seconds; try one of these").

### Visual building blocks

| Component | Shows | Where |
| --- | --- | --- |
| KPI tile + sparkline | Reach, saves, leads, entries, brand score vs. last week | Today, Insights |
| Goal bar | Entries or leads against the target for a live campaign | Today, Open Calls |
| Countdown ring | Days to each deadline | Open Calls, Feed Planner |
| Funnel chart | Reach, then clicks, then leads, then entries, with drop-off | Open Calls, Strategy |
| Ranked bars | Best posts, templates, hooks, accounts | Insights, Templates |
| Grid preview | Next 9 to 12 posts as they'll look | Feed Planner |
| Brand gauge + trend | Consistency score over time | Brand Health |
| Heatmap | Best posting times per account | Insights |
| Network map | All accounts at a glance, coloured by health | Insights (founder view) |

### Logins and roles

Everyone signs in with their work Google account. Each person has a profile, a role and a list of the accounts they can see.

| Role | Sees | Can do |
| --- | --- | --- |
| **Founder / admin** | Everything, all accounts, team activity | Final approval, Brand Kit, users and roles, settings |
| **Designer** | Post Studio, Templates, Brand Health, assigned briefs | Upload drafts, propose templates (admin approves) |
| **Poster / community** | Feed Planner, scheduled posts, DM and comment queue | Schedule approved posts, reply, flag questions |
| **Reels maker** | Reel briefs, scripts, hook library, reel results | Upload reels, mark shots done |
| **Viewer** | Reports only | Comment |

- **Activity log:** who created, edited, approved and posted what, and when. Avatars show on every card.
- **Notifications:** new tasks, approvals waiting, deadlines and wins, in the app and by email (WhatsApp or Slack to confirm).

### Gamification: light, never gimmicky

- **Streaks:** posting consistency per account, and on-time delivery per person.
- **Badges:** First-draft pass, Zero off-brand week, Hook master (a reel that beats the watch-time average), Save magnet.
- **Team goal bars:** for example, entries for the current call. The bar fills live and celebrates when the target is hit.
- **Weekly Wrapped:** a 30-second visual recap of the team's best post, biggest win and one thing to try next week.
- **Rewards outcomes, not volume:** leaderboards rank posts and templates by results. People see their own stats privately, and the team competes against its goals, not against each other, so nobody games the numbers.

## Open Calls module (Phase 1)

Each open call becomes a campaign. It gets one brief, one colour block and one template family, and the agent produces a planned sequence of posts from teaser to winners. Each post has its own job and its own persuasion lever, but it's obvious every post belongs to the same call.

### 1. Call brief (entered once)

Theme, eligibility, fee, prizes, jurors, key dates, entry link, hero artworks with credits, target entries, and past results for similar calls. The agent won't generate anything until the facts are complete and approved, because every date and prize in a post comes from this brief.

### 2. Colour block system

- Each call gets **one approved pairing** from the Brand Kit, such as Petrol + Pistachio. Every post for that call uses it, so the audience recognises the call at a glance.
- Calls running at the same time must use clearly different pairings. The Feed Planner warns you about clashes.
- The agent suggests a pairing from the call's mood (for example, prestige and legacy point to Burgundy + Peony, and fresh and emerging talent point to Petrol + Pistachio) and explains the choice. A person confirms it.
- The colour is a frame, not a fill. It goes in bands, panels and type colour, and the artwork stays untouched.

### 3. Title system

Every call title uses the same formula so the feed reads like an editorial series:

- **Eyebrow:** OPEN CALL · No. 07 (running number, Proxima caps)
- **Title:** the call name, 2 to 5 words, Nord
- **Status line:** Now open / 30 days left / Closes Friday / Closed / Winners
- **Footer:** logo + handle, in the fixed position

### 4. Post sequence

The launch post opens the call. After that, a reminder goes out every 30 days, each one on a new angle. Once the deadline is 30 days away, posts get closer together.

| Stage | Timing | Job | Lever | Format | CTA |
| --- | --- | --- | --- | --- | --- |
| Teaser | 3 to 7 days before launch | Build anticipation | Curiosity | Single image + story countdown | Turn on notifications |
| Launch | Day 0 | Announce the call clearly | Aspiration + clarity | 7 to 8 slide carousel + reel | Apply via link in bio |
| Monthly reminder 1 | Launch + 30 days | Show what you win | Value | Carousel: prizes and exposure | Save for later |
| Monthly reminder 2 | Launch + 60 days | Build trust | Social proof | Past winners, testimonials | Apply |
| Monthly reminder 3+ | Every 30 days | Remove doubts | Authority + clarity | Juror spotlight, FAQ, how to apply | Apply / DM keyword |
| Final 30 days | Weekly | Create momentum | Social proof + urgency | Entry count, artwork previews | Apply |
| Final week | 7 days, 72 hours and 24 hours before | Convert late deciders | Scarcity + urgency | Countdown slides, stories, story stickers | Apply today |
| Closed | Deadline + 1 day | Thank entrants, keep trust | Belonging | Single post | Follow for results |
| Winners | Results date | Celebrate and recruit for the next call | Social proof + aspiration | Carousel + artist features | Join next call |

### 5. Launch carousel anatomy (template)

1. **Hook:** hero artwork, eyebrow, title, status line, colour band
2. **The invitation:** why this call exists, in 1 to 2 sentences
3. **What you get:** prizes and exposure, in 3 bullets max
4. **Who can apply:** eligibility, medium, fee
5. **Jurors:** portraits + one line each
6. **Key dates:** a clear timeline
7. **How to apply:** 3 steps
8. **Save and share:** CTA slide built to be saved

Every reminder reuses slides 1 and 8 and changes the middle to suit its job. That's what makes the sequence consistent without repeating itself.

### 6. Why each post exists

For every post, the agent writes a short rationale shown on the card. For example: *Reminder 2. People who saw the launch but didn't apply often doubt they're good enough. Showing three past winners with different backgrounds lowers that barrier. Success = entry link clicks and saves.*

## Other content modules (Phase 2)

These use the same engine as Open Calls (brief, purpose, lever, template, brand check) with their own templates.

**Articles to posts**

- Input: an article link or text. The agent pulls out the strongest idea, 3 to 5 key points and one quotable line.
- Output: an editorial carousel (cover headline + key points + read-more slide), a quote card and a 20 to 30 second reel script.
- Psychology: posts that teach or explain get saved, so the agent writes them as takeaways people want to keep, not summaries.

**Artist features**

- Clean and image-led: full-bleed artwork on Paper, with small type, the credit line and a quiet brand mark. No colour blocks over the art.
- Structure: 1. artwork, 2. artist portrait or studio shot, 3. 2 to 3 more works, 4. a quote from the artist, 5. credit + where to see more.
- The agent writes from the artist's own words and submitted bio only. The artist's consent and image rights are tracked as a required checkbox before scheduling.
- Shareability: tag the artist and design a story version they can repost.

**Engagement posts**

- Questions, this-or-that, prompts ("show us your studio"), community reposts, behind the scenes.
- They fill quiet days between calls, warm up the audience before a launch and bring in comments the algorithm rewards.
- They use a lighter version of the templates (more Paper, one accent colour) so they don't compete with call posts in the grid.

## Post Studio: from brief to reusable template

Post Studio is where any new post starts. The agent asks what the post is and why it exists, reviews your reference images against the brand, proposes a structure, and lets you save the result as a template. When that template appears in the feed, the agent finds it there and reports how it performed.

> **Diagram: Post Studio loop · brief to template to performance.** View it in the [live PRD](https://claude.ai/code/artifact/f8524439-d613-48c0-8e9e-f45731fdcc3f).

Each template that performs well gets suggested first next time. That way the system gets more consistent and more effective with every post.

### 1. Brief intake: what the agent asks

| Question | Examples / options | Required |
| --- | --- | --- |
| What is this post? | Open call, article, artist feature, engagement, personal or behind the scenes, announcement | Yes |
| Details | Title, key facts, dates, prizes, links, names | Yes |
| What it's for | Awareness, entries, trust, saves, comments, community. Plus the one CTA | Yes |
| Format | Single post, carousel (number of slides), reel cover, story | Yes |
| Artworks | Uploads + artist, title, medium, year + consent to feature | If art is shown |
| Personal or team photos | Studio, events, founder, behind the scenes | Optional |
| Reference images | Uploads or links, with a note on what you like in each | Optional |
| Context | Linked call or article, audience, posting date, anything to avoid | Optional |

The agent only follows up on missing required facts. It never fills those gaps with guesses.

### 2. Reference image review

For every reference you upload, the agent writes a short critique:

- **What to take:** layout, crop, type hierarchy, white space, colour proportions, image-to-text ratio.
- **What clashes with ATH:** e.g. script font, gradient behind body text, text over the artwork, too many colours.
- **How it translates:** the same idea rebuilt with ATH's palette, type and grid.
- **Brand fit score:** 1 to 10, so you can see at a glance which references suit us.

### 3. Proposed design

The agent returns a buildable brief, not just ideas:

- **Structure:** slide-by-slide (or a single layout) with the job of each slide.
- **Wireframe:** where the image, title, body, CTA and logo sit, plus the crop ratio (e.g. 4:5).
- **Design details:** colour pairing, type sizes, grid, spacing, artwork share of the frame.
- **Copy draft:** headline, slide text, caption, hashtags.
- **2 to 3 references:** chosen from your uploads and from ATH's best-performing past posts, each with the reason it was picked.
- **Features it can add:** e.g. a countdown slide, a save-this checklist, an artist quote card, a story repost version.
- **Brand check score** before anything is built. Then one click generates the draft in Canva or Figma.

### 4. Save as template

Any approved design can be saved to the **Templates** library with a name, content type, editable slots (image, title, body, CTA), locked brand rules and the reasoning behind it. Templates are versioned, so an improved version doesn't break the history of the old one.

### 5. Recognising templates in the feed

- Posts made in Post Studio carry their template ID, which gets linked to the Instagram post ID when it's published.
- For posts published by hand, the daily sync matches the live post to the approved draft by image and caption. If the match is uncertain, the agent asks someone to confirm.
- Posts made outside the system are scored too, and flagged if they're off-brand.

**Template scorecard:** times used, average reach, saves and shares per 1,000 reach, link clicks, average brand score and trend. The agent labels each template **keep**, **refresh** or **retire**.

### 6. Brand Health dashboard

A live view of where the brand is heading:

- **Feed consistency score:** the last 9 and last 30 posts, scored against the kit, with the trend week by week.
- **Per-post brand score** for every live post, including ones made outside the agent.
- **Template adoption:** the share of posts built from templates.
- **Off-brand flags:** what broke, how often and in which content type.
- **Performance by template and by content type,** so taste and results are judged together.

## Feed planning and communication strategy

The agent plans the feed as one editorial page. Before anything is scheduled, it checks the grid as a whole, the content mix and the messages that go with it.

**Grid rules**

- Preview the next 9 to 12 posts in a 3-column grid, alongside the 9 already live.
- Alternate busy and quiet posts: a colour-block call post sits next to image-led features or Paper-based posts.
- Never put two colour-block posts from different calls next to each other.
- Reels covers use the same title system so they sit cleanly in the grid.

**Starting content mix (tuned later from Insights)**

| Content type | Share of feed posts | Main goal |
| --- | --- | --- |
| Open calls | \~35% | Entries |
| Artist features | \~30% | Trust, shares, community |
| Articles and education | \~20% | Saves, authority |
| Engagement posts | \~15% | Comments, reach |

**Communication map:** the planner tags each week with what the audience needs to hear ("a new call is open", "look who we champion", "here's how to get selected") so no single message gets repeated until people tune out.

**Cadence:** the agent proposes a weekly rhythm (for example 4 feed posts + daily stories) and fits each open call's sequence into it automatically, moving other content around call deadlines.

## Strategy engine: content, funnels, leads and coaching

The agent is the senior strategist the team doesn't have. It decides what content to make and why, moves people from a post into the right service funnel, runs the logic behind ManyChat, and gives every team member a ready brief and prompt so the work lands without senior skills in the room.

> **Diagram: lead funnel · content to ManyChat to segmented service funnels.** View it in the [live PRD](https://claude.ai/code/artifact/f8524439-d613-48c0-8e9e-f45731fdcc3f).

Every service ATH offers gets its own funnel. Content creates interest, ManyChat captures and qualifies the lead, and tags send each person into the funnel that matches what they want.

### 1. Content strategy: day to day, month to month

The agent balances four kinds of content and moves people through them:

| Content job | What it looks like | What it does |
| --- | --- | --- |
| **Professional** | Editorial carousels, juror and curator pieces, articles, results | Authority and trust. Makes ATH the place serious artists apply |
| **Real** | Behind the scenes, founder voice, studio visits, team moments | Relatability. Makes people like the people behind ATH |
| **Engagement** | Trends, questions, polls, this-or-that, community reposts | Reach and comments. Grows the top of the funnel |
| **Conversion** | Open call launches, deadlines, offers, keyword CTAs | Leads, entries and sales |

- **Daily rhythm:** a "today" plan per account (feed, stories, reels, replies) tied to the month's goals and the live deadlines.
- **Content moves:** one strong idea becomes a reel, a carousel, a story set, an email and a Pinterest pin. The agent plans the cut-downs, so nothing is made once and forgotten.

### 2. Gen Z virality, luxury polish

- **Trend radar:** the agent tracks rising formats, hooks, sounds and memes in art and creator culture, and keeps a weekly shortlist.
- **Brand filter:** every trend gets checked with "does this fit ATH?" If it does, it's rebuilt in ATH type, colour and tone, so it's fast and native but never cheap.
- **Hook library:** tested first lines and first frames, scored by watch time and saves, and reused in briefs.
- **Reel scripts:** hook in the first 1 to 2 seconds, shot list, on-screen text, caption and CTA, written for the reels maker to shoot.

### 3. Funnels for every service

Each service gets a **Funnel** record in the Knowledge Hub that the agent designs and maintains:

| Funnel part | Example (open call) |
| --- | --- |
| Entry content | Launch reel + carousel |
| Lead magnet | "Comment APPLY for the full brief and a checklist" |
| ManyChat keyword and questions | APPLY, then "What medium do you work in?" and "First open call with us?" |
| Tags and segment | interest: open-call · stage: warm · medium: painting |
| Nurture | DM reminder at 30 days, 7 days and 48 hours, plus a launch email sequence |
| Conversion | Entry submitted |
| After | Thank you, then results, then the next call or membership offer |

### 4. ManyChat and lead segmentation

- **Keywords per post:** each conversion post gets a unique keyword, so leads can be traced to the exact post, template and account.
- **Qualifying questions:** one or two short questions in the DM to tag interest, artist level, medium and location.
- **Segments:** by service interest, funnel stage (cold, warm, hot, customer), artist profile and source account.
- **Flows the agent writes:** welcome, qualify, deliver, remind, convert, win back. The copy is ready to paste, and the agent includes a flow diagram for whoever builds it in ManyChat.
- **Re-engagement:** finds cold segments and proposes broadcasts and content to warm them up, within Instagram's messaging rules.
- **Maturity path:** starts with simple keyword-to-link flows, then adds questions and tags, then multi-step nurture tied to email.

### 5. Strategy room: coaching the team

Because the team doesn't have senior strategy, design or copy skills, the agent coaches as it goes:

- **Weekly strategy memo:** what's working, what to change, priorities for the week, explained in plain words.
- **Role briefs:** the designer gets layout specs and references, the poster gets copy, timing and replies to handle, the reels maker gets a script and shot list.
- **Prompt library:** ready-made prompts the team can use with the agent ("Turn this article into a carousel", "Write 5 hooks for this artwork", "Build a ManyChat flow for this offer").
- **Why, every time:** each task says what it's for and how success will be measured, so the team builds judgment, not just output.
- **Review and feedback:** the agent scores drafts and explains what to fix and why, the way a creative director would.

## Instagram data and insights

The agent pulls ATH's full Instagram history and keeps it updated, so every brief starts from what has actually worked. This is what makes it the head of the team and not just a template tool.

**What it pulls (through the official Instagram Graph API on each of ATH's 15 to 20 Business accounts)**

- Every post, carousel and reel: media, caption, hashtags, posting time and format.
- Per-post numbers: reach, views, likes, comments, saves, shares, profile visits, follows and reel watch metrics.
- Comment text and replies, for sentiment, recurring questions ("is it free?", "can students apply?") and objections.
- Account level: follower growth, audience demographics and active hours.
- Downstream: entry link clicks (UTM-tagged per post) and submissions per call from the entry platform. Without this, we can't connect a post to entries.

**What it does with the data**

1. **Tags every post** by type, call, stage, lever, colour block, template and hook, so results can be compared fairly.
2. **Finds patterns:** which hooks, colours, formats and posting times drive saves, shares and entries. Results are shown per stage, because a launch and a final-week post have different jobs.
3. **Writes a weekly creative review:** what worked, what didn't, what to change in next week's briefs, plus questions from comments that a future post should answer.
4. **Does open call post-mortems:** entries over time against each post, cost per entry if ads ran, and recommendations for the next call.
5. **Answers questions in plain words**, like "Why did the Women in Arts launch outperform?"

**Constraints:** Meta's API needs a Business or Creator account linked to a Facebook Page and an approved app. Some metrics only cover recent periods, so the agent stores a snapshot every day to build its own long-term history. Competitor accounts are limited to public data.

## Quality gates and workflow

Every asset goes through two gates: the agent's own brand and strategy check, then a person's sign-off. The results feed back into the next brief.

> **Diagram: content workflow · 2 gates, 2 loops back to the draft.** View it in the [live PRD](https://claude.ai/code/artifact/f8524439-d613-48c0-8e9e-f45731fdcc3f).

A draft that breaks a rule goes back to the agent automatically. Only drafts that pass reach the team.

**Brand check (scored by the agent, shown on the card)**

- **Brand fidelity:** palette, pairings, type scale, logo position, spacing grid. All must pass.
- **Art first:** the artwork's share of the frame, no text over the work, credit present.
- **Clarity:** one idea and one CTA, and the title readable in under 2 seconds at grid size.
- **Facts:** every date, prize, fee and name matches the approved call brief.
- **Strategy fit:** the stated job, lever and audience match the copy and layout.
- **Feed fit:** no clash with the posts next to it in the grid.
- **Shareability:** a save or share reason is present (checklist, dates, story, takeaway).

Statuses: Draft → In review → Changes requested → Approved → Scheduled → Live → Reviewed.

## Success metrics

Success means more entries per open call from a feed that looks like one brand, with less back-and-forth for the team. Baselines come from the first Insights pull. The targets below are placeholders to confirm once we have that baseline.

| Metric | Measures | Target (to confirm) |
| --- | --- | --- |
| Entries per open call | Conversion | +25% vs. last 3 calls' average |
| Entry link clicks per 1,000 reach | Conversion | +30% |
| Saves + shares per 1,000 reach | Shareability | +40% on carousels |
| Brand check pass rate on first draft | Cohesion | ≥ 80% by month 3 |
| Posts published that skipped the agent | Cohesion | 0 for open calls |
| Time from call brief to full approved sequence | Team efficiency | ≤ 2 working days |
| Rounds of revision per post | Team efficiency | ≤ 1.5 average |
| Follower growth during an open call | Awareness | Tracked; no target in v1 |

## Knowledge Hub: how the agent knows ATH

The agent never works from memory. Everything it knows about ATH lives in one Knowledge Hub, in two parts. **Records** hold the facts that have to be exact: programs, deadlines, fees, launches. The **page library** holds every post caption, web page and key document so the agent can search them. Before each brief, the agent pulls a context pack from the hub.

> **Diagram: Knowledge Hub · 4 sources, 1 hub, a context pack per brief.** View it in the [live PRD](https://claude.ai/code/artifact/f8524439-d613-48c0-8e9e-f45731fdcc3f).

Records are the source of truth for facts. Pages and documents give the agent background and ATH's own wording.

### What goes in: the records

| Record | What it holds | Fed by | Linked to |
| --- | --- | --- | --- |
| **Programs and services** | Name, what it is, who it's for, fee or price, page URL, status, owner, assigned colour pairing | Dashboard form, first filled in from the website | Calls, launches, posts, pages |
| **Calls and deadlines** | Open, close and results dates, prizes, jurors, eligibility, entry link | Open Calls tab | Program, posts, entries |
| **Launches** | New programs, books, products: launch date, offer, key messages, assets | "Add launch" form | Program, posts |
| **Events and dates** | Podcast episodes, exhibitions, talks, awareness days, holidays | Form or calendar sync | Posts, Feed Planner |
| **Artists** | Bio, works, credits, consent, links | Artist Features, call winners | Features, calls |
| **Articles** | Link, summary, key points | Articles tab or website sync | Posts, programs |
| **FAQs and objections** | Common questions and doubts, with approved answers | Website FAQ + questions pulled from comments | Programs, captions |
| **Audiences** | Who we speak to (emerging artists, collectors, partners) and what each needs to hear | Workshop, then Insights | Briefs, programs |

Brand Kit, templates, posts and metrics are already covered in the sections above. They live in the same database, so every post can be traced to a program, a call or a launch, and to a template.

**Programs to load first (to confirm):** Open Call for Artists, Women in Arts Network, the podcast, the books, My Studio, the Substack, plus any paid services or memberships.

### Channels and accounts: Instagram first

ATH runs 15 to 20 Instagram accounts. Each one gets an **Account** record in the hub, so the agent knows what every account is for before it plans or designs anything for it.

| Account field | What it holds |
| --- | --- |
| Handle and role | e.g. the main ATH account, an open call account, Women in Arts Network. What each one exists to do |
| Audience | Who follows it and what they need to hear |
| Programs it promotes | Linked program records, so a new call goes to the right accounts |
| Brand variant | Which kit pairing or sub-brand rules apply. Every account still sits inside the ATH system |
| Cadence and owner | Posts per week, stories, who approves and who posts |
| Connection | API access for that account (Business or Creator, linked to a Facebook Page) |

**How the accounts work together**

1. **Connect each account once.** The agent pulls every post, reel, caption, comment and metric for each one and syncs daily, as described under Instagram data and insights.
2. **Plan per account and across the network.** The Feed Planner shows each account's grid and a network calendar, so one launch gets coordinated across accounts instead of duplicated.
3. **Cross-promotion rules.** For each launch the agent decides which account leads, which ones use Instagram Collab posts or reshare to stories, and which stay quiet, so followers of several accounts don't see the same post five times.
4. **Compare accounts.** Insights and Brand Health report per account and network-wide, showing which accounts convert, which are drifting off-brand and which are under-posting.

**Later channels plug into the same hub:** Substack, Pinterest and email (Flodesk), then the website. Each new channel becomes another set of Account records with its own formats and templates, and reuses the same programs, deadlines, brand kit and context pack. V1 builds Instagram only.

### Websites: one site, many accounts

Websites are records of their own, linked **many to many** with accounts. One website can be the source for several Instagram accounts, and one account can point to more than one site.

- **Website record:** domain, owner, which programs it covers, which accounts use it, sync schedule.
- **Sync:** the agent reads the sitemap, splits every page into searchable passages with their URLs and re-syncs weekly (or on "Sync now"). Each page is tagged to a program, and a person confirms that once.
- **Shared, not copied:** a page is stored once and reused by every account linked to it, so a fix on the site updates the context for all of them.
- **Conflicts get flagged:** if a page and a record disagree (for example, two deadlines), the agent flags it and won't post either version until someone fixes it.
- **Documents too:** program decks, book briefs, media kits and partner documents link from Drive or Notion in the same way.

### Leads, messages and performance signals

Beyond posts, the agent picks up every signal that shows what people do after they see a post:

| Source | What the agent picks up | Used for |
| --- | --- | --- |
| **ManyChat** | Keyword triggers (e.g. "comment APPLY"), DM flows, subscribers, tags, links clicked inside the flow | Which posts start conversations, which keywords convert, CTA wording |
| **Instagram DMs and comments** | Message volume per post, common questions, sentiment, objections | FAQs, next posts that answer doubts, tone |
| **Leads** | New leads by source, account and post (from ManyChat, forms, link in bio) | Lead cost and quality per post and per template |
| **Email (Flodesk)** | Sign-ups by source, open and click rates for launch emails | Matching posts with emails, full-funnel view |
| **Entry platform** | Submissions per day, per UTM source | Real conversion per post |
| **Meta Ads** | Paid reach, spend, results for boosted posts | Separating organic results from paid ones |
| **Website analytics** | Visits and conversions from Instagram traffic | Which posts drive site visits |

**Core rates the agent tracks per post, template, account and campaign**

- **Engagement rate:** (likes + comments + saves + shares) ÷ reach.
- **Organic vs. paid:** reach and results split, so boosted posts don't inflate how well a design looks.
- **Conversation rate:** DMs and keyword triggers ÷ reach.
- **Lead rate and entry rate:** leads or entries ÷ link clicks, and ÷ reach.
- **Follower growth** per account during each campaign.

Every signal is tied back to the post, template, account and program it came from. That way the agent can say, for example, "the juror carousel on the open call account started 3x more DMs than the prize carousel" and adjust the next brief.

### How the agent uses it: the context pack

For every brief, plan or review, the agent pulls:

- The program record, plus the call or launch it's linked to.
- Every live deadline in the next 90 days, so posts don't clash and sequences fit around each other.
- The 3 to 5 most relevant passages from pages and documents.
- FAQs and objections for that program.
- Past posts for that program and how they performed.
- The Brand Kit and the best template for the job.

The pack appears on the card as **Sources used**, so anyone can check where a fact came from.

### Planning from the hub

- **Master calendar:** every deadline, launch and event in the hub appears on the calendar automatically.
- **Auto-reserved slots:** adding a new call or launch reserves its post sequence in the Feed Planner (e.g. launch, 30-day reminders, final week).
- **Proposals for new items:** when someone adds a program, book or launch, the agent proposes a content plan for it the same day.
- **Weekly look-ahead:** what's coming in the next 6 weeks and what needs to be made for it.

### Keeping it current

- **Add to Hub** button with short forms: Program, Call, Launch, Event, Artist, Article. Each takes about 2 minutes.
- Every record has an owner and a "last verified" date. The agent reminds the owner after 60 days, or when a date has passed.
- Finished programs are archived. They stay in the history for learning, but the agent stops promoting them.

**Build note:** one database (e.g. Postgres) holds the records and links. A search index over the same database (e.g. pgvector) holds the page library, so facts and pages can be queried together.

## Technical architecture

One Claude-based agent with six specialised skills sits between the dashboard, a knowledge layer it always reads from, and the outside tools it syncs with.

> **Diagram: system architecture · 4 layers.** View it in the [live PRD](https://claude.ai/code/artifact/f8524439-d613-48c0-8e9e-f45731fdcc3f).

The agent never designs freehand. It fills **locked templates** (Canva brand templates or Figma components built from the Brand Kit), so cohesion is guaranteed by the system rather than by taste on the day.

**Key build choices**

- **Model:** the latest Claude model for reasoning, copy and brand review (it also reads images, so it can judge drafts and past posts visually).
- **Templates first:** build the open call template family in Canva or Figma first, then let the agent autofill text, artwork and colour block through the API.
- **Data:** a small database (posts, metrics snapshots, comments, calls, briefs, assets) synced daily from the Instagram Graph API.
- **Human-in-the-loop:** nothing gets scheduled without an approval click. Every action is logged.

## Phased roadmap

Start with open calls, because that's where inconsistency costs entries. Prove the system on one live call, then extend it to the other content types.

> **Diagram: roadmap · 4 phases, 3 gates.** View it in the [live PRD](https://claude.ai/code/artifact/f8524439-d613-48c0-8e9e-f45731fdcc3f).

The Phase 1 pilot runs on the next open call, from launch to winners, so we can compare entries and saves against past calls.

## Next 30 days

Test the system on a real open call before building the full dashboard. Three steps, in order:

> **Diagram: next 30 days · proposed timeline.** View it in the [live PRD](https://claude.ai/code/artifact/f8524439-d613-48c0-8e9e-f45731fdcc3f).

1. **Get the numbers and inputs flowing.** Connect every Instagram account, ManyChat and the entry platform, then build a starting report per account from the last 12 months. "Outperforming" only means something against a starting number. Setup steps are in the next section.
2. **Lock the brand into templates.** Finish Brand Kit v1 (colour pairings, the font licence decision, the voice guide, logos when final) and build the open call template set (launch, 30-day reminder, countdown, closed, winners) in Canva or Figma. Templates fix the inconsistent look even before any software exists.
3. **Pilot the next open call end to end.** Run the full sequence with the agent's playbook: a brief, a colour pairing, a unique comment keyword per post, and the brand check before each post. Compare entries, saves and DMs with the last three calls, then build the dashboard MVP around what worked.

**Decision needed now:** Canva or Figma for templates.

## Step 1 setup: connecting the data

Four accounts are already readable through the Meta connector via the **Arts To hearts Project (New website)** ad account: @artstoheartsproject, @opencallforartists\_, @womeninartsnetwork and @risingartistsnetwork\_. That connection returns each post's caption, format, date, likes, comments and link. It doesn't return reach, saves, shares or DMs.

**A. Right now (no setup):** pull every post from those four accounts into a starting report: how often each posts and in which formats, top and bottom 10 posts, likes and comments per post, best days and times, and how comment keyword posts perform.

**B. Connect the remaining accounts (founder, about 1 hour)**

- [ ] List every account in a sheet: handle, what it's for, who manages it.
- [ ] Make each a professional (Business) account: Instagram → Settings → Account type and tools → Switch to professional.
- [ ] Add each one to the **Arts To Hearts Project** business account in Meta Business Suite (Settings → Accounts → Instagram accounts → Add).
- [ ] Give each one to the "Arts To hearts Project (New website)" ad account, so the current connector can read it.

**C. Unlock reach, saves, shares and comment text (developer, about half a day)**

- [ ] developers.facebook.com → Create app → Business, linked to the ATH business account.
- [ ] Add the Instagram product with `instagram_basic`, `instagram_manage_insights`, `instagram_manage_comments`, `pages_show_list`, `pages_read_engagement` and `business_management`. If only ATH's own team uses the app, Meta's app review shouldn't be needed. Check Meta's current rules at setup.
- [ ] In business settings, create a system user "ATH Agent", give it every account and Page, and generate a token.
- [ ] Store the token as a secret in the build environment. Never paste it into chat or documents.
- [ ] Write a daily sync job that saves posts and their numbers to the database.

**D. Connect what happens after the post**

- [ ] **ManyChat:** export subscribers with their tags and keyword stats as a CSV now. Add the Pro plan API key as a secret later.
- [ ] **Entry platform:** export submissions as a CSV (date, which call, how they found us).
- [ ] **Tracking tags on every entry link from now on:** `?utm_source=instagram&utm_medium=social&utm_campaign=<call>&utm_content=<account>-<post>`
- [ ] **Flodesk and Shopify:** already connected. Pull email sign-ups and book or shop sales.

**Quick fix found during setup:** @opencallforartists\_ uses the same comment keyword ("111") on many posts, so leads can't be traced to a post. Give every conversion post its own keyword (like the "FLOWER" post did).

## Gap analysis: what this PRD still misses

The PRD is strong on vision, brand, content and data. It's weak on the things that decide whether it ships: scope, owner, budget, how we test the agent, and risk. Fix the top five before any build starts.

| # | Gap | Why it matters | Fix |
| --- | --- | --- | --- |
| 1 | **Phase 1 is too big** | Seven Phase 1 tabs is months of build. The pilot only needs a few | Cut the MVP to the call brief, the Open Calls sequence, the brand check and a basic Insights view. Move Templates scoring, Brand Health and gamification to Phase 2 |
| 2 | **No owner, builder or budget** | Nothing says who builds it, by when, or what it costs | Name a product owner and a builder (in-house developer, freelancer or agency). Estimate costs: build hours, AI usage, database, Canva or Figma, ManyChat Pro |
| 3 | **No way to test the agent's quality** | Without a test, nobody knows if its briefs and copy are good enough to trust | Build a test set of about 50 past posts with known results. Score the agent's critiques and copy against them each release, plus a monthly blind review by the founder |
| 4 | **Risks aren't listed** | One ATH ad account is already flagged for unusual activity. API changes, account bans and wrong facts can stop the system | Add a risk register: Meta API changes, account restrictions, the AI getting a deadline or prize wrong, team not adopting it, ManyChat policy limits. Each with an owner and a fallback |
| 5 | **Revenue isn't a goal** | Funnels exist, but no money targets per service | Add revenue and lead targets per service (entries × fee, memberships, book sales) and show them on the founder view |
| 6 | **Privacy and consent for lead data** | ManyChat, DMs and email hold personal data from artists worldwide | Add a data policy: what's stored, for how long, who can see it, consent wording in DM flows, and how to delete someone's data on request |
| 7 | **Reels and stories have no system** | Reels drive most reach, but there's only a script format | Add a reels and stories template set: cover style, on-screen type, motion rules, caption style, length per job |
| 8 | **Per-account identity is undefined** | 15 to 20 accounts need to feel related but distinct | Define the brand architecture: a master brand, sub-brand rules, and one colour pairing and voice note per account |
| 9 | **Team onboarding and adoption** | A tool the team doesn't use fixes nothing | Add a launch plan: training, a 2-week shadow period, success = 100% of open call posts going through the system |
| 10 | **Accessibility** | Alt text, captions and contrast affect reach and inclusion | Add to the brand check: alt text on every post, captions on every reel, contrast checked on colour pairings |
| 11 | **Paid boost strategy** | Organic and paid are tracked, but there's no plan for when to boost | Add a simple boost rule, e.g. boost the launch and final week posts once they beat the account's average saves rate |
| 12 | **Benchmarks against peers** | "Outperforming" needs a reference point outside ATH | Track 5 to 10 comparable open call accounts from public data and compare formats and cadence monthly |
| 13 | **Reliability** | Sync failures, expired tokens and backups aren't covered | Add alerts when a sync fails, a token about to expire, daily backups and an audit log |
| 14 | **Document order** | Sections jumped around as the PRD grew | Reorder into Why → Who → What → How → When before sharing it widely |

Items 1 to 5 block the build. Items 6 to 10 are needed before launch. Items 11 to 14 can follow in Phase 2.

## Open questions and decisions needed

- [ ] **Logos:** when are the new logos final, and do we need a separate mark for open calls (e.g. a series seal)?
- [ ] **Fonts:** license Nord and Proxima Nova for social use, or choose approved alternatives?
- [ ] **Colour pairings:** which pairings from the v24 guide are approved for open call colour blocks? Is there one per call type (e.g. Women in Arts always uses the same pairing)?
- [ ] **Voice:** who signs off the ATH voice guide the agent writes in?
- [ ] **Design tool:** should the agent produce final files in Canva (brand templates + autofill) or Figma, or render them itself? This decides how editable the drafts are for the designer.
- [ ] **Instagram access:** confirm that ATH's account is a Business account linked to a Facebook Page, and who owns the Meta app approval.
- [ ] **Entry tracking:** which platform takes submissions, and can it report entries per day and per UTM source?
- [ ] **Publishing:** should the agent schedule directly (Meta API or a scheduler) once a post is approved, or hand the files to the poster?
- [ ] **Scope of authority:** may the agent reject a draft from the designer, or only flag issues?
- [ ] **Other channels:** should Pinterest, Substack and email (Flodesk) reuse the same assets in Phase 3?
