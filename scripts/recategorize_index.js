const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const config = require('../src/config');
const { BOOKMARK_EXTRACTION_PROMPT } = require('../src/lib/prompts');
const { robustParse } = require('../src/lib/utils');
const indexManager = require('../src/lib/index-manager');

async function recategorize() {
    const jsonPath = path.join(config.homeDir, 'nexus/research/COLLECTIVE_INDEX.json');
    console.log('🚀 Initiating Data Migration: Recategorizing Collective Index...');

    try {
        const data = await fs.readFile(jsonPath, 'utf8');
        const index = JSON.parse(data);
        const upgradedIndex = [];

        for (const entry of index) {
            console.log(`📡 Re-processing: ${entry.uri}`);
            
            const prompt = `
                ${BOOKMARK_EXTRACTION_PROMPT}
                
                EXISTING_DATA:
                Subject: ${entry.subject}
                Current Category: ${entry.category}
                Current Summary: ${entry.technical_summary}
                
                USER_SIGNAL: "${entry.uri}"
            `;

            const gemini = spawn('gemini', [
                '--prompt', prompt,
                '--output-format', 'text',
                '--approval-mode', 'auto_edit'
            ], {
                cwd: config.paths.uploads,
                env: config.rawEnv
            });

            let stdout = '';
            await new Promise((resolve) => {
                gemini.stdout.on('data', (d) => stdout += d.toString());
                gemini.on('close', resolve);
            });

            try {
                const metadata = robustParse(stdout, 'uri');
                upgradedIndex.push({
                    timestamp: entry.timestamp,
                    ...metadata
                });
                console.log(`   ✅ Upgraded to: ${metadata.category}`);
            } catch (e) {
                console.error(`   ❌ Failed to parse for ${entry.uri}: ${e.message}`);
                upgradedIndex.push(entry); // Keep original if upgrade fails
            }
        }

        // Save and Render
        await fs.writeFile(jsonPath, JSON.stringify(upgradedIndex, null, 2));
        await indexManager._renderDashboard(upgradedIndex);
        console.log('\n✨ Migration Complete. Local archives upgraded.');

    } catch (error) {
        console.error('❌ Critical error during migration:', error.message);
    }
}

recategorize();
