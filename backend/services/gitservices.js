const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs/promises');



async function clone_repo(repoUrl) {
    const fileName = `repo-${Date.now()}`;
    const tempPath = path.join(__dirname, "../temp");
    const targetPath = path.join(tempPath, fileName);

    await fs.mkdir(tempPath, { recursive: true });

    return new Promise((resolve, reject) => {
        execFile(
            "git",
            ["clone", "--depth", "1", repoUrl, targetPath],
            (error, stdout, stderr) => {
                if (error) {
                    return reject(error);
                }

                resolve(targetPath);
            }
        );
    });
}
async function cleanupRepo(folderPath) {
    try {
        await fs.rm(folderPath, { recursive: true, force: true });
    } catch (err) {
        console.error('Failed to cleanup temp folder:', err);
    }
}

module.exports = { clone_repo, cleanupRepo };