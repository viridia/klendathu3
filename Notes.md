# TODO:

* Attachments
* Attachments - where to store to?
* Saved filters
* Filter links in left nav
* Issue changes aren't updating in issue list.
* Issue Autocomplete / project-specific
* Issue Link Edit
* Issue Edit
  * Edit form
* Comments
* Issue links
* Sorting by custom fields. (Tricky without a database index - perhaps can't use lists.)
* User Selector
* Issue Compose (finish)
* Issue Details
* Update Project
* Project prefs panels - columns, Workflow, etc.
* Issue Grouping
* Workflow Edit
* Error reporting for bad params in url path.
* Issue Change History (global)
* Remove deleted issues from selection set. (Or issues not in query).
* Graph view
* State view
* DS Valves
* Milestones
* AND / Or search for labels
* Clone issue
* Create linked issue
* Nginx setup
* HTTPS

# Longer term:

* Convert /names endpoint to use RPC instead.
* Update to passport-github2
* Investigate github webhooks
* Investigate Jest
* Think about using a record set rather than a record list for issue list - for sorting of
  custom fields.

## Files with unfinished pieces:
* LoginForm
* IssueEditView
* IssueCompose - reset to edit
* CustomSuggestField
* ErrorDisplay
* IssueDetailsView - attachments and comments.
* ProjectInfoEdit
* ProjectSettings
* AddMemberDialog

## Routes:

/account/login
/account/register
/account/activate
/account/pwreset
/account/pwnew
/settings/{tabname}
/organizations/{organization}/settings/{tab}

/ (dashboard)
/{account}/ (profile page, including project list)
/{account}/{project}/ (project summary)
/{account}/{project}/new
/{account}/{project}/{id}
/{account}/{project}/edit/{id}
/{account}/{project}/labels/{id}
/{account}/{project}/settings/{tab}

# More Ideas

* Separate issue state from checkin state. (Latter managed by github or other vcs webhook).
* Comment attachments.
* A way to easily reference tickets in commit messages. (Just paste the url)
* Make certain fields editable without going into edit mode.
* Think about email spam. (Once we have email)
  * Aggregate changes; Don't show trivial changes.
* Think about a global change history that would avoid the need for email spam.
* Gantt and ticket relationships.
* Auto-linked tickets. (Add 'create linked' in sidebar actions.)
* Think about how to make it easier to manage ticket relationships.
  * Drag links between cards?
  * Murally-style dragging of cards?  I kind of like that idea...
* Cloudwatch-style collapsing columns.
* Filter terms: multiple label clauses - each clause is OR, each term is AND.
