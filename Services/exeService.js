import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import os from 'os'
import { networkInterfaces } from 'os'

const exePath = 'D:\\Acquisition.exe'



let currentFolderName = '';

const startExe = (folderName) => {
    const workingDir = path.join('D:\\', folderName);
    currentFolderName = folderName;

    if (!fs.existsSync(workingDir)) {
        fs.mkdirSync(workingDir, { recursive: true });
        console.log(`📁 Đã tạo thư mục: ${workingDir}`);
    }

    // escape đường dẫn exe
    const escapedExe = exePath.replace(/\\/g, '\\\\');
    const resultFile = path.join(workingDir, 'result.txt');

    // Tạo command: chạy exe rồi echo errorlevel vào file
    const command = `cmd /c "cd /d ${workingDir} && ${escapedExe} && echo %errorlevel% > result.txt"`;

    console.log(`🚀 Đang chạy: ${command}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Lỗi khi chạy EXE: ${error.message}`);
            return;
        }

        console.log(`📥 Đã chạy xong exe. Đợi kiểm tra kết quả...`);

        // Đợi 3-5 giây rồi đọc result.txt
        setTimeout(() => {
            if (fs.existsSync(resultFile)) {
                const status = fs.readFileSync(resultFile, 'utf-8').trim();
                console.log(`📄 Trạng thái exe trả về: ${status}`);
                if (status === '0') {
                    notifyMaster();
                } else {
                    console.warn(`⚠️ EXE trả về lỗi: ${status}`);
                }
            } else {
                console.warn('⚠️ Không tìm thấy result.txt (có thể exe chưa chạy xong)');
            }
        }, 5000);
    });
};

//const startExe = (folderName) => {
//    console.log(folderName)
//    const workingDir = path.join('D:\\', folderName)
//    console.log(workingDir)

//    currentFolderName = folderName;

//    if (!fs.existsSync(workingDir)) {
//        fs.mkdirSync(workingDir, { recursive: true })
//        console.log(`📁 Đã tạo thư mục: ${workingDir}`)
//    }

//    const command = `powershell -Command "Start-Process cmd -WorkingDirectory '${workingDir}' -ArgumentList '/k \\"${exePath}\\"'"`

//    console.log(`🚀 Đang chạy: ${command}`)

//    exec(command, (error, stdout, stderr) => {
//        if (error) {
//            console.error(`❌ Lỗi khi chạy EXE: ${error.message}`)
//            return
//        }

//        if (stderr) {
//            console.warn(`⚠️ stderr: ${stderr}`)
//        }

//        if (stdout) {
//            console.log(`✅ stdout: ${stdout}`)
//        }

//        console.log(`✅ Đã gửi lệnh chạy EXE thành công.`)

        
//        notifyMaster()
//    })
//}

const getCurrentFolder = () => currentFolderName;
const notifyMaster = async () => {
    
    const { networkInterfaces } = os;
    const nets = networkInterfaces();

    //let ip = '127.0.0.1';
    //for (const name of Object.keys(nets)) {
    //    for (const net of nets[name]) {
    //        if (net.family === 'IPv4' && !net.internal) ip = net.address;
    //    }
    //}
    console.log('qdfhg')
    try {
        await axios.post('http://192.168.100.212:3001/slave-status', {
            slaveIp: 'http://192.168.100.212:3002',
            status: 'done',
        });

        console.log('📨 Đã gửi trạng thái hoàn thành về master.');
    } catch (err) {
        console.error('❌ Không gửi được trạng thái:', err.message);
    }
};

let runningProcess = null

const stopExe = () => {
    if (runningProcess) {
        runningProcess.kill()
        runningProcess = null
    }
}

const deleteExe = () => {
    if (fs.existsSync(exePath)) fs.unlinkSync(exePath)
}

export { startExe, stopExe, deleteExe, getCurrentFolder }
