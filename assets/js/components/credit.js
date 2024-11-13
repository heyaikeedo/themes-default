'use strict';

import { __ } from "../translate";

export class CreditElement extends HTMLElement {
    static observedAttributes = [
        'data-value',
        'lang',

        'format',
        'data-format',

        'format-unlimited',
        'data-format-unlimited',
    ];

    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }

    render() {
        let value = this.dataset.value || this.textContent;
        let format = this.getAttribute('format') || this.dataset.format || ':count';
        let showFraction = this.getAttribute('fraction') || this.dataset.fraction;

        if (value === '' || value === 'null' || isNaN(value) || value === null) {
            this.textContent = format.replaceAll(':count', __('Unlimited'));;
            return;
        }

        let lang = this.lang || document.documentElement.lang || 'en';
        // let amount = parseInt(value, 10);
        let amount = parseFloat(value);

        let options = {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            trailingZeroDisplay: 'stripIfInteger'
        };

        let titleFormatter = new Intl.NumberFormat(lang, options);

        if (showFraction === 'false' || showFraction === '0' || showFraction === 'no' || showFraction === 'off') {
            // Explictly hide fraction
            options.minimumFractionDigits = 0;
            options.maximumFractionDigits = 0;
        }

        let formatter = new Intl.NumberFormat(lang, options);
        let title = titleFormatter.format(amount);
        let text = formatter.format(amount);

        if (text.length >= 7) {
            formatter = new Intl.NumberFormat(lang, { ...options, notation: 'compact', compactDisplay: 'short' });
            text = formatter.format(amount);
        }

        this.textContent = format.replaceAll(':count', text);

        if (title !== text) {
            this.setAttribute('title', title);
        }
    }

}