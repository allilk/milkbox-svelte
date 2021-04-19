
<svelte:head>
  <script src="https://apis.google.com/js/platform.js?onload=onLoadCallback" async defer></script>
  <script>
    async function Initialize() {
      const authorizeButton = document.getElementById('authorize_button')
      const signoutButton = document.getElementById('signout_button')
      const refreshButton = document.getElementById('refresh_button')

      function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn()
      }

      function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut()
      }

      async function getPeopleId() {
        let peopleId, userName
        let resp = await gapi.client.people.people.get({
          resourceName: 'people/me',
          'requestMask.includeField': 'person.names'
        })
        userName = resp.result.names[0].displayName
        peopleId = resp.result.resourceName.split('people/')[1]

        return { PEOPLE_ID: peopleId, USER_NAME: userName }
      }

      function updateSigninStatus(isSignedIn) {
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
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus)
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
      authorizeButton.onclick = handleAuthClick
      signoutButton.onclick = handleSignoutClick
      perOBJ = await getPeopleId()
      localStorage.setItem('PEOPLE_ID', perOBJ.PEOPLE_ID)
      localStorage.setItem('USER_NAME', perOBJ.USER_NAME)

    }
    window.onLoadCallback = async function () {
      gapi.load('client:auth2', async function () {
        await gapi.client.init({
          cookiepolicy: 'single_host_origin',
          apiKey: api_key,
          clientId: client_id,
          discoveryDocs: discovery_docs,
          scope: scopes
        })
        Initialize()
      })
    }
  </script>
</svelte:head>
<script>
  export let PEOPLE_ID = null;
  export let USER_NAME = null;
  if (typeof window !== 'undefined') {
    PEOPLE_ID = localStorage.getItem('PEOPLE_ID')
    USER_NAME = localStorage.getItem('USER_NAME')
  }
</script>

<div class="inline-flex flex-auto">
  <div>
    Signed in as <b>{USER_NAME}</b> (<span id="#PID">{PEOPLE_ID}</span>) 
  </div>
  <button id="authorize_button" style="display: none;" class="px-2 py-2 font-semibold rounded-none shadow"> Authorize</button>
  <button id="signout_button" style="display: none;" class="px-2 py-2 font-semibold rounded-none shadow"> Sign Out</button>
  <button id="refresh_button" style="display: none;" class="px-2 py-2 font-semibold rounded-none shadow"> Refresh</button>
</div>
