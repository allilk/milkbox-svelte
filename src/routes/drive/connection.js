import Dexie from 'dexie'

const db = new Dexie("file_cache");
db.version(10).stores({
    files: 'name,id,[parents+peopleid+shared],size,mimeType,driveid,*words',
    drives: 'name,id,peopleid',
    settings: 'user'
});

export default db;