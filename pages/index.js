import React, { useState, useEffect, useCallback } from 'react';
import Taskbar from '../components/Taskbar/Taskbar';
import WindowsManager from '../components/WindowsManager/WindowsManager';
import PersonalizationModal from '../components/PersonalizationModal/PersonalizationModal';
import Terminal from '../components/Terminal/Terminal';
import BrowserModal from '../components/BrowserModal/BrowserModal';
import PropertiesModal from '../components/PropertiesModal/PropertiesModal';
import TextEditor from '../components/TextEditorModal/TextEditorModal';
import { openDB, saveFileSystem, loadFileSystem } from '../helpers/indexedDB';
import './index.css';

/**
 * Snap a position to the nearest grid cell.
 * Adjust gridSize as you see fit.
 */
function snapToGrid({ x, y }, gridSize = 80) {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize
  };
}

/**
 * When dropping an item, start from a snapped position and
 * keep moving down until we find a free spot (no overlap).
 */
function getNextFreeSnappedPosition(items, startPos) {
  const iconSize = 64;
  const gap = 20;
  const step = 80; // how far to move down if there's a collision
  let { x, y } = startPos;

  const overlaps = (posA, posB) => {
    return (
      Math.abs(posA.x - posB.x) < iconSize + gap &&
      Math.abs(posA.y - posB.y) < iconSize + gap
    );
  };

  let found = false;
  while (!found) {
    const collision = items.some((i) => {
      const ipos = i.position || { x: 0, y: 0 };
      return overlaps(ipos, { x, y });
    });
    if (collision) {
      y += step;
    } else {
      found = true;
    }
  }
  return { x, y };
}

/** 
 * This is used on creation of a new item if item.position is not set.
 * It ensures a "grid-like" layout (snapped + no overlap) from (50,50) onward.
 */
function getNextFreePosition(items) {
  const iconSize = 64;
  const gap = 20;
  const step = 80;
  let x = 50;
  let y = 50;

  const overlaps = (posA, posB) => {
    return (
      Math.abs(posA.x - posB.x) < iconSize + gap &&
      Math.abs(posA.y - posB.y) < iconSize + gap
    );
  };

  let found = false;
  while (!found) {
    const collision = items.some((i) => {
      const ipos = i.position || { x: 0, y: 0 };
      return overlaps(ipos, { x, y });
    });
    if (collision) {
      y += step;
    } else {
      found = true;
    }
  }

  // Snap to grid before returning
  return snapToGrid({ x, y });
}

export default function HomePage() {
  const [fileSystem, setFileSystem] = useState([
    {
      id: 'root',
      name: 'Desktop',
      type: 'folder',
      dateModified: new Date().toLocaleString(),
      children: [
        {
          id: 'thispc',
          name: 'This PC',
          type: 'folder',
          dateModified: new Date().toLocaleString(),
          children: []
        },
        {
          id: 'pictures',
          name: 'Pictures',
          type: 'folder',
          dateModified: new Date().toLocaleString(),
          children: []
        },
        // Pre-add Word, PPT, Excel by default.
        {
          id: 'wordApp',
          name: 'Word',
          type: 'app',
          icon: '/word.png',
          dateModified: new Date().toLocaleString()
        },
        {
          id: 'pptApp',
          name: 'PowerPoint',
          type: 'app',
          icon: '/ppt.png',
          dateModified: new Date().toLocaleString()
        },
        {
          id: 'excelApp',
          name: 'Excel',
          type: 'app',
          icon: '/excel.png',
          dateModified: new Date().toLocaleString()
        }
      ]
    }
  ]);

  // On mount, load from IndexedDB
  useEffect(() => {
    openDB().then((db) => {
      loadFileSystem(db).then((data) => {
        if (data) {
          // Merge or "ensure" Word/Excel/PPT icons
          const updated = structuredClone(data);
          const root = updated[0];
          if (!root.children) root.children = [];

          function ensureApp(id, name, icon) {
            const existing = root.children.find((item) => item.id === id);
            if (!existing) {
              root.children.push({
                id,
                name,
                type: 'app',
                icon,
                dateModified: new Date().toLocaleString()
              });
            }
          }
          ensureApp('wordApp', 'Word', '/word.png');
          ensureApp('pptApp', 'PowerPoint', '/ppt.png');
          ensureApp('excelApp', 'Excel', '/excel.png');

          setFileSystem(updated);
        }
      });
    });
  }, []);

  // Save to IndexedDB whenever fileSystem changes
  useEffect(() => {
    openDB().then((db) => {
      saveFileSystem(db, fileSystem);
    });
  }, [fileSystem]);

  // Helpers
  const findFolderById = useCallback(
    (folderId, current = fileSystem) => {
      for (let item of current) {
        if (item.id === folderId && item.type === 'folder') return item;
        if (item.type === 'folder' && item.children) {
          const found = findFolderById(folderId, item.children);
          if (found) return found;
        }
      }
      return null;
    },
    [fileSystem]
  );

  const createItem = (parentId, item) => {
    setFileSystem((prev) => {
      const newFS = structuredClone(prev);
      const parentFolder = findFolderById(parentId, newFS);
      if (parentFolder) {
        // If position not provided, find next free snapped position
        if (!item.position) {
          item.position = getNextFreePosition(parentFolder.children);
        }
        parentFolder.children.push({
          ...item,
          dateModified: new Date().toLocaleString()
        });
      }
      return newFS;
    });
  };

  const savePhotoToPictures = (photoDataUrl) => {
    createItem('pictures', {
      id: `photo-${Date.now()}`,
      name: `Photo-${Date.now()}.png`,
      type: 'image',
      content: photoDataUrl
    });
  };

  // Desktop state
  const desktopFolder = findFolderById('root');
  const [selectedItems, setSelectedItems] = useState([]);
  const [clipboard, setClipboard] = useState({ mode: null, items: [] });

  const handleIconClick = (e, item) => {
    e.stopPropagation();
    if (e.ctrlKey) {
      setSelectedItems((prev) =>
        prev.includes(item.id)
          ? prev.filter((id) => id !== item.id)
          : [...prev, item.id]
      );
    } else if (e.shiftKey) {
      setSelectedItems((prev) =>
        prev.includes(item.id) ? prev : [...prev, item.id]
      );
    } else {
      setSelectedItems([item.id]);
    }
  };

  // Text Editor states
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [currentTextFile, setCurrentTextFile] = useState(null);

  const openProperties = (item) => {
    setPropertiesItem(item);
  };

  const handleIconDoubleClick = (item) => {
    if (item.type === 'folder') {
      setShowFileExplorer(true);
      setExplorerFolderId(item.id);
    } else if (item.type === 'file') {
      if (item.name.endsWith('.txt')) {
        // open in text editor
        setCurrentTextFile(item);
        setShowTextEditor(true);
      } else {
        // fallback
        openProperties(item);
      }
    } else if (item.type === 'app') {
      // If it's Word/PPT/Excel
      switch (item.id) {
        case 'wordApp':
          setShowWord(true);
          break;
        case 'pptApp':
          setShowPPT(true);
          break;
        case 'excelApp':
          setShowExcel(true);
          break;
        default:
          openProperties(item);
          break;
      }
    } else {
      openProperties(item);
    }
  };

  // Desktop management
  const sortDesktopItems = () => {
    setFileSystem((prev) => {
      const newFS = structuredClone(prev);
      const root = findFolderById('root', newFS);
      if (root && root.children) {
        root.children.sort((a, b) => a.name.localeCompare(b.name));
      }
      return newFS;
    });
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Drag & drop
  const handleDesktopDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    const [itemId, offsetX, offsetY] = data.split(',');
    const rect = e.currentTarget.getBoundingClientRect();
    const newX = e.clientX - rect.left - parseFloat(offsetX);
    const newY = e.clientY - rect.top - parseFloat(offsetY);

    setFileSystem((prev) => {
      const newFS = structuredClone(prev);
      const root = findFolderById('root', newFS);
      if (!root) return newFS;
      const item = root.children.find((i) => i.id === itemId);
      if (item) {
        // First snap to grid
        const snappedPos = snapToGrid({ x: newX, y: newY });
        // Then find the next free spot if there's overlap
        const newPos = getNextFreeSnappedPosition(
          root.children.filter((i) => i.id !== itemId),
          snappedPos
        );
        item.position = newPos;
      }
      return newFS;
    });
  };

  const handleDesktopDragOver = (e) => e.preventDefault();

  const handleIconDragStart = (e, item) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setData('text/plain', [item.id, offsetX, offsetY]);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedItems.length === 0) return;
      const root = findFolderById('root');
      if (!root) return;
      const actualItems = root.children.filter((i) =>
        selectedItems.includes(i.id)
      );

      // copy
      if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        setClipboard({ mode: 'copy', items: actualItems });
      }
      // cut
      if (e.ctrlKey && e.key.toLowerCase() === 'x') {
        setClipboard({ mode: 'cut', items: actualItems });
      }
      // paste
      if (e.ctrlKey && e.key.toLowerCase() === 'v') {
        if (clipboard.items.length > 0) {
          if (clipboard.mode === 'copy') {
            clipboard.items.forEach((clipItem) => {
              createItem('root', {
                ...clipItem,
                id: `copy-${Date.now()}-${clipItem.id}`,
                name: `${clipItem.name} (copy)`
              });
            });
          } else if (clipboard.mode === 'cut') {
            setFileSystem((prev) => {
              const newFS = structuredClone(prev);
              const rootFolder = findFolderById('root', newFS);
              if (!rootFolder) return newFS;
              // remove them from old location
              rootFolder.children = rootFolder.children.filter(
                (i) => !clipboard.items.find((ci) => ci.id === i.id)
              );
              // add them in
              clipboard.items.forEach((ci) => {
                rootFolder.children.push(ci);
              });
              return newFS;
            });
            setClipboard({ mode: null, items: [] });
          }
        }
      }
      // delete
      if (e.key === 'Delete') {
        setFileSystem((prev) => {
          const newFS = structuredClone(prev);
          const rootFolder = findFolderById('root', newFS);
          if (!rootFolder) return newFS;
          rootFolder.children = rootFolder.children.filter(
            (i) => !selectedItems.includes(i.id)
          );
          return newFS;
        });
        setSelectedItems([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItems, clipboard, createItem, findFolderById]);

  // Context menu
  const [contextMenu, setContextMenu] = useState(null);
  const [contextTarget, setContextTarget] = useState(null);

  const handleDesktopContextMenu = (e) => {
    e.preventDefault();
    setContextTarget(null);
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleItemContextMenu = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setContextTarget(item);
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenu(null);

  // Properties
  const [propertiesItem, setPropertiesItem] = useState(null);

  // App states
  const [showFileExplorer, setShowFileExplorer] = useState(false);
  const [explorerFolderId, setExplorerFolderId] = useState('root');
  const [showCamera, setShowCamera] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [showStock, setShowStock] = useState(false);
  const [showJoke, setShowJoke] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showWebSearch, setShowWebSearch] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [showLocationInfo, setShowLocationInfo] = useState(false);

  // Word, PPT, Excel
  const [showWord, setShowWord] = useState(false);
  const [showPPT, setShowPPT] = useState(false);
  const [showExcel, setShowExcel] = useState(false);

  // Personalization
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [background, setBackground] = useState({ color: '#0a0a0a', image: '' });

  // Power overlay
  const [powerOverlay, setPowerOverlay] = useState({ active: false, type: '' });
  const handleShutdown = () => setPowerOverlay({ active: true, type: 'shutdown' });
  const handleSleep = () => setPowerOverlay({ active: true, type: 'sleep' });
  const wakeUp = () => setPowerOverlay({ active: false, type: '' });

  const openApp = (appName) => {
    switch (appName) {
      case 'fileExplorer':
        setShowFileExplorer(true);
        setExplorerFolderId('root');
        break;
      case 'camera':
        setShowCamera(true);
        break;
      case 'calculator':
        setShowCalculator(true);
        break;
      case 'terminal':
        setShowTerminal(true);
        break;
      case 'browser':
      case 'webSearch':
        setShowBrowser(true);
        break;
      case 'weather':
        setShowWeather(true);
        break;
      case 'news':
        setShowNews(true);
        break;
      case 'currency':
        setShowCurrency(true);
        break;
      case 'dictionary':
        setShowDictionary(true);
        break;
      case 'stock':
        setShowStock(true);
        break;
      case 'joke':
        setShowJoke(true);
        break;
      case 'game':
        setShowGame(true);
        break;
      case 'voiceAssistant':
        setShowVoiceAssistant(true);
        break;
      case 'systemInfo':
        setShowSystemInfo(true);
        break;
      case 'locationInfo':
        setShowLocationInfo(true);
        break;
      case 'shutdown':
        handleShutdown();
        break;
      case 'sleep':
        handleSleep();
        break;
      default:
        break;
    }
  };

  const [minimizedWindows, setMinimizedWindows] = useState([]);

  return (
    <div
      className="desktop"
      style={{
        backgroundColor: background.color,
        backgroundImage: background.image ? `url(${background.image})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      onContextMenu={handleDesktopContextMenu}
      onClick={() => {
        closeContextMenu();
        setSelectedItems([]);
      }}
      onDrop={handleDesktopDrop}
      onDragOver={handleDesktopDragOver}
    >
      <h1 className="desktop-title">Ultra Pro OS</h1>

      {/* Desktop Icons */}
      {desktopFolder?.children?.map((item, index) => {
        // Provide a default fallback position in case item.position doesn't exist
        const defaultPos = {
          x: 50 + (index % 5) * 100,
          y: 50 + Math.floor(index / 5) * 100
        };
        const pos = item.position || defaultPos;
        const isSelected = selectedItems.includes(item.id);

        let iconSrc = '/file-icon.png';
        if (item.id === 'thispc') iconSrc = '/thispc-icon.png';
        else if (item.type === 'folder') iconSrc = '/folder-icon.png';
        else if (item.icon) iconSrc = item.icon; // word.png, ppt.png, excel.png, etc.

        return (
          <div
            key={item.id}
            className={`desktop-icon ${isSelected ? 'selected-icon' : ''}`}
            style={{ left: pos.x, top: pos.y }}
            draggable
            onDragStart={(e) => handleIconDragStart(e, item)}
            onClick={(e) => handleIconClick(e, item)}
            onDoubleClick={() => handleIconDoubleClick(item)}
            onContextMenu={(e) => handleItemContextMenu(e, item)}
          >
            <img src={iconSrc} alt={item.name} />
            <span>{item.name}</span>
          </div>
        );
      })}

      {/* Desktop Context Menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <ul>
            <li
              onClick={() => {
                handleRefresh();
                closeContextMenu();
              }}
            >
              Refresh
            </li>
            <li
              onClick={() => {
                sortDesktopItems();
                closeContextMenu();
              }}
            >
              Sort
            </li>
            <li
              onClick={() => {
                setShowPersonalization(true);
                closeContextMenu();
              }}
            >
              Background
            </li>
            <li
              onClick={() => {
                createItem('root', {
                  id: `file-${Date.now()}`,
                  name: `NewFile-${Date.now()}.txt`,
                  type: 'file',
                  content: ''
                });
                closeContextMenu();
              }}
            >
              New File
            </li>
            <li
              onClick={() => {
                createItem('root', {
                  id: `folder-${Date.now()}`,
                  name: `NewFolder-${Date.now()}`,
                  type: 'folder',
                  children: []
                });
                closeContextMenu();
              }}
            >
              New Folder
            </li>
            <li
              onClick={() => {
                setShowTerminal(true);
                closeContextMenu();
              }}
            >
              Mohit's Terminal
            </li>
          </ul>
        </div>
      )}

      {/* Taskbar */}
      <Taskbar
        onShutdown={handleShutdown}
        onSleep={handleSleep}
        onOpenApp={openApp}
        minimizedWindows={minimizedWindows}
        onRestoreWindow={(id) => {
          // remove from minimized
          setMinimizedWindows((prev) => prev.filter((w) => w.id !== id));
          // re-open the app
          openApp(id);
        }}
      />

      {/* WindowsManager */}
      <WindowsManager
        fileSystem={fileSystem}
        setFileSystem={setFileSystem}
        findFolderById={findFolderById}
        createItem={createItem}
        savePhotoToPictures={savePhotoToPictures}
        explorerFolderId={explorerFolderId}
        setExplorerFolderId={setExplorerFolderId}
        showFileExplorer={showFileExplorer}
        setShowFileExplorer={setShowFileExplorer}
        showCamera={showCamera}
        setShowCamera={setShowCamera}
        showCalculator={showCalculator}
        setShowCalculator={setShowCalculator}
        showWeather={showWeather}
        setShowWeather={setShowWeather}
        showNews={showNews}
        setShowNews={setShowNews}
        showCurrency={showCurrency}
        setShowCurrency={setShowCurrency}
        showDictionary={showDictionary}
        setShowDictionary={setShowDictionary}
        showStock={showStock}
        setShowStock={setShowStock}
        showJoke={showJoke}
        setShowJoke={setShowJoke}
        showGame={showGame}
        setShowGame={setShowGame}
        showWebSearch={showWebSearch}
        setShowWebSearch={setShowWebSearch}
        showVoiceAssistant={showVoiceAssistant}
        setShowVoiceAssistant={setShowVoiceAssistant}
        showSystemInfo={showSystemInfo}
        setShowSystemInfo={setShowSystemInfo}
        showLocationInfo={showLocationInfo}
        setShowLocationInfo={setShowLocationInfo}
        showWord={showWord}
        setShowWord={setShowWord}
        showPPT={showPPT}
        setShowPPT={setShowPPT}
        showExcel={showExcel}
        setShowExcel={setShowExcel}
        onMinimizeWindow={(win) => {
          setMinimizedWindows((prev) => [...prev, win]);
          switch (win.id) {
            case 'fileExplorer':
              setShowFileExplorer(false);
              break;
            case 'camera':
              setShowCamera(false);
              break;
            case 'calculator':
              setShowCalculator(false);
              break;
            case 'weather':
              setShowWeather(false);
              break;
            case 'news':
              setShowNews(false);
              break;
            case 'currency':
              setShowCurrency(false);
              break;
            case 'dictionary':
              setShowDictionary(false);
              break;
            case 'stock':
              setShowStock(false);
              break;
            case 'joke':
              setShowJoke(false);
              break;
            case 'game':
              setShowGame(false);
              break;
            case 'webSearch':
              setShowWebSearch(false);
              break;
            case 'voiceAssistant':
              setShowVoiceAssistant(false);
              break;
            case 'systemInfo':
              setShowSystemInfo(false);
              break;
            case 'locationInfo':
              setShowLocationInfo(false);
              break;
            case 'word':
              setShowWord(false);
              break;
            case 'ppt':
              setShowPPT(false);
              break;
            case 'excel':
              setShowExcel(false);
              break;
            default:
              break;
          }
        }}
      />

      {/* Terminal */}
      {showTerminal && <Terminal onClose={() => setShowTerminal(false)} />}

      {/* Browser */}
      {showBrowser && <BrowserModal onClose={() => setShowBrowser(false)} />}

      {/* Properties */}
      {propertiesItem && (
        <PropertiesModal
          item={propertiesItem}
          onClose={() => setPropertiesItem(null)}
        />
      )}

      {/* Text Editor for .txt files */}
      {showTextEditor && currentTextFile && (
        <TextEditor
          file={currentTextFile}
          onClose={() => setShowTextEditor(false)}
          onSave={(updatedFile) => {
            // Update the file content
            setFileSystem((prev) => {
              const newFS = structuredClone(prev);
              const root = findFolderById('root', newFS);
              if (!root) return newFS;

              const updateFile = (folder) => {
                folder.forEach((f, idx) => {
                  if (f.id === updatedFile.id) {
                    folder[idx] = {
                      ...updatedFile,
                      dateModified: new Date().toLocaleString()
                    };
                  } else if (f.children) {
                    updateFile(f.children);
                  }
                });
              };
              updateFile(newFS[0].children);
              return newFS;
            });
            setShowTextEditor(false);
          }}
        />
      )}

      {/* Personalization */}
      {showPersonalization && (
        <PersonalizationModal
          currentBackground={background}
          onChange={setBackground}
          onClose={() => setShowPersonalization(false)}
        />
      )}

      {/* Power Overlay */}
      {powerOverlay.active && (
        <div className="power-overlay">
          <div className="power-message">
            <h2>
              {powerOverlay.type === 'shutdown'
                ? 'Shutting Down...'
                : 'Sleeping...'}
            </h2>
            <button className="wake-up-btn" onClick={wakeUp}>
              Wake Up
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
