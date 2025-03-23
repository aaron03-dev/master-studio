import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import os from 'os'
import { networkInterfaces } from 'os'

const exePath = 'D:\\prj\\Acquisition\\test\\Acquisition.exe'

const getLocalIp = () => {
    const nets = networkInterfaces()
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address
            }
        }
    }
    return '0.0.0.0'
}

let currentFolderName = '';

const startExe = (folderName) => {
    const workingDir = path.join('D:\\', folderName);
    const batchPath = path.join(workingDir, 'run_with_status.bat');
    const exeFile = exePath.replace(/\\/g, '\\\\'); // escape đường dẫn

    currentFolderName = folderName;

    // Ghi file .bat chạy exe và ghi errorlevel
    const batchContent = `@echo off\r\n"${exeFile}"\r\necho %errorlevel% > result.txt\r\n`;
    fs.writeFileSync(batchPath, batchContent);

    const command = `powershell -Command "Start-Process cmd -WorkingDirectory '${workingDir}' -ArgumentList '/k \\"run_with_status.bat\\"'"`;

    console.log(`🚀 Đang chạy: ${command}`);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Lỗi khi chạy batch: ${error.message}`);
            return;
        }

        console.log(`📥 Đã khởi động file .exe thành công. Đợi kiểm tra kết quả...`);

        // Đợi 3-5 giây rồi đọc result.txt
        setTimeout(() => {
            const resultPath = path.join(workingDir, 'result.txt');
            if (fs.existsSync(resultPath)) {
                const status = fs.readFileSync(resultPath, 'utf-8').trim();
                console.log(`📄 Trạng thái exe trả về: ${status}`);
                if (status === '0') {
                    notifyMaster();
                } else {
                    console.warn(`⚠️ EXE trả về lỗi: ${status}`);
                }
            } else {
                console.warn('⚠️ Không tìm thấy file result.txt (có thể exe chưa chạy xong)');
            }
        }, 5000); // chờ 5 giây
    });
};

const startExe = (folderName) => {
    console.log(folderName)
    const workingDir = path.join('D:\\', folderName)
    console.log(workingDir)

    currentFolderName = folderName;

    if (!fs.existsSync(workingDir)) {
        fs.mkdirSync(workingDir, { recursive: true })
        console.log(`📁 Đã tạo thư mục: ${workingDir}`)
    }

    const command = `powershell -Command "Start-Process cmd -WorkingDirectory '${workingDir}' -ArgumentList '/k \\"${exePath}\\"'"`

    console.log(`🚀 Đang chạy: ${command}`)

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Lỗi khi chạy EXE: ${error.message}`)
            return
        }

        if (stderr) {
            console.warn(`⚠️ stderr: ${stderr}`)
        }

        if (stdout) {
            console.log(`✅ stdout: ${stdout}`)
        }

        console.log(`✅ Đã gửi lệnh chạy EXE thành công.`)

        
        notifyMaster()
    })
}

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
