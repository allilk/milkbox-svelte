import Dexie from 'dexie';

var db = new Dexie("file_cache");
db.version(4).stores({
    files: 'name,id,[parents+peopleid+issearch+shared],size,mimetype,driveid,*words',
    drives: 'name,id,peopleid',
});

export default db;