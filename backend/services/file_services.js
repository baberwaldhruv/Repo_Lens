const fs = require('fs/promises');
const path = require('path');
const IGNORED_DIRS = ['.git', 'node_modules', 'dist', 'build', '.next', 'coverage'];
const ALLOWED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

/**
 * @param {string} dirPath 
 * @returns {Promise<string[]>} 
 */
async function scanFiles(dirPath) {
    let allFiles = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            if (IGNORED_DIRS.includes(entry.name)) {
                continue;
            }
            const subfolderFiles = await scanFiles(fullPath);
            allFiles = allFiles.concat(subfolderFiles);
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (ALLOWED_EXTENSIONS.includes(ext)) {
                allFiles.push(fullPath);
            }
        }
    }
    return allFiles;
}
module.exports = { scanFiles };