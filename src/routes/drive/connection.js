import Dexie from 'dexie';

var db = new Dexie("file_cache");
db.version(7).stores({
    files: 'name,id,[parents+peopleid+issearch+shared],size,mimetype,driveid,*words',
    drives: 'name,id,peopleid',
    settings: 'user'
});

export default db;