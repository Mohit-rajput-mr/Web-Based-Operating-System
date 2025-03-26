// Taskbar.js
import React, { useState, useEffect } from "react";
import "./Taskbar.css";
import {
  FaWindows,
  FaFolderOpen,
  FaCamera,
  FaCalculator,
  FaTerminal,
  FaChrome,
  FaCloudSun,
  FaNewspaper,
  FaDollarSign,
  FaBook,
  FaChartLine,
  FaSmile,
  FaGamepad,
  FaMicrophone,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaBars,
  FaTimes,
  FaPowerOff
} from "react-icons/fa";

/**
 * New imports for Wi-Fi, Volume, Battery
 */
import Network from "../apps/Network/Network";
import VolumeControl from "../apps/Volume/VolumeControl";
import Battery from "../apps/Battery/Battery";

const Taskbar = ({
  onOpenApp,
  minimizedWindows = [],
  onRestoreWindow,
  pinnedItems = [],
  onShutdown,
  onSleep
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showPowerMenu, setShowPowerMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  /**
   * States for toggling the new Wi-Fi, Volume, Battery panels
   */
  const [showNetworkPanel, setShowNetworkPanel] = useState(false);
  const [showVolumePanel, setShowVolumePanel] = useState(false);
  const [showBatteryPanel, setShowBatteryPanel] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // update time every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (date) => date.toLocaleDateString();

  const apiIcons = [
    { name: "File Explorer", icon: <FaFolderOpen size={18} />, app: "fileExplorer" },
    { name: "Camera", icon: <FaCamera size={18} />, app: "camera" },
    { name: "Calculator", icon: <FaCalculator size={18} />, app: "calculator" },
    { name: "Terminal", icon: <FaTerminal size={18} />, app: "terminal" },
    { name: "Browser", icon: <FaChrome size={18} />, app: "webSearch" },
    { name: "Weather", icon: <FaCloudSun size={18} />, app: "weather" },
    { name: "News", icon: <FaNewspaper size={18} />, app: "news" },
    { name: "Currency", icon: <FaDollarSign size={18} />, app: "currency" },
    { name: "Dictionary", icon: <FaBook size={18} />, app: "dictionary" },
    { name: "Stock", icon: <FaChartLine size={18} />, app: "stock" },
    { name: "Jokes", icon: <FaSmile size={18} />, app: "joke" },
    { name: "Games", icon: <FaGamepad size={18} />, app: "game" },
    { name: "Voice Assistant", icon: <FaMicrophone size={18} />, app: "voiceAssistant" },
    { name: "System Info", icon: <FaInfoCircle size={18} />, app: "systemInfo" },
    { name: "Location Info", icon: <FaMapMarkerAlt size={18} />, app: "locationInfo" }
  ];

  const renderIcons = () =>
    apiIcons.map((item, idx) => (
      <div
        key={idx}
        className="taskbar-icon"
        title={item.name}
        onClick={() => onOpenApp(item.app)}
      >
        {item.icon}
      </div>
    ));

  const renderHamburgerMenu = () => (
    <div className="hamburger-menu">
      <div className="menu-header">
        <span>Apps</span>
        <button className="close-menu-btn" onClick={() => setShowHamburgerMenu(false)}>
          <FaTimes size={20} />
        </button>
      </div>
      <div className="menu-icons">{renderIcons()}</div>
      {minimizedWindows.length > 0 && (
        <div className="minimized-mobile">
          <h4>Minimized:</h4>
          {minimizedWindows.map((win) => (
            <button
              key={win.id}
              onClick={() => {
                onRestoreWindow(win.id);
                setShowHamburgerMenu(false);
              }}
              className="minimized-btn"
            >
              {win.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderPowerMenu = () => (
    <div className="power-menu">
      <div className="menu-header">
        <span>Power Options</span>
        <button className="close-menu-btn" onClick={() => setShowPowerMenu(false)}>
          <FaTimes size={20} />
        </button>
      </div>
      <div className="power-options">
        <button onClick={onShutdown}>Shutdown</button>
        <button onClick={onSleep}>Sleep</button>
        <button onClick={() => onOpenApp("restart")}>Restart</button>
      </div>
    </div>
  );

  return (
    <>
      <div className="taskbar">
        <div className="taskbar-left">
          <button className="start-btn" onClick={() => onOpenApp("windowsMenu")}>
            <FaWindows size={24} />
          </button>
        </div>

        <div className="taskbar-center">
          {pinnedItems.map((pin, idx) => (
            <div
              key={idx}
              className="taskbar-icon pinned-icon"
              title={pin.name}
              onClick={() => onOpenApp(pin.app || pin.id)}
            >
              {pin.icon || <FaFolderOpen size={18} />}
            </div>
          ))}

          {!isMobile && renderIcons()}

          {isMobile && (
            <button className="hamburger-btn" onClick={() => setShowHamburgerMenu(true)}>
              <FaBars size={24} />
            </button>
          )}

          {!isMobile &&
            minimizedWindows.map((win) => (
              <div
                key={win.id}
                className="taskbar-icon minimized-icon"
                onClick={() => onRestoreWindow(win.id)}
                title={`Restore ${win.title}`}
              >
                {win.title}
              </div>
            ))}
        </div>

        <div className="taskbar-right">
          {/* Wi-Fi, Volume, Battery Icons */}
          <div
            className="taskbar-icon"
            title="Network (Wi-Fi)"
            onClick={() => {
              setShowNetworkPanel((prev) => !prev);
              setShowVolumePanel(false);
              setShowBatteryPanel(false);
            }}
          >
            {/* Could replace with a dynamic Wi-Fi icon if you detect signal strength */}
            <img src="/wifi.png" alt="Wi-Fi" style={{ width: 16, height: 16 }} />
          </div>
          <div
            className="taskbar-icon"
            title="Volume"
            onClick={() => {
              setShowVolumePanel((prev) => !prev);
              setShowNetworkPanel(false);
              setShowBatteryPanel(false);
            }}
          >
            <img src="/volume.png" alt="Volume" style={{ width: 16, height: 16 }} />
          </div>
          <div
            className="taskbar-icon"
            title="Battery"
            onClick={() => {
              setShowBatteryPanel((prev) => !prev);
              setShowNetworkPanel(false);
              setShowVolumePanel(false);
            }}
          >
            <img src="/battery.png" alt="Battery" style={{ width: 16, height: 16 }} />
          </div>

          {/* Date/Time */}
          <div className="system-tray">
            <div className="time-date">
              <div>{formatTime(currentTime)}</div>
              <div style={{ fontSize: "12px" }}>{formatDate(currentTime)}</div>
            </div>
          </div>

          {/* Power Buttons (Desktop Only) */}
          {!isMobile && (
            <>
              <button className="power-btn" onClick={onShutdown}>
                Shutdown
              </button>
              <button className="power-btn" onClick={onSleep}>
                Sleep
              </button>
            </>
          )}

          {/* Power Menu (Mobile) */}
          {isMobile && (
            <button className="power-icon-btn" onClick={() => setShowPowerMenu(true)}>
              <FaPowerOff size={24} />
            </button>
          )}
        </div>

        {showHamburgerMenu && renderHamburgerMenu()}
        {showPowerMenu && renderPowerMenu()}
      </div>

      {/* Panels for Wi-Fi, Volume, Battery */}
      {showNetworkPanel && <Network onClose={() => setShowNetworkPanel(false)} />}
      {showVolumePanel && <VolumeControl onClose={() => setShowVolumePanel(false)} />}
      {showBatteryPanel && <Battery onClose={() => setShowBatteryPanel(false)} />}
    </>
  );
};

export default Taskbar;
