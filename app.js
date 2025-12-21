// FILE: app.js - Logic chính cho Motion AI Studio
// Phiên bản hoàn chỉnh & tối ưu cho Vercel

// ==================== CẤU HÌNH & STATE ====================
const CONFIG = {
    MAX_PARTICLES: 500,
    FPS_LIMIT: 30,
    BASE_SPEED: 0.5
};

const State = {
    // Canvas & Context
    canvas: null,
    ctx: null,
    
    // Hình ảnh
    bgImage: null,
    materialImg: null,
    
    // Vẽ & Đường dẫn
    paths: [],
    currentPath: [],
    selectedTool: 'select',
    isDrawing: false,
    selectedPathIndex: -1,
    
    // Particle system
    particles: [],
    isPlaying: false,
    
    // Hướng
    selectedDirection: null,
    
    // Cài đặt
    speed: 50,
    particleCount: 150,
    particleSize: 15,
    swirl: 30,
    
    // Hiệu suất
    lastFrameTime: 0,
    fps: 0,
    frameCount: 0,
    fpsInterval: 1000 / CONFIG.FPS_LIMIT,
    
    // Cache
    particleCache: null
};

// ==================== KHỞI TẠO ====================
function init() {
    console.log('🚀 Motion AI Studio - Khởi động...');
    
    // Thiết lập canvas
    State.canvas = document.getElementById('mainCanvas');
    State.ctx = State.canvas.getContext('2d', { alpha: false });
    
    // Tạo cache cho particle
    createParticleCache();
    
    // Thiết lập sự kiện
    setupEventListeners();
    
    // Bắt đầu vòng lặp animation
    requestAnimationFrame(animate);
    
    // Hiện thông báo chào mừng
    showNotification('✅ Ứng dụng đã sẵn sàng! Upload GIF để bắt đầu.');
    updateUI();
}

// Tạo cache hình ảnh cho particle (tối ưu hiệu suất)
function createParticleCache() {
    const size = 64;
    const cache = document.createElement('canvas');
    cache.width = cache.height = size;
    const ctx = cache.getContext('2d');
    
    // Vẽ particle mẫu với gradient
    const gradient = ctx.createRadialGradient(
        size/2, size/2, 0,
        size/2, size/2, size/2
    );
    gradient.addColorStop(0, 'rgba(255, 107, 107, 1)');
    gradient.addColorStop(1, 'rgba(255, 71, 87, 0.7)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Thêm highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(size/3, size/3, size/6, 0, Math.PI * 2);
    ctx.fill();
    
    State.particleCache = cache;
}

// ==================== THIẾT LẬP SỰ KIỆN ====================
function setupEventListeners() {
    // Upload files
    document.getElementById('uploadGif').addEventListener('change', handleGifUpload);
    document.getElementById('uploadMaterial').addEventListener('change', handleMaterialUpload);
    
    // Tool selection
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectTool(this.dataset.tool);
        });
    });
    
    // Canvas events
    State.canvas.addEventListener('mousedown', startDrawing);
    State.canvas.addEventListener('mousemove', draw);
    State.canvas.addEventListener('mouseup', stopDrawing);
    State.canvas.addEventListener('dblclick', finishDrawing);
    
    // Direction buttons
    document.querySelectorAll('.dir-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectDirection(this);
        });
    });
    
    // Control sliders
    const setupSlider = (id, property, displayId, suffix = '') => {
        const slider = document.getElementById(id);
        const display = document.getElementById(displayId);
        
        slider.addEventListener('input', function() {
            State[property] = suffix ? parseInt(this.value) : this.value;
            display.textContent = this.value + suffix;
            
            // Cập nhật particles nếu cần
            if (property === 'speed') updateParticleVelocity();
            if (property === 'particleCount') regenerateParticles();
            if (property === 'particleSize') updateParticleSize();
        });
    };
    
    setupSlider('speedSlider', 'speed', 'speedValue', '%');
    setupSlider('countSlider', 'particleCount', 'countValue', '');
    setupSlider('sizeSlider', 'particleSize', 'sizeValue', 'px');
    setupSlider('swirlSlider', 'swirl', 'swirlValue', '%');
    
    // Action buttons
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('exportBtn').addEventListener('click', exportImage);
    document.getElementById('clearAllBtn').addEventListener('click', clearAll);
}

// ==================== XỬ LÝ UPLOAD ====================
function handleGifUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    showNotification('📁 Đang tải GIF nền...');
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            State.bgImage = img;
            drawCanvas();
            showNotification('✅ GIF nền đã tải xong! Click vào canvas để vẽ vùng.');
        };
        img.src = event.target.result;
    };
    
    reader.readAsDataURL(file);
}

function handleMaterialUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    showNotification('🎨 Đang tải vật liệu...');
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            State.materialImg = img;
            document.getElementById('materialStatus').textContent = file.name;
            showNotification('✅ Vật liệu đã tải xong!');
        };
        img.src = event.target.result;
    };
    
    reader.readAsDataURL(file);
}

// ==================== CÔNG CỤ VẼ ====================
function selectTool(tool) {
    State.selectedTool = tool;
    State.isDrawing = false;
    
    // Cập nhật giao diện
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tool === tool);
    });
    
    showNotification(`🛠️ Chọn công cụ: ${getToolName(tool)}`);
}

function getToolName(tool) {
    const names = {
        'select': 'Chọn',
        'pen': 'Pen Tool',
        'edit': 'Sửa điểm'
    };
    return names[tool] || tool;
}

function getCanvasPos(e) {
    const rect = State.canvas.getBoundingClientRect();
    const scaleX = State.canvas.width / rect.width;
    const scaleY = State.canvas.height / rect.height;
    
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}

function startDrawing(e) {
    if (State.selectedTool !== 'pen') return;
    if (!State.bgImage) {
        showNotification('⚠️ Hãy upload GIF nền trước!', 'warning');
        return;
    }
    
    const pos = getCanvasPos(e);
    State.isDrawing = true;
    State.currentPath = [pos];
    
    // Hiển thị bảng chọn hướng
    showDirectionSelector(pos.x, pos.y);
    showNotification('🎯 Đang vẽ... Chọn hướng chuyển động');
}

function draw(e) {
    if (!State.isDrawing || State.currentPath.length === 0) return;
    
    const pos = getCanvasPos(e);
    const lastPoint = State.currentPath[State.currentPath.length - 1];
    const dist = Math.hypot(pos.x - lastPoint.x, pos.y - lastPoint.y);
    
    if (dist > 10) {
        State.currentPath.push(pos);
        drawCurrentPath();
    }
}

function stopDrawing() {
    State.isDrawing = false;
}

function finishDrawing(e) {
    if (!State.isDrawing || State.currentPath.length < 3) return;
    
    if (!State.selectedDirection) {
        showNotification('⚠️ Hãy chọn hướng chuyển động trước!', 'warning');
        return;
    }
    
    const pos = getCanvasPos(e);
    State.currentPath.push(pos);
    
    // Tạo path đóng
    const closedPath = {
        points: [...State.currentPath, State.currentPath[0]],
        direction: State.selectedDirection,
        color: getRandomColor()
    };
    
    State.paths.push(closedPath);
    generateParticlesForPath(closedPath, State.paths.length - 1);
    
    // Reset
    State.currentPath = [];
    State.selectedDirection = null;
    hideDirectionSelector();
    
    updateUI();
    drawCanvas();
    
    showNotification(`✅ Đã tạo vùng mô phỏng với ${closedPath.points.length} điểm!`);
}

function drawCurrentPath() {
    // Vẽ đường đi hiện tại
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = State.canvas.width;
    tempCanvas.height = State.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (State.currentPath.length < 2) return;
    
    tempCtx.strokeStyle = '#00ff00';
    tempCtx.lineWidth = 3;
    tempCtx.setLineDash([10, 5]);
    tempCtx.lineJoin = 'round';
    tempCtx.lineCap = 'round';
    
    tempCtx.beginPath();
    tempCtx.moveTo(State.currentPath[0].x, State.currentPath[0].y);
    
    for (let i = 1; i < State.currentPath.length; i++) {
        tempCtx.lineTo(State.currentPath[i].x, State.currentPath[i].y);
    }
    
    tempCtx.stroke();
    
    // Vẽ lên canvas chính
    State.ctx.drawImage(tempCanvas, 0, 0);
}

// ==================== CHỌN HƯỚNG ====================
function showDirectionSelector(x, y) {
    const overlay = document.getElementById('directionOverlay');
    const rect = State.canvas.getBoundingClientRect();
    const scaleX = State.canvas.width / rect.width;
    const scaleY = State.canvas.height / rect.height;
    
    overlay.style.display = 'block';
    overlay.style.left = (rect.left + (x / scaleX) - 130) + 'px';
    overlay.style.top = (rect.top + (y / scaleY) - 150) + 'px';
    
    // Reset selection
    document.querySelectorAll('.dir-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
}

function hideDirectionSelector() {
    document.getElementById('directionOverlay').style.display = 'none';
}

function selectDirection(btn) {
    document.querySelectorAll('.dir-btn').forEach(b => {
        b.classList.remove('selected');
    });
    
    btn.classList.add('selected');
    
    State.selectedDirection = {
        name: btn.dataset.dir,
        vx: parseFloat(btn.dataset.vx || 0),
        vy: parseFloat(btn.dataset.vy || 0),
        isScroll: btn.dataset.scroll === 'true'
    };
    
    showNotification(`🎯 Đã chọn hướng: ${getDirectionName(btn.dataset.dir)}`);
}

function getDirectionName(dir) {
    const names = {
        'up-left': 'Tây Bắc',
        'up': 'Bắc', 
        'up-right': 'Đông Bắc',
        'left': 'Tây',
        'scroll': 'Xoay tròn',
        'right': 'Đông',
        'down-left': 'Tây Nam',
        'down': 'Nam',
        'down-right': 'Đông Nam'
    };
    return names[dir] || dir;
}

// ==================== HỆ THỐNG PARTICLE ====================
function generateParticlesForPath(path, pathIndex) {
    if (!path.points || path.points.length < 3) return;
    
    // Tính bounds của polygon
    const xs = path.points.map(p => p.x);
    const ys = path.points.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    const newParticles = [];
    const attempts = State.particleCount * 5;
    
    for (let i = 0; i < attempts && newParticles.length < State.particleCount; i++) {
        const x = minX + Math.random() * (maxX - minX);
        const y = minY + Math.random() * (maxY - minY);
        
        if (isPointInPolygon({x, y}, path.points)) {
            const angle = Math.atan2(y - centerY, x - centerX);
            const radius = Math.hypot(x - centerX, y - centerY);
            
            newParticles.push({
                x, y,
                vx: path.direction.vx * (State.speed / 100),
                vy: path.direction.vy * (State.speed / 100),
                size: State.particleSize * (0.7 + Math.random() * 0.6),
                pathIndex,
                isScroll: path.direction.isScroll || false,
                angle: angle,
                radius: radius,
                centerX: centerX,
                centerY: centerY,
                life: Math.random() * 100,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.05
            });
        }
    }
    
    // Xóa particles cũ của path này (nếu có) và thêm mới
    State.particles = State.particles.filter(p => p.pathIndex !== pathIndex);
    State.particles.push(...newParticles);
    
    updateUI();
}

function isPointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        
        const intersect = ((yi > point.y) !== (yj > point.y))
            && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function updateParticles(deltaTime) {
    State.particles.forEach(p => {
        // Cập nhật thời gian sống
        p.life += deltaTime * 0.001;
        p.rotation += p.rotationSpeed;
        
        let newX = p.x;
        let newY = p.y;
        
        if (p.isScroll) {
            // Chuyển động xoay tròn
            p.angle += (State.swirl / 500) * deltaTime * 0.016;
            newX = p.centerX + p.radius * Math.cos(p.angle);
            newY = p.centerY + p.radius * Math.sin(p.angle);
        } else {
            // Chuyển động tuyến tính
            newX = p.x + p.vx * deltaTime * 0.05;
            newY = p.y + p.vy * deltaTime * 0.05;
        }
        
        // Kiểm tra nếu particle vẫn trong vùng
        const path = State.paths[p.pathIndex];
        if (path && !isPointInPolygon({x: newX, y: newY}, path.points)) {
            // Nếu ra ngoài, tìm vị trí mới trong vùng
            for (let i = 0; i < 10; i++) {
                const testX = p.x + (Math.random() - 0.5) * 50;
                const testY = p.y + (Math.random() - 0.5) * 50;
                
                if (isPointInPolygon({x: testX, y: testY}, path.points)) {
                    newX = testX;
                    newY = testY;
                    
                    if (p.isScroll) {
                        p.radius = Math.hypot(newX - p.centerX, newY - p.centerY);
                        p.angle = Math.atan2(newY - p.centerY, newX - p.centerX);
                    }
                    break;
                }
            }
        }
        
        p.x = newX;
        p.y = newY;
    });
}

function updateParticleVelocity() {
    State.particles.forEach(p => {
        if (!p.isScroll) {
            const path = State.paths[p.pathIndex];
            if (path && path.direction) {
                p.vx = path.direction.vx * (State.speed / 100);
                p.vy = path.direction.vy * (State.speed / 100);
            }
        }
    });
}

function updateParticleSize() {
    State.particles.forEach(p => {
        const baseSize = State.particleSize;
        p.size = baseSize * (0.7 + (p.size / State.particleSize - 0.7));
    });
}

function regenerateParticles() {
    const oldCount = State.particles.length;
    State.particles = [];
    
    State.paths.forEach((path, index) => {
        generateParticlesForPath(path, index);
    });
    
    showNotification(`🔄 Tái tạo ${State.particles.length} particles`);
}

// ==================== VẼ CANVAS ====================
function drawCanvas() {
    const ctx = State.ctx;
    const width = State.canvas.width;
    const height = State.canvas.height;
    
    // 1. Xóa canvas
    ctx.clearRect(0, 0, width, height);
    
    // 2. Vẽ nền (nếu có)
    if (State.bgImage) {
        ctx.drawImage(State.bgImage, 0, 0, width, height);
    } else {
        // Nền mặc định
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);
    }
    
    // 3. Vẽ các paths đã tạo
    State.paths.forEach((path, index) => {
        if (path.points.length < 2) return;
        
        // Đường viền
        ctx.strokeStyle = index === State.selectedPathIndex ? '#00ff00' : path.color;
        ctx.lineWidth = index === State.selectedPathIndex ? 4 : 2;
        ctx.setLineDash(index === State.selectedPathIndex ? [10, 5] : []);
        
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        
        for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Tô màu nhẹ bên trong
        ctx.fillStyle = path.color.replace(')', ', 0.1)').replace('rgb', 'rgba');
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        
        for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        
        ctx.closePath();
        ctx.fill();
    });
    
    // 4. Vẽ particles
    State.particles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = 0.8 + 0.2 * Math.sin(p.life);
        
        if (State.materialImg && State.materialImg.complete) {
            // Vẽ hình ảnh vật liệu
            ctx.drawImage(
                State.materialImg,
                -p.size/2, -p.size/2,
                p.size, p.size
            );
        } else {
            // Vẽ từ cache hoặc hình cơ bản
            ctx.drawImage(
                State.particleCache,
                -p.size/2, -p.size/2,
                p.size, p.size
            );
        }
        
        ctx.restore();
    });
}

// ==================== VÒNG LẶP ANIMATION ====================
function animate(currentTime) {
    requestAnimationFrame(animate);
    
    // Giới hạn FPS để tối ưu hiệu suất
    if (currentTime - State.lastFrameTime < State.fpsInterval) return;
    
    // Tính FPS
    const deltaTime = currentTime - State.lastFrameTime;
    State.lastFrameTime = currentTime;
    State.fps = Math.round(1000 / deltaTime);
    
    // Cập nhật nếu đang chạy
    if (State.isPlaying) {
        updateParticles(deltaTime);
    }
    
    // Vẽ frame hiện tại
    drawCanvas();
    
    // Cập nhật FPS trên giao diện
    document.getElementById('fpsCounter').textContent = State.fps;
}

// ==================== ĐIỀU KHIỂN ====================
function togglePlay() {
    State.isPlaying = !State.isPlaying;
    const btn = document.getElementById('playBtn');
    
    if (State.isPlaying) {
        btn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        showNotification('▶️ Bắt đầu mô phỏng');
    } else {
        btn.innerHTML = '<i class="fas fa-play"></i> Play';
        showNotification('⏸️ Tạm dừng mô phỏng');
    }
}

function exportImage() {
    if (!State.bgImage) {
        showNotification('⚠️ Chưa có nền để export!', 'warning');
        return;
    }
    
    showNotification('📸 Đang tạo ảnh kết hợp...');
    
    // Tạo canvas tạm để export
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = State.canvas.width;
    exportCanvas.height = State.canvas.height;
    const exportCtx = exportCanvas.getContext('2d');
    
    // Vẽ nền
    exportCtx.drawImage(State.bgImage, 0, 0, exportCanvas.width, exportCanvas.height);
    
    // Vẽ particles lên nền
    State.particles.forEach(p => {
        exportCtx.save();
        exportCtx.translate(p.x, p.y);
        
        if (State.materialImg && State.materialImg.complete) {
            exportCtx.drawImage(
                State.materialImg,
                -p.size/2, -p.size/2,
                p.size, p.size
            );
        } else {
            const gradient = exportCtx.createRadialGradient(0, 0, 0, 0, 0, p.size/2);
            gradient.addColorStop(0, 'rgba(255, 107, 107, 0.9)');
            gradient.addColorStop(1, 'rgba(255, 71, 87, 0.6)');
            
            exportCtx.fillStyle = gradient;
            exportCtx.beginPath();
            exportCtx.arc(0, 0, p.size/2, 0, Math.PI * 2);
            exportCtx.fill();
        }
        
        exportCtx.restore();
    });
    
    // Thêm watermark
    exportCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    exportCtx.fillRect(0, exportCanvas.height - 30, exportCanvas.width, 30);
    exportCtx.fillStyle = 'white';
    exportCtx.font = '12px Inter';
    exportCtx.fillText(`Motion AI Studio - ${new Date().toLocaleDateString('vi-VN')}`, 10, exportCanvas.height - 10);
    
    // Tạo link tải xuống
    const dataUrl = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `motion-ai-export-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('✅ Đã xuất file PNG thành công!');
}

function clearAll() {
    if (State.paths.length === 0 && State.particles.length === 0) {
        showNotification('📭 Không có gì để xóa!', 'info');
        return;
    }
    
    if (!confirm(`Xóa tất cả ${State.paths.length} vùng và ${State.particles.length} particles?`)) return;
    
    State.paths = [];
    State.particles = [];
    State.currentPath = [];
    State.selectedDirection = null;
    State.isPlaying = false;
    
    document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i> Play';
    hideDirectionSelector();
    
    updateUI();
    drawCanvas();
    
    showNotification('🗑️ Đã xóa tất cả!');
}

// ==================== TIỆN ÍCH ====================
function getRandomColor() {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#FFD166', 
        '#06D6A0', '#118AB2', '#EF476F',
        '#7209B7', '#3A86FF', '#FB5607'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function updateUI() {
    // Cập nhật số lượng
    document.getElementById('pathCount').textContent = State.paths.length;
    document.getElementById('particleCount').textContent = State.particles.length;
    
    // Cập nhật trạng thái
    const statusText = document.getElementById('statusText');
    if (State.isPlaying) {
        statusText.textContent = 'Đang chạy';
        statusText.style.color = '#10b981';
    } else if (State.paths.length > 0) {
        statusText.textContent = 'Sẵn sàng';
        statusText.style.color = '#60a5fa';
    } else {
        statusText.textContent = 'Chờ vẽ vùng';
        statusText.style.color = '#94a3b8';
    }
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    
    // Đặt màu dựa trên loại thông báo
    if (type === 'warning') {
        notification.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
    } else if (type === 'info') {
        notification.style.background = 'linear-gradient(90deg, #3b82f6, #1d4ed8)';
    } else {
        notification.style.background = 'linear-gradient(90deg, #10b981, #059669)';
    }
    
    notification.textContent = message;
    notification.style.display = 'block';
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// ==================== KHỞI CHẠY ỨNG DỤNG ====================
// Chạy ứng dụng khi trang đã tải xong
document.addEventListener('DOMContentLoaded', init);
