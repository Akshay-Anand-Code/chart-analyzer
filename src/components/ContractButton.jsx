import React, { useState } from 'react';

const ContractButton = ({ address }) => {
  const [buttonText, setButtonText] = useState(shortenAddress(address));

  function shortenAddress(addr) {
    if (!addr) return '';
    return addr.slice(0, 5) + '...' + addr.slice(-4);
  }

  const handleClick = () => {
    navigator.clipboard.writeText(address)
      .then(() => {
        setButtonText('Copied!');
        setTimeout(() => {
          setButtonText(shortenAddress(address));
        }, 1500);
      });
  };

  return (
    <button 
      onClick={handleClick}
      className="bg-purple-600/60 hover:bg-purple-600/80 px-4 py-2 rounded-lg transition-colors duration-200"
    >
      {buttonText}
    </button>
  );
};

export default ContractButton; 