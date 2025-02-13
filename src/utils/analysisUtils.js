// Function to parse analysis data from text
export const parseAnalysisData = (text) => {
  if (!text) return null;

  const data = {
    confidence: 0,
    trendStrength: 0,
    riskLevel: 0,
    targets: [],
    currentPrice: 0
  };

  try {
    // Extract confidence level with percentage
    const confidenceMatch = text.match(/Confidence Level: (High|Medium|Low)/i);
    if (confidenceMatch) {
      switch (confidenceMatch[1].toLowerCase()) {
        case 'high': data.confidence = 90; break;
        case 'medium': data.confidence = 60; break;
        case 'low': data.confidence = 30; break;
      }
    }

    // Extract trend strength from "Direction: [Bull/Bear] (X/5)"
    const trendMatch = text.match(/Direction:\s*(Bull|Bear)\s*\((\d+)\/5\)/i);
    if (trendMatch) {
      const [_, direction, strength] = trendMatch;
      data.trendStrength = (parseInt(strength) / 5) * 100;
      data.trendDirection = direction.toLowerCase();
    }

    // Extract risk level
    const riskMatch = text.match(/Risk:\s*(High|Medium|Low)/i);
    if (riskMatch) {
      switch (riskMatch[1].toLowerCase()) {
        case 'high': data.riskLevel = 80; break;
        case 'medium': data.riskLevel = 50; break;
        case 'low': data.riskLevel = 20; break;
      }
    }

    // Extract current price and targets
    const priceMatches = text.matchAll(/(?:Current Price|Target \d+|Stop Loss):\s*\$?([\d,.]+)/g);
    const prices = Array.from(priceMatches, match => parseFloat(match[1].replace(/,/g, '')));
    
    if (prices.length > 0) {
      data.currentPrice = prices[0];
      // Remove current price and collect targets
      data.targets = prices.slice(1);
    }

    // Extract additional metrics if available
    const rsiMatch = text.match(/RSI:\s*(\d+)/i);
    if (rsiMatch) {
      data.rsi = parseInt(rsiMatch[1]);
    }

    const volumeMatch = text.match(/Volume:\s*(High|Medium|Low)/i);
    if (volumeMatch) {
      switch (volumeMatch[1].toLowerCase()) {
        case 'high': data.volume = 90; break;
        case 'medium': data.volume = 60; break;
        case 'low': data.volume = 30; break;
      }
    }

    console.log('Parsed analysis data:', data);
    return data;

  } catch (error) {
    console.error('Error parsing analysis data:', error);
    return null;
  }
}; 