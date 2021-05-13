import natsort from '../../scripts/natsort.min.js'
import { formatBytes, getAllWords, setLoading } from '../functions'
import db from './connection'

export default class getFiles {
  /**
   * @param refresh Whether to perform a refresh
   * @param people_id The ID of the user
   * @param folder_id The target parent folder ID
   * @param display_fid Whether to display the folder/file ids next to the name
   * @param is_search Whether this is a search, use string version of booleans
   * @param shared Whether the drive is shared or not, use string version of booleans
   */
  async init(refresh = false, people_id, folder_id = 'null', display_fid = false, is_search = 0, shared = 'false', query = '') {
    this.PEOPLE_ID = people_id
    this.FOLDER_ID = folder_id
    this.DISPLAY_FID = display_fid
    this.IS_SEARCH = is_search.toString()
    this.SHARED = folder_id === 'shared-with-me' ? 'true' : 'false'
    this.REFRESH = refresh
    this.QUERY = query
    this.sorted = 0
    this.finalList = []
    this.theList = []

    await this.getFiles()
    // console.log(this.theList)
    
    return this.theList
  }

  /**
   * Gets the file/folder parent
   */
  async getParent() {
    // To display the directory title at top
    const dirTitle = document.getElementById('dir-title')
    let folderName = 'my drive'
    let parentId = 'root'
    if (this.FOLDER_ID == 'shared-with-me') {
      folderName = 'Shared With Me'
    } else {
      // CHECK IF IN/IS TEAM DRIVE OR NOT
      const resp = await gapi.client.drive.files.get({
        fileId: this.FOLDER_ID,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        fields: 'name, id, parents, driveId'
      })

      // Check if "driveId" is present and
      // the folder id length is less than 30
      // (to make sure, it is infact, a team drive)
      if (resp.result.driveId && this.FOLDER_ID.length < 30) {
        await gapi.client.drive.drives.get({ driveId: this.FOLDER_ID }).then(async function (resp) {
          // IS A TEAM DRIVE
          folderName = resp.result.name
          parentId = 'shared-drives'
        })
      } else {
        // NOT A TEAM DRIVE
        folderName = resp.result.name
        if (this.FOLDER_ID.length > 30 || resp.result.driveId) {
          try {
            parentId = resp.result.parents[0]
          } catch {
            parentId = 'shared-with-me'
          }
        }
      }
    }

    // Add directory name to top
    dirTitle.innerText = folderName
    return parentId
  }
  /**
   * Loads content or some shit
   */
  async loadContent() {
    // Declare natsort sorter
    let sorter = natsort({ insensitive: true })

    let masterList = []
    // // // Remove whatever content that is there now.
    // let oldContent = document.getElementById('content-list')
    // oldContent.innerHTML = ''
    if (this.IS_SEARCH == 0 && this.FOLDER_ID != 'shared-with-me') {
      // Get folders
      let folderList = await db.files
        .where({
          parents: this.FOLDER_ID,
          peopleid: this.PEOPLE_ID,
          issearch: this.IS_SEARCH,
          shared: this.SHARED
        })
        .and((item) => item.mimeType == 'folder')
        .sortBy('name')
      // Sort using natsort!
      folderList.sort((a, b) => sorter(a.name, b.name))
      masterList.push(folderList)

      // Get files
      let fileList = await db.files
        .where({
          parents: this.FOLDER_ID,
          peopleid: this.PEOPLE_ID,
          issearch: this.IS_SEARCH,
          shared: this.SHARED
        })
        .and((item) => item.mimeType != 'folder')
        .sortBy('name')

      // Sort using natsort!
      fileList.sort((a, b) => sorter(a.name, b.name))

      masterList.push(fileList)
      // Flatten array
      masterList = [].concat.apply([], masterList)
    } else if (this.FOLDER_ID == 'shared-with-me') {
      masterList = await db.files
        .where({
          parents: 'root',
          peopleid: this.PEOPLE_ID,
          issearch: this.IS_SEARCH,
          shared: this.SHARED
        })
        .toArray()
    } else {
      // masterList = await db.files.where('words').startsWithIgnoreCase(this.QUERY).distinct().toArray()
      masterList = this.fileList
      let indexHeader = document.getElementById('dir-title')
      indexHeader.innerText = 'Search Results'
    }


    // Display file count in header
    const fileCount = document.getElementById('file-count')
    // Set file count in header
    fileCount.innerText = masterList.length

    // Declare cumulative size variable
    let totalSize = 0
    // Create elements for each file
    if (this.IS_SEARCH == 0) {
      const resp = await this.getParent()

      this.folderParent = resp
      // await this.createContent('..', resp, 'folder', 0, '/')
      this.theList = [
        ...this.theList,
        {
          name: '..',
          id: resp,
          raw_size: 0,
          size: formatBytes(0),
          mimetype: 'folder',
          thumbnail: '',
          webview: '/'
        }
      ]
    }

    for (const fileObj of masterList) {
      let fileSize = 0

      // Add to total directory size
      if (parseInt(fileObj.size) > 0) {
        totalSize += parseInt(fileObj.size)
        fileSize = parseInt(fileObj.size)
      }

      this.finalList.push(fileObj)
      
      this.theList = [
        ...this.theList,
        {
          name: fileObj.name,
          id: fileObj.id,
          raw_size: fileSize,
          size: formatBytes(fileSize),
          mimetype: fileObj.mimeType,
          thumbnail: fileObj.thumbnail,
          webview: fileObj.webview
        }
      ]
      // this.createContent(fileObj.name, fileObj.id, fileObj.mimeType, fileSize, fileObj.webview)
    }

    // Reflect directory size in header
    const sizeTotal = document.getElementById('total-size')
    sizeTotal.innerText = formatBytes(totalSize)
    this.itemList = document.getElementsByClassName('not-selected')
  }
  async checkForCache() {
    let cacheId = this.FOLDER_ID

    if (this.SHARED == 'true' || this.IS_SEARCH == 1) {
      cacheId = 'root'
    }

    if (this.REFRESH) {
      await db.files
        .where({
          parents: cacheId,
          peopleid: this.PEOPLE_ID,
          issearch: this.IS_SEARCH,
          shared: this.SHARED
        })
        .delete()
    }
    let cacheExists = false
    let ifCache = await db.files
      .where({
        parents: cacheId,
        peopleid: this.PEOPLE_ID,
        issearch: this.IS_SEARCH,
        shared: this.SHARED
      })
      .sortBy('name')
    if (ifCache.length > 0) {
      cacheExists = true
    }
    return cacheExists
  }
  async toggleGrid() {
    document.getElementById('show-grid').classList.add('hidden')
    let contentList = document.getElementsByClassName('not-selected')

    try {
      for (const childObj of contentList) {
        childObj.classList.replace('col-span-6', 'col-span-3')
      }
    } catch {}

    document.getElementById('show-list').classList.remove('hidden')
  }
  async toggleList() {
    document.getElementById('show-list').classList.add('hidden')
    let contentList = document.getElementsByClassName('not-selected')

    try {
      for (const childObj of contentList) {
        childObj.classList.replace('col-span-3', 'col-span-6')
      }
    } catch {}
    document.getElementById('show-grid').classList.remove('hidden')
  }
  async getFiles() {
    let fetchFiles = true
    this.fileList = []
    let parentFolder = 'root'
    let nextPageToken
    let querySearch

    /**
     * Get files from API and cache
     */
    let res = await this.checkForCache()

    if (!res || this.IS_SEARCH == 1) {
      if (this.FOLDER_ID == 'shared-with-me' && this.IS_SEARCH == 0) {
        querySearch = 'sharedWithMe'
      } else if (this.FOLDER_ID != 'shared-with-me' && this.IS_SEARCH == 0) {
        querySearch = `'${this.FOLDER_ID}' in parents and trashed=false`
      } else if (this.IS_SEARCH == 1) {
        querySearch = `name contains '${this.QUERY}' and trashed=false`
      }

      while (fetchFiles) {
        const resp = await gapi.client.drive.files.list({
          q: querySearch,
          pageSize: 1000,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
          corpora: 'allDrives',
          fields: 'nextPageToken, files(name, id, parents, size, mimeType, modifiedTime, driveId, webViewLink, thumbnailLink)',
          pageToken: nextPageToken
        })
        this.fileList.push(resp.result.files)
        
        if (!resp.result.nextPageToken) {
          fetchFiles = false
        } else {
          nextPageToken = resp.result.nextPageToken
        }
      }

      this.fileList = [].concat.apply([], this.fileList)
      if (this.QUERY) {
        this.IS_SEARCH = 1
      }
      for (const file of this.fileList) {
        if ((this.FOLDER_ID != 'root' && this.FOLDER_ID != 'shared-with-me') || this.QUERY) {
          parentFolder = file.parents.toString()
        }

        const splitmimeTypes = file.mimeType.split('.')
        const shortenedMime = splitmimeTypes.length < 3 ? splitmimeTypes[0] : splitmimeTypes[2]
        await db.files.put({
          name: file.name,
          id: file.id,
          parents: parentFolder,
          size: file.size,
          mimeType: shortenedMime,
          driveid: file.driveId,
          peopleid: this.PEOPLE_ID,
          issearch: this.IS_SEARCH,
          shared: this.SHARED,
          thumbnail: file.thumbnailLink || '',
          webview: file.webViewLink,
          words: getAllWords(file.name)
        })
      }
    }
    await this.loadContent()
    return this.theList
  }
}
