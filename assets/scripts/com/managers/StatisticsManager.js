cc.Class({
    extends: cc.Component,

    properties: {
        uploadInterval: 300,

        _lastUploadTime: 0,

        //onLaunchRecordUrl: "https://statistic.ttigd.cn/data-analysis/statistic/launch",

        /*********** 阿拉丁*/


        enableALD: false,

        aldTag: "",

        /************ 阿拉丁*/
    },

    sendALD(e) {
        if (!this.enableALD) {
            return;
        }

        wx.aldSendEvent(this.aldTag + e);
    },

    sendTT(eventName, obj) {
        if (WechatAPI.isTT && typeof tt.reportAnalytics == "function") {
            if (obj == null) {
                obj = {};
            }
            tt.reportAnalytics(eventName, obj);
        }
    },

    onLoad() {
        // this.eventMap = [];
        // this.onEventUrl = "https://statistic2.ttigd.cn/statistic-service/statistic/playerEvent";

        // this.param = {};
    },

    setParam() {
        // if (user) {
        //     this.param.uuid = user.getUsername();
        //     this.param.playerId = this.param.uuid;
        // }
    },

    //每隔一段时间上传一次统计数据
    update(dt) {
        // this._lastUploadTime += dt;
        // if (this._lastUploadTime < this.uploadInterval) {
        //     return;
        // }

        // this.uploadEvent();
        // this._lastUploadTime = 0;
    },

    //加速上传
    accelerateUpload(delay = 0.5) {
        // if (delay <= 0) {
        //     this.uploadEvent();
        //     return;
        // }

        // if (this._lastUploadTime < this.uploadInterval - delay) {
        //     this._lastUploadTime = this.uploadInterval - delay;
        // }
    },

    //上传启动记录
    uploadLaunchRecord(appId, channelId, deviceId, playerId, okCallback) {
        // var url = this.onLaunchRecordUrl + "?appId=" + appId + "&channelId=" + channelId
        //     + "&uuid=" + deviceId + "&playerId=" + playerId;

        // let requestResult = {
        //     okCallback: okCallback,
        // };

        //post Request
    },

    //上传事件
    uploadEvent(force = false) {
        // if (!this.eventMap) {
        //     return;
        // }
        // if (!this.param) {
        //     return;
        // }

        // if (this.param.uuid == null || this.param.uuid == "") {
        //     this.setParam();
        //     return;
        // }

        // let events = {};
        // for (let i in this.eventMap) {
        //     events[i] = this.eventMap[i];
        // }
        // let data = {};
        // data.appId = debug.appId;
        // data.uuid = this.param.uuid;
        // data.playerId = this.param.playerId;
        // data.eventCounts = events;

        // let dataStr = JSON.stringify(data);

        // if (!force) {
        //     if (debug.enableLog || debug.useDevLocalServerIp || debug.useDevRemoteServerIp) {
        //         debug.log("理当上传" + dataStr);
        //         return;
        //     }
        // }

        // debug.log("上传 " + dataStr);
        // appContext.webService.postRequest(
        //     appContext.webService.getRequestObject(this.onEventUrl, dataStr,
        //         function () {
        //             AppContext.getAnalyticManager().clearEvent();
        //         }),
        //     false, true);
    },

    addEvent(eventName) {
        // if (!eventName) {
        //     return;
        // }

        // if (this.eventMap[eventName] != null) {
        //     this.eventMap[eventName]++;
        // } else {
        //     this.eventMap[eventName] = 1;
        // }
    },

    clearEvent() {
        //this.eventMap = [];
    }
});