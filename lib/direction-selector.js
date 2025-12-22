// Direction Selector with 8 arrows
class DirectionSelector {
    constructor() {
        this.element = document.getElementById('directionSelector');
        this.buttons = this.element.querySelectorAll('.dir-btn');
        this.selectedDirection = null;
        this.onSelect = null; // Callback function
        
        this.init();
    }
    
    init() {
        // Add click handlers to direction buttons
        this.buttons.forEach(button => {
            button.addEventListener('click', () => {
                const direction = button.dataset.dir;
                this.select(direction);
                
                if (this.onSelect && typeof this.onSelect === 'function') {
                    const directionData = this.getDirectionData(direction);
                    this.onSelect(directionData);
                }
            });
        });
    }
    
    show(x, y) {
        // Position the selector at the clicked point
        const rect = this.element.parentElement.getBoundingClientRect();
        
        // Center the selector on the point
        const left = x - this.element.offsetWidth / 2;
        const top = y - this.element.offsetHeight / 2;
        
        // Ensure it stays within canvas bounds
        const boundedLeft = Math.max(10, Math.min(left, rect.width - this.element.offsetWidth - 10));
        const boundedTop = Math.max(10, Math.min(top, rect.height - this.element.offsetHeight - 10));
        
        this.element.style.left = `${boundedLeft}px`;
        this.element.style.top = `${boundedTop}px`;
        this.element.style.display = 'block';
        
        // Reset selection
        this.selectedDirection = null;
        this.buttons.forEach(btn => btn.classList.remove('selected'));
    }
    
    hide() {
        this.element.style.display = 'none';
    }
    
    select(direction) {
        // Update selected state
        this.selectedDirection = direction;
        
        // Update button styles
        this.buttons.forEach(btn => {
            if (btn.dataset.dir === direction) {
                btn.classList.add('selected');
                btn.style.background = '#3b82f6';
                btn.style.color = 'white';
            } else {
                btn.classList.remove('selected');
                btn.style.background = '';
                btn.style.color = '';
            }
        });
        
        // Auto-hide after selection (optional)
        setTimeout(() => this.hide(), 500);
    }
    
    getDirectionData(direction) {
        const directionMap = {
            'up-left': { vx: -0.7, vy: -0.7, dir: 'up-left' },
            'up': { vx: 0, vy: -1, dir: 'up' },
            'up-right': { vx: 0.7, vy: -0.7, dir: 'up-right' },
            'left': { vx: -1, vy: 0, dir: 'left' },
            'none': { vx: 0, vy: 0, dir: 'none' },
            'right': { vx: 1, vy: 0, dir: 'right' },
            'down-left': { vx: -0.7, vy: 0.7, dir: 'down-left' },
            'down': { vx: 0, vy: 1, dir: 'down' },
            'down-right': { vx: 0.7, vy: 0.7, dir: 'down-right' }
        };
        
        return directionMap[direction] || directionMap['up'];
    }
    
    isVisible() {
        return this.element.style.display === 'block';
    }
}
