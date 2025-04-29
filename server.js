//const express = require('express')
//const cors = require('cors')
//const app = express()
//const PORT = 3002

//const uploadRouter = require('./Router/upload')
//const controlRouter = require('./Router/control')

//app.use(cors())
//app.use(express.json())

//app.use('/', uploadRouter)
//app.use('/', controlRouter)

//app.listen(PORT, () => {
//    console.log(`✅ Slave server is running on port ${PORT}`)
//})

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process'); // Thêm child_process
const path = require('path'); // Thêm path để xử lý đường dẫn
const app = express();
const PORT = 3002;

const uploadRouter = require('./Router/upload');
const controlRouter = require('./Router/control');

app.use(cors());
app.use(express.json());

app.use('/', uploadRouter);
app.use('/', controlRouter);

// Hàm chạy lệnh py sv.txt.txt
function runPythonServer() {
    // Đường dẫn đến file sv.txt.txt (giả sử nằm trong thư mục cụ thể)
    const filePath = path.join(__dirname, '../..', 'sv.txt.txt');
    const folderPath = path.dirname(filePath); // Lấy thư mục chứa file

    // Lệnh chạy file Python
    const command = `py "${filePath}"`;

    // Thực thi lệnh
    exec(command, { cwd: folderPath }, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Lỗi khi chạy server Python: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`❌ Lỗi Python: ${stderr}`);
            return;
        }
        console.log(`✅ Server Python đã chạy: ${stdout}`);
    });
}

// Khởi động server Node.js và server Python
app.listen(PORT, () => {
    console.log(`✅ Slave server is running on port ${PORT}`);
    runPythonServer(); // Gọi hàm chạy server Python
});