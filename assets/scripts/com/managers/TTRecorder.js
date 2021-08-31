const { wxOnShow } = require("./WechatAPI");

let recordTime = 240;
let recordRestartTime = 90;
let delay = 1;
//check var  
//recordAfterStop gameRecordStartTime blockTryStartAutoRecord gameRecording autoRecording gameRecordHideShare gameRecorderManager isRecordingSafe
//check func 
//recordGameEnd getCanStopGameRecording tryStartAutoRecordAndKeepTime recordGameStart startRecorderWithDelay assignRecordListeners onResetRecording 
//check temp
//grm assignListeners beginWithDelay begin autoRecordAndKeepTime setup

//state: stopped started stopping starting wait
//isAuto: bool
//willShare:bool
//startAfterStop:bool
//stopAfterStart:bool

let TTRecorder = {
    state: "stopped",//stopped started stopping starting wait

    isAuto: false,

    willShare: false,

    startAfterStop: false,

    stopAfterStart: false,

    startTimestamp: 0,

    log() {
        debug.log("录屏 log");
        debug.log("state " + this.state);
        debug.log("isAuto " + this.isAuto);
        debug.log("willShare " + this.willShare);
        debug.log("startAfterStop " + this.startAfterStop);
        debug.log("stopAfterStart " + this.stopAfterStart);
    },

    stop() {
        debug.log("录屏stop");
        this.log();

        if (!this.grm) {
            return;
        }

        switch (this.state) {
            case "stopped":
                debug.log("忽略停止");
                break;

            case "stopping":
                debug.log("忽略停止");
                break;

            case "started":
                debug.log("立即停止");
                this.startAfterStop = false;
                WechatAPI.ttRecorder.state = "stopping";
                this.grm.stop();
                break;

            case "starting":
                debug.log("之后停止");
                this.stopAfterStart = true;
                this.startAfterStop = false;
                break;

            case "wait":
                debug.log("什么都不做");
                break;
        }
    },

    start(isAuto = false) {
        debug.log("！录屏start isAuto= " + isAuto);
        this.log();

        if (!this.grm) {
            return;
        }

        switch (this.state) {
            case "stopped":
                debug.log("立即开始");
                this.isAuto = isAuto;
                this.stopAfterStart = false;
                WechatAPI.ttRecorder.state = "starting";
                debug.log(this.grm);
                try {
                    this.grm.start({
                        duration: recordTime,
                    });
                } catch (e) {
                    console.log(e);
                }

                break;

            case "stopping":
                debug.log("之后开始");
                this.isAuto = isAuto;
                this.startAfterStop = true;
                this.stopAfterStart = false;
                break;

            case "started":
                if (this.isAuto && isAuto) {
                    debug.log("续录屏");

                    if (WechatAPI.ttRecorder.getDuration() < recordRestartTime) {
                        debug.log("时间不够续");
                    } else {
                        debug.log("续");

                        this.stop();
                        this.isAuto = isAuto;
                        this.startAfterStop = true;
                        this.stopAfterStart = false;
                        this.willShare = false;
                    }

                } else if (!this.isAuto && isAuto) {
                    debug.log("手动录频 忽略开始自动录屏");
                } else if (!this.isAuto && !isAuto) {
                    debug.log("重复手动录频 按理应该不会这样 忽略");
                } else if (this.isAuto && !isAuto) {
                    debug.log("自动录频切到手动录频");
                    this.stop();
                    this.isAuto = isAuto;
                    this.startAfterStop = true;
                    this.stopAfterStart = false;
                    this.willShare = false;
                }

                break;

            case "starting":
                this.isAuto = isAuto;
                debug.log("忽略开始");
                break;

            case "wait":
                debug.log("wait 不做什么");
                break;
        }
    },

    setup() {
        if (typeof wx.getGameRecorderManager == "function") {
            this.grm = tt.getGameRecorderManager();

            debug.log('录屏初始化');
            this.grm.onStart(res => {
                WechatAPI.ttRecorder.startTimestamp = Date.now();
                WechatAPI.ttRecorder.state = "started";
                debug.log('！录屏开始了');
                debug.log(res);
                WechatAPI.ttRecorder.log();

                if (WechatAPI.ttRecorder.stopAfterStart) {
                    WechatAPI.ttRecorder.state = "wait";
                    debug.log("录屏延时关闭");
                    appContext.scheduleOnce(function () {
                        debug.log("延时关闭");
                        WechatAPI.ttRecorder.state = "stopping";
                        WechatAPI.ttRecorder.grm.stop();
                    }, delay);
                    WechatAPI.ttRecorder.stopAfterStart = false;
                }

            })

            WechatAPI.ttRecorder.grm.onStop((res) => {
                WechatAPI.ttRecorder.state = "stopped";
                WechatAPI.ttRecorder.getDuration();
                debug.log("！录屏结束了");
                debug.log(res);
                WechatAPI.ttRecorder.log();

                if (WechatAPI.ttRecorder.willShare) {
                    debug.log("！录屏分享");
                    WechatAPI.shareUtil.shareVideo(res.videoPath);
                    WechatAPI.ttRecorder.willShare = false;
                }

                if (WechatAPI.ttRecorder.startAfterStop) {
                    WechatAPI.ttRecorder.state = "wait";
                    debug.log("录屏延时开始");
                    appContext.scheduleOnce(function () {
                        debug.log("延时开始");
                        WechatAPI.ttRecorder.state = "starting";
                        WechatAPI.ttRecorder.grm.start({
                            duration: recordTime,
                        });
                    }, delay);
                    WechatAPI.ttRecorder.startAfterStop = false;
                }
            });

            WechatAPI.ttRecorder.grm.onError((res) => {
                debug.log('！录屏出错');
                debug.log(res);
                WechatAPI.ttRecorder.startAfterStop = false;
                WechatAPI.ttRecorder.stopAfterStart = false;
                WechatAPI.ttRecorder.state = "wait";
                debug.log("录屏延时关闭");
                appContext.scheduleOnce(function () {
                    debug.log("延时关闭");
                    WechatAPI.ttRecorder.state = "stopping";
                    WechatAPI.ttRecorder.grm.stop();
                }, delay);
            });
        }
    },

    //秒
    getDuration() {
        let duration = (Date.now() - WechatAPI.ttRecorder.startTimestamp) / 1000;
        debug.log("录屏持续秒数 " + duration);
        return duration;
    },

    //这段代码用于截取精彩瞬间，适合有操作的片段！
    // WechatAPI.ttRecorder.grm.recordClip({
    //     timeRange: [5, 3],
    //     success(r) {
    //         debug.log(r.index) // 裁剪唯一索引
    //         clipIndexList.push(r.index)
    //     }
    // })
}

module.exports = TTRecorder;