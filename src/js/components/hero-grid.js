/**
 * Lights up the hero dot grid around the cursor. The grid sits behind the page
 * content and ignores the pointer, so the position is read from the window
 * and handed to CSS as --hero-grid-x / --hero-grid-y. Only on devices with a
 * real hover pointer.
 */
export function heroGrid() {
    const grid = document.querySelector('.hero-grid');

    if (!grid || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        return;
    }

    let frame = null;
    let x = 0;
    let y = 0;

    const update = () => {
        frame = null;
        const rect = grid.getBoundingClientRect();
        const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

        grid.toggleAttribute('data-active', inside);

        if (inside) {
            grid.style.setProperty('--hero-grid-x', `${x - rect.left}px`);
            grid.style.setProperty('--hero-grid-y', `${y - rect.top}px`);
        }
    };

    window.addEventListener('pointermove', (e) => {
        x = e.clientX;
        y = e.clientY;
        frame ??= requestAnimationFrame(update);
    }, { passive: true });

    document.documentElement.addEventListener('pointerleave', () => {
        grid.removeAttribute('data-active');
    });
}
