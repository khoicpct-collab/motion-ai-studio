// Simple GIF Player for background
class GIFPlayer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gifElement = null;
        this.isPlaying = false;
        this.currentFrame = 0;
        this.frames = [];
        this.delays = [];
        this.animationId = null;
    }
    
    async load(file) {
        return new Promise((resolve, reject) => {
            // Create image element
            this.gifElement = new Image();
            const url = URL.createObjectURL(file);
            
            this.gifElement.onload = () => {
                // Set canvas size to match GIF
                this.canvas.width = this.gifElement.width;
                this.canvas.height = this.gifElement.height;
                
                // Draw first frame
                this.ctx.drawImage(this.gifElement, 0, 0);
                
                // For GIF frames extraction (simplified - just use the animated GIF)
                // In real app, use gifuct-js for frame-by-frame
                this.play();
                
                URL.revokeObjectURL(url);
                resolve();
            };
            
            this.gifElement.onerror = reject;
            this.gifElement.src = url;
        });
    }
    
    play() {
        if (this.isPlaying || !this.gifElement) return;
        
        this.isPlaying = true;
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    pause() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    animate() {
        if (!this.isPlaying || !this.gifElement) return;
        
        // Clear and draw GIF frame
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.gifElement, 0, 0);
        
        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    draw() {
        if (this.gifElement) {
            this.ctx.drawImage(this.gifElement, 0, 0);
        } else {
            // Fallback background
            this.ctx.fillStyle = '#0f172a';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw grid
            this.drawGrid();
        }
    }
    
    drawGrid() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const gridSize = 50;
        
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }
    
    getSize() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }
}
