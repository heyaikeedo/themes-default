`use strict`;

import Alpine from 'alpinejs';

// Import custom HTML elements
import { ModeSwitcher } from './mode-switcher.js';

// Define custom elements
customElements.define('mode-switcher', ModeSwitcher);

Alpine.start();