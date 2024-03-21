`use strict`;

export class ModeSwitcher extends HTMLElement {
    constructor() {
        super();

        this.modes = ['light', 'dark'];
    }

    connectedCallback() {
        setTimeout(() => {
            this.button = this.querySelector('button');

            this.button.addEventListener('click', () => {
                this.toggleMode();
            });
        });
    }

    toggleMode() {
        let mode = this.modes[(this.modes.indexOf(localStorage.mode) + 1) % this.modes.length];
        this.setMode(mode);
    }

    setMode(mode) {
        localStorage.mode = mode;
        document.documentElement.dataset.mode = localStorage.mode;
    }
}