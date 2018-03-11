# TODO:

* User Autocomplete
* Issue Autocomplete
* Issue Link Edit
* Issue Edit
  * Edit form
  * Version history
* Marked
* Comments
* Attachments - where to store to?
* Issue links
* Sorting by custom fields.
* Filter bar
* User Selector
* Issue Compose (finish)
* Issue Details
* Mass edit bar
* Update Project
* Update Issue
* Project prefs
* Issue Grouping
* Workflow Edit
* Error reporting for bad params in url path.

# Longer term:

* Convert /names endpoint to use RPC instead.
* Update to passport-github2
* Investigate github webhooks
* Investigate Jest

## Files with unfinished pieces:
* LoginForm
* EmailVerificationDialog
* MainPage
* IssueEditView
* CustomSuggestField
* ErrorDisplay

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
* Think about a global change history that would avoid the need for email spam.
* Gantt and ticket relationships.
* Auto-linked tickets.
* Think about how to make it easier to manage ticket relationships.
  * Drag links between cards?
  * Murally-style dragging of cards?  I kind of like that idea...
* Cloudwatch-style collapsing columns.
