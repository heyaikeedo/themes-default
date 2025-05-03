# Aikeedo Default Theme

This repository contains the source code of Aikeedo's default theme that comes pre-built and embedded with the main Aikeedo software. As a licensed user, you have access to this source code and can either:

- Customize and rebuild the theme from source (recommended for developers)
- Make direct modifications to the built theme (suitable for non-technical users)

## Building from Source

An open source default theme for Aikeedo built with [a modern theme development starter kit for Aikeedo](https://github.com/heyaikeedo/themes-starter), using Vite.js for asset building and Twig for templating. This project compiles into a PHP Composer package that integrates with Aikeedo's theming system.

## Tech Stack

- **Frontend:**
  - Alpine.js for JavaScript interactivity
  - Tailwind CSS for styling
  - Tabler Icons for iconography
- **Backend:**
  - Twig templates for PHP templating
  - Gettext for translations
  - PHP Composer package structure

## Project Structure

```
default/
├── src/                    # Frontend source
│   ├── js/               # JavaScript files
│   │   ├── components/  # Custom elements
│   │   └── index.js    # Main JS entry
│   └── css/             # CSS files
│       ├── base.css    # Base styles
│       └── index.css   # Main CSS entry
│
├── static/                # PHP package structure
│   ├── composer.json     # Package definition
│   ├── templates/       # Twig template files
│   ├── sections/       # Reusable template sections
│   ├── snippets/      # Template partials
│   ├── layouts/       # Base layouts
│   ├── locale/        # Translation files (.po)
│
└── scripts/              # Build and utility scripts
    ├── pack.mjs        # Theme packaging
    ├── release.mjs    # Release creation
    └── locale-extract.mjs # Translation extraction
```

## Prerequisites

- Node.js 18+ and npm (for asset building)
- Composer (for package installation in Aikeedo)
- Running Aikeedo installation
- Basic knowledge of:
  - Alpine.js and Tailwind CSS
  - Twig templating
  - PHP Composer packages

## Detailed Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/heyaikeedo/themes-default.git my-theme
   cd my-theme
   ```

2. **Configure Your Theme Package**

   Edit `/static/composer.json` with your theme details:

   ```json
   {
     "name": "your-vendor/your-theme-name",
     "description": "Your theme description",
     "version": "1.0.0",
     "type": "aikeedo-theme",
     "homepage": "https://your-site.com",
     "license": "AIKEEDO",
     "authors": [
       {
         "name": "Your Name",
         "email": "your.email@example.com",
         "homepage": "https://your-site.com",
         "role": "Developer"
       }
     ],
     "support": {
       "email": "support@your-site.com",
       "docs": "https://docs.your-site.com/"
     },
     "require": {
       "heyaikeedo/composer": "^1.0.0"
     },
     "extra": {
       "title": "Your Theme Title",
       "description": "Your theme description",
       "logo": "https://your-site.com/logo.png",
       "icon": "https://your-site.com/icon.png",
       "status": "active"
     },
     "autoload": {}
   }
   ```

3. **Set Up Environment**

   a. Create your local environment file:

   ```bash
   cp .env .env.local
   ```

   b. Configure `.env.local` with your paths:

   ```env
   # Windows path example:
   BUILD_DIR=C:/xampp/htdocs/aikeedo/extra/extensions/your-vendor/your-theme-name

   # Linux/Mac path example:
   BUILD_DIR=/var/www/aikeedo/extra/extensions/your-vendor/your-theme-name

   # Aikeedo server URL (required for development)
   AIKEEDO_SERVER=http://localhost:8000
   ```

   > **Critical**: The final path segments (`your-vendor/your-theme-name`) MUST match your composer.json package name!

4. **Install Dependencies**

   a. Install npm packages:

   ```bash
   npm install
   ```

   b. Verify installation:

   ```bash
   # Should list alpinejs and other dependencies
   npm list
   ```

5. **Start Development Server**

   ```bash
   npm run dev
   ```

   This will:

   - Start Vite dev server on port 5174
   - Watch for file changes
   - Copy static files to `BUILD_DIR`
   - Extract translations automatically

6. **Configure Aikeedo**

   Add or update these settings in your Aikeedo's `.env` file:

   ```env
   # Required for development
   THEME_ASSETS_SERVER=http://localhost:5174/

   # Set environment to development
   ENVIRONMENT=dev

   # Enable debug mode for development
   DEBUG=1

   # Disable caching for development
   CACHE=0
   ```

7. **Verify Installation**

   ```bash
   # Your theme should be here
   ls /path/to/aikeedo/extra/extensions/your-vendor/your-theme-name
   ```

8. **Activate Your Theme**

   a. Log into Aikeedo admin panel
   b. Navigate to: Themes
   c. Find your theme in the list
   d. Click "Publish" to activate

9. **Verify Development Setup**

   Check these points:

   - [ ] Vite dev server running (http://localhost:5174)
   - [ ] Static files copied to BUILD_DIR
   - [ ] Theme visible in Aikeedo admin
   - [ ] CSS/JS changes reflect immediately
   - [ ] Twig template changes trigger reload
   - [ ] Translations being extracted

## Common Setup Issues

### Assets Not Loading

If theme assets aren't loading:

- Verify THEME_ASSETS_SERVER in Aikeedo's .env
- Ensure Vite server is running
- Check proxy settings in vite.config.mjs

### Template Changes Not Reflecting

1. Clear Aikeedo's cache
2. Check BUILD_DIR path is correct

## Development Features

### Hot Module Replacement

- Instant CSS updates via Tailwind
- Alpine.js component reloading
- Full page reload for Twig changes
- Automatic static file copying

### Internationalization

- Automatic string extraction to PO files
- Multiple language support
- Translation file watching
- Uses PHP's Gettext

### Custom Elements

```html
<!-- Dark/Light Mode Switcher -->
<mode-switcher>
  <button class="text-2xl">
    <i class="ti ti-moon-stars dark:hidden"></i>
    <i class="hidden ti ti-sun-filled dark:block"></i>
  </button>
</mode-switcher>

<!-- Avatar Component -->
<x-avatar title="User Name" src="/path/to/avatar.jpg" length="2"></x-avatar>
```

### Twig Templates

```twig
{% extends "@theme/layouts/theme.twig" %}

{% block template %}
  <div class="container">
    {% include "@theme/sections/header.twig" %}
    {{ content }}
  </div>
{% endblock %}
```

## Available Commands

| Command           | Purpose                          |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start Vite development server    |
| `npm run build`   | Build production assets          |
| `npm run serve`   | Preview production build         |
| `npm run locale`  | Extract translatable strings     |
| `npm run pack`    | Create installable theme package |
| `npm run release` | Create distribution package      |

## Troubleshooting

### Common Issues

1. **Assets Not Loading**

   - Verify Vite server is running (port 5174)
   - Check AIKEEDO_SERVER setting
   - Verify proxy settings in vite.config.mjs

2. **Template Changes Not Reflecting**

   - Check BUILD_DIR permissions
   - Verify Twig file locations
   - Clear Aikeedo's cache

3. **Build Problems**
   - Verify all paths in .env.local
   - Check write permissions
   - Review Vite build output

### Need Help?

- Review [Aikeedo Documentation](https://docs.aikeedo.com)
- Check [GitHub Issues](https://github.com/heyaikeedo/themes-default/issues)

## Quick Customization Guide (No Build Required)

For users who want to make simple modifications without rebuilding the theme, you can modify the pre-built version directly. However, it's recommended to create a copy first to preserve your changes during software updates.

The app doesn't include a UI theme editor yet. To customize the built-in landing page, you should make modifications through code. Although it's possible to alter the default theme, it's recommended to duplicate the theme and make your changes there. This approach ensures that your customizations are not lost during app updates.

Follow these steps:

1. Duplicate the default theme located at `/extra/extensions/heyaikeedo/default` to a new location within `/extra/extensions/`, e.g., `/extra/extensions/yourorganization/themename`
2. In the duplicated theme, update the `composer.json` file to reflect `yourorganization/themename` as the theme name to match its location
3. Activate your new theme on the Themes page in the admin UI
4. Enable debug mode in the app
5. Make necessary changes to the new theme files
6. Clear the app cache
7. Disable debug mode

### Important Notes

- Always work on a copy of the theme to prevent losing changes during updates
- Remember to clear the cache after making changes
- Keep debug mode enabled only while making changes
