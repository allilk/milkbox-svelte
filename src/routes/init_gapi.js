import { api_key, client_id, discovery_docs, scopes } from './stores'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default class initClient {
  async init() {
    await this.onLoadCallback()
    while (!this.PEOPLE_ID) {
      await sleep(1000)
    }
    return this.PEOPLE_ID
  }
  async onLoadCallback() {
    const authorizeButton = document.getElementById('authorize_button')
    const signoutButton = document.getElementById('signout_button')
    const refreshButton = document.getElementById('refresh_button')

    async function handleAuthClick(event) {
      gapi.client.getAuthInstance().signIn()
    }

    async function handleSignoutClick(event) {
      gapi.client.getAuthInstance().signOut()
    }

    async function getPeopleId() {
      let resp = await gapi.client.people.people.get({
        resourceName: 'people/me',
        'requestMask.includeField': 'person.names'
      })

      let peopleId = resp.result.resourceName.split('people/')[1]
      return peopleId
    }

    async function updateSigninStatus(isSignedIn) {
      if (isSignedIn) {
        authorizeButton.style.display = 'none'
        signoutButton.style.display = 'block'
        refreshButton.style.display = 'block'
      } else {
        authorizeButton.style.display = 'block'
        signoutButton.style.display = 'none'
        refreshButton.style.display = 'none'
      }
    }
    gapi.client.getAuthInstance().isSignedIn.listen(updateSigninStatus)
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
    authorizeButton.onclick = handleAuthClick
    signoutButton.onclick = handleSignoutClick
    this.PEOPLE_ID = await getPeopleId()
  }
}
