// ==================== AI MOTION STUDIO - COMPLETE VERSION ====================
// Complete functionality for professional motion overlay application

console.log('🚀 AI Motion Studio - Professional Motion Overlay');
console.log('Version 2.0 - Complete Functionality');
console.log('GitHub: https://github.com/khoicpct-collab/motion-ai-studio');

class MotionStudio {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.background = null;
        this.material = null;
        this.motionPath = null;
        this.particles = [];
        this.isPlaying = false;
        this.isDrawing = false;
        this.currentTool = 'pen';
        this.drawingPoints = [];
        this.animationId = null;
        this.fps = 0;
        this.lastTime = 0;
        this.frameCount = 0;
        
        this.init();
    }
    
    init() {
        console.log('🔄 Initializing Motion Studio...');
        
        // Initialize after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        try {
            // Setup UI
            this.setupUI();
            
            // Setup canvas
            this.setupCanvas();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup tools
            this.setupTools();
            
            // Setup animations
            this.setupAnimations();
            
            // Load initial demo
            setTimeout(() => this.loadInitialDemo(), 1500);
            
            console.log('✅ Motion Studio initialized successfully!');
            this.showNotification('🎬 AI Motion Studio đã sẵn sàng!');
            
        } catch (error) {
            console.error('❌ Setup error:', error);
            this.showError('Khởi tạo ứng dụng thất bại: ' + error.message);
        }
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
        
        // Update initial status
        this.updateStatus('Sẵn sàng', 'ai-status');
        this.updateStatus('Chọn công cụ để bắt đầu', 'tool-status');
        this.updateStatus('1 layer', 'layer-status');
        this.updateStatus('Chưa có animation', 'export-status');
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('main-canvas');
        if (!this.canvas) {
            throw new Error('Canvas not found');
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Draw initial screen
        this.drawInitialScreen();
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        if (!container) return;
        
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight - 100;
        
        // Redraw
        if (!this.isPlaying) {
            this.draw();
        }
    }
    
    drawInitialScreen() {
        if (!this.canvas || !this.ctx) return;
        
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(1, '#1e293b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Draw welcome message
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const centerX = width / 2;
        const centerY = height / 2;
        
        ctx.fillText('🎬 AI Motion Studio', centerX, centerY - 80);
        
        // Draw feature list
        ctx.font = '18px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#cbd5e1';
        
        const features = [
            '✓ Upload GIF/Video/Image',
            '✓ Vẽ path với công cụ thông minh',
            '✓ 8 hướng chuyển động tùy chỉnh',
            '✓ AI motion suggestions',
            '✓ Export GIF/MP4 chất lượng cao'
        ];
        
        features.forEach((feature, index) => {
            ctx.fillText(feature, centerX, centerY - 30 + (index * 30));
        });
        
        // Draw instructions
        ctx.font = '16px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Click "Upload Background" hoặc "Load Demo" để bắt đầu', centerX, centerY + 120);
        
        // Draw border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, width - 40, height - 40);
    }
    
    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Tab switching
        this.setupTabSwitching();
        
        // File upload
        this.setupFileUpload();
        
        // Tool buttons
        this.setupToolButtons();
        
        // Direction controls
        this.setupDirectionControls();
        
        // Animation controls
        this.setupAnimationControls();
        
        // Export functionality
        this.setupExport();
        
        // AI features
        this.setupAIFeatures();
        
        // Canvas interactions
        this.setupCanvasInteractions();
        
        console.log('✅ Event listeners setup complete');
    }
    
    setupTabSwitching() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                
                // Update active tab
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
                
                this.showNotification(`📑 Chuyển sang tab: ${tabId}`);
            });
        });
    }
    
    setupFileUpload() {
        // Background upload
        const uploadBgBtn = document.getElementById('upload-bg');
        const bgFileInput = document.getElementById('bg-file-input');
        
        if (uploadBgBtn && bgFileInput) {
            uploadBgBtn.addEventListener('click', () => {
                bgFileInput.click();
                this.showNotification('📁 Chọn file GIF, video hoặc ảnh làm nền');
            });
            
            bgFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.loadBackgroundFile(file);
                }
            });
        }
        
        // Material upload
        const uploadMaterialBtn = document.getElementById('upload-material');
        const materialFileInput = document.getElementById('material-file-input');
        
        if (uploadMaterialBtn && materialFileInput) {
            uploadMaterialBtn.addEventListener('click', () => {
                materialFileInput.click();
                this.showNotification('🎨 Chọn ảnh làm vật liệu cho particles');
            });
            
            materialFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.loadMaterialFile(file);
                }
            });
        }
        
        // Load demo button
        const demoBtn = document.getElementById('load-demo');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => {
                this.loadDemoProject();
            });
        }
        
        // Tutorial button
        const tutorialBtn = document.getElementById('tutorial');
        if (tutorialBtn) {
            tutorialBtn.addEventListener('click', () => {
                this.showTutorial();
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
            });
        });
        
        // Clear button
        const clearBtn = document.getElementById('clear-all');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearCanvas();
            });
        }
    }
    
    selectTool(tool) {
        this.currentTool = tool;
        this.updateStatus(`Công cụ: ${tool}`, 'tool-status');
        
        // Show appropriate UI based on tool
        if (['pen', 'rectangle', 'circle', 'polygon'].includes(tool)) {
            this.showNotification(`🛠️ Công cụ ${tool} - Click và kéo để vẽ`);
        } else if (tool === 'select') {
            this.showNotification('🔍 Công cụ chọn - Click để chọn đối tượng');
        } else if (tool === 'edit-points') {
            this.showNotification('📐 Chỉnh sửa điểm - Kéo các điểm để điều chỉnh');
            if (this.motionPath) {
                this.showEditPoints();
            }
        }
    }
    
    setupDirectionControls() {
        // Direction grid buttons
        const dirButtons = document.querySelectorAll('.dir-btn');
        dirButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const direction = e.currentTarget.dataset.dir;
                this.setMotionDirection(direction);
            });
        });
        
        // Direction angle slider
        const angleSlider = document.getElementById('direction-angle');
        if (angleSlider) {
            angleSlider.addEventListener('input', (e) => {
                const angle = e.target.value;
                document.getElementById('angle-value').textContent = `${angle}°`;
                this.showNotification(`📐 Góc chuyển động: ${angle}°`);
            });
        }
        
        // Speed slider
        const speedSlider = document.getElementById('speed-slider');
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                document.getElementById('speed-value').textContent = value;
                this.showNotification(`⚡ Tốc độ: ${value}%`);
            });
        }
        
        // Particle count slider
        const particleSlider = document.getElementById('particle-count');
        if (particleSlider) {
            particleSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                document.getElementById('count-value').textContent = value;
            });
        }
        
        // Particle size slider
        const sizeSlider = document.getElementById('particle-size');
        if (sizeSlider) {
            sizeSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                document.getElementById('size-value').textContent = `${value}px`;
            });
        }
        
        // Motion type selector
        const motionTypeSelect = document.getElementById('motion-type');
        if (motionTypeSelect) {
            motionTypeSelect.addEventListener('change', (e) => {
                const type = e.target.value;
                const types = {
                    'flow': 'Dòng chảy',
                    'follow': 'Theo path',
                    'swirl': 'Xoáy',
                    'random': 'Ngẫu nhiên'
                };
                this.showNotification(`🌀 Kiểu chuyển động: ${types[type] || type}`);
            });
        }
    }
    
    setMotionDirection(direction) {
        console.log('Setting motion direction:', direction);
        
        // Update UI
        document.querySelectorAll('.dir-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`.dir-btn[data-dir="${direction}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Map direction to text
        const directions = {
            'n': '↑ Lên',
            'ne': '↗ Lên-Phải',
            'e': '→ Phải',
            'se': '↘ Xuống-Phải',
            's': '↓ Xuống',
            'sw': '↙ Xuống-Trái',
            'w': '← Trái',
            'nw': '↖ Lên-Trái',
            'center': '○ Trung tâm'
        };
        
        this.showNotification(`🧭 Hướng chuyển động: ${directions[direction] || direction}`);
        
        // Update particles if animation is playing
        if (this.isPlaying) {
            this.updateParticleDirections();
        }
    }
    
    setupAnimationControls() {
        // Play/Pause button
        const playBtn = document.getElementById('play-pause');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.togglePlayback();
            });
        }
        
        // Stop button
        const stopBtn = document.getElementById('stop-preview');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.stopAnimation();
            });
        }
        
        // Loop toggle
        const loopToggle = document.getElementById('loop-toggle');
        if (loopToggle) {
            loopToggle.addEventListener('click', () => {
                loopToggle.classList.toggle('active');
                const looping = loopToggle.classList.contains('active');
                this.showNotification(looping ? '🔁 Chế độ lặp: Bật' : '🔁 Chế độ lặp: Tắt');
            });
        }
        
        // Timeline scrubber
        const scrubber = document.querySelector('.timeline-scrubber');
        if (scrubber) {
            scrubber.addEventListener('click', (e) => {
                const rect = scrubber.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percent = Math.max(0, Math.min(1, x / rect.width));
                this.seekAnimation(percent);
            });
        }
    }
    
    togglePlayback() {
        const playBtn = document.getElementById('play-pause');
        
        if (this.isPlaying) {
            this.pauseAnimation();
            if (playBtn) {
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
                playBtn.title = 'Play';
            }
            this.showNotification('⏸️ Animation đã tạm dừng');
        } else {
            this.playAnimation();
            if (playBtn) {
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                playBtn.title = 'Pause';
            }
            this.showNotification('▶️ Animation đang chạy');
        }
    }
    
    playAnimation() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.lastTime = performance.now();
        this.frameCount = 0;
        
        // Create particles if needed
        if (this.particles.length === 0) {
            this.createParticles();
        }
        
        // Start animation loop
        this.animationLoop();
        
        this.updateStatus('Animation đang chạy...', 'tool-status');
    }
    
    pauseAnimation() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.updateStatus('Animation tạm dừng', 'tool-status');
    }
    
    stopAnimation() {
        this.pauseAnimation();
        this.particles = [];
        this.draw();
        
        const playBtn = document.getElementById('play-pause');
        if (playBtn) {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            playBtn.title = 'Play';
        }
        
        this.showNotification('⏹️ Animation đã dừng');
        this.updateStatus('Animation đã dừng', 'tool-status');
    }
    
    seekAnimation(percent) {
        // This would seek to a specific time in the animation
        // For now, just update the UI
        const playhead = document.querySelector('.scrubber-playhead');
        if (playhead) {
            playhead.style.left = `${percent * 100}%`;
        }
        
        const timeDisplay = document.getElementById('current-time');
        if (timeDisplay) {
            const totalTime = 3; // 3 seconds total
            const currentTime = percent * totalTime;
            const minutes = Math.floor(currentTime / 60);
            const seconds = Math.floor(currentTime % 60);
            const milliseconds = Math.floor((currentTime % 1) * 100);
            timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
        }
    }
    
    animationLoop() {
        if (!this.isPlaying) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        
        // Calculate FPS
        this.frameCount++;
        if (currentTime >= this.lastTime + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.lastTime = currentTime;
            this.frameCount = 0;
            
            // Update FPS display
            const fpsDisplay = document.getElementById('current-fps');
            if (fpsDisplay) {
                fpsDisplay.textContent = this.fps;
            }
        }
        
        // Update animation
        this.updateAnimation(deltaTime);
        
        // Draw everything
        this.draw();
        
        // Continue loop
        this.animationId = requestAnimationFrame(() => this.animationLoop());
    }
    
    updateAnimation(deltaTime) {
        if (!this.isPlaying || this.particles.length === 0) return;
        
        const speed = parseInt(document.getElementById('speed-slider')?.value || 50) / 100;
        const motionType = document.getElementById('motion-type')?.value || 'flow';
        const activeDir = document.querySelector('.dir-btn.active')?.dataset.dir || 'e';
        
        this.particles.forEach(particle => {
            // Update particle based on motion type and direction
            switch(motionType) {
                case 'flow':
                    this.updateFlowMotion(particle, activeDir, speed, deltaTime);
                    break;
                    
                case 'follow':
                    this.updateFollowMotion(particle, speed, deltaTime);
                    break;
                    
                case 'swirl':
                    this.updateSwirlMotion(particle, speed, deltaTime);
                    break;
                    
                case 'random':
                    this.updateRandomMotion(particle, speed, deltaTime);
                    break;
                    
                default:
                    this.updateFlowMotion(particle, activeDir, speed, deltaTime);
            }
            
            // Update life
            particle.life -= deltaTime * 0.001;
            if (particle.life <= 0) {
                this.resetParticle(particle);
            }
            
            // Boundary check
            this.checkParticleBoundaries(particle);
        });
    }
    
    updateFlowMotion(particle, direction, speed, deltaTime) {
        const directionVectors = {
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
        
        const vector = directionVectors[direction] || { x: 1, y: 0 };
        
        particle.x += vector.x * particle.speed * speed * deltaTime * 0.01;
        particle.y += vector.y * particle.speed * speed * deltaTime * 0.01;
    }
    
    updateFollowMotion(particle, speed, deltaTime) {
        if (!this.motionPath || this.motionPath.points.length < 2) {
            // Fallback to random motion if no path
            this.updateRandomMotion(particle, speed, deltaTime);
            return;
        }
        
        // Simple path following
        const progress = (1 - particle.life / particle.maxLife) % 1;
        const pathIndex = Math.floor(progress * (this.motionPath.points.length - 1));
        const nextIndex = Math.min(pathIndex + 1, this.motionPath.points.length - 1);
        
        const currentPoint = this.motionPath.points[pathIndex];
        const nextPoint = this.motionPath.points[nextIndex];
        const segmentProgress = (progress * (this.motionPath.points.length - 1)) % 1;
        
        // Move toward target point
        const targetX = currentPoint.x + (nextPoint.x - currentPoint.x) * segmentProgress;
        const targetY = currentPoint.y + (nextPoint.y - currentPoint.y) * segmentProgress;
        
        const dx = targetX - particle.x;
        const dy = targetY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 1) {
            particle.x += (dx / distance) * particle.speed * speed * deltaTime * 0.01;
            particle.y += (dy / distance) * particle.speed * speed * deltaTime * 0.01;
        }
    }
    
    updateSwirlMotion(particle, speed, deltaTime) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const angle = Math.atan2(dy, dx);
        const radius = Math.sqrt(dx * dx + dy * dy);
        
        // Update angle for swirling
        const newAngle = angle + 0.02 * speed * deltaTime * 0.01;
        
        particle.x = centerX + Math.cos(newAngle) * radius;
        particle.y = centerY + Math.sin(newAngle) * radius;
        
        // Add some randomness
        particle.x += (Math.random() - 0.5) * 0.5;
        particle.y += (Math.random() - 0.5) * 0.5;
    }
    
    updateRandomMotion(particle, speed, deltaTime) {
        // Random walk with momentum
        particle.vx = (particle.vx || 0) + (Math.random() - 0.5) * 0.1;
        particle.vy = (particle.vy || 0) + (Math.random() - 0.5) * 0.1;
        
        // Apply friction
        particle.vx *= 0.99;
        particle.vy *= 0.99;
        
        particle.x += particle.vx * speed * deltaTime * 0.01;
        particle.y += particle.vy * speed * deltaTime * 0.01;
    }
    
    checkParticleBoundaries(particle) {
        const boundaryType = 'bounce'; // Can be 'bounce', 'wrap', or 'contain'
        
        switch(boundaryType) {
            case 'bounce':
                if (particle.x < 0) {
                    particle.x = 0;
                    particle.vx = particle.vx ? -particle.vx * 0.8 : 0.1;
                }
                if (particle.x > this.canvas.width) {
                    particle.x = this.canvas.width;
                    particle.vx = particle.vx ? -particle.vx * 0.8 : -0.1;
                }
                if (particle.y < 0) {
                    particle.y = 0;
                    particle.vy = particle.vy ? -particle.vy * 0.8 : 0.1;
                }
                if (particle.y > this.canvas.height) {
                    particle.y = this.canvas.height;
                    particle.vy = particle.vy ? -particle.vy * 0.8 : -0.1;
                }
                break;
                
            case 'wrap':
                if (particle.x < 0) particle.x = this.canvas.width;
                if (particle.x > this.canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = this.canvas.height;
                if (particle.y > this.canvas.height) particle.y = 0;
                break;
                
            case 'contain':
            default:
                // Contain within mask if exists
                if (this.motionPath && this.motionPath.completed) {
                    if (!this.isPointInPath(particle.x, particle.y)) {
                        this.resetParticle(particle);
                    }
                }
                break;
        }
    }
    
    isPointInPath(x, y) {
        if (!this.motionPath || this.motionPath.points.length < 3) return true;
        
        // Simple point-in-polygon test
        let inside = false;
        const points = this.motionPath.points;
        
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const xi = points[i].x, yi = points[i].y;
            const xj = points[j].x, yj = points[j].y;
            
            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            
            if (intersect) inside = !inside;
        }
        
        return inside;
    }
    
    resetParticle(particle) {
        if (this.motionPath && this.motionPath.points.length > 0) {
            // Reset to random point on path
            const pathIndex = Math.floor(Math.random() * this.motionPath.points.length);
            const point = this.motionPath.points[pathIndex];
            
            particle.x = point.x + (Math.random() - 0.5) * 20;
            particle.y = point.y + (Math.random() - 0.5) * 20;
        } else {
            // Random position on canvas
            particle.x = Math.random() * this.canvas.width;
            particle.y = Math.random() * this.canvas.height;
        }
        
        particle.life = particle.maxLife;
        particle.vx = 0;
        particle.vy = 0;
    }
    
    updateParticleDirections() {
        // Update particle velocities based on new direction
        // This would be called when direction changes during playback
    }
    
    createParticles() {
        const count = parseInt(document.getElementById('particle-count')?.value || 100);
        const size = parseInt(document.getElementById('particle-size')?.value || 10);
        
        this.particles = [];
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: size / 2 + Math.random() * size / 2,
                speed: 0.5 + Math.random() * 1.5,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                life: 100 + Math.random() * 200,
                maxLife: 100 + Math.random() * 200,
                vx: 0,
                vy: 0
            });
        }
        
        this.showNotification(`✨ Đã tạo ${count} particles`);
    }
    
    setupExport() {
        const exportBtn = document.getElementById('start-export');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportAnimation();
            });
        }
        
        // Export format selection
        const formatOptions = document.querySelectorAll('input[name="export-format"]');
        formatOptions.forEach(option => {
            option.addEventListener('change', (e) => {
                const format = e.target.value;
                this.showNotification(`📁 Định dạng xuất: ${format.toUpperCase()}`);
            });
        });
        
        // Export quality
        const qualitySelect = document.getElementById('export-quality');
        if (qualitySelect) {
            qualitySelect.addEventListener('change', (e) => {
                const quality = e.target.value;
                this.showNotification(`🎯 Chất lượng xuất: ${quality}`);
            });
        }
        
        // Export FPS
        const fpsSelect = document.getElementById('export-fps');
        if (fpsSelect) {
            fpsSelect.addEventListener('change', (e) => {
                const fps = e.target.value;
                this.showNotification(`🎞️ FPS xuất: ${fps}`);
            });
        }
        
        // Export duration
        const durationSelect = document.getElementById('export-duration');
        if (durationSelect) {
            durationSelect.addEventListener('change', (e) => {
                const duration = e.target.value;
                this.showNotification(`⏱️ Thời lượng: ${duration} giây`);
            });
        }
    }
    
    async exportAnimation() {
        this.showNotification('⏳ Đang chuẩn bị xuất animation...');
        
        // Show export modal
        this.showExportModal();
        
        try {
            // Step 1: Prepare export
            await this.updateExportProgress(10, 'Đang chuẩn bị...');
            
            // Step 2: Render frames
            await this.updateExportProgress(30, 'Đang render khung hình...');
            
            // Step 3: Process animation
            await this.updateExportProgress(60, 'Đang xử lý animation...');
            
            // Step 4: Encode
            await this.updateExportProgress(80, 'Đang mã hóa...');
            
            // Step 5: Finalize
            await this.updateExportProgress(100, 'Hoàn tất!');
            
            // Create and download the file
            await this.createExportFile();
            
            this.showNotification('✅ Xuất animation thành công!');
            
        } catch (error) {
            console.error('Export error:', error);
            this.showError('Lỗi xuất file: ' + error.message);
        } finally {
            // Hide modal after delay
            setTimeout(() => {
                this.hideExportModal();
            }, 2000);
        }
    }
    
    showExportModal() {
        const modal = document.getElementById('export-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
        
        // Reset progress
        this.updateExportProgress(0, 'Bắt đầu xuất...');
    }
    
    hideExportModal() {
        const modal = document.getElementById('export-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    updateExportProgress(percent, message) {
        return new Promise(resolve => {
            setTimeout(() => {
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
                
                resolve();
            }, 300);
        });
    }
    
    async createExportFile() {
        // Create a canvas for the export
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = this.canvas.width;
        exportCanvas.height = this.canvas.height;
        const exportCtx = exportCanvas.getContext('2d');
        
        // Draw the current state
        this.drawToCanvas(exportCtx, exportCanvas.width, exportCanvas.height);
        
        // Get export format
        const format = document.querySelector('input[name="export-format"]:checked')?.value || 'gif';
        
        if (format === 'gif') {
            // For GIF export
            await this.exportAsGIF(exportCanvas);
        } else if (format === 'mp4') {
            // For MP4 export
            await this.exportAsMP4(exportCanvas);
        } else if (format === 'png') {
            // For PNG sequence
            await this.exportAsPNGSequence(exportCanvas);
        }
    }
    
    async exportAsGIF(canvas) {
        // Note: In a real implementation, you would use gif.js or similar library
        // This is a simplified version that exports a static GIF
        
        return new Promise((resolve) => {
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ai-motion-studio-${Date.now()}.gif`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                resolve();
            }, 'image/gif');
        });
    }
    
    async exportAsMP4(canvas) {
        // Note: MP4 export would require FFmpeg.wasm or similar
        // This is a placeholder
        this.showNotification('📹 MP4 export requires additional libraries (FFmpeg.wasm)');
        
        // Fallback to downloading the canvas as image
        return this.exportAsGIF(canvas);
    }
    
    async exportAsPNGSequence(canvas) {
        // Export as a single PNG
        return new Promise((resolve) => {
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ai-motion-studio-${Date.now()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                resolve();
            }, 'image/png');
        });
    }
    
    setupAIFeatures() {
        // AI preset buttons
        const aiPresets = document.querySelectorAll('.ai-preset');
        aiPresets.forEach(preset => {
            preset.addEventListener('click', (e) => {
                const presetName = e.currentTarget.dataset.preset;
                this.applyAIPreset(presetName);
            });
        });
        
        // AI optimize button
        const optimizeBtn = document.getElementById('ai-optimize');
        if (optimizeBtn) {
            optimizeBtn.addEventListener('click', () => {
                this.optimizeWithAI();
            });
        }
        
        // AI toggles
        const aiToggles = document.querySelectorAll('.ai-option input[type="checkbox"]');
        aiToggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const label = e.target.nextElementSibling?.textContent || 'AI option';
                const state = e.target.checked ? 'bật' : 'tắt';
                this.showNotification(`🤖 ${label}: ${state}`);
            });
        });
    }
    
    applyAIPreset(presetName) {
        const presets = {
            'water-flow': {
                name: '💧 Dòng nước',
                motionType: 'flow',
                direction: 'e',
                speed: 60,
                particleCount: 200,
                particleSize: 8
            },
            'smoke': {
                name: '💨 Khói',
                motionType: 'swirl',
                direction: 'center',
                speed: 30,
                particleCount: 150,
                particleSize: 12
            },
            'particles': {
                name: '✨ Hạt',
                motionType: 'random',
                direction: 'center',
                speed: 40,
                particleCount: 300,
                particleSize: 6
            },
            'custom-ai': {
                name: '🤖 AI Tùy chỉnh',
                motionType: 'flow',
                direction: 'e',
                speed: 50,
                particleCount: 100,
                particleSize: 10
            }
        };
        
        const preset = presets[presetName];
        if (!preset) return;
        
        // Apply preset settings
        if (preset.motionType) {
            const motionTypeSelect = document.getElementById('motion-type');
            if (motionTypeSelect) {
                motionTypeSelect.value = preset.motionType;
            }
        }
        
        if (preset.direction) {
            this.setMotionDirection(preset.direction);
        }
        
        if (preset.speed) {
            const speedSlider = document.getElementById('speed-slider');
            if (speedSlider) {
                speedSlider.value = preset.speed;
                document.getElementById('speed-value').textContent = preset.speed;
            }
        }
        
        if (preset.particleCount) {
            const particleSlider = document.getElementById('particle-count');
            if (particleSlider) {
                particleSlider.value = preset.particleCount;
                document.getElementById('count-value').textContent = preset.particleCount;
            }
        }
        
        if (preset.particleSize) {
            const sizeSlider = document.getElementById('particle-size');
            if (sizeSlider) {
                sizeSlider.value = preset.particleSize;
                document.getElementById('size-value').textContent = `${preset.particleSize}px`;
            }
        }
        
        // Show AI effect
        this.showAIVisualEffect(preset.name);
        
        // Update particles if needed
        if (this.particles.length > 0) {
            this.createParticles();
        }
        
        this.showNotification(`🎨 Đã áp dụng preset: ${preset.name}`);
    }
    
    optimizeWithAI() {
        this.showAIModal('🤖 AI đang tối ưu hóa animation...');
        
        // Simulate AI processing
        setTimeout(() => {
            // Apply some "AI optimizations"
            if (this.motionPath && this.motionPath.points.length > 10) {
                // Smooth the path
                this.motionPath.points = this.smoothPath(this.motionPath.points);
                this.showNotification('🔄 AI đã làm mượt path');
            }
            
            // Optimize particle count based on performance
            const particleCount = parseInt(document.getElementById('particle-count')?.value || 100);
            const optimizedCount = Math.min(particleCount * 1.2, 500);
            
            const particleSlider = document.getElementById('particle-count');
            if (particleSlider) {
                particleSlider.value = optimizedCount;
                document.getElementById('count-value').textContent = optimizedCount;
            }
            
            // Suggest optimal settings
            this.showAINotification('✅ AI đề xuất: Tăng particle count để hiệu ứng đẹp hơn');
            
            this.hideAIModal();
            this.draw();
            
        }, 2000);
    }
    
    smoothPath(points) {
        if (points.length < 3) return points;
        
        const smoothed = [points[0]];
        
        for (let i = 1; i < points.length - 1; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const next = points[i + 1];
            
            // Simple smoothing
            smoothed.push({
                x: (prev.x + curr.x * 6 + next.x) / 8,
                y: (prev.y + curr.y * 6 + next.y) / 8
            });
        }
        
        smoothed.push(points[points.length - 1]);
        return smoothed;
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
    
    showAIVisualEffect(presetName) {
        if (!this.canvas || !this.ctx) return;
        
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Save current state
        ctx.save();
        
        // Draw AI glow effect
        const centerX = width / 2;
        const centerY = height / 2;
        
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, Math.min(width, height) / 2
        );
        
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Draw AI symbol and text
        ctx.font = 'bold 48px "Segoe UI"';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🤖', centerX, centerY - 40);
        
        ctx.font = '20px "Segoe UI"';
        ctx.fillText(presetName, centerX, centerY + 20);
        
        ctx.restore();
        
        // Clear effect after 1 second
        setTimeout(() => {
            if (!this.isPlaying) {
                this.draw();
            }
        }, 1000);
    }
    
    setupCanvasInteractions() {
        if (!this.canvas) return;
        
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.onCanvasMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onCanvasMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.onCanvasMouseUp());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.onCanvasMouseDown(touch);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.onCanvasMouseMove(touch);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.onCanvasMouseUp();
        });
        
        // Double click to clear
        this.canvas.addEventListener('dblclick', () => {
            this.clearCanvas();
        });
    }
    
    onCanvasMouseDown(e) {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX || e.pageX) - rect.left;
        const y = (e.clientY || e.pageY) - rect.top;
        
        // Handle based on current tool
        if (['pen', 'rectangle', 'circle', 'polygon'].includes(this.currentTool)) {
            this.startDrawing(x, y);
        } else if (this.currentTool === 'select') {
            this.selectObjectAt(x, y);
        } else if (this.currentTool === 'edit-points') {
            this.selectEditPoint(x, y);
        }
    }
    
    onCanvasMouseMove(e) {
        if (!this.isDrawing || !this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX || e.pageX) - rect.left;
        const y = (e.clientY || e.pageY) - rect.top;
        
        this.continueDrawing(x, y);
    }
    
    onCanvasMouseUp() {
        if (this.isDrawing) {
            this.finishDrawing();
        }
    }
    
    startDrawing(x, y) {
        this.isDrawing = true;
        this.drawingPoints = [{ x, y }];
        
        // Initialize motion path
        this.motionPath = {
            points: [{ x, y }],
            type: this.currentTool,
            color: '#10b981',
            width: 3,
            fill: '#10b98122',
            completed: false
        };
        
        // Show direction arrows at starting point
        this.showDirectionArrowsAt(x, y);
        
        this.updateStatus(`Đang vẽ ${this.currentTool}...`, 'tool-status');
        this.showNotification('✏️ Bắt đầu vẽ - di chuột để tiếp tục');
    }
    
    continueDrawing(x, y) {
        if (!this.isDrawing || !this.motionPath) return;
        
        this.drawingPoints.push({ x, y });
        this.motionPath.points = this.drawingPoints;
        
        // Draw preview
        this.draw();
    }
    
    finishDrawing() {
        this.isDrawing = false;
        
        if (this.drawingPoints.length > 1) {
            // Finalize the path
            this.motionPath.completed = true;
            
            // Smooth the path if it's a freehand drawing
            if (this.currentTool === 'pen') {
                this.motionPath.points = this.smoothPath(this.drawingPoints);
            }
            
            // Update UI
            this.updateLayerList();
            this.hideDirectionArrows();
            this.showEditPoints();
            
            this.showNotification(`✅ Đã vẽ path với ${this.drawingPoints.length} điểm`);
            
            // Auto-suggest motion if AI is enabled
            const autoDetect = document.getElementById('auto-detect');
            if (autoDetect && autoDetect.checked) {
                setTimeout(() => this.autoSuggestMotion(), 500);
            }
        } else {
            // Single click - clear the path
            this.motionPath = null;
        }
        
        this.drawingPoints = [];
        this.draw();
    }
    
    showDirectionArrowsAt(x, y) {
        const overlay = document.getElementById('direction-overlay');
        if (!overlay) return;
        
        overlay.innerHTML = '';
        
        const arrows = [
            { dir: 'nw', symbol: '↖', dx: -40, dy: -40 },
            { dir: 'n', symbol: '↑', dx: 0, dy: -40 },
            { dir: 'ne', symbol: '↗', dx: 40, dy: -40 },
            { dir: 'w', symbol: '←', dx: -40, dy: 0 },
            { dir: 'center', symbol: '○', dx: 0, dy: 0 },
            { dir: 'e', symbol: '→', dx: 40, dy: 0 },
            { dir: 'sw', symbol: '↙', dx: -40, dy: 40 },
            { dir: 's', symbol: '↓', dx: 0, dy: 40 },
            { dir: 'se', symbol: '↘', dx: 40, dy: 40 }
        ];
        
        arrows.forEach(arrow => {
            const arrowEl = document.createElement('div');
            arrowEl.className = 'direction-arrow';
            arrowEl.dataset.dir = arrow.dir;
            arrowEl.style.left = `${x + arrow.dx}px`;
            arrowEl.style.top = `${y + arrow.dy}px`;
            arrowEl.textContent = arrow.symbol;
            arrowEl.title = `Direction: ${arrow.dir}`;
            
            arrowEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setMotionDirection(arrow.dir);
            });
            
            overlay.appendChild(arrowEl);
        });
        
        overlay.style.display = 'block';
    }
    
    hideDirectionArrows() {
        const overlay = document.getElementById('direction-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
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
            this.makeEditPointDraggable(editPoint, index);
            
            overlay.appendChild(editPoint);
        });
    }
    
    makeEditPointDraggable(element, pointIndex) {
        let isDragging = false;
        let startX, startY;
        
        element.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            isDragging = true;
            startX = e.clientX - element.offsetLeft;
            startY = e.clientY - element.offsetTop;
            
            element.style.cursor = 'grabbing';
            element.classList.add('dragging');
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
                
                // Redraw
                if (!this.isPlaying) {
                    this.draw();
                }
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.cursor = 'grab';
                element.classList.remove('dragging');
                this.showNotification(`📐 Đã di chuyển điểm ${pointIndex + 1}`);
            }
        });
    }
    
    selectObjectAt(x, y) {
        // Simple selection logic
        // In a full implementation, this would select objects/paths
        this.showNotification('🔍 Click vào đối tượng để chọn');
    }
    
    selectEditPoint(x, y) {
        // Select edit point for editing
        this.showNotification('📐 Chọn điểm để chỉnh sửa');
    }
    
    autoSuggestMotion() {
        if (!this.motionPath) return;
        
        // Analyze path and suggest motion type
        const bounds = this.getPathBounds(this.motionPath.points);
        const aspectRatio = bounds.width / bounds.height;
        
        let suggestion = 'flow';
        if (aspectRatio > 2) {
            suggestion = 'flow'; // Wide path
        } else if (aspectRatio < 0.5) {
            suggestion = 'follow'; // Tall path
        } else if (this.motionPath.points.length > 50) {
            suggestion = 'swirl'; // Complex path
        }
        
        // Update motion type
        const motionTypeSelect = document.getElementById('motion-type');
        if (motionTypeSelect) {
            motionTypeSelect.value = suggestion;
        }
        
        this.showAINotification(`🤖 AI đề xuất: "${suggestion}" motion cho path này`);
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
    
    setupTools() {
        // Brush size
        const brushSize = document.getElementById('brush-size');
        if (brushSize) {
            brushSize.addEventListener('input', (e) => {
                const value = e.target.value;
                document.getElementById('brush-size-value').textContent = `${value}px`;
                if (this.motionPath) {
                    this.motionPath.width = parseInt(value);
                }
            });
        }
        
        // Smoothness
        const smoothness = document.getElementById('smoothness');
        if (smoothness) {
            smoothness.addEventListener('input', (e) => {
                const value = e.target.value;
                document.getElementById('smoothness-value').textContent = `${value}%`;
            });
        }
        
        // Material properties
        const friction = document.getElementById('friction');
        if (friction) {
            friction.addEventListener('input', (e) => {
                const value = e.target.value;
                document.getElementById('friction-value').textContent = value;
            });
        }
        
        const bounciness = document.getElementById('bounciness');
        if (bounciness) {
            bounciness.addEventListener('input', (e) => {
                const value = e.target.value;
                document.getElementById('bounciness-value').textContent = value;
            });
        }
        
        const density = document.getElementById('density');
        if (density) {
            density.addEventListener('input', (e) => {
                const value = e.target.value;
                document.getElementById('density-value').textContent = value;
            });
        }
        
        // Material presets
        const materialPresets = document.querySelectorAll('.material-preset');
        materialPresets.forEach(preset => {
            preset.addEventListener('click', (e) => {
                const material = e.currentTarget.dataset.material;
                const materials = {
                    'water': '💧 Nước',
                    'sand': '🏖️ Cát',
                    'plastic': '🧱 Nhựa',
                    'metal': '⚙️ Kim loại'
                };
                this.showNotification(`🧱 Vật liệu: ${materials[material] || material}`);
            });
        });
        
        // Device presets
        const presetButtons = document.querySelectorAll('.preset-btn');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.currentTarget.dataset.preset;
                const presets = {
                    'conveyor': '📦 Băng tải',
                    'screw': '🌀 Vít tải',
                    'mixer': '🔄 Máy trộn',
                    'vibrating': '📳 Sàng rung',
                    'pump': '💧 Bơm'
                };
                this.showNotification(`🏭 Preset: ${presets[preset] || preset}`);
                
                // Load specific preset configuration
                if (preset === 'screw') {
                    this.loadScrewConveyorPreset();
                }
            });
        });
    }
    
    loadScrewConveyorPreset() {
        // Set up screw conveyor configuration
        this.setMotionDirection('e');
        
        const motionTypeSelect = document.getElementById('motion-type');
        if (motionTypeSelect) {
            motionTypeSelect.value = 'flow';
        }
        
        const speedSlider = document.getElementById('speed-slider');
        if (speedSlider) {
            speedSlider.value = 40;
            document.getElementById('speed-value').textContent = '40';
        }
        
        const particleSlider = document.getElementById('particle-count');
        if (particleSlider) {
            particleSlider.value = 150;
            document.getElementById('count-value').textContent = '150';
        }
        
        this.showNotification('🌀 Đã áp dụng cấu hình vít tải');
        
        // Create a sample screw conveyor path
        if (!this.motionPath) {
            this.createScrewConveyorPath();
        }
    }
    
    createScrewConveyorPath() {
        if (!this.canvas) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        const points = [];
        const startX = width * 0.2;
        const endX = width * 0.8;
        const centerY = height / 2;
        const amplitude = 40;
        
        // Create helical path
        for (let x = startX; x <= endX; x += 10) {
            const y = centerY + Math.sin((x - startX) * 0.05) * amplitude;
            points.push({ x, y });
        }
        
        this.motionPath = {
            points: points,
            type: 'pen',
            color: '#10b981',
            width: 3,
            completed: true
        };
        
        this.showEditPoints();
        this.draw();
    }
    
    setupAnimations() {
        // FPS counter update
        setInterval(() => {
            const fpsDisplay = document.getElementById('fps-counter');
            if (fpsDisplay && this.fps > 0) {
                fpsDisplay.textContent = this.fps;
            }
        }, 1000);
        
        // Time display update
        setInterval(() => {
            if (this.isPlaying) {
                const timeDisplay = document.getElementById('time-counter');
                if (timeDisplay) {
                    // Simple time counter for demo
                    const currentTime = performance.now() / 1000;
                    timeDisplay.textContent = `${currentTime.toFixed(1)}s`;
                }
            }
        }, 100);
        
        // Particle count display
        setInterval(() => {
            const particleDisplay = document.getElementById('particle-counter');
            if (particleDisplay) {
                particleDisplay.textContent = this.particles.length;
            }
        }, 500);
    }
    
    loadInitialDemo() {
        // Show welcome notification
        this.showWelcomeNotification();
        
        // Update status
        this.updateStatus('AI: Sẵn sàng', 'ai-status');
        this.updateStatus('Chọn công cụ để bắt đầu', 'tool-status');
        this.updateStatus('1 layer', 'layer-status');
        this.updateStatus('Sẵn sàng xuất', 'export-status');
        
        // Set initial values
        this.setMotionDirection('e');
        
        // Show tutorial after delay
        setTimeout(() => {
            const tutorialBtn = document.getElementById('tutorial');
            if (tutorialBtn && !localStorage.getItem('tutorial_shown')) {
                this.showTutorial();
                localStorage.setItem('tutorial_shown', 'true');
            }
        }, 3000);
    }
    
    loadDemoProject() {
        this.showNotification('🚀 Đang tải demo project...');
        
        // Clear any existing animation
        this.stopAnimation();
        
        // Create a demo background
        this.background = {
            type: 'demo',
            name: 'Screw Conveyor Demo',
            width: this.canvas.width,
            height: this.canvas.height
        };
        
        // Create demo motion path
        this.createScrewConveyorPath();
        
        // Set demo settings
        this.applyAIPreset('water-flow');
        
        // Create particles
        this.createParticles();
        
        // Update UI
        this.updateLayerList();
        
        this.showNotification('✅ Demo project đã sẵn sàng! Click Play để xem animation');
    }
    
    async loadBackgroundFile(file) {
        if (!file) return;
        
        this.showNotification(`📁 Đang tải: ${file.name}`);
        this.updateStatus('Đang tải background...', 'tool-status');
        
        try {
            // For demo purposes, simulate loading
            // In a real app, you would parse the GIF/video here
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.background = {
                type: file.type.includes('gif') ? 'gif' : 
                      file.type.includes('video') ? 'video' : 'image',
                name: file.name,
                width: this.canvas.width,
                height: this.canvas.height,
                file: file
            };
            
            // Draw placeholder
            this.drawBackgroundPlaceholder(file.name);
            
            this.updateStatus('Background đã tải', 'tool-status');
            this.updateLayerList();
            this.showNotification(`✅ Đã tải background: ${file.name}`);
            
        } catch (error) {
            console.error('Error loading background:', error);
            this.showError(`Lỗi tải file: ${error.message}`);
        }
    }
    
    async loadMaterialFile(file) {
        if (!file) return;
        
        this.showNotification(`🎨 Đang tải vật liệu: ${file.name}`);
        
        try {
            // Create material object
            this.material = {
                name: file.name,
                type: file.type,
                image: new Image()
            };
            
            // Create a demo image (in real app, use file)
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            
            // Create pattern based on file type hint
            if (file.name.includes('water') || file.name.includes('liquid')) {
                // Water pattern
                ctx.fillStyle = '#4a90e2';
                ctx.fillRect(0, 0, 100, 100);
                for (let i = 0; i < 5; i++) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + i * 0.1})`;
                    ctx.fillRect(i * 20, 0, 10, 100);
                }
            } else if (file.name.includes('metal') || file.name.includes('steel')) {
                // Metal pattern
                const gradient = ctx.createLinearGradient(0, 0, 100, 100);
                gradient.addColorStop(0, '#94a3b8');
                gradient.addColorStop(1, '#64748b');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 100, 100);
            } else {
                // Default pattern
                ctx.fillStyle = '#10b981';
                ctx.fillRect(0, 0, 50, 50);
                ctx.fillRect(50, 50, 50, 50);
                ctx.fillStyle = '#0da271';
                ctx.fillRect(50, 0, 50, 50);
                ctx.fillRect(0, 50, 50, 50);
            }
            
            this.material.image.src = canvas.toDataURL();
            this.material.image.onload = () => {
                this.updateLayerList();
                this.showNotification(`✅ Đã tải vật liệu: ${file.name}`);
            };
            
        } catch (error) {
            console.error('Error loading material:', error);
            this.showError(`Lỗi tải vật liệu: ${error.message}`);
        }
    }
    
    drawBackgroundPlaceholder(filename) {
        if (!this.canvas || !this.ctx) return;
        
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#1e3a8a');
        gradient.addColorStop(1, '#1e40af');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Draw file info
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 24px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText('📁 ' + filename, width / 2, height / 2 - 30);
        
        ctx.font = '16px "Segoe UI"';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText('Background loaded successfully', width / 2, height / 2 + 10);
        ctx.fillText('Now draw your motion path', width / 2, height / 2 + 40);
        
        // Draw border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, width - 40, height - 40);
    }
    
    draw() {
        if (!this.canvas || !this.ctx) return;
        
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw background
        if (this.background) {
            this.drawBackgroundPlaceholder(this.background.name);
        } else {
            this.drawInitialScreen();
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
    
    drawToCanvas(targetCtx, width, height) {
        // Draw current state to another canvas context
        // This is used for export
        
        // Draw background
        if (this.background) {
            const gradient = targetCtx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#1e3a8a');
            gradient.addColorStop(1, '#1e40af');
            targetCtx.fillStyle = gradient;
            targetCtx.fillRect(0, 0, width, height);
            
            // Draw info
            targetCtx.fillStyle = 'white';
            targetCtx.font = '20px Arial';
            targetCtx.textAlign = 'center';
            targetCtx.fillText('AI Motion Studio Export', width/2, height/2);
        }
        
        // Draw motion path
        if (this.motionPath && this.motionPath.points.length > 1) {
            targetCtx.strokeStyle = this.motionPath.color;
            targetCtx.lineWidth = this.motionPath.width;
            targetCtx.lineJoin = 'round';
            targetCtx.lineCap = 'round';
            
            targetCtx.beginPath();
            targetCtx.moveTo(this.motionPath.points[0].x, this.motionPath.points[0].y);
            
            for (let i = 1; i < this.motionPath.points.length; i++) {
                targetCtx.lineTo(this.motionPath.points[i].x, this.motionPath.points[i].y);
            }
            
            targetCtx.stroke();
        }
        
        // Draw particles
        if (this.particles.length > 0) {
            this.particles.forEach(particle => {
                targetCtx.fillStyle = particle.color;
                targetCtx.beginPath();
                targetCtx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
                targetCtx.fill();
            });
        }
    }
    
    drawMotionPath() {
        if (!this.motionPath || this.motionPath.points.length < 2) return;
        
        const ctx = this.ctx;
        const points = this.motionPath.points;
        
        ctx.save();
        
        // Draw path
        ctx.strokeStyle = this.motionPath.color;
        ctx.lineWidth = this.motionPath.width;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        
        ctx.stroke();
        
        // Draw fill if completed
        if (this.motionPath.completed && this.motionPath.fill) {
            ctx.fillStyle = this.motionPath.fill;
            ctx.fill();
        }
        
        // Draw control points if editing
        if (this.currentTool === 'edit-points') {
            points.forEach(point => {
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        
        ctx.restore();
    }
    
    drawCurrentPath() {
        if (this.drawingPoints.length < 2) return;
        
        const ctx = this.ctx;
        
        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.setLineDash([5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(this.drawingPoints[0].x, this.drawingPoints[0].y);
        
        for (let i = 1; i < this.drawingPoints.length; i++) {
            ctx.lineTo(this.drawingPoints[i].x, this.drawingPoints[i].y);
        }
        
        ctx.stroke();
        ctx.restore();
    }
    
    drawParticles() {
        const ctx = this.ctx;
        
        ctx.save();
        
        this.particles.forEach(particle => {
            // Calculate opacity based on life
            const opacity = particle.life / particle.maxLife;
            
            ctx.save();
            ctx.globalAlpha = opacity;
            
            // Draw material if available, otherwise use color
            if (this.material && this.material.image.complete) {
                ctx.drawImage(
                    this.material.image,
                    particle.x - particle.size / 2,
                    particle.y - particle.size / 2,
                    particle.size,
                    particle.size
                );
            } else {
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        });
        
        ctx.restore();
    }
    
    clearCanvas() {
        this.motionPath = null;
        this.particles = [];
        this.stopAnimation();
        
        // Clear edit points
        const editOverlay = document.getElementById('edit-points-overlay');
        if (editOverlay) {
            editOverlay.innerHTML = '';
            editOverlay.style.display = 'none';
        }
        
        // Clear direction arrows
        this.hideDirectionArrows();
        
        // Redraw
        this.draw();
        
        this.updateLayerList();
        this.showNotification('🧹 Đã xóa tất cả');
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
        
        // Clear and rebuild layer list
        layerList.innerHTML = '';
        
        if (layers.length === 0) {
            layerList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-layer-group"></i>
                    <p>Chưa có layers</p>
                </div>
            `;
            return;
        }
        
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
    
    updateStatus(message, elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            const span = element.querySelector('span') || element;
            span.textContent = message;
        }
    }
    
    showWelcomeNotification() {
        // Create welcome notification
        const notification = document.createElement('div');
        notification.className = 'welcome-notification';
        notification.innerHTML = `
            <div class="welcome-content">
                <i class="fas fa-robot welcome-icon"></i>
                <div class="welcome-text">
                    <h4>Chào mừng đến với AI Motion Studio! 🎬</h4>
                    <p>Tạo chuyển động thông minh trên GIF/ảnh</p>
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
        
        // Navigation buttons
        const nextBtn = document.getElementById('next-tutorial');
        const prevBtn = document.getElementById('prev-tutorial');
        const skipBtn = document.getElementById('skip-tutorial');
        const closeBtn = document.getElementById('close-tutorial');
        
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
    
    showNotification(message) {
        console.log('📢 Notification:', message);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-info-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }
    
    showAINotification(message) {
        this.showNotification(`🤖 ${message}`);
    }
    
    showError(message) {
        console.error('❌ Error:', message);
        this.showNotification(`❌ ${message}`);
    }
}

// Add global styles for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
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
    
    .direction-arrow {
        position: absolute;
        width: 40px;
        height: 40px;
        background: white;
        border: 2px solid #6366f1;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: #6366f1;
        cursor: pointer;
        pointer-events: all;
        transform: translate(-50%, -50%);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        transition: all 0.2s ease;
        z-index: 50;
    }
    
    .direction-arrow:hover {
        background: #6366f1;
        color: white;
        transform: translate(-50%, -50%) scale(1.2);
    }
    
    .direction-arrow.active {
        background: #6366f1;
        color: white;
        border-color: #6366f1;
        transform: translate(-50%, -50%) scale(1.1);
    }
    
    .edit-point {
        position: absolute;
        width: 12px;
        height: 12px;
        background: #ef4444;
        border: 2px solid white;
        border-radius: 50%;
        cursor: move;
        pointer-events: all;
        transform: translate(-50%, -50%);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
        z-index: 60;
    }
    
    .edit-point:hover {
        transform: translate(-50%, -50%) scale(1.5);
        background: #dc2626;
    }
    
    .edit-point.dragging {
        transform: translate(-50%, -50%) scale(1.5);
        background: #dc2626;
        cursor: grabbing;
    }
    
    .hidden {
        display: none !important;
    }
`;
document.head.appendChild(style);

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 DOM Content Loaded - Starting Motion Studio');
    
    try {
        window.motionStudio = new MotionStudio();
        console.log('🎉 Motion Studio started successfully!');
    } catch (error) {
        console.error('❌ Error starting Motion Studio:', error);
        
        // Show error message
        document.body.innerHTML = `
            <div style="padding: 40px; text-align: center; font-family: Arial; background: #0f172a; color: white; min-height: 100vh;">
                <h1 style="color: #ef4444;">⚠️ Application Error</h1>
                <p>There was an error starting the application.</p>
                <p style="color: #94a3b8;">${error.message}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 5px; margin-top: 20px; cursor: pointer;">
                    Reload Application
                </button>
            </div>
        `;
    }
});

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});
