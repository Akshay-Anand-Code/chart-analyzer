import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
config({ path: join(__dirname, '../../.env') });

// Use VITE_ prefixed variables since we're in the frontend
export const TELEGRAM_BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN;
export const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;

// Add validation
if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('VITE_TELEGRAM_BOT_TOKEN is not defined in environment variables');
}

if (!OPENAI_API_KEY) {
    throw new Error('VITE_OPENAI_API_KEY is not defined in environment variables');
} 