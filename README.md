
## Presets
Create `.env` file
Add the following values

`SLACK_TOKEN` The Slack application token. See section ***Slack***

`JIRA_URL` URL of your Jira project, example: `https://{your_name}.atlassian.net/`

`EMAIL` The email used to create the API Token in Jira. See section ***Jira***

`JIRA_TOKEN` Jira Token API. See section ***Jira***

### Slack

1. Visit ["Your Apps" in Slack Administration](https://api.slack.com/apps)
and click ***Create a new app***.

2. Name your app (for example ***"Jira Automation Sync"***) and select the workspace you want to sync with Jira.

3. Click the ***"Permissions"*** tab to go to the "OAuth & Permissions" page in the application settings.

4. In the ***"Scope"*** section, scroll down to ***"User Token Scopes"*** and click ***"Add an OAuth Scope"***.

5. Type/select *user:read.email* in the search field. You should see a message saying that it will also add *users:read* - click ***"Add Scopes"***.

6. At the top of this page, click ***"Install App to Workspace"***.

7. Copy the existing ***OAuth Access Token***. And paste it into the `.env` file in the `SLACK_TOKEN` field

###Jira

1. Make sure the account you are using has permissions
[Jira Administration](https://confluence.atlassian.com/adminjiracloud/managing-global-permissions-776636359.html).

2. Visit the section
[API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
in your Atlassian account to generate a new API token. \
Note: This is an API token linked to your Atlassian user account. Treat it like a password; don't store this API token in code repositories, document it in Confluence, and don't share it in Slack.

3. Click the ***"Create API Token"*** button to create a token, you can give it any name.
Copy the token and paste it into the `.env` file in the `JIRA_TOKEN` field. Keep in mind, this token is shown only once.

### Run plugin
[node.js](https://nodejs.org/en/) must be installed on the device

Run commands sequentially from the plugin directory
#### `npm install`
#### `npm start`

