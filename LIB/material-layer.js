// Material Layer for particle system
class MaterialLayer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.materialImage = null;
        this.particles = [];
        this.masks = [];
        this.isPlaying = false;
        this.lastUpdateTime = 0;
        
        // Settings
        this.settings = {
            density: 0.5,      // 0-1
            speed: 1.0,        // 0-2
            size: 20,          // px
            opacity: 0.8,      // 0-1
            preset: 'flow'     // flow, swirl, bounce, random
        };
        
        // Direction vectors for 8 directions
        this.directions = {
            'up-left': { vx: -0.7, vy: -0.7 },
            'up': { vx: 0, vy: -1 },
            'up-right': { vx: 0.7, vy: -0.7 },
            'left': { vx: -1, vy: 0 },
            'center': { vx: 0, vy: 0 },
            'right': { vx: 1, vy: 0 },
            'down-left': { vx: -0.7, vy: 0.7 },
            'down': { vx: 0, vy: 1 },
            'down-right': { vx: 0.7, vy: 0.7 }
        };
    }
    
    async loadMaterial(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.materialImage = img;
                resolve();
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }
    
    setPreset(preset) {
        this.settings.preset = preset;
        this.applyPreset(preset);
    }
    
    applyPreset(preset) {
        switch(preset) {
            case 'swirl':
                // Particles will swirl around center
                break;
            case 'bounce':
                // Particles bounce at boundaries
                break;
            case 'random':
                // Random movement within mask
                break;
            case 'flow':
            default:
                // Default directional flow
                break;
        }
    }
    
    generateParticlesForMask(mask) {
        if (!this.materialImage) return [];
        
        const particles = [];
        const count = Math.floor(150 * this.settings.density);
        const maskPoints = mask.points;
        
        // Create particles within mask bounds
        for (let i = 0; i < count; i++) {
            // Generate random point within mask bounds
            let point = null;
            let attempts = 0;
            
            while (!point && attempts < 100) {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * this.canvas.height;
                
                if (this.isPointInPolygon(x, y, maskPoints)) {
                    point = { x, y };
                }
                attempts++;
            }
            
            if (point) {
                const direction = mask.direction || { vx: 0, vy: -1 };
                
                const particle = {
                    x: point.x,
                    y: point.y,
                    vx: direction.vx * this.settings.speed,
                    vy: direction.vy * this.settings.speed,
                    size: this.settings.size * (0.5 + Math.random() * 0.5),
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.05,
                    life: 1.0,
                    maskId: maskPoints.length, // Use as identifier
                    color: this.getRandomColor(),
                    preset: this.settings.preset
                };
                
                particles.push(particle);
            }
        }
        
        return particles;
    }
    
    isPointInPolygon(x, y, polygon) {
        // Simple point-in-polygon test
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;
            
            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            
            if (intersect) inside = !inside;
        }
        return inside;
    }
    
    updateParticles(deltaTime) {
        if (!this.isPlaying) return;
        
        const delta = Math.min(deltaTime / 16, 2); // Normalize delta time
        
        this.particles.forEach(particle => {
            // Apply preset-based movement
            this.applyPresetMovement(particle, delta);
            
            // Update position
            particle.x += particle.vx * delta;
            particle.y += particle.vy * delta;
            
            // Apply rotation
            particle.rotation += particle.rotationSpeed * delta;
            
            // Boundary handling based on preset
            this.handleBoundaries(particle);
            
            // Life decay
            particle.life -= 0.001 * delta;
            if (particle.life <= 0) {
                // Reset particle
                this.resetParticle(particle);
            }
        });
    }
    
    applyPresetMovement(particle, delta) {
        switch(particle.preset) {
            case 'swirl':
                // Swirl around center
                const centerX = this.canvas.width / 2;
                const centerY = this.canvas.height / 2;
                const dx = particle.x - centerX;
                const dy = particle.y - centerY;
                const angle = Math.atan2(dy, dx);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Add swirling motion
                const swirlStrength = 0.02 * this.settings.speed;
                const newAngle = angle + swirlStrength * delta;
                
                particle.x = centerX + Math.cos(newAngle) * distance;
                particle.y = centerY + Math.sin(newAngle) * distance;
                break;
                
            case 'bounce':
                // Bounce when hitting boundaries
                if (particle.x <= 0 || particle.x >= this.canvas.width) {
                    particle.vx *= -0.9; // Bounce with energy loss
                }
                if (particle.y <= 0 || particle.y >= this.canvas.height) {
                    particle.vy *= -0.9;
                }
                break;
                
            case 'random':
                // Random walk
                particle.vx += (Math.random() - 0.5) * 0.2;
                particle.vy += (Math.random() - 0.5) * 0.2;
                
                // Limit speed
                const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                if (speed > 2) {
                    particle.vx = (particle.vx / speed) * 2;
                    particle.vy = (particle.vy / speed) * 2;
                }
                break;
                
            case 'flow':
            default:
                // Maintain direction, adjust for speed setting
                particle.vx = particle.vx * this.settings.speed;
                particle.vy = particle.vy * this.settings.speed;
                break;
        }
    }
    
    handleBoundaries(particle) {
        // Wrap around edges
        if (particle.x < -particle.size) particle.x = this.canvas.width + particle.size;
        if (particle.x > this.canvas.width + particle.size) particle.x = -particle.size;
        if (particle.y < -particle.size) particle.y = this.canvas.height + particle.size;
        if (particle.y > this.canvas.height + particle.size) particle.y = -particle.size;
    }
    
    resetParticle(particle) {
        // Reset to random position within canvas
        particle.x = Math.random() * this.canvas.width;
        particle.y = Math.random() * this.canvas.height;
        particle.life = 1.0;
        particle.rotation = Math.random() * Math.PI * 2;
    }
    
    draw() {
        // Clear canvas with transparency
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set global alpha for opacity
        this.ctx.globalAlpha = this.settings.opacity;
        
        // Draw each particle
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);
            
            if (this.materialImage) {
                // Draw material texture
                this.ctx.drawImage(
                    this.materialImage,
                    -particle.size / 2,
                    -particle.size / 2,
                    particle.size,
                    particle.size
                );
            } else {
                // Fallback: draw colored circle
                this.ctx.beginPath();
                this.ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
                
                // Use particle color or default
                this.ctx.fillStyle = particle.color || 'rgba(255, 200, 50, 0.8)';
                this.ctx.fill();
                
                // Add highlight for 3D effect
                this.ctx.beginPath();
                this.ctx.arc(
                    -particle.size / 4,
                    -particle.size / 4,
                    particle.size / 4,
                    0,
                    Math.PI * 2
                );
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.fill();
            }
            
            this.ctx.restore();
        });
        
        // Reset global alpha
        this.ctx.globalAlpha = 1.0;
    }
    
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        
        // Update particle properties based on new settings
        this.particles.forEach(particle => {
            particle.preset = this.settings.preset;
        });
    }
    
    addParticles(newParticles) {
        this.particles.push(...newParticles);
    }
    
    clear() {
        this.particles = [];
        this.masks = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    getRandomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 60%)`;
    }
    
    start() {
        this.isPlaying = true;
        this.lastUpdateTime = performance.now();
    }
    
    stop() {
        this.isPlaying = false;
    }
}
