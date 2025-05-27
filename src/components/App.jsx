import React, { useState, useEffect } from 'react';
import MapContainer from './Map/MapContainer';
import AudioPlayer from './Controls/AudioPlayer';
import DarkModeToggle from './Controls/DarkModeToggle';
import LoadingIndicator from './Controls/LoadingIndicator';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('seattleTransitDarkMode') !== 'false';
    setIsDarkMode(savedDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('seattleTransitDarkMode', newDarkMode.toString());
  };

  return (
    <div style={{ 
      backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff', 
      height: '100vh', 
      position: 'relative' 
    }}>
      <MapContainer 
        isDarkMode={isDarkMode} 
        onDarkModeChange={setIsDarkMode}
        onLoadingChange={setMapLoading}
      />
      
      <DarkModeToggle 
        isDarkMode={isDarkMode} 
        onToggle={toggleDarkMode} 
      />
      
      <LoadingIndicator 
        isLoading={mapLoading} 
        isDarkMode={isDarkMode} 
      />
      
      <AudioPlayer isDarkMode={isDarkMode} />
    </div>
  );
}

export default App;