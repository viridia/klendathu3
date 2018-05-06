# TODO:

* Milestones
* Saved filters
* Profile photos
* Filter links in left nav
** Issue changes aren't updating in issue list.
* Issue Autocomplete / project-specific
* Issue Link Edit
* User Selector
** Update Project
* Project prefs panels - Workflow, etc.
* Issue Grouping - custom fields - sprints, priority, etc.
* Workflow Edit
* Error reporting for bad params in url path.
* Paginate Global History - by date range
* Graph view
* Deepstream Valves
* AND / Or search for labels
* Search by relative date (last 2 weeks)
* Clone issue
* Create linked issue
* Hierarchy view in issue list
* Ajv error reporting?
* Double-click on issue card to go to details
* Email notifications
  * Agent that runs periodically
  * Different rates based on user preferences
* Project landing page
* Nginx setup
* HTTPS
* Deploy!

# Longer term:

* Convert /names endpoint to use RPC instead.
* Update to passport-github2
* Investigate github webhooks

## Files with unfinished pieces:

* LoginForm
* CustomSuggestField - suggestion search not implemented
* ErrorDisplay
* IssueDetailsView - attachments.
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
  project: string; account/project
  name: string;
  targetDate: Date;
  ?? color?
}

Idea: Milestones don't show up unless they have been added to project.

## Thoughts on dependency view:

First, what cards should be shown? Ideally, we would want to show all cards that are open,
plus any cards that are not open that are linked to them.

Issues to solve:

* Conflict between auto-layout and manual layout. Manual layout suffers from the fact that
  issues are constantly being added and removed, which means that any manual arrangement will
  quickly become obsolete. Automatic layout suffers from the fact that we can't know what the
  user's intent is as far as grouping things.

## Schema validations

[{"keyword":"type","dataPath":".owner","schemaPath":"#/properties/owner/type","params":{"type":"string"},"message":"should be string"}]
