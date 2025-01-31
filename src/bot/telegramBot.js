import TelegramBot from 'node-telegram-bot-api';
import { OpenAI } from 'openai';
import fetch from 'node-fetch';
import { fileTypeFromBuffer } from 'file-type';
import { TELEGRAM_BOT_TOKEN, OPENAI_API_KEY } from './config.js';

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function downloadImage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

async function analyzeImage(imageBuffer) {
  try {
    const base64Image = imageBuffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this cryptocurrency chart and provide analysis in the following format:

📊 PAIR/TIMEFRAME: Brief one-line summary of current state

📈 PATTERN
• Formation and key structure identification

🔄 RECENT PRICE ACTION
• Summary of recent movements and key levels

📊 TREND ANALYSIS
• Direction & Strength: [Bull/Bear] (X/5)
• Pattern Description
• Recent Movement Details

🎯 NEXT MOVES
• Bullish Scenario: Price targets and conditions
• Bearish Scenario: Risk levels and invalidation points

📉 TECHNICAL INDICATORS
• RSI/MACD readings
• Volume analysis
• Key level identification

⚡ TRADE SETUP
• Position: Long/Short
• Entry Zone 1: Price level
• Entry Zone 2: Price level
• Invalidation: Level

🎯 TARGET ZONES
• Stop Loss: Level
• Target 1: Level
• Target 2: Level
• Target 3: Level

✅ CONFIDENCE RATING
• Level: High/Medium/Low
• Reasoning: Brief explanation

⚠️ RISK ASSESSMENT
• Level: High/Medium/Low
• Reasoning: Key risk factors

⚠️ DISCLAIMER: This is not financial advice.

🔑 KEY TAKEAWAYS
• Point 1
• Point 2
• Point 3`
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
    console.error('Error in OpenAI analysis:', error);
    throw error;
  }
}

function startBot() {
  // Handle /start command
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 
      '🤖 Welcome to ANALYZE AI Chart Analysis Bot!\n\n' +
      'Send me a cryptocurrency chart image and I will analyze it for you.\n\n' +
      'Commands:\n' +
      '/start - Show this welcome message\n' +
      '/help - Show help information'
    );
  });

  // Handle /help command
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId,
      '📊 How to use ANALYZE AI Bot:\n\n' +
      '1. Simply send a cryptocurrency chart image\n' +
      '2. Wait for the analysis (usually takes 10-15 seconds)\n' +
      '3. Receive detailed analysis including:\n' +
      '   - Price Trends\n' +
      '   - Support/Resistance\n' +
      '   - Volume Analysis\n' +
      '   - Technical Indicators\n' +
      '   - Trading Setup\n' +
      '   - Risk Assessment\n\n' +
      'Note: Images should be clear and show the chart properly'
    );
  });

  // Handle image messages
  bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    
    try {
      // Send "analyzing" message
      const loadingMessage = await bot.sendMessage(chatId, '🔄 Analyzing your chart...');
      
      // Get the file ID of the largest photo
      const photoId = msg.photo[msg.photo.length - 1].file_id;
      const fileLink = await bot.getFileLink(photoId);
      
      // Download and analyze the image
      const imageBuffer = await downloadImage(fileLink);
      const analysis = await analyzeImage(imageBuffer);
      
      // Delete loading message
      await bot.deleteMessage(chatId, loadingMessage.message_id);
      
      // Send the analysis with proper formatting
      await bot.sendMessage(chatId, analysis, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      });
    } catch (error) {
      console.error('Error:', error);
      bot.sendMessage(chatId, '❌ Sorry, there was an error analyzing your image. Please try again.');
    }
  });

  // Handle errors
  bot.on('error', (error) => {
    console.error('Telegram Bot Error:', error);
  });

  console.log('Telegram bot is running...');
}

export { startBot }; 