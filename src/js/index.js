`use strict`;

import Alpine from 'alpinejs';

// Import custom HTML elements
import { ModeSwitcher } from './components/mode.js';
import { MoneyElement } from './components/money.js';
import { CreditElement } from './components/credit.js';

// Define custom elements
customElements.define('mode-switcher', ModeSwitcher);
customElements.define('x-money', MoneyElement);
customElements.define('x-credit', CreditElement);

// Pricing: the billing cycle on show, and whether every card lists all of
// its features (they open together so cards stay side by side), and
// whether the plans past the first three are on show.
Alpine.data('pricing', (cycle = 'monthly') => ({
    cycle,
    expanded: false,
    showAll: false,
}));

Alpine.start();