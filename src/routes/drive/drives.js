import db from './connection';
export default class getDrives{
    constructor(people_id){
        this.PEOPLE_ID = people_id;
        this.driveList = [];
        this.REFRESH;
    };
    async init(){
        this.listDrives();
    }
    async listDrives() {
        let REFRESH = this.REFRESH;
        async function checkForCache(){
            if (REFRESH) {
                await db.drives.where({
                    'peopleid': PEOPLE_ID,
                }).delete()
            }
            let cacheExists = false;
            let ifCache = await db.drives.where('peopleid').equals(this.PEOPLE_ID).toArray();
            if (ifCache.length > 0) {cacheExists = true;};
            return cacheExists;
        };
        let fetchDrives = true;
        let nextPageToken;
        checkForCache().then(async function(res){
            if (res == false) {
                while (fetchDrives) {
                    await gapi.client.drive.drives.list({
                        'pageSize': 100,
                        'pageToken': nextPageToken
                    }).then(function(response){
                        
                        this.driveList.push(response.result.drives)
                        if (!response.result.nextPageToken){
                            fetchDrives = false;
                        } else {
                            nextPageToken = response.result.nextPageToken;
                        };
                    });
                };
                this.driveList = [].concat.apply([], this.driveList);
                for (let i = 0; i < this.driveList.length; i++){
                    let drive = this.driveList[i];
                    await db.drives.put({
                        name: drive.name, id: drive.id, peopleid: this.PEOPLE_ID,
                    });
                }
            }
        }).then(async function (){
            await this.loadContent();
        });
    };
    async loadContent() {
        if (this.driveList.length < 1){
            this.driveList = await db.drives.where('peopleid').equals(this.PEOPLE_ID).toArray();
        }
        let oldContent = document.getElementById('content-list');
        oldContent.innerHTML = '';
    
        let loadingIcon = document.getElementById('#loading');
        loadingIcon.style = 'display: none;';
    
        for (let i = 0; i < this.driveList.length; i++){
            let divElement = document.createElement('div');
            let drive = driveList[i];
            let newObj = document.createElement("a");
            let newContent = document.createTextNode(drive.name);
            let bottomContent = document.createElement('div');
            bottomContent.innerText = `(${drive.id})`;
            bottomContent.setAttribute('class','text-xs text-gray-500')
            bottomContent.id = 'file';
            newObj.href = `drive/${drive.id}`;
            newObj.setAttribute("class", "drive-obj whitespace-normal text-center text-lg px-16 py-6 shadow-inner col-span-2 md:col-span-1");
            
            divElement.appendChild(newContent);
            divElement.appendChild(bottomContent)
            newObj.appendChild(divElement);
            oldContent.appendChild(newObj);
            
        };
        let totalDrives = document.getElementById('total-drives');
        totalDrives.innerText = `(${this.driveList.length})`;
        itemList = document.getElementsByClassName("drive-obj");
    };
};
