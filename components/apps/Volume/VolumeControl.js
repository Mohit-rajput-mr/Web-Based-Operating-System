import React, { useState } from "react";
import "./VolumeControl.css";

/**
 * This component simulates a Volume Control panel with multiple operations:
 * 1. Master volume slider
 * 2. Mute/unmute
 * 3. Per-app volume mixer
 * 4. Balance control (L/R)
 * 5. Sound enhancements (Bass boost, Virtual surround, etc.)
 * 6. Audio device selection
 * 7. Microphone volume
 * 8. Input/Output device settings
 * ... etc.
 */

const VolumeControl = ({ onClose }) => {
  const [masterVolume, setMasterVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  // Example "per-app" volumes
  const [appVolumes, setAppVolumes] = useState({
    "Music Player": 70,
    "Browser": 40,
    "Video Game": 80
  });

  const handleMasterVolumeChange = (e) => {
    setMasterVolume(e.target.value);
    if (parseInt(e.target.value, 10) === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleAppVolumeChange = (app, value) => {
    setAppVolumes((prev) => ({ ...prev, [app]: parseInt(value, 10) }));
  };

  // Additional 100+ placeholders for advanced audio operations
  const advancedAudioFeatures = [
    "Bass Boost",
    "Virtual Surround",
    "Loudness Equalization",
    "Voice Cancellation",
    "Spatial Sound",
    "Microphone Volume",
    "Microphone Boost",
    "Audio Device Manager",
    "Bluetooth Audio Settings",
    "Audio Troubleshooter",
    "Audio Drivers Update",
    "Dolby Atmos Settings",
    "Audio Output Delay",
    "Multi-Output Routing",
    "Noise Suppression",
    "Audio Effects Chain",
    "Equalizer",
    "Advanced Mixer",
    "Audio Recording Settings",
    "Bitrate and Sample Rate",
    // ... add more as needed
  ];

  return (
    <div className="volume-panel">
      <div className="volume-header">
        <h3>Volume Control</h3>
        <button onClick={onClose}>X</button>
      </div>

      <div className="master-volume">
        <label>Master Volume</label>
        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : masterVolume}
          onChange={handleMasterVolumeChange}
        />
        <span>{isMuted ? "Muted" : `${masterVolume}%`}</span>
        <button onClick={handleMuteToggle}>{isMuted ? "Unmute" : "Mute"}</button>
      </div>

      <div className="app-volumes">
        <h4>Per-App Volume Mixer</h4>
        {Object.keys(appVolumes).map((app) => (
          <div key={app} className="app-volume-item">
            <span>{app}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : appVolumes[app]}
              onChange={(e) => handleAppVolumeChange(app, e.target.value)}
            />
            <span>{isMuted ? "0%" : `${appVolumes[app]}%`}</span>
          </div>
        ))}
      </div>

      <hr />

      <div className="advanced-audio">
        <h4>Advanced Audio Features</h4>
        <ul>
          {advancedAudioFeatures.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VolumeControl;
