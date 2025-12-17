
// --- MASONRY LAYOUT (Horizontal Order) ---
function initMasonry() {
    const grids = document.querySelectorAll('.masonry-grid');

    grids.forEach(grid => {
        // Save original cards to keep order 1, 2, 3...
        // If we already moved them, we need to sort or retrieve original list. 
        // Simplest way: check if we already saved them.
        if (!grid.originalCards) {
            grid.originalCards = Array.from(grid.querySelectorAll('.project-card'));
        }

        const cards = grid.originalCards;
        if (cards.length === 0) return;

        // Determine columns based on CSS breakpoints
        const width = window.innerWidth;
        let colCount = 3;
        if (width <= 768) colCount = 1;
        else if (width <= 1024) colCount = 2;

        // Create columns
        const cols = [];
        for (let i = 0; i < colCount; i++) {
            const col = document.createElement('div');
            col.className = 'masonry-col';
            cols.push(col);
        }

        // Distribute cards (Horizontal Order: 1->Col1, 2->Col2, 3->Col3, 4->Col1...)
        cards.forEach((card, index) => {
            cols[index % colCount].appendChild(card);
        });

        // Clear grid and append new columns
        grid.innerHTML = '';
        cols.forEach(col => grid.appendChild(col));
    });
}

// Run Masonry Init
initMasonry();

// Debounce resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initMasonry, 200);
});
