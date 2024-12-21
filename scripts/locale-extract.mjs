import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';
import gettextParser from 'gettext-parser';

// Get the current directory and project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');  // Go up one level to project root

// Updated Gettext function patterns with correct capture groups
const GETTEXT_PATTERNS = [
    {
        pattern: /\b__\(['"](.+?)['"]\)/g,                          // __('text')
        handler: (match) => ({ msgid: match[1] })
    },
    {
        pattern: /\bnoop__\(['"](.+?)['"]\)/g,                      // noop__('text')
        handler: (match) => ({ msgid: match[1] })
    },
    {
        pattern: /\bn__\(['"](.+?)['"]\s*,\s*['"](.+?)['"]/g,      // n__('singular', 'plural', n)
        handler: (match) => ({ msgid: match[1], msgidPlural: match[2] })
    },
    {
        pattern: /\bp__\(['"](.+?)['"]\s*,\s*['"](.+?)['"]\)/g,    // p__('context', 'text')
        handler: (match) => ({ msgid: match[2], msgctxt: match[1] })
    },
    {
        pattern: /\bd__\(['"](.+?)['"]\s*,\s*['"](.+?)['"]\)/g,    // d__('domain', 'text')
        handler: (match) => ({ msgid: match[2] })
    },
    {
        pattern: /\bdp__\(['"](.+?)['"]\s*,\s*['"](.+?)['"]\s*,\s*['"](.+?)['"]\)/g,  // dp__('domain', 'context', 'text')
        handler: (match) => ({ msgid: match[3], msgctxt: match[2] })
    },
    {
        pattern: /\bdn__\(['"](.+?)['"]\s*,\s*['"](.+?)['"]\s*,\s*['"](.+?)['"]/g,    // dn__('domain', 'singular', 'plural', n)
        handler: (match) => ({ msgid: match[2], msgidPlural: match[3] })
    },
    {
        pattern: /\bnp__\(['"](.+?)['"]\s*,\s*['"](.+?)['"]\s*,\s*['"](.+?)['"]/g,    // np__('context', 'singular', 'plural', n)
        handler: (match) => ({ msgid: match[2], msgidPlural: match[3], msgctxt: match[1] })
    },
    {
        pattern: /\bdnp__\(['"](.+?)['"]\s*,\s*['"](.+?)['"]\s*,\s*['"](.+?)['"]\s*,\s*['"](.+?)['"]/g, // dnp__('domain', 'context', 'singular', 'plural', n)
        handler: (match) => ({ msgid: match[3], msgidPlural: match[4], msgctxt: match[2] })
    }
];

async function main() {
    // Read from project root instead of scripts directory
    const locales = JSON.parse(fs.readFileSync(path.join(projectRoot, 'locale.json'), 'utf8'));
    const files = globSync('{static,src}/**/*.{js,ts,jsx,tsx,twig}');

    // Extract translations
    const translations = new Map();

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');

        for (const { pattern, handler } of GETTEXT_PATTERNS) {
            const matches = content.matchAll(pattern);
            for (const match of matches) {
                const { msgid, msgidPlural, msgctxt } = handler(match);

                // Use msgid as key for uniqueness
                translations.set(msgid, {
                    msgid,
                    msgstr: [''], // Will be adjusted based on nplurals
                    msgidPlural: msgidPlural || undefined,
                    msgctxt: msgctxt || undefined
                });
            }
        }
    }

    // Generate PO files for each locale
    for (const locale of locales) {
        // Extract nplurals from pluralForms
        const npluralsMatch = locale.pluralForms.match(/nplurals=(\d+)/);
        const nplurals = npluralsMatch ? parseInt(npluralsMatch[1]) : 2;

        // Create translations object with correct number of empty strings for plurals
        const localeTranslations = new Map(
            Array.from(translations).map(([key, value]) => {
                const msgstrCount = value.msgidPlural ? nplurals : 1;
                return [key, {
                    ...value,
                    msgstr: Array(msgstrCount).fill('')
                }];
            })
        );

        const poData = {
            headers: {
                'Project-Id-Version': 'Theme Translations',
                'Report-Msgid-Bugs-To': '',
                // 'POT-Creation-Date': new Date().toISOString(),
                // 'PO-Revision-Date': new Date().toISOString(),
                'Last-Translator': '',
                'Language': locale.code,
                'Language-Team': '',
                'Content-Type': 'text/plain; charset=UTF-8',
                'Content-Transfer-Encoding': '8bit',
                'Plural-Forms': locale.pluralForms,
                'X-Domain': 'theme'
            },
            translations: {
                '': Object.fromEntries(localeTranslations)
            }
        };

        // Create output directory
        const outputDir = path.join('static', 'locale', locale.code, 'LC_MESSAGES');
        fs.mkdirSync(outputDir, { recursive: true });

        // Write PO file
        const output = gettextParser.po.compile(poData);
        fs.writeFileSync(path.join(outputDir, 'theme.po'), output);
    }
}

// Export the main function as default
export default main;

// Also keep the direct execution for command line usage
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
