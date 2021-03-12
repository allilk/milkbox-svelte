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
  async init(refresh = false, people_id, folder_id='null', display_fid = false, is_search = 0, shared = 'false', query='') {
    this.PEOPLE_ID = people_id
    this.FOLDER_ID = folder_id
    this.DISPLAY_FID = display_fid
    this.IS_SEARCH = is_search.toString()
    this.SHARED = shared
    this.REFRESH = refresh
    this.QUERY = query;
    this.sorted = 0;
    this.finalList = []
    await this.getFiles()
    let itemList = document.getElementsByClassName("not-selected");
    return itemList;
  }

  /**
   * Some description of what this method does
   * @param fileName
   * @param fileId
   * @param filemimeType
   * @param fileSize
   */
  async createContent(fileName, fileId, filemimeType, fileSize) {
    let mainDiv = document.createElement('div')
    let existingContent = document.getElementById('content-list')
    let divElement = document.createElement('div')

    let sizeElement = document.createElement('div')
    sizeElement.innerText = formatBytes(fileSize, 0)
    sizeElement.setAttribute('class', 'col-span-1 file-size inline text-right')

    let linkParent = document.createElement('a')
    let linkWithin = document.createElement('span')
    linkWithin.innerText = fileName
    mainDiv.title = fileName
    let emojiMime = '❔'

    let divClasses = `col-span-6 shadow-sm not-selected grid grid-cols-6 py-3 px-4`
    if (filemimeType.includes('folder')) {
      if (filemimeType.includes('application/vnd.google-apps.')){
        filemimeType = filemimeType.split('apps.')[1]
      }
      linkWithin.innerText += `/`
      emojiMime = '📂'
      linkParent.href = `drive/${fileId}`
    } else {
      divClasses += ' file'
      if (filemimeType.includes('video')) {
        emojiMime = '📺'
      } else if (filemimeType.includes('audio')) {
        emojiMime = '🎵'
      } else if (filemimeType.includes('image/')) {
        emojiMime = '🖼️'
      } else if (filemimeType.includes('/x-iso') || filemimeType.includes('cd-image')) {
        emojiMime = '💿'
      } else if (filemimeType.includes('/zip') || filemimeType.includes('rar') || filemimeType.includes('compressed')) {
        emojiMime = '🗄️'
      } else if (filemimeType.includes('text')) {
        emojiMime = '📃'
      } else {
        emojiMime = '❔'
      }
    }
    divClasses += ` ${filemimeType}`
    linkWithin.innerText = `${emojiMime} ${linkWithin.innerText}`

    if (this.DISPLAY_FID == true) {
      let idWithin = document.createElement('span')
      idWithin.setAttribute('class', 'text-xs file-id overflow-x-hidden')
      idWithin.innerText = ` (${fileId})`
      linkWithin.appendChild(idWithin)
    }

    divElement.setAttribute('class', 'file-title w-full col-span-5 truncate inline')
    divElement.appendChild(linkWithin)


    mainDiv.appendChild(divElement)
    mainDiv.appendChild(sizeElement)
    mainDiv.id = fileId
    mainDiv.setAttribute('class', divClasses)
    
    linkParent.setAttribute('class', 'contents')
    linkParent.appendChild(mainDiv)

    existingContent.appendChild(linkParent)
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
    // // Remove whatever content that is there now.
    let oldContent = document.getElementById('content-list')
    oldContent.innerHTML = ''
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
        .and( (item) => item.mimeType != 'folder')
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
      masterList = this.fileList;
      let indexHeader = document.getElementById('dir-title')
      indexHeader.innerText = 'Search Results'
    }

    // Remove loading icon
    let loadingIcon = document.getElementById('#loading')
    loadingIcon.style = 'display: none;'
    let oContent = document.getElementById('content-list')
    oContent.style = ''

    // Display file count in header
    const fileCount = document.getElementById('file-count')
    // Set file count in header
    fileCount.innerText = masterList.length

    // Declare cumulative size variable
    let totalSize = 0
    // Create elements for each file
    if (this.IS_SEARCH == 0){
      const resp = await this.getParent()

      this.folderParent = resp
      await this.createContent('..', resp, 'folder', 0)  
    }

    for (const fileObj of masterList) {
      let fileSize = 0

      // Add to total directory size
      if (parseInt(fileObj.size) > 0) {
        totalSize += parseInt(fileObj.size)
        fileSize = parseInt(fileObj.size)
      }
      
      this.finalList.push(fileObj)
      this.createContent(fileObj.name, fileObj.id, fileObj.mimeType, fileSize)
    }

    // Reflect directory size in header
    const sizeTotal = document.getElementById('total-size')
    sizeTotal.innerText = formatBytes(totalSize)
    this.itemList = document.getElementsByClassName('not-selected')
  }
  async checkForCache() {
    let cacheId = this.FOLDER_ID
    
    if (this.SHARED == 'true' || this.IS_SEARCH) {
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
    document.getElementById('show-grid').setAttribute('class', 'hidden')
    let contentList = document.getElementById('content-list')

    for(const childObj of contentList.childNodes) {
      let reObj = childObj.childNodes[0]
      reObj.classList.replace('col-span-6', 'col-span-3')      
    }

    
    document.getElementById('show-list').setAttribute('class', '')
  }
  async toggleList() {
    document.getElementById('show-list').setAttribute('class', 'hidden')
    let contentList = document.getElementById('content-list')

    for (const childObj of contentList.childNodes) {
      let reObj = childObj.childNodes[0]
      reObj.classList.replace('col-span-3', 'col-span-6')
    }

    
    document.getElementById('show-grid').setAttribute('class', '')
  } 
  async getFiles() {
    let fetchFiles = true
    this.fileList = []
    let parentFolder = 'root'
    let nextPageToken
    let querySearch;

    /**
     * Get files from API and cache
     */
    let res;
    if (this.IS_SEARCH == 0){
      res = await this.checkForCache()
    }
    if (!res) {
      if (this.FOLDER_ID == 'shared-with-me' && this.IS_SEARCH == 0) {
        querySearch = 'sharedWithMe'
      } else if (this.FOLDER_ID != 'shared-with-me' && this.IS_SEARCH == 0) {
        querySearch = `'${this.FOLDER_ID}' in parents and trashed=false`
      } else if (this.IS_SEARCH == 1){
        querySearch = `name contains '${this.QUERY}' and trashed=false`
      }
      
      while (fetchFiles) {
        const resp = await gapi.client.drive.files.list({
          q: querySearch,
          pageSize: 1000,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
          corpora: 'allDrives',
          fields: 'nextPageToken, files(name, id, parents, size, mimeType, modifiedTime, driveId)',
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
        if (this.FOLDER_ID != 'root' && this.FOLDER_ID != 'shared-with-me' || this.QUERY) {
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
            words: getAllWords(file.name)
          });
      }
    }
    // Remove whatever content that is there now.
    let oldContent = document.getElementById('content-list')
    oldContent.innerHTML = ''

    await this.loadContent()
    return this.finalList;
  }
  /**
   * Sorts results based on the file size, if applicable
   */
  async sortSize() {
    let oldContent = document.getElementById('content-list')
    oldContent.innerHTML = ''
    setLoading()

    let newList = this.finalList.map((obj) => {
      let newSize = obj.size
      if (obj.size == undefined) {
        newSize = '0'
      }

      let newobj = {
        name: obj.name,
        id: obj.id,
        mimeType: obj.mimeType,
        size: parseInt(newSize)
      }
      return newobj
    })
    if (this.sorted == 1) {
      this.sorted = 0
      newList = newList.sort((a, b) => a.size - b.size)
    } else {
      this.sorted = 1
      newList = newList.sort((a, b) => b.size - a.size)
    }
    if (!window.location.href.includes('#search')){
      await this.createContent('..', this.folderParent, 'folder', 0)
    }
    // Remove loading icon
    let loadingIcon = document.getElementById('#loading')
    loadingIcon.style = 'display: none;'
    oldContent.style = ''

    newList.forEach((fileObj) => {
      let fileSize = 0
      // Add to total directory size
      if (parseInt(fileObj.size) > 0) {
        fileSize = parseInt(fileObj.size)
      }
      this.createContent(fileObj.name, fileObj.id, fileObj.mimeType, fileSize)
    })
  }

  /**
   * Sorts results based on the name
   */
  async sortName() {
    let sorter = natsort({ insensitive: true })
    // // Remove whatever content that is there now.
    let oldContent = document.getElementById('content-list')
    oldContent.innerHTML = ''
    let newList = this.finalList

    setLoading()

    if (this.sorted == 1) {
      this.sorted = 0
      newList = newList.sort((a, b) => sorter(a.name, b.name))
    } else {
      this.sorted = 1
      sorter = natsort({ insensitive: true, desc: true })
      newList = newList.sort((a, b) => sorter(a.name, b.name))
    }

    if (!window.location.href.includes('#search')){
      await this.createContent('..', this.folderParent, 'folder', 0)
    }

    // Remove loading icon
    let loadingIcon = document.getElementById('#loading')
    loadingIcon.style = 'display: none;'
    oldContent.style = ''

    for (const fileObj of newList) {
      let fileSize = 0
      // Add to total directory size
      if (parseInt(fileObj.size) > 0) {
        fileSize = parseInt(fileObj.size)
      }
      await this.createContent(fileObj.name, fileObj.id, fileObj.mimeType, fileSize)
    }
  }
}

