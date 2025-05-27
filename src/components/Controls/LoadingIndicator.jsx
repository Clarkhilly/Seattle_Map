import React from 'react';

const LoadingIndicator = ({ isLoading, isDarkMode }) => {
  const loadingStyle = {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: isDarkMode ? '#333' : 'white',
    color: isDarkMode ? '#fff' : '#333',
    padding: '10px',
    borderRadius: '5px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  if (!isLoading) return null;

  return (
    <div style={loadingStyle}>
      Loading Seattle transit data...
    </div>
  );
};

export default LoadingIndicator;