cc.Class({
    extends: require("NativeAdUtil"),

    properties: {
        id: "5d990db1777d4321bd1251fe2b9a285e",
    },

    //广告类型，取值说明：0：无 1：纯文字 2：图片 3：图文混合 4：视频
    isEnabled: function() {
        if (qg.getSystemInfoSync().platformVersionCode < 1031) {
            return false;
        }

        return true;
    },

    customCreate() {
        if (WechatAPI.isYX) {
            debug.log("block native ad customCreate by yxsdk");
            return;
        }

        debug.log("native crt oppo");
        let self = this;
        if (this.id == null) {
            this.id = this.id_normal;
        }

        this._ad = qg.createNativeAd({
            posId: self.id //id_big
        })
        if (!this._ad) {
            debug.log("native createNativeAd fail");
            return;
        }
        this._ad.onError(this.onError);

        this._ad.onLoad(this.onLoad);

        this._ad.load();
    },

    onLoad(res) {
        if (WechatAPI.isYX) {
            debug.log("block native ad onLoad by yxsdk");
            return;
        }

        debug.log("native onLoad");
        //debug.log(res);
        let self = WechatAPI.nativeAdUtil;
        debug.log(self.customOnLoaded);
        self.customOnLoaded(res);

        if (self._ad && this._ad.offLoad) {
            self._ad.offLoad(self.onLoad);
        }
    },

    onError(res) {
        debug.log("native onError");
        debug.log(res);
        let self = WechatAPI.nativeAdUtil;
        if (self._ad && self._ad.offError) {
            self._ad.offError(self.onError);
        }

        if (this.autoReloadCount == null) {
            this.autoReloadCount = 0;
        }

        if (this.autoReloadCount < 4) {
            this.autoReloadCount++
            WechatAPI.nativeAdUtil.reload();
        }
    },

    customShow() {
        if (WechatAPI.isYX) {
            debug.log("block native ad customShow by yxsdk");
            WechatAPI.YXSDK.showNative(0.5, 0, 10);
            //ASCAd.getInstance().hideNative(); //何时调用这个？？？感觉永远用不上
            return;
        }

        console.log("native customShow")
        this._ad.reportAdShow({
            adId: this._info.adId,
        }); //上报广告曝光

        this.showByInfo();
    },

    customOnClick(adId) {
        if (adId) {
            this._ad.reportAdClick({
                adId: adId,
            }); //上报广告点击
        }
    },

    customOnLoaded(res) {
        debug.log('native customOnLoaded');
        debug.log(res);
        this._loaded = true;
        //this._info = res.item;
        this._info = res.adList[0]
    },
});