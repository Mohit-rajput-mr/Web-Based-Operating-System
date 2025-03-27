import React, {
  useState, useEffect, useCallback, useRef
} from 'react';
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
 * 100 new features. 
 * - 5 are fully integrated:
 *    1) Clipboard History Manager
 *    2) Dark Mode Scheduler
 *    3) System Resource Monitor
 *    4) Screenshot & Snipping Tool
 *    5) Voice Command Center
 * - The other 95 remain placeholders for future expansion.
 */
const newFeatures = [
  { id: 1, name: 'Clipboard History Manager' },  // Integrated
  { id: 2, name: 'Dark Mode Scheduler' },         // Integrated
  { id: 3, name: 'System Resource Monitor' },     // Integrated
  { id: 4, name: 'Screenshot & Snipping Tool' },  // Integrated
  { id: 5, name: 'Voice Command Center' },        // Integrated
  { id: 6, name: 'Audio Recording (Placeholder)' },
  { id: 7, name: 'Video Editing (Placeholder)' },
  { id: 8, name: '3D Model Viewer (Placeholder)' },
  { id: 9, name: 'Virtual Assistant with AI (Placeholder)' },
  { id: 10, name: 'Real-time Collaboration (Placeholder)' },
  // ...
  // Continue up to 100 total
  { id: 96, name: 'Data Visualization Tools (Placeholder)' },
  { id: 97, name: 'Multi-factor Authentication (Placeholder)' },
  { id: 98, name: 'Smart Projector/External Display (Placeholder)' },
  { id: 99, name: 'Speech-to-Text Everywhere (Placeholder)' },
  { id: 100, name: 'Plugin System for Extensions (Placeholder)' },
];

/**
 * Minimal "window" for each of the 5 integrated features
 * so you can see them in action. In a real project, you'd
 * likely split them into separate files/components.
 */

// 1) Clipboard History Manager
function ClipboardHistoryWindow({ onClose }) {
  const [history, setHistory] = useState([]);

  // On mount, read from navigator.clipboard if possible
  // (Some browsers only allow reading if triggered by user gesture)
  useEffect(() => {
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(text => {
        // Just show the last text snippet as the "current" item
        setHistory(prev => [text, ...prev]);
      }).catch(() => {
        // Clipboard read might fail if not user-initiated
      });
    }
  }, []);

  const handleCopy = async () => {
    // Copy the current date/time as a test
    const toCopy = `Clipboard test at ${new Date().toLocaleString()}`;
    await navigator.clipboard.writeText(toCopy);
    setHistory(prev => [toCopy, ...prev]);
  };

  return (
    <div className="feature-window">
      <h2>Clipboard History Manager</h2>
      <button onClick={handleCopy}>Copy Timestamp to Clipboard</button>
      <p>Latest Items:</p>
      <ul>
        {history.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
      <button onClick={onClose} style={{ marginTop: '10px' }}>Close</button>
    </div>
  );
}

// 2) Dark Mode Scheduler
function DarkModeSchedulerWindow({ onClose, setBackground }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (enabled) {
      // For demonstration, instantly set a dark background
      setBackground({ color: '#000000', image: '' });
    }
  }, [enabled, setBackground]);

  return (
    <div className="feature-window">
      <h2>Dark Mode Scheduler</h2>
      <p>Toggle to switch your desktop background to dark mode:</p>
      <label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        Enable Dark Mode
      </label>
      <button onClick={onClose} style={{ marginTop: '10px' }}>Close</button>
    </div>
  );
}

// 3) System Resource Monitor
function SystemResourceMonitorWindow({ onClose }) {
  const [cpuCount, setCpuCount] = useState(navigator.hardwareConcurrency || 1);
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    // There's limited direct memory usage info in browsers, but let's do a best guess
    const handleInterval = setInterval(() => {
      // Just a naive approach to show some performance timing
      const usedJSHeapSize = performance.memory?.usedJSHeapSize || 0;
      const totalJSHeapSize = performance.memory?.totalJSHeapSize || 0;
      setMemoryInfo({
        used: usedJSHeapSize,
        total: totalJSHeapSize,
      });
    }, 2000);

    return () => clearInterval(handleInterval);
  }, []);

  return (
    <div className="feature-window">
      <h2>System Resource Monitor</h2>
      <p>CPU Cores (navigator.hardwareConcurrency): {cpuCount}</p>
      {memoryInfo && (
        <>
          <p>Used JS Heap: {(memoryInfo.used / 1024 / 1024).toFixed(2)} MB</p>
          <p>Total JS Heap: {(memoryInfo.total / 1024 / 1024).toFixed(2)} MB</p>
        </>
      )}
      {!memoryInfo && <p>Memory info not available.</p>}
      <button onClick={onClose}>Close</button>
    </div>
  );
}

// 4) Screenshot & Snipping Tool
function ScreenshotToolWindow({ onClose }) {
  const [screenshotUrl, setScreenshotUrl] = useState(null);

  const handleScreenshot = async () => {
    // Minimal approach using MediaDevices getDisplayMedia
    // NOTE: This requires HTTPS + user permission + supported browsers
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      track.stop();

      // Convert to a blob
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0);
      const blob = await new Promise(resolve => canvas.toBlob(resolve));

      const url = URL.createObjectURL(blob);
      setScreenshotUrl(url);
    } catch (err) {
      alert('Screenshot failed or was denied by user.');
    }
  };

  return (
    <div className="feature-window">
      <h2>Screenshot & Snipping Tool</h2>
      <button onClick={handleScreenshot}>Take Screenshot</button>
      {screenshotUrl && (
        <div>
          <p>Preview:</p>
          <img src={screenshotUrl} alt="Screenshot" style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
        </div>
      )}
      <button onClick={onClose} style={{ marginTop: '10px' }}>Close</button>
    </div>
  );
}

// 5) Voice Command Center
function VoiceCommandCenterWindow({ onClose }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const lastResult = event.results[event.resultIndex];
        const text = lastResult[0].transcript;
        setTranscript(prev => prev + ' ' + text);
      };
    }
  }, []);

  const handleStart = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition not supported in this browser.');
      return;
    }
    setListening(true);
    recognitionRef.current.start();
  };

  const handleStop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  return (
    <div className="feature-window">
      <h2>Voice Command Center</h2>
      <p>Status: {listening ? 'Listening...' : 'Stopped'}</p>
      <button onClick={handleStart} disabled={listening}>Start</button>
      <button onClick={handleStop} disabled={!listening} style={{ marginLeft: '10px' }}>Stop</button>
      <div style={{ marginTop: '10px', maxHeight: '100px', overflow: 'auto', border: '1px solid #ccc', padding: '5px' }}>
        <strong>Transcript:</strong> {transcript}
      </div>
      <button onClick={onClose} style={{ marginTop: '10px' }}>Close</button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ------------------------------ MAIN HOMEPAGE ------------------------------ */
/* -------------------------------------------------------------------------- */

export default function HomePage() {
  // Because user wants vertical arrangement for all icons:
  // We'll always do a single column in autoArrangeAll.

  // We'll still use gridSize for spacing, but we won't do multiple columns.

  // Decide gridSize & icon size for mobile vs. desktop
  const [gridSize, setGridSize] = useState(80);
  const [iconSize, setIconSize] = useState(64);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Mobile
        setGridSize(60);
        setIconSize(48);  // smaller icon in mobile
      } else {
        // Desktop
        setGridSize(80);
        setIconSize(64);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Snap a position to the nearest vertical "row"
  function snapToGrid({ x, y }) {
    return {
      x: 20, // always 20px from left, so it’s vertical
      y: Math.round(y / gridSize) * gridSize
    };
  }

  function overlaps(posA, posB, iconDim = gridSize, gap = 20) {
    return (
      Math.abs(posA.x - posB.x) < iconDim + gap &&
      Math.abs(posA.y - posB.y) < iconDim + gap
    );
  }

  function getNextFreeSnappedPosition(items, startPos) {
    let { x, y } = startPos;
    while (items.some(i => overlaps(i.position || { x: 0, y: 0 }, { x, y }, iconSize))) {
      y += gridSize;
    }
    return { x, y };
  }

  // Single-column arrangement
  function autoArrangeAll(items) {
    items.sort((a, b) => a.name.localeCompare(b.name));
    let x = 20;
    let y = 60; // start slightly below the "Desktop" title
    for (let i = 0; i < items.length; i++) {
      items[i].position = { x, y };
      y += gridSize + 20; // step down for each icon
    }
    return items;
  }

  function getNextFreePosition(items) {
    let x = 20;
    let y = 60; // below the "Desktop" title
    while (items.some(i => overlaps(i.position || { x: 0, y: 0 }, { x, y }, iconSize))) {
      y += gridSize;
    }
    return snapToGrid({ x, y });
  }

  // --------------------- File System State ---------------------
  const [fileSystem, setFileSystem] = useState([
    {
      id: 'root',
      name: 'Desktop',
      type: 'folder',
      dateModified: '',
      children: [
        {
          id: 'thispc',
          name: 'This PC',
          type: 'folder',
          dateModified: '',
          children: []
        },
        {
          id: 'pictures',
          name: 'Pictures',
          type: 'folder',
          dateModified: '',
          children: []
        },
        {
          id: 'wordApp',
          name: 'Word',
          type: 'app',
          icon: '/word.png',
          dateModified: ''
        },
        {
          id: 'pptApp',
          name: 'PowerPoint',
          type: 'app',
          icon: '/ppt.png',
          dateModified: ''
        },
        {
          id: 'excelApp',
          name: 'Excel',
          type: 'app',
          icon: '/excel.png',
          dateModified: ''
        }
      ]
    }
  ]);

  useEffect(() => {
    openDB().then(db => {
      loadFileSystem(db).then(data => {
        if (data) {
          const updated = structuredClone(data);
          const root = updated[0];
          if (!root.children) root.children = [];

          // Ensure Word/Excel/PPT exist
          function ensureApp(id, name, icon) {
            const existing = root.children.find(item => item.id === id);
            if (!existing) {
              root.children.push({ id, name, type: 'app', icon, dateModified: '' });
            }
          }
          ensureApp('wordApp', 'Word', '/word.png');
          ensureApp('pptApp', 'PowerPoint', '/ppt.png');
          ensureApp('excelApp', 'Excel', '/excel.png');

          // Single-column arrangement
          if (root.children.length) {
            autoArrangeAll(root.children);
          }
          setFileSystem(updated);
        }
      });
    });
  }, [gridSize]);

  // Fill in dateModified after mount if missing
  useEffect(() => {
    setFileSystem(prev => {
      const newFS = structuredClone(prev);
      const fillDates = (items) => {
        items.forEach(item => {
          if (!item.dateModified) {
            item.dateModified = new Date().toLocaleString();
          }
          if (item.children) fillDates(item.children);
        });
      };
      fillDates(newFS);
      return newFS;
    });
  }, []);

  // Save changes to IndexedDB
  useEffect(() => {
    openDB().then(db => {
      saveFileSystem(db, fileSystem);
    });
  }, [fileSystem]);

  // --------------------- Finder Helpers ---------------------
  const findFolderById = useCallback((folderId, current = fileSystem) => {
    for (let item of current) {
      if (item.id === folderId && item.type === 'folder') return item;
      if (item.children) {
        const found = findFolderById(folderId, item.children);
        if (found) return found;
      }
    }
    return null;
  }, [fileSystem]);

  // --------------------- Creating Items ---------------------
  const createItem = (parentId, item) => {
    setFileSystem(prev => {
      const newFS = structuredClone(prev);
      const parentFolder = findFolderById(parentId, newFS);
      if (parentFolder) {
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

  // For camera pictures
  const savePhotoToPictures = (photoDataUrl) => {
    createItem('pictures', {
      id: `photo-${Date.now()}`,
      name: `Photo-${Date.now()}.png`,
      type: 'image',
      content: photoDataUrl
    });
  };

  // --------------------- Desktop & Selections ---------------------
  const desktopFolder = findFolderById('root');
  const [selectedItems, setSelectedItems] = useState([]);
  const [clipboard, setClipboard] = useState({ mode: null, items: [] });
  const [contextMenu, setContextMenu] = useState(null);
  const contextMenuRef = useRef(null);

  const closeContextMenu = () => setContextMenu(null);

  const handleDesktopContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, type: 'desktop', target: null });
  };

  const handleIconContextMenu = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, type: 'icon', target: item });
  };

  const handleDesktopClick = () => {
    closeContextMenu();
    setSelectedItems([]);
  };

  // --------------------- Basic Context Menu Actions ---------------------
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSort = () => {
    setFileSystem(prev => {
      const newFS = structuredClone(prev);
      const root = findFolderById('root', newFS);
      if (root && root.children) {
        autoArrangeAll(root.children);
      }
      return newFS;
    });
  };

  const handleNewFile = () => {
    createItem('root', {
      id: `file-${Date.now()}`,
      name: `NewFile-${Date.now()}.txt`,
      type: 'file',
      content: ''
    });
  };

  const handleNewFolder = () => {
    createItem('root', {
      id: `folder-${Date.now()}`,
      name: `NewFolder-${Date.now()}`,
      type: 'folder',
      children: []
    });
  };

  const [showTerminal, setShowTerminal] = useState(false);

  const handlePaste = () => {
    if (clipboard.items.length === 0) return;
    if (clipboard.mode === 'copy') {
      clipboard.items.forEach(clipItem => {
        createItem('root', {
          ...clipItem,
          id: `copy-${Date.now()}-${clipItem.id}`,
          name: `${clipItem.name} (copy)`
        });
      });
    } else if (clipboard.mode === 'cut') {
      setFileSystem(prev => {
        const newFS = structuredClone(prev);
        const rootFolder = findFolderById('root', newFS);
        if (!rootFolder) return newFS;
        rootFolder.children = rootFolder.children.filter(
          i => !clipboard.items.find(ci => ci.id === i.id)
        );
        clipboard.items.forEach(ci => {
          rootFolder.children.push(ci);
        });
        return newFS;
      });
      setClipboard({ mode: null, items: [] });
    }
  };

  // --------------------- Icon Actions ---------------------
  const handleOpen = (item) => {
    if (!item) return;
    if (item.type === 'folder') {
      setShowFileExplorer(true);
      setExplorerFolderId(item.id);
    } else if (item.type === 'file') {
      if (item.name.endsWith('.txt')) {
        setCurrentTextFile(item);
        setShowTextEditor(true);
      } else {
        openProperties(item);
      }
    } else if (item.type === 'app') {
      switch (item.id) {
        case 'wordApp': setShowWord(true); break;
        case 'pptApp': setShowPPT(true); break;
        case 'excelApp': setShowExcel(true); break;
        default: openProperties(item); break;
      }
    } else {
      openProperties(item);
    }
  };

  const handleRename = (item) => {
    if (!item) return;
    const newName = prompt('Enter new name:', item.name);
    if (newName && newName.trim()) {
      setFileSystem(prev => {
        const newFS = structuredClone(prev);
        const renameInFolder = (folder) => {
          folder.forEach(f => {
            if (f.id === item.id) {
              f.name = newName.trim();
              f.dateModified = new Date().toLocaleString();
            } else if (f.children) {
              renameInFolder(f.children);
            }
          });
        };
        renameInFolder(newFS[0].children);
        return newFS;
      });
    }
  };

  const handleCut = (item) => {
    setClipboard({ mode: 'cut', items: [item] });
  };

  const handleCopy = (item) => {
    setClipboard({ mode: 'copy', items: [item] });
  };

  const handleDelete = (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    setFileSystem(prev => {
      const newFS = structuredClone(prev);
      const rootFolder = findFolderById('root', newFS);
      if (!rootFolder) return newFS;
      rootFolder.children = rootFolder.children.filter(i => i.id !== item.id);
      return newFS;
    });
  };

  const [propertiesItem, setPropertiesItem] = useState(null);
  const openProperties = (item) => {
    setPropertiesItem(item);
  };

  const handleShare = (item) => {
    alert(`Sharing "${item.name}" (placeholder).`);
  };

  const handleCompress = (item) => {
    alert(`Compressing "${item.name}" (placeholder).`);
  };

  // --------------------- Text Editor ---------------------
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [currentTextFile, setCurrentTextFile] = useState(null);

  const handleIconClick = (e, item) => {
    e.stopPropagation();
    setSelectedItems([item.id]);
  };

  const handleIconDoubleClick = (item) => {
    handleOpen(item);
  };

  // --------------------- Drag & Drop (Mouse) ---------------------
  const handleIconDragStart = (e, item) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setData('text/plain', [item.id, offsetX, offsetY]);
  };

  const handleDropOnDesktop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    const [itemId, offsetX, offsetY] = data.split(',');
    const rect = e.currentTarget.getBoundingClientRect();
    const newX = e.clientX - rect.left - parseFloat(offsetX);
    const newY = e.clientY - rect.top - parseFloat(offsetY);

    setFileSystem(prev => {
      const newFS = structuredClone(prev);
      const root = findFolderById('root', newFS);
      if (!root) return newFS;
      const item = root.children.find(i => i.id === itemId);
      if (item) {
        const snappedPos = snapToGrid({ x: newX, y: newY });
        const newPos = getNextFreeSnappedPosition(
          root.children.filter(i => i.id !== itemId),
          snappedPos
        );
        item.position = newPos;
        item.dateModified = new Date().toLocaleString();
      }
      return newFS;
    });
  };

  // --------------------- Keyboard Shortcuts ---------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedItems.length) return;
      const root = findFolderById('root');
      if (!root) return;
      const actualItems = root.children.filter(i => selectedItems.includes(i.id));

      if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        setClipboard({ mode: 'copy', items: actualItems });
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'x') {
        setClipboard({ mode: 'cut', items: actualItems });
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'v') {
        handlePaste();
      }
      if (e.key === 'Delete') {
        setFileSystem(prev => {
          const newFS = structuredClone(prev);
          const rootFolder = findFolderById('root', newFS);
          if (!rootFolder) return newFS;
          rootFolder.children = rootFolder.children.filter(
            i => !selectedItems.includes(i.id)
          );
          return newFS;
        });
        setSelectedItems([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItems, clipboard, findFolderById]);

  // --------------------- Additional App States ---------------------
  const [showFileExplorer, setShowFileExplorer] = useState(false);
  const [explorerFolderId, setExplorerFolderId] = useState('root');
  const [showCamera, setShowCamera] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
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
  const [showWord, setShowWord] = useState(false);
  const [showPPT, setShowPPT] = useState(false);
  const [showExcel, setShowExcel] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [background, setBackground] = useState({ color: '#0a0a0a', image: '' });
  const [powerOverlay, setPowerOverlay] = useState({ active: false, type: '' });

  const handleShutdown = () => setPowerOverlay({ active: true, type: 'shutdown' });
  const handleSleep = () => setPowerOverlay({ active: true, type: 'sleep' });
  const wakeUp = () => setPowerOverlay({ active: false, type: '' });

  const [minimizedWindows, setMinimizedWindows] = useState([]);

  // --------------------- The 5 integrated features' windows states ---------------------
  const [showClipboardManager, setShowClipboardManager] = useState(false);
  const [showDarkModeScheduler, setShowDarkModeScheduler] = useState(false);
  const [showSystemMonitor, setShowSystemMonitor] = useState(false);
  const [showScreenshotTool, setShowScreenshotTool] = useState(false);
  const [showVoiceCommand, setShowVoiceCommand] = useState(false);

  // We'll add a single method to open these windows from somewhere (e.g., Taskbar)
  const openFeature = (featureName) => {
    switch (featureName) {
      case 'Clipboard History Manager':
        setShowClipboardManager(true);
        break;
      case 'Dark Mode Scheduler':
        setShowDarkModeScheduler(true);
        break;
      case 'System Resource Monitor':
        setShowSystemMonitor(true);
        break;
      case 'Screenshot & Snipping Tool':
        setShowScreenshotTool(true);
        break;
      case 'Voice Command Center':
        setShowVoiceCommand(true);
        break;
      default:
        alert(`"${featureName}" is a placeholder and not yet integrated!`);
        break;
    }
  };

  const openApp = (appName) => {
    switch (appName) {
      case 'fileExplorer': setShowFileExplorer(true); setExplorerFolderId('root'); break;
      case 'camera': setShowCamera(true); break;
      case 'calculator': setShowCalculator(true); break;
      case 'terminal': setShowTerminal(true); break;
      case 'browser':
      case 'webSearch': setShowBrowser(true); break;
      case 'weather': setShowWeather(true); break;
      case 'news': setShowNews(true); break;
      case 'currency': setShowCurrency(true); break;
      case 'dictionary': setShowDictionary(true); break;
      case 'stock': setShowStock(true); break;
      case 'joke': setShowJoke(true); break;
      case 'game': setShowGame(true); break;
      case 'voiceAssistant': setShowVoiceAssistant(true); break;
      case 'systemInfo': setShowSystemInfo(true); break;
      case 'locationInfo': setShowLocationInfo(true); break;
      case 'shutdown': handleShutdown(); break;
      case 'sleep': handleSleep(); break;
      default:
        break;
    }
  };

  // --------------------- Mobile Touch Drag & Drop (Optional) ---------------------
  const [touchDrag, setTouchDrag] = useState(null);

  const handleTouchStart = (e, item) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const timer = setTimeout(() => {
      setTouchDrag(prev => prev
        ? { ...prev, dragging: true }
        : { item, startX, startY, offsetX: 0, offsetY: 0, dragging: true }
      );
    }, 500);
    setTouchDrag({ item, startX, startY, timer, dragging: false });
  };

  const handleTouchMove = (e, item) => {
    if (!touchDrag) return;
    const touch = e.touches[0];
    const moveX = touch.clientX;
    const moveY = touch.clientY;
    if (!touchDrag.dragging) {
      if (Math.abs(moveX - touchDrag.startX) > 10 || Math.abs(moveY - touchDrag.startY) > 10) {
        clearTimeout(touchDrag.timer);
        setTouchDrag(null);
      }
    } else {
      const offsetX = moveX - touchDrag.startX;
      const offsetY = moveY - touchDrag.startY;
      setTouchDrag({ ...touchDrag, offsetX, offsetY });
    }
  };

  const handleTouchEnd = (e, item) => {
    if (touchDrag && touchDrag.dragging) {
      setFileSystem(prev => {
        const newFS = structuredClone(prev);
        const root = findFolderById('root', newFS);
        if (!root) return newFS;
        const icon = root.children.find(i => i.id === item.id);
        if (icon) {
          const newPos = {
            x: icon.position.x, // remain at x=20
            y: icon.position.y + (touchDrag.offsetY || 0)
          };
          icon.position = snapToGrid(newPos);
          icon.dateModified = new Date().toLocaleString();
        }
        return newFS;
      });
    }
    if (touchDrag) clearTimeout(touchDrag.timer);
    setTouchDrag(null);
  };

  return (
    <div
      className="desktop"
      style={{
        backgroundColor: background.color,
        backgroundImage: background.image ? `url(${background.image})` : 'none'
      }}
      onContextMenu={handleDesktopContextMenu}
      onClick={handleDesktopClick}
      onDrop={handleDropOnDesktop}
      onDragOver={e => e.preventDefault()}
    >
      <div className="desktop-title">Mohit's Web OS</div>

      {/* Desktop Icons */}
      {desktopFolder?.children?.map((item, index) => {
        const defaultPos = { x: 20, y: 60 + index * (gridSize + 20) };
        const pos = item.position || defaultPos;
        const isSelected = selectedItems.includes(item.id);

        let iconSrc = '/file-icon.png';
        if (item.id === 'thispc') iconSrc = '/thispc-icon.png';
        else if (item.type === 'folder') iconSrc = '/folder-icon.png';
        else if (item.icon) iconSrc = item.icon;

        const isTouchDragging = touchDrag && touchDrag.dragging && touchDrag.item.id === item.id;
        const touchStyle = isTouchDragging
          ? { transform: `translate(0px, ${touchDrag.offsetY}px)` }
          : {};

        return (
          <div
            key={item.id}
            className={`desktop-icon ${isSelected ? 'selected-icon' : ''}`}
            style={{
              left: pos.x,
              top: pos.y,
              width: iconSize + 'px',
              ...touchStyle
            }}
            draggable
            onDragStart={e => handleIconDragStart(e, item)}
            onContextMenu={e => handleIconContextMenu(e, item)}
            onClick={e => handleIconClick(e, item)}
            onDoubleClick={() => handleIconDoubleClick(item)}
            onTouchStart={e => handleTouchStart(e, item)}
            onTouchMove={e => handleTouchMove(e, item)}
            onTouchEnd={e => handleTouchEnd(e, item)}
          >
            <img
              src={iconSrc}
              alt={item.name}
              style={{ width: iconSize + 'px', height: iconSize + 'px' }}
            />
            <span>{item.name}</span>
          </div>
        );
      })}

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          {contextMenu.type === 'desktop' ? (
            <ul>
              <li onClick={() => { handleRefresh(); closeContextMenu(); }}>Refresh</li>
              <li onClick={() => { handleSort(); closeContextMenu(); }}>Sort</li>
              <li onClick={() => { setShowPersonalization(true); closeContextMenu(); }}>Change Background</li>
              <li onClick={() => { handleNewFile(); closeContextMenu(); }}>New File</li>
              <li onClick={() => { handleNewFolder(); closeContextMenu(); }}>New Folder</li>
              <li onClick={() => { setShowTerminal(true); closeContextMenu(); }}>Terminal</li>
              <li onClick={() => { handlePaste(); closeContextMenu(); }}>Paste</li>
              <hr style={{ margin: '5px 0', borderColor: '#444' }}/>
              {/* Quick access to integrated features */}
              <li onClick={() => { openFeature('Clipboard History Manager'); closeContextMenu(); }}>
                Clipboard History Manager
              </li>
              <li onClick={() => { openFeature('Dark Mode Scheduler'); closeContextMenu(); }}>
                Dark Mode Scheduler
              </li>
              <li onClick={() => { openFeature('System Resource Monitor'); closeContextMenu(); }}>
                System Resource Monitor
              </li>
              <li onClick={() => { openFeature('Screenshot & Snipping Tool'); closeContextMenu(); }}>
                Screenshot & Snipping Tool
              </li>
              <li onClick={() => { openFeature('Voice Command Center'); closeContextMenu(); }}>
                Voice Command Center
              </li>
              {/* Access placeholders */}
              <hr style={{ margin: '5px 0', borderColor: '#444' }}/>
              {newFeatures.slice(6, 10).map(f => (
                <li key={f.id} onClick={() => { openFeature(f.name); closeContextMenu(); }}>
                  {f.name}
                </li>
              ))}
              {/* Just showing a few placeholders. */}
            </ul>
          ) : (
            <ul>
              <li onClick={() => { handleOpen(contextMenu.target); closeContextMenu(); }}>Open</li>
              <li onClick={() => { handleRename(contextMenu.target); closeContextMenu(); }}>Rename</li>
              <li onClick={() => { handleCut(contextMenu.target); closeContextMenu(); }}>Cut</li>
              <li onClick={() => { handleCopy(contextMenu.target); closeContextMenu(); }}>Copy</li>
              <li onClick={() => { handlePaste(); closeContextMenu(); }}>Paste</li>
              <li onClick={() => { handleDelete(contextMenu.target); closeContextMenu(); }}>Delete</li>
              <li onClick={() => { openProperties(contextMenu.target); closeContextMenu(); }}>Properties</li>
              <li onClick={() => { handleShare(contextMenu.target); closeContextMenu(); }}>Share</li>
              <li onClick={() => { handleCompress(contextMenu.target); closeContextMenu(); }}>Compress</li>
            </ul>
          )}
        </div>
      )}

      {/* Taskbar */}
      <Taskbar
        onShutdown={handleShutdown}
        onSleep={handleSleep}
        onOpenApp={openApp}
        minimizedWindows={minimizedWindows}
        onRestoreWindow={(id) => {
          setMinimizedWindows(prev => prev.filter(w => w.id !== id));
          openApp(id);
        }}
      />

      {/* Windows Manager */}
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
          setMinimizedWindows(prev => [...prev, win]);
          switch (win.id) {
            case 'fileExplorer': setShowFileExplorer(false); break;
            case 'camera': setShowCamera(false); break;
            case 'calculator': setShowCalculator(false); break;
            case 'weather': setShowWeather(false); break;
            case 'news': setShowNews(false); break;
            case 'currency': setShowCurrency(false); break;
            case 'dictionary': setShowDictionary(false); break;
            case 'stock': setShowStock(false); break;
            case 'joke': setShowJoke(false); break;
            case 'game': setShowGame(false); break;
            case 'webSearch': setShowWebSearch(false); break;
            case 'voiceAssistant': setShowVoiceAssistant(false); break;
            case 'systemInfo': setShowSystemInfo(false); break;
            case 'locationInfo': setShowLocationInfo(false); break;
            case 'word': setShowWord(false); break;
            case 'ppt': setShowPPT(false); break;
            case 'excel': setShowExcel(false); break;
            default: break;
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

      {/* Text Editor */}
      {showTextEditor && currentTextFile && (
        <TextEditor
          file={currentTextFile}
          onClose={() => setShowTextEditor(false)}
          onSave={(updatedFile) => {
            setFileSystem(prev => {
              const newFS = structuredClone(prev);
              const root = findFolderById('root', newFS);
              if (!root) return newFS;
              const updateFile = (folder) => {
                folder.forEach((f, idx) => {
                  if (f.id === updatedFile.id) {
                    f.dateModified = new Date().toLocaleString();
                    folder[idx] = { ...updatedFile, dateModified: f.dateModified };
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

      {/* 5 integrated features windows */}
      {showClipboardManager && (
        <div className="feature-window-container">
          <ClipboardHistoryWindow onClose={() => setShowClipboardManager(false)} />
        </div>
      )}
      {showDarkModeScheduler && (
        <div className="feature-window-container">
          <DarkModeSchedulerWindow
            onClose={() => setShowDarkModeScheduler(false)}
            setBackground={setBackground}
          />
        </div>
      )}
      {showSystemMonitor && (
        <div className="feature-window-container">
          <SystemResourceMonitorWindow onClose={() => setShowSystemMonitor(false)} />
        </div>
      )}
      {showScreenshotTool && (
        <div className="feature-window-container">
          <ScreenshotToolWindow onClose={() => setShowScreenshotTool(false)} />
        </div>
      )}
      {showVoiceCommand && (
        <div className="feature-window-container">
          <VoiceCommandCenterWindow onClose={() => setShowVoiceCommand(false)} />
        </div>
      )}

      {/* Power Overlay */}
      {powerOverlay.active && (
        <div className="power-overlay">
          <div className="power-message">
            <h2>{powerOverlay.type === 'shutdown' ? 'Shutting Down...' : 'Sleeping...'}</h2>
            <button className="wake-up-btn" onClick={wakeUp}>Wake Up</button>
          </div>
        </div>
      )}
    </div>
  );
}
