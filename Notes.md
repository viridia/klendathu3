# TODO:

* Copy link to clipboard
* Saved filters
* Filter links in left nav
* Issue changes aren't updating in issue list.
* Issue Autocomplete / project-specific
* Issue Link Edit
* User Selector
* Update Project
* Project prefs panels - Workflow, etc.
* Issue Grouping - custom fields - sprints, priority, etc.
* Workflow Edit
* Error reporting for bad params in url path.
* Issue Change History (global)
* Remove deleted issues from selection set. (Or issues not in query).
* Graph view
* State view
* Deepstream Valves
* Milestones
* AND / Or search for labels
* Clone issue
* Create linked issue
* Nginx setup
* HTTPS
* Hierarchy view in issue list
* Ajv error reporting?
* History filter by date range
* Deploy!

# Longer term:

* Convert /names endpoint to use RPC instead.
* Update to passport-github2
* Investigate github webhooks

## Files with unfinished pieces:

* LoginForm
* CustomSuggestField
* ErrorDisplay
* IssueDetailsView - attachments and comments.
* ProjectInfoEdit - save, display owner
* ProjectSettings

# More Ideas

* Separate issue state from checkin state. (Latter managed by github or other vcs webhook).
* Comment attachments.
* at-mentions in comments
* A way to easily reference tickets in commit messages. (Just paste the url)
* Make certain fields editable without going into edit mode.
* Think about email spam. (Once we have email)
  * Aggregate changes; Don't show trivial changes.
* Think about a global change history that would avoid the need for email spam.
  * Partly done - need query by date
* Gantt and ticket relationships.
* Auto-linked tickets. (Add 'create linked' in sidebar actions.)
* Think about how to make it easier to manage ticket relationships.
  * Drag links between cards?
  * Murally-style dragging of cards?  I kind of like that idea...
* Clubhouse.io-style collapsing columns.
* Filter terms: multiple label clauses - each clause is OR, each term is AND.

## Thoughts on milestones:

Milestones aren't merely labels because you can group by them, they are exclusive (like an enum).
We need a project milestones table.

interface Milestone {
  id: string;
  project: string;
  name: string;
  targetDate: Date;
  ?? color?
}

Idea: Milestones don't show up unless they have been added to project.
