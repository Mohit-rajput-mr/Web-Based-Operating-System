export function findItemById(id, items, type = null) {
    for (let item of items) {
      if (item.id === id && (!type || item.type === type)) return item;
      if (item.type === "folder" && item.children) {
        const found = findItemById(id, item.children, type);
        if (found) return found;
      }
    }
    return null;
  }
  
  export function createNewFile(parentId, fileData, fileSystem, setFileSystem) {
    const newId = `file-${Date.now()}`;
    const newFile = { id: newId, ...fileData };
    setFileSystem((prev) => {
      const newFS = structuredClone(prev);
      const parent = findItemById(parentId, newFS, "folder");
      if (parent) {
        parent.children.push(newFile);
      }
      return newFS;
    });
    return newId;
  }
  
  export function createNewFolder(parentId, folderData, fileSystem, setFileSystem) {
    const newId = `folder-${Date.now()}`;
    const newFolder = { id: newId, ...folderData, children: [] };
    setFileSystem((prev) => {
      const newFS = structuredClone(prev);
      const parent = findItemById(parentId, newFS, "folder");
      if (parent) {
        parent.children.push(newFolder);
      }
      return newFS;
    });
    return newId;
  }
  