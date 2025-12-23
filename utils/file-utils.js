// File utility functions
const FileUtils = {
    readFile: function(file) {
        return new Promise((resolve) => {
            // Simple file reading logic
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    }
};
