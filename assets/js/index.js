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

Alpine.data('pricing', () => ({
    cycle: null,

    init() {
        this.cycle = this.$refs.cycles.querySelector('button').dataset.cycle;
    }
}));

Alpine.start();