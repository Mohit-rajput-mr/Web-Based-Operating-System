export async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("UltraProOS", 1);
    request.onerror = () => reject("Error opening DB");
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("fileSystem")) {
        db.createObjectStore("fileSystem", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
    };
  });
}

export async function saveFileSystem(db, fileSystem) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("fileSystem", "readwrite");
    const store = tx.objectStore("fileSystem");
    store.put({ id: "fs", data: fileSystem });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject("Error saving file system");
  });
}

export async function loadFileSystem(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("fileSystem", "readonly");
    const store = tx.objectStore("fileSystem");
    const request = store.get("fs");
    request.onsuccess = () => resolve(request.result ? request.result.data : null);
    request.onerror = () => reject("Error loading file system");
  });
}
