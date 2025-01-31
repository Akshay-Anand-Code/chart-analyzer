import React, { useState, useEffect } from 'react';

const IntroScreen = ({ onComplete }) => {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [text3, setText3] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const lines = [
    'Initializing AI Analysis Protocol...',
    'Loading Neural Network Models...',
    'System Ready for Chart Analysis...'
  ];

  useEffect(() => {
    const typeText = async () => {
      // Type first line
      for (let i = 0; i <= lines[0].length; i++) {
        setText1(lines[0].slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Type second line
      for (let i = 0; i <= lines[1].length; i++) {
        setText2(lines[1].slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Type third line
      for (let i = 0; i <= lines[2].length; i++) {
        setText3(lines[2].slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Wait a bit after typing is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsComplete(true);
      
      // Trigger the fade out
      setTimeout(() => {
        onComplete();
      }, 500);
    };

    typeText();
  }, []);

  return (
    <div className={`fixed inset-0 bg-black z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${isComplete ? 'opacity-0' : 'opacity-100'}`}>
      <img 
        src="/ai.PNG" 
        alt="AI Logo" 
        className="w-64 h-64 object-contain mb-8"
      />
      <div className="font-mono text-lg space-y-4">
        <p className="text-blue-500">{text1}<span className="animate-blink">_</span></p>
        <p className="text-purple-500">{text2}<span className="animate-blink">_</span></p>
        <p className="text-green-500">{text3}<span className="animate-blink">_</span></p>
      </div>
    </div>
  );
};

export default IntroScreen; 