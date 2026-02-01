#!/usr/bin/env node

/**
 * Keep-Alive System Setup Script
 * This script helps configure the keep-alive system for Campus Connect
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m'
};

async function main() {
    console.log(`${colors.bright}${colors.blue}
╔═══════════════════════════════════════════════════════════╗
║         Campus Connect Keep-Alive Setup Wizard           ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);

    console.log(`\n${colors.yellow}This wizard will help you configure the keep-alive system.${colors.reset}\n`);

    // Check if .env exists
    const envPath = path.join(__dirname, '.env');
    const envExamplePath = path.join(__dirname, '.env.example');

    if (!fs.existsSync(envPath)) {
        console.log(`${colors.red}⚠️  .env file not found!${colors.reset}`);
        const createEnv = await question('Would you like to create one from .env.example? (y/n): ');

        if (createEnv.toLowerCase() === 'y') {
            if (fs.existsSync(envExamplePath)) {
                fs.copyFileSync(envExamplePath, envPath);
                console.log(`${colors.green}✅ Created .env file${colors.reset}`);
            } else {
                console.log(`${colors.red}❌ .env.example not found${colors.reset}`);
                rl.close();
                return;
            }
        } else {
            console.log(`${colors.yellow}Please create a .env file manually${colors.reset}`);
            rl.close();
            return;
        }
    }

    // Read current .env
    let envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');

    // Check for existing keep-alive configuration
    const hasKeepAlive = envLines.some(line => line.includes('ENABLE_KEEP_ALIVE'));
    const hasServerUrl = envLines.some(line => line.includes('SERVER_URL'));

    console.log(`\n${colors.bright}Current Configuration:${colors.reset}`);
    console.log(`ENABLE_KEEP_ALIVE: ${hasKeepAlive ? colors.green + '✓ Set' : colors.red + '✗ Not set'}${colors.reset}`);
    console.log(`SERVER_URL: ${hasServerUrl ? colors.green + '✓ Set' : colors.red + '✗ Not set'}${colors.reset}`);

    // Ask for server URL
    console.log(`\n${colors.bright}Configuration:${colors.reset}`);
    const serverUrl = await question('Enter your server URL (e.g., https://your-app.onrender.com): ');

    const enableKeepAlive = await question('Enable keep-alive system? (y/n) [y]: ');
    const enable = enableKeepAlive.toLowerCase() !== 'n';

    // Update .env file
    const updates = [];

    if (!hasKeepAlive) {
        updates.push(`\n# Keep-Alive System`);
        updates.push(`ENABLE_KEEP_ALIVE=${enable ? 'true' : 'false'}`);
    } else {
        envContent = envContent.replace(/ENABLE_KEEP_ALIVE=.*/g, `ENABLE_KEEP_ALIVE=${enable ? 'true' : 'false'}`);
    }

    if (!hasServerUrl && serverUrl) {
        updates.push(`SERVER_URL=${serverUrl}`);
    } else if (serverUrl) {
        envContent = envContent.replace(/SERVER_URL=.*/g, `SERVER_URL=${serverUrl}`);
    }

    if (updates.length > 0) {
        envContent += '\n' + updates.join('\n');
    }

    // Write updated .env
    fs.writeFileSync(envPath, envContent);

    console.log(`\n${colors.green}✅ Configuration updated successfully!${colors.reset}`);

    // GitHub Actions setup
    console.log(`\n${colors.bright}GitHub Actions Setup:${colors.reset}`);
    console.log(`\n1. Go to your GitHub repository`);
    console.log(`2. Navigate to: Settings → Secrets and variables → Actions`);
    console.log(`3. Click "New repository secret"`);
    console.log(`4. Add the following secret:`);
    console.log(`   ${colors.bright}Name:${colors.reset} SERVER_URL`);
    console.log(`   ${colors.bright}Value:${colors.reset} ${serverUrl || 'your-server-url'}`);

    console.log(`\n${colors.bright}Next Steps:${colors.reset}`);
    console.log(`1. ${colors.green}✓${colors.reset} Restart your server to apply changes`);
    console.log(`2. ${colors.green}✓${colors.reset} Test the health endpoint: ${serverUrl || 'your-server-url'}/health`);
    console.log(`3. ${colors.green}✓${colors.reset} Push changes to GitHub to activate the workflow`);
    console.log(`4. ${colors.green}✓${colors.reset} Monitor server logs for keep-alive messages`);

    console.log(`\n${colors.yellow}📚 For more information, see: server/KEEP_ALIVE.md${colors.reset}\n`);

    rl.close();
}

main().catch(error => {
    console.error(`${colors.red}Error:${colors.reset}`, error.message);
    rl.close();
    process.exit(1);
});
