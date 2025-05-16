import React from 'react';

const FAQ = () => {
  const faqs = [
    { q: 'What is Chart Analyzer?', a: 'An AI-powered tool for analyzing trading charts and providing actionable insights.' },
    { q: 'How accurate is the analysis?', a: 'Our AI models are trained on thousands of charts and achieve a 98%+ accuracy rate.' },
    { q: 'Is my data secure?', a: 'Yes, all uploads are processed securely and never stored.' },
    { q: 'Can I use this on mobile?', a: 'Yes, the app is fully responsive and works on all devices.' },
  ];
  return (
    <section className="max-w-3xl mx-auto my-16 relative z-20">
      <h2 className="text-4xl font-bold text-center text-white mb-8 tracking-tight">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((item, idx) => (
          <div key={idx} className="bg-black/80 backdrop-blur-sm border-2 border-tech-accent/30 rounded-xl px-6 py-4 shadow-lg hover:border-tech-accent/50 transition-all duration-300">
            <div className="text-xl font-semibold text-tech-accent mb-2">{item.q}</div>
            <div className="text-gray-100 text-base">{item.a}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ; 