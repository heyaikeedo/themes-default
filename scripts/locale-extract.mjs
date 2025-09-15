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

// Function to create a unique key for translations (considering context)
function getTranslationKey(msgid, msgctxt) {
    return msgctxt ? `${msgctxt}\x04${msgid}` : msgid;
}

// Function to load existing translations from PO file
function loadExistingTranslations(poFilePath) {
    const existingTranslations = new Map();

    if (fs.existsSync(poFilePath)) {
        try {
            const poContent = fs.readFileSync(poFilePath);
            const parsed = gettextParser.po.parse(poContent);

            // Extract translations from all contexts in the parsed PO file
            for (const [contextKey, translations] of Object.entries(parsed.translations)) {
                for (const [translationKey, translation] of Object.entries(translations)) {
                    // Skip the empty key (headers)
                    if (translationKey === '') continue;

                    // For contextual translations, the contextKey is the context, 
                    // and translationKey is the msgid
                    let msgid, msgctxt;

                    if (contextKey === '') {
                        // Non-contextual translation
                        msgid = translation.msgid || translationKey;
                        msgctxt = translation.msgctxt;
                    } else {
                        // Contextual translation - context is in the contextKey
                        msgid = translation.msgid || translationKey;
                        msgctxt = contextKey;
                    }

                    const finalKey = getTranslationKey(msgid, msgctxt);
                    existingTranslations.set(finalKey, {
                        msgid: msgid,
                        msgstr: translation.msgstr || [''],
                        msgidPlural: translation.msgid_plural,
                        msgctxt: msgctxt
                    });
                }
            }
        } catch (error) {
            console.warn(`Warning: Could not parse existing PO file ${poFilePath}:`, error.message);
        }
    }

    return existingTranslations;
}

async function main() {
    // Read from project root instead of scripts directory
    const locales = JSON.parse(fs.readFileSync(path.join(projectRoot, 'locale.json'), 'utf8'));
    const files = globSync('{static,src}/**/*.{js,ts,jsx,tsx,twig}');

    // Extract translations from source code
    const sourceTranslations = new Map();

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');

        for (const { pattern, handler } of GETTEXT_PATTERNS) {
            const matches = content.matchAll(pattern);
            for (const match of matches) {
                const { msgid, msgidPlural, msgctxt } = handler(match);
                const translationKey = getTranslationKey(msgid, msgctxt);

                sourceTranslations.set(translationKey, {
                    msgid,
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

        // Load existing translations for this locale
        const poFilePath = path.join('static', 'locale', locale.code, 'LC_MESSAGES', 'theme.po');
        const existingTranslations = loadExistingTranslations(poFilePath);

        // Create final translations map
        const finalTranslations = new Map();

        // Process all source translations
        for (const [translationKey, sourceTranslation] of sourceTranslations) {
            const existing = existingTranslations.get(translationKey);

            // Determine the correct number of msgstr entries
            const msgstrCount = sourceTranslation.msgidPlural ? nplurals : 1;

            let msgstr;
            if (existing && existing.msgstr && existing.msgstr.length > 0 && existing.msgstr[0] !== '') {
                // Preserve existing translation, but adjust array length if needed
                msgstr = existing.msgstr.slice(); // Copy array

                // Adjust length if needed (for plurals)
                while (msgstr.length < msgstrCount) {
                    msgstr.push('');
                }
                if (msgstr.length > msgstrCount) {
                    msgstr = msgstr.slice(0, msgstrCount);
                }
            } else {
                // New translation or empty existing - create empty msgstr array
                msgstr = Array(msgstrCount).fill('');
            }

            finalTranslations.set(translationKey, {
                msgid: sourceTranslation.msgid,
                msgstr: msgstr,
                msgidPlural: sourceTranslation.msgidPlural,
                msgctxt: sourceTranslation.msgctxt
            });
        }

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
                '': Object.fromEntries(finalTranslations)
            }
        };

        // Create output directory
        const outputDir = path.join('static', 'locale', locale.code, 'LC_MESSAGES');
        fs.mkdirSync(outputDir, { recursive: true });

        // Write PO file with no line wrapping
        const output = gettextParser.po.compile(poData, { foldLength: 0 });
        fs.writeFileSync(path.join(outputDir, 'theme.po'), output);

        console.log(`Updated ${locale.code}: ${finalTranslations.size} translations (${existingTranslations.size} existing preserved)`);
    }
}

// Export the main function as default
export default main;

// Also keep the direct execution for command line usage
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
