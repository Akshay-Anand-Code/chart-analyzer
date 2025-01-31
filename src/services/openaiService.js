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

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this cryptocurrency chart and provide analysis in the following format:

[PAIR]/[TIMEFRAME]: Brief one-line summary of current state

📈 Trend:
- Direction: [Bull/Bear] (Strength X/5)
- Pattern: [Describe key pattern]
- Recent: [Recent price action]

🥷 Next Expected Move:
1. Bull: [Bullish scenario]
2. Bear: [Bearish scenario]

📉 Indicators:
- [Key indicator readings]
- [Price action analysis]

Targets:
- Liquidity Taps: [Key levels]
- Imbalances: [Notable gaps/imbalances]
- Swing Pivots: [Important pivot points]

📍 TRADE SETUP
- Trade Type: [Long/Short]
- Entry Zone 1: [First entry area]
- Entry Zone 2: [Second entry area]
- Invalidation: [Level where setup is invalid]

🎯 EXIT PLAN
- Stop Loss: [Stop loss level]
- Target 1: [First take profit]
- Target 2: [Second take profit]
- Target 3: [Third take profit]

✅ Confidence Level: [High/Medium/Low]
- Reason: [Explanation]

📉 RISK LEVEL
- Risk: [High/Medium/Low]
- Reason: [Explanation]

⚠️ DISCLAIMER: This is not financial advice.

Key points for Warriors:
- [Key point 1]
- [Key point 2]
- [Key point 3]`
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