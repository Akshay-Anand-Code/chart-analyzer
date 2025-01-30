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
              text: `Analyze this cryptocurrency chart. Please provide analysis in the following format:

Price Trends
[Analysis of current price trends and patterns]

Support/Resistance
[Key price levels and areas of interest]

Volume Analysis
[Volume patterns and significance]

Technical Indicators
[Any visible technical indicators and their signals]

Trading Setup
[Potential entry points, targets, and stop losses]

Risk Assessment
[Market conditions and risk factors]`
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