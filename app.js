// Main Application
class MotionAIStudio {
    constructor() {
        this.state = {
            isPlaying: false,
            currentTool: 'select',
            gifLoaded: false,
            materialLoaded: false,
            masks: [],
            particles: [],
            fps: 0,
            lastFrameTime: 0,
            frameCount: 0,
            animationId: null
        };
        
        // Initialize components
        this.initComponents();
        this.bindEvents();
        this.updateUI();
    }
    
    initComponents() {
        // Get canvas elements
        this.canvas = {
            gif: document.getElementById('gifCanvas'),
            mask: document.getElementById('maskCanvas'),
            material: document.getElementById('materialCanvas')
        };
        
        // Get contexts
        this.ctx = {
            gif: this.canvas.gif.getContext('2d'),
            mask: this.canvas.mask.getContext('2d'),
            material: this.canvas.material.getContext('2d')
        };
        
        // Initialize layers
        this.gifPlayer = new GIFPlayer(this.canvas.gif, this.ctx.gif);
        this.maskEngine = new MaskEngine(this.canvas.mask, this.ctx.mask);
        this.materialLayer = new MaterialLayer(this.canvas.material, this.ctx.material);
        this.directionSelector = new DirectionSelector();
        this.videoExporter = new VideoExporter(this.canvas.material);
        
        // Set canvas size
        this.resizeCanvases();
        window.addEventListener('resize', () => this.resizeCanvases());
    }
    
    resizeCanvases() {
        const container = document.querySelector('.canvas-container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Set all canvases to same size
        Object.values(this.canvas).forEach(canvas => {
            canvas.width = width;
            canvas.height = height;
        });
        
        // Update status
        document.getElementById('canvasSize').textContent = 
            `${width}x${height}`;
    }
    
    bindEvents() {
        // File uploads
        document.getElementById('gifInput').addEventListener('change', (e) => {
            this.loadGIF(e.target.files[0]);
        });
        
        document.getElementById('materialInput').addEventListener('change', (e) => {
            this.loadMaterial(e.target.files[0]);
        });
        
        // Upload area clicks
        document.getElementById('gifUploadArea').addEventListener('click', () => {
            document.getElementById('gifInput').click();
        });
        
        document.getElementById('materialUploadArea').addEventListener('click', () => {
            document.getElementById('materialInput').click();
        });
        
        // Tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tool = btn.dataset.tool;
                this.selectTool(tool);
            });
        });
        
        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                this.selectPreset(preset);
            });
        });
        
        // Control buttons
        document.getElementById('playBtn').addEventListener('click', () => {
            this.togglePlay();
        });
        
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportVideo();
        });
        
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearAll();
        });
        
        // Sliders
        document.getElementById('densitySlider').addEventListener('input', (e) => {
            this.updateSetting('density', e.target.value);
            document.getElementById('densityValue').textContent = `${e.target.value}%`;
        });
        
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.updateSetting('speed', e.target.value);
            document.getElementById('speedValue').textContent = `${e.target.value}%`;
        });
        
        document.getElementById('sizeSlider').addEventListener('input', (e) => {
            this.updateSetting('size', e.target.value);
            document.getElementById('sizeValue').textContent = `${e.target.value}px`;
        });
        
        document.getElementById('opacitySlider').addEventListener('input', (e) => {
            this.updateSetting('opacity', e.target.value);
            document.getElementById('opacityValue').textContent = `${e.target.value}%`;
        });
        
        // Canvas interaction
        this.canvas.mask.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.mask.addEventListener('dblclick', (e) => this.handleCanvasDoubleClick(e));
    }
    
    async loadGIF(file) {
        try {
            await this.gifPlayer.load(file);
            this.state.gifLoaded = true;
            this.showNotification('✅ GIF loaded successfully');
            this.updateUI();
        } catch (error) {
            this.showNotification('❌ Error loading GIF', 'error');
            console.error(error);
        }
    }
    
    async loadMaterial(file) {
        try {
            await this.materialLayer.loadMaterial(file);
            this.state.materialLoaded = true;
            document.getElementById('materialStatus').textContent = 'Loaded';
            document.getElementById('materialStatus').style.color = '#10b981';
            this.showNotification('✅ Material image loaded');
            this.updateUI();
        } catch (error) {
            this.showNotification('❌ Error loading material', 'error');
        }
    }
    
    selectTool(tool) {
        this.state.currentTool = tool;
        
        // Update UI
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tool === tool) {
                btn.classList.add('active');
            }
        });
        
        // Update cursor
        switch(tool) {
            case 'select':
                this.canvas.mask.style.cursor = 'default';
                break;
            case 'pen':
                this.canvas.mask.style.cursor = 'crosshair';
                break;
            case 'edit':
                this.canvas.mask.style.cursor = 'move';
                break;
        }
    }
    
    handleCanvasClick(e) {
        if (this.state.currentTool !== 'pen') return;
        
        const rect = this.canvas.mask.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.maskEngine.startDrawing(x, y);
    }
    
    handleCanvasDoubleClick(e) {
        if (this.state.currentTool !== 'pen') return;
        
        const rect = this.canvas.mask.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Finish the current drawing
        this.maskEngine.addPoint(x, y); // Add final point
        const completedMask = this.maskEngine.finishDrawing();
        
        if (completedMask && completedMask.center) {
            // Show direction selector at the center of the mask
            this.directionSelector.show(completedMask.center.x, completedMask.center.y);
            
            // Store reference to the mask index for later
            this.pendingMaskIndex = this.maskEngine.masks.length - 1;
            
            // Handle direction selection
            this.directionSelector.onSelect = (direction) => {
                this.createMaskWithDirection(direction);
                this.directionSelector.hide();
            };
        }
    }
    
    createMaskWithDirection(direction) {
        // Update the mask with the selected direction
        this.maskEngine.updateMaskDirection(this.pendingMaskIndex, direction);
        
        // Add to state
        const mask = this.maskEngine.masks[this.pendingMaskIndex];
        this.state.masks.push(mask);
        
        // Generate particles for this mask
        if (this.state.materialLoaded) {
            const particles = this.materialLayer.generateParticlesForMask(mask);
            this.materialLayer.addParticles(particles);
        }
        
        this.updateUI();
        this.showNotification(`✅ Area created with ${direction.dir} direction`);
    }
    
    selectPreset(preset) {
        this.materialLayer.setPreset(preset);
        
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.preset === preset) {
                btn.classList.add('active');
            }
        });
        
        this.showNotification(`Preset changed to: ${preset}`);
    }
    
    updateSetting(setting, value) {
        const settings = {
            density: value / 100,
            speed: value / 100,
            size: parseInt(value),
            opacity: value / 100
        };
        
        this.materialLayer.updateSettings(settings);
        
        // Regenerate particles if density changed
        if (setting === 'density' && this.state.materialLoaded) {
            this.regenerateParticles();
        }
    }
    
    regenerateParticles() {
        // Clear and regenerate all particles
        this.materialLayer.clear();
        this.state.masks.forEach(mask => {
            const particles = this.materialLayer.generateParticlesForMask(mask);
            this.materialLayer.addParticles(particles);
        });
        this.updateParticleCount();
    }
    
    togglePlay() {
        this.state.isPlaying = !this.state.isPlaying;
        
        const playBtn = document.getElementById('playBtn');
        if (this.state.isPlaying) {
            playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            playBtn.classList.remove('btn-primary');
            playBtn.classList.add('btn-danger');
            
            this.startAnimation();
            document.getElementById('statusText').textContent = 'Playing';
        } else {
            playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
            playBtn.classList.remove('btn-danger');
            playBtn.classList.add('btn-primary');
            
            this.stopAnimation();
            document.getElementById('statusText').textContent = 'Paused';
        }
    }
    
    startAnimation() {
        this.state.lastFrameTime = performance.now();
        this.animate();
    }
    
    animate() {
        if (!this.state.isPlaying) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.state.lastFrameTime;
        this.state.lastFrameTime = currentTime;
        
        // Calculate FPS
        if (deltaTime > 0) {
            this.state.fps = Math.round(1000 / deltaTime);
            document.getElementById('fpsCounter').textContent = this.state.fps;
        }
        
        // Update particles
        this.materialLayer.updateParticles(deltaTime);
        
        // Draw everything
        this.materialLayer.draw();
        
        // Continue animation
        this.state.animationId = requestAnimationFrame(() => this.animate());
    }
    
    stopAnimation() {
        if (this.state.animationId) {
            cancelAnimationFrame(this.state.animationId);
            this.state.animationId = null;
        }
    }
    
    async exportVideo() {
        if (!this.state.materialLoaded) {
            this.showNotification('⚠️ Please load material first', 'warning');
            return;
        }
        
        try {
            this.showNotification('⏳ Exporting video...');
            
            // Export as MP4 (easier than GIF)
            const url = await this.videoExporter.exportMP4({
                duration: 5, // 5 seconds
                framerate: 30
            });
            
            // Download the video
            const a = document.createElement('a');
            a.href = url;
            a.download = `motion-simulation-${Date.now()}.mp4`;
            a.click();
            
            this.showNotification('✅ Video exported successfully!');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('❌ Error exporting video', 'error');
        }
    }
    
    clearAll() {
        if (!confirm('Are you sure you want to clear everything?')) return;
        
        this.state.masks = [];
        this.state.particles = [];
        this.state.isPlaying = false;
        
        // Reset UI
        document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i> Play';
        document.getElementById('playBtn').classList.remove('btn-danger');
        document.getElementById('playBtn').classList.add('btn-primary');
        
        this.stopAnimation();
        this.maskEngine.clear();
        this.materialLayer.clear();
        this.updateUI();
        
        this.showNotification('🗑️ All content cleared');
    }
    
    updateUI() {
        // Update counts
        document.getElementById('areaCount').textContent = this.state.masks.length;
        this.updateParticleCount();
        
        // Update status
        const status = this.state.gifLoaded ? 
            (this.state.materialLoaded ? 'Ready' : 'Load material') : 
            'Load GIF';
        document.getElementById('statusText').textContent = status;
    }
    
    updateParticleCount() {
        // This needs to be implemented based on how particles are stored
        const particleCount = this.materialLayer.particles ? this.materialLayer.particles.length : 0;
        document.getElementById('particleCount').textContent = particleCount;
    }
    
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
            info: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MotionAIStudio();
    console.log('🚀 Motion AI Studio initialized!');
});
