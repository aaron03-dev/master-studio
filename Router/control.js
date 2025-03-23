const express = require('express');
const router = express.Router();
const { startExe, stopExe, deleteExe, getCurrentFolder } = require('../Services/exeService');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

let lastFolderName = ''; // Lưu tên thư mục output khi chạy file .exe

// 👉 Route để chạy file exe
router.post('/start', (req, res) => {
    const { folderName } = req.body;

    if (!folderName) {
        return res.status(400).json({ message: 'folderName is required' });
    }

    lastFolderName = folderName;

    try {
        startExe(folderName); // Gọi hàm chạy exe
        res.json({ message: 'Đã chạy file exe' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 👉 Route để dừng file exe
router.post('/stop', (req, res) => {
    try {
        stopExe();
        res.json({ message: 'Đã dừng file exe' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 👉 Route để xóa file exe
router.delete('/delete', (req, res) => {
    try {
        deleteExe();
        res.json({ message: 'Đã xóa file exe' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/download', (req, res) => {
    const folderName = getCurrentFolder();
    const folderPath = path.join('D:/', folderName);
    console.log(folderPath)

    if (!fs.existsSync(folderPath)) {
        return res.status(404).json({ message: 'Thư mục không tồn tại' });
    }

    const zipName = `${folderName}.zip`;
    res.setHeader('Content-Disposition', `attachment; filename=${zipName}`);
    res.setHeader('Content-Type', 'application/zip');

    const archive = archiver('zip');
    archive.pipe(res);
    archive.directory(folderPath, false);
    archive.finalize();
});


module.exports = router;
