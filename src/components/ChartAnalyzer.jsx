import React, { useState, useEffect, useRef } from 'react';
import { analyzeImage } from '../services/openaiService';
import ContractButton from './ContractButton';
import TelegramButton from './TelegramButton';
import IntroScreen from './IntroScreen';

const ChartAnalyzer = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [displayedAnalysis, setDisplayedAnalysis] = useState('');
  const analysisRef = useRef(null);

  // Add social media URLs
  const socialLinks = {
    twitter: "https://x.com/AnalyzeAISolana",
    telegram: "https://t.me/ANAaiPortal",
    pump: "https://your_pump_url.com"
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setFile(selectedFile);
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      handleFileSelect({ target: { files: [droppedFile] } });
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const analysisResult = await analyzeImage(file);
      setAnalysis(analysisResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setFile(null);
    setPreview('');
    setAnalysis('');
    setError('');
  };

  useEffect(() => {
    if (analysis) {
      setDisplayedAnalysis('');
      let currentText = '';
      const words = analysis.split(' ');
      
      const typeInterval = setInterval(() => {
        if (words.length === 0) {
          clearInterval(typeInterval);
          return;
        }
        
        currentText += words.shift() + ' ';
        setDisplayedAnalysis(currentText);
        
        // Auto-scroll to bottom
        if (analysisRef.current) {
          analysisRef.current.scrollTop = analysisRef.current.scrollHeight;
        }
      }, 30); // Adjust speed as needed

      return () => clearInterval(typeInterval);
    }
  }, [analysis]);

  return (
    <>
      {showIntro && <IntroScreen onComplete={handleIntroComplete} />}
      <div className={`min-h-screen bg-black text-white relative overflow-hidden transition-opacity duration-500 ${showIntro ? 'opacity-0' : 'opacity-100'}`}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="/dante.mp4" type="video/mp4" />
        </video>

        <nav className="border-b border-gray-800/10 px-6 py-4 relative z-10 bg-black/20 backdrop-blur-[2px]">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">ANALYZE AI</h1>
            <div className="flex gap-8">
              <a 
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-500 transition-colors duration-200"
              >
                TWITTER
              </a>
              <a 
                href={socialLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-500 transition-colors duration-200"
              >
                TELEGRAM
              </a>
              <a 
                href={socialLinks.pump}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-500 transition-colors duration-200"
              >
                PUMP
              </a>
            </div>
            <div className="flex gap-4">
              <TelegramButton botUrl="https://t.me/AnalyzeAIBot" />
              <ContractButton address="CA" />
            </div>
          </div>
        </nav>

        <main className="relative z-10 max-w-7xl mx-auto p-6 grid grid-cols-2 gap-8">
          <div className="backdrop-blur-md bg-black/40 border border-purple-500/20 rounded-lg p-8 shadow-xl relative before:absolute before:inset-0 before:border-t before:border-purple-500/20 before:rounded-lg">
            <div className="absolute -top-3 left-8 bg-black/80 px-3 py-1 rounded-md text-xs text-purple-400 font-mono border border-purple-500/20">
              IMAGE.UPLOAD_PANEL
            </div>
            <div
              className={`border-2 border-dashed border-purple-500/30 rounded-lg p-12 text-center
                ${preview ? 'bg-black/50' : 'hover:bg-black/40'} 
                transition-all duration-200 relative backdrop-blur-sm`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !preview && document.getElementById('fileInput').click()}
            >
              {!preview ? (
                <>
                  <div className="mb-4">
                    <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-xl mb-2">Drop your image here</h3>
                  <p className="text-gray-500 mb-6">Upload Chart images up to 5MB with max aspect ratio 2:1</p>
                  <input
                    id="fileInput"
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*"
                  />
                  <button className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Choose File
                  </button>
                </>
              ) : (
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-[400px] rounded-lg object-contain" 
                />
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg font-mono text-sm">
                [ERROR] {error}
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button
                onClick={clearAll}
                className="flex-1 px-4 py-3 bg-black/50 border border-purple-500/20 rounded-lg hover:bg-purple-500/10 transition-colors backdrop-blur-sm font-mono text-sm"
              >
                {'>'} CLEAR_DATA
              </button>
              <button
                onClick={handleAnalyze}
                disabled={!file || loading}
                className="flex-1 px-4 py-3 bg-purple-600/20 border border-purple-500/30 rounded-lg hover:bg-purple-600/30 transition-colors disabled:opacity-50 backdrop-blur-sm font-mono text-sm disabled:cursor-not-allowed"
              >
                {loading ? '> ANALYZING...' : '> EXECUTE_ANALYSIS'}
              </button>
            </div>
          </div>

          <div className="backdrop-blur-md bg-black/40 border border-blue-500/20 rounded-lg p-8 shadow-xl flex flex-col relative before:absolute before:inset-0 before:border-t before:border-blue-500/20 before:rounded-lg">
            <div className="absolute -top-3 left-8 bg-black/80 px-3 py-1 rounded-md text-xs text-blue-400 font-mono border border-blue-500/20">
              ANALYSIS.OUTPUT
            </div>
            <h2 className="text-xl font-mono mb-6 flex items-center gap-2 text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {'>'} ANALYSIS_RESULTS
            </h2>

            <div 
              ref={analysisRef}
              className="h-[400px] overflow-y-auto pr-4 custom-scrollbar font-mono text-sm relative bg-black/20 rounded-lg p-4 border border-blue-500/10"
            >
              {loading ? (
                <div className="flex items-center gap-3 text-blue-400">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span>{'>'} Processing chart data...</span>
                </div>
              ) : displayedAnalysis ? (
                <div className="prose prose-invert">
                  {displayedAnalysis.split('\n\n').map((section, index) => {
                    // Skip horizontal rules
                    if (section.trim() === '---') {
                      return null;
                    }

                    // Title section
                    if (index === 0) {
                      return (
                        <div key={index} className="mb-6 font-bold text-xl text-blue-400 border-b border-blue-500/20 pb-2">
                          {section}
                        </div>
                      );
                    }

                    // Main sections
                    const [title, ...content] = section.split('\n');
                    
                    // Skip disclaimer and show it differently
                    if (title === 'DISCLAIMER: This is not financial advice.') {
                      return (
                        <div key={index} className="my-6 text-yellow-500/80 text-sm italic border-t border-b border-yellow-500/20 py-2 px-4">
                          {title}
                        </div>
                      );
                    }

                    return (
                      <div key={index} className="mb-6 bg-blue-500/5 p-4 rounded-lg border border-blue-500/10">
                        <h3 className="text-base font-bold text-blue-400 mb-3 tracking-wide">
                          {title}
                        </h3>
                        <div className="text-gray-300 space-y-2">
                          {content.map((line, i) => (
                            <p key={i} className="leading-relaxed">
                              {line.startsWith('•') ? (
                                <span className="flex items-start">
                                  <span className="text-blue-500 mr-2">•</span>
                                  <span className="opacity-90">{line.substring(2)}</span>
                                </span>
                              ) : (
                                <span className="opacity-80">{line}</span>
                              )}
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  {'>'} Awaiting image input for analysis...
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ChartAnalyzer;