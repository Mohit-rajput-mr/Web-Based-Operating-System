import React from 'react';

const VolumeControl = ({ volume, setVolume }) => {
    const handleVolumeChange = (e) => {
        setVolume(e.target.value);
    };

    return (
        <div className="volume-control">
            <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume} 
                onChange={handleVolumeChange} 
                className="volume-slider" 
            />
            <span>{volume}%</span>
        </div>
    );
};

export default VolumeControl;
