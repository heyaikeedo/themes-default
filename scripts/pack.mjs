import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { build } from 'vite';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_BUILD_DIR = path.join(process.cwd(), 'pack');

// Get filename from CLI argument or use default
let outputFile = process.argv[2] || 'theme';
// Add .zip extension if not present
if (!outputFile.toLowerCase().endsWith('.zip')) {
    outputFile += '.zip';
}

async function buildTheme() {
    // Build with Vite using temporary directory
    await build({
        configFile: path.resolve(__dirname, '../vite.config.mjs'),
        build: {
            outDir: TEMP_BUILD_DIR,
        },
        mode: 'production'
    });

    const output = fs.createWriteStream(outputFile);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    archive.on('error', (err) => {
        throw err;
    });

    output.on('close', () => {
        console.log(`📦 Archive created: ${outputFile}`);
        console.log(`📊 Total bytes: ${archive.pointer()}`);

        // Clean up temporary build directory
        fs.rmSync(TEMP_BUILD_DIR, { recursive: true, force: true });
    });

    archive.pipe(output);

    // Add the build directory to the archive, 
    // including files and directories starting with a dot
    archive.glob('**/*', {
        dot: true,
        cwd: TEMP_BUILD_DIR,
        ignore: [
            '**/.DS_Store',
            '**/Thumbs.db',
            '**/.git/**',
            '**/node_modules/**',
            '**/.env*'
        ]
    });

    await archive.finalize();
}

// Run the build and pack process
await buildTheme().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
