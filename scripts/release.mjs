import fs from 'fs';
import archiver from 'archiver';
import { execSync } from 'child_process';

const RELEASE_DIR = 'release';
const THEME_ZIP = 'theme.zip';

function getGitInfo() {
    try {
        // Try to get latest tag
        let tag = null;
        try {
            tag = execSync('git describe --tags --abbrev=0').toString().trim();
            // Remove 'v' prefix if present
            tag = tag.replace(/^v/, '');
        } catch (e) {
            // No tags found, continue without tag
        }

        // Try to get commit hash
        let hash = null;
        try {
            hash = execSync('git rev-parse --short=7 HEAD').toString().trim();
        } catch (e) {
            // No commits or not a git repo, continue without hash
        }

        return { tag, hash };
    } catch (e) {
        // Not a git repository or git not installed
        return { tag: null, hash: null };
    }
}

function formatArchiveName() {
    // Read package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const { tag, hash } = getGitInfo();

    let name = packageJson.name;

    // Add tag if exists
    if (tag) {
        name += `-v${tag}`;
    }

    // Add hash if exists
    if (hash) {
        name += `-${hash}`;
    }

    return `${name}.zip`;
}

async function createReleasePackage() {
    // Check if theme.zip exists
    if (!fs.existsSync(THEME_ZIP)) {
        throw new Error('Theme package not found. Run pack command first.');
    }

    const RELEASE_ZIP = formatArchiveName();
    console.log(`📦 Creating release package: ${RELEASE_ZIP}`);

    const output = fs.createWriteStream(RELEASE_ZIP);
    const archive = archiver('zip', {
        zlib: { level: 9 }
    });

    archive.on('error', (err) => {
        throw err;
    });

    output.on('close', () => {
        console.log(`📦 Release package created: ${RELEASE_ZIP}`);
        console.log(`📊 Total bytes: ${archive.pointer()}`);
    });

    archive.pipe(output);

    // Add theme.zip to the release package
    archive.file(THEME_ZIP, { name: THEME_ZIP });

    // Add release directory contents if it exists
    if (fs.existsSync(RELEASE_DIR)) {
        archive.glob('**/*', {
            cwd: RELEASE_DIR,
            ignore: [
                '**/.DS_Store',
                '**/Thumbs.db',
                '**/.git/**',
                '**/node_modules/**',
                '**/.env*'
            ]
        });
    }

    await archive.finalize();
}

// Run the release process
await createReleasePackage().catch(err => {
    console.error('Release failed:', err);
    process.exit(1);
});
