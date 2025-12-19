// ==================== AI MOTION STUDIO ====================

class AIMotionStudio {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.background = null;
        this.material = null;
        this.motionPath = null;
        this.particles = [];
        this.isPlaying = false;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 AI Motion Studio - Professional Motion Overlay');
        
        // Create UI
        this.createPowerPointLikeUI();
        
        // Setup canvas
        this.setupCanvas();
        
        // Load AI presets
        await this.loadAIPresets();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load demo
        this.loadDemoProject();
    }
    
    createPowerPointLikeUI() {
        document.body.innerHTML = `
            <!-- PowerPoint-like Ribbon -->
            <div class="ribbon">
                <div class="ribbon-tabs">
                    <button class="tab active" data-tab="file">
                        <i class="fas fa-file"></i> File
                    </button>
                    <button class="tab" data-tab="home">
                        <i class="fas fa-home"></i> Home
                    </button>
                    <button class="tab" data-tab="draw">
                        <i class="fas fa-pen"></i> Draw
                    </button>
                    <button class="tab" data-tab="animation">
                        <i class="fas fa-play-circle"></i> Animation
                    </button>
                    <button class="tab" data-tab="ai">
                        <i class="fas fa-brain"></i> AI
                    </button>
                </div>
                
                <div class="ribbon-content">
                    <!-- File Tab -->
                    <div class="tab-content active" id="file-tab">
                        <button class="ribbon-btn" id="upload-bg">
                            <i class="fas fa-images"></i> Upload GIF/Video
                        </button>
                        <button class="ribbon-btn" id="upload-material">
                            <i class="fas fa-shapes"></i> Upload Material
                        </button>
                        <button class="ribbon-btn" id="save-project">
                            <i class="fas fa-save"></i> Save Project
                        </button>
                        <button class="ribbon-btn" id="export-gif">
                            <i class="fas fa-file-export"></i> Export GIF
                        </button>
                    </div>
                    
                    <!-- Draw Tab -->
                    <div class="tab-content" id="draw-tab">
                        <div class="tool-group">
                            <h4>Shapes</h4>
                            <button class="tool-btn" data-tool="pen">
                                <i class="fas fa-pen"></i> Pen
                            </button>
                            <button class="tool-btn" data-tool="rectangle">
                                <i class="fas fa-square"></i> Rectangle
                            </button>
                            <button class="tool-btn" data-tool="circle">
                                <i class="fas fa-circle"></i> Circle
                            </button>
                            <button class="tool-btn" data-tool="polygon">
                                <i class="fas fa-draw-polygon"></i> Polygon
                            </button>
                        </div>
                        
                        <div class="tool-group">
                            <h4>Edit</h4>
                            <button class="tool-btn" data-tool="select">
                                <i class="fas fa-mouse-pointer"></i> Select
                            </button>
                            <button class="tool-btn" data-tool="edit-points">
                                <i class="fas fa-vector-square"></i> Edit Points
                            </button>
                            <button class="tool-btn" data-tool="smooth">
                                <i class="fas fa-wave-square"></i> Smooth
                            </button>
                            <button class="tool-btn" data-tool="clear">
                                <i class="fas fa-trash"></i> Clear
                            </button>
                        </div>
                    </div>
                    
                    <!-- Animation Tab -->
                    <div class="tab-content" id="animation-tab">
                        <div class="tool-group">
                            <h4>Motion Type</h4>
                            <select id="motion-type" class="ribbon-select">
                                <option value="flow">Flow Direction</option>
                                <option value="follow">Follow Path</option>
                                <option value="swirl">Swirl Motion</option>
                                <option value="custom">Custom AI</option>
                            </select>
                        </div>
                        
                        <div class="tool-group">
                            <h4>Direction</h4>
                            <div class="direction-grid">
                                <button class="dir-btn" data-dir="nw">↖</button>
                                <button class="dir-btn" data-dir="n">↑</button>
                                <button class="dir-btn" data-dir="ne">↗</button>
                                <button class="dir-btn" data-dir="w">←</button>
                                <button class="dir-btn" data-dir="center">○</button>
                                <button class="dir-btn" data-dir="e">→</button>
                                <button class="dir-btn" data-dir="sw">↙</button>
                                <button class="dir-btn" data-dir="s">↓</button>
                                <button class="dir-btn" data-dir="se">↘</button>
                            </div>
                        </div>
                        
                        <div class="tool-group">
                            <h4>Speed & Density</h4>
                            <div class="slider-group">
                                <label>Speed: <span id="speed-value">50</span>%</label>
                                <input type="range" id="speed-slider" min="1" max="100" value="50">
                            </div>
                            <div class="slider-group">
                                <label>Density: <span id="density-value">100</span></label>
                                <input type="range" id="density-slider" min="10" max="500" value="100">
                            </div>
                        </div>
                    </div>
                    
                    <!-- AI Tab -->
                    <div class="tab-content" id="ai-tab">
                        <div class="tool-group">
                            <h4>AI Presets</h4>
                            <button class="ai-preset" data-preset="water-flow">
                                <i class="fas fa-tint"></i> Water Flow
                            </button>
                            <button class="ai-preset" data-preset="smoke">
                                <i class="fas fa-smog"></i> Smoke Effect
                            </button>
                            <button class="ai-preset" data-preset="particles">
                                <i class="fas fa-atom"></i> Particle System
                            </button>
                            <button class="ai-preset" data-preset="custom-ai">
                                <i class="fas fa-wand-magic-sparkles"></i> Smart Suggest
                            </button>
                        </div>
                        
                        <div class="tool-group">
                            <h4>AI Settings</h4>
                            <div class="ai-option">
                                <input type="checkbox" id="auto-detect" checked>
                                <label for="auto-detect">Auto-detect best motion</label>
                            </div>
                            <div class="ai-option">
                                <input type="checkbox" id="smart-smoothing" checked>
                                <label for="smart-smoothing">Smart path smoothing</label>
                            </div>
                            <div class="ai-option">
                                <input type="checkbox" id="physics-realistic" checked>
                                <label for="physics-realistic">Realistic physics</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Main Workspace -->
            <div class="workspace">
                <!-- Canvas Container -->
                <div class="canvas-container">
                    <div class="canvas-wrapper">
                        <canvas id="main-canvas"></canvas>
                        
                        <!-- Direction Arrows Overlay -->
                        <div class="direction-overlay" id="direction-overlay">
                            <!-- 8-direction arrows will be positioned here -->
                        </div>
                        
                        <!-- Edit Points Overlay -->
                        <div class="edit-points-overlay" id="edit-points-overlay">
                            <!-- Bezier control points -->
                        </div>
                    </div>
                    
                    <!-- Preview Controls -->
                    <div class="preview-controls">
                        <button id="play-preview" class="preview-btn">
                            <i class="fas fa-play"></i> Preview
                        </button>
                        <button id="stop-preview" class="preview-btn">
                            <i class="fas fa-stop"></i> Stop
                        </button>
                        <div class="time-display">
                            <span id="current-time">0:00</span> / 
                            <span id="total-time">0:00</span>
                        </div>
                    </div>
                </div>
                
                <!-- Properties Panel -->
                <div class="properties-panel">
                    <div class="panel-section">
                        <h3><i class="fas fa-layer-group"></i> Layers</h3>
                        <div class="layer-list" id="layer-list">
                            <!-- Layers will be added here -->
                        </div>
                    </div>
                    
                    <div class="panel-section">
                        <h3><i class="fas fa-sliders-h"></i> Properties</h3>
                        <div class="property-group" id="path-properties">
                            <h4>Path Properties</h4>
                            <!-- Dynamic properties based on selection -->
                        </div>
                        
                        <div class="property-group" id="motion-properties">
                            <h4>Motion Properties</h4>
                            <!-- Motion settings -->
                        </div>
                    </div>
                    
                    <div class="panel-section">
                        <h3><i class="fas fa-download"></i> Export</h3>
                        <div class="export-options">
                            <div class="export-option">
                                <input type="radio" name="export-format" id="gif-format" checked>
                                <label for="gif-format">GIF Animation</label>
                            </div>
                            <div class="export-option">
                                <input type="radio" name="export-format" id="video-format">
                                <label for="video-format">MP4 Video</label>
                            </div>
                            
                            <div class="export-quality">
                                <label>Quality:</label>
                                <select id="quality-select">
                                    <option value="low">Low (Fast)</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="high">High</option>
                                    <option value="ultra">Ultra (Best)</option>
                                </select>
                            </div>
                            
                            <button id="start-export" class="export-btn">
                                <i class="fas fa-rocket"></i> Generate & Export
                            </button>
                            
                            <div class="export-progress hidden" id="export-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" id="progress-fill"></div>
                                </div>
                                <span id="progress-text">Processing...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Status Bar -->
            <div class="status-bar">
                <div class="status-item">
                    <i class="fas fa-mouse-pointer"></i>
                    <span id="tool-status">Ready</span>
                </div>
                <div class="status-item">
                    <i class="fas fa-layer-group"></i>
                    <span id="layer-status">No layers</span>
                </div>
                <div class="status-item">
                    <i class="fas fa-bolt"></i>
                    <span id="ai-status">AI: Active</span>
                </div>
                <div class="status-item" id="export-status">
                    <i class="fas fa-check-circle"></i>
                    <span>Ready to export</span>
                </div>
            </div>
            
            <!-- Hidden File Inputs -->
            <input type="file" id="bg-file-input" accept="image/gif,video/*,image/*" hidden>
            <input type="file" id="material-file-input" accept="image/*" hidden>
            
            <!-- Hidden Canvas for Export -->
            <canvas id="export-canvas" style="display: none;"></canvas>
        `;
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight - 100;
    }
    
    async loadAIPresets() {
        // Load AI motion algorithms
        this.aiPresets = {
            'water-flow': {
                type: 'flow',
                speed: 0.5,
                turbulence: 0.3,
                particleSize: { min: 2, max: 8 },
                color: '#4a90e2',
                behavior: 'fluid'
            },
            'smoke': {
                type: 'swirl',
                speed: 0.3,
                spread: 0.8,
                particleSize: { min: 4, max: 12 },
                color: '#ffffff',
                opacity: 0.7,
                behavior: 'rising'
            },
            'particles': {
                type: 'random',
                speed: 0.7,
                particleCount: 200,
                particleSize: { min: 1, max: 5 },
                behavior: 'bounce'
            }
        };
    }
    
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.switchTab(tabId);
            });
        });
        
        // File upload
        document.getElementById('upload-bg').addEventListener('click', () => {
            document.getElementById('bg-file-input').click();
        });
        
        document.getElementById('upload-material').addEventListener('click', () => {
            document.getElementById('material-file-input').click();
        });
        
        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.target.dataset.tool;
                this.selectTool(tool);
            });
        });
        
        // Direction arrows
        document.querySelectorAll('.dir-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const direction = e.target.dataset.dir;
                this.setMotionDirection(direction);
            });
        });
        
        // AI presets
        document.querySelectorAll('.ai-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                const presetId = e.target.dataset.preset;
                this.applyAIPreset(presetId);
            });
        });
        
        // Export
        document.getElementById('start-export').addEventListener('click', () => {
            this.exportAnimation();
        });
        
        // Preview
        document.getElementById('play-preview').addEventListener('click', () => {
            this.previewAnimation();
        });
        
        // File input handlers
        document.getElementById('bg-file-input').addEventListener('change', (e) => {
            this.loadBackground(e.target.files[0]);
        });
        
        document.getElementById('material-file-input').addEventListener('change', (e) => {
            this.loadMaterialImage(e.target.files[0]);
        });
        
        // Canvas interactions
        this.setupCanvasInteractions();
    }
    
    switchTab(tabId) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected tab
        document.getElementById(`${tabId}-tab`).classList.add('active');
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        
        // Update tool status
        document.getElementById('tool-status').textContent = `Tab: ${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`;
    }
    
    selectTool(tool) {
        console.log(`Selected tool: ${tool}`);
        
        // Update UI
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Set current tool
        this.currentTool = tool;
        
        // Show direction arrows if drawing
        if (['pen', 'rectangle', 'circle', 'polygon'].includes(tool)) {
            this.showDirectionArrows();
        }
        
        // Update status
        document.getElementById('tool-status').textContent = `Tool: ${tool}`;
    }
    
    showDirectionArrows() {
        const overlay = document.getElementById('direction-overlay');
        overlay.innerHTML = '';
        
        // Create 8 direction arrows around center
        const directions = [
            { dir: 'n', angle: -90, x: 50, y: 20 },
            { dir: 'ne', angle: -45, x: 80, y: 20 },
            { dir: 'e', angle: 0, x: 80, y: 50 },
            { dir: 'se', angle: 45, x: 80, y: 80 },
            { dir: 's', angle: 90, x: 50, y: 80 },
            { dir: 'sw', angle: 135, x: 20, y: 80 },
            { dir: 'w', angle: 180, x: 20, y: 50 },
            { dir: 'nw', angle: -135, x: 20, y: 20 }
        ];
        
        directions.forEach(d => {
            const arrow = document.createElement('div');
            arrow.className = 'direction-arrow';
            arrow.dataset.dir = d.dir;
            arrow.style.left = `${d.x}%`;
            arrow.style.top = `${d.y}%`;
            arrow.innerHTML = this.getArrowSymbol(d.angle);
            arrow.addEventListener('click', (e) => {
                this.setMotionDirection(d.dir);
            });
            overlay.appendChild(arrow);
        });
        
        overlay.style.display = 'block';
    }
    
    getArrowSymbol(angle) {
        const arrows = {
            '-90': '↑',
            '-45': '↗',
            '0': '→',
            '45': '↘',
            '90': '↓',
            '135': '↙',
            '180': '←',
            '-135': '↖'
        };
        return arrows[angle] || '○';
    }
    
    setMotionDirection(direction) {
        console.log(`Motion direction: ${direction}`);
        
        // Update UI
        document.querySelectorAll('.dir-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-dir="${direction}"]`).classList.add('active');
        
        // Convert direction to vector
        const vectors = {
            'n': { x: 0, y: -1 },
            'ne': { x: 0.7, y: -0.7 },
            'e': { x: 1, y: 0 },
            'se': { x: 0.7, y: 0.7 },
            's': { x: 0, y: 1 },
            'sw': { x: -0.7, y: 0.7 },
            'w': { x: -1, y: 0 },
            'nw': { x: -0.7, y: -0.7 },
            'center': { x: 0, y: 0 }
        };
        
        this.motionDirection = vectors[direction] || { x: 1, y: 0 };
        
        // AI suggestion
        if (document.getElementById('auto-detect').checked) {
            this.suggestAIMotion();
        }
    }
    
    suggestAIMotion() {
        // AI suggests best motion parameters based on path shape
        console.log('AI suggesting optimal motion...');
        
        // Simulate AI thinking
        document.getElementById('ai-status').textContent = 'AI: Analyzing...';
        
        setTimeout(() => {
            const suggestions = [
                "Try 'Swirl' motion for circular paths",
                "Use 'Flow' with 45° angle for diagonal paths",
                "Reduce speed for more natural movement",
                "Increase particle density for better coverage"
            ];
            
            const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
            this.showAINotification(randomSuggestion);
            
            document.getElementById('ai-status').textContent = 'AI: Ready';
        }, 1000);
    }
    
    showAINotification(message) {
        // Create AI notification
        const notification = document.createElement('div');
        notification.className = 'ai-notification';
        notification.innerHTML = `
            <i class="fas fa-brain"></i>
            <span>${message}</span>
            <button class="close-notification">&times;</button>
        `;
        
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.remove();
        });
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    applyAIPreset(presetId) {
        console.log(`Applying AI preset: ${presetId}`);
        
        const preset = this.aiPresets[presetId];
        if (!preset) return;
        
        // Apply preset settings
        document.getElementById('motion-type').value = preset.type;
        document.getElementById('speed-slider').value = preset.speed * 100;
        document.getElementById('speed-value').textContent = Math.round(preset.speed * 100);
        
        // Update motion direction based on preset
        if (preset.behavior === 'fluid') {
            this.setMotionDirection('e');
        } else if (preset.behavior === 'rising') {
            this.setMotionDirection('n');
        }
        
        // Show AI effect
        this.showAIVisualEffect(presetId);
    }
    
    showAIVisualEffect(presetId) {
        // Add visual feedback for AI activation
        const canvas = this.canvas;
        const ctx = this.ctx;
        
        ctx.save();
        ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        
        // Draw AI symbol
        ctx.save();
        ctx.font = '100px "Font Awesome 5 Free"';
        ctx.fillStyle = 'rgba(99, 102, 241, 0.5)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🤖', canvas.width / 2, canvas.height / 2);
        ctx.restore();
        
        // Clear effect after 1 second
        setTimeout(() => {
            this.draw();
        }, 1000);
    }
    
    async loadBackground(file) {
        console.log('Loading background:', file.name);
        
        // Simulate loading
        document.getElementById('layer-status').textContent = 'Loading background...';
        
        // Create a mock background for demo
        this.background = {
            type: file.type.includes('gif') ? 'gif' : 'image',
            width: 800,
            height: 600,
            frames: [],
            duration: 3000 // 3 seconds
        };
        
        // Create mock frame
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, 800, 600);
        gradient.addColorStop(0, '#1e3a8a');
        gradient.addColorStop(1, '#1e40af');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);
        
        // Add text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Motion Overlay Demo', 400, 250);
        
        ctx.font = '24px Arial';
        ctx.fillText('Upload your own GIF/Video', 400, 320);
        ctx.fillText('Draw motion path → Add effects → Export', 400, 360);
        
        this.background.frames = [canvas];
        this.background.totalFrames = 30; // 30 frames for 3 seconds
        
        // Update UI
        document.getElementById('layer-status').textContent = 'Background loaded';
        this.updateLayerList();
        
        // Draw
        this.draw();
    }
    
    async loadMaterialImage(file) {
        console.log('Loading material:', file.name);
        
        // Create mock material
        this.material = {
            image: new Image(),
            width: 100,
            height: 100
        };
        
        // Create a pattern for material
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        // Draw material pattern
        ctx.fillStyle = '#10b981';
        ctx.fillRect(0, 0, 50, 50);
        ctx.fillRect(50, 50, 50, 50);
        ctx.fillStyle = '#0da271';
        ctx.fillRect(50, 0, 50, 50);
        ctx.fillRect(0, 50, 50, 50);
        
        this.material.image.src = canvas.toDataURL();
        
        // Update UI
        document.getElementById('layer-status').textContent = 'Material loaded';
        this.updateLayerList();
    }
    
    updateLayerList() {
        const layerList = document.getElementById('layer-list');
        layerList.innerHTML = '';
        
        const layers = [];
        if (this.background) {
            layers.push({
                name: 'Background',
                type: this.background.type,
                visible: true,
                locked: false
            });
        }
        
        if (this.material) {
            layers.push({
                name: 'Material',
                type: 'image',
                visible: true,
                locked: false
            });
        }
        
        if (this.motionPath) {
            layers.push({
                name: 'Motion Path',
                type: 'path',
                visible: true,
                locked: false
            });
        }
        
        layers.forEach((layer, index) => {
            const layerItem = document.createElement('div');
            layerItem.className = 'layer-item';
            layerItem.innerHTML = `
                <div class="layer-controls">
                    <input type="checkbox" class="layer-visible" ${layer.visible ? 'checked' : ''}>
                    <input type="checkbox" class="layer-locked" ${layer.locked ? 'checked' : ''}>
                </div>
                <div class="layer-info">
                    <span class="layer-name">${layer.name}</span>
                    <span class="layer-type">${layer.type}</span>
                </div>
                <div class="layer-actions">
                    <button class="layer-action"><i class="fas fa-edit"></i></button>
                    <button class="layer-action"><i class="fas fa-trash"></i></button>
                </div>
            `;
            layerList.appendChild(layerItem);
        });
    }
    
    setupCanvasInteractions() {
        let isDrawing = false;
        let points = [];
        
        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.currentTool) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (this.currentTool === 'pen') {
                isDrawing = true;
                points = [{ x, y }];
                this.startPath(x, y);
            } else if (this.currentTool === 'select') {
                this.selectObject(x, y);
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            points.push({ x, y });
            this.drawPath(points);
        });
        
        this.canvas.addEventListener('mouseup', () => {
            if (isDrawing) {
                isDrawing = false;
                this.finishPath(points);
                points = [];
            }
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            if (this.currentTool === 'pen') {
                isDrawing = true;
                points = [{ x, y }];
                this.startPath(x, y);
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!isDrawing) return;
            
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            points.push({ x, y });
            this.drawPath(points);
        });
        
        this.canvas.addEventListener('touchend', () => {
            if (isDrawing) {
                isDrawing = false;
                this.finishPath(points);
                points = [];
            }
        });
    }
    
    startPath(x, y) {
        this.motionPath = {
            points: [{ x, y }],
            type: 'freehand',
            color: '#10b981',
            width: 3
        };
        
        // Show edit points
        this.showEditPoints();
    }
    
    drawPath(points) {
        if (!this.motionPath) return;
        
        this.motionPath.points = points;
        this.draw();
    }
    
    finishPath(points) {
        if (!this.motionPath || points.length < 2) return;
        
        // AI smoothing if enabled
        if (document.getElementById('smart-smoothing').checked) {
            this.motionPath.points = this.smoothPath(points);
        }
        
        this.motionPath.completed = true;
        this.updateLayerList();
        
        // AI auto-suggest motion
        if (document.getElementById('auto-detect').checked) {
            this.autoSuggestMotionType();
        }
    }
    
    smoothPath(points) {
        // Simple bezier smoothing algorithm
        if (points.length < 3) return points;
        
        const smoothed = [];
        smoothed.push(points[0]);
        
        for (let i = 1; i < points.length - 1; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const next = points[i + 1];
            
            // Catmull-Rom smoothing
            smoothed.push({
                x: (prev.x + curr.x * 6 + next.x) / 8,
                y: (prev.y + curr.y * 6 + next.y) / 8
            });
        }
        
        smoothed.push(points[points.length - 1]);
        return smoothed;
    }
    
    autoSuggestMotionType() {
        // AI analyzes path shape and suggests motion
        const path = this.motionPath;
        if (!path || path.points.length < 3) return;
        
        // Calculate path characteristics
        const bounds = this.calculatePathBounds(path.points);
        const aspectRatio = bounds.width / bounds.height;
        
        // AI decision making
        let suggestion;
        if (aspectRatio > 2) {
            suggestion = 'flow'; // Wide path → flow motion
        } else if (aspectRatio < 0.5) {
            suggestion = 'follow'; // Tall path → follow path
        } else {
            // Check if path is circular
            const circularity = this.calculateCircularity(path.points);
            suggestion = circularity > 0.8 ? 'swirl' : 'custom';
        }
        
        // Apply suggestion
        document.getElementById('motion-type').value = suggestion;
        this.showAINotification(`AI suggests: ${suggestion} motion for this path shape`);
    }
    
    calculatePathBounds(points) {
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
    
    calculateCircularity(points) {
        // Simple circularity calculation
        const bounds = this.calculatePathBounds(points);
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;
        
        let totalDistance = 0;
        points.forEach(p => {
            const dx = p.x - centerX;
            const dy = p.y - centerY;
            totalDistance += Math.sqrt(dx * dx + dy * dy);
        });
        
        const avgDistance = totalDistance / points.length;
        
        // Check variance (lower variance = more circular)
        let variance = 0;
        points.forEach(p => {
            const dx = p.x - centerX;
            const dy = p.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            variance += Math.pow(distance - avgDistance, 2);
        });
        
        variance /= points.length;
        const circularity = 1 / (1 + variance); // 0-1, higher = more circular
        
        return Math.min(1, circularity * 3); // Scale up
    }
    
    showEditPoints() {
        const overlay = document.getElementById('edit-points-overlay');
        overlay.innerHTML = '';
        
        if (!this.motionPath || !this.motionPath.points) return;
        
        this.motionPath.points.forEach((point, index) => {
            const editPoint = document.createElement('div');
            editPoint.className = 'edit-point';
            editPoint.style.left = `${point.x}px`;
            editPoint.style.top = `${point.y}px`;
            editPoint.dataset.index = index;
            
            // Make draggable
            this.makeDraggable(editPoint, index);
            
            overlay.appendChild(editPoint);
        });
        
        overlay.style.display = 'block';
    }
    
    makeDraggable(element, pointIndex) {
        let isDragging = false;
        let startX, startY;
        
        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX - element.offsetLeft;
            startY = e.clientY - element.offsetTop;
            e.preventDefault();
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
            isDragging = false;
        });
    }
    
    selectObject(x, y) {
        // Simple selection logic
        if (this.motionPath && this.motionPath.points) {
            // Check if click is near any point
            const threshold = 10;
            let selectedPoint = null;
            
            this.motionPath.points.forEach((point, index) => {
                const dx = point.x - x;
                const dy = point.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < threshold) {
                    selectedPoint = index;
                }
            });
            
            if (selectedPoint !== null) {
                this.showEditPoints();
                this.highlightPoint(selectedPoint);
            }
        }
    }
    
    highlightPoint(index) {
        const points = document.querySelectorAll('.edit-point');
        points.forEach((p, i) => {
            p.classList.toggle('highlighted', i === index);
        });
    }
    
    draw() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        if (this.background && this.background.frames && this.background.frames[0]) {
            const bg = this.background.frames[0];
            const scale = Math.min(
                this.canvas.width / bg.width,
                this.canvas.height / bg.height
            );
            
            const x = (this.canvas.width - bg.width * scale) / 2;
            const y = (this.canvas.height - bg.height * scale) / 2;
            
            this.ctx.drawImage(bg, x, y, bg.width * scale, bg.height * scale);
        }
        
        // Draw motion path
        if (this.motionPath && this.motionPath.points.length > 1) {
            this.ctx.save();
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
            this.ctx.restore();
        }
        
        // Draw material particles if previewing
        if (this.isPlaying && this.material && this.motionPath) {
            this.drawParticles();
        }
    }
    
    drawParticles() {
        if (!this.particles || this.particles.length === 0) {
            this.createParticles();
        }
        
        // Update and draw particles
        this.particles.forEach(particle => {
            // Update position based on motion type
            const motionType = document.getElementById('motion-type').value;
            
            switch (motionType) {
                case 'flow':
                    particle.x += this.motionDirection.x * particle.speed;
                    particle.y += this.motionDirection.y * particle.speed;
                    break;
                    
                case 'follow':
                    // Follow the path
                    const progress = (particle.age / particle.lifetime) % 1;
                    const pathIndex = Math.floor(progress * (this.motionPath.points.length - 1));
                    const nextIndex = Math.min(pathIndex + 1, this.motionPath.points.length - 1);
                    
                    const p1 = this.motionPath.points[pathIndex];
                    const p2 = this.motionPath.points[nextIndex];
                    const segmentProgress = (progress * (this.motionPath.points.length - 1)) % 1;
                    
                    particle.x = p1.x + (p2.x - p1.x) * segmentProgress;
                    particle.y = p1.y + (p2.y - p1.y) * segmentProgress;
                    break;
                    
                case 'swirl':
                    // Swirl motion
                    const centerX = this.canvas.width / 2;
                    const centerY = this.canvas.height / 2;
                    const angle = particle.age * 0.05;
                    const radius = 100 + Math.sin(particle.age * 0.02) * 50;
                    
                    particle.x = centerX + Math.cos(angle) * radius;
                    particle.y = centerY + Math.sin(angle) * radius;
                    break;
                    
                default:
                    // Random motion
                    particle.x += (Math.random() - 0.5) * particle.speed;
                    particle.y += (Math.random() - 0.5) * particle.speed;
            }
            
            particle.age++;
            
            // Draw particle
            this.ctx.save();
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.opacity;
            
            if (this.material && this.material.image.complete) {
                // Draw material image as particle
                this.ctx.drawImage(
                    this.material.image,
                    particle.x - particle.size / 2,
                    particle.y - particle.size / 2,
                    particle.size,
                    particle.size
                );
            } else {
                // Draw circle particle
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.restore();
            
            // Reset particle if out of bounds or too old
            if (particle.age > particle.lifetime ||
                particle.x < 0 || particle.x > this.canvas.width ||
                particle.y < 0 || particle.y > this.canvas.height) {
                this.resetParticle(particle);
            }
        });
    }
    
    createParticles() {
        const density = parseInt(document.getElementById('density-slider').value);
        this.particles = [];
        
        for (let i = 0; i < density; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 5 + Math.random() * 15,
                speed: 0.5 + Math.random() * 2,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                opacity: 0.7 + Math.random() * 0.3,
                age: Math.random() * 100,
                lifetime: 200 + Math.random() * 300
            });
        }
    }
    
    resetParticle(particle) {
        particle.x = Math.random() * this.canvas.width;
        particle.y = Math.random() * this.canvas.height;
        particle.age = 0;
    }
    
    previewAnimation() {
        if (this.isPlaying) {
            this.isPlaying = false;
            document.getElementById('play-preview').innerHTML = '<i class="fas fa-play"></i> Preview';
        } else {
            this.isPlaying = true;
            document.getElementById('play-preview').innerHTML = '<i class="fas fa-pause"></i> Pause';
            this.animate();
        }
    }
    
    animate() {
        if (!this.isPlaying) return;
        
        this.draw();
        requestAnimationFrame(() => this.animate());
        
        // Update time display
        const totalTime = this.background ? this.background.duration / 1000 : 0;
        const currentTime = (performance.now() % (totalTime * 1000)) / 1000;
        
        document.getElementById('current-time').textContent = 
            this.formatTime(currentTime);
        document.getElementById('total-time').textContent = 
            this.formatTime(totalTime);
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    async exportAnimation() {
        console.log('Starting export...');
        
        // Show progress
        const progressBar = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const exportProgress = document.getElementById('export-progress');
        
        exportProgress.classList.remove('hidden');
        progressBar.style.width = '0%';
        progressText.textContent = 'Preparing export...';
        
        // Simulate export process
        const steps = [
            'Rendering frames...',
            'Applying motion effects...',
            'Optimizing GIF...',
            'Finalizing export...'
        ];
        
        for (let i = 0; i < steps.length; i++) {
            progressText.textContent = steps[i];
            progressBar.style.width = `${(i + 1) * 25}%`;
            
            // Simulate processing time
            await this.sleep(500);
        }
        
        // Final step
        progressText.textContent = 'Export complete!';
        progressBar.style.width = '100%';
        
        // Create download link
        this.createDownload();
        
        // Hide progress after 3 seconds
        setTimeout(() => {
            exportProgress.classList.add('hidden');
        }, 3000);
    }
    
    createDownload() {
        // Create a simple GIF (in real app, this would use gif.js)
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        
        // Draw demo export
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(0, 0, 400, 300);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Motion Overlay Export', 200, 120);
        
        ctx.font = '16px Arial';
        ctx.fillText('Your animated GIF is ready!', 200, 160);
        ctx.fillText('In full version, this would be your actual animation', 200, 190);
        
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
        }, 'image/gif');
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    loadDemoProject() {
        console.log('Loading demo project...');
        
        // Create demo layers after a delay
        setTimeout(() => {
            this.showAINotification('Welcome to AI Motion Studio! Try drawing a path and adding effects.');
            
            // Update status
            document.getElementById('tool-status').textContent = 'Ready - Select a tool to start';
            document.getElementById('layer-status').textContent = 'No layers - Upload files to begin';
            document.getElementById('ai-status').textContent = 'AI: Active - Try AI presets';
            document.getElementById('export-status').innerHTML = 
                '<i class="fas fa-check-circle"></i><span>Ready to export</span>';
                
            // Set default direction
            this.setMotionDirection('e');
        }, 1000);
    }
}

// Initialize app when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.motionStudio = new AIMotionStudio();
});
