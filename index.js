const Slack = require("slack")
const axios = require("axios");
require('dotenv').config()

const SLACK_USER_LIMIT = 30

/**
 * Loading Slack users
 *
 * @param {object} client - Slack client
 *
 * @returns {object} key - email. Array: [slack_username, slack_id]
 */
async function getSlackUsers(client) {
  const getActiveUsers = async (cursor = 0) => {
    const response = await client.users.list({
      cursor: cursor,
      limit: SLACK_USER_LIMIT
    })

    const users = response.members
    const nextCursor = response.response_metadata.next_cursor

    const formattedUsers = users.reduce((t, user) => {
      if (user.is_bot || user.deleted || !user.profile.email) {
        return t
      }
      t[user.profile.email] = [user.name, user.id]
      return t
    }, {})

    return [formattedUsers, nextCursor]
  }

  let [users, nextCursor] = await getActiveUsers()

  while (nextCursor) {
    [newUsers, nextCursor] = await getActiveUsers(nextCursor)
    users = {...users, ...newUsers}
  }

  return users
}


/**
 * Jira Class
 */
class JIRA {
  _SEARCH_PATH = 'rest/api/3/user/search'
  _PROPERTY_PATH = 'rest/api/3/user/properties/'

  _HEADERS = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }


  /**
   * Loading Slack users
   *
   * @param {string} url
   * @param {string} email
   * @param {string} apiToken
   */
  constructor(url, email, apiToken) {
    this.url = url

    this.client = axios.create({
      baseURL: url,
      headers: this._HEADERS,
      auth: {
        username: email,
        password: apiToken
      }
    })
  }

  /**
   * Retrieve Jira user by Email
   *
   * @param {string} email
   *
   * @return {string} user Id 
   */
  async getUser(email) {
    try {
      const response = await this.client.get(this._SEARCH_PATH, {
        params: {
          query: email,
          maxResults: 1
        }
      })

      if (response.data.length > 0) {
        return response.data[0].accountId
      }
    } catch (e) {
      console.error(e.response.data)
    }
  }


  /**
   * Set user_property
   *
   * @param {string} accountId
   * @param {string} slack_username
   * @param {string} slack_id
   * @param {string} key
   */
  async setUserProperty(accountId, slack_username, slack_id, key = 'metadata') {
    try {
      const response = await this.client({
        method: 'PUT',
        url: this._PROPERTY_PATH + key,
        params: {
          accountId
        },
        data: {
          slack_username, slack_id
        }
      })

      return true
    } catch (e) {
      console.error(e.response.data)
      return false
    }
  }

  /**
   * Obtain Slack Info from user_property 
   *
   * @param {string} accountId
   */
  async getSlackInfo(accountId) {
    try {
      await this.client.get(
        this._PROPERTY_PATH + 'metadata',
        {
          params: {
            accountId
          }
        }
      )
    } catch (e) {
      console.error(e.response.data)
    }
  }
}

// Main

try {
  (async function Main() {
    const token = process.env.SLACK_TOKEN
    const slackClient = new Slack({token})

    console.log('Loading Slack users');
    const slackUsers = await getSlackUsers(slackClient);
    console.log('Total loaded users:', Object.keys(slackUsers).length)
    console.log()

    if (slackUsers.length <= 0) {
      return
    }

    const url = process.env.JIRA_URL
    const email = process.env.EMAIL
    const jiraToken = process.env.JIRA_TOKEN
    const jira = new JIRA(url, email, jiraToken)

    for (const email of Object.keys(slackUsers)) {
      console.log('Looking for Jira user by Email', email)

      const accountId = await jira.getUser(email)
      const [username, slackId] = slackUsers[email]

      if (!accountId) {
        console.error('No user found')
        continue;
      }
      console.log('User found')

      console.log('Starting sync')
      const setResult = await jira.setUserProperty(
        accountId,
        username,
        slackId,
      )

      if (!setResult) {
        console.error('Sync error')
        return
      }
      console.log('Sync completed successfully')
      console.log('jira_id:', accountId)
      console.log('slack_username:', username)
      console.log('slack_id:', slackId)
      console.log()
    }
  })()
} catch (e) {
  console.error(e)
}
