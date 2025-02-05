import TelegramBot from 'node-telegram-bot-api';
import { OpenAI } from 'openai';
import fetch from 'node-fetch';
import { fileTypeFromBuffer } from 'file-type';
import { TELEGRAM_BOT_TOKEN, OPENAI_API_KEY } from './config.js';

// Add debug logging
console.log('Bot Token:', TELEGRAM_BOT_TOKEN ? 'Present' : 'Missing');
console.log('OpenAI Key:', OPENAI_API_KEY ? 'Present' : 'Missing');

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { 
    polling: {
        interval: 300, // Poll every 300ms
        params: {
            timeout: 10 // Long polling timeout
        },
        autoStart: true,
        retryAfter: 5000, // Retry after 5s on error
        errorHandler: (err) => {
            console.error('Polling error:', err.message || err);
            return true; // Continue polling after error
        }
    }
});

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
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

async function analyzeImage(imageBuffer, username) {
  try {
    const base64Image = imageBuffer.toString('base64');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional cryptocurrency chart analyst. Analyze charts and provide detailed analysis in this exact format:

PAIR/TIMEFRAME: Brief one-line summary

📈 Trend:
- Direction: [Bull/Bear] (Strength X/5)
- Pattern: [Describe key pattern]
- Recent: [Recent price action summary]

🥷 Next Expected Move:
1. Bull: [Bullish scenario]
2. Bear: [Bearish scenario]

📉 Indicators:
- Vol: [Volume analysis]
- [Other relevant indicators]

Targets:
- Liquidity Taps: [Key levels]
- Imbalances: [Price gaps/imbalances]
- Swing Pivots: [Important pivot points]

📍 TRADE SETUP
- Trade Type: [Long/Short]
- Entry Zone 1: [First entry level]
- Entry Zone 2: [Second entry level]
- Invalidation: [Stop level]

🎯 EXIT PLAN
- Stop Loss: [Stop loss level]
- Target 1: [First target]
- Target 2: [Second target]
- Target 3: [Third target]

✅ Confidence Level: [High/Medium/Low]
- Reason: [Explanation]

📉 RISK LEVEL
- Risk: [High/Medium/Low]
- Reason: [Key risk factors]

⚠️ DISCLAIMER: This is not financial advice.

Key points:
- [Point 1]
- [Point 2]
- [Point 3]`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this cryptocurrency chart and provide specific analysis following the exact format."
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
      max_tokens: 1000,
      temperature: 0.7
    });

    const analysis = response.choices[0].message.content;
    
    if (analysis.includes("template") || analysis.includes("I'm unable to analyze")) {
      throw new Error("Invalid analysis response - received template instead of actual analysis");
    }

    return `Analysis for @${username}:\n\n${analysis}`;
  } catch (error) {
    console.error('Error in OpenAI analysis:', error);
    throw error;
  }
}

// Add retry functionality for downloads
async function downloadImageWithRetry(url, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        timeout: 15000, // 15 second timeout
        headers: {
          'User-Agent': 'ANALYZE-AI-Bot/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      console.error(`Download attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

function startBot() {
  console.log('Bot starting...');
  
  // Add a health check
  setInterval(() => {
    bot.getMe()
      .then(() => console.log('Bot connection healthy'))
      .catch(err => console.log('Bot connection check failed:', err.message));
  }, 30000); // Check every 30 seconds

  // Handle /start command
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 
      '🤖 Welcome to CHART ANALYZER Chart Analysis Bot!\n\n' +
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
      '📊 How to use CHART ANALYZER Bot:\n\n' +
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
    const username = msg.from.username || msg.from.first_name;
    let loadingMessage;
    
    try {
      loadingMessage = await bot.sendMessage(chatId, '🔄 Analyzing your chart...');
      
      // Get the file info
      const photoId = msg.photo[msg.photo.length - 1].file_id;
      const fileInfo = await bot.getFile(photoId);
      
      if (!fileInfo || !fileInfo.file_path) {
        throw new Error('Could not get file information from Telegram');
      }

      const fileLink = await bot.getFileLink(photoId);
      
      // Use the retry-enabled download function
      const imageBuffer = await downloadImageWithRetry(fileLink);
      const analysis = await analyzeImage(imageBuffer, username);
      
      if (loadingMessage) {
        await bot.deleteMessage(chatId, loadingMessage.message_id)
          .catch(err => console.error('Error deleting loading message:', err));
      }
      
      await bot.sendMessage(chatId, analysis, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      });
    } catch (error) {
      console.error('Error processing image:', error);
      
      // Clean up loading message if it exists
      if (loadingMessage) {
        try {
          await bot.deleteMessage(chatId, loadingMessage.message_id);
        } catch (deleteError) {
          console.error('Error deleting loading message:', deleteError);
        }
      }
      
      // Send appropriate error message to user
      let errorMessage = '❌ Sorry, there was an error analyzing your image.';
      if (error.code === 'ETIMEDOUT') {
        errorMessage = '❌ Network timeout. Please try sending the image again.';
      } else if (error.message.includes('file information')) {
        errorMessage = '❌ Could not process the image. Please try sending a different image.';
      }
      
      await bot.sendMessage(chatId, errorMessage);
    }
  });

  // Remove the old polling error handler and replace with this
  bot.on('polling_error', (error) => {
    // Log the error but don't restart polling - the built-in handler will do that
    console.log('Connection issue detected, will retry automatically...');
  });

  // Handle errors
  bot.on('error', (error) => {
    console.error('Telegram Bot Error:', error);
  });

  console.log('Telegram bot is running...');
}

// Add proper shutdown handling
process.on('SIGINT', () => {
  console.log('Stopping bot...');
  bot.stopPolling()
    .then(() => {
      console.log('Bot stopped');
      process.exit(0);
    });
});

export { startBot }; 