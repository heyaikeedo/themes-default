'use strict';

import { __ } from '../translate';

export class CreditElement extends HTMLDataElement {
    static observedAttributes = [
        'value',
        'lang',

        'format',
        'data-format',

        'format-unlimited',
        'data-format-unlimited',
    ];

    constructor() {
        super();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }

    render() {
        let value = this.value || this.textContent;
        let format = this.getAttribute('format') || this.dataset.format || ':count';

        if (value === '' || value === 'null' || isNaN(value)) {
            this.textContent = format.replaceAll(':count', __('Unlimited'));;
            return;
        }

        let lang = this.lang || document.documentElement.lang || 'en';
        let amount = parseInt(value, 10);

        let options = {
            style: 'decimal',
            maximumFractionDigits: 0,
        };

        let formatter = new Intl.NumberFormat(lang, options);
        let text = formatter.format(amount);

        if (text.length < 7) {
            this.textContent = format.replaceAll(':count', text);
            return;
        }

        formatter = new Intl.NumberFormat(lang, { ...options, notation: 'compact', compactDisplay: 'short' });
        this.textContent = format.replaceAll(':count', formatter.format(amount));

        this.setAttribute('title',
            new Intl.NumberFormat(lang, options).format(amount)
        );
    }

}