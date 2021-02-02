import db from './connection';
import natsort from '../../scripts/natsort.min.js';
import {formatBytes, getAllWords, setLoading} from '../functions'

export default class getFiles{
    async init(refresh, people_id, folder_id, display_fid = false, is_search='false', shared='false'){
        this.PEOPLE_ID = people_id;
        this.FOLDER_ID = folder_id;
        this.DISPLAY_FID = display_fid;
        this.IS_SEARCH = is_search;
        this.SHARED = shared;
        this.REFRESH = refresh;
        this.finalList = [];
        this.getFiles()
        };
    async createContent (fileName, fileId, fileMimeType, fileSize) {
        let mainDiv = document.createElement('div');
        let existingContent = document.getElementById('content-list');
        let divElement = document.createElement('div');

        let sizeElement = document.createElement('div');
        sizeElement.innerText = formatBytes(fileSize,0);
        sizeElement.setAttribute("class", "col-span-1 file-size inline text-right");

        let linkWithin = document.createElement('a');
        linkWithin.innerText = fileName;
        let divClasses = `col-span-6 shadow-sm not-selected grid grid-cols-6 ${fileMimeType} py-3 px-4`;
        mainDiv.title = fileName;
        let emojiMime = '❔';
        if (fileMimeType == 'folder') {
            linkWithin.innerText += `/`
            emojiMime = '📂';
            linkWithin.href = `drive/${fileId}`;
        } else { 
            divClasses += " file"
            if (fileMimeType.includes('video')) {
                emojiMime = '📺';
            } else if (fileMimeType.includes('audio')) {
                emojiMime = '🎵';
            } else if (fileMimeType.includes('image/')) {
                emojiMime = '🖼️';
            } else if (fileMimeType.includes('/x-iso') || fileMimeType.includes('cd-image')) {
                emojiMime = '💿';
            } else if (fileMimeType.includes('/zip') || fileMimeType.includes('rar') || fileMimeType.includes('compressed')) {
                emojiMime = '🗄️';
            } else if (fileMimeType.includes('text')) {
                emojiMime = '📃';
            } else {
                emojiMime = '❔';
            }
        };
        linkWithin.innerText = `${emojiMime} ${linkWithin.innerText}`
    
        if (this.DISPLAY_FID == true) {
            let idWithin = document.createElement('span');
            idWithin.setAttribute("class", "text-xs file-id overflow-x-hidden");
            idWithin.innerText = ` (${fileId})`
            linkWithin.appendChild(idWithin)
        }
        
        divElement.setAttribute("class", "file-title w-full col-span-5 truncate inline");
        divElement.appendChild(linkWithin);

        mainDiv.appendChild(divElement)
        mainDiv.appendChild(sizeElement)
        mainDiv.setAttribute("class", divClasses);

        existingContent.appendChild(mainDiv)

        };
    async getParent (){
        // To display the directory title at top
        const dirTitle = document.getElementById("dir-title");
        let folderName = "my drive";
        let parentId= 'root';
        if (this.FOLDER_ID == 'shared-with-me'){
            folderName = "Shared With Me";
        } else {
            // CHECK IF IN/IS TEAM DRIVE OR NOT
            await gapi.client.drive.files.get({
                        'fileId':this.FOLDER_ID,
                        'supportsAllDrives':true,
                        'includeItemsFromAllDrives':true,
                        'fields': "name, id, parents, driveId"
            }).then(async (resp) =>{
                // Check if "driveId" is present and 
                // the folder id length is less than 30
                // (to make sure, it is infact, a team drive)
                if (resp.result.driveId && this.FOLDER_ID.length < 30){
                    await gapi.client.drive.drives.get({'driveId':this.FOLDER_ID})
                    .then(async function(resp){
                        // IS A TEAM DRIVE 
                        folderName = resp.result.name;
                        parentId = 'shared-drives';
                    });
                } else {
                    // NOT A TEAM DRIVE
                    folderName = resp.result.name;
                    if (this.FOLDER_ID.length > 30 || resp.result.driveId){
                        try {
                            parentId = resp.result.parents[0];
                        } catch { parentId = 'shared-with-me'}
                    }
                }
            })
            };
            // Add directory name to top
            dirTitle.innerText = folderName;
            return parentId;
            
        };	
    async loadContent () {
        // Declare natsort sorter
        let sorter = natsort({ insensitive: true });

        let masterList = [];
        // // Remove whatever content that is there now.
        let oldContent = document.getElementById('content-list');
        oldContent.innerHTML = '';
        
        if (this.IS_SEARCH == "false" && this.FOLDER_ID != 'shared-with-me'){
            // Get folders
            let folderList = await db.files.where({
                'parents': this.FOLDER_ID,
                'peopleid': this.PEOPLE_ID,
                'issearch': this.IS_SEARCH,
                'shared': this.SHARED
            }).and(function(item){
                return item.mimetype == 'folder';
            }).sortBy('name');
            // Sort using natsort!
            folderList.sort(function(a, b) {
                return sorter(a.name, b.name);
            });
            masterList.push(folderList);
            // Get files
            let fileList = await db.files.where({
                'parents': this.FOLDER_ID,
                'peopleid': this.PEOPLE_ID,
                'issearch': this.IS_SEARCH,
                'shared':this.SHARED
            }).and(function(item){
                return item.mimetype != 'folder';
            }).sortBy('name');

            // Sort using natsort!
            fileList.sort(function(a, b) {
                return sorter(a.name, b.name);
            });

            masterList.push(fileList);
            // Flatten array
            masterList = [].concat.apply([], masterList);
        } else if (this.FOLDER_ID == 'shared-with-me'){
            masterList = await db.files.where({
                'parents': 'root',
                'peopleid': this.PEOPLE_ID,
                'issearch': this.IS_SEARCH,
                'shared': this.SHARED
            }).toArray()
        } else {
            masterList = await db.files.where('words').startsWithIgnoreCase(this.QUERY).distinct().toArray()
            let indexHeader = document.getElementById('index-header');
            indexHeader.innerText = 'Search Results'
        }


        // Remove loading icon
        let loadingIcon = document.getElementById('#loading');
        loadingIcon.style = "display: none;";
        let oContent = document.getElementById("content-list");
        oContent.style = "";

        // Display file count in header
        const fileCount = document.getElementById("file-count");
        // Set file count in header
        fileCount.innerText = masterList.length;
        
        // Declare cumulative size variable
        let totalSize = 0;

        // Create elements for each file
        this.getParent().then(async (resp) => {
            this.folderParent = resp;
            this.createContent('..', resp, 'folder', 0).then(async () => {
                for (let i = 0; i < masterList.length; i++){
                    let fileObj = masterList[i];
                    let fileSize = 0;
                    // Add to total directory size
                    if (parseInt(fileObj.size) > 0){
                        totalSize += parseInt(fileObj.size);
                        fileSize = parseInt(fileObj.size);
                    };
                    this.finalList.push(fileObj)
                    this.createContent(fileObj.name, fileObj.id, fileObj.mimetype, fileSize)
                };
            }).then(async () => { 
                // Reflect directory size in header
                const sizeTotal = document.getElementById("total-size");
                sizeTotal.innerText = formatBytes(totalSize);
                this.itemList = document.getElementsByClassName("not-selected");
            })
        });
        
        };
    async checkForCache () {
        let cacheId = this.FOLDER_ID;
        if (this.SHARED == 'true'){
            cacheId = 'root';
        }
        if (this.REFRESH) {
            await db.files.where({
                'parents': cacheId,
                'peopleid': this.PEOPLE_ID,
                'issearch': this.IS_SEARCH,
                'shared': this.SHARED
            }).delete()
        }
        let cacheExists = false;
        let ifCache = await db.files.where({
            'parents': cacheId,
            'peopleid': this.PEOPLE_ID,
            'issearch': this.IS_SEARCH,
            'shared': this.SHARED
        }).sortBy('name');
        if (ifCache.length > 0) {cacheExists = true;};
        return cacheExists;
        };
    async toggleGrid() {
        document.getElementById('show-grid').setAttribute('class','hidden')
        let contentList = document.getElementById('content-list');
        for (let i = 0; i < contentList.childNodes.length; i++){
            let childObj = contentList.childNodes[i];
            childObj.classList.replace('col-span-6','col-span-3')
        }
        document.getElementById('show-list').setAttribute('class','')
        };
    async toggleList() {
        document.getElementById('show-list').setAttribute('class','hidden')
        let contentList = document.getElementById('content-list');
        for (let i = 0; i < contentList.childNodes.length; i++){
            let childObj = contentList.childNodes[i];
            childObj.classList.replace('col-span-3','col-span-6')
        }
        document.getElementById('show-grid').setAttribute('class','')
        };
    async getFiles () {
        let fetchFiles = true;
        let fileList = [];
        let parentFolder = 'root';
        let nextPageToken;
        let querySearch;
        
        // Get files from API and cache
        this.checkForCache().then(async (res) =>{
            if (!res || typeof this.QUERY != "undefined") {
                if (typeof this.QUERY != "undefined"){
                    querySearch = `name contains '${this.QUERY}'`;
                } else if (this.FOLDER_ID == 'shared-with-me'){
                    querySearch = 'sharedWithMe'
                } else if (this.FOLDER_ID != 'shared-with-me') {
                    querySearch = `'${this.FOLDER_ID}' in parents and trashed=false`;
                };
                while (fetchFiles){
                    await gapi.client.drive.files.list({
                        'q':querySearch,
                        'pageSize': 1000,
                        'supportsAllDrives': true,
                        'includeItemsFromAllDrives': true,
                        'corpora':'allDrives',
                        'fields': 'nextPageToken, files(name, id, parents, size, mimeType, modifiedTime, driveId)',
                        'pageToken': nextPageToken,
                    }).then(async function(resp) {
                        fileList.push(resp.result.files);
                        if (!resp.result.nextPageToken) {fetchFiles = false;}
                        else { nextPageToken = resp.result.nextPageToken; };
                    });
                };
                // Flatten array
                fileList = [].concat.apply([], fileList);
                
                for (let i = 0; i < fileList.length; i++){
                    let fileObj = fileList[i];
                    if (this.FOLDER_ID != 'root' && this.FOLDER_ID != 'shared-with-me' || typeof this.QUERY != "undefined" ) {
                        parentFolder = (fileObj.parents).toString();
                    };
                    if (typeof this.QUERY != "undefined"){
                        this.IS_SEARCH = 'true';
                    } 
                    let shortenedMime = (fileObj.mimeType).split('.')
                    if (shortenedMime.length < 3) {
                        shortenedMime =  shortenedMime[0]
                    } else { shortenedMime = shortenedMime[2]};
                        await db.files.put({
                            name: fileObj.name,
                            id: fileObj.id,
                            parents: parentFolder,
                            size: fileObj.size,
                            mimetype: shortenedMime,
                            driveid: fileObj.driveId,
                            peopleid: this.PEOPLE_ID,
                            issearch: this.IS_SEARCH,
                            shared: this.SHARED,
                            words: getAllWords(fileObj.name)
                        });
                };
            };
        }).then(async () => {
            // Remove whatever content that is there now.
            let oldContent = document.getElementById('content-list');
            oldContent.innerHTML = '';
        }).then(async () =>{
            this.loadContent()		
        });
        };
    async sortSize() {
        // // Remove whatever content that is there now.
        let oldContent = document.getElementById('content-list');
        oldContent.innerHTML = '';
        let newList = [];
        setLoading();
        // console.log(this.finalList)
        for (let i = 0; i < this.finalList.length; i++){
            let obj = this.finalList[i]
            let newSize = obj.size;
            if (obj.size == undefined) {
                newSize = '0';
            }
            let newobj = {
                name: obj.name,
                id: obj.id,
                mimetype: obj.mimetype,
                size:parseInt(newSize),
            }
            // console.log(newobj)
            newList.push(newobj)
        }
        if (sorted == 1){
            sorted = 0;
            newList = newList.sort(function (a, b) {
            return a.size - b.size;
            });
        } else {
            sorted = 1;
            newList = newList.sort(function (a, b) {
            return b.size - a.size;
            });
        }
        
        // console.log(newList)
        this.createContent('..', this.folderParent, 'folder', 0).then(function () {
            // Remove loading icon
            let loadingIcon = document.getElementById('#loading');
            loadingIcon.style = "display: none;";
            oldContent.style = "";
            for (let i = 0; i < newList.length; i++){
                let fileObj = newList[i];
                let fileSize = 0;
                // Add to total directory size
                if (parseInt(fileObj.size) > 0){
                    fileSize = parseInt(fileObj.size);
                };
                this.createContent(fileObj.name, fileObj.id, fileObj.mimetype, fileSize)
            };
        })
        };	
    async sortName() {
        let sorter = natsort({ insensitive: true });
        // // Remove whatever content that is there now.
        let oldContent = document.getElementById('content-list');
        oldContent.innerHTML = '';

        let newList = this.finalList;
        
        setLoading();
        
        if (this.sortedname == 1){
            this.sortedname = 0;
            newList = newList.sort(function(a, b) {
                return sorter(a.name, b.name);
            });
        } else {
            this.sortedname = 1;
            sorter = natsort({ insensitive: true, desc: true });
            newList = newList.sort(function(a, b) {
                return sorter(a.name, b.name);
            });
        }
        
        // console.log(newList)
        this.createContent('..', this.folderParent, 'folder', 0).then(function () {
            // Remove loading icon
            let loadingIcon = document.getElementById('#loading');
            loadingIcon.style = "display: none;";
            oldContent.style = "";
            for (let i = 0; i < newList.length; i++){
                let fileObj = newList[i];
                let fileSize = 0;
                // Add to total directory size
                if (parseInt(fileObj.size) > 0){
                    fileSize = parseInt(fileObj.size);
                };
                this.createContent(fileObj.name, fileObj.id, fileObj.mimetype, fileSize)
            };
        })
        };
};