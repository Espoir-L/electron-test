const { exec, execSync } = require('child_process');
const path = require('path');

let currentProcess = null;
let captureRes;
let captureRej;

const cwd = process.cwd();
const mainEntryPath = path.join(__dirname, 'main.js');

exports.test = async (index) => {
    console.log('index!!!', index)
    return await new Promise(async (resolve, reject) => {
        const startTime = Date.now();
        captureRes = resolve;
        captureRej = reject;

        if (currentProcess) {
            currentProcess.stdin.setEncoding('utf8');
            currentProcess.stdin.write(
                JSON.stringify({
                    apiName: 'getPageContent',
                    args: {
                        index
                    },
                }),
            );
            console.log('currentProcess###')

            return;
        }
        currentProcess = exec(
            `npx electron ${mainEntryPath} --index ${index} --no-sandbox`,
            {
                cwd,
                maxBuffer: 10 * 1024 * 1024,
            },
            () => {},
        );

        currentProcess.stdout.setEncoding('utf8');

        currentProcess.stdout.on('data', chunk => {
            const mesString = chunk.toString();
            // eslint-disable-next-line no-console
            console.log(mesString);
            if (mesString.includes('code')) {
                try {
                    const mesObj = JSON.parse(mesString);
                    if (mesObj.code === 200 || mesObj.code === 500) {
                        console.log('captureRes', mesObj);
                        captureRes(mesObj);
                    }
                } catch (error) {
                    const errMes = {
                        code: 2014,
                        message: `currentProcess err ${error}`,
                    };
                    // log(errMes);
                }
            }
        });

        currentProcess.stderr.on('data', err => {
            const errMes = {
                code: 2014,
                message: `currentProcess err ${err}`,
            };
            // console.log('stderr', errMes);
            // log(errMes);
        });

        currentProcess.on('uncaughtException', (err, origin) => {
            console.error(new Date().toLocaleString());
            const errMes = {
                code: 2014,
                message: `uncaughtException, err stack: %s, err: %s, origin: %s ${err}`,
            };
            // log(errMes);
        });

        currentProcess.on('unhandledRejection', (reason, promise) => {
            console.error(new Date().toLocaleString());
            const errMes = {
                code: 2014,
                message: `Unhandled Rejection at: ${reason}`,
            };
            // log(errMes);
        });

        currentProcess.on('close', (code, signal) => {
            // 监听服务端的close，但是排除403 headless主动close。505需要重启。code 1对应显卡未启动成功
            const errMes = {
                code: 2015,
                message: `currentProcess close ${code} ${signal}`,
            };
            // console.log('close', errMes);
            // log(errMes);
        });

        currentProcess.on('exit', (code, signal) => {
            const errMes = {
                code: 2015,
                message: `currentProcess exit ${code} ${signal}`,
            };
            // console.log('exit', errMes);
            // log(errMes);
            // captureRej(errMes);
        });
    });
}


exports.closeMicroEngine = async () => {
    if (currentProcess) {
        try {
            const killCmd = `ps -eo pid,command | grep '${mainEntryPath}'| grep -v grep |awk '{print $1}'|xargs kill -9`;
            currentProcess = null;
            execSync(killCmd);
        } catch (e) {}
    } else {
        return await Promise.resolve('success');
    }
}
