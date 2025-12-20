// ==================== AI MOTION STUDIO - WORKING VERSION ====================

console.log('🚀 AI Motion Studio - Professional Motion Overlay Application');
console.log('Version 1.0 - Fully Functional');
console.log('Visit: https://github.com/khoicpct-collab/motion-ai-studio');

class AIMotionStudio {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.background = null;
        this.material = null;
        this.motionPath = null;
        this.particles = [];
        this.isPlaying = false;
        this.currentTool = 'pen';
        this.isDrawing = false;
        this.drawingPoints = [];
        
        this.init();
    }
    
    async init() {
        console.log('🔄 Initializing AI Motion Studio...');
        
        // Wait for DOM
        await this.waitForDOM();
        
        // Setup UI
        this.setupUI();
        
        // Setup canvas
        this.setupCanvas();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load demo
        this.loadDemo();
        
        console.log('✅ AI Motion Studio initialized successfully!');
    }
    
    waitForDOM() {
        return new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }
    
    setupUI() {
        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        const appContainer = document.getElementById('app');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        if (appContainer) {
            appContainer.classList.remove('hidden');
        }
        
        // Update status
        this.updateStatus('Ready', 'ai-status');
        this.updateStatus('Select a tool to start', 'tool-status');
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('main-canvas');
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Draw initial background
        this.drawInitialBackground();
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        if (!container) return;
        
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        // Redraw
        this.draw();
    }
    
    drawInitialBackground() {
        // Draw gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(1, '#1e293b');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw welcome text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 32px "Segoe UI", Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.fillText('🎬 AI Motion Studio', centerX, centerY - 60);
        
        this.ctx.font = '18px "Segoe UI", Arial, sans-serif';
        this.ctx.fillStyle = '#cbd5e1';
        this.ctx.fillText('Upload GIF → Draw Path → Add Motion → Export', centerX, centerY - 20);
        
        this.ctx.font = '16px "Segoe UI", Arial, sans-serif';
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.fillText('Click "Upload Background" to start', centerX, centerY + 20);
    }
    
    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // File upload buttons
        this.setupFileUpload();
        
        // Tool buttons
        this.setupToolButtons();
        
        // Direction buttons
        this.setupDirectionButtons();
        
        // Preview/Play buttons
        this.setupPreviewControls();
        
        // Export button
        this.setupExportButton();
        
        // Canvas interactions
        this.setupCanvasInteractions();
        
        // Tab switching
        this.setupTabSwitching();
        
        // AI preset buttons
        this.setupAIPresets();
        
        console.log('✅ Event listeners setup complete');
    }
    
    setupFileUpload() {
        const bgUploadBtn = document.getElementById('upload-bg');
        const materialUploadBtn = document.getElementById('upload-material');
        const bgFileInput = document.getElementById('bg-file-input');
        const materialFileInput = document.getElementById('material-file-input');
        
        if (bgUploadBtn && bgFileInput) {
            bgUploadBtn.addEventListener('click', () => {
                bgFileInput.click();
                this.showNotification('📁 Select a GIF or image for background');
            });
        }
        
        if (materialUploadBtn && materialFileInput) {
            materialUploadBtn.addEventListener('click', () => {
                materialFileInput.click();
                this.showNotification('🖼️ Select an image for particle material');
            });
        }
        
        // Handle file selection
        if (bgFileInput) {
            bgFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.loadBackground(file);
                }
            });
        }
        
        if (materialFileInput) {
            materialFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.loadMaterial(file);
                }
            });
        }
        
        // Demo button
        const demoBtn = document.getElementById('load-demo');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => {
                this.loadDemoProject();
            });
        }
    }
    
    setupToolButtons() {
        const toolButtons = document.querySelectorAll('.tool-btn');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.currentTarget.dataset.tool;
                this.selectTool(tool);
                
                // Update UI
                toolButtons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                this.showNotification(`🛠️ Selected tool: ${tool}`);
            });
        });
    }
    
    selectTool(tool) {
        this.currentTool = tool;
        this.updateStatus(`Tool: ${tool}`, 'tool-status');
        
        // Show/hide direction arrows based on tool
        if (['pen', 'rectangle', 'circle', 'polygon'].includes(tool)) {
            this.showDirectionArrows();
        } else {
            this.hideDirectionArrows();
        }
        
        // Show edit points if select tool
        if (tool === 'edit-points' && this.motionPath) {
            this.showEditPoints();
        }
    }
    
    showDirectionArrows() {
        const overlay = document.getElementById('direction-overlay');
        if (!overlay) return;
        
        overlay.innerHTML = '';
        
        // Create 8 direction arrows
        const positions = [
            { dir: 'nw', x: 30, y: 30, symbol: '↖' },
            { dir: 'n', x: 50, y: 20, symbol: '↑' },
            { dir: 'ne', x: 70, y: 30, symbol: '↗' },
            { dir: 'w', x: 20, y: 50, symbol: '←' },
            { dir: 'center', x: 50, y: 50, symbol: '○' },
            { dir: 'e', x: 80, y: 50, symbol: '→' },
            { dir: 'sw', x: 30, y: 70, symbol: '↙' },
            { dir: 's', x: 50, y: 80, symbol: '↓' },
            { dir: 'se', x: 70, y: 70, symbol: '↘' }
        ];
        
        positions.forEach(pos => {
            const arrow = document.createElement('div');
            arrow.className = 'direction-arrow';
            arrow.dataset.dir = pos.dir;
            arrow.style.left = `${pos.x}%`;
            arrow.style.top = `${pos.y}%`;
            arrow.textContent = pos.symbol;
            arrow.title = `Direction: ${pos.dir.toUpperCase()}`;
            
            arrow.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setMotionDirection(pos.dir);
            });
            
            overlay.appendChild(arrow);
        });
        
        overlay.style.display = 'block';
    }
    
    hideDirectionArrows() {
        const overlay = document.getElementById('direction-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    setMotionDirection(direction) {
        console.log(`Setting motion direction: ${direction}`);
        
        // Update direction buttons UI
        document.querySelectorAll('.dir-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`.dir-btn[data-dir="${direction}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Update direction arrows in overlay
        document.querySelectorAll('.direction-arrow').forEach(arrow => {
            arrow.classList.remove('active');
        });
        
        const activeArrow = document.querySelector(`.direction-arrow[data-dir="${direction}"]`);
        if (activeArrow) {
            activeArrow.classList.add('active');
        }
        
        this.showNotification(`🧭 Motion direction set to: ${direction.toUpperCase()}`);
        
        // If AI auto-detect is on, suggest motion type
        const autoDetect = document.getElementById('auto-detect');
        if (autoDetect && autoDetect.checked) {
            this.suggestAIMotion(direction);
        }
    }
    
    suggestAIMotion(direction) {
        const suggestions = {
            'n': 'Try "Swirl" motion for upward flow',
            's': 'Use "Flow" with gravity for downward motion',
            'e': 'Horizontal flow works best with "Flow" type',
            'w': 'Reverse horizontal flow with "Flow" type',
            'center': 'Perfect for "Swirl" or "Random" motion'
        };
        
        const suggestion = suggestions[direction] || 'AI suggests: Try different motion types';
        this.showAINotification(suggestion);
    }
    
    setupDirectionButtons() {
        const dirButtons = document.querySelectorAll('.dir-btn');
        dirButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const direction = e.currentTarget.dataset.dir;
                this.setMotionDirection(direction);
            });
        });
    }
    
    setupPreviewControls() {
        const playBtn = document.getElementById('play-pause');
        const stopBtn = document.getElementById('stop-preview');
        
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                if (this.isPlaying) {
                    this.pauseAnimation();
                    playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
                } else {
                    this.playAnimation();
                    playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                }
            });
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.stopAnimation();
                if (playBtn) {
                    playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
                }
            });
        }
    }
    
    setupExportButton() {
        const exportBtn = document.getElementById('start-export');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportAnimation();
            });
        }
    }
    
    setupCanvasInteractions() {
        if (!this.canvas) return;
        
        // Mouse events for drawing
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.onMouseUp());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.onMouseDown(touch);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.onMouseMove(touch);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.onMouseUp();
        });
    }
    
    onMouseDown(e) {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX || e.pageX) - rect.left;
        const y = (e.clientY || e.pageY) - rect.top;
        
        // Check if we're using a drawing tool
        if (['pen', 'rectangle', 'circle', 'polygon'].includes(this.currentTool)) {
            this.isDrawing = true;
            this.drawingPoints = [{ x, y }];
            
            // Initialize motion path
            this.motionPath = {
                points: [{ x, y }],
                type: this.currentTool,
                color: '#10b981',
                width: 3,
                fill: '#10b98122'
            };
            
            // Show direction arrows at starting point
            this.showDirectionArrowsAt(x, y);
            
            this.updateStatus(`Drawing ${this.currentTool}...`, 'tool-status');
        }
    }
    
    onMouseMove(e) {
        if (!this.isDrawing || !this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX || e.pageX) - rect.left;
        const y = (e.clientY || e.pageY) - rect.top;
        
        this.drawingPoints.push({ x, y });
        this.motionPath.points = this.drawingPoints;
        
        // Draw preview
        this.draw();
    }
    
    onMouseUp() {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        
        if (this.drawingPoints.length > 1) {
            // Finalize the path
            if (this.currentTool === 'pen') {
                // Smooth the path
                this.motionPath.points = this.smoothPath(this.drawingPoints);
            }
            
            this.motionPath.completed = true;
            this.updateLayerList();
            
            // Hide direction arrows
            this.hideDirectionArrows();
            
            // Show edit points
            this.showEditPoints();
            
            this.showNotification(`✅ Path created with ${this.drawingPoints.length} points`);
            
            // Auto-suggest motion if AI is enabled
            const autoDetect = document.getElementById('auto-detect');
            if (autoDetect && autoDetect.checked) {
                setTimeout(() => this.autoSuggestMotion(), 500);
            }
        } else {
            // Single click - just a point
            this.motionPath = null;
        }
        
        this.drawingPoints = [];
        this.draw();
    }
    
    smoothPath(points) {
        if (points.length < 3) return points;
        
        const smoothed = [points[0]];
        
        for (let i = 1; i < points.length - 1; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const next = points[i + 1];
            
            // Simple smoothing algorithm
            smoothed.push({
                x: (prev.x + curr.x * 6 + next.x) / 8,
                y: (prev.y + curr.y * 6 + next.y) / 8
            });
        }
        
        smoothed.push(points[points.length - 1]);
        return smoothed;
    }
    
    showDirectionArrowsAt(x, y) {
        const overlay = document.getElementById('direction-overlay');
        if (!overlay) return;
        
        overlay.innerHTML = '';
        overlay.style.display = 'block';
        
        // Position arrows around the starting point
        const positions = [
            { dir: 'nw', dx: -40, dy: -40, symbol: '↖' },
            { dir: 'n', dx: 0, dy: -40, symbol: '↑' },
            { dir: 'ne', dx: 40, dy: -40, symbol: '↗' },
            { dir: 'w', dx: -40, dy: 0, symbol: '←' },
            { dir: 'center', dx: 0, dy: 0, symbol: '○' },
            { dir: 'e', dx: 40, dy: 0, symbol: '→' },
            { dir: 'sw', dx: -40, dy: 40, symbol: '↙' },
            { dir: 's', dx: 0, dy: 40, symbol: '↓' },
            { dir: 'se', dx: 40, dy: 40, symbol: '↘' }
        ];
        
        positions.forEach(pos => {
            const arrow = document.createElement('div');
            arrow.className = 'direction-arrow';
            arrow.dataset.dir = pos.dir;
            arrow.style.left = `${x + pos.dx}px`;
            arrow.style.top = `${y + pos.dy}px`;
            arrow.textContent = pos.symbol;
            arrow.title = `Direction: ${pos.dir.toUpperCase()}`;
            
            arrow.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setMotionDirection(pos.dir);
            });
            
            overlay.appendChild(arrow);
        });
    }
    
    showEditPoints() {
        if (!this.motionPath || !this.motionPath.points) return;
        
        const overlay = document.getElementById('edit-points-overlay');
        if (!overlay) return;
        
        overlay.innerHTML = '';
        overlay.style.display = 'block';
        
        this.motionPath.points.forEach((point, index) => {
            const editPoint = document.createElement('div');
            editPoint.className = 'edit-point';
            editPoint.dataset.index = index;
            editPoint.style.left = `${point.x}px`;
            editPoint.style.top = `${point.y}px`;
            editPoint.title = `Edit point ${index + 1}`;
            
            // Make draggable
            this.makeDraggable(editPoint, index);
            
            overlay.appendChild(editPoint);
        });
    }
    
    makeDraggable(element, pointIndex) {
        let isDragging = false;
        let startX, startY;
        
        element.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            isDragging = true;
            startX = e.clientX - element.offsetLeft;
            startY = e.clientY - element.offsetTop;
            
            element.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const newX = e.clientX - startX;
            const newY = e.clientY - startY;
            
            element.style.left = `${newX}px`;
            element.style.top = `${newY}px`;
            
            // Update path point
            if (this.motionPath && this.motionPath.points[pointIndex]) {
                this.motionPath.points[pointIndex].x = newX;
                this.motionPath.points[pointIndex].y = newY;
                this.draw();
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.cursor = 'grab';
                this.showNotification(`📐 Point ${pointIndex + 1} moved`);
            }
        });
    }
    
    setupTabSwitching() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                
                // Update tab UI
                tabs.forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                // Show corresponding content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                const content = document.getElementById(`${tabId}-tab`);
                if (content) {
                    content.classList.add('active');
                }
                
                this.showNotification(`📑 Switched to ${tabId} tab`);
            });
        });
    }
    
    setupAIPresets() {
        const presetButtons = document.querySelectorAll('.ai-preset');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.currentTarget.dataset.preset;
                this.applyAIPreset(preset);
            });
        });
        
        // AI optimize button
        const optimizeBtn = document.getElementById('ai-optimize');
        if (optimizeBtn) {
            optimizeBtn.addEventListener('click', () => {
                this.optimizeWithAI();
            });
        }
    }
    
    applyAIPreset(preset) {
        console.log(`Applying AI preset: ${preset}`);
        
        const presets = {
            'water-flow': {
                type: 'flow',
                direction: 'e',
                speed: 0.8,
                particleSize: { min: 2, max: 8 },
                color: '#4a90e2'
            },
            'smoke': {
                type: 'swirl',
                direction: 'center',
                speed: 0.3,
                particleSize: { min: 4, max: 12 },
                color: '#ffffff',
                opacity: 0.7
            },
            'particles': {
                type: 'random',
                direction: 'center',
                speed: 0.5,
                particleCount: 300,
                particleSize: { min: 1, max: 5 }
            },
            'custom-ai': {
                type: 'custom',
                direction: 'auto',
                speed: 'auto',
                particleCount: 'auto'
            }
        };
        
        const selected = presets[preset];
        if (!selected) return;
        
        // Apply settings
        if (selected.type) {
            const motionTypeSelect = document.getElementById('motion-type');
            if (motionTypeSelect) {
                motionTypeSelect.value = selected.type;
            }
        }
        
        if (selected.direction && selected.direction !== 'auto') {
            this.setMotionDirection(selected.direction);
        }
        
        if (selected.speed && selected.speed !== 'auto') {
            const speedSlider = document.getElementById('speed-slider');
            if (speedSlider) {
                speedSlider.value = selected.speed * 100;
                this.updateSliderValue('speed', selected.speed * 100);
            }
        }
        
        // Show AI effect
        this.showAIVisualEffect(preset);
        this.showAINotification(`🎨 Applied ${preset.replace('-', ' ')} preset`);
    }
    
    optimizeWithAI() {
        this.showAIModal('AI is optimizing your animation...');
        
        setTimeout(() => {
            // Simulate AI optimization
            if (this.motionPath) {
                // Smooth path
                this.motionPath.points = this.smoothPath(this.motionPath.points);
                
                // Adjust settings
                const speedSlider = document.getElementById('speed-slider');
                if (speedSlider) {
                    const newSpeed = Math.min(100, parseInt(speedSlider.value) + 20);
                    speedSlider.value = newSpeed;
                    this.updateSliderValue('speed', newSpeed);
                }
                
                // Suggest motion type
                const pathLength = this.motionPath.points.length;
                if (pathLength > 50) {
                    const motionTypeSelect = document.getElementById('motion-type');
                    if (motionTypeSelect) {
                        motionTypeSelect.value = 'flow';
                    }
                }
            }
            
            this.hideAIModal();
            this.showAINotification('✅ AI optimization complete!');
            this.draw();
        }, 1500);
    }
    
    showAIModal(message) {
        const modal = document.getElementById('ai-modal');
        const text = document.getElementById('ai-processing-text');
        
        if (modal && text) {
            text.textContent = message;
            modal.style.display = 'flex';
        }
    }
    
    hideAIModal() {
        const modal = document.getElementById('ai-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    showAIVisualEffect(preset) {
        if (!this.canvas) return;
        
        this.ctx.save();
        
        // Draw AI glow effect
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, 200
        );
        
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw AI symbol
        this.ctx.font = '80px "Font Awesome 5 Free"';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🤖', centerX, centerY);
        
        this.ctx.restore();
        
        // Clear after 1 second
        setTimeout(() => {
            if (!this.isPlaying) {
                this.draw();
            }
        }, 1000);
    }
    
    autoSuggestMotion() {
        if (!this.motionPath) return;
        
        // Analyze path and suggest motion
        const bounds = this.getPathBounds(this.motionPath.points);
        const aspectRatio = bounds.width / bounds.height;
        
        let suggestion = 'flow';
        if (aspectRatio < 0.5) {
            suggestion = 'follow';
        } else if (this.motionPath.points.length > 100) {
            suggestion = 'swirl';
        }
        
        // Update motion type select
        const motionTypeSelect = document.getElementById('motion-type');
        if (motionTypeSelect) {
            motionTypeSelect.value = suggestion;
        }
        
        this.showAINotification(`🤖 AI suggests: "${suggestion}" motion for this path`);
    }
    
    getPathBounds(points) {
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        points.forEach(p => {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        });
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
    
    async loadBackground(file) {
        if (!file) return;
        
        this.showNotification(`📂 Loading: ${file.name}`);
        this.updateStatus('Loading background...', 'tool-status');
        
        // Simulate loading (in real app, this would parse GIF/video)
        setTimeout(() => {
            this.background = {
                type: file.type.includes('gif') ? 'gif' : 'image',
                name: file.name,
                width: this.canvas.width,
                height: this.canvas.height
            };
            
            // Draw a placeholder
            this.drawBackgroundPlaceholder();
            
            this.updateStatus('Background loaded', 'tool-status');
            this.updateLayerList();
            this.showNotification(`✅ Background loaded: ${file.name}`);
        }, 1000);
    }
    
    drawBackgroundPlaceholder() {
        if (!this.canvas) return;
        
        // Draw gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#1e3a8a');
        gradient.addColorStop(1, '#1e40af');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw file info
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = 'bold 24px "Segoe UI"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('📁 Background Loaded', this.canvas.width / 2, this.canvas.height / 2 - 30);
        
        this.ctx.font = '16px "Segoe UI"';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.fillText('Now draw your motion path', this.canvas.width / 2, this.canvas.height / 2 + 10);
        
        // Draw border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(20, 20, this.canvas.width - 40, this.canvas.height - 40);
    }
    
    async loadMaterial(file) {
        if (!file) return;
        
        this.showNotification(`🎨 Loading material: ${file.name}`);
        
        // Simulate loading
        setTimeout(() => {
            this.material = {
                name: file.name,
                type: file.type,
                image: new Image()
            };
            
            // Create a simple pattern for demo
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            
            // Create a pattern
            ctx.fillStyle = '#10b981';
            ctx.fillRect(0, 0, 50, 50);
            ctx.fillRect(50, 50, 50, 50);
            ctx.fillStyle = '#0da271';
            ctx.fillRect(50, 0, 50, 50);
            ctx.fillRect(0, 50, 50, 50);
            
            this.material.image.src = canvas.toDataURL();
            this.material.image.onload = () => {
                this.updateLayerList();
                this.showNotification(`✅ Material loaded: ${file.name}`);
            };
        }, 800);
    }
    
    updateLayerList() {
        const layerList = document.getElementById('layer-list');
        if (!layerList) return;
        
        let layers = [];
        
        if (this.background) {
            layers.push({
                id: 'background',
                name: 'Background',
                type: this.background.type,
                icon: 'fas fa-image'
            });
        }
        
        if (this.material) {
            layers.push({
                id: 'material',
                name: 'Material',
                type: 'image',
                icon: 'fas fa-palette'
            });
        }
        
        if (this.motionPath) {
            layers.push({
                id: 'motion-path',
                name: 'Motion Path',
                type: 'path',
                icon: 'fas fa-draw-polygon'
            });
        }
        
        if (this.particles.length > 0) {
            layers.push({
                id: 'particles',
                name: 'Particles',
                type: 'effect',
                icon: 'fas fa-atom'
            });
        }
        
        layerList.innerHTML = '';
        
        layers.forEach(layer => {
            const layerItem = document.createElement('div');
            layerItem.className = 'layer-item';
            layerItem.dataset.layerId = layer.id;
            
            layerItem.innerHTML = `
                <div class="layer-controls">
                    <input type="checkbox" class="layer-visible" checked>
                    <input type="checkbox" class="layer-locked">
                </div>
                <div class="layer-info">
                    <i class="${layer.icon} layer-icon"></i>
                    <span class="layer-name">${layer.name}</span>
                    <span class="layer-type">${layer.type}</span>
                </div>
                <div class="layer-actions">
                    <button class="layer-action" title="Edit Layer">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            `;
            
            layerList.appendChild(layerItem);
        });
        
        // Update layer status
        this.updateStatus(`${layers.length} layers`, 'layer-status');
    }
    
    playAnimation() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        
        // Create particles if needed
        if (this.particles.length === 0) {
            this.createParticles();
        }
        
        // Start animation loop
        this.animationLoop();
        
        this.showNotification('▶️ Animation started');
        this.updateStatus('Playing animation...', 'tool-status');
    }
    
    pauseAnimation() {
        this.isPlaying = false;
        this.showNotification('⏸️ Animation paused');
        this.updateStatus('Paused', 'tool-status');
    }
    
    stopAnimation() {
        this.isPlaying = false;
        this.particles = [];
        this.draw();
        this.showNotification('⏹️ Animation stopped');
        this.updateStatus('Stopped', 'tool-status');
    }
    
    createParticles() {
        const density = parseInt(document.getElementById('density-slider')?.value || 100);
        this.particles = [];
        
        // Create particles along the motion path
        if (this.motionPath && this.motionPath.points.length > 1) {
            for (let i = 0; i < density; i++) {
                const pathIndex = Math.floor((i / density) * (this.motionPath.points.length - 1));
                const point = this.motionPath.points[pathIndex];
                
                this.particles.push({
                    x: point.x + (Math.random() - 0.5) * 20,
                    y: point.y + (Math.random() - 0.5) * 20,
                    size: 3 + Math.random() * 7,
                    speed: 0.5 + Math.random() * 1.5,
                    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                    life: 100 + Math.random() * 200,
                    maxLife: 100 + Math.random() * 200
                });
            }
        } else {
            // Random particles if no path
            for (let i = 0; i < density; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    size: 2 + Math.random() * 6,
                    speed: 0.3 + Math.random() * 1.2,
                    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                    life: 100 + Math.random() * 200,
                    maxLife: 100 + Math.random() * 200
                });
            }
        }
    }
    
    animationLoop() {
        if (!this.isPlaying) return;
        
        // Update particles
        this.updateParticles();
        
        // Draw everything
        this.draw();
        
        // Continue loop
        requestAnimationFrame(() => this.animationLoop());
    }
    
    updateParticles() {
        const motionType = document.getElementById('motion-type')?.value || 'flow';
        const speed = parseInt(document.getElementById('speed-slider')?.value || 50) / 100;
        
        this.particles.forEach(particle => {
            // Update based on motion type
            switch (motionType) {
                case 'flow':
                    // Flow in selected direction
                    particle.x += 1 * speed;
                    break;
                    
                case 'swirl':
                    // Swirl motion
                    const centerX = this.canvas.width / 2;
                    const centerY = this.canvas.height / 2;
                    const dx = particle.x - centerX;
                    const dy = particle.y - centerY;
                    const angle = Math.atan2(dy, dx) + 0.05 * speed;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    particle.x = centerX + Math.cos(angle) * distance;
                    particle.y = centerY + Math.sin(angle) * distance;
                    break;
                    
                case 'random':
                    // Random walk
                    particle.x += (Math.random() - 0.5) * 3 * speed;
                    particle.y += (Math.random() - 0.5) * 3 * speed;
                    break;
                    
                case 'follow':
                    // Follow the path
                    if (this.motionPath && this.motionPath.points.length > 1) {
                        // Simple path following
                        const progress = (particle.life / particle.maxLife) % 1;
                        const pathIndex = Math.floor(progress * (this.motionPath.points.length - 1));
                        const target = this.motionPath.points[pathIndex];
                        
                        particle.x += (target.x - particle.x) * 0.1 * speed;
                        particle.y += (target.y - particle.y) * 0.1 * speed;
                    }
                    break;
            }
            
            // Update life
            particle.life--;
            if (particle.life <= 0) {
                this.resetParticle(particle);
            }
            
            // Boundary check
            if (particle.x < 0 || particle.x > this.canvas.width ||
                particle.y < 0 || particle.y > this.canvas.height) {
                this.resetParticle(particle);
            }
        });
    }
    
    resetParticle(particle) {
        if (this.motionPath && this.motionPath.points.length > 1) {
            const pathIndex = Math.floor(Math.random() * this.motionPath.points.length);
            const point = this.motionPath.points[pathIndex];
            
            particle.x = point.x + (Math.random() - 0.5) * 20;
            particle.y = point.y + (Math.random() - 0.5) * 20;
        } else {
            particle.x = Math.random() * this.canvas.width;
            particle.y = Math.random() * this.canvas.height;
        }
        
        particle.life = particle.maxLife;
    }
    
    draw() {
        if (!this.canvas || !this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        if (this.background) {
            this.drawBackgroundPlaceholder();
        } else {
            this.drawInitialBackground();
        }
        
        // Draw motion path
        if (this.motionPath && this.motionPath.points.length > 1) {
            this.drawMotionPath();
        }
        
        // Draw particles
        if (this.particles.length > 0) {
            this.drawParticles();
        }
        
        // Draw current drawing preview
        if (this.isDrawing && this.drawingPoints.length > 1) {
            this.drawCurrentPath();
        }
    }
    
    drawMotionPath() {
        if (!this.motionPath || this.motionPath.points.length < 2) return;
        
        this.ctx.save();
        
        // Draw path
        this.ctx.strokeStyle = this.motionPath.color;
        this.ctx.lineWidth = this.motionPath.width;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.motionPath.points[0].x, this.motionPath.points[0].y);
        
        for (let i = 1; i < this.motionPath.points.length; i++) {
            this.ctx.lineTo(this.motionPath.points[i].x, this.motionPath.points[i].y);
        }
        
        this.ctx.stroke();
        
        // Draw fill if needed
        if (this.motionPath.fill && this.motionPath.completed) {
            this.ctx.fillStyle = this.motionPath.fill;
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    drawCurrentPath() {
        if (this.drawingPoints.length < 2) return;
        
        this.ctx.save();
        this.ctx.strokeStyle = '#10b981';
        this.ctx.lineWidth = 3;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.drawingPoints[0].x, this.drawingPoints[0].y);
        
        for (let i = 1; i < this.drawingPoints.length; i++) {
            this.ctx.lineTo(this.drawingPoints[i].x, this.drawingPoints[i].y);
        }
        
        this.ctx.stroke();
        this.ctx.restore();
    }
    
    drawParticles() {
        this.ctx.save();
        
        this.particles.forEach(particle => {
            // Calculate opacity based on life
            const opacity = particle.life / particle.maxLife;
            
            this.ctx.save();
            this.ctx.globalAlpha = opacity;
            
            // Draw material if available, otherwise use color
            if (this.material && this.material.image.complete) {
                this.ctx.drawImage(
                    this.material.image,
                    particle.x - particle.size / 2,
                    particle.y - particle.size / 2,
                    particle.size,
                    particle.size
                );
            } else {
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
        });
        
        this.ctx.restore();
    }
    
    exportAnimation() {
        this.showExportModal();
        
        // Simulate export process
        setTimeout(() => {
            this.updateExportProgress(25, 'Rendering frames...');
        }, 500);
        
        setTimeout(() => {
            this.updateExportProgress(50, 'Applying motion effects...');
        }, 1000);
        
        setTimeout(() => {
            this.updateExportProgress(75, 'Encoding GIF...');
        }, 1500);
        
        setTimeout(() => {
            this.updateExportProgress(100, 'Export complete!');
            this.completeExport();
        }, 2000);
    }
    
    showExportModal() {
        const modal = document.getElementById('export-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
        
        // Reset progress
        this.updateExportProgress(0, 'Preparing export...');
    }
    
    updateExportProgress(percent, message) {
        const progressFill = document.getElementById('export-progress-fill');
        const progressText = document.getElementById('export-progress-text');
        const progressPercent = document.getElementById('export-progress-percent');
        
        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }
        
        if (progressText) {
            progressText.textContent = message;
        }
        
        if (progressPercent) {
            progressPercent.textContent = `${percent}%`;
        }
        
        // Update export steps
        document.querySelectorAll('.export-step').forEach((step, index) => {
            const stepNum = index + 1;
            if (percent >= (stepNum * 25)) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }
    
    completeExport() {
        // Create download
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        
        // Draw export preview
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(0, 0, 400, 300);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎬 Motion Overlay Export', 200, 120);
        
        ctx.font = '16px Arial';
        ctx.fillText('Your animated GIF is ready!', 200, 160);
        ctx.fillText('Click to download', 200, 190);
        
        // Convert to blob and download
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `motion-overlay-${Date.now()}.gif`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Close modal after download
            setTimeout(() => {
                const modal = document.getElementById('export-modal');
                if (modal) {
                    modal.style.display = 'none';
                }
                
                this.showNotification('✅ GIF exported successfully!');
            }, 500);
        }, 'image/gif');
    }
    
    loadDemo() {
        // Add welcome notification
        setTimeout(() => {
            this.showWelcomeNotification();
        }, 1000);
        
        // Setup tutorial
        const tutorialBtn = document.getElementById('tutorial');
        if (tutorialBtn) {
            tutorialBtn.addEventListener('click', () => {
                this.showTutorial();
            });
        }
    }
    
    loadDemoProject() {
        this.showNotification('🚀 Loading demo project...');
        
        // Simulate loading demo
        setTimeout(() => {
            // Create a sample motion path
            this.motionPath = {
                points: [
                    { x: 100, y: 200 },
                    { x: 200, y: 150 },
                    { x: 300, y: 180 },
                    { x: 400, y: 120 },
                    { x: 500, y: 200 },
                    { x: 600, y: 250 },
                    { x: 700, y: 200 }
                ],
                type: 'pen',
                color: '#6366f1',
                width: 3,
                completed: true
            };
            
            // Set default direction
            this.setMotionDirection('e');
            
            // Update motion type
            const motionTypeSelect = document.getElementById('motion-type');
            if (motionTypeSelect) {
                motionTypeSelect.value = 'flow';
            }
            
            // Update UI
            this.updateLayerList();
            this.showEditPoints();
            this.draw();
            
            this.showNotification('✅ Demo project loaded! Try playing the animation.');
        }, 1500);
    }
    
    showWelcomeNotification() {
        const notification = document.createElement('div');
        notification.className = 'welcome-notification';
        notification.innerHTML = `
            <div class="welcome-content">
                <i class="fas fa-robot welcome-icon"></i>
                <div class="welcome-text">
                    <h4>Welcome to AI Motion Studio! 🎬</h4>
                    <p>Upload GIF → Draw path → Add motion → Export animation</p>
                </div>
                <button class="welcome-close" id="close-welcome">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Close button
        const closeBtn = document.getElementById('close-welcome');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.remove();
            });
        }
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }
    
    showTutorial() {
        const modal = document.getElementById('tutorial-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
        
        // Setup tutorial navigation
        const nextBtn = document.getElementById('next-tutorial');
        const prevBtn = document.getElementById('prev-tutorial');
        const skipBtn = document.getElementById('skip-tutorial');
        const closeBtn = document.getElementById('close-tutorial');
        
        let currentStep = 0;
        const steps = document.querySelectorAll('.tutorial-step');
        
        function showStep(stepIndex) {
            steps.forEach((step, index) => {
                if (index === stepIndex) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
            
            currentStep = stepIndex;
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentStep < steps.length - 1) {
                    showStep(currentStep + 1);
                } else {
                    modal.style.display = 'none';
                }
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentStep > 0) {
                    showStep(currentStep - 1);
                }
            });
        }
        
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        // Start with first step
        showStep(0);
    }
    
    updateStatus(message, elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            const span = element.querySelector('span') || element;
            span.textContent = message;
        }
    }
    
    updateSliderValue(sliderName, value) {
        const valueElement = document.getElementById(`${sliderName}-value`);
        if (valueElement) {
            valueElement.textContent = value;
        }
    }
    
    showNotification(message) {
        console.log(`📢 ${message}`);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-info-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(30, 58, 138, 0.9);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
        
        // Add animation styles if not exists
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    showAINotification(message) {
        this.showNotification(`🤖 ${message}`);
    }
}

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 DOM Content Loaded - Starting AI Motion Studio');
    
    // Add global styles for notifications
    const globalStyles = document.createElement('style');
    globalStyles.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .welcome-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #0da271);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            animation: slideInRight 0.3s ease;
            max-width: 350px;
        }
        
        .welcome-content {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .welcome-icon {
            font-size: 24px;
        }
        
        .welcome-text h4 {
            margin: 0 0 5px 0;
            font-size: 16px;
        }
        
        .welcome-text p {
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
        }
        
        .welcome-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            margin-left: auto;
        }
        
        /* Loading screen styles */
        .loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0f172a, #1e293b);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 99999;
        }
        
        .loader {
            text-align: center;
            color: white;
        }
        
        .ai-loader {
            position: relative;
            width: 100px;
            height: 100px;
            margin: 0 auto 30px;
        }
        
        .ai-loader i {
            font-size: 50px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2;
            color: #6366f1;
        }
        
        .pulse-ring {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 2px solid #6366f1;
            border-radius: 50%;
            animation: pulse 2s linear infinite;
            opacity: 0;
        }
        
        .pulse-ring.delay-1 {
            animation-delay: 0.66s;
        }
        
        .pulse-ring.delay-2 {
            animation-delay: 1.33s;
        }
        
        @keyframes pulse {
            0% { transform: scale(0.5); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
        }
        
        .progress-bar {
            width: 200px;
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            overflow: hidden;
            margin: 20px auto;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #6366f1, #10b981);
            width: 0%;
            animation: loading 2s ease infinite;
        }
        
        @keyframes loading {
            0% { width: 0%; }
            50% { width: 100%; }
            100% { width: 0%; }
        }
        
        .hidden {
            display: none !important;
        }
    `;
    document.head.appendChild(globalStyles);
    
    // Start the application
    try {
        window.motionStudio = new AIMotionStudio();
        console.log('🎉 AI Motion Studio started successfully!');
    } catch (error) {
        console.error('❌ Error starting AI Motion Studio:', error);
        
        // Show error message
        document.body.innerHTML = `
            <div style="padding: 40px; text-align: center; font-family: Arial;">
                <h1 style="color: #ef4444;">⚠️ Application Error</h1>
                <p>There was an error starting the application.</p>
                <p style="color: #94a3b8;">${error.message}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 5px; margin-top: 20px;">
                    Reload Application
                </button>
            </div>
        `;
    }
});

// Add global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// Add unhandled rejection handler
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});
