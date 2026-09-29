import { exportGame, loadGame, validateSave } from "./storage.js";

// IndexedDB isn't restricted to localStorage's small string quota. Two atomic
// snapshots protect against interrupted writes; the old local save is untouched.
export function indexedDBRecords(indexedDB) {
  let database;
  const open=()=>database||(database=new Promise((resolve,reject)=>{
    const request=indexedDB.open("football-manager-career",1);
    request.onupgradeneeded=()=>request.result.createObjectStore("snapshots");
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
    request.onblocked=()=>reject(new Error("Close other game tabs to unlock saving."));
  }));
  return {
    async read(){
      const db=await open();
      return new Promise((resolve,reject)=>{
        const tx=db.transaction("snapshots","readonly"),store=tx.objectStore("snapshots");
        const current=store.get("current"),previous=store.get("previous");
        tx.oncomplete=()=>resolve([current.result,previous.result].filter(Boolean));
        tx.onabort=()=>reject(tx.error||new Error("Unable to read the saved career."));
      });
    },
    async write(current,previous){
      const db=await open();
      await new Promise((resolve,reject)=>{
        const tx=db.transaction("snapshots","readwrite"),store=tx.objectStore("snapshots");
        if(previous)store.put(previous,"previous");
        else store.delete("previous");
        store.put(current,"current");
        tx.oncomplete=resolve;
        tx.onabort=()=>reject(tx.error||new Error("Unable to save the career."));
      });
    }
  };
}
export function createSaveRepository({records,legacy}) {
  let lastGood=null,queue=Promise.resolve(),generation=0,resetting=null;
  const serialize=state=>{
    let previousTime=0;
    try{previousTime=Number(JSON.parse(lastGood).savedAt)||0;}catch{/* First save. */}
    return exportGame(state,false,Math.max(Date.now(),previousTime+1));
  };
  return {
    async load(){
      let snapshots=[],readError;
      try{snapshots=await records.read();}catch(error){readError=error;}
      const local=legacy.getItem("football-manager-save-v1")??legacy.getItem("pl-manager-save-v8");
      const candidates=snapshots.map((json,index)=>({json,backup:index>0}));
      if(local)candidates.push({json:local,backup:!!snapshots.length});
      const timestamp=json=>{try{return JSON.parse(json).savedAt||0;}catch{return Infinity;}};
      candidates.sort((a,b)=>timestamp(b.json)-timestamp(a.json));
      let invalid;
      for(const {json,backup} of candidates) {
        try{const state=validateSave(JSON.parse(json));lastGood=json;return {state,recovered:backup||!!invalid};}
        catch(error){invalid=error;}
      }
      // Never replace an unreadable career with a new game automatically.
      if(invalid||readError)throw invalid||readError;
      const state=loadGame(legacy);
      return {state,recovered:!!invalid};
    },
    save(state){
      if(resetting)return Promise.reject(new Error("A new career is being saved. Please wait."));
      const owner=generation;
      const persist=async()=>{
        // A queued autosave from the previous career must not follow a reset.
        if(owner!==generation)return;
        const json=serialize(state);
        try{await records.write(json,lastGood);lastGood=json;}
        catch(error){
          // Browsers with IndexedDB disabled can still save smaller careers.
          try{legacy.setItem("football-manager-save-v1",json);lastGood=json;}catch{throw error;}
        }
      };
      const result=queue.then(persist);
      queue=result.catch(()=>{});
      return result;
    },
    reset(state){
      if(resetting)return resetting;
      generation++;
      const persist=async()=>{
        const json=serialize(state);
        let durable=false,writeError;
        // Current + deletion of the recovery snapshot commit in one transaction.
        try{await records.write(json,null);durable=true;}catch(error){writeError=error;}
        // Replace only this game's legacy save. Never clear unrelated site data.
        try{legacy.setItem("football-manager-save-v1",json);durable=true;}
        catch(error){
          if(!durable)throw writeError||error;
          try{legacy.removeItem?.("football-manager-save-v1");}catch{/* IndexedDB already committed. */}
        }
        try{legacy.removeItem?.("pl-manager-save-v8");}catch{/* The newer primary snapshot wins. */}
        lastGood=json;
      };
      const result=queue.then(persist);
      resetting=result.finally(()=>{resetting=null;});
      queue=resetting.catch(()=>{});
      return resetting;
    }
  };
}
