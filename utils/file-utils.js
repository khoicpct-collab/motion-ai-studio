// File utility functions
const FileUtils = {
    // Function to read a file and return a promise with the result
    readFileAsDataURL: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    },

    // Function to validate file type
    isValidImageType: function(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        return validTypes.includes(file.type);
    },

    // Function to get file extension
    getFileExtension: function(filename) {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    }
};

// Make it available globally
if (typeof window !== 'undefined') {
    window.FileUtils = FileUtils;
}
