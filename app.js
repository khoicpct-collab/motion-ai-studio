// ============================================
// MOTION SIM - Core Engine
// Tối ưu hiệu suất, tập trung nghiệp vụ
// ============================================

// STATE - Đơn giản hoá tối đa
const AppState = {
    canvas: null, ctx: null,
    drawCanvas: null, drawCtx: null,
    background: null,
    material: null,
    isPlaying: false,
    isDrawing: false,
    currentPath: [],
    selectedDirection: null,
    particles: [],
    paths: [],

    // Settings với giá trị mặc định tối ưu
    speed: 50,
    particleCount: 150,
    particleSize: 12,

    // Hiệu suất
    lastFrameTime: 0,
    fps: 0,
    frameCount: 0,
    fpsInterval: 1000 / 30 // Mặc định 30 FPS để mượt
};

// ============================================
// KHỞI TẠO
// ============================================
function init() {
    console.log('🚀 Motion Sim - Khởi động...');
    AppState.canvas = document.getElementById('mainCanvas');
    AppState.ctx = AppState.canvas.getContext('2d', { alpha: false }); // Tối ưu: tắt alpha
    AppState.drawCanvas = document.getElementById('drawCanvas');
    AppState.drawCtx = AppState.drawCanvas.getContext('2d');

    setupEventListeners();
    setupDefaultParticleCache(); // Tạo cache sẵn cho particle
    animate(0); // Bắt đầu vòng lặp

    showNotification('✅ Ứng dụng sẵn sàng. Upload GIF và bắt đầu vẽ!');
}

// ============================================
// THIẾT LẬP SỰ KIỆN
// ============================================
function setupEventListeners() {
    // Upload
    document.getElementById('uploadGif').addEventListener('change', handleGifUpload);
    document.getElementById('uploadMaterial').addEventListener('change', handleMaterialUpload);
    document.querySelectorAll('.upload-area').forEach(area => {
        area.addEventListener('click', function() {
            this.querySelector('input[type="file"]').click();
        });
    });

    // Canvas
    AppState.canvas.addEventListener('mousedown', startDrawing);
    AppState.canvas.addEventListener('mousemove', draw);
    AppState.canvas.addEventListener('mouseup', stopDrawing);
    AppState.canvas.addEventListener('dblclick', finishDrawing);

    // Controls
    document.getElementById('speedSlider').addEventListener('input', function() {
        AppState.speed = this.value;
        document.getElementById('speedValue').textContent = this.value + '%';
        updateParticleVelocity();
    });
    document.getElementById('countSlider').addEventListener('input', function() {
        AppState.particleCount = this.value;
        document.getElementById('countValue').textContent = this.value;
        regenerateParticles();
    });
    document.getElementById('sizeSlider').addEventListener('input', function() {
        AppState.particleSize = this.value;
        document.getElementById('sizeValue').textContent = this.value + 'px';
        updateParticleSize();
    });

    // Buttons
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('exportBtn').addEventListener('click', exportComposite);

    // Direction buttons
    document.querySelectorAll('.dir-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectDirection(this);
        });
    });
}

// ============================================
// XỬ LÝ UPLOAD
// ============================================
function handleGifUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    showNotification('📁 Đang tải GIF...');
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            AppState.background = img;
            drawCanvas();
            showNotification('✅ GIF nền đã sẵn sàng. Click vào ảnh để vẽ vùng.');
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
            AppState.material = img;
            drawCanvas();
            showNotification('✅ Vật liệu đã tải. Vẽ vùng để xem mô phỏng.');
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// ============================================
// VẼ VÙNG & CHỌN HƯỚNG (Core Logic)
// ============================================
function startDrawing(e) {
    if (!AppState.background) {
        showNotification('⚠️ Hãy upload GIF trước!');
        return;
    }
    const pos = getMousePos(e);
    AppState.isDrawing = true;
    AppState.currentPath = [pos];
    
    // Hiện bảng chọn hướng tại vị trí click
    showDirectionSelector(pos.x, pos.y);
}

function draw(e) {
    if (!AppState.isDrawing) return;
    const pos = getMousePos(e);
    AppState.currentPath.push(pos);
    drawCurrentPath();
}

function stopDrawing() {
    AppState.isDrawing = false;
}

function finishDrawing(e) {
    if (!AppState.isDrawing || AppState.currentPath.length < 3) return;
    
    if (!AppState.selectedDirection) {
        showNotification('⚠️ Hãy chọn hướng chuyển động trước!');
        return;
    }
    
    const pos = getMousePos(e);
    AppState.currentPath.push(pos);
    
    // Tạo path đóng
    const closedPath = {
        points: [...AppState.currentPath, AppState.currentPath[0]],
        direction: AppState.selectedDirection
    };
    AppState.paths.push(closedPath);
    
    // Tạo particles trong vùng
    generateParticlesInPath(closedPath, AppState.paths.length - 1);
    
    // Reset
    AppState.currentPath = [];
    AppState.selectedDirection = null;
    hideDirectionSelector();
    
    drawCanvas();
    showNotification(`✅ Đã tạo vùng mô phỏng với ${closedPath.points.length} điểm.`);
}

function drawCurrentPath() {
    const ctx = AppState.drawCtx;
    ctx.clearRect(0, 0, AppState.drawCanvas.width, AppState.drawCanvas.height);
    
    if (AppState.currentPath.length < 2) return;
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(AppState.currentPath[0].x, AppState.currentPath[0].y);
    for (let i = 1; i < AppState.currentPath.length; i++) {
        ctx.lineTo(AppState.currentPath[i].x, AppState.currentPath[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
}

// ============================================
// CHỌN HƯỚNG
// ============================================
function showDirectionSelector(x, y) {
    const overlay = document.getElementById('directionOverlay');
    overlay.style.display = 'block';
    overlay.style.left = (x - 100) + 'px';
    overlay.style.top = (y - 120) + 'px';
}

function hideDirectionSelector() {
    document.getElementById('directionOverlay').style.display = 'none';
}

function selectDirection(btn) {
    document.querySelectorAll('.dir-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    
    AppState.selectedDirection = {
        vx: parseFloat(btn.dataset.vx || 0),
        vy: parseFloat(btn.dataset.vy || 0),
        isScroll: btn.dataset.scroll === 'true'
    };
    showNotification(`🎯 Hướng đã chọn: ${btn.textContent}`);
}

// ============================================
// HỆ THỐNG PARTICLE - TỐI ƯU HIỆU SUẤT
// ============================================
// Cache cho particle (chỉ vẽ 1 lần)
let particleCache = null;
function setupDefaultParticleCache() {
    const size = 50;
    const cache = document.createElement('canvas');
    cache.width = cache.height = size;
    const ctx = cache.getContext('2d');
    
    // Vẽ hình tròn đơn giản với gradient
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, 'rgba(255, 107, 107, 1)');
    gradient.addColorStop(1, 'rgba(255, 71, 87, 0.7)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
    ctx.fill();
    
    particleCache = cache;
}

function generateParticlesInPath(path, pathIndex) {
    // Tính bounds của polygon
    const xs = path.points.map(p => p.x);
    const ys = path.points.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    
    const newParticles = [];
    const attempts = AppState.particleCount * 3;
    
    for (let i = 0; i < attempts && newParticles.length < AppState.particleCount; i++) {
        const x = minX + Math.random() * (maxX - minX);
        const y = minY + Math.random() * (maxY - minY);
        
        if (isPointInPolygon({x, y}, path.points)) {
            newParticles.push({
                x, y,
                vx: path.direction.vx * (AppState.speed / 100),
                vy: path.direction.vy * (AppState.speed / 100),
                size: AppState.particleSize * (0.7 + Math.random() * 0.6),
                pathIndex,
                life: Math.random() * 100,
                rotation: Math.random() * Math.PI * 2
            });
        }
    }
    
    // Xóa particles cũ của path này (nếu có) và thêm mới
    AppState.particles = AppState.particles.filter(p => p.pathIndex !== pathIndex);
    AppState.particles.push(...newParticles);
}

function updateParticles(deltaTime) {
    AppState.particles.forEach(p => {
        // Cập nhật vị trí
        p.x += p.vx * deltaTime * 0.05;
        p.y += p.vy * deltaTime * 0.05;
        p.life += deltaTime * 0.001;
        p.rotation += 0.01;
        
        // Giữ particle trong path của nó
        const path = AppState.paths[p.pathIndex];
        if (path && !isPointInPolygon({x: p.x, y: p.y}, path.points)) {
            // Nếu ra ngoài, đặt lại vị trí random trong path
            const xs = path.points.map(pt => pt.x);
            const ys = path.points.map(pt => pt.y);
            const minX = Math.min(...xs), maxX = Math.max(...xs);
            const minY = Math.min(...ys), maxY = Math.max(...ys);
            
            for (let i = 0; i < 5; i++) {
                const testX = minX + Math.random() * (maxX - minX);
                const testY = minY + Math.random() * (maxY - minY);
                if (isPointInPolygon({x: testX, y: testY}, path.points)) {
                    p.x = testX;
                    p.y = testY;
                    break;
                }
            }
        }
    });
}

// ============================================
// VẼ CANVAS - TỐI ƯU
// ============================================
function drawCanvas() {
    const ctx = AppState.ctx;
    const width = AppState.canvas.width;
    const height = AppState.canvas.height;
    
    // 1. Vẽ nền (nếu có)
    ctx.clearRect(0, 0, width, height);
    if (AppState.background) {
        ctx.drawImage(AppState.background, 0, 0, width, height);
    } else {
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, width, height);
    }
    
    // 2. Vẽ các paths đã tạo
    AppState.paths.forEach(path => {
        if (path.points.length < 2) return;
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.stroke();
    });
    
    // 3. Vẽ particles - SỬ DỤNG CACHE để tối ưu
    AppState.particles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        
        if (AppState.material && AppState.material.complete) {
            // Vẽ material image từ cache
            ctx.drawImage(
                AppState.material,
                -p.size/2, -p.size/2,
                p.size, p.size
            );
        } else {
            // Vẽ từ particle cache
            ctx.drawImage(
                particleCache,
                -p.size/2, -p.size/2,
                p.size, p.size
            );
        }
        ctx.restore();
    });
}

// ============================================
// VÒNG LẶP CHÍNH - GIỚI HẠN 30 FPS
// ============================================
function animate(currentTime) {
    requestAnimationFrame(animate);
    
    // Giới hạn FPS ~30 để hiệu suất ổn định
    if (currentTime - AppState.lastFrameTime < AppState.fpsInterval) return;
    
    AppState.lastFrameTime = currentTime;
    
    if (AppState.isPlaying) {
        updateParticles(AppState.fpsInterval);
    }
    
    drawCanvas();
}

// ============================================
// CONTROLS & UTILITIES
// ============================================
function getMousePos(e) {
    const rect = AppState.canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (AppState.canvas.width / rect.width),
        y: (e.clientY - rect.top) * (AppState.canvas.height / rect.height)
    };
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

function togglePlay() {
    AppState.isPlaying = !AppState.isPlaying;
    const btn = document.getElementById('playBtn');
    btn.textContent = AppState.isPlaying ? '⏸ Pause' : '▶️ Play';
    showNotification(AppState.isPlaying ? '▶️ Mô phỏng đang chạy' : '⏸ Đã dừng');
}

function updateParticleVelocity() {
    AppState.particles.forEach(p => {
        const path = AppState.paths[p.pathIndex];
        if (path && path.direction) {
            p.vx = path.direction.vx * (AppState.speed / 100);
            p.vy = path.direction.vy * (AppState.speed / 100);
        }
    });
}

function updateParticleSize() {
    // Particle size được cập nhật khi tạo mới
}

function regenerateParticles() {
    AppState.particles = [];
    AppState.paths.forEach((path, index) => {
        generateParticlesInPath(path, index);
    });
    showNotification(`🔄 Tái tạo ${AppState.particles.length} particles`);
}

// ============================================
// EXPORT - Tạo file kết hợp đơn giản
// ============================================
function exportComposite() {
    if (!AppState.background) {
        showNotification('⚠️ Chưa có GIF để export!');
        return;
    }
    
    showNotification('🎬 Đang tạo ảnh kết hợp...');
    
    // Tạo canvas tạm để vẽ kết quả cuối cùng
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = AppState.canvas.width;
    exportCanvas.height = AppState.canvas.height;
    const exportCtx = exportCanvas.getContext('2d');
    
    // 1. Vẽ nền
    exportCtx.drawImage(AppState.background, 0, 0, exportCanvas.width, exportCanvas.height);
    
    // 2. Vẽ particles
    AppState.particles.forEach(p => {
        exportCtx.save();
        exportCtx.translate(p.x, p.y);
        
        if (AppState.material && AppState.material.complete) {
            exportCtx.drawImage(AppState.material, -p.size/2, -p.size/2, p.size, p.size);
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
    
    // 3. Tạo link download
    const dataUrl = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `motion-sim-export-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('✅ Đã xuất file PNG! (GIF export đang phát triển)');
}

// ============================================
// UI HELPER
// ============================================
function showNotification(msg) {
    const noti = document.getElementById('notification');
    noti.textContent = msg;
    noti.style.display = 'block';
    setTimeout(() => {
        noti.style.display = 'none';
    }, 3000);
}

// ============================================
// KHỞI ĐỘNG ỨNG DỤNG
// ============================================
document.addEventListener('DOMContentLoaded', init);
