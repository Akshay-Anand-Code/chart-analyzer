import React, { useState, useEffect, useRef } from 'react';
import { analyzeImage } from '../services/openaiService';

const ChartAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [displayedAnalysis, setDisplayedAnalysis] = useState('');
  const analysisRef = useRef(null);

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
    <div className="min-h-screen bg-black text-white relative">
      <nav className="border-b border-gray-800/10 px-6 py-4 relative z-10 bg-black/20 backdrop-blur-[2px]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">AKACHI</h1>
          <div className="flex gap-8">
            <a href="#" className="hover:text-purple-500 transition-colors duration-200">Home</a>
            <a href="#" className="text-purple-500">Analyze</a>
            <a href="#" className="hover:text-purple-500 transition-colors duration-200">About</a>
            <a href="#" className="hover:text-purple-500 transition-colors duration-200">Eco</a>
            <a href="#" className="hover:text-purple-500 transition-colors duration-200">Buy</a>
          </div>
          <button className="bg-purple-600/60 hover:bg-purple-600/80 px-4 py-2 rounded-lg transition-colors duration-200">
            Redacted
          </button>
        </div>
      </nav>

      <div 
        className="absolute inset-0 bg-chart-pattern bg-cover bg-center bg-no-repeat opacity-30"
        style={{ top: '72px', bottom: '80px' }}
      />

      <main className="relative z-10 max-w-7xl mx-auto p-6 grid grid-cols-2 gap-8">
        <div className="backdrop-blur-md bg-black/30 border border-gray-800/50 rounded-lg p-8 shadow-xl">
          <div
            className={`border-2 border-dashed border-gray-700/50 rounded-lg p-12 text-center
              ${preview ? 'bg-gray-900/30' : 'hover:bg-gray-900/20'} 
              transition-all duration-200`}
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
                <p className="text-gray-500 mb-6">Upload images up to 5MB with max aspect ratio 2:1</p>
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
            <div className="mt-4 p-4 bg-red-500/10 text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              onClick={clearAll}
              className="flex-1 px-4 py-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors backdrop-blur-sm"
            >
              Clear
            </button>
            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="flex-1 px-4 py-3 bg-blue-600/80 rounded-lg hover:bg-blue-700/80 transition-colors disabled:opacity-50 backdrop-blur-sm"
            >
              {loading ? 'Analyzing...' : 'Analyze Chart'}
            </button>
          </div>
        </div>

        <div className="backdrop-blur-md bg-black/30 border border-gray-800/50 rounded-lg p-8 shadow-xl flex flex-col">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analysis Results
          </h2>

          <div 
            ref={analysisRef}
            className="h-[400px] overflow-y-auto pr-4 custom-scrollbar"
          >
            {loading ? (
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span>Analyzing chart...</span>
              </div>
            ) : displayedAnalysis ? (
              <div className="prose prose-invert">
                {displayedAnalysis.split('\n\n').map((section, index) => {
                  const [title, ...content] = section.split('\n');
                  return (
                    <div key={index} className="mb-8">
                      <h3 className="text-xl font-semibold text-blue-400 mb-3">
                        {title}
                      </h3>
                      <div className="text-gray-400 space-y-2">
                        {content.map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Upload an image to see the analysis results
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800/10 mt-12 py-6 px-6 relative z-10 bg-black/20 backdrop-blur-[2px]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z" />
              </svg>
            </a>
          </div>
          <p className="text-gray-400">© 2025 Akachi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ChartAnalyzer;