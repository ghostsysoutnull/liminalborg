const reflectionEngine = require('../src/lib/reflection');
const logger = require('../src/config/logger');

const [,, summary, mode] = process.argv;

if (!summary || !mode) {
    console.error('Usage: node scripts/generate_reflection.js <summary> <mode>');
    process.exit(1);
}

async function run() {
    try {
        const reflection = await reflectionEngine.generate(summary, mode);
        // Ensure we only output the JSON and nothing else to stdout
        process.stdout.write(JSON.stringify(reflection));
        process.exit(0);
    } catch (e) {
        logger.error(e, 'Script: Reflection generation failed');
        process.exit(1);
    }
}

run();
