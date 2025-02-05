import { startBot } from './telegramBot.js';

function handleUncaughtErrors() {
    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
        // Give time for logs to write
        setTimeout(() => process.exit(1), 1000);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
}

async function main() {
    handleUncaughtErrors();
    console.log('Starting bot with error handling...');
    
    try {
        await startBot();
    } catch (error) {
        console.error('Failed to start bot:', error);
        process.exit(1);
    }
}

main(); 