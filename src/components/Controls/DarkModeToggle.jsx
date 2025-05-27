import React from 'react';

const DarkModeToggle = ({ isDarkMode, onToggle }) => {
  const toggleButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    zIndex: 1000,
    backgroundColor: isDarkMode ? '#333' : '#fff',
    color: isDarkMode ? '#fff' : '#333',
    border: `2px solid ${isDarkMode ? '#555' : '#ddd'}`,
    borderRadius: '8px',
    padding: '10px 15px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  };

  return (
    <button 
      onClick={onToggle}
      style={toggleButtonStyle}
      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
    >
      {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
};

export default DarkModeToggle;