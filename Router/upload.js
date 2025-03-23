const express = require('express')
const multer = require('multer')
const { startExe } = require('../Services/exeService')

const router = express.Router()
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'D:\\'),
  filename: (req, file, cb) => cb(null, 'slave_app.exe'),
})

const upload = multer({ storage })

router.post('/upload', upload.single('file'), (req, res) => {
  try {
    startExe()
    res.json({ message: 'Upload và chạy file exe thành công' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
