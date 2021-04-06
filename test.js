const { test, closeMicroEngine } = require('./index');

async function run() {
    for (var i = 0; i < 10; i++) {
        // 开始启动，可以打开始启动的点；
        await test(i);
        // 这个时候已经启动好了，可以打启动完成的点；
        // await closeMicroEngine();
        console.log(`current runner ${i} !!!!`);
    }
}

run();