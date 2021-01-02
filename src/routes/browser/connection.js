import Dexie from 'dexie';

var db = new Dexie("file_cache");
db.version(1).stores({
    files: 'name,id,[parents+peopleid],size,mimetype,driveid',
    drives: 'name,id,peopleid',
});

export default db;