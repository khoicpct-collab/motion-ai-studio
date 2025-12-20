// app.js - SIMPLE WORKING VERSION
console.log('🚀 AI Motion Studio - Simple Working Version');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        const appContainer = document.getElementById('app');
        
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (appContainer) appContainer.classList.remove('hidden');
        
        console.log('App UI loaded');
        showNotification('🎬 AI Motion Studio đã sẵn sàng!');
    }, 1000);
    
    // Setup basic functionality
    setupBasicFunctionality();
    
    // Draw initial canvas
    setupCanvas();
});

function setupBasicFunctionality() {
    console.log('Setting up basic functionality...');
    
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            switchTab(tabId);
        });
    });
    
    // File upload buttons
    document.getElementById('upload-bg')?.addEventListener('click', function() {
        document.getElementById('bg-file-input').click();
        showNotification('📁 Chọn file GIF hoặc ảnh làm nền');
    });
    
    document.getElementById('upload-material')?.addEventListener('click', function() {
        document.getElementById('material-file-input').click();
        showNotification('🎨 Chọn ảnh làm vật liệu chuyển động');
    });
    
    // Demo button
    document.getElementById('load-demo')?.addEventListener('click', loadDemo);
    
    // Export button
    document.getElementById('start-export')?.addEventListener('click', exportGif);
    
    // Play button
    document.getElementById('play-pause')?.addEventListener('click', togglePlay);
    
    // Tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectTool(this.dataset.tool);
        });
    });
    
    // Direction buttons
    document.querySelectorAll('.dir-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            setDirection(this.dataset.dir);
        });
    });
    
    // AI preset buttons
    document.querySelectorAll('.ai-preset').forEach(btn => {
        btn.addEventListener('click', function() {
            applyAIPreset(this.dataset.preset);
        });
    });
    
    console.log('Basic functionality setup complete');
}

function switchTab(tabId) {
    console.log('Switching to tab:', tabId);
    
    // Update tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabId}-tab`).classList.add('active');
    
    showNotification(`📑 Chuyển sang tab: ${tabId}`);
}

function selectTool(tool) {
    console.log('Selected tool:', tool);
    
    // Update UI
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    showNotification(`🛠️ Công cụ: ${tool}`);
    
    // For drawing tools, setup canvas drawing
    if (['pen', 'rectangle', 'circle'].includes(tool)) {
        setupDrawing(tool);
    }
}

function setDirection(dir) {
    console.log('Direction set to:', dir);
    
    // Update UI
    document.querySelectorAll('.dir-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
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
    
    showNotification(`🧭 Hướng: ${directions[dir] || dir}`);
}

function applyAIPreset(preset) {
    console.log('AI preset:', preset);
    
    const presets = {
        'water-flow': '💧 Dòng nước',
        'smoke': '💨 Khói',
        'fire': '🔥 Lửa',
        'particles': '✨ Hạt',
        'magic': '🌟 Phép thuật'
    };
    
    showNotification(`🎨 Áp dụng preset: ${presets[preset] || preset}`);
    
    // Update motion type
    const motionTypeSelect = document.getElementById('motion-type');
    if (motionTypeSelect) {
        if (preset === 'water-flow') motionTypeSelect.value = 'flow';
        if (preset === 'smoke') motionTypeSelect.value = 'swirl';
        if (preset === 'fire') motionTypeSelect.value = 'random';
        if (preset === 'particles') motionTypeSelect.value = 'follow';
    }
}

function setupCanvas() {
    const canvas = document.getElementById('main-canvas');
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight - 100;
    
    // Draw initial design
    drawWelcomeScreen(ctx, canvas.width, canvas.height);
    
    // Handle window resize
    window.addEventListener('resize', function() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight - 100;
        drawWelcomeScreen(ctx, canvas.width, canvas.height);
    });
    
    console.log('Canvas setup complete');
}

function drawWelcomeScreen(ctx, width, height) {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    ctx.fillText('🎬 AI Motion Studio', centerX, centerY - 60);
    
    // Draw instructions
    ctx.font = '18px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Tạo chuyển động thông minh trên GIF/ảnh', centerX, centerY - 20);
    
    ctx.font = '16px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#94a3b8';
    
    const steps = [
        '1. Upload GIF/ảnh nền',
        '2. Vẽ path với Pen tool',
        '3. Chọn hướng chuyển động',
        '4. Xuất file GIF mới'
    ];
    
    steps.forEach((step, index) => {
        ctx.fillText(step, centerX, centerY + 20 + (index * 30));
    });
    
    // Draw border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, width - 40, height - 40);
}

function setupDrawing(tool) {
    const canvas = document.getElementById('main-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let points = [];
    
    canvas.onmousedown = function(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        points = [{x, y}];
        
        showNotification('✏️ Bắt đầu vẽ path...');
    };
    
    canvas.onmousemove = function(e) {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        points.push({x, y});
        
        // Draw preview
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawWelcomeScreen(ctx, canvas.width, canvas.height);
        
        // Draw path
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
    };
    
    canvas.onmouseup = function() {
        if (!isDrawing) return;
        
        isDrawing = false;
        
        if (points.length > 5) {
            showNotification(`✅ Đã vẽ path với ${points.length} điểm`);
            
            // Show direction arrows
            showDirectionArrows(points[0].x, points[0].y);
            
            // Enable play button
            const playBtn = document.getElementById('play-pause');
            if (playBtn) {
                playBtn.disabled = false;
                playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
            }
        }
    };
}

function showDirectionArrows(x, y) {
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
        arrowEl.textContent = arrow.symbol;
        arrowEl.title = `Direction: ${arrow.dir}`;
        arrowEl.style.left = `${x + arrow.dx}px`;
        arrowEl.style.top = `${y + arrow.dy}px`;
        
        arrowEl.onclick = function(e) {
            e.stopPropagation();
            setDirection(arrow.dir);
        };
        
        overlay.appendChild(arrowEl);
    });
    
    overlay.style.display = 'block';
}

function loadDemo() {
    showNotification('🚀 Đang tải demo...');
    
    const canvas = document.getElementById('main-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw demo background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(1, '#1e40af');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw demo text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎬 Demo: Vít tải chuyển động', canvas.width/2, 100);
    
    // Draw screw conveyor
    drawScrewConveyor(ctx, canvas.width, canvas.height);
    
    // Set default direction
    setDirection('e');
    
    // Update motion type
    const motionTypeSelect = document.getElementById('motion-type');
    if (motionTypeSelect) motionTypeSelect.value = 'flow';
    
    showNotification('✅ Demo đã sẵn sàng! Thử Play animation');
}

function drawScrewConveyor(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw conveyor body
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(centerX - 200, centerY - 50, 400, 100);
    
    // Draw screw
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    
    ctx.beginPath();
    for (let i = 0; i < 400; i += 20) {
        const x = centerX - 200 + i;
        const y = centerY + Math.sin(i * 0.1) * 30;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Draw particles
    ctx.fillStyle = '#f59e0b';
    for (let i = 0; i < 10; i++) {
        const x = centerX - 180 + i * 40;
        const y = centerY + Math.sin(x * 0.1) * 30;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}

function togglePlay() {
    const btn = document.getElementById('play-pause');
    const canvas = document.getElementById('main-canvas');
    
    if (!btn || !canvas) return;
    
    if (btn.innerHTML.includes('fa-play')) {
        // Start animation
        btn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        showNotification('▶️ Bắt đầu animation');
        
        // Simple animation demo
        startParticleAnimation(canvas);
    } else {
        // Stop animation
        btn.innerHTML = '<i class="fas fa-play"></i> Play';
        showNotification('⏸️ Tạm dừng animation');
    }
}

function startParticleAnimation(canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 50;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 3 + Math.random() * 7,
            speed: 1 + Math.random() * 2,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        });
    }
    
    function animate() {
        const btn = document.getElementById('play-pause');
        if (!btn || btn.innerHTML.includes('fa-play')) return;
        
        // Clear with semi-transparent for trail effect
        ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        drawWelcomeScreen(ctx, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach(p => {
            p.x += p.speed;
            if (p.x > canvas.width) p.x = 0;
            
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

function exportGif() {
    showNotification('⏳ Đang xuất GIF...');
    
    // Show export modal
    const modal = document.getElementById('export-modal');
    if (modal) modal.style.display = 'flex';
    
    // Simulate export process
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        
        const progressFill = document.getElementById('export-progress-fill');
        const progressText = document.getElementById('export-progress-text');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) {
            const steps = [
                'Đang chuẩn bị...',
                'Đang render khung hình...',
                'Đang áp dụng hiệu ứng...',
                'Đang mã hóa GIF...',
                'Hoàn tất!'
            ];
            progressText.textContent = steps[Math.min(Math.floor(progress / 20), 4)];
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            
            // Create and download dummy GIF
            setTimeout(() => {
                const canvas = document.createElement('canvas');
                canvas.width = 400;
                canvas.height = 300;
                const ctx = canvas.getContext('2d');
                
                // Draw export image
                ctx.fillStyle = '#1e3a8a';
                ctx.fillRect(0, 0, 400, 300);
                
                ctx.fillStyle = 'white';
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🎬 AI Motion Studio', 200, 120);
                ctx.fillText('GIF Export Demo', 200, 160);
                ctx.font = '16px Arial';
                ctx.fillText('Trong phiên bản đầy đủ sẽ xuất', 200, 200);
                ctx.fillText('GIF thật với animation của bạn', 200, 230);
                
                // Download
                canvas.toBlob(blob => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `motion-studio-${Date.now()}.gif`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    // Close modal
                    if (modal) modal.style.display = 'none';
                    
                    showNotification('✅ Đã xuất GIF thành công!');
                });
            }, 500);
        }
    }, 200);
}

function showNotification(message) {
    console.log('Notification:', message);
    
    // Remove existing notifications
    document.querySelectorAll('.simple-notification').forEach(n => n.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'simple-notification';
    notification.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            animation: slideInRight 0.3s ease;
        ">
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
    
    // Add animation styles if needed
    if (!document.querySelector('#anim-styles')) {
        const style = document.createElement('style');
        style.id = 'anim-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Add global error handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.log('Error:', msg, url, lineNo);
    showNotification('⚠️ Có lỗi xảy ra, vui lòng thử lại');
    return false;
};

// Initialize when page loads
console.log('AI Motion Studio script loaded');
