import React from 'react';

const TelegramButton = ({ botUrl }) => {
  const handleClick = () => {
    window.open(botUrl, '_blank');
  };

  return (
    <button 
      onClick={handleClick}
      className="bg-blue-600/60 hover:bg-blue-600/80 px-4 py-2 rounded-lg transition-colors duration-200 font-mono"
    >
      {'>'} CHART ANALYZER Bot
    </button>
  );
};

export default TelegramButton; 