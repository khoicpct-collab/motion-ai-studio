// ===== APP STATE =====
const appState = {
    isPlaying: false,
    currentTool: 'select',
    paths: [],
    particles: [],
    gifImage: null,
    materialImage: null,
    canvas: null,
    ctx: null,
    animationId: null,
    lastFrameTime: 0,
    fps: 0,
    frameCount: 0,
    currentPath: null,
    selectedDirection: null,
    settings: {
        speed: 0.5,
        particleCount: 150,
        particleSize: 15,
        swirl: 0.3
    }
};

// ===== DOM ELEMENTS =====
const elements = {
    playBtn: document.getElementById('playBtn'),
    exportBtn: document.getElementById('exportBtn'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    uploadGif: document.getElementById('uploadGif'),
    uploadMaterial: document.getElementById('uploadMaterial'),
    mainCanvas: document.getElementById('mainCanvas'),
    speedSlider: document.getElementById('speedSlider'),
    countSlider: document.getElementById('countSlider'),
    sizeSlider: document.getElementById('sizeSlider'),
    swirlSlider: document.getElementById('swirlSlider'),
    speedValue: document.getElementById('speedValue'),
    countValue: document.getElementById('countValue'),
    sizeValue: document.getElementById('sizeValue'),
    swirlValue: document.getElementById('swirlValue'),
    pathCount: document.getElementById('pathCount'),
    particleCount: document.getElementById('particleCount'),
    fpsCounter: document.getElementById('fpsCounter'),
    statusText: document.getElementById('statusText'),
    materialStatus: document.getElementById('materialStatus'),
    directionOverlay: document.getElementById('directionOverlay'),
    toolButtons: document.querySelectorAll('.tool-btn'),
    dirButtons: document.querySelectorAll('.dir-btn'),
    notification: document.getElementById('notification')
};

// ===== INITIALIZATION =====
function init() {
    console.log('🚀 Motion AI Studio Initializing...');
    
    // Setup canvas
    appState.canvas = elements.mainCanvas;
    appState.ctx = appState.canvas.getContext('2d');
    
    // Set canvas size
    const canvasContainer = appState.canvas.parentElement;
    const updateCanvasSize = () => {
        const containerWidth = canvasContainer.clientWidth;
        const aspectRatio = 1200 / 675;
        const height = containerWidth / aspectRatio;
        
        appState.canvas.width = containerWidth;
        appState.canvas.height = height;
        draw();
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    // Setup event listeners
    setupEventListeners();
    
    // Initial draw
    draw();
    
    showNotification('🎬 Ứng dụng đã sẵn sàng!', 'success');
    updateStatus('Sẵn sàng');
}

// ===== EVENT LISTENERS SETUP =====
function setupEventListeners() {
    // Play/Pause button
    elements.playBtn.addEventListener('click', togglePlay);
    
    // Export button
    elements.exportBtn.addEventListener('click', exportPNG);
    
    // Clear All button
    elements.clearAllBtn.addEventListener('click', clearAll);
    
    // File uploads
    elements.uploadGif.addEventListener('change', handleFileUpload);
    elements.uploadMaterial.addEventListener('change', handleFileUpload);
    
    // Tool selection
    elements.toolButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tool = btn.dataset.tool;
            selectTool(tool);
        });
    });
    
    // Direction selection
    elements.dirButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            selectDirection(btn);
        });
    });
    
    // Canvas interaction
    appState.canvas.addEventListener('click', handleCanvasClick);
    appState.canvas.addEventListener('dblclick', handleCanvasDoubleClick);
    
    // Settings sliders
    elements.speedSlider.addEventListener('input', updateSetting);
    elements.countSlider.addEventListener('input', updateSetting);
    elements.sizeSlider.addEventListener('input', updateSetting);
    elements.swirlSlider.addEventListener('input', updateSetting);
    
    // Initialize sliders
    updateSliderValues();
}

// ===== TOOL FUNCTIONS =====
function selectTool(tool) {
    appState.currentTool = tool;
    
    // Update UI
    elements.toolButtons.forEach(btn => {
        if (btn.dataset.tool === tool) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update canvas cursor
    switch(tool) {
        case 'select':
            appState.canvas.style.cursor = 'default';
            break;
        case 'pen':
            appState.canvas.style.cursor = 'crosshair';
            break;
        case 'edit':
            appState.canvas.style.cursor = 'move';
            break;
    }
    
    showNotification(`🛠️ Đã chọn công cụ: ${tool === 'pen' ? 'Pen Tool' : tool === 'edit' ? 'Edit Points' : 'Select'}`, 'info');
}

// ===== CANVAS INTERACTION =====
function handleCanvasClick(e) {
    const rect = appState.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (appState.currentTool === 'pen') {
        if (!appState.currentPath) {
            // Start new path
            appState.currentPath = {
                points: [{x, y}],
                direction: null,
                closed: false
            };
            showNotification('✏️ Bắt đầu vẽ vùng mới (Double-click để kết thúc)', 'info');
        } else {
            // Add point to current path
            appState.currentPath.points.push({x, y});
        }
        draw();
    }
}

function handleCanvasDoubleClick(e) {
    if (appState.currentTool === 'pen' && appState.currentPath) {
        // Finish drawing path
        appState.currentPath.closed = true;
        
        // Show direction selector
        elements.directionOverlay.style.display = 'block';
        showNotification('🎯 Chọn hướng chuyển động cho vùng vừa vẽ', 'info');
        
        draw();
    }
}

// ===== DIRECTION SELECTION =====
function selectDirection(button) {
    if (!appState.currentPath) return;
    
    // Update direction
    const vx = parseFloat(button.dataset.vx);
    const vy = parseFloat(button.dataset.vy);
    const isScroll = button.dataset.scroll === 'true';
    
    appState.currentPath.direction = { vx, vy, isScroll };
    
    // Add path to collection
    appState.paths.push(appState.currentPath);
    appState.currentPath = null;
    
    // Hide direction overlay
    elements.directionOverlay.style.display = 'none';
    
    // Generate particles for this path
    generateParticles();
    
    updatePathCount();
    showNotification(`✅ Đã thêm vùng với hướng: ${button.dataset.dir}`, 'success');
}

// ===== PARTICLE SYSTEM =====
function generateParticles() {
    if (!appState.materialImage || appState.paths.length === 0) return;
    
    const particleCount = Math.floor(appState.settings.particleCount);
    const path = appState.paths[appState.paths.length - 1];
    
    if (path.points.length < 3) return;
    
    // Simple triangulation for point distribution
    for (let i = 0; i < particleCount; i++) {
        const particle = {
            x: 0,
            y: 0,
            vx: path.direction.vx,
            vy: path.direction.vy,
            size: Math.random() * appState.settings.particleSize + 5,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            pathIndex: appState.paths.length - 1,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            life: 1
        };
        
        // Random position within path (simplified)
        const randomPoint = path.points[Math.floor(Math.random() * path.points.length)];
        particle.x = randomPoint.x + (Math.random() - 0.5) * 50;
        particle.y = randomPoint.y + (Math.random() - 0.5) * 50;
        
        appState.particles.push(particle);
    }
    
    updateParticleCount();
}

function updateParticles(deltaTime) {
    if (!appState.isPlaying) return;
    
    const speed = appState.settings.speed * 2;
    
    appState.particles.forEach(particle => {
        // Move particle
        particle.x += particle.vx * speed;
        particle.y += particle.vy * speed;
        
        // Apply swirl
        if (appState.settings.swirl > 0) {
            const centerX = appState.canvas.width / 2;
            const centerY = appState.canvas.height / 2;
            const dx = particle.x - centerX;
            const dy = particle.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            const swirlStrength = appState.settings.swirl * 0.01;
            const newAngle = angle + swirlStrength;
            
            particle.x = centerX + Math.cos(newAngle) * distance;
            particle.y = centerY + Math.sin(newAngle) * distance;
        }
        
        // Rotation
        particle.rotation += particle.rotationSpeed;
        
        // Boundary check (wrap around)
        if (particle.x < -50) particle.x = appState.canvas.width + 50;
        if (particle.x > appState.canvas.width + 50) particle.x = -50;
        if (particle.y < -50) particle.y = appState.canvas.height + 50;
        if (particle.y > appState.canvas.height + 50) particle.y = -50;
    });
}

// ===== DRAWING FUNCTIONS =====
function draw() {
    const ctx = appState.ctx;
    const canvas = appState.canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw GIF background if exists
    if (appState.gifImage) {
        ctx.drawImage(appState.gifImage, 0, 0, canvas.width, canvas.height);
    } else {
        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(1, '#1e293b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        drawGrid(ctx, canvas);
    }
    
    // Draw all paths
    appState.paths.forEach((path, index) => {
        drawPath(ctx, path, index);
    });
    
    // Draw current path being drawn
    if (appState.currentPath) {
        drawPath(ctx, appState.currentPath, -1, true);
    }
    
    // Draw particles
    appState.particles.forEach(particle => {
        drawParticle(ctx, particle);
    });
    
    // Draw info overlay
    drawInfoOverlay(ctx);
}

function drawGrid(ctx, canvas) {
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    
    // Vertical lines
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawPath(ctx, path, index, isCurrent = false) {
    if (path.points.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(path.points[0].x, path.points[0].y);
    
    for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
    }
    
    if (path.closed) {
        ctx.closePath();
    }
    
    // Style
    if (isCurrent) {
        ctx.strokeStyle = '#60a5fa';
        ctx.fillStyle = 'rgba(96, 165, 250, 0.1)';
        ctx.lineWidth = 3;
    } else {
        ctx.strokeStyle = '#10b981';
        ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
        ctx.lineWidth = 2;
    }
    
    ctx.fill();
    ctx.stroke();
    
    // Draw direction arrow
    if (path.direction && !isCurrent) {
        const center = getPathCenter(path);
        drawDirectionArrow(ctx, center.x, center.y, path.direction);
    }
    
    // Draw point markers
    path.points.forEach((point, i) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = isCurrent ? '#3b82f6' : '#10b981';
        ctx.fill();
        
        if (isCurrent) {
            ctx.fillStyle = 'white';
            ctx.font = '12px Inter';
            ctx.fillText(i + 1, point.x + 8, point.y + 4);
        }
    });
}

function drawDirectionArrow(ctx, x, y, direction) {
    const length = 40;
    const headLength = 15;
    const angle = Math.atan2(direction.vy, direction.vx);
    
    // Draw arrow line
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    ctx.strokeStyle = direction.isScroll ? '#f59e0b' : '#ef4444';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw arrow head
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    ctx.lineTo(
        x + Math.cos(angle - Math.PI / 6) * headLength,
        y + Math.sin(angle - Math.PI / 6) * headLength
    );
    ctx.lineTo(
        x + Math.cos(angle + Math.PI / 6) * headLength,
        y + Math.sin(angle + Math.PI / 6) * headLength
    );
    ctx.closePath();
    ctx.fillStyle = direction.isScroll ? '#f59e0b' : '#ef4444';
    ctx.fill();
}

function drawParticle(ctx, particle) {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    
    if (appState.materialImage) {
        // Draw material image
        ctx.drawImage(
            appState.materialImage,
            -particle.size / 2,
            -particle.size / 2,
            particle.size,
            particle.size
        );
    } else {
        // Draw colored circle
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Add highlight
        ctx.beginPath();
        ctx.arc(-particle.size / 4, -particle.size / 4, particle.size / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
    }
    
    ctx.restore();
}

function drawInfoOverlay(ctx) {
    const info = [
        `Vùng: ${appState.paths.length}`,
        `Hạt: ${appState.particles.length}`,
        `Tool: ${appState.currentTool}`,
        `FPS: ${Math.round(appState.fps)}`
    ];
    
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(10, 10, 150, 80);
    
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px Inter';
    info.forEach((text, i) => {
        ctx.fillText(text, 20, 35 + i * 15);
    });
}

function getPathCenter(path) {
    let sumX = 0, sumY = 0;
    path.points.forEach(point => {
        sumX += point.x;
        sumY += point.y;
    });
    return {
        x: sumX / path.points.length,
        y: sumY / path.points.length
    };
}

// ===== ANIMATION LOOP =====
function animationLoop(currentTime) {
    // Calculate delta time
    const deltaTime = currentTime - appState.lastFrameTime;
    appState.lastFrameTime = currentTime;
    
    // Calculate FPS
    appState.frameCount++;
    if (deltaTime > 0) {
        appState.fps = 1000 / deltaTime;
    }
    
    // Update particles
    updateParticles(deltaTime);
    
    // Draw everything
    draw();
    
    // Update FPS counter
    elements.fpsCounter.textContent = Math.round(appState.fps);
    
    // Continue animation loop
    if (appState.isPlaying) {
        appState.animationId = requestAnimationFrame(animationLoop);
    }
}

// ===== CONTROL FUNCTIONS =====
function togglePlay() {
    appState.isPlaying = !appState.isPlaying;
    
    if (appState.isPlaying) {
        elements.playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        elements.playBtn.classList.remove('btn-primary');
        elements.playBtn.classList.add('btn-danger');
        
        appState.lastFrameTime = performance.now();
        appState.animationId = requestAnimationFrame(animationLoop);
        
        updateStatus('Đang chạy');
        showNotification('▶️ Bắt đầu mô phỏng', 'success');
    } else {
        elements.playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
        elements.playBtn.classList.remove('btn-danger');
        elements.playBtn.classList.add('btn-primary');
        
        if (appState.animationId) {
            cancelAnimationFrame(appState.animationId);
        }
        
        updateStatus('Đã dừng');
        showNotification('⏸️ Dừng mô phỏng', 'warning');
    }
}

function exportPNG() {
    if (appState.paths.length === 0 && appState.particles.length === 0) {
        showNotification('⚠️ Chưa có nội dung để xuất!', 'warning');
        return;
    }
    
    const link = document.createElement('a');
    link.download = `motion-simulation-${Date.now()}.png`;
    link.href = appState.canvas.toDataURL('image/png');
    link.click();
    
    showNotification('✅ Đã xuất hình ảnh PNG', 'success');
}

function clearAll() {
    if (!confirm('Bạn có chắc chắn muốn xóa tất cả?')) return;
    
    appState.paths = [];
    appState.particles = [];
    appState.currentPath = null;
    appState.isPlaying = false;
    
    // Reset play button
    elements.playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
    elements.playBtn.classList.remove('btn-danger');
    elements.playBtn.classList.add('btn-primary');
    
    if (appState.animationId) {
        cancelAnimationFrame(appState.animationId);
    }
    
    updatePathCount();
    updateParticleCount();
    draw();
    
    showNotification('🗑️ Đã xóa tất cả nội dung', 'info');
    updateStatus('Đã xóa');
}

// ===== FILE UPLOAD HANDLING =====
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    const isGif = e.target.id === 'uploadGif';
    
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            if (isGif) {
                appState.gifImage = img;
                showNotification('✅ Đã tải GIF nền thành công', 'success');
            } else {
                appState.materialImage = img;
                elements.materialStatus.textContent = 'Đã tải';
                elements.materialStatus.style.color = '#10b981';
                showNotification('✅ Đã tải hình ảnh vật liệu', 'success');
            }
            draw();
        };
        img.src = event.target.result;
    };
    
    reader.readAsDataURL(file);
}

// ===== SETTINGS UPDATES =====
function updateSetting(e) {
    const slider = e.target;
    const value = parseFloat(slider.value);
    
    switch(slider.id) {
        case 'speedSlider':
            appState.settings.speed = value / 100;
            elements.speedValue.textContent = `${value}%`;
            break;
        case 'countSlider':
            appState.settings.particleCount = value;
            elements.countValue.textContent = value;
            break;
        case 'sizeSlider':
            appState.settings.particleSize = value;
            elements.sizeValue.textContent = `${value}px`;
            break;
        case 'swirlSlider':
            appState.settings.swirl = value / 100;
            elements.swirlValue.textContent = `${value}%`;
            break;
    }
    
    // Regenerate particles if playing
    if (appState.isPlaying && slider.id === 'countSlider') {
        appState.particles = [];
        generateParticles();
        updateParticleCount();
    }
}

function updateSliderValues() {
    elements.speedValue.textContent = `${elements.speedSlider.value}%`;
    elements.countValue.textContent = elements.countSlider.value;
    elements.sizeValue.textContent = `${elements.sizeSlider.value}px`;
    elements.swirlValue.textContent = `${elements.swirlSlider.value}%`;
}

// ===== UI UPDATES =====
function updatePathCount() {
    elements.pathCount.textContent = appState.paths.length;
}

function updateParticleCount() {
    elements.particleCount.textContent = appState.particles.length;
}

function updateStatus(text) {
    elements.statusText.textContent = text;
    
    // Color coding
    const colors = {
        'Sẵn sàng': '#10b981',
        'Đang chạy': '#3b82f6',
        'Đã dừng': '#f59e0b',
        'Đã xóa': '#ef4444'
    };
    
    elements.statusText.style.color = colors[text] || '#e2e8f0';
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    const notification = elements.notification;
    
    // Set message and type
    notification.textContent = message;
    
    // Set color based on type
    const colors = {
        success: 'linear-gradient(135deg, #10b981, #059669)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
        info: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    // Show notification
    notification.classList.add('show');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ===== INITIALIZE APP =====
// Wait for DOM to load
document.addEventListener('DOMContentLoaded', init);

// Add some sample data for demo
window.addEventListener('load', () => {
    setTimeout(() => {
        if (appState.paths.length === 0) {
            showNotification('👆 Hãy bắt đầu bằng cách upload GIF và Material, sau đó vẽ vùng và chọn hướng!', 'info');
        }
    }, 1000);
});
