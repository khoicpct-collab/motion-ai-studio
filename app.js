// ============================================
// CONFIGURATION & GLOBAL VARIABLES
// ============================================
const CONFIG = {
    MAX_PARTICLES: 1000,
    CANVAS_WIDTH: 1920,
    CANVAS_HEIGHT: 1080,
    BG_COLOR: '#f0f0f0',
    DEMO_PATHS: [
        {type: 'bezier', points: [[100, 100], [400, 200], [700, 150], [900, 300]], color: '#ff0000'},
        {type: 'rectangle', x: 300, y: 400, width: 200, height: 150, color: '#00ff00'},
        {type: 'circle', x: 800, y: 400, radius: 80, color: '#0000ff'}
    ],
    AI_PRESETS: {
        water: { motion: 'flow', speed: 30, count: 150, size: 8, color: '#4a90e2' },
        smoke: { motion: 'swirl', speed: 15, count: 80, size: 12, color: '#cccccc' },
        particles: { motion: 'random', speed: 50, count: 200, size: 6, color: '#ff6b6b' }
    }
};

let state = {
    canvas: null,
    ctx: null,
    background: null,
    particles: [],
    paths: [],
    currentPath: null,
    selectedTool: 'select',
    isDrawing: false,
    isPlaying: false,
    lastTime: 0,
    fps: 60,
    particleCount: 100,
    particleSize: 10,
    motionType: 'flow',
    speed: 50,
    material: null,
    devicePreset: null,
    exportProgress: 0
};

// ============================================
// INITIALIZATION
// ============================================
function init() {
    console.log('🚀 Initializing Motion AI Studio...');
    
    // Initialize canvas
    state.canvas = document.getElementById('mainCanvas');
    state.ctx = state.canvas.getContext('2d');
    
    // Set canvas size
    state.canvas.width = CONFIG.CANVAS_WIDTH;
    state.canvas.height = CONFIG.CANVAS_HEIGHT;
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup UI controls
    setupUIControls();
    
    // Create initial demo particles
    createDemoParticles();
    
    // Show welcome notification
    showNotification('🎉 Chào mừng đến với Motion AI Studio!');
    showTutorial();
    
    console.log('✅ Application initialized successfully');
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================
function setupEventListeners() {
    // Canvas events
    state.canvas.addEventListener('mousedown', startDrawing);
    state.canvas.addEventListener('mousemove', draw);
    state.canvas.addEventListener('mouseup', stopDrawing);
    state.canvas.addEventListener('mouseleave', stopDrawing);
    
    // Tool selection
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            state.selectedTool = this.dataset.tool;
            updateToolSelection();
            showNotification(`🛠 Selected tool: ${this.dataset.tool}`);
        });
    });
    
    // Motion type selection
    document.querySelectorAll('.motion-option').forEach(option => {
        option.addEventListener('click', function() {
            state.motionType = this.dataset.motion;
            updateMotionSelection();
            showNotification(`🌀 Motion type: ${this.dataset.motion}`);
        });
    });
    
    // Direction buttons
    document.querySelectorAll('.dir-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const direction = this.dataset.dir;
            applyDirection(direction);
            showNotification(`↖ Direction: ${direction}`);
        });
    });
}

// ============================================
// UI CONTROLS SETUP
// ============================================
function setupUIControls() {
    // Speed control
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    
    speedSlider.addEventListener('input', function() {
        state.speed = parseInt(this.value);
        speedValue.textContent = `${state.speed}%`;
    });
    
    // Particle count control
    const countSlider = document.getElementById('countSlider');
    const countValue = document.getElementById('countValue');
    
    countSlider.addEventListener('input', function() {
        state.particleCount = parseInt(this.value);
        countValue.textContent = state.particleCount;
        createDemoParticles();
    });
    
    // Particle size control
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeValue = document.getElementById('sizeValue');
    
    sizeSlider.addEventListener('input', function() {
        state.particleSize = parseInt(this.value);
        sizeValue.textContent = state.particleSize;
    });
    
    // Animation controls
    document.getElementById('playBtn').addEventListener('click', toggleAnimation);
    document.getElementById('stopBtn').addEventListener('click', stopAnimation);
    
    // AI Presets
    document.getElementById('waterPreset').addEventListener('click', () => applyAIPreset('water'));
    document.getElementById('smokePreset').addEventListener('click', () => applyAIPreset('smoke'));
    document.getElementById('particlesPreset').addEventListener('click', () => applyAIPreset('particles'));
    document.getElementById('aiOptimizeBtn').addEventListener('click', optimizeWithAI);
    document.getElementById('aiSmoothBtn').addEventListener('click', smoothPathWithAI);
    
    // Export buttons
    document.getElementById('exportGif').addEventListener('click', () => exportAnimation('gif'));
    document.getElementById('exportMp4').addEventListener('click', () => exportAnimation('mp4'));
    document.getElementById('exportPng').addEventListener('click', () => exportAnimation('png'));
    
    // Device presets
    document.querySelectorAll('.device-preset').forEach(preset => {
        preset.addEventListener('click', function() {
            applyDevicePreset(this.dataset.device);
        });
    });
    
    // Tutorial & help
    document.getElementById('helpBtn').addEventListener('click', showTutorial);
    document.getElementById('closeTutorial').addEventListener('click', hideTutorial);
    
    // File uploads
    document.getElementById('uploadBackground').addEventListener('change', handleBackgroundUpload);
    document.getElementById('uploadMaterial').addEventListener('change', handleMaterialUpload);
    document.getElementById('loadDemo').addEventListener('click', loadDemoProject);
}

// ============================================
// FILE UPLOAD FUNCTIONS - FIXED VERSION
// ============================================
function handleBackgroundUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log(`📁 Uploading background: ${file.name}`);
    showNotification(`🖼 Uploading background: ${file.name}`);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            state.background = img;
            showNotification('✅ Background uploaded successfully!');
            drawCanvas();
        };
        img.onerror = function() {
            showNotification('❌ Error loading background image', 'error');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function handleMaterialUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log(`📁 Uploading material: ${file.name}`);
    showNotification(`🎨 Uploading material: ${file.name}`);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            state.material = img;
            updateParticleMaterial();
            showNotification('✅ Material uploaded successfully!');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ============================================
// DRAWING FUNCTIONS
// ============================================
function startDrawing(e) {
    if (state.selectedTool === 'select') return;
    
    const rect = state.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    state.isDrawing = true;
    
    switch(state.selectedTool) {
        case 'pen':
            state.currentPath = {
                type: 'freehand',
                points: [[x, y]],
                color: getRandomColor(),
                lineWidth: 2
            };
            break;
        case 'rectangle':
            state.currentPath = {
                type: 'rectangle',
                startX: x,
                startY: y,
                x: x,
                y: y,
                width: 0,
                height: 0,
                color: getRandomColor()
            };
            break;
        case 'circle':
            state.currentPath = {
                type: 'circle',
                startX: x,
                startY: y,
                x: x,
                y: y,
                radius: 0,
                color: getRandomColor()
            };
            break;
    }
}

function draw(e) {
    if (!state.isDrawing || !state.currentPath) return;
    
    const rect = state.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    switch(state.currentPath.type) {
        case 'freehand':
            state.currentPath.points.push([x, y]);
            break;
        case 'rectangle':
            state.currentPath.width = x - state.currentPath.startX;
            state.currentPath.height = y - state.currentPath.startY;
            state.currentPath.x = Math.min(state.currentPath.startX, x);
            state.currentPath.y = Math.min(state.currentPath.startY, y);
            state.currentPath.width = Math.abs(state.currentPath.width);
            state.currentPath.height = Math.abs(state.currentPath.height);
            break;
        case 'circle':
            const dx = x - state.currentPath.startX;
            const dy = y - state.currentPath.startY;
            state.currentPath.radius = Math.sqrt(dx * dx + dy * dy);
            break;
    }
    
    drawCanvas();
    drawCurrentPath();
}

function stopDrawing() {
    if (!state.isDrawing || !state.currentPath) return;
    
    state.isDrawing = false;
    
    // Add completed path to paths array
    if (state.currentPath.type === 'freehand' && state.currentPath.points.length > 1) {
        state.paths.push({...state.currentPath});
        showNotification(`🖊 Path created with ${state.currentPath.points.length} points`);
    } else if (state.currentPath.type === 'rectangle' && state.currentPath.width > 5 && state.currentPath.height > 5) {
        state.paths.push({...state.currentPath});
        showNotification(`⬜ Rectangle created`);
    } else if (state.currentPath.type === 'circle' && state.currentPath.radius > 5) {
        state.paths.push({...state.currentPath});
        showNotification(`⭕ Circle created`);
    }
    
    state.currentPath = null;
    drawCanvas();
}

// ============================================
// PARTICLE SYSTEM
// ============================================
function createDemoParticles() {
    state.particles = [];
    
    for (let i = 0; i < state.particleCount; i++) {
        state.particles.push({
            x: Math.random() * state.canvas.width,
            y: Math.random() * state.canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * state.particleSize + 2,
            color: getRandomColor(),
            life: 1.0,
            speed: Math.random() * 2 + 0.5
        });
    }
    
    drawCanvas();
}

function updateParticles(deltaTime) {
    const speedFactor = state.speed / 50;
    
    state.particles.forEach(particle => {
        switch(state.motionType) {
            case 'flow':
                particle.x += particle.vx * speedFactor;
                particle.y += particle.vy * speedFactor;
                break;
            case 'follow':
                if (state.paths.length > 0) {
                    const path = state.paths[0];
                    // Simple path following logic
                    particle.x += Math.cos(particle.life * 10) * speedFactor;
                    particle.y += Math.sin(particle.life * 10) * speedFactor;
                }
                break;
            case 'swirl':
                const angle = particle.life * 10;
                particle.x += Math.cos(angle) * speedFactor;
                particle.y += Math.sin(angle) * speedFactor;
                break;
            case 'random':
                particle.x += (Math.random() - 0.5) * 4 * speedFactor;
                particle.y += (Math.random() - 0.5) * 4 * speedFactor;
                break;
        }
        
        // Boundary check
        if (particle.x < 0) particle.x = state.canvas.width;
        if (particle.x > state.canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = state.canvas.height;
        if (particle.y > state.canvas.height) particle.y = 0;
        
        particle.life += 0.01;
    });
}

// ============================================
// ANIMATION LOOP
// ============================================
function animate(timestamp) {
    if (!state.lastTime) state.lastTime = timestamp;
    const deltaTime = timestamp - state.lastTime;
    state.lastTime = timestamp;
    
    // Calculate FPS
    state.fps = Math.round(1000 / deltaTime);
    updateFPSDisplay();
    
    if (state.isPlaying) {
        updateParticles(deltaTime);
        drawCanvas();
    }
    
    requestAnimationFrame(animate);
}

function toggleAnimation() {
    state.isPlaying = !state.isPlaying;
    const playBtn = document.getElementById('playBtn');
    
    if (state.isPlaying) {
        playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        showNotification('▶ Animation started');
    } else {
        playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
        showNotification('⏸ Animation paused');
    }
}

function stopAnimation() {
    state.isPlaying = false;
    document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i> Play';
    createDemoParticles();
    showNotification('⏹ Animation stopped');
}

// ============================================
// AI FEATURES
// ============================================
function applyAIPreset(presetName) {
    const preset = CONFIG.AI_PRESETS[presetName];
    if (!preset) return;
    
    state.motionType = preset.motion;
    state.speed = preset.speed;
    state.particleCount = preset.count;
    state.particleSize = preset.size;
    
    // Update UI
    document.getElementById('speedSlider').value = state.speed;
    document.getElementById('speedValue').textContent = `${state.speed}%`;
    document.getElementById('countSlider').value = state.particleCount;
    document.getElementById('countValue').textContent = state.particleCount;
    document.getElementById('sizeSlider').value = state.particleSize;
    document.getElementById('sizeValue').textContent = state.particleSize;
    
    updateMotionSelection();
    createDemoParticles();
    
    showNotification(`🤖 Applied ${presetName} preset`, 'success');
}

function optimizeWithAI() {
    showNotification('🤖 AI is optimizing animation...', 'info');
    
    // Simulate AI processing
    setTimeout(() => {
        // Apply optimizations
        state.speed = Math.min(state.speed + 10, 100);
        state.particleCount = Math.min(state.particleCount + 50, CONFIG.MAX_PARTICLES);
        
        // Update UI
        document.getElementById('speedSlider').value = state.speed;
        document.getElementById('speedValue').textContent = `${state.speed}%`;
        document.getElementById('countSlider').value = state.particleCount;
        document.getElementById('countValue').textContent = state.particleCount;
        
        createDemoParticles();
        showNotification('✅ AI optimization complete!', 'success');
    }, 1500);
}

function smoothPathWithAI() {
    if (state.paths.length === 0) {
        showNotification('⚠ No paths to smooth', 'warning');
        return;
    }
    
    showNotification('🤖 AI is smoothing paths...', 'info');
    
    // Simulate AI smoothing
    setTimeout(() => {
        state.paths.forEach(path => {
            if (path.type === 'freehand' && path.points.length > 10) {
                // Simple smoothing algorithm
                const smoothed = [];
                for (let i = 0; i < path.points.length - 1; i++) {
                    const [x1, y1] = path.points[i];
                    const [x2, y2] = path.points[i + 1];
                    smoothed.push([(x1 + x2) / 2, (y1 + y2) / 2]);
                }
                path.points = smoothed;
            }
        });
        
        drawCanvas();
        showNotification('✅ Path smoothing complete!', 'success');
    }, 1000);
}

// ============================================
// DEVICE PRESETS
// ============================================
function applyDevicePreset(device) {
    const presets = {
        'screw-conveyor': { motion: 'flow', speed: 40, count: 120, size: 8, angle: 45 },
        'conveyor-belt': { motion: 'flow', speed: 60, count: 80, size: 12, angle: 0 },
        'mixer': { motion: 'swirl', speed: 30, count: 200, size: 6, angle: 90 },
        'vibrating-screen': { motion: 'random', speed: 70, count: 150, size: 10, angle: 0 },
        'pump': { motion: 'follow', speed: 50, count: 100, size: 15, angle: -45 }
    };
    
    const preset = presets[device];
    if (!preset) return;
    
    state.devicePreset = device;
    state.motionType = preset.motion;
    state.speed = preset.speed;
    state.particleCount = preset.count;
    state.particleSize = preset.size;
    
    // Update UI
    document.getElementById('speedSlider').value = state.speed;
    document.getElementById('speedValue').textContent = `${state.speed}%`;
    document.getElementById('countSlider').value = state.particleCount;
    document.getElementById('countValue').textContent = state.particleCount;
    document.getElementById('sizeSlider').value = state.particleSize;
    document.getElementById('sizeValue').textContent = state.particleSize;
    
    updateMotionSelection();
    createDemoParticles();
    
    showNotification(`🏭 Applied ${device.replace('-', ' ')} preset`, 'success');
}

// ============================================
// EXPORT FUNCTIONS
// ============================================
function exportAnimation(format) {
    showNotification(`📤 Preparing ${format.toUpperCase()} export...`, 'info');
    
    // Show export modal
    document.getElementById('exportModal').classList.remove('hidden');
    document.getElementById('exportProgress').style.width = '0%';
    document.getElementById('exportProgressText').textContent = 'Preparing...';
    
    state.exportProgress = 0;
    
    // Simulate export process
    const steps = ['Processing animation', 'Rendering frames', 'Encoding video', 'Finalizing export'];
    let currentStep = 0;
    
    const progressInterval = setInterval(() => {
        state.exportProgress += 25;
        document.getElementById('exportProgress').style.width = `${state.exportProgress}%`;
        
        if (currentStep < steps.length) {
            document.getElementById('exportProgressText').textContent = steps[currentStep];
            currentStep++;
        }
        
        if (state.exportProgress >= 100) {
            clearInterval(progressInterval);
            
            setTimeout(() => {
                document.getElementById('exportModal').classList.add('hidden');
                
                // Create download link
                const filename = `motion-ai-export-${Date.now()}.${format}`;
                const blob = new Blob(['Simulated export data'], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showNotification(`✅ ${format.toUpperCase()} exported successfully!`, 'success');
            }, 500);
        }
    }, 300);
}

// ============================================
// UI HELPER FUNCTIONS
// ============================================
function updateToolSelection() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tool === state.selectedTool);
    });
}

function updateMotionSelection() {
    document.querySelectorAll('.motion-option').forEach(option => {
        option.classList.toggle('active', option.dataset.motion === state.motionType);
    });
}

function updateFPSDisplay() {
    document.getElementById('fpsCounter').textContent = `${state.fps} FPS`;
    const fpsBar = document.getElementById('fpsBar');
    const percentage = Math.min(state.fps / 60 * 100, 100);
    fpsBar.style.width = `${percentage}%`;
    
    // Color coding
    if (state.fps < 30) fpsBar.style.backgroundColor = '#ff4757';
    else if (state.fps < 50) fpsBar.style.backgroundColor = '#ffa502';
    else fpsBar.style.backgroundColor = '#2ed573';
}

function drawCanvas() {
    // Clear canvas
    state.ctx.fillStyle = CONFIG.BG_COLOR;
    state.ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
    
    // Draw background if exists
    if (state.background) {
        state.ctx.drawImage(state.background, 0, 0, state.canvas.width, state.canvas.height);
    }
    
    // Draw paths
    state.paths.forEach(path => {
        state.ctx.strokeStyle = path.color;
        state.ctx.lineWidth = path.lineWidth || 2;
        
        switch(path.type) {
            case 'freehand':
                state.ctx.beginPath();
                path.points.forEach((point, i) => {
                    if (i === 0) state.ctx.moveTo(point[0], point[1]);
                    else state.ctx.lineTo(point[0], point[1]);
                });
                state.ctx.stroke();
                break;
                
            case 'rectangle':
                state.ctx.strokeRect(path.x, path.y, path.width, path.height);
                break;
                
            case 'circle':
                state.ctx.beginPath();
                state.ctx.arc(path.x, path.y, path.radius, 0, Math.PI * 2);
                state.ctx.stroke();
                break;
        }
    });
    
    // Draw particles
    state.particles.forEach(particle => {
        if (state.material) {
            // Draw material image
            state.ctx.drawImage(state.material, 
                particle.x - particle.size/2, 
                particle.y - particle.size/2,
                particle.size, particle.size);
        } else {
            // Draw colored circle
            state.ctx.fillStyle = particle.color;
            state.ctx.beginPath();
            state.ctx.arc(particle.x, particle.y, particle.size/2, 0, Math.PI * 2);
            state.ctx.fill();
        }
    });
}

function drawCurrentPath() {
    if (!state.currentPath) return;
    
    state.ctx.save();
    state.ctx.strokeStyle = state.currentPath.color;
    state.ctx.lineWidth = state.currentPath.lineWidth || 2;
    
    switch(state.currentPath.type) {
        case 'freehand':
            state.ctx.beginPath();
            state.currentPath.points.forEach((point, i) => {
                if (i === 0) state.ctx.moveTo(point[0], point[1]);
                else state.ctx.lineTo(point[0], point[1]);
            });
            state.ctx.stroke();
            break;
            
        case 'rectangle':
            state.ctx.strokeRect(state.currentPath.x, state.currentPath.y, 
                               state.currentPath.width, state.currentPath.height);
            break;
            
        case 'circle':
            state.ctx.beginPath();
            state.ctx.arc(state.currentPath.x, state.currentPath.y, 
                         state.currentPath.radius, 0, Math.PI * 2);
            state.ctx.stroke();
            break;
    }
    
    state.ctx.restore();
}

function applyDirection(direction) {
    const speed = state.speed / 100;
    const angleMap = {
        '↖': 225, '↑': 270, '↗': 315,
        '←': 180, '○': 0, '→': 0,
        '↙': 135, '↓': 90, '↘': 45
    };
    
    const angle = angleMap[direction] * Math.PI / 180;
    
    state.particles.forEach(particle => {
        particle.vx = Math.cos(angle) * speed * 2;
        particle.vy = Math.sin(angle) * speed * 2;
    });
}

function updateParticleMaterial() {
    if (!state.material) return;
    
    state.particles.forEach(particle => {
        particle.size = state.particleSize;
    });
    
    drawCanvas();
}

// ============================================
// DEMO & UTILITY FUNCTIONS
// ============================================
function loadDemoProject() {
    showNotification('📦 Loading demo project...', 'info');
    
    // Clear existing
    state.paths = [];
    state.particleCount = 100;
    state.speed = 50;
    state.motionType = 'flow';
    
    // Add demo paths
    CONFIG.DEMO_PATHS.forEach(path => {
        state.paths.push({...path});
    });
    
    // Update UI
    document.getElementById('speedSlider').value = state.speed;
    document.getElementById('speedValue').textContent = `${state.speed}%`;
    document.getElementById('countSlider').value = state.particleCount;
    document.getElementById('countValue').textContent = state.particleCount;
    
    updateMotionSelection();
    createDemoParticles();
    
    showNotification('✅ Demo project loaded!', 'success');
}

function getRandomColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#073B4C'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    const container = document.getElementById('notificationContainer');
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// ============================================
// TUTORIAL SYSTEM
// ============================================
function showTutorial() {
    document.getElementById('tutorialModal').classList.remove('hidden');
}

function hideTutorial() {
    document.getElementById('tutorialModal').classList.add('hidden');
}

// ============================================
// INITIALIZE APPLICATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    init();
    requestAnimationFrame(animate);
    
    // Add CSS for notifications if not exists
    if (!document.getElementById('notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            .notification {
                background: white;
                border-left: 4px solid #3498db;
                padding: 12px 16px;
                margin: 8px 0;
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                animation: slideIn 0.3s ease;
            }
            
            .notification.success { border-color: #2ecc71; }
            .notification.error { border-color: #e74c3c; }
            .notification.warning { border-color: #f39c12; }
            .notification.info { border-color: #3498db; }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #7f8c8d;
            }
            
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
});

// ============================================
// ERROR HANDLING
// ============================================
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showNotification(`❌ Error: ${e.message}`, 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('❌ An unexpected error occurred', 'error');
});
