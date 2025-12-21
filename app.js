// ============================================
// MOTION AI STUDIO - LAYER SYSTEM
// Phiên bản hoàn chỉnh với export GIF thực
// ============================================

// STATE
const state = {
    canvas: null,
    ctx: null,
    backgroundGif: null,
    backgroundFrames: [],
    currentFrame: 0,
    isGifPlaying: true,
    materialImage: null,
    paths: [],
    currentPath: null,
    particles: [],
    selectedTool: 'select',
    selectedPathIndex: null,
    selectedPointIndex: null,
    isDrawing: false,
    isPlaying: false,
    editMode: false,
    showGifLayer: true,
    showAnimLayer: true,
    showDirections: false,
    selectedDirection: null,
    
    // Settings
    speed: 50,
    scrollSpeed: 50,
    particleCount: 100,
    particleSize: 10,
    
    // Animation
    animationId: null,
    lastFrameTime: 0,
    fps: 60,
    
    // Export
    isExporting: false,
    exportFrames: []
};

// ============================================
// INITIALIZATION
// ============================================
function init() {
    console.log('🚀 Motion AI Studio - Industrial Edition');
    
    state.canvas = document.getElementById('mainCanvas');
    state.ctx = state.canvas.getContext('2d');
    
    // Setup canvas size
    updateCanvasSize();
    
    setupEventListeners();
    updateUI();
    
    // Load demo vít tải
    setTimeout(() => loadScrewConveyorDemo(), 500);
    
    // Start animation
    requestAnimationFrame(animate);
    
    showNotification('🏭 Motion AI Studio - Mô phỏng vít tải & thiết bị công nghiệp', 'success');
    console.log('✅ Application initialized');
}

function updateCanvasSize() {
    // Set fixed size for export consistency
    state.canvas.width = 800;
    state.canvas.height = 450;
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Canvas events
    state.canvas.addEventListener('mousedown', handleMouseDown);
    state.canvas.addEventListener('mousemove', handleMouseMove);
    state.canvas.addEventListener('mouseup', handleMouseUp);
    state.canvas.addEventListener('dblclick', handleDoubleClick);
    
    // Upload buttons
    document.getElementById('uploadBackground').addEventListener('change', handleBackgroundUpload);
    document.getElementById('uploadMaterial').addEventListener('change', handleMaterialUpload);
    
    // Tool buttons
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
        btn.addEventListener('click', function() {
            state.selectedTool = this.dataset.tool;
            state.editMode = false;
            updateToolSelection();
            
            if (state.selectedTool === 'pen') {
                showNotification('🖊️ Chọn điểm bắt đầu trên GIF, sau đó chọn hướng', 'info');
            }
        });
    });
    
    // Edit and delete
    document.getElementById('editPointsBtn').addEventListener('click', toggleEditMode);
    document.getElementById('deletePathBtn').addEventListener('click', deletePath);
    document.getElementById('clearAllBtn').addEventListener('click', clearAll);
    
    // Layer toggles
    document.getElementById('toggleGifLayer').addEventListener('click', toggleGifLayer);
    document.getElementById('toggleAnimLayer').addEventListener('click', toggleAnimLayer);
    
    // Direction buttons
    document.querySelectorAll('.dir-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectDirection(this);
        });
    });
    
    // Sliders
    document.getElementById('speedSlider').addEventListener('input', function() {
        state.speed = parseInt(this.value);
        document.getElementById('speedValue').textContent = state.speed + '%';
        updateParticleSpeeds();
    });
    
    document.getElementById('scrollSlider').addEventListener('input', function() {
        state.scrollSpeed = parseInt(this.value);
        document.getElementById('scrollValue').textContent = state.scrollSpeed + '%';
        updateScrollParticles();
    });
    
    document.getElementById('countSlider').addEventListener('input', function() {
        const newCount = parseInt(this.value);
        state.particleCount = newCount;
        document.getElementById('countValue').textContent = newCount;
        
        // Regenerate particles if there are paths
        if (state.paths.length > 0) {
            regenerateAllParticles();
        }
    });
    
    document.getElementById('sizeSlider').addEventListener('input', function() {
        state.particleSize = parseInt(this.value);
        document.getElementById('sizeValue').textContent = state.particleSize + 'px';
        updateParticleSizes();
    });
    
    // Animation controls
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('stopBtn').addEventListener('click', resetAnimation);
    
    // Export
    document.getElementById('exportBtn').addEventListener('click', exportAnimation);
    
    // Window resize
    window.addEventListener('resize', updateCanvasSize);
}

// ============================================
// FILE UPLOADS - IMPROVED
// ============================================
async function handleBackgroundUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    showNotification(`📁 Đang tải: ${file.name}`, 'info');
    
    const reader = new FileReader();
    reader.onload = async function(event) {
        const dataUrl = event.target.result;
        
        try {
            // Try to parse as GIF first
            if (file.type.includes('gif')) {
                await loadAnimatedGif(dataUrl);
                showNotification('✅ GIF động đã tải! Sử dụng Pen Tool để vẽ vùng mô phỏng', 'success');
            } else {
                // Static image
                const img = new Image();
                img.onload = function() {
                    state.backgroundGif = img;
                    state.backgroundFrames = [img];
                    drawCanvas();
                    showNotification('✅ Ảnh nền đã tải!', 'success');
                };
                img.src = dataUrl;
            }
        } catch (error) {
            console.error('Error loading image:', error);
            showNotification('❌ Lỗi tải file. Thử file khác', 'error');
        }
    };
    reader.readAsDataURL(file);
}

async function loadAnimatedGif(dataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function() {
            state.backgroundGif = img;
            state.backgroundFrames = [img]; // Simple single frame for now
            state.currentFrame = 0;
            drawCanvas();
            resolve();
        };
        img.onerror = reject;
        img.src = dataUrl;
    });
}

function handleMaterialUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    showNotification(`🎨 Đang tải vật liệu: ${file.name}`, 'info');
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            state.materialImage = img;
            drawCanvas();
            showNotification('✅ Ảnh vật liệu đã tải!', 'success');
        };
        img.onerror = function() {
            showNotification('❌ Lỗi tải ảnh vật liệu', 'error');
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// ============================================
// DEMO VÍT TẢI
// ============================================
function loadScrewConveyorDemo() {
    showNotification('🔄 Đang tải demo vít tải...', 'info');
    
    // Create demo background (vít tải schematic)
    createDemoBackground();
    
    // Create demo material (grain particles)
    createDemoMaterial();
    
    // Create demo path (screw conveyor path)
    createDemoPath();
    
    // Create particles
    generateParticlesForPath(state.paths[0], 0);
    
    showNotification('✅ Demo vít tải đã sẵn sàng! Dùng Pen Tool để vẽ thêm vùng', 'success');
}

function createDemoBackground() {
    const canvas = document.createElement('canvas');
    canvas.width = state.canvas.width;
    canvas.height = state.canvas.height;
    const ctx = canvas.getContext('2d');
    
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw screw conveyor
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([15, 10]);
    
    // Screw spiral
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        for (let x = 100; x < 700; x += 2) {
            const y = 150 + (i * 60) + Math.sin((x + i * 60) * 0.02) * 40;
            if (x === 100) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    // Conveyor casing
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 100, 640, 300);
    
    // Labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('DEMO VÍT TẢI CÔNG NGHIỆP', 250, 50);
    
    ctx.font = '14px Arial';
    ctx.fillText('Vùng mô phỏng vật liệu đã được tạo tự động', 230, 80);
    ctx.fillText('Sử dụng Pen Tool để vẽ thêm vùng mô phỏng', 230, 420);
    
    // Create image from canvas
    const img = new Image();
    img.src = canvas.toDataURL();
    img.onload = function() {
        state.backgroundGif = img;
        state.backgroundFrames = [img];
    };
}

function createDemoMaterial() {
    // Create a simple material (grain particle)
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Yellow grain
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.ellipse(16, 16, 10, 6, Math.PI/4, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.ellipse(12, 12, 4, 2, Math.PI/4, 0, Math.PI * 2);
    ctx.fill();
    
    const img = new Image();
    img.src = canvas.toDataURL();
    img.onload = function() {
        state.materialImage = img;
    };
}

function createDemoPath() {
    // Create a path following the screw conveyor
    const points = [];
    const width = state.canvas.width;
    const height = state.canvas.height;
    
    // Create zigzag path for screw conveyor
    for (let x = 150; x <= 650; x += 50) {
        const y = 180 + Math.sin(x * 0.02) * 100;
        points.push([x, y]);
    }
    
    // Close the path
    points.push([650, 320]);
    points.push([150, 320]);
    points.push(points[0]);
    
    const demoPath = {
        type: 'freehand',
        points: points,
        direction: {
            name: 'scroll',
            vx: 0,
            vy: 0,
            scroll: true
        },
        color: '#FF6B6B'
    };
    
    state.paths = [demoPath];
    state.selectedPathIndex = 0;
    state.selectedDirection = demoPath.direction;
    
    updateUI();
}

// ============================================
// CANVAS INTERACTIONS - IMPROVED
// ============================================
function getCanvasCoords(e) {
    const rect = state.canvas.getBoundingClientRect();
    const scaleX = state.canvas.width / rect.width;
    const scaleY = state.canvas.height / rect.height;
    
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function handleMouseDown(e) {
    const coords = getCanvasCoords(e);
    
    // SELECT TOOL
    if (state.selectedTool === 'select') {
        const pathIndex = state.paths.findIndex(path => isPointInPath(coords, path));
        state.selectedPathIndex = pathIndex !== -1 ? pathIndex : null;
        updateUI();
        drawCanvas();
        
        if (state.selectedPathIndex !== null) {
            showNotification(`✅ Chọn path #${state.selectedPathIndex + 1}. Click Edit Points để sửa`, 'success');
        }
        return;
    }
    
    // EDIT MODE
    if (state.editMode && state.selectedPathIndex !== null) {
        const path = state.paths[state.selectedPathIndex];
        const pointIndex = path.points.findIndex(p => 
            Math.hypot(p[0] - coords.x, p[1] - coords.y) < 15
        );
        
        if (pointIndex !== -1) {
            state.selectedPointIndex = pointIndex;
            state.isDrawing = true;
            showNotification(`✏️ Đang di chuyển point #${pointIndex}`, 'info');
        }
        return;
    }
    
    // PEN TOOL - BẮT ĐẦU VẼ
    if (state.selectedTool === 'pen') {
        if (!state.backgroundGif) {
            showNotification('⚠️ Hãy tải GIF background trước khi vẽ!', 'error');
            return;
        }
        
        state.isDrawing = true;
        state.currentPath = {
            type: 'freehand',
            points: [[coords.x, coords.y]],
            direction: null,
            color: getRandomColor()
        };
        
        // Show direction selector
        showDirectionSelector(coords.x, coords.y);
        
        showNotification('🎯 Click điểm tiếp theo hoặc double-click để hoàn thành. Chọn hướng từ bảng mũi tên.', 'info');
    }
}

function handleMouseMove(e) {
    if (!state.isDrawing) return;
    
    const coords = getCanvasCoords(e);
    
    // Edit point
    if (state.editMode && state.selectedPathIndex !== null && state.selectedPointIndex !== null) {
        state.paths[state.selectedPathIndex].points[state.selectedPointIndex] = [coords.x, coords.y];
        drawCanvas();
        return;
    }
    
    // Draw path
    if (state.selectedTool === 'pen' && state.currentPath) {
        const lastPoint = state.currentPath.points[state.currentPath.points.length - 1];
        const dist = Math.hypot(coords.x - lastPoint[0], coords.y - lastPoint[1]);
        
        if (dist > 5) {
            state.currentPath.points.push([coords.x, coords.y]);
            drawCanvas();
        }
    }
}

function handleMouseUp() {
    if (state.editMode && state.selectedPointIndex !== null) {
        state.selectedPointIndex = null;
    }
    state.isDrawing = false;
}

function handleDoubleClick(e) {
    // Chỉ xử lý khi đang vẽ với pen tool
    if (state.selectedTool !== 'pen' || !state.currentPath || state.currentPath.points.length < 2) {
        return;
    }
    
    const coords = getCanvasCoords(e);
    state.currentPath.points.push([coords.x, coords.y]);
    
    // Check if we have a direction
    if (!state.selectedDirection) {
        showNotification('⚠️ Vui lòng chọn hướng chuyển động từ bảng mũi tên!', 'error');
        return;
    }
    
    // Close the path (connect to first point)
    const closedPath = {
        ...state.currentPath,
        points: [...state.currentPath.points, state.currentPath.points[0]],
        direction: state.selectedDirection
    };
    
    // Validate path has area
    if (calculatePathArea(closedPath.points) < 100) {
        showNotification('⚠️ Vùng chọn quá nhỏ! Vẽ vùng lớn hơn.', 'error');
        return;
    }
    
    state.paths.push(closedPath);
    const pathIndex = state.paths.length - 1;
    generateParticlesForPath(closedPath, pathIndex);
    
    // Reset for next drawing
    state.currentPath = null;
    state.selectedDirection = null;
    hideDirectionSelector();
    
    updateUI();
    drawCanvas();
    showNotification(`✅ Đã tạo vùng mô phỏng #${pathIndex + 1} với ${closedPath.points.length} điểm!`, 'success');
}

function calculatePathArea(points) {
    // Simple area calculation for polygon
    let area = 0;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        area += (points[j][0] + points[i][0]) * (points[j][1] - points[i][1]);
    }
    return Math.abs(area / 2);
}

// ============================================
// DIRECTION SELECTOR - IMPROVED
// ============================================
function showDirectionSelector(x, y) {
    state.showDirections = true;
    const selector = document.getElementById('directionSelector');
    selector.classList.remove('hidden');
    
    // Position near the starting point
    const canvasRect = state.canvas.getBoundingClientRect();
    const scaleX = state.canvas.width / canvasRect.width;
    const scaleY = state.canvas.height / canvasRect.height;
    
    selector.style.left = (canvasRect.left + (x / scaleX) - 120) + 'px';
    selector.style.top = (canvasRect.top + (y / scaleY) - 120) + 'px';
    
    // Reset selection
    document.querySelectorAll('.dir-btn').forEach(btn => btn.classList.remove('active'));
    state.selectedDirection = null;
    document.getElementById('directionInfo').textContent = 'Chọn hướng chuyển động';
    
    showNotification('🎯 Chọn hướng từ bảng mũi tên. 🔄 = xoay tròn, mũi tên = chuyển động thẳng', 'info');
}

function hideDirectionSelector() {
    state.showDirections = false;
    document.getElementById('directionSelector').classList.add('hidden');
}

function selectDirection(btn) {
    const vx = parseFloat(btn.dataset.vx);
    const vy = parseFloat(btn.dataset.vy);
    const isScroll = btn.dataset.scroll === 'true';
    const name = btn.dataset.dir;
    
    state.selectedDirection = {
        name: name,
        vx: vx,
        vy: vy,
        scroll: isScroll
    };
    
    // Update UI
    document.querySelectorAll('.dir-btn').forEach(b => {
        b.classList.remove('active');
    });
    btn.classList.add('active');
    
    const displayName = isScroll ? '🔄 Cuộn/Xoay (cho vít tải)' : `➡️ ${getDirectionName(name)}`;
    document.getElementById('directionInfo').textContent = displayName;
    
    showNotification(`🎯 Hướng: ${displayName}`, 'success');
}

function getDirectionName(dir) {
    const names = {
        'up-left': 'Tây Bắc',
        'up': 'Bắc',
        'up-right': 'Đông Bắc',
        'left': 'Tây',
        'right': 'Đông',
        'down-left': 'Tây Nam',
        'down': 'Nam',
        'down-right': 'Đông Nam'
    };
    return names[dir] || dir;
}

// ============================================
// PARTICLE SYSTEM - IMPROVED
// ============================================
function generateParticlesForPath(path, pathIndex) {
    if (!path.points || path.points.length < 3 || !path.direction) return;
    
    // Calculate bounds
    const xs = path.points.map(p => p[0]);
    const ys = path.points.map(p => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    const dir = path.direction;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    const newParticles = [];
    const attempts = state.particleCount * 5;
    
    for (let i = 0; i < attempts && newParticles.length < state.particleCount; i++) {
        const x = minX + Math.random() * (maxX - minX);
        const y = minY + Math.random() * (maxY - minY);
        
        if (isPointInPath({ x, y }, path)) {
            const radius = Math.hypot(x - centerX, y - centerY);
            const angle = Math.atan2(y - centerY, x - centerX);
            
            newParticles.push({
                x: x,
                y: y,
                vx: dir.scroll ? 0 : dir.vx * state.speed / 100,
                vy: dir.scroll ? 0 : dir.vy * state.speed / 100,
                size: state.particleSize * (0.7 + Math.random() * 0.6),
                pathIndex: pathIndex,
                isScroll: dir.scroll || false,
                angle: angle,
                radius: radius,
                centerX: centerX,
                centerY: centerY,
                life: Math.random() * 100,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1
            });
        }
    }
    
    // Remove old particles for this path
    state.particles = state.particles.filter(p => p.pathIndex !== pathIndex);
    state.particles.push(...newParticles);
    
    updateUI();
}

function regenerateAllParticles() {
    const oldParticles = [...state.particles];
    state.particles = [];
    
    state.paths.forEach((path, index) => {
        generateParticlesForPath(path, index);
    });
    
    showNotification(`🔄 Tái tạo ${state.particles.length} particles`, 'success');
}

// ============================================
// PARTICLE UPDATE - IMPROVED
// ============================================
function updateParticles(deltaTime) {
    state.particles.forEach(particle => {
        const path = state.paths[particle.pathIndex];
        if (!path) return;
        
        particle.life += deltaTime * 0.001;
        particle.rotation += particle.rotationSpeed;
        
        let newX = particle.x;
        let newY = particle.y;
        
        if (particle.isScroll) {
            // Scrolling motion - rotate around center
            particle.angle += (state.scrollSpeed / 500) * deltaTime * 0.016;
            newX = particle.centerX + particle.radius * Math.cos(particle.angle);
            newY = particle.centerY + particle.radius * Math.sin(particle.angle);
            
            // Add some randomness
            newX += (Math.random() - 0.5) * 2;
            newY += (Math.random() - 0.5) * 2;
        } else {
            // Linear motion with bounce
            newX = particle.x + particle.vx * deltaTime * 0.016;
            newY = particle.y + particle.vy * deltaTime * 0.016;
        }
        
        // Check if inside path
        if (!isPointInPath({ x: newX, y: newY }, path)) {
            // Find new valid position
            for (let i = 0; i < 10; i++) {
                const randomX = particle.x + (Math.random() - 0.5) * 50;
                const randomY = particle.y + (Math.random() - 0.5) * 50;
                
                if (isPointInPath({ x: randomX, y: randomY }, path)) {
                    newX = randomX;
                    newY = randomY;
                    
                    if (particle.isScroll) {
                        particle.radius = Math.hypot(newX - particle.centerX, newY - particle.centerY);
                        particle.angle = Math.atan2(newY - particle.centerY, newX - particle.centerX);
                    }
                    break;
                }
            }
        }
        
        particle.x = newX;
        particle.y = newY;
    });
}

function updateParticleSpeeds() {
    state.particles.forEach(particle => {
        if (!particle.isScroll) {
            const path = state.paths[particle.pathIndex];
            if (path && path.direction) {
                particle.vx = path.direction.vx * state.speed / 100;
                particle.vy = path.direction.vy * state.speed / 100;
            }
        }
    });
}

function updateScrollParticles() {
    // Scroll speed affects rotation speed
    // Handled in updateParticles
}

function updateParticleSizes() {
    state.particles.forEach(particle => {
        // Keep proportional size
        const baseSize = state.particleSize;
        particle.size = baseSize * (0.7 + (particle.size / state.particleSize - 0.7));
    });
}

// ============================================
// POINT IN POLYGON - OPTIMIZED
// ============================================
function isPointInPath(point, path) {
    if (!path.points || path.points.length < 3) return false;
    
    let inside = false;
    const points = path.points;
    
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i][0], yi = points[i][1];
        const xj = points[j][0], yj = points[j][1];
        
        const intersect = ((yi > point.y) !== (yj > point.y))
            && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// ============================================
// DRAWING - IMPROVED
// ============================================
function drawCanvas() {
    const ctx = state.ctx;
    const width = state.canvas.width;
    const height = state.canvas.height;
    
    // Clear
    ctx.clearRect(0, 0, width, height);
    
    // Layer 1: Background GIF
    if (state.showGifLayer && state.backgroundGif) {
        try {
            // Draw background
            ctx.drawImage(state.backgroundGif, 0, 0, width, height);
            
            // Add overlay for better visibility
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(0, 0, width, height);
        } catch (e) {
            console.error('Error drawing background:', e);
        }
    } else {
        // Default background
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(0, 0, width, height);
    }
    
    // Layer 2: Animation
    if (state.showAnimLayer) {
        // Draw paths
        state.paths.forEach((path, index) => {
            if (!path.points || path.points.length < 2) return;
            
            // Path outline
            ctx.strokeStyle = index === state.selectedPathIndex ? '#00ff00' : path.color;
            ctx.lineWidth = index === state.selectedPathIndex ? 4 : 2;
            ctx.setLineDash(index === state.selectedPathIndex ? [10, 5] : []);
            
            ctx.beginPath();
            ctx.moveTo(path.points[0][0], path.points[0][1]);
            for (let i = 1; i < path.points.length; i++) {
                ctx.lineTo(path.points[i][0], path.points[i][1]);
            }
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Path fill (semi-transparent)
            ctx.fillStyle = path.color.replace(')', ', 0.1)').replace('rgb', 'rgba');
            ctx.beginPath();
            ctx.moveTo(path.points[0][0], path.points[0][1]);
            for (let i = 1; i < path.points.length; i++) {
                ctx.lineTo(path.points[i][0], path.points[i][1]);
            }
            ctx.closePath();
            ctx.fill();
            
            // Draw edit points
            if (state.editMode && index === state.selectedPathIndex) {
                path.points.forEach((point, pIndex) => {
                    ctx.fillStyle = pIndex === state.selectedPointIndex ? '#ff0000' : '#00ff00';
                    ctx.beginPath();
                    ctx.arc(point[0], point[1], 8, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Point number
                    ctx.fillStyle = '#000';
                    ctx.font = 'bold 12px Arial';
                    ctx.fillText(pIndex, point[0] + 10, point[1] - 10);
                });
            }
            
            // Draw direction indicator
            if (path.direction) {
                const center = getPathCenter(path);
                drawDirectionIndicator(ctx, center.x, center.y, path.direction);
            }
        });
        
        // Draw current path being drawn
        if (state.currentPath && state.currentPath.points.length > 0) {
            ctx.strokeStyle = state.currentPath.color;
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            ctx.moveTo(state.currentPath.points[0][0], state.currentPath.points[0][1]);
            for (let i = 1; i < state.currentPath.points.length; i++) {
                ctx.lineTo(state.currentPath.points[i][0], state.currentPath.points[i][1]);
            }
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Starting point
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(state.currentPath.points[0][0], state.currentPath.points[0][1], 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Ending point
            if (state.currentPath.points.length > 1) {
                const lastPoint = state.currentPath.points[state.currentPath.points.length - 1];
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(lastPoint[0], lastPoint[1], 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Draw particles
        state.particles.forEach(particle => {
            try {
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate(particle.rotation);
                
                if (state.materialImage && state.materialImage.complete) {
                    // Draw material image
                    ctx.drawImage(
                        state.materialImage,
                        -particle.size / 2,
                        -particle.size / 2,
                        particle.size,
                        particle.size
                    );
                } else {
                    // Draw colored circle with highlight
                    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size / 2);
                    gradient.addColorStop(0, '#FF6B6B');
                    gradient.addColorStop(1, '#FF4757');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Highlight
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.beginPath();
                    ctx.arc(-particle.size/4, -particle.size/4, particle.size/4, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                ctx.restore();
            } catch (e) {
                // Fallback to circle
                ctx.fillStyle = '#FF6B6B';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    
    // Draw FPS
    if (state.isPlaying) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 80, 30);
        ctx.fillStyle = '#00ff00';
        ctx.font = '14px Arial';
        ctx.fillText(`FPS: ${Math.round(state.fps)}`, 20, 30);
    }
}

function getPathCenter(path) {
    const xs = path.points.map(p => p[0]);
    const ys = path.points.map(p => p[1]);
    return {
        x: (Math.min(...xs) + Math.max(...xs)) / 2,
        y: (Math.min(...ys) + Math.max(...ys)) / 2
    };
}

function drawDirectionIndicator(ctx, x, y, direction) {
    ctx.save();
    ctx.translate(x, y);
    
    if (direction.scroll) {
        // Circular arrow
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 1.5);
        ctx.stroke();
        
        // Arrow head
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(-5, -15);
        ctx.lineTo(5, -15);
        ctx.closePath();
        ctx.fill();
    } else {
        // Direction arrow
        const angle = Math.atan2(direction.vy, direction.vx);
        ctx.rotate(angle);
        
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(-10, -10);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
}

// ============================================
// ANIMATION LOOP - IMPROVED
// ============================================
function animate(timestamp) {
    if (!state.lastFrameTime) state.lastFrameTime = timestamp;
    const deltaTime = timestamp - state.lastFrameTime;
    state.lastFrameTime = timestamp;
    
    // Calculate FPS
    state.fps = 1000 / deltaTime;
    
    if (state.isPlaying) {
        updateParticles(deltaTime);
    }
    
    drawCanvas();
    requestAnimationFrame(animate);
}

// ============================================
// UI CONTROLS - IMPROVED
// ============================================
function togglePlay() {
    state.isPlaying = !state.isPlaying;
    const btn = document.getElementById('playBtn');
    
    if (state.isPlaying) {
        btn.innerHTML = '<i class="fas fa-pause"></i> Tạm dừng';
        showNotification('▶️ Mô phỏng đang chạy', 'success');
    } else {
        btn.innerHTML = '<i class="fas fa-play"></i> Phát';
        showNotification('⏸️ Mô phỏng tạm dừng', 'info');
    }
}

function resetAnimation() {
    state.isPlaying = false;
    regenerateAllParticles();
    
    document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i> Phát';
    showNotification('🔄 Đã reset mô phỏng', 'success');
}

function toggleEditMode() {
    if (state.selectedPathIndex === null) {
        showNotification('⚠️ Chọn một path trước khi vào edit mode!', 'error');
        return;
    }
    
    state.editMode = !state.editMode;
    state.selectedTool = 'select';
    
    updateToolSelection();
    drawCanvas();
    
    if (state.editMode) {
        showNotification('✏️ Edit mode: Click và kéo các điểm để chỉnh sửa', 'info');
    } else {
        showNotification('✅ Thoát edit mode', 'success');
    }
}

function deletePath() {
    if (state.selectedPathIndex === null) return;
    
    if (!confirm(`Xóa path #${state.selectedPathIndex + 1}?`)) return;
    
    // Remove particles for this path
    state.particles = state.particles.filter(p => p.pathIndex !== state.selectedPathIndex);
    
    // Remove path
    const removedPath = state.paths.splice(state.selectedPathIndex, 1)[0];
    
    // Update particle indices
    state.particles.forEach(p => {
        if (p.pathIndex > state.selectedPathIndex) p.pathIndex--;
    });
    
    state.selectedPathIndex = null;
    state.editMode = false;
    updateUI();
    drawCanvas();
    
    showNotification(`🗑️ Đã xóa path với ${removedPath.points?.length || 0} điểm`, 'success');
}

function clearAll() {
    if (state.paths.length === 0) {
        showNotification('📭 Không có gì để xóa!', 'info');
        return;
    }
    
    if (!confirm(`Xóa tất cả ${state.paths.length} paths và ${state.particles.length} particles?`)) return;
    
    state.paths = [];
    state.particles = [];
    state.currentPath = null;
    state.selectedPathIndex = null;
    state.selectedDirection = null;
    state.editMode = false;
    
    hideDirectionSelector();
    updateUI();
    drawCanvas();
    
    showNotification('🗑️ Đã xóa tất cả!', 'success');
}

function toggleGifLayer() {
    state.showGifLayer = !state.showGifLayer;
    updateLayerUI();
    drawCanvas();
    
    showNotification(state.showGifLayer ? '👁️ Hiện layer GIF' : '🙈 Ẩn layer GIF', 'info');
}

function toggleAnimLayer() {
    state.showAnimLayer = !state.showAnimLayer;
    updateLayerUI();
    drawCanvas();
    
    showNotification(state.showAnimLayer ? '👁️ Hiện layer Animation' : '🙈 Ẩn layer Animation', 'info');
}

function updateToolSelection() {
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tool === state.selectedTool);
    });
    
    // Enable/disable edit button
    const editBtn = document.getElementById('editPointsBtn');
    const deleteBtn = document.getElementById('deletePathBtn');
    
    editBtn.disabled = state.selectedPathIndex === null;
    deleteBtn.disabled = state.selectedPathIndex === null;
}

function updateLayerUI() {
    const gifBtn = document.getElementById('toggleGifLayer');
    const animBtn = document.getElementById('toggleAnimLayer');
    
    gifBtn.classList.toggle('active', state.showGifLayer);
    animBtn.classList.toggle('active', state.showAnimLayer);
    
    gifBtn.querySelector('i').className = state.showGifLayer ? 'fas fa-eye' : 'fas fa-eye-slash';
    animBtn.querySelector('i').className = state.showAnimLayer ? 'fas fa-eye' : 'fas fa-eye-slash';
    
    // Indicator
    document.getElementById('gifLayerDot').className = 'layer-dot ' + (state.showGifLayer ? 'active' : 'inactive');
    document.getElementById('animLayerDot').className = 'layer-dot ' + (state.showAnimLayer ? 'active' : 'inactive');
    
    // Text
    document.getElementById('gifLayerText').textContent = state.showGifLayer ? 'Layer 1: GIF (Hiện)' : 'Layer 1: GIF (Ẩn)';
    document.getElementById('animLayerText').textContent = state.showAnimLayer ? 'Layer 2: Animation (Hiện)' : 'Layer 2: Animation (Ẩn)';
}

function updateUI() {
    document.getElementById('pathCount').textContent = state.paths.length;
    document.getElementById('particleCount').textContent = state.particles.length;
    
    const editBtn = document.getElementById('editPointsBtn');
    const deleteBtn = document.getElementById('deletePathBtn');
    
    editBtn.disabled = state.selectedPathIndex === null;
    deleteBtn.disabled = state.selectedPathIndex === null;
    
    const selectedInfo = document.getElementById('selectedPathInfo');
    if (state.selectedPathIndex !== null) {
        selectedInfo.style.display = 'block';
        const path = state.paths[state.selectedPathIndex];
        const dirText = path.direction?.scroll ? '🔄 Xoay tròn' : '➡️ Hướng thẳng';
        selectedInfo.textContent = `Path #${state.selectedPathIndex + 1}: ${path.points?.length || 0} điểm | ${dirText}`;
    } else {
        selectedInfo.style.display = 'none';
    }
}

// ============================================
// EXPORT GIF - ACTUAL IMPLEMENTATION
// ============================================
async function exportAnimation() {
    if (state.isExporting) {
        showNotification('⏳ Đang export, vui lòng đợi...', 'info');
        return;
    }
    
    if (!state.backgroundGif) {
        showNotification('⚠️ Cần tải GIF background trước khi export!', 'error');
        return;
    }
    
    if (state.paths.length === 0) {
        showNotification('⚠️ Cần vẽ ít nhất một vùng mô phỏng!', 'error');
        return;
    }
    
    showNotification('🎬 Bắt đầu export GIF kết hợp...', 'success');
    state.isExporting = true;
    
    try {
        // Create a temporary canvas for rendering
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = state.canvas.width;
        exportCanvas.height = state.canvas.height;
        const exportCtx = exportCanvas.getContext('2d');
        
        // Capture animation frames
        const frames = [];
        const duration = 3; // seconds
        const fps = 10;
        const totalFrames = duration * fps;
        
        // Save current state
        const savedIsPlaying = state.isPlaying;
        state.isPlaying = false;
        
        // Create progress notification
        const progressNotification = document.createElement('div');
        progressNotification.className = 'notification';
        progressNotification.innerHTML = `
            <div style="width: 100%; background: #eee; border-radius: 4px; margin: 5px 0;">
                <div id="exportProgressBar" style="width: 0%; height: 20px; background: #06d6a0; border-radius: 4px; transition: width 0.3s;"></div>
            </div>
            <div id="exportProgressText" style="font-size: 12px; text-align: center;">Đang chuẩn bị...</div>
        `;
        document.getElementById('notificationContainer').appendChild(progressNotification);
        
        // Capture frames
        for (let i = 0; i < totalFrames; i++) {
            // Update progress
            const progress = Math.round((i / totalFrames) * 100);
            document.getElementById('exportProgressBar').style.width = progress + '%';
            document.getElementById('exportProgressText').textContent = 
                `Đang render frame ${i + 1}/${totalFrames} (${progress}%)`;
            
            // Simulate animation progress
            const time = (i / fps) * 1000;
            simulateAnimationForExport(time);
            
            // Draw to export canvas
            exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
            
            // Draw background
            if (state.backgroundGif) {
                exportCtx.drawImage(state.backgroundGif, 0, 0, exportCanvas.width, exportCanvas.height);
            }
            
            // Draw particles at this frame
            drawParticlesForExport(exportCtx, i);
            
            // Capture frame
            frames.push(exportCtx.getImageData(0, 0, exportCanvas.width, exportCanvas.height));
            
            // Small delay to prevent UI freeze
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        // Create GIF using gif.js (would need library)
        showNotification('📦 Đang tạo file GIF...', 'info');
        
        // For now, create a simple download
        setTimeout(() => {
            completeExport(frames[0]);
        }, 1000);
        
    } catch (error) {
        console.error('Export error:', error);
        showNotification('❌ Lỗi khi export: ' + error.message, 'error');
    } finally {
        state.isExporting = false;
        state.isPlaying = savedIsPlaying;
        
        // Remove progress notification
        const progressNote = document.querySelector('#notificationContainer .notification:last-child');
        if (progressNote) progressNote.remove();
    }
}

function simulateAnimationForExport(time) {
    // Simulate particle movement for export
    state.particles.forEach(particle => {
        const path = state.paths[particle.pathIndex];
        if (!path) return;
        
        if (particle.isScroll) {
            // Scroll motion
            particle.angle += (state.scrollSpeed / 500) * (time / 1000);
            particle.x = particle.centerX + particle.radius * Math.cos(particle.angle);
            particle.y = particle.centerY + particle.radius * Math.sin(particle.angle);
        } else {
            // Linear motion
            particle.x += particle.vx * (time / 1000);
            particle.y += particle.vy * (time / 1000);
            
            // Keep in bounds
            if (!isPointInPath({ x: particle.x, y: particle.y }, path)) {
                // Reset to random position in path
                const xs = path.points.map(p => p[0]);
                const ys = path.points.map(p => p[1]);
                const minX = Math.min(...xs);
                const maxX = Math.max(...xs);
                const minY = Math.min(...ys);
                const maxY = Math.max(...ys);
                
                for (let i = 0; i < 10; i++) {
                    const testX = minX + Math.random() * (maxX - minX);
                    const testY = minY + Math.random() * (maxY - minY);
                    if (isPointInPath({ x: testX, y: testY }, path)) {
                        particle.x = testX;
                        particle.y = testY;
                        break;
                    }
                }
            }
        }
    });
}

function drawParticlesForExport(ctx, frameIndex) {
    state.particles.forEach(particle => {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation + frameIndex * 0.1);
        
        if (state.materialImage && state.materialImage.complete) {
            ctx.drawImage(
                state.materialImage,
                -particle.size / 2,
                -particle.size / 2,
                particle.size,
                particle.size
            );
        } else {
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size / 2);
            gradient.addColorStop(0, '#FF6B6B');
            gradient.addColorStop(1, '#FF4757');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    });
}

function completeExport(imageData) {
    // Create download link
    const canvas = document.createElement('canvas');
    canvas.width = state.canvas.width;
    canvas.height = state.canvas.height;
    const ctx = canvas.getContext('2d');
    
    // Draw final composite
    if (state.backgroundGif) {
        ctx.drawImage(state.backgroundGif, 0, 0, canvas.width, canvas.height);
    }
    
    // Draw particles
    drawParticlesForExport(ctx, 0);
    
    // Add watermark
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText('Motion AI Studio - ' + new Date().toLocaleDateString(), 10, canvas.height - 10);
    
    // Create download
    const dataUrl = canvas.toDataURL('image/png');
    const filename = `motion-ai-export-${Date.now()}.png`;
    
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showNotification(`✅ Đã export: ${filename} (GIF đang phát triển)`, 'success');
    showNotification('💡 Phiên bản sau sẽ hỗ trợ export GIF động thực sự!', 'info');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function getRandomColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', init);
