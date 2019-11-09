cc.Class({
    extends: cc.Component,

    properties: {
        uploadInterval: 300,

        _lastUploadTime: 0,

        //onLaunchRecordUrl: "https://statistic.ttigd.cn/data-analysis/statistic/launch",

        onEventUrl: "https://statistic.ttigd.cn/data-analysis/statistic/eventpacket",
    },

    onLoad() {
        this.eventMap = new Map();
    },

    //每隔一段时间上传一次统计数据
    update(dt) {
        this._lastUploadTime += dt;
        if (this._lastUploadTime < this.uploadInterval) {
            return;
        }

        this.uploadEvent();
        this._lastUploadTime = 0;
    },

    //加速上传
    accelerateUpload(delay = 0.5) {
        if (delay <= 0) {
            this.uploadEvent();
            return;
        }

        if (this._lastUploadTime < this.uploadInterval - delay) {
            this._lastUploadTime = this.uploadInterval - delay;
        }
    },

    //上传事件
    uploadEvent() {
        if (!this.eventMap || this.eventMap.size <= 0) {
            return;
        }

        let eventData = {};

        for (let [k, v] of this.eventMap) {
            eventData[k] = v;
        }

        let data = {};
        data.appId = debug.appId;
        data.channelId = debug.channelId;
        data.eventCounts = eventData;

        let dataStr = JSON.stringify(data);

        if (debug.enableLog || debug.useDevLocalServerIp || debug.useDevRemoteServerIp) {
            debug.log("理当上传事件" + dataStr);
            return;
        }

        WechatAPI.webService.postRequest(
            WechatAPI.webService.getRequestObject(this.onEventUrl, dataStr,
                function () {
                    AppContext.getAnalyticManager().clearEvent();
                },
                null, null, null, null, false),
            false);
    },

    addEvent(eventName) {
        if (!eventName) {
            return;
        }

        if (this.eventMap.has(eventName)) {
            let count = this.eventMap.get(eventName);
            this.eventMap.set(eventName, count + 1);
            return;
        }

        this.eventMap.set(eventName, 1);
    },

    clearEvent() {
        debug.log("清空eventMap" );
        this.eventMap.clear();
    }
});
