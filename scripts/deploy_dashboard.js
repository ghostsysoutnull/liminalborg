const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const config = require('../src/config');
const logger = require('../src/config/logger');

async function deploy() {
    const dashboardPath = path.join(config.homeDir, 'nexus/research/COLLECTIVE_INDEX.html');
    const deployDir = path.join(config.paths.uploads, 'deploy_staging');
    
    console.log('🚀 Initiating Ghost Node Deployment (Surge)...');

    try {
        // 1. Prepare Staging Directory
        await fs.mkdir(deployDir, { recursive: true });
        
        // 2. Check if dashboard exists
        try {
            await fs.access(dashboardPath);
        } catch (e) {
            console.error('❌ Dashboard file not found. Archiving a link to generate it first.');
            return;
        }

        // 3. Copy Dashboard to Staging as index.html
        await fs.copyFile(dashboardPath, path.join(deployDir, 'index.html'));
        
        // 4. Create robots.txt to forbid indexing (Maximum Anonymity)
        await fs.writeFile(path.join(deployDir, 'robots.txt'), 'User-agent: *\nDisallow: /');

        if (!config.surge.token || !config.surge.domain) {
            throw new Error('Missing SURGE_TOKEN or SURGE_DOMAIN in configuration.');
        }

        // 5. Execute Surge Deployment
        console.log(`📡 Uplinking to: https://${config.surge.domain}`);
        const surge = spawn('npx', [
            'surge', 
            deployDir, 
            config.surge.domain, 
            '--token', config.surge.token
        ]);

        surge.stdout.on('data', (data) => {
            const out = data.toString().trim();
            if (out) console.log(`[Surge] ${out}`);
        });
        
        surge.stderr.on('data', (data) => {
            const err = data.toString().trim();
            if (err) console.error(`[Surge Error] ${err}`);
        });

        surge.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ Deployment Successful: https://${config.surge.domain}`);
            } else {
                console.error(`❌ Deployment failed with code ${code}`);
            }
        });

    } catch (error) {
        console.error('❌ Critical error during deployment:', error.message);
    }
}

deploy();
