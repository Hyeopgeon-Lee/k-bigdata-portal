// The browser keeps legacy records on this device. Read only after server authorization.
function guarded(kind){
  const allowed=action=>globalThis.portalLearning?.[action]===true &&
    Date.now()<globalThis.portalLearning.expires;
  return {
    getItem(key){return allowed("read")?globalThis[kind].getItem(key):null;},
    setItem(key,value){if(allowed("write"))globalThis[kind].setItem(key,value);},
    removeItem(key){if(allowed("write"))globalThis[kind].removeItem(key);}
  };
}
export const learningLocal=guarded("localStorage");
export const learningSession=guarded("sessionStorage");
