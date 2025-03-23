const fs = require('fs')
const path = require('path')
const cv = require('opencv4nodejs')

const CAMERA_FOLDERS = [
  'D:/AHai',
  'D:/AHai1',
  'D:/AHai2',
  'D:/AHai3',
  'D:/AHai4',
]

const FRAME_DELAY = 1000 / 15

function* frameGenerator(folder) {
  while (true) {
    const files = fs
      .readdirSync(folder)
      .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
      .sort()

    for (const file of files) {
      const imagePath = path.join(folder, file)
      const img = cv.imread(imagePath)
      const jpeg = cv.imencode('.jpg', img)

      yield jpeg
    }
  }
}

function getCameraStream(req, res) {
  const camId = parseInt(req.params.camId, 10)
  if (isNaN(camId) || camId < 0 || camId >= CAMERA_FOLDERS.length) {
    return res.status(404).send('Camera không tồn tại')
  }

  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })

  const generator = frameGenerator(CAMERA_FOLDERS[camId])

  const interval = setInterval(() => {
    const frame = generator.next()
    if (frame.done) {
      clearInterval(interval)
      return
    }

    res.write(`--frame\r\nContent-Type: image/jpeg\r\n\r\n`)
    res.write(frame.value)
    res.write('\r\n')
  }, FRAME_DELAY)

  req.on('close', () => clearInterval(interval))
}

function getHomePage(req, res) {
  let html = '<h1>Streaming từ 5 camera</h1>'
  for (let i = 0; i < CAMERA_FOLDERS.length; i++) {
    html += `<h3>Camera ${i}</h3><img src="/video_feed/${i}"/><br>`
  }
  res.send(html)
}

module.exports = {
  getCameraStream,
  getHomePage,
}
