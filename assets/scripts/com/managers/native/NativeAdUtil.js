let DialogTypes = require('DialogTypes');

cc.Class({
    properties: {
        _ad: null, //ad instance

        _info: null,
    },


    //原生广告需要自己主动绘制，目前暂时不做视频

    isEnabled: function() {
        return false;
    },

    init() {
        debug.log('native ad 初始化');
        if (this.isEnabled()) {
            this.create();
        }
    },

    show: function() {
        if (!this.isEnabled()) {
            return false;
        }

        if (this.has()) {
            this.customShow();
            this.reload();
            return true;
        } else {
            console.log("native show while not has flush autoReloadCount");
            this.autoReloadCount = 0;
            this.reload();
            return false;
        }
    },

    create: function() {
        if (!this.isEnabled()) {
            return;
        }

        if (this.has()) {
            debug.log("已有native广告");
            return;
        }

        this.info = null;
        this.customCreate();
        if (this._ad == null) {
            debug.warn("!!int ad null");
            return;
        }
    },

    has: function() {
        return this._ad != null && this._info != null;
    },

    reload: function() {
        this.destroy();

        let self = this;
        appContext.scheduleOnce(function() {
            if (!self.has()) {
                self.create();
            }
        }, 2);
    },

    destroy: function() {
        this._ad = null;
        this._info = null;
    },

    showByInfo() {
        try {
            appContext.getDialogManager().showDialog(DialogTypes.NativeAd, this._info);
        } catch (e) {
            console.log(e);
        }

        this._info = null;
    },

    onClick(adId) {
        WechatAPI.nativeAdUtil.customOnClick(adId);
        WechatAPI.nativeAdUtil._ad = null;
        WechatAPI.nativeAdUtil._info = null;
        this.reload();
    },

    customCreate() {},
    customShow() {},
    customOnClick() {},
});