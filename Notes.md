# TODO:

# Longer term:

* Update to passport-github2
* Investigate github webhooks
* Investigate Jest

## Files with unfinished pieces:
* LoginForm
* EmailVerificationDialog
* MainPage
* IssueEditView
* LabelDialog
* LabelListView

## Routes:

/account/login
/account/register
/account/activate
/account/pwreset
/account/pwnew
/settings/{tabname}
/organizations/{organization}/settings/{tab}

/ (dashboard)
/{user|org}/ (profile page, including project list)
/{user|org}/{project}/ (project summary)
/{user|org}/{project}/new
/{user|org}/{project}/edit/{id}
/{user|org}/{project}/issues/{id}
/{user|org}/{project}/labels/{id}
/{user|org}/{project}/settings/{tab}

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
