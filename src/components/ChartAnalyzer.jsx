import React, { useState, useEffect, useRef } from 'react';
import { analyzeImage } from '../services/openaiService';
import TelegramButton from './TelegramButton';
import IntroScreen from './IntroScreen';
import AnalysisCharts from './AnalysisCharts';
import { Radar, Line, Bar } from 'react-chartjs-2';
import { parseAnalysisData } from '../utils/analysisUtils';
import FAQ from './FAQ';
import StarField from './StarField';

// Footer component
const Footer = () => (
  <footer className="w-full py-8 mt-16 bg-gradient-to-r from-black via-gray-900 to-black border-t border-tech-accent/10 text-center text-gray-500 text-sm">
    <div className="mb-2">
      <span className="font-bold text-tech-accent">ANALYZE TECH</span> &copy; {new Date().getFullYear()} — All rights reserved.
    </div>
    <div className="flex justify-center gap-6 mt-2">
      <a href="#" className="hover:text-tech-accent transition">Privacy Policy</a>
      <a href="#" className="hover:text-tech-accent transition">Terms of Service</a>
      <a href="#" className="hover:text-tech-accent transition">Contact</a>
    </div>
  </footer>
);

// Add CTA section before Footer
const CTASection = () => (
  <section className="w-full flex flex-col items-center justify-center py-20 bg-black/90 backdrop-blur-sm relative z-20">
    <div className="max-w-4xl mx-auto px-6 text-center">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
        Ready to unlock the power of chart analysis?
      </h2>
      <p className="text-gray-100 text-xl text-center max-w-2xl mx-auto mb-10 leading-relaxed">
        Join traders and analysts using ANANLYZE TECH for fast, AI-powered insights. Upload your chart and get actionable analysis in seconds. Start now and make smarter trading decisions!
      </p>
      <a
        href="#main-analyzer"
        className="inline-block px-10 py-4 rounded-full bg-green-400 text-black font-bold text-xl shadow-lg hover:bg-green-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transform hover:scale-105"
        style={{ boxShadow: '0 0 32px 0 #22d3ee80' }}
      >
        Start Analyzing Now &rarr;
      </a>
    </div>
  </section>
);

const ChartAnalyzer = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [displayedAnalysis, setDisplayedAnalysis] = useState('');
  const analysisRef = useRef(null);
  const [showGraphics, setShowGraphics] = useState(false);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);

  // Add social media URLs
  const socialLinks = {
    twitter: "https://x.com/Analyze_Tech",
    telegram: "https://t.me/AnalyzeAIBot",
    pump: ""
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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
    setDisplayedAnalysis('');
    setError('');
    setShowGraphics(false);
    setIsAnalysisComplete(false);
  };

  useEffect(() => {
    if (analysis) {
      setDisplayedAnalysis('');
      setIsAnalysisComplete(false);
      let currentText = '';
      const words = analysis.split(' ');
      
      const typeInterval = setInterval(() => {
        if (words.length === 0) {
          clearInterval(typeInterval);
          setIsAnalysisComplete(true);
          return;
        }
        
        currentText += words.shift() + ' ';
        setDisplayedAnalysis(currentText);
        
        // Auto-scroll to bottom
        if (analysisRef.current) {
          analysisRef.current.scrollTop = analysisRef.current.scrollHeight;
        }
      }, 30);

      return () => clearInterval(typeInterval);
    }
  }, [analysis]);

  useEffect(() => {
    if (displayedAnalysis) {
      const parsed = parseAnalysisData(displayedAnalysis);
      console.log('Parsed Analysis Data:', parsed);
    }
  }, [displayedAnalysis]);

  const handleShowGraphics = () => {
    setShowGraphics(true);
  };

  // Only show the "Show Graphics" button when analysis is complete
  const showGraphicsButton = isAnalysisComplete && displayedAnalysis && !showGraphics;

  // Add useEffect for global paste handler
  useEffect(() => {
    const handleGlobalPaste = (e) => {
      const items = e.clipboardData?.items;
      
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const pastedFile = item.getAsFile();
          handleFileSelect({ target: { files: [pastedFile] } });
          break;
        }
      }
    };

    // Add global paste event listener
    document.addEventListener('paste', handleGlobalPaste);

    // Cleanup
    return () => {
      document.removeEventListener('paste', handleGlobalPaste);
    };
  }, []); // Empty dependency array since we don't need to re-add the listener

  return (
    <>
      {showIntro && <IntroScreen onComplete={handleIntroComplete} />}
      <div className={`min-h-screen bg-black text-white relative overflow-hidden transition-opacity duration-500 ${showIntro ? 'opacity-0' : 'opacity-100'}`}
        style={{
          background: '#000',
        }}
      >
        <StarField />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="/dante.mp4" type="video/mp4" />
        </video>
        {/* Add vignette overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%)',
          zIndex: 1
        }} />

        <nav className="border-b border-tech-accent/20 px-6 py-4 relative z-10 bg-black/20 backdrop-blur-[2px]">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-3xl font-space font-bold text-tech-accent tracking-tight">ANALYZE TECH</h1>
            <div className="flex gap-8 font-space tracking-wide text-sm">
              <a 
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-tech-accent transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-tech-accent after:transition-all after:duration-300"
              >
                TWITTER
              </a>
              <a 
                href={socialLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-tech-accent transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-tech-accent after:transition-all after:duration-300"
              >
                TELEGRAM
              </a>
              <a 
                href={socialLinks.pump}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-tech-accent transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-tech-accent after:transition-all after:duration-300"
              >
                LAUNCH COIN
              </a>
            </div>
          </div>
        </nav>

        <main className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="backdrop-blur-md bg-black/40 border border-tech-accent/20 rounded-lg p-8 shadow-xl relative before:absolute before:inset-0 before:border-t before:border-tech-accent/20 before:rounded-lg">
              <div className="absolute -top-3 left-8 bg-black/80 px-3 py-1 rounded-md text-xs font-mono text-tech-accent border border-tech-accent/20">
                IMAGE.UPLOAD_PANEL
              </div>
              <div
                className={`border-2 border-dashed border-tech-accent/30 rounded-lg p-12 text-center
                  ${preview ? 'bg-black/50' : 'hover:bg-black/40'} 
                  transition-all duration-200 relative backdrop-blur-sm`}
                onDragOver={handleDragOver}
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
                    <p className="text-gray-500 mb-2">Upload Chart images up to 5MB with max aspect ratio 2:1</p>
                    <p className="text-gray-500 mb-6">Or paste from clipboard (Ctrl+V)</p>
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
                  className="flex-1 px-4 py-3 bg-black/50 border border-tech-accent/20 rounded-lg hover:bg-tech-accent/10 transition-colors backdrop-blur-sm font-mono text-sm"
                >
                  {'>'} CLEAR_DATA
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={!file || loading}
                  className="flex-1 px-6 py-3 bg-tech-accent/10 border border-tech-accent/30 rounded-lg 
                    hover:bg-tech-accent/20 transition-all duration-300 disabled:opacity-50 
                    backdrop-blur-sm font-space text-tech-accent text-sm uppercase tracking-wider
                    disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    {loading ? '> ANALYZING...' : '> EXECUTE_ANALYSIS'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-tech-accent/0 via-tech-accent/10 to-tech-accent/0 
                    translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000">
                  </div>
                </button>
                {showGraphicsButton && (
                  <button
                    onClick={handleShowGraphics}
                    className="flex-1 px-4 py-3 bg-tech-accent/20 border border-tech-accent/30 rounded-lg hover:bg-tech-accent/30 transition-colors backdrop-blur-sm font-mono text-sm"
                  >
                    {'>'} SHOW_GRAPHICS
                  </button>
                )}
              </div>
            </div>

            <div className="backdrop-blur-md bg-black/40 border border-tech-secondary/20 rounded-lg p-8 shadow-xl flex flex-col relative before:absolute before:inset-0 before:border-t before:border-tech-secondary/20 before:rounded-lg">
              <div className="absolute -top-3 left-8 bg-black/80 px-3 py-1 rounded-md text-xs font-mono text-tech-secondary border border-tech-secondary/20">
                ANALYSIS.OUTPUT
              </div>
              <h2 className="text-xl font-space mb-6 flex items-center gap-2 text-tech-secondary">
                {'>'} ANALYSIS_RESULTS
              </h2>

              <div 
                ref={analysisRef}
                className="h-[400px] overflow-y-auto pr-4 custom-scrollbar font-mono text-sm relative bg-black/20 rounded-lg p-4 border border-tech-secondary/10"
              >
                {loading ? (
                  <div className="flex items-center gap-3 text-tech-secondary">
                    <div className="w-4 h-4 border-2 border-tech-secondary border-t-transparent rounded-full animate-spin" />
                    <span>{'>'} Processing chart data...</span>
                  </div>
                ) : displayedAnalysis ? (
                  <>
                    <div className="prose prose-invert">
                      {displayedAnalysis.split('\n\n').map((section, index) => {
                        // Skip horizontal rules
                        if (section.trim() === '---') {
                          return null;
                        }

                        // Title section
                        if (index === 0) {
                          return (
                            <div key={index} className="mb-6 font-bold text-xl text-tech-secondary border-b border-tech-secondary/20 pb-2">
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
                          <div key={index} className="mb-6 bg-tech-secondary/5 p-4 rounded-lg border border-tech-secondary/10">
                            <h3 className="text-base font-bold text-tech-secondary mb-3 tracking-wide">
                              {title}
                            </h3>
                            <div className="text-gray-300 space-y-2">
                              {content.map((line, i) => (
                                <p key={i} className="leading-relaxed">
                                  {line.startsWith('•') ? (
                                    <span className="flex items-start">
                                      <span className="text-tech-secondary mr-2">•</span>
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
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    {'>'} Awaiting image input for analysis...
                  </div>
                )}
              </div>
            </div>
          </div>

          {isAnalysisComplete && showGraphics && displayedAnalysis && (
            <div className="backdrop-blur-md bg-black/40 border border-tech-accent/20 rounded-lg p-8 shadow-xl relative">
              <div className="absolute -top-3 left-8 bg-black/80 px-3 py-1 rounded-md text-xs font-mono text-tech-accent border border-tech-accent/20">
                MARKET_METRICS
              </div>
              
              <h2 className="text-xl font-space mb-6 flex items-center gap-2 text-tech-accent">
                {'>'} ANALYSIS_METRICS
              </h2>

              <AnalysisCharts 
                analysisData={displayedAnalysis} 
                visible={true} 
              />
            </div>
          )}
        </main>
        {/* FAQ */}
        <FAQ />
        {/* CTA Section */}
        <CTASection />
        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default ChartAnalyzer;