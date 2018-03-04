# TODO:

* Update to passport-github2
* Investigate github webhooks
* Investigate Jest

## Files with unfinished pieces:
* LoginForm
* NewIssueButton
* EmailVerificationDialog
* MainPage
* IssueEditView
* IssueCreateView
* ProjectContentArea

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
