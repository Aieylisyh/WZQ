// let StringUtil = require("StringUtil");

let KsShare = {
    onShow: function () { },
    listenOnShare: function () {  },

    getShareInfo: function (param) {
        let shareObj = {
           //templateId
            success() {
                console.log('分享成功');
                if (param && param.cb && param.cb.sucCb) {
                    param.cb.sucCb.call(param.cb.caller);
                }
            },
            fail(e) {
                console.log('分享失败');
                console.log(e);
                if (param && param.cb && param.cb.failCb) {
                    param.cb.failCb.call(param.cb.caller);
                }
            }
        };

        debug.log(shareObj);
        return shareObj;
    },

    share: function (param) {
        let shareObj = this.getShareInfo(param);
        wx.shareAppMessage(shareObj);
    },

    setShareVideoCB(cb) {
        this.shareVideoCB = cb;
    },

    shareVideo(videoId, pMediaRecorder) {
        debug.log("ks shareVideo " + videoId);
        let recordTimeEnough = true;
        let deltaSecond = WechatAPI.ttRecorder.getDuration();
        if (deltaSecond == null || deltaSecond <= 3) {
            recordTimeEnough = false;
        }

        if (!recordTimeEnough) {
            appContext.getDialogManager().showDialog("Toast", "请至少录制3秒视频")
            return;

        }
        //8ee2j69haaaijm7gid
        //ch4n5gsi0njkflegg5
        let self = this;
        pMediaRecorder.publishVideo({
            video: videoId,
            callback: function (error) {
                debug.log("ks shareVideo callback");
                if (error != null && error != undefined) {
                    console.log("分享录屏失败: " + JSON.stringify(error));
                    appContext.getDialogManager().showDialog(DialogTypes.Toast, "分享录屏失败");
                    return;
                }

                console.log("分享录屏成功");
                if (self.shareVideoCB && self.shareVideoCB.length > 0) {

                    let reward = self.shareVideoCB;
                    self.shareVideoCB = null;
                    console.log(reward);
                    appContext.getUxManager().rewardItems(reward);
                    let text = Item.getTextByItem(reward);
                    appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, "分享成功\n获得: " + text);

                    appContext.getUxManager().saveGameInfo();
                }
            }
        });
    },
};

module.exports = KsShare;