import TelegramBot from 'node-telegram-bot-api';
import { OpenAI } from 'openai';
import fetch from 'node-fetch';
import { fileTypeFromBuffer } from 'file-type';
import { TELEGRAM_BOT_TOKEN, OPENAI_API_KEY } from './config.js';

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

async function downloadImage(url) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  const fileType = await fileTypeFromBuffer(buffer);
  
  if (!fileType?.mime?.startsWith('image/')) {
    throw new Error('Invalid file type. Please send an image.');
  }
  
  return buffer;
}

async function analyzeImage(imageBuffer) {
  const base64Image = imageBuffer.toString('base64');

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
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

Key points for Analysis:
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

  const formattedContent = response.choices[0].message.content
    .replace(/\*/g, '\\*')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\~/g, '\\~')
    .replace(/\`/g, '\\`')
    .replace(/\>/g, '\\>');

  return formattedContent;
}

function startBot() {
  // Handle /start command
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 
      'Welcome to ANALYZE AI Chart Analysis Bot! 📊\n\n' +
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
      'How to use ANALYZE AI Bot:\n\n' +
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
      
      // Send the analysis
      await bot.sendMessage(chatId, analysis, { parse_mode: 'Markdown' });
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