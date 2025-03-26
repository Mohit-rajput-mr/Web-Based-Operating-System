import React, { useState, useEffect } from 'react';
import DraggableWindow from '../DraggableWindow/DraggableWindow';
import FileExplorer from '../apps/FileExplorer/FileExplorer';
import Camera from '../apps/Camera/Camera';
import Calculator from '../apps/Calculator/Calculator';
import WeatherWidget from '../apps/Weather/WeatherWidget';
import NewsWidget from '../apps/News/NewsWidget';
import CurrencyConverter from '../apps/Currency/CurrencyConverter';
import DictionaryLookup from '../apps/Dictionary/DictionaryLookup';
import StockTicker from '../apps/Stock/StockTicker';
import JokeWidget from '../apps/Joke/JokeWidget';
import GameWidget from '../apps/Game/GameWidget';
import WebSearch from '../apps/WebSearch/WebSearch';
import VoiceAssistant from '../apps/VoiceAssistant/VoiceAssistant';
import SystemInfo from '../apps/SystemInfo/SystemInfo';
import LocationInfo from '../apps/LocationInfo/LocationInfo';
import Word from '../../components/Word/Word';
import PPT from '../../components/PPT/PPT';
import Excel from '../../components/Excel/Excel';
import './WindowsManager.css';

const WindowsManager = ({
  fileSystem,
  setFileSystem,
  findFolderById,
  createItem,
  savePhotoToPictures,
  explorerFolderId,
  setExplorerFolderId,
  showFileExplorer,
  setShowFileExplorer,
  showCamera,
  setShowCamera,
  showCalculator,
  setShowCalculator,
  showWeather,
  setShowWeather,
  showNews,
  setShowNews,
  showCurrency,
  setShowCurrency,
  showDictionary,
  setShowDictionary,
  showStock,
  setShowStock,
  showJoke,
  setShowJoke,
  showGame,
  setShowGame,
  showWebSearch,
  setShowWebSearch,
  showVoiceAssistant,
  setShowVoiceAssistant,
  showSystemInfo,
  setShowSystemInfo,
  showLocationInfo,
  setShowLocationInfo,
  showWord,
  setShowWord,
  showPPT,
  setShowPPT,
  showExcel,
  setShowExcel,
  onMinimizeWindow
}) => {
  const [openWindows, setOpenWindows] = useState([]);

  // SINGLE useEffect to manage openWindows
  useEffect(() => {
    let updated = [...openWindows];

    function addWin(id, title) {
      if (!updated.find(w => w.id === id)) {
        updated.push({ id, title, minimized: false });
      }
    }
    function removeWin(id) {
      updated = updated.filter(w => w.id !== id);
    }

    // For each boolean, either add or remove
    if (showFileExplorer) addWin('fileExplorer', 'File Explorer');
    else removeWin('fileExplorer');

    if (showCamera) addWin('camera', 'Camera');
    else removeWin('camera');

    if (showCalculator) addWin('calculator', 'Calculator');
    else removeWin('calculator');

    if (showWeather) addWin('weather', 'Weather');
    else removeWin('weather');

    if (showNews) addWin('news', 'News');
    else removeWin('news');

    if (showCurrency) addWin('currency', 'Currency Converter');
    else removeWin('currency');

    if (showDictionary) addWin('dictionary', 'Dictionary');
    else removeWin('dictionary');

    if (showStock) addWin('stock', 'Stock Ticker');
    else removeWin('stock');

    if (showJoke) addWin('joke', 'Jokes');
    else removeWin('joke');

    if (showGame) addWin('game', 'Games');
    else removeWin('game');

    if (showWebSearch) addWin('webSearch', 'Web Search');
    else removeWin('webSearch');

    if (showVoiceAssistant) addWin('voiceAssistant', 'Voice Assistant');
    else removeWin('voiceAssistant');

    if (showSystemInfo) addWin('systemInfo', 'System Info');
    else removeWin('systemInfo');

    if (showLocationInfo) addWin('locationInfo', 'Location Info');
    else removeWin('locationInfo');

    // Word, PPT, Excel
    if (showWord) addWin('word', 'Word');
    else removeWin('word');

    if (showPPT) addWin('ppt', 'PowerPoint');
    else removeWin('ppt');

    if (showExcel) addWin('excel', 'Excel');
    else removeWin('excel');

    setOpenWindows(updated);
  }, [
    showFileExplorer,
    showCamera,
    showCalculator,
    showWeather,
    showNews,
    showCurrency,
    showDictionary,
    showStock,
    showJoke,
    showGame,
    showWebSearch,
    showVoiceAssistant,
    showSystemInfo,
    showLocationInfo,
    showWord,
    showPPT,
    showExcel
    // DO NOT add `openWindows` here, or we get an infinite loop.
  ]);

  // Minimizing
  const handleMinimize = (id) => {
    setOpenWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, minimized: true } : w))
    );
    // Also set showX = false so the parent knows it's “hidden”
    switch (id) {
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
    // Pass to parent so it can show in taskbar
    onMinimizeWindow && onMinimizeWindow({
      id,
      title: openWindows.find(w => w.id === id)?.title
    });
  };

  // Closing
  const handleClose = (id) => {
    switch (id) {
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
    setOpenWindows(prev => prev.filter(w => w.id !== id));
  };

  const visibleWindows = openWindows.filter(w => !w.minimized);

  return (
    <div className="windows-manager">
      {visibleWindows.map(win => {
        let content = null;
        switch (win.id) {
          case 'fileExplorer':
            content = (
              <FileExplorer
                fileSystem={fileSystem}
                setFileSystem={setFileSystem}
                findFolderById={findFolderById}
                createItem={createItem}
                initialFolderId={explorerFolderId}
                setExplorerFolderId={setExplorerFolderId}
              />
            );
            break;
          case 'camera':
            content = (
              <Camera
                onSavePhoto={savePhotoToPictures}
                fileSystem={fileSystem}
                findFolderById={findFolderById}
              />
            );
            break;
          case 'calculator':
            content = <Calculator />;
            break;
          case 'weather':
            content = <WeatherWidget />;
            break;
          case 'news':
            content = <NewsWidget />;
            break;
          case 'currency':
            content = <CurrencyConverter />;
            break;
          case 'dictionary':
            content = <DictionaryLookup />;
            break;
          case 'stock':
            content = <StockTicker />;
            break;
          case 'joke':
            content = <JokeWidget />;
            break;
          case 'game':
            content = <GameWidget />;
            break;
          case 'webSearch':
            content = <WebSearch />;
            break;
          case 'voiceAssistant':
            content = <VoiceAssistant />;
            break;
          case 'systemInfo':
            content = <SystemInfo />;
            break;
          case 'locationInfo':
            content = <LocationInfo />;
            break;
          case 'word':
            content = <Word />;
            break;
          case 'ppt':
            content = <PPT />;
            break;
          case 'excel':
            content = <Excel />;
            break;
          default:
            break;
        }
        return (
          <DraggableWindow
            key={win.id}
            title={win.title}
            onClose={() => handleClose(win.id)}
            onMinimize={() => handleMinimize(win.id)}
          >
            {content}
          </DraggableWindow>
        );
      })}
    </div>
  );
};

export default WindowsManager;
