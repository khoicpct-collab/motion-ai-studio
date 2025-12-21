// ============================================
// MOTION AI STUDIO - LAYER SYSTEM
// Hoàn chỉnh đã fix lỗi
// ============================================

// STATE
const state = {
    canvas: null,
    ctx: null,
    backgroundGif: null,
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
    animationId: null
};

// ============================================
// INITIALIZATION
// ============================================
function init() {
    console.log('🚀 Initializing Motion AI Studio...');
    
    state.canvas = document.getElementById('mainCanvas');
    state.ctx = state.canvas.getContext('2d');
    
    setupEventListeners();
    updateUI();
    animate();
    
    showNotification('🎉 Chào mừng đến với Motion AI Studio!', 'success');
    console.log('✅ Application initialized');
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
            showNotification(`🛠️ Tool: ${this.dataset.tool}`);
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
    });
    
    document.getElementById('countSlider').addEventListener('input', function() {
        state.particleCount = parseInt(this.value);
        document.getElementById('countValue').textContent = state.particleCount;
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
}

// ============================================
// FILE UPLOADS
// ============================================
function handleBackgroundUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            state.backgroundGif = img;
            drawCanvas();
            showNotification('✅ Background uploaded!', 'success');
        };
        img.onerror = function() {
            showNotification('❌ Error loading image', 'error');
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function handleMaterialUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            state.materialImage = img;
            drawCanvas();
            showNotification('✅ Material uploaded!', 'success');
        };
        img.onerror = function() {
            showNotification('❌ Error loading image', 'error');
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// ============================================
// CANVAS INTERACTIONS
// ============================================
function getCanvasCoords(e) {
    const rect = state.canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (state.canvas.width / rect.width),
        y: (e.clientY - rect.top) * (state.canvas.height / rect.height)
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
        }
        return;
    }
    
    // PEN TOOL
    if (state.selectedTool === 'pen') {
        state.isDrawing = true;
        state.currentPath = {
            type: 'freehand',
            points: [[coords.x, coords.y]],
            direction: null,
            color: '#FF6B6B'
        };
        
        // Show direction selector
        showDirectionSelector();
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

function handleDoubleClick() {
    if (!state.currentPath || state.currentPath.points.length < 3) return;
    
    if (!state.selectedDirection) {
        showNotification('⚠️ Vui lòng chọn hướng chuyển động!', 'error');
        return;
    }
    
    // Close the path
    const closedPath = {
        ...state.currentPath,
        points: [...state.currentPath.points, state.currentPath.points[0]],
        direction: state.selectedDirection
    };
    
    state.paths.push(closedPath);
    generateParticlesForPath(closedPath, state.paths.length - 1);
    
    // Reset
    state.currentPath = null;
    state.selectedDirection = null;
    hideDirectionSelector();
    
    updateUI();
    drawCanvas();
    showNotification(`✅ Path created with ${closedPath.points.length} points!`, 'success');
}

// ============================================
// DIRECTION SELECTOR
// ============================================
function showDirectionSelector() {
    state.showDirections = true;
    document.getElementById('directionSelector').classList.remove('hidden');
    
    // Reset selection
    document.querySelectorAll('.dir-btn').forEach(btn => btn.classList.remove('active'));
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
    
    const displayName = isScroll ? '🔄 Cuộn/Xoay' : `➡️ ${name}`;
    document.getElementById('directionInfo').textContent = displayName;
    
    showNotification(`🎯 Direction: ${displayName}`);
}

// ============================================
// POINT IN POLYGON
// ============================================
function isPointInPath(point, path) {
    if (!path.points || path.points.length < 3) return false;
    
    let inside = false;
    for (let i = 0, j = path.points.length - 1; i < path.points.length; j = i++) {
        const xi = path.points[i][0], yi = path.points[i][1];
        const xj = path.points[j][0], yj = path.points[j][1];
        
        const intersect = ((yi > point.y) !== (yj > point.y))
            && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// ============================================
// PARTICLE GENERATION
// ============================================
function generateParticlesForPath(path, pathIndex) {
    if (!path.points || path.points.length < 3 || !path.direction) return;
    
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
    const attempts = state.particleCount * 10;
    
    for (let i = 0; i < attempts && newParticles.length < state.particleCount; i++) {
        const x = minX + Math.random() * (maxX - minX);
        const y = minY + Math.random() * (maxY - minY);
        
        if (isPointInPath({ x, y }, path)) {
            const radius = Math.hypot(x - centerX, y - centerY);
            const angle = Math.atan2(y - centerY, x - centerX);
            
            newParticles.push({
                x: x,
                y: y,
                vx: dir.scroll ? 0 : dir.vx * state.speed / 50,
                vy: dir.scroll ? 0 : dir.vy * state.speed / 50,
                size: state.particleSize,
                pathIndex: pathIndex,
                isScroll: dir.scroll || false,
                angle: angle,
                radius: radius,
                centerX: centerX,
                centerY: centerY,
                life: 0
            });
        }
    }
    
    state.particles.push(...newParticles);
    updateUI();
}

// ============================================
// PARTICLE UPDATE
// ============================================
function updateParticles() {
    state.particles.forEach(particle => {
        const path = state.paths[particle.pathIndex];
        if (!path) return;
        
        let newX = particle.x;
        let newY = particle.y;
        
        if (particle.isScroll) {
            // Scrolling motion - rotate around center
            particle.angle += state.scrollSpeed / 1000;
            newX = particle.centerX + particle.radius * Math.cos(particle.angle);
            newY = particle.centerY + particle.radius * Math.sin(particle.angle);
        } else {
            // Linear motion
            newX = particle.x + particle.vx;
            newY = particle.y + particle.vy;
        }
        
        // Check if inside path
        if (!isPointInPath({ x: newX, y: newY }, path)) {
            // Find valid position
            const xs = path.points.map(p => p[0]);
            const ys = path.points.map(p => p[1]);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            
            for (let i = 0; i < 50; i++) {
                const testX = minX + Math.random() * (maxX - minX);
                const testY = minY + Math.random() * (maxY - minY);
                if (isPointInPath({ x: testX, y: testY }, path)) {
                    newX = testX;
                    newY = testY;
                    
                    // Recalculate for scroll
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
        particle.life++;
    });
}

function updateParticleSpeeds() {
    state.particles.forEach(particle => {
        if (!particle.isScroll) {
            const path = state.paths[particle.pathIndex];
            if (path && path.direction) {
                particle.vx = path.direction.vx * state.speed / 50;
                particle.vy = path.direction.vy * state.speed / 50;
            }
        }
    });
}

function updateParticleSizes() {
    state.particles.forEach(particle => {
        particle.size = state.particleSize;
    });
}

// ============================================
// DRAWING
// ============================================
function drawCanvas() {
    const ctx = state.ctx;
    
    // Clear
    ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, state.canvas.width, state.canvas.height);
    
    // Layer 1: Background GIF
    if (state.backgroundGif && state.showGifLayer) {
        try {
            ctx.drawImage(state.backgroundGif, 0, 0, state.canvas.width, state.canvas.height);
        } catch (e) {
            console.error('Error drawing background:', e);
        }
    }
    
    // Layer 2: Animation
    if (state.showAnimLayer) {
        // Draw paths
        state.paths.forEach((path, index) => {
            ctx.strokeStyle = index === state.selectedPathIndex ? '#00ff00' : path.color;
            ctx.lineWidth = 3;
            ctx.setLineDash(index === state.selectedPathIndex ? [10, 5] : []);
            
            ctx.beginPath();
            if (path.points && path.points.length > 0) {
                ctx.moveTo(path.points[0][0], path.points[0][1]);
                path.points.forEach(point => ctx.lineTo(point[0], point[1]));
            }
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Draw edit points
            if (state.editMode && index === state.selectedPathIndex) {
                path.points.forEach((point, pIndex) => {
                    ctx.fillStyle = pIndex === state.selectedPointIndex ? '#ff0000' : '#00ff00';
                    ctx.beginPath();
                    ctx.arc(point[0], point[1], 8, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.fillStyle = '#000';
                    ctx.font = 'bold 12px Arial';
                    ctx.fillText(pIndex, point[0] + 12, point[1] - 8);
                });
            }
        });
        
        // Draw current path
        if (state.currentPath && state.currentPath.points.length > 0) {
            ctx.strokeStyle = state.currentPath.color;
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            
            ctx.beginPath();
            ctx.moveTo(state.currentPath.points[0][0], state.currentPath.points[0][1]);
            state.currentPath.points.forEach(point => ctx.lineTo(point[0], point[1]));
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Starting point
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(state.currentPath.points[0][0], state.currentPath.points[0][1], 6, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw particles
        state.particles.forEach(particle => {
            try {
                if (state.materialImage && state.materialImage.complete) {
                    ctx.drawImage(
                        state.materialImage,
                        particle.x - particle.size / 2,
                        particle.y - particle.size / 2,
                        particle.size,
                        particle.size
                    );
                } else {
                    ctx.fillStyle = '#FF6B6B';
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            } catch (e) {
                // Fallback to circle if image fails
                ctx.fillStyle = '#FF6B6B';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
}

// ============================================
// ANIMATION LOOP
// ============================================
function animate() {
    if (state.isPlaying) {
        updateParticles();
    }
    drawCanvas();
    requestAnimationFrame(animate);
}

// ============================================
// UI CONTROLS
// ============================================
function togglePlay() {
    state.isPlaying = !state.isPlaying;
    const btn = document.getElementById('playBtn');
    
    if (state.isPlaying) {
        btn.innerHTML = '<i class="fas fa-pause"></i> Tạm dừng';
        showNotification('▶️ Animation started');
    } else {
        btn.innerHTML = '<i class="fas fa-play"></i> Phát';
        showNotification('⏸️ Animation paused');
    }
}

function resetAnimation() {
    state.isPlaying = false;
    state.particles = [];
    
    // Regenerate particles
    state.paths.forEach((path, index) => {
        generateParticlesForPath(path, index);
    });
    
    document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i> Phát';
    updateUI();
    showNotification('🔄 Animation reset');
}

function toggleEditMode() {
    if (state.selectedPathIndex === null) return;
    
    state.editMode = !state.editMode;
    state.selectedTool = state.editMode ? 'select' : state.selectedTool;
    
    updateToolSelection();
    drawCanvas();
    showNotification(state.editMode ? '✏️ Edit mode ON' : '✅ Edit mode OFF');
}

function deletePath() {
    if (state.selectedPathIndex === null) return;
    
    // Remove particles for this path
    state.particles = state.particles.filter(p => p.pathIndex !== state.selectedPathIndex);
    
    // Remove path
    state.paths.splice(state.selectedPathIndex, 1);
    
    // Update particle indices
    state.particles.forEach(p => {
        if (p.pathIndex > state.selectedPathIndex) p.pathIndex--;
    });
    
    state.selectedPathIndex = null;
    state.editMode = false;
    updateUI();
    drawCanvas();
    showNotification('🗑️ Path deleted');
}

function clearAll() {
    if (!confirm('Xóa tất cả paths và particles?')) return;
    
    state.paths = [];
    state.particles = [];
    state.currentPath = null;
    state.selectedPathIndex = null;
    state.selectedDirection = null;
    state.editMode = false;
    
    hideDirectionSelector();
    updateUI();
    drawCanvas();
    showNotification('🗑️ All cleared');
}

function toggleGifLayer() {
    state.showGifLayer = !state.showGifLayer;
    updateLayerUI();
    drawCanvas();
}

function toggleAnimLayer() {
    state.showAnimLayer = !state.showAnimLayer;
    updateLayerUI();
    drawCanvas();
}

function updateToolSelection() {
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tool === state.selectedTool);
    });
}

function updateLayerUI() {
    // Toggle buttons
    const gifBtn = document.getElementById('toggleGifLayer');
    const animBtn = document.getElementById('toggleAnimLayer');
    
    gifBtn.classList.toggle('active', state.showGifLayer);
    animBtn.classList.toggle('active', state.showAnimLayer);
    
    gifBtn.querySelector('i').className = state.showGifLayer ? 'fas fa-eye' : 'fas fa-eye-slash';
    animBtn.querySelector('i').className = state.showAnimLayer ? 'fas fa-eye' : 'fas fa-eye-slash';
    
    // Indicator
    document.getElementById('gifLayerDot').className = 'layer-dot ' + (state.showGifLayer ? 'active' : 'inactive');
    document.getElementById('animLayerDot').className = 'layer-dot ' + (state.showAnimLayer ? 'active' : 'inactive');
}

function updateUI() {
    document.getElementById('pathCount').textContent = state.paths.length;
    document.getElementById('particleCount').textContent = state.particles.length;
    
    const editBtn =Resumed code export from interrupted function.The user wants me to continue exporting the code. I was in the middle of the updateUI() function in the app.js file. Let me continue from where I left off.document.getElementById('editPointsBtn');
const deleteBtn = document.getElementById('deletePathBtn');
editBtn.disabled = state.selectedPathIndex === null;
deleteBtn.disabled = state.selectedPathIndex === null;

const selectedInfo = document.getElementById('selectedPathInfo');
if (state.selectedPathIndex !== null) {
    selectedInfo.style.display = 'block';
    selectedInfo.textContent = `✅ Path #${state.selectedPathIndex + 1} được chọn`;
} else {
    selectedInfo.style.display = 'none';
}
}
// ============================================
// EXPORT
// ============================================
function exportAnimation() {
showNotification('🎬 Đang xuất file...', 'success');
setTimeout(() => {
    showNotification('💡 Chức năng export đang phát triển!\n\n✅ Sẽ gộp:\n• GIF Background (Layer 1)\n• Animation Layer (Layer 2)\n→ Thành 1 file GIF mới\n\nSử dụng thư viện gif.js hoặc WebCodecs API', 'success');
}, 1000);
}
// ============================================
// NOTIFICATIONS
// ============================================
function showNotification(message, type = 'success') {
const container = document.getElementById('notificationContainer');
const notification = document.createElement('div');
notification.className = notification ${type};
notification.textContent = message;
container.appendChild(notification);

setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
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
