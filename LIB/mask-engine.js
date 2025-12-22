// Mask Engine for drawing and managing masks
class MaskEngine {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.masks = [];
        this.currentMask = null;
        this.isDrawing = false;
        this.pointRadius = 5;
        this.selectedPointIndex = -1;
    }
    
    startDrawing(x, y) {
        this.isDrawing = true;
        this.currentMask = {
            points: [{x, y}],
            direction: null,
            closed: false,
            color: this.getRandomColor()
        };
        
        this.draw();
    }
    
    addPoint(x, y) {
        if (!this.isDrawing || !this.currentMask) return;
        
        this.currentMask.points.push({x, y});
        this.draw();
    }
    
    finishDrawing(x, y) {
        if (!this.currentMask || this.currentMask.points.length < 3) {
            return null;
        }
        
        // Add last point
        if (x && y) {
            this.currentMask.points.push({x, y});
        }
        
        this.currentMask.closed = true;
        
        // Calculate center for direction selector
        const center = this.calculateCenter(this.currentMask.points);
        
        // Store current mask
        const completedMask = {...this.currentMask, center};
        this.masks.push(completedMask);
        
        this.isDrawing = false;
        this.currentMask = null;
        
        this.draw();
        return completedMask;
    }
    
    calculateCenter(points) {
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        points.forEach(p => {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        });
        
        return {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2,
            width: maxX - minX,
            height: maxY - minY
        };
    }
    
    getCurrentMask() {
        return this.currentMask;
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw completed masks
        this.masks.forEach(mask => {
            this.drawMask(mask, false);
        });
        
        // Draw current mask being drawn
        if (this.currentMask) {
            this.drawMask(this.currentMask, true);
        }
    }
    
    drawMask(mask, isCurrent) {
        const ctx = this.ctx;
        const points = mask.points;
        
        if (points.length < 2) return;
        
        // Begin path
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        // Draw lines between points
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        
        // Close path if finished
        if (mask.closed) {
            ctx.closePath();
        }
        
        // Set styles
        const lineColor = isCurrent ? '#60a5fa' : mask.color;
        const fillColor = isCurrent ? 
            'rgba(96, 165, 250, 0.1)' : 
            'rgba(16, 185, 129, 0.05)';
        
        // Fill area
        if (mask.closed) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }
        
        // Stroke border
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = isCurrent ? 3 : 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Draw points
        points.forEach((point, index) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.pointRadius, 0, Math.PI * 2);
            ctx.fillStyle = isCurrent ? '#3b82f6' : '#10b981';
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Number the points for current mask
            if (isCurrent) {
                ctx.fillStyle = 'white';
                ctx.font = '12px Inter';
                ctx.fillText(index + 1, point.x + 8, point.y + 4);
            }
        });
        
        // Draw direction arrow if exists
        if (mask.direction && !isCurrent) {
            this.drawDirectionArrow(mask);
        }
    }
    
    drawDirectionArrow(mask) {
        const ctx = this.ctx;
        const center = this.calculateCenter(mask.points);
        const direction = mask.direction;
        
        const arrowLength = 40;
        const headLength = 15;
        const angle = Math.atan2(direction.vy, direction.vx);
        
        // Draw arrow line
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(
            center.x + Math.cos(angle) * arrowLength,
            center.y + Math.sin(angle) * arrowLength
        );
        
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Draw arrow head
        ctx.beginPath();
        ctx.moveTo(
            center.x + Math.cos(angle) * arrowLength,
            center.y + Math.sin(angle) * arrowLength
        );
        
        ctx.lineTo(
            center.x + Math.cos(angle - Math.PI / 6) * headLength,
            center.y + Math.sin(angle - Math.PI / 6) * headLength
        );
        
        ctx.lineTo(
            center.x + Math.cos(angle + Math.PI / 6) * headLength,
            center.y + Math.sin(angle + Math.PI / 6) * headLength
        );
        
        ctx.closePath();
        ctx.fillStyle = '#ef4444';
        ctx.fill();
    }
    
    clear() {
        this.masks = [];
        this.currentMask = null;
        this.isDrawing = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    getRandomColor() {
        const colors = [
            '#10b981', // Green
            '#3b82f6', // Blue
            '#8b5cf6', // Purple
            '#f59e0b', // Orange
            '#ef4444', // Red
            '#ec4899'  // Pink
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    getAllMasks() {
        return [...this.masks];
    }
    
    updateMaskDirection(maskIndex, direction) {
        if (maskIndex >= 0 && maskIndex < this.masks.length) {
            this.masks[maskIndex].direction = direction;
            this.draw();
        }
    }
}
