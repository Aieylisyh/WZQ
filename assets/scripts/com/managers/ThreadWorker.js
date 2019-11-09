let ThreadWorker = {
    worker: null,

    startWorker: function (param) {
        if (this.worker == null) {
            this.worker = wx.createWorker('workers/index.js') // 文件名指定 worker 的入口文件路径，绝对路径
        }

        // debug.log("makeDecision");
        // debug.log(param);
        this.worker.postMessage(param);

        this.worker.onMessage(function (res) {
            // debug.log("worker responds");
            // debug.log(res);

            if (res.log != null) {
                debug.log(res.log);
            }

            if (res.error != null) {
                debug.warn(res.error);
                return;
            }

            if (res.playChess) {
                //TODO:需要在对手回合结束时，游戏结束时，主动stopWorker 防止时间到了又返回了结果
                appContext.getGameManager().onGetRemoteResponse(res);
            }

            if (!res.noAutoStop) {
                // console.log(this);//这里的this不是ThreadWorker
                WechatAPI.threadWorker.stopWorker();
            }
        })
    },

    stopWorker: function () {
        if (this.worker != null) {
            this.worker.postMessage({ stop: true });
        }
    },

    onDisable: function () {
        if (this.worker != null) {
            this.worker.terminate();
            this.worker = null;
        }
    },
};

module.exports = ThreadWorker;