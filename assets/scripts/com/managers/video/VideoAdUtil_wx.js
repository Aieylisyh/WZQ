 cc.Class({
     extends: require("VideoAdUtil"),

     properties: {
         id: "adunit-7fc030ad41a6ae4a",
     },

     isEnabled: function() {
         return typeof wx.createRewardedVideoAd == "function";
     },

     customCreate() {
         debug.log("Create wxad广告");
         this._ad = wx.createRewardedVideoAd({
             adUnitId: this.id,
         });

         let self = this;

         this._ad.onError(WechatAPI.videoAdUtil.onError);
         this._ad.onClose(function(res) {
             //debug.log("点击关闭广告");
             // 小于 2.1.0 的基础库版本，res 是一个 undefined
             if ((res && res.isEnded) || res === undefined) {
                 debug.log("正常播放结束");
                 self.onFinish();
             } else {
                 debug.log("播放中途退出");
                 self.onCease();
             }

             self.updateCb();
         });
         this._ad.onLoad(function() {
             debug.log("wx拉取视频广告ok");
             self.onCanPlay();
             if (self.playAfterLoad) {
                 self.show();
             }
         });

         this.customLoad();
     },

     customLoad() {
         if (this._isLoading) {
             console.log("wx vad load when loading");
             return;
         }
         debug.log("开始加载视频");

         this.playAfterLoad = false;
         this._loaded = false;
         this._isLoading = true;
         this._ad.load();
     },

     customShowOnLoad() {
         this.customLoad();
         this.playAfterLoad = true;
     },

     customShow() {
         let self = this;

         this._ad.show().then(() => {
             self.playAfterLoad = false;
             appContext.getSoundManager().stopBackgroundMusic();
         }).catch(err => {
             self.onError(err);
         });
     },
 });