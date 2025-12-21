<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Motion Sim - Mô phỏng vật liệu trên GIF</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: sans-serif; background: #2d3436; color: #fff; height: 100vh; overflow: hidden; }

        .app-container { display: flex; height: 100vh; flex-direction: column; padding: 10px; }

        /* HEADER */
        .header { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #444; border-radius: 10px; margin-bottom: 10px; }
        .logo { font-size: 1.5em; font-weight: bold; color: #74b9ff; }
        .controls-header { display: flex; gap: 10px; }
        .btn { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.2s; }
        .btn-primary { background: #0984e3; color: white; }
        .btn-primary:hover { background: #0770c4; }
        .btn-success { background: #00b894; color: white; }
        .btn-success:hover { background: #00a085; }

        /* MAIN CONTENT */
        .main-content { display: flex; flex: 1; gap: 10px; overflow: hidden; }
        .sidebar { width: 300px; background: #3c3f45; border-radius: 10px; padding: 15px; display: flex; flex-direction: column; gap: 20px; overflow-y: auto; }
        .canvas-container { flex: 1; background: #1e1e1e; border-radius: 10px; padding: 10px; position: relative; overflow: hidden; }

        /* UPLOAD & CONTROLS */
        .upload-area { background: #444; border: 3px dashed #666; border-radius: 10px; padding: 30px 20px; text-align: center; cursor: pointer; margin-bottom: 10px; }
        .upload-area:hover { border-color: #74b9ff; }
        .upload-icon { font-size: 2.5em; color: #aaa; margin-bottom: 10px; }
        .control-group { margin-bottom: 15px; }
        .control-label { display: block; margin-bottom: 8px; font-weight: bold; color: #ddd; }
        .slider { width: 100%; }
        .value-display { float: right; font-weight: bold; color: #74b9ff; }

        /* CANVAS */
        #mainCanvas { background: #000; display: block; border-radius: 6px; cursor: crosshair; width: 100%; height: 100%; }
        .canvas-overlay { position: absolute; top: 0; left: 0; pointer-events: none; }
        #drawCanvas { position: absolute; top: 0; left: 0; }

        /* DIRECTION OVERLAY */
        #directionOverlay {
            position: absolute;
            background: rgba(0, 0, 0, 0.85);
            border-radius: 15px;
            padding: 15px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.5);
            border: 2px solid #0984e3;
            display: none;
            z-index: 100;
        }
        .direction-title { text-align: center; margin-bottom: 10px; font-weight: bold; color: #74b9ff; }
        .direction-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
        }
        .dir-btn {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            border: 2px solid #555;
            background: #333;
            color: white;
            font-size: 1.5em;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        .dir-btn:hover { background: #555; border-color: #74b9ff; }
        .dir-btn.selected { background: #0984e3; border-color: #74b9ff; transform: scale(1.1); }

        /* STATUS & NOTIFICATION */
        .status-bar { margin-top: auto; padding-top: 15px; border-top: 1px solid #555; font-size: 0.9em; color: #aaa; }
        #notification { position: fixed; bottom: 20px; right: 20px; background: #00b894; color: white; padding: 15px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); display: none; z-index: 1000; }
    </style>
</head>
<body>
    <div class="app-container">
        <!-- HEADER -->
        <div class="header">
            <div class="logo">⚙️ Motion Sim</div>
            <div class="controls-header">
                <button id="playBtn" class="btn btn-primary">▶️ Play</button>
                <button id="exportBtn" class="btn btn-success">💾 Export GIF</button>
            </div>
        </div>

        <!-- MAIN CONTENT -->
        <div class="main-content">
            <!-- SIDEBAR -->
            <div class="sidebar">
                <!-- UPLOAD -->
                <div>
                    <h3 style="color:#74b9ff; margin-bottom:10px;">📁 Upload Files</h3>
                    <label class="upload-area">
                        <div class="upload-icon">🎬</div>
                        <div style="font-weight:bold;">GIF Background</div>
                        <div style="font-size:0.8em; color:#aaa;">Layer nền thiết bị</div>
                        <input type="file" id="uploadGif" accept="image/gif" style="display:none;">
                    </label>
                    <label class="upload-area">
                        <div class="upload-icon">🖼️</div>
                        <div style="font-weight:bold;">Material Image</div>
                        <div style="font-size:0.8em; color:#aaa;">Hình dạng vật liệu</div>
                        <input type="file" id="uploadMaterial" accept="image/*" style="display:none;">
                    </label>
                </div>

                <!-- CONTROLS -->
                <div>
                    <h3 style="color:#74b9ff; margin-bottom:15px;">🎛️ Controls</h3>
                    <div class="control-group">
                        <div class="control-label">Speed: <span id="speedValue" class="value-display">50%</span></div>
                        <input type="range" id="speedSlider" class="slider" min="1" max="100" value="50">
                    </div>
                    <div class="control-group">
                        <div class="control-label">Particle Count: <span id="countValue" class="value-display">150</span></div>
                        <input type="range" id="countSlider" class="slider" min="10" max="500" value="150">
                    </div>
                    <div class="control-group">
                        <div class="control-label">Particle Size: <span id="sizeValue" class="value-display">12px</span></div>
                        <input type="range" id="sizeSlider" class="slider" min="2" max="50" value="12">
                    </div>
                </div>

                <!-- INSTRUCTIONS -->
                <div class="status-bar">
                    <strong>🎯 Hướng dẫn nhanh:</strong><br>
                    1. Upload GIF & Material<br>
                    2. <strong>Click vào GIF</strong> để bắt đầu vẽ vùng<br>
                    3. Chọn hướng từ bảng mũi tên<br>
                    4. <strong>Double-click</strong> để kết thúc vẽ<br>
                    5. Play để xem, Export để lưu.
                </div>
            </div>

            <!-- CANVAS AREA -->
            <div class="canvas-container">
                <canvas id="mainCanvas" width="1200" height="675"></canvas>
                <canvas id="drawCanvas" class="canvas-overlay" width="1200" height="675"></canvas>

                <!-- DIRECTION OVERLAY -->
                <div id="directionOverlay">
                    <div class="direction-title">Chọn Hướng Chuyển Động</div>
                    <div class="direction-grid">
                        <button class="dir-btn" data-vx="-0.7" data-vy="-0.7">↖</button>
                        <button class="dir-btn" data-vx="0" data-vy="-1">↑</button>
                        <button class="dir-btn" data-vx="0.7" data-vy="-0.7">↗</button>
                        <button class="dir-btn" data-vx="-1" data-vy="0">←</button>
                        <button class="dir-btn" data-vx="0" data-vy="0" data-scroll="true">↻</button>
                        <button class="dir-btn" data-vx="1" data-vy="0">→</button>
                        <button class="dir-btn" data-vx="-0.7" data-vy="0.7">↙</button>
                        <button class="dir-btn" data-vx="0" data-vy="1">↓</button>
                        <button class="dir-btn" data-vx="0.7" data-vy="0.7">↘</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- NOTIFICATION -->
    <div id="notification"></div>

    <script src="app.js"></script>
</body>
</html>
