import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // We'll use Vite's environment variables
  dangerouslyAllowBrowser: true // Required for client-side usage
});

export const analyzeImage = async (imageFile) => {
  try {
    // Convert image to base64
    const base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Extract base64 data from the result
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    const prompt = `Analyze this cryptocurrency chart and provide analysis in the following format:

PAIR/TIMEFRAME: Brief one-line summary of current state

PATTERN
• Formation and key structure identification

RECENT PRICE ACTION
• Summary of recent movements and key levels

TREND ANALYSIS
• Direction & Strength: [Bull/Bear] (X/5)
• Pattern Description
• Recent Movement Details

NEXT MOVES
• Bullish Scenario: Price targets and conditions
• Bearish Scenario: Risk levels and invalidation points

TECHNICAL INDICATORS
• RSI/MACD readings
• Volume analysis
• Key level identification

TRADE SETUP
• Position: Long/Short
• Entry Zone 1: Price level
• Entry Zone 2: Price level
• Invalidation: Level

TARGET ZONES
• Stop Loss: Level
• Target 1: Level
• Target 2: Level
• Target 3: Level

CONFIDENCE RATING
• Level: High/Medium/Low
• Reasoning: Brief explanation

RISK ASSESSMENT
• Level: High/Medium/Low
• Reasoning: Key risk factors

DISCLAIMER: This is not financial advice.

KEY TAKEAWAYS
• Point 1
• Point 2
• Point 3`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}; 