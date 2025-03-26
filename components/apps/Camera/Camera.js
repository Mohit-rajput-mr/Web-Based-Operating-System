import React, { useRef, useEffect, useState } from 'react';
import './Camera.css';

const Camera = ({ onSavePhoto, fileSystem, findFolderById, createItem }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);

  const [photo, setPhoto] = useState(null);
  const [filter, setFilter] = useState('none');
  const [brightness, setBrightness] = useState(100);
  const [devices, setDevices] = useState([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);

  const [showSettings, setShowSettings] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const startCamera = async (deviceId) => {
    stopCamera();
    try {
      const constraints = { video: deviceId ? { deviceId: { exact: deviceId } } : true };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) videoRef.current.srcObject = newStream;
    } catch (err) {
      console.error('Camera start error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devs => {
      const videoDevices = devs.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        startCamera(videoDevices[0].deviceId);
      }
    });
    return () => {
      if (isRecording) stopRecording();
      stopCamera();
    };
    // eslint-disable-next-line
  }, []);

  const switchCamera = () => {
    if (devices.length > 1) {
      const nextIndex = (currentDeviceIndex + 1) % devices.length;
      setCurrentDeviceIndex(nextIndex);
      startCamera(devices[nextIndex].deviceId);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    let filterStyle = `brightness(${brightness}%)`;
    if (filter === 'grayscale') filterStyle += ' grayscale(100%)';
    else if (filter === 'sepia') filterStyle += ' sepia(100%)';
    else if (filter === 'invert') filterStyle += ' invert(100%)';
    ctx.filter = filterStyle;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');
    setPhoto(dataUrl);

    if (onSavePhoto) onSavePhoto(dataUrl);
    if (createItem) {
      createItem('pictures', {
        id: `photo-${Date.now()}`,
        name: `Photo-${Date.now()}.png`,
        type: 'image',
        content: dataUrl
      });
    }
  };

  const startRecording = () => {
    if (!stream) return;
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        if (createItem) {
          createItem('pictures', {
            id: `video-${Date.now()}`,
            name: `Video-${Date.now()}.webm`,
            type: 'video',
            content: base64
          });
        }
      };
      reader.readAsDataURL(blob);
    };

    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const downloadPhoto = () => {
    if (photo) {
      const a = document.createElement('a');
      a.href = photo;
      a.download = `photo-${Date.now()}.png`;
      a.click();
    }
  };

  const clearPreview = () => {
    setPhoto(null);
  };

  const toggleFullscreen = () => {
    if (videoRef.current && videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const toggleGallery = () => setShowGallery(prev => !prev);
  const toggleSettings = () => setShowSettings(prev => !prev);
  const handleTurnOffWebcam = () => {
    if (isRecording) stopRecording();
    stopCamera();
  };

  const handleBrightnessChange = (e) => setBrightness(e.target.value);
  const handleFilterChange = (e) => setFilter(e.target.value);

  const picturesFolder = findFolderById ? findFolderById('pictures', fileSystem) : null;
  const savedMedia = picturesFolder?.children || [];

  return (
    <div className="camera-container">
      <div className="camera-view">
        <video
          ref={videoRef}
          autoPlay
          muted
          style={{
            filter: `brightness(${brightness}%) ${
              filter !== 'none' ? filter + '(100%)' : ''
            }`
          }}
        />
      </div>

      <div className="camera-controls">
        <button onClick={capturePhoto}>Capture Photo</button>
        <button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        <button onClick={switchCamera}>Switch Camera</button>
        <button onClick={downloadPhoto}>Download Photo</button>
        <button onClick={clearPreview}>Clear Preview</button>
        <button onClick={toggleFullscreen}>Fullscreen</button>
        <button onClick={toggleGallery}>{showGallery ? 'Hide Gallery' : 'Show Gallery'}</button>
        <button onClick={toggleSettings}>Settings</button>
        <button onClick={handleTurnOffWebcam}>Turn Off Webcam</button>
      </div>

      <div className="filters-section">
        <label>Filter:</label>
        <select value={filter} onChange={handleFilterChange}>
          <option value="none">None</option>
          <option value="grayscale">Grayscale</option>
          <option value="sepia">Sepia</option>
          <option value="invert">Invert</option>
        </select>
      </div>

      {photo && (
        <div className="photo-preview">
          <h4>Last Captured Photo</h4>
          <img src={photo} alt="Captured" />
        </div>
      )}

      {showGallery && (
        <div className="saved-media">
          <h4>Saved Media in Pictures</h4>
          <div className="saved-photos-grid">
            {savedMedia.map((item) => {
              if (item.type === 'image') {
                return (
                  <div key={item.id} className="saved-photo">
                    <img src={item.content} alt={item.name} />
                  </div>
                );
              } else if (item.type === 'video') {
                return (
                  <div key={item.id} className="saved-photo">
                    <video
                      src={item.content}
                      controls
                      style={{ width: '120px', height: '80px' }}
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {showSettings && (
        <div className="camera-settings">
          <h4>Camera Settings</h4>
          <label>
            Brightness:
            <input
              type="range"
              min="50"
              max="150"
              value={brightness}
              onChange={handleBrightnessChange}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default Camera;
