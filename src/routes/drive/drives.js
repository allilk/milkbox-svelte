import db from './connection'

export default class getDrives {
  async init(people_id, refresh = false) {
    this.PEOPLE_ID = people_id
    this.REFRESH = refresh
    this.driveList = []
    this.finalList = []
    await this.listDrives()
    // let itemList = document.getElementsByClassName('drive-obj')
    return this.finalList
  }

  async listDrives() {
    const checkForCache = async () => {
      if (this.REFRESH) {
        await db.drives
          .where({
            peopleid: this.PEOPLE_ID
          })
          .delete()
      }

      let ifCache = await db.drives.where('peopleid').equals(this.PEOPLE_ID).toArray()

      let cacheExists = ifCache.length > 0 ? true : false;
      return cacheExists
    }

    let fetchDrives = true
    let nextPageToken
    const cacheResp = await checkForCache()

    if (cacheResp == false) {
      while (fetchDrives) {
        const response = await gapi.client.drive.drives.list({
          pageSize: 100,
          pageToken: nextPageToken,
          fields: 'nextPageToken, drives(name, id, hidden, restrictions)'
        })
        this.driveList.push(response.result.drives)
        if (!response.result.nextPageToken) {
          fetchDrives = false
        } else {
          nextPageToken = response.result.nextPageToken
        }
      }

      this.driveList = [].concat.apply([], this.driveList)
      for (const drive of this.driveList) {
        await db.drives.put({
          name: drive.name,
          id: drive.id,
          hidden: drive.hidden,
          peopleid: this.PEOPLE_ID,
          // is_domain: drive.restrictions.driveMembersOnly.toString()
        })
      }
    }

    await this.loadContent()
  }

  async loadContent() {
    if (this.driveList.length < 1) {
      this.driveList = await db.drives.where('peopleid').equals(this.PEOPLE_ID).toArray()
    }
    this.driveList.forEach(driveObj => {
      this.finalList = [
        ...this.finalList,
        {
          name: driveObj.name,
          id: driveObj.id,
          hidden: driveObj.hidden,
          // is_domain: driveObj.is_domain
        }
      ]
    })
    // let oldContent = document.getElementById('content-list')
    // oldContent.innerHTML = ''

    // let loadingIcon = document.getElementById('#loading')
    // loadingIcon.style = 'display: none;'

    // this.driveList.forEach((drive) => {
    //   let divElement = document.createElement('div')
    //   let newObj = document.createElement('a')
    //   let newContent = document.createTextNode(drive.name)
    //   let bottomContent = document.createElement('div')

    //   bottomContent.innerText = `(${drive.id})`
    //   bottomContent.setAttribute('class', 'text-xs text-gray-500')
    //   bottomContent.id = 'file'
    //   newObj.href = `drive/${drive.id}`
    //   newObj.setAttribute('class', 'drive-obj whitespace-normal text-center text-lg px-16 py-6 shadow-inner col-span-2 md:col-span-1')

    //   divElement.appendChild(newContent)
    //   divElement.appendChild(bottomContent)
    //   newObj.appendChild(divElement)
    //   oldContent.appendChild(newObj)
    // })

    // let totalDrives = document.getElementById('total-drives')
    // totalDrives.innerText = `(${this.driveList.length})`
    // oldContent.style=""
  }
}
