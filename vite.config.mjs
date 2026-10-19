import { defineConfig, loadEnv } from 'vite';
import FullReload from 'vite-plugin-full-reload';
import path from 'path';
import fs from 'fs';

// Load environment variables
const env = loadEnv('', process.cwd(), '');
const outDir = path.resolve(process.cwd(), env.BUILD_DIR || './dist');

let input = {
    js: './src/js/index.js',
    css: './src/css/index.css'
};

// Mirror static/ into the build directory while the dev server runs, so the
// Aikeedo server picks up template and catalog edits. Uses Vite's own file
// watcher instead of a separate one.
function staticCopyPlugin() {
    const sourceDir = path.resolve(process.cwd(), 'static');

    const target = (file) => path.join(outDir, path.relative(sourceDir, file));
    const inSource = (file) => file.startsWith(sourceDir + path.sep);

    return {
        name: 'vite-plugin-static-copy',
        apply: 'serve', // This ensures the plugin is only applied during serve

        configureServer(server) {
            fs.cpSync(sourceDir, outDir, { recursive: true });

            server.watcher.add(sourceDir);

            const copy = (file) => {
                if (!inSource(file)) {
                    return;
                }

                fs.mkdirSync(path.dirname(target(file)), { recursive: true });
                fs.copyFileSync(file, target(file));
            };

            server.watcher.on('add', copy);
            server.watcher.on('change', copy);
            server.watcher.on('unlink', (file) => {
                if (inSource(file)) {
                    fs.rmSync(target(file), { force: true });
                }
            });

            console.log('Watching static/ for changes and copying files...');
        },
    };
}

export default defineConfig({
    root: './', // Source files directory
    base: './', // Base public path for assets
    publicDir: 'static',
    build: {
        manifest: true,
        outDir: outDir, // Use the environment variable here as well
        assetsDir: 'assets', // The directory where Vite places the generated assets
        emptyOutDir: true, // Clean the output directory before each build
        rollupOptions: {
            input: input,
        },
    },
    optimizeDeps: {
        include: [
        ], // Explicitly include required dependencies
    },
    server: {
        strictPort: true,
        port: 5174,

        proxy: {
            // Handle assets conditionally
            '/assets/': {
                target: env.AIKEEDO_SERVER || 'http://0.0.0.0:8000',
                bypass: (req) => {
                    // Check if the file exists in local static directory
                    const localPath = path.join(process.cwd(), 'static', req.url);
                    if (fs.existsSync(localPath)) {
                        // Return the URL to serve the local file
                        return req.url;
                    }
                    // Return undefined to proxy the request
                    return undefined;
                }
            },
            // Proxy all other requests except Vite's own paths
            '^/(?!src/|@vite|node_modules/)': {
                target: env.AIKEEDO_SERVER || 'http://0.0.0.0:8000'
            }
        },
    },
    plugins: [
        FullReload(['./**/*.twig', './static/locale/**/*.po']), // Reload on template and catalog changes
        staticCopyPlugin()
    ],
    resolve: {
        alias: {
            '@src': path.resolve(__dirname, 'src'),
        },
    },
});
