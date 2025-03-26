import React, { useState, useEffect } from 'react';
import './FileExplorer.css';
import { FaFolder, FaFile, FaTrash, FaEdit, FaPlus, FaSort } from 'react-icons/fa';

const FileExplorer = ({
  fileSystem,
  setFileSystem,
  findFolderById,
  createItem,
  initialFolderId,
  setExplorerFolderId
}) => {
  const [currentFolderId, setCurrentFolderId] = useState(initialFolderId || 'root');
  const [selectedItem, setSelectedItem] = useState(null);
  const [renameItem, setRenameItem] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    setCurrentFolderId(initialFolderId);
  }, [initialFolderId]);

  const currentFolder = findFolderById(currentFolderId, fileSystem);

  const handleOpenItem = (item) => {
    if (item.type === 'folder') {
      setCurrentFolderId(item.id);
      setExplorerFolderId && setExplorerFolderId(item.id);
    } else {
      setPreviewItem(item);
    }
  };

  const goBack = () => {
    setCurrentFolderId('root');
    setExplorerFolderId && setExplorerFolderId('root');
  };

  const handleCreateFile = () => {
    createItem(currentFolderId, {
      id: `file-${Date.now()}`,
      name: `Untitled.txt`,
      type: 'file',
      content: ''
    });
  };

  const handleCreateFolder = () => {
    createItem(currentFolderId, {
      id: `folder-${Date.now()}`,
      name: `New Folder`,
      type: 'folder',
      children: []
    });
  };

  const handleDelete = (item) => {
    setFileSystem((prev) => {
      const newFS = structuredClone(prev);
      const folder = findFolderById(currentFolderId, newFS);
      if (folder?.children) {
        folder.children = folder.children.filter((child) => child.id !== item.id);
      }
      return newFS;
    });
  };

  const handleRename = (item) => {
    setRenameItem(item);
  };

  const handleRenameSubmit = (e, item) => {
    e.preventDefault();
    const newName = e.target.rename.value.trim();
    if (!newName) return;
    setFileSystem((prev) => {
      const newFS = structuredClone(prev);
      const folder = findFolderById(currentFolderId, newFS);
      if (folder?.children) {
        const target = folder.children.find((child) => child.id === item.id);
        if (target) {
          target.name = newName;
          target.dateModified = new Date().toLocaleString();
        }
      }
      return newFS;
    });
    setRenameItem(null);
  };

  const handleSort = () => {
    setFileSystem((prev) => {
      const newFS = structuredClone(prev);
      const folder = findFolderById(currentFolderId, newFS);
      if (folder?.children) {
        folder.children.sort((a, b) => a.name.localeCompare(b.name));
      }
      return newFS;
    });
  };

  if (!currentFolder) {
    return <div className="file-explorer">Folder not found.</div>;
  }

  return (
    <div className="file-explorer">
      <div className="explorer-toolbar">
        <button onClick={goBack}>Back</button>
        <button onClick={handleCreateFile}>
          <FaPlus /> File
        </button>
        <button onClick={handleCreateFolder}>
          <FaPlus /> Folder
        </button>
        <button onClick={handleSort}>
          <FaSort /> Sort
        </button>
      </div>
      <h2>{currentFolder.name}</h2>
      <ul>
        {currentFolder.children?.map((item) => (
          <li key={item.id} onClick={() => setSelectedItem(item)}>
            {item.type === 'folder' ? <FaFolder /> : <FaFile />} {item.name}
            {selectedItem?.id === item.id && (
              <div className="file-actions">
                <button onClick={() => handleOpenItem(item)}>Open</button>
                <button onClick={() => handleDelete(item)}>
                  <FaTrash />
                </button>
                <button onClick={() => handleRename(item)}>
                  <FaEdit />
                </button>
              </div>
            )}
            {renameItem?.id === item.id && (
              <form onSubmit={(e) => handleRenameSubmit(e, item)} className="rename-form">
                <input name="rename" defaultValue={item.name} />
                <button type="submit">OK</button>
              </form>
            )}
          </li>
        ))}
      </ul>

      {previewItem && (
        <div className="file-preview-modal">
          <div className="file-preview-content">
            <button className="close-preview" onClick={() => setPreviewItem(null)}>
              X
            </button>
            <h3>{previewItem.name}</h3>
            {previewItem.type === 'image' && (
              <img
                src={previewItem.content}
                alt={previewItem.name}
                style={{ maxWidth: '90%', maxHeight: '80vh' }}
              />
            )}
            {previewItem.type === 'video' && (
              <video
                src={previewItem.content}
                controls
                style={{ maxWidth: '90%', maxHeight: '80vh' }}
              />
            )}
            {previewItem.type !== 'image' && previewItem.type !== 'video' && (
              <p>Preview not available for this file type.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
