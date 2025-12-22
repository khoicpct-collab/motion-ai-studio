// Video Exporter for MP4/GIF
class VideoExporter {
    constructor(canvas) {
        this.canvas = canvas;
        this.recorder = null;
        this.chunks = [];
        this.isRecording = false;
    }
    
    async exportMP4(options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const stream = this.canvas.captureStream(options.framerate || 30);
                this.recorder = new MediaRecorder(stream, {
                    mimeType: 'video/webm;codecs=vp9'
                });
                
                this.chunks = [];
                
                this.recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        this.chunks.push(event.data);
                    }
                };
                
                this.recorder.onstop = () => {
                    const blob = new Blob(this.chunks, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    resolve(url);
                };
                
                this.recorder.onerror = (event) => {
                    reject(new Error('Recording error: ' + event.error));
                };
                
                // Start recording
                this.recorder.start();
                this.isRecording = true;
                
                // Stop after specified duration
                setTimeout(() => {
                    if (this.recorder && this.recorder.state === 'recording') {
                        this.recorder.stop();
                        this.isRecording = false;
                    }
                }, (options.duration || 5) * 1000);
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    async exportGIF(options = {}) {
        // Note: GIF export is more complex and requires additional libraries
        // For simplicity, we'll export as WebM and suggest conversion
        console.warn('GIF export requires additional libraries. Exporting as WebM instead.');
        return this.exportMP4(options);
    }
    
    stopRecording() {
        if (this.recorder && this.recorder.state === 'recording') {
            this.recorder.stop();
            this.isRecording = false;
        }
    }
    
    isRecording() {
        return this.isRecording;
    }
}
