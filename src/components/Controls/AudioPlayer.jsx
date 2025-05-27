import React, { useRef, useState } from 'react';
import { audioFileSrc } from '../../data/config';

const AudioPlayer = ({ isDarkMode }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(error => console.error("Error playing audio:", error));
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const musicPlayerContainerStyle = {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    zIndex: 1001,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px'
  };

  const musicLabelStyle = {
    backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.9)' : 'rgba(240, 240, 240, 0.9)',
    color: isDarkMode ? '#eee' : '#333',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
  };

  const audioPlayerStyle = {
    backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 0.9)' : 'rgba(240, 240, 240, 0.9)',
    padding: '8px',
    borderRadius: '50%',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50px',
    height: '50px',
  };

  const audioPlayerButtonStyle = {
    background: 'none',
    border: 'none',
    color: isDarkMode ? '#eee' : '#333',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0',
    lineHeight: '1',
  };

  if (!audioFileSrc) return null;

  return (
    <div style={musicPlayerContainerStyle}>
      <div style={musicLabelStyle}>InRainbows</div>
      <div style={audioPlayerStyle}>
        <audio 
          ref={audioRef} 
          src={audioFileSrc} 
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          style={{ display: 'none' }}
        />
        <button style={audioPlayerButtonStyle} onClick={togglePlayPause} title={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? '⏸️' : '▶️'}
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;