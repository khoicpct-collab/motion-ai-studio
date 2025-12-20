// MOTION AI STUDIO - COMPLETE APPLICATION
// Industrial Motion Simulation with GIF Overlay

console.log('🚀 Motion AI Studio - Industrial Edition v2.0');

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    VERSION: '2.0 Industrial',
    CANVAS_WIDTH: 1920,
    CANVAS_HEIGHT: 1080,
    MAX_PARTICLES: 500,
    MAX_PATH_POINTS: 1000,
    
    // Device-specific configurations
    DEVICE_PRESETS: {
        screw: {
            name: 'Vít Tải',
            description: 'Chuyển động xoắn ốc cho vật liệu dạng hạt',
            motionType: 'swirl',
            direction: '↗',
            speed: 60,
            particleCount: 120,
            swirlStrength: 75,
            materialSize: 15,
            color: '#4361ee'
        },
        conveyor: {
            name: 'Băng Tải',
            description: 'Chuyển động thẳng theo băng chuyền',
            motionType: 'linear',
            direction: '→',
            speed: 80,
            particleCount: 80,
            swirlStrength: 0,
            materialSize: 20,
            color: '#f8961e'
        },
        mixer: {
            name: 'Máy Trộn',
            description: 'Chuyển động hỗn hợp xoay trộn',
            motionType: 'mix',
            direction: '○',
            speed: 40,
            particleCount: 200,
            swirlStrength: 50,
            materialSize: 12,
            color: '#43aa8b'
        },
        vibrating: {
            name: 'Sàng Rung',
            description: 'Rung lắc và sàng lọc',
            motionType: 'vibrate',
            direction: '↕',
            speed: 70,
            particleCount: 150,
            swirlStrength: 30,
            materialSize: 18,
            color: '#9d4edd'
        },
        pump: {
            name: 'Bơm',
            description: 'Chảy theo đường ống',
            motionType: 'flow',
            direction: '→',
            speed: 50,
            particleCount: 100,
            swirlStrength: 20,
            materialSize: 25,
            color: '#f3722c'
        }
    },
    
    // Motion type configurations
    MOTION_TYPES: {
        swirl: { name: 'Xoắn ốc', icon: 'fas fa-sync-alt' },
        linear: { name: 'Thẳng', icon: 'fas fa-arrow-right' },
        mix: { name: 'Hỗn hợp', icon: 'fas fa-blender' },
        vibrate: { name: 'Rung', icon: 'fas fa-vihara' },
        flow: { name: 'Chảy', icon: 'fas fa-water' },
        random: { name: 'Ngẫu nhiên', icon: 'fas fa-random' }
    },
    
    // Direction mappings
    DIRECTIONS: {
        '↖': { angle: 225, name: 'Tây Bắc', x: -1, y: -1 },
        '↑': { angle: 270, name: 'Bắc', x: 0, y: -1 },
        '↗': { angle: 315, name: 'Đông Bắc', x: 1, y: -1 },
        '←': { angle: 180, name: 'Tây', x: -1, y: 0 },
        '○': { angle: 0, name: 'Xoay tròn', x: 0, y: 0, circular: true },
        '→': { angle: 0, name: 'Đông', x: 1, y: 0 },
        '↙': { angle: 135, name: 'Tây Nam', x: -1, y: 1 },
        '↓': { angle: 90, name: 'Nam', x: 0, y: 1 },
        '↘': { angle: 45, name: 'Đông Nam', x: 1, y: 1 }
    },
    
    // AI Presets
    AI_PRESETS: {
        gentle: { speed: 30, count: 80, size: 12, swirl: 40 },
        intense: { speed: 90, count: 200, size: 8, swirl: 90 },
        natural: { speed: 50, count: 120, size: 15, swirl: 60 }
    }
};

// ============================================
// APPLICATION STATE
// ============================================
const AppState = {
    // Canvas & Rendering
    canvas: null,
    ctx: null,
    drawCanvas: null,
    drawCtx: null,
    
    // Media
    background: null,
    backgroundType: null, // 'gif', 'video', 'image'
    backgroundFrames: [],
    backgroundFrameIndex: 0,
    backgroundPlaying: false,
    material: null,
    
    // Drawing & Selection
    selectedTool: 'select',
    isDrawing: false,
    isEditing: false,
    currentPath: [],
    selectionArea: null,
    editPoints: [],
    brushSize: 3,
    
    // Motion Simulation
    particles: [],
    motionType: 'swirl',
    direction: '↗',
    speed: 50,
    particleCount: 120,
    materialSize: 15,
    swirlStrength: 75,
    isAnimating: false,
    animationId: null,
    
    // UI State
    zoomLevel: 1.0,
    panOffset: { x: 0, y: 0 },
    selectedDevice: 'screw',
    exportProgress: 0,
    notifications: [],
    
    // Performance
    fps: 60,
    lastFrameTime: 0,
    frameCount: 0,
    memoryUsage: '45MB'
};

// ============================================
// INITIALIZATION
// ============================================
function init() {
    console.log('Initializing Motion AI Studio...');
    
    // Initialize canvases
    AppState.canvas = document.getElementById('mainCanvas');
    AppState.ctx = AppState.canvas.getContext('2d');
    AppState.drawCanvas = document.getElementById('drawCanvas');
    AppState.drawCtx = AppState.drawCanvas.getContext('2d');
    
    // Set canvas dimensions
    updateCanvasSize();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup UI controls
    setupUIControls();
    
    // Initialize particles
    createParticles();
    
    // Start animation loop
    requestAnimationFrame(animate);
    
    // Show welcome
    showNotification('🚀 Motion AI Studio đã sẵn sàng!', 'success');
    updateStatus('Chào mừng đến với công cụ mô phỏng chuyển động công nghiệp');
    
    console.log('✅ Application initialized successfully');
}

// ============================================
// CANVAS SETUP
// ============================================
function updateCanvasSize() {
    const container = document.getElementById('canvasWrapper');
    const rect = container.getBoundingClientRect();
    
    // Update canvas display size
    AppState.canvas.style.width = rect.width + 'px';
    AppState.canvas.style.height = rect.height + 'px';
    AppState.drawCanvas.style.width = rect.width + 'px';
    AppState.drawCanvas.style.height = rect.height + 'px';
    
    // Update canvas drawing buffer size
    AppState.canvas.width = CONFIG.CANVAS_WIDTH;
    AppState.canvas.height = CONFIG.CANVAS_HEIGHT;
    AppState.drawCanvas.width = CONFIG.CANVAS_WIDTH;
    AppState.drawCanvas.height = CONFIG.CANVAS_HEIGHT;
    
    // Update status display
    document.getElementById('canvasStats').textContent = 
        `Kích thước: ${CONFIG.CANVAS_WIDTH}x${CONFIG.CANVAS_HEIGHT} | Zoom: ${Math.round(AppState.zoomLevel * 100)}%`;
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================
function setupEventListeners() {
    // Canvas events
    AppState.canvas.addEventListener('mousedown', handleCanvasMouseDown);
    AppState.canvas.addEventListener('mousemove', handleCanvasMouseMove);
    AppState.canvas.addEventListener('mouseup', handleCanvasMouseUp);
    AppState.canvas.addEventListener('dblclick', handleCanvasDoubleClick);
    
    // Window events
    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('keydown', handleKeyDown);
    
    // File upload events
    document.getElementById('uploadBackground').addEventListener('change', handleBackgroundUpload);
    document.getElementById('uploadMaterial').addEventListener('change', handleMaterialUpload);
    document.getElementById('gifUploadArea').addEventListener('click', () => document.getElementById('uploadBackground').click());
    document.getElementById('materialUploadArea').addEventListener('click', () => document.getElementById('uploadMaterial').click());
    
    // Tool selection
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tool = this.dataset.tool;
            selectTool(tool);
            showNotification(`🛠 Công cụ: ${getToolName(tool)}`, 'info');
        });
    });
    
    // Device presets
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const device = this.dataset.preset;
            applyDevicePreset(device);
        });
    });
    
    // Direction buttons
    document.querySelectorAll('.dir-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const dir = this.dataset.dir;
            setDirection(dir);
        });
    });
    
    // AI buttons
    document.querySelectorAll('.ai-preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const preset = this.dataset.preset;
            applyAIPreset(preset);
        });
    });
    
    // Export buttons
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const format = this.dataset.format;
            selectExportFormat(format);
        });
    });
    
    // Modal controls
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Help button
    document.getElementById('helpBtn').addEventListener('click', showTutorial);
}

// ============================================
// UI CONTROLS SETUP
// ============================================
function setupUIControls() {
    // Sliders
    setupSlider('motionSpeed', value => {
        AppState.speed = parseInt(value);
        document.getElementById('motionSpeedValue').textContent = value;
        updateParticleVelocity();
    });
    
    setupSlider('particleCount', value => {
        AppState.particleCount = Math.min(parseInt(value), CONFIG.MAX_PARTICLES);
        document.getElementById('particleCountValue').textContent = value;
        createParticles();
    });
    
    setupSlider('materialSize', value => {
        AppState.materialSize = parseInt(value);
        document.getElementById('materialSizeValue').textContent = value;
        updateParticleSize();
    });
    
    setupSlider('swirlStrength', value => {
        AppState.swirlStrength = parseInt(value);
        document.getElementById('swirlValue').textContent = value;
        updateParticleMotion();
    });
    
    setupSlider('brushSize', value => {
        AppState.brushSize = parseInt(value);
        document.getElementById('brushSizeValue').textContent = value;
    });
    
    setupSlider('playbackSpeed', value => {
        const percent = parseInt(value);
        document.getElementById('speedPercent').textContent = percent + '%';
        // Update animation speed if needed
    });
    
    setupSlider('durationSlider', value => {
        document.getElementById('durationValue').textContent = value;
    });
    
    // Animation controls
    document.getElementById('playBtn').addEventListener('click', toggleAnimation);
    document.getElementById('pauseBtn').addEventListener('click', pauseAnimation);
    document.getElementById('stopBtn').addEventListener('click', stopAnimation);
    
    // Canvas controls
    document.getElementById('zoomInBtn').addEventListener('click', () => zoomCanvas(1.2));
    document.getElementById('zoomOutBtn').addEventListener('click', () => zoomCanvas(0.8));
    document.getElementById('resetViewBtn').addEventListener('click', resetView);
    
    // Clear button
    document.getElementById('clearPathBtn').addEventListener('click', clearSelection);
    
    // Export button
    document.getElementById('exportBtn').addEventListener('click', startExport);
    
    // AI action buttons
    document.getElementById('aiDetectMotion').addEventListener('click', detectMotionWithAI);
    document.getElementById('aiOptimizePath').addEventListener('click', optimizePathWithAI);
    document.getElementById('aiSuggestParams').addEventListener('click', suggestParametersWithAI);
    
    // Demo button
    document.getElementById('loadScrewDemo').addEventListener('click', loadScrewConveyorDemo);
}

function setupSlider(id, callback) {
    const slider = document.getElementById(id);
    const valueElement = document.getElementById(id + 'Value');
    
    if (slider && callback) {
        slider.addEventListener('input', function() {
            callback(this.value);
        });
    }
}

// ============================================
// FILE UPLOAD HANDLERS
// ============================================
async function handleBackgroundUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    showNotification(`📁 Đang tải file: ${file.name}`, 'info');
    updateStatus('Đang xử lý file nền...');
    
    const reader = new FileReader();
    
    reader.onload = async function(e) {
        const url = e.target.result;
        const fileType = file.type;
        
        try {
            if (fileType.includes('gif')) {
                await loadGIF(url);
                AppState.backgroundType = 'gif';
                showNotification('✅ GIF nền đã tải thành công!', 'success');
            } else if (fileType.includes('video')) {
                await loadVideo(url);
                AppState.backgroundType = 'video';
                showNotification('✅ Video nền đã tải thành công!', 'success');
            } else if (fileType.includes('image')) {
                await loadImage(url);
                AppState.backgroundType = 'image';
                showNotification('✅ Ảnh nền đã tải thành công!', 'success');
            }
            
            updateStatus(`Nền: ${file.name}`);
            drawCanvas();
        } catch (error) {
            console.error('Error loading background:', error);
            showNotification('❌ Lỗi khi tải file nền', 'error');
        }
    };
    
    reader.readAsDataURL(file);
}

async function handleMaterialUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    showNotification(`🎨 Đang tải vật liệu: ${file.name}`, 'info');
    updateStatus('Đang xử lý ảnh vật liệu...');
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        
        img.onload = function() {
            AppState.material = img;
            updateParticleMaterial();
            document.getElementById('materialStatus').textContent = file.name;
            showNotification('✅ Vật liệu đã tải thành công!', 'success');
        };
        
        img.onerror = function() {
            showNotification('❌ Lỗi khi tải ảnh vật liệu', 'error');
        };
        
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

async function loadGIF(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            AppState.background = img;
            // For GIF, we'll just use the first frame
            // In a full implementation, you'd parse all frames
            resolve();
        };
        img.onerror = reject;
        img.src = url;
    });
}

async function loadVideo(url) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = url;
        video.crossOrigin = 'anonymous';
        video.preload = 'auto';
        
        video.onloadeddata = () => {
            // Capture first frame
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            AppState.background = new Image();
            AppState.background.src = canvas.toDataURL();
            AppState.background.onload = resolve;
        };
        
        video.onerror = reject;
    });
}

async function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            AppState.background = img;
            resolve();
        };
        img.onerror = reject;
        img.src = url;
    });
}

// ============================================
// DRAWING & SELECTION
// ============================================
function selectTool(tool) {
    AppState.selectedTool = tool;
    AppState.isDrawing = false;
    AppState.isEditing = false;
    
    // Update UI
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tool === tool);
    });
    
    // Show/hide direction overlay
    const directionOverlay = document.getElementById('directionOverlay');
    if (tool === 'pen' || tool === 'rect') {
        directionOverlay.style.display = 'block';
    } else {
        directionOverlay.style.display = 'none';
    }
    
    // Clear current path if switching tools
    if (tool !== 'edit') {
        AppState.currentPath = [];
        AppState.editPoints = [];
    }
    
    // Update canvas cursor
    updateCanvasCursor();
}

function getToolName(tool) {
    const names = {
        'select': 'Chọn',
        'pen': 'Pen Tool',
        'rect': 'Hình chữ nhật',
        'edit': 'Sửa điểm'
    };
    return names[tool] || tool;
}

function handleCanvasMouseDown(event) {
    if (AppState.selectedTool === 'select') return;
    
    const rect = AppState.canvas.getBoundingClientRect();
    const scaleX = CONFIG.CANVAS_WIDTH / rect.width;
    const scaleY = CONFIG.CANVAS_HEIGHT / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    AppState.isDrawing = true;
    
    if (AppState.selectedTool === 'pen') {
        // Start new freehand path
        AppState.currentPath = [{ x, y }];
        AppState.selectionArea = null;
    } else if (AppState.selectedTool === 'rect') {
        // Start rectangle selection
        AppState.selectionArea = { x, y, width: 0, height: 0 };
        AppState.currentPath = [];
    } else if (AppState.selectedTool === 'edit') {
        // Handle edit point selection
        selectEditPoint(x, y);
    }
    
    drawCanvas();
}

function handleCanvasMouseMove(event) {
    if (!AppState.isDrawing) return;
    
    const rect = AppState.canvas.getBoundingClientRect();
    const scaleX = CONFIG.CANVAS_WIDTH / rect.width;
    const scaleY = CONFIG.CANVAS_HEIGHT / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    if (AppState.selectedTool === 'pen') {
        // Add point to freehand path
        AppState.currentPath.push({ x, y });
    } else if (AppState.selectedTool === 'rect' && AppState.selectionArea) {
        // Update rectangle dimensions
        AppState.selectionArea.width = x - AppState.selectionArea.x;
        AppState.selectionArea.height = y - AppState.selectionArea.y;
    } else if (AppState.selectedTool === 'edit' && AppState.selectedEditPoint) {
        // Move edit point
        AppState.selectedEditPoint.x = x;
        AppState.selectedEditPoint.y = y;
    }
    
    drawCanvas();
}

function handleCanvasMouseUp() {
    if (!AppState.isDrawing) return;
    
    AppState.isDrawing = false;
    
    if (AppState.selectedTool === 'pen' && AppState.currentPath.length > 1) {
        // Create selection area from freehand path
        createSelectionFromPath();
        showNotification(`✅ Đã tạo vùng chọn tự do với ${AppState.currentPath.length} điểm`, 'success');
    } else if (AppState.selectedTool === 'rect' && AppState.selectionArea) {
        // Finalize rectangle selection
        const area = AppState.selectionArea;
        area.width = Math.abs(area.width);
        area.height = Math.abs(area.height);
        
        if (area.width > 10 && area.height > 10) {
            createEditPointsFromArea(area);
            showNotification(`✅ Đã tạo vùng chọn hình chữ nhật`, 'success');
        }
    }
    
    // Update status
    if (AppState.editPoints.length > 0) {
        document.getElementById('selectionStatus').textContent = 'Đã chọn';
    }
    
    drawCanvas();
}

function handleCanvasDoubleClick(event) {
    if (AppState.selectedTool === 'pen' || AppState.selectedTool === 'rect') {
        // Finish drawing and create selection
        if (AppState.currentPath.length > 2) {
            createSelectionFromPath();
            showNotification('✅ Hoàn thành vẽ vùng chọn (double click)', 'success');
        } else if (AppState.selectionArea) {
            createEditPointsFromArea(AppState.selectionArea);
            showNotification('✅ Hoàn thành vẽ hình chữ nhật (double click)', 'success');
        }
        
        // Switch back to select tool
        selectTool('select');
    }
}

function createSelectionFromPath() {
    if (AppState.currentPath.length < 3) return;
    
    // Convert path to polygon points
    AppState.editPoints = [...AppState.currentPath];
    
    // Create convex hull (simplified)
    if (AppState.editPoints.length > 10) {
        AppState.editPoints = simplifyPath(AppState.editPoints, 5);
    }
}

function createEditPointsFromArea(area) {
    // Create 4 edit points for rectangle corners
    AppState.editPoints = [
        { x: area.x, y: area.y },
        { x: area.x + area.width, y: area.y },
        { x: area.x + area.width, y: area.y + area.height },
        { x: area.x, y: area.y + area.height }
    ];
}

function selectEditPoint(x, y) {
    // Find edit point near click position
    const threshold = 10;
    
    for (const point of AppState.editPoints) {
        const distance = Math.sqrt(
            Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
        );
        
        if (distance < threshold) {
            AppState.selectedEditPoint = point;
            return;
        }
    }
    
    AppState.selectedEditPoint = null;
}

function simplifyPath(points, tolerance) {
    if (points.length <= 2) return points;
    
    // Douglas-Peucker simplification
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    let maxDistance = 0;
    let maxIndex = 0;
    
    for (let i = 1; i < points.length - 1; i++) {
        const distance = perpendicularDistance(points[i], firstPoint, lastPoint);
        if (distance > maxDistance) {
            maxDistance = distance;
            maxIndex = i;
        }
    }
    
    if (maxDistance > tolerance) {
        const left = simplifyPath(points.slice(0, maxIndex + 1), tolerance);
        const right = simplifyPath(points.slice(maxIndex), tolerance);
        return left.slice(0, -1).concat(right);
    } else {
        return [firstPoint, lastPoint];
    }
}

function perpendicularDistance(point, lineStart, lineEnd) {
    const area = Math.abs(
        (lineEnd.x - lineStart.x) * (lineStart.y - point.y) -
        (lineStart.x - point.x) * (lineEnd.y - lineStart.y)
    );
    const lineLength = Math.sqrt(
        Math.pow(lineEnd.x - lineStart.x, 2) + Math.pow(lineEnd.y - lineStart.y, 2)
    );
    return lineLength > 0 ? area / lineLength : 0;
}

function clearSelection() {
    AppState.currentPath = [];
    AppState.selectionArea = null;
    AppState.editPoints = [];
    AppState.selectedEditPoint = null;
    
    document.getElementById('selectionStatus').textContent = 'Chưa có';
    showNotification('🗑️ Đã xóa vùng chọn', 'info');
    drawCanvas();
}

// ============================================
// PARTICLE SYSTEM
// ============================================
function createParticles() {
    AppState.particles = [];
    
    // Create particles within selection area
    const bounds = getSelectionBounds();
    
    if (!bounds || bounds.width === 0 || bounds.height === 0) {
        // No selection, create particles randomly
        for (let i = 0; i < AppState.particleCount; i++) {
            AppState.particles.push(createParticle(
                Math.random() * CONFIG.CANVAS_WIDTH,
                Math.random() * CONFIG.CANVAS_HEIGHT
            ));
        }
    } else {
        // Create particles within selection bounds
        for (let i = 0; i < AppState.particleCount; i++) {
            AppState.particles.push(createParticle(
                bounds.x + Math.random() * bounds.width,
                bounds.y + Math.random() * bounds.height
            ));
        }
    }
}

function createParticle(x, y) {
    const direction = CONFIG.DIRECTIONS[AppState.direction];
    const speed = AppState.speed / 50;
    
    return {
        x,
        y,
        vx: direction.x * speed * (0.5 + Math.random() * 0.5),
        vy: direction.y * speed * (0.5 + Math.random() * 0.5),
        size: AppState.materialSize * (0.5 + Math.random()),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        life: 1.0,
        age: Math.random() * 100,
        color: getParticleColor(),
        isInSelection: true
    };
}

function getParticleColor() {
    const preset = CONFIG.DEVICE_PRESETS[AppState.selectedDevice];
    return preset ? preset.color : '#4361ee';
}

function updateParticles(deltaTime) {
    const bounds = getSelectionBounds();
    const isCircular = AppState.direction === '○';
    const swirl = AppState.swirlStrength / 100;
    
    for (const particle of AppState.particles) {
        // Update age
        particle.age += deltaTime * 0.001;
        particle.life = 0.5 + 0.5 * Math.sin(particle.age * 0.5);
        
        // Check if particle is within selection
        particle.isInSelection = isPointInSelection(particle.x, particle.y, bounds);
        
        if (!particle.isInSelection && bounds) {
            // Move particle back toward selection
            const centerX = bounds.x + bounds.width / 2;
            const centerY = bounds.y + bounds.height / 2;
            particle.vx += (centerX - particle.x) * 0.01;
            particle.vy += (centerY - particle.y) * 0.01;
        }
        
        // Apply motion based on type
        switch(AppState.motionType) {
            case 'swirl':
                // Spiral motion
                const angle = particle.age * (1 + swirl);
                const radius = 20 + swirl * 50;
                particle.x += Math.cos(angle) * radius * deltaTime * 0.001;
                particle.y += Math.sin(angle) * radius * deltaTime * 0.001;
                break;
                
            case 'linear':
                // Linear motion with direction
                particle.x += particle.vx;
                particle.y += particle.vy;
                break;
                
            case 'mix':
                // Mixing motion
                particle.x += (Math.sin(particle.age * 2) + particle.vx) * 0.5;
                particle.y += (Math.cos(particle.age * 1.5) + particle.vy) * 0.5;
                break;
                
            case 'vibrate':
                // Vibrating motion
                particle.x += (Math.random() - 0.5) * 10 * swirl;
                particle.y += (Math.random() - 0.5) * 10 * swirl;
                break;
                
            default:
                // Default flow motion
                particle.x += particle.vx;
                particle.y += particle.vy;
        }
        
        // Apply rotation
        particle.rotation += particle.rotationSpeed;
        
        // Keep particles within canvas
        if (particle.x < 0) particle.x = CONFIG.CANVAS_WIDTH;
        if (particle.x > CONFIG.CANVAS_WIDTH) particle.x = 0;
        if (particle.y < 0) particle.y = CONFIG.CANVAS_HEIGHT;
        if (particle.y > CONFIG.CANVAS_HEIGHT) particle.y = 0;
    }
}

function updateParticleVelocity() {
    const direction = CONFIG.DIRECTIONS[AppState.direction];
    const speed = AppState.speed / 50;
    
    for (const particle of AppState.particles) {
        particle.vx = direction.x * speed * (0.5 + Math.random() * 0.5);
        particle.vy = direction.y * speed * (0.5 + Math.random() * 0.5);
    }
}

function updateParticleSize() {
    for (const particle of AppState.particles) {
        particle.size = AppState.materialSize * (0.5 + Math.random());
    }
}

function updateParticleMaterial() {
    // Material is drawn in render function
}

// ============================================
// SELECTION HELPERS
// ============================================
function getSelectionBounds() {
    if (AppState.editPoints.length === 0) return null;
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    for (const point of AppState.editPoints) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
    }
    
    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
}

function isPointInSelection(x, y, bounds) {
    if (!bounds) return true;
    
    // Simple bounding box check
    // For polygon selection, you'd implement point-in-polygon algorithm
    return x >= bounds.x && x <= bounds.x + bounds.width &&
           y >= bounds.y && y <= bounds.y + bounds.height;
}

// ============================================
// DEVICE PRESETS
// ============================================
function applyDevicePreset(device) {
    const preset = CONFIG.DEVICE_PRESETS[device];
    if (!preset) return;
    
    AppState.selectedDevice = device;
    
    // Update UI
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === device);
    });
    
    // Apply preset values
    setDirection(preset.direction);
    AppState.motionType = preset.motionType;
    AppState.speed = preset.speed;
    AppState.particleCount = preset.particleCount;
    AppState.swirlStrength = preset.swirlStrength;
    AppState.materialSize = preset.materialSize;
    
    // Update sliders
    document.getElementById('motionSpeed').value = preset.speed;
    document.getElementById('motionSpeedValue').textContent = preset.speed;
    document.getElementById('particleCount').value = preset.particleCount;
    document.getElementById('particleCountValue').textContent = preset.particleCount;
    document.getElementById('swirlStrength').value = preset.swirlStrength;
    document.getElementById('swirlValue').textContent = preset.swirlStrength;
    document.getElementById('materialSize').value = preset.materialSize;
    document.getElementById('materialSizeValue').textContent = preset.materialSize;
    
    // Create new particles
    createParticles();
    
    // Update status
    updateStatus(`Thiết bị: ${preset.name}`);
    showNotification(`🏭 Áp dụng mẫu: ${preset.name}`, 'success');
}

function setDirection(direction) {
    if (!CONFIG.DIRECTIONS[direction]) return;
    
    AppState.direction = direction;
    
    // Update UI
    document.getElementById('selectedDirection').textContent = direction;
    document.getElementById('directionText').textContent = 
        `${CONFIG.DIRECTIONS[direction].name} (${CONFIG.DIRECTIONS[direction].angle}°)`;
    
    // Update particle velocity
    updateParticleVelocity();
    
    showNotification(`↖ Hướng: ${CONFIG.DIRECTIONS[direction].name}`, 'info');
}

// ============================================
// AI FUNCTIONS
// ============================================
function applyAIPreset(preset) {
    const aiPreset = CONFIG.AI_PRESETS[preset];
    if (!aiPreset) return;
    
    // Apply AI suggestions
    AppState.speed = aiPreset.speed;
    AppState.particleCount = aiPreset.count;
    AppState.materialSize = aiPreset.size;
    AppState.swirlStrength = aiPreset.swirl;
    
    // Update UI
    document.getElementById('motionSpeed').value = aiPreset.speed;
    document.getElementById('motionSpeedValue').textContent = aiPreset.speed;
    document.getElementById('particleCount').value = aiPreset.count;
    document.getElementById('particleCountValue').textContent = aiPreset.count;
    document.getElementById('materialSize').value = aiPreset.size;
    document.getElementById('materialSizeValue').textContent = aiPreset.size;
    document.getElementById('swirlStrength').value = aiPreset.swirl;
    document.getElementById('swirlValue').textContent = aiPreset.swirl;
    
    createParticles();
    
    showNotification(`🤖 Áp dụng AI preset: ${preset}`, 'success');
}

function detectMotionWithAI() {
    showNotification('🤖 AI đang phân tích chuyển động từ GIF...', 'info');
    
    setTimeout(() => {
        // Simulate AI analysis
        const suggestedDirection = Math.random() > 0.5 ? '→' : '↗';
        const suggestedSpeed = 40 + Math.random() * 40;
        
        setDirection(suggestedDirection);
        AppState.speed = Math.round(suggestedSpeed);
        
        document.getElementById('motionSpeed').value = AppState.speed;
        document.getElementById('motionSpeedValue').textContent = AppState.speed;
        
        showNotification('✅ AI đã phát hiện chuyển động và đề xuất thông số', 'success');
    }, 1500);
}

function optimizePathWithAI() {
    if (AppState.editPoints.length < 3) {
        showNotification('⚠ Chưa có vùng chọn để tối ưu', 'warning');
        return;
    }
    
    showNotification('🤖 AI đang tối ưu đường đi...', 'info');
    
    setTimeout(() => {
        // Simulate AI optimization
        if (AppState.editPoints.length > 10) {
            AppState.editPoints = simplifyPath(AppState.editPoints, 10);
        }
        
        // Smooth the path
        AppState.editPoints = smoothPath(AppState.editPoints);
        
        showNotification('✅ Đường đi đã được tối ưu hóa', 'success');
        drawCanvas();
    }, 1000);
}

function smoothPath(points) {
    if (points.length < 3) return points;
    
    const smoothed = [];
    for (let i = 0; i < points.length; i++) {
        const prev = points[i > 0 ? i - 1 : points.length - 1];
        const current = points[i];
        const next = points[i < points.length - 1 ? i + 1 : 0];
        
        smoothed.push({
            x: (prev.x + current.x + next.x) / 3,
            y: (prev.y + current.y + next.y) / 3
        });
    }
    
    return smoothed;
}

function suggestParametersWithAI() {
    showNotification('🤖 AI đang phân tích và đề xuất thông số...', 'info');
    
    setTimeout(() => {
        // Simulate AI suggestions based on selection
        const bounds = getSelectionBounds();
        let suggestions = {};
        
        if (bounds) {
            const area = bounds.width * bounds.height;
            suggestions.particleCount = Math.min(500, Math.max(50, Math.round(area / 100)));
            suggestions.materialSize = Math.min(30, Math.max(5, Math.round(Math.sqrt(area) / 20)));
            
            if (bounds.width > bounds.height * 2) {
                suggestions.direction = '→';
                suggestions.motionType = 'linear';
            } else if (bounds.height > bounds.width * 2) {
                suggestions.direction = '↓';
                suggestions.motionType = 'linear';
            } else {
                suggestions.direction = '○';
                suggestions.motionType = 'swirl';
            }
            
            // Apply suggestions
            if (suggestions.direction) setDirection(suggestions.direction);
            if (suggestions.particleCount) {
                AppState.particleCount = suggestions.particleCount;
                document.getElementById('particleCount').value = suggestions.particleCount;
                document.getElementById('particleCountValue').textContent = suggestions.particleCount;
            }
            if (suggestions.materialSize) {
                AppState.materialSize = suggestions.materialSize;
                document.getElementById('materialSize').value = suggestions.materialSize;
                document.getElementById('materialSizeValue').textContent = suggestions.materialSize;
            }
            
            createParticles();
        }
        
        showNotification('✅ AI đã đề xuất thông số tối ưu', 'success');
    }, 2000);
}

// ============================================
// ANIMATION CONTROLS
// ============================================
function toggleAnimation() {
    AppState.isAnimating = !AppState.isAnimating;
    
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (AppState.isAnimating) {
        playBtn.innerHTML = '<i class="fas fa-pause"></i> Tạm dừng';
        pauseBtn.disabled = false;
        showNotification('▶ Bắt đầu mô phỏng', 'success');
    } else {
        playBtn.innerHTML = '<i class="fas fa-play"></i> Xem trước';
        pauseBtn.disabled = true;
        showNotification('⏸ Tạm dừng mô phỏng', 'info');
    }
}

function pauseAnimation() {
    AppState.isAnimating = false;
    document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i> Xem trước';
    showNotification('⏸ Đã tạm dừng', 'info');
}

function stopAnimation() {
    AppState.isAnimating = false;
    createParticles(); // Reset particles
    document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i> Xem trước';
    showNotification('⏹ Dừng mô phỏng', 'info');
}

// ============================================
// CANVAS RENDERING
// ============================================
function drawCanvas() {
    // Clear canvases
    AppState.ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    AppState.drawCtx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    // Draw background if exists
    if (AppState.background) {
        AppState.ctx.drawImage(
            AppState.background, 
            0, 0, 
            CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT
        );
    }
    
    // Draw particles
    renderParticles();
    
    // Draw selection and edit points on draw canvas
    renderSelection();
    
    // Draw current drawing path
    renderDrawingPath();
}

function renderParticles() {
    for (const particle of AppState.particles) {
        AppState.ctx.save();
        AppState.ctx.translate(particle.x, particle.y);
        AppState.ctx.rotate(particle.rotation);
        AppState.ctx.globalAlpha = particle.life;
        
        if (AppState.material) {
            // Draw material image
            AppState.ctx.drawImage(
                AppState.material,
                -particle.size / 2,
                -particle.size / 2,
                particle.size,
                particle.size
            );
        } else {
            // Draw colored shape
            AppState.ctx.fillStyle = particle.color;
            AppState.ctx.beginPath();
            
            // Different shapes for different motion types
            switch(AppState.motionType) {
                case 'swirl':
                    // Spiral shape
                    AppState.ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
                    break;
                case 'vibrate':
                    // Square for vibrating
                    AppState.ctx.rect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                    break;
                default:
                    // Circle for others
                    AppState.ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
            }
            
            AppState.ctx.fill();
        }
        
        AppState.ctx.restore();
    }
}

function renderSelection() {
    if (AppState.editPoints.length === 0) return;
    
    AppState.drawCtx.save();
    
    // Draw selection area
    AppState.drawCtx.strokeStyle = 'rgba(67, 97, 238, 0.8)';
    AppState.drawCtx.lineWidth = 2;
    AppState.drawCtx.setLineDash([5, 5]);
    
    AppState.drawCtx.beginPath();
    AppState.drawCtx.moveTo(AppState.editPoints[0].x, AppState.editPoints[0].y);
    
    for (let i = 1; i < AppState.editPoints.length; i++) {
        AppState.drawCtx.lineTo(AppState.editPoints[i].x, AppState.editPoints[i].y);
    }
    
    AppState.drawCtx.closePath();
    AppState.drawCtx.stroke();
    
    // Fill with transparent color
    AppState.drawCtx.fillStyle = 'rgba(67, 97, 238, 0.1)';
    AppState.drawCtx.fill();
    
    // Draw edit points
    AppState.drawCtx.setLineDash([]);
    
    for (const point of AppState.editPoints) {
        AppState.drawCtx.fillStyle = 'white';
        AppState.drawCtx.strokeStyle = '#4361ee';
        AppState.drawCtx.lineWidth = 2;
        
        AppState.drawCtx.beginPath();
        AppState.drawCtx.arc(point.x, point.y, 6, 0, Math.PI * 2);
        AppState.drawCtx.fill();
        AppState.drawCtx.stroke();
        
        // Draw point handle
        AppState.drawCtx.beginPath();
        AppState.drawCtx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        AppState.drawCtx.fillStyle = '#4361ee';
        AppState.drawCtx.fill();
    }
    
    AppState.drawCtx.restore();
}

function renderDrawingPath() {
    if (AppState.currentPath.length === 0 && !AppState.selectionArea) return;
    
    AppState.drawCtx.save();
    
    // Draw current drawing path
    if (AppState.currentPath.length > 0) {
        AppState.drawCtx.strokeStyle = '#4cc9f0';
        AppState.drawCtx.lineWidth = AppState.brushSize;
        AppState.drawCtx.lineJoin = 'round';
        AppState.drawCtx.lineCap = 'round';
        
        AppState.drawCtx.beginPath();
        AppState.drawCtx.moveTo(AppState.currentPath[0].x, AppState.currentPath[0].y);
        
        for (let i = 1; i < AppState.currentPath.length; i++) {
            AppState.drawCtx.lineTo(AppState.currentPath[i].x, AppState.currentPath[i].y);
        }
        
        AppState.drawCtx.stroke();
    }
    
    // Draw rectangle selection in progress
    if (AppState.selectionArea) {
        AppState.drawCtx.strokeStyle = '#f8961e';
        AppState.drawCtx.lineWidth = 2;
        AppState.drawCtx.setLineDash([3, 3]);
        
        AppState.drawCtx.strokeRect(
            AppState.selectionArea.x,
            AppState.selectionArea.y,
            AppState.selectionArea.width,
            AppState.selectionArea.height
        );
    }
    
    AppState.drawCtx.restore();
}

// ============================================
// ANIMATION LOOP
// ============================================
function animate(timestamp) {
    // Calculate delta time
    const deltaTime = timestamp - AppState.lastFrameTime || 16;
    AppState.lastFrameTime = timestamp;
    
    // Calculate FPS
    AppState.frameCount++;
    if (timestamp >= AppState.lastFrameTime + 1000) {
        AppState.fps = Math.round((AppState.frameCount * 1000) / (timestamp - AppState.lastFrameTime));
        AppState.frameCount = 0;
        AppState.lastFrameTime = timestamp;
        
        // Update FPS display
        document.getElementById('fpsCounter').textContent = AppState.fps;
    }
    
    // Update particles if animating
    if (AppState.isAnimating) {
        updateParticles(deltaTime);
    }
    
    // Draw everything
    drawCanvas();
    
    // Continue animation loop
    requestAnimationFrame(animate);
}

// ============================================
// EXPORT FUNCTIONS
// ============================================
function selectExportFormat(format) {
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.format === format);
    });
    
    AppState.exportFormat = format;
    showNotification(`📤 Đã chọn định dạng xuất: ${format.toUpperCase()}`, 'info');
}

function startExport() {
    if (!AppState.background) {
        showNotification('⚠ Chưa có file nền để xuất', 'warning');
        return;
    }
    
    showExportModal();
    simulateExportProcess();
}

function showExportModal() {
    const modal = document.getElementById('exportModal');
    modal.classList.add('active');
    
    // Update export details
    document.getElementById('exportFormat').textContent = 
        AppState.exportFormat ? AppState.exportFormat.toUpperCase() : 'GIF';
    document.getElementById('exportDuration').textContent = 
        document.getElementById('durationValue').textContent + ' giây';
}

function simulateExportProcess() {
    const duration = parseInt(document.getElementById('durationValue').textContent);
    const fps = parseInt(document.getElementById('fpsSelect').value);
    const totalFrames = duration * fps;
    
    let currentFrame = 0;
    const progressFill = document.getElementById('exportProgressFill');
    const progressText = document.getElementById('exportProgressText');
    
    const exportInterval = setInterval(() => {
        currentFrame++;
        const progress = (currentFrame / totalFrames) * 100;
        
        progressFill.style.width = progress + '%';
        progressText.textContent = `Đang xử lý khung hình ${currentFrame}/${totalFrames}...`;
        
        if (currentFrame >= totalFrames) {
            clearInterval(exportInterval);
            
            // Export complete
            setTimeout(() => {
                completeExport();
            }, 500);
        }
    }, 50);
}

function completeExport() {
    const modal = document.getElementById('exportModal');
    modal.classList.remove('active');
    
    // Create download link
    const filename = `motion-ai-export-${AppState.selectedDevice}-${Date.now()}.${AppState.exportFormat || 'gif'}`;
    
    // For demo purposes, create a data URL
    // In a real implementation, you'd use a library like GIF.js or CCapture.js
    const canvas = document.createElement('canvas');
    canvas.width = CONFIG.CANVAS_WIDTH;
    canvas.height = CONFIG.CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    
    // Draw final composite
    if (AppState.background) {
        ctx.drawImage(AppState.background, 0, 0, canvas.width, canvas.height);
    }
    
    // Draw particles
    for (const particle of AppState.particles) {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.globalAlpha = particle.life;
        
        if (AppState.material) {
            ctx.drawImage(
                AppState.material,
                -particle.size / 2,
                -particle.size / 2,
                particle.size,
                particle.size
            );
        } else {
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create download link
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showNotification(`✅ Xuất file thành công: ${filename}`, 'success');
}

// ============================================
// DEMO FUNCTION
// ============================================
function loadScrewConveyorDemo() {
    showNotification('🔄 Đang tải demo Vít Tải...', 'info');
    
    // Load demo background (using placeholder)
    const demoBackground = new Image();
    demoBackground.onload = () => {
        AppState.background = demoBackground;
        AppState.backgroundType = 'image';
        
        // Create a sample selection area (screw conveyor path)
        AppState.editPoints = [
            { x: 300, y: 300 },
            { x: 700, y: 280 },
            { x: 1100, y: 320 },
            { x: 1500, y: 290 },
            { x: 1500, y: 500 },
            { x: 1100, y: 520 },
            { x: 700, y: 480 },
            { x: 300, y: 500 }
        ];
        
        // Apply screw conveyor preset
        applyDevicePreset('screw');
        
        // Create particles
        createParticles();
        
        // Update status
        updateStatus('Demo Vít Tải đã sẵn sàng');
        document.getElementById('selectionStatus').textContent = 'Vùng vít tải';
        
        showNotification('✅ Demo Vít Tải đã tải thành công!', 'success');
        drawCanvas();
    };
    
    // Create a simple demo background
    demoBackground.src = createDemoBackground();
}

function createDemoBackground() {
    const canvas = document.createElement('canvas');
    canvas.width = CONFIG.CANVAS_WIDTH;
    canvas.height = CONFIG.CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    
    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw screw conveyor示意
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    
    ctx.beginPath();
    ctx.moveTo(300, 300);
    for (let i = 0; i <= 1200; i += 50) {
        const x = 300 + i;
        const y = 300 + Math.sin(i * 0.02) * 50;
        ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Add labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '24px Inter';
    ctx.fillText('DEMO VÍT TẢI CÔNG NGHIỆP', 500, 200);
    ctx.font = '16px Inter';
    ctx.fillText('Vùng vật liệu chuyển động được chọn bằng Pen Tool', 500, 230);
    ctx.fillText('Vật liệu di chuyển theo hướng xoắn ốc (↗)', 500, 260);
    
    return canvas.toDataURL();
}

// ============================================
// UI HELPER FUNCTIONS
// ============================================
function showNotification(message, type = 'info') {
    const notificationCenter = document.getElementById('notificationCenter');
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Create icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="notification-content">
            ${message}
        </div>
        <div class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </div>
    `;
    
    notificationCenter.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

function updateStatus(message) {
    // Update status in multiple places if needed
    console.log('Status:', message);
}

function updateCanvasCursor() {
    const cursorMap = {
        'select': 'default',
        'pen': 'crosshair',
        'rect': 'crosshair',
        'edit': 'move'
    };
    
    AppState.canvas.style.cursor = cursorMap[AppState.selectedTool] || 'default';
}

function zoomCanvas(factor) {
    AppState.zoomLevel *= factor;
    AppState.zoomLevel = Math.max(0.1, Math.min(5, AppState.zoomLevel));
    
    // Update canvas transform
    AppState.canvas.style.transform = `scale(${AppState.zoomLevel})`;
    AppState.drawCanvas.style.transform = `scale(${AppState.zoomLevel})`;
    
    // Update status
    document.getElementById('canvasStats').textContent = 
        `Kích thước: ${CONFIG.CANVAS_WIDTH}x${CONFIG.CANVAS_HEIGHT} | Zoom: ${Math.round(AppState.zoomLevel * 100)}%`;
}

function resetView() {
    AppState.zoomLevel = 1.0;
    AppState.panOffset = { x: 0, y: 0 };
    
    AppState.canvas.style.transform = 'scale(1)';
    AppState.drawCanvas.style.transform = 'scale(1)';
    AppState.canvas.style.left = '0px';
    AppState.canvas.style.top = '0px';
    AppState.drawCanvas.style.left = '0px';
    AppState.drawCanvas.style.top = '0px';
    
    document.getElementById('canvasStats').textContent = 
        `Kích thước: ${CONFIG.CANVAS_WIDTH}x${CONFIG.CANVAS_HEIGHT} | Zoom: 100%`;
    
    showNotification('🔍 Đã reset view về mặc định', 'info');
}

function showTutorial() {
    document.getElementById('tutorialModal').classList.add('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

function handleKeyDown(event) {
    // Handle keyboard shortcuts
    switch(event.key.toLowerCase()) {
        case ' ':
            // Space toggles animation
            event.preventDefault();
            toggleAnimation();
            break;
        case 'escape':
            // Escape closes modals
            closeAllModals();
            break;
        case 'delete':
        case 'backspace':
            // Delete clears selection
            if (AppState.selectedTool === 'edit' || AppState.editPoints.length > 0) {
                clearSelection();
            }
            break;
        case '1':
            selectTool('select');
            break;
        case '2':
            selectTool('pen');
            break;
        case '3':
            selectTool('rect');
            break;
        case '4':
            selectTool('edit');
            break;
    }
}

// ============================================
// INITIALIZE APPLICATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Check if all required elements exist
    if (!document.getElementById('mainCanvas')) {
        console.error('Canvas element not found!');
        return;
    }
    
    // Initialize the application
    init();
    
    // Apply default device preset
    applyDevicePreset('screw');
    
    // Show initial instructions
    setTimeout(() => {
        showNotification('💡 Mẹo: Double click để kết thúc vẽ vùng chọn', 'info');
    }, 2000);
    
    // Add CSS for notifications
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem 1.5rem;
                margin-bottom: 0.75rem;
                border-radius: 8px;
                border-left: 4px solid #4361ee;
                background: rgba(33, 37, 41, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                animation: slideIn 0.3s ease;
                transition: all 0.3s ease;
            }
            
            .notification.success { border-left-color: #4cc9f0; }
            .notification.error { border-left-color: #f72585; }
            .notification.warning { border-left-color: #f8961e; }
            .notification.info { border-left-color: #4361ee; }
            
            .notification-icon {
                font-size: 1.2rem;
            }
            
            .notification.success .notification-icon { color: #4cc9f0; }
            .notification.error .notification-icon { color: #f72585; }
            .notification.warning .notification-icon { color: #f8961e; }
            .notification.info .notification-icon { color: #4361ee; }
            
            .notification-content {
                flex: 1;
                color: white;
                font-size: 0.95rem;
            }
            
            .notification-close {
                color: rgba(255, 255, 255, 0.5);
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
                transition: all 0.3s ease;
            }
            
            .notification-close:hover {
                color: white;
                background: rgba(255, 255, 255, 0.1);
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
});

// Make some functions globally available for HTML onclick handlers
window.closeAllModals = closeAllModals;
