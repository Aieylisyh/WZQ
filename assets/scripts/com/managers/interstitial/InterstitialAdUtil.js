cc.Class({
    properties: {
        _ad: null,
    },

    isEnabled: function() {
        return false;
    },

    init() {
        debug.log('interstitial 初始化');
        if (this.isEnabled()) {
            this.create();
        }
        this._loaded = false;
    },

    isRemoveAdPurchased() {
        return false;
    },

    show: function() {
        if (this.isRemoveAdPurchased()) {
            debug.log("RemoveAdPurchased");
            return;
        }

        if (!this.canPlay()) {
            this.tryNative();
            return;
        }

        if (!this.tryNative()) {
            this.customShow();
        }
    },

    tryNative() {
        if (WechatAPI.nativeAdUtil && WechatAPI.nativeAdUtil.show()) {
            debug.log("tryNative true");
            return true;
        }

        debug.log("tryNative false");
        return false;
    },

    create: function() {
        if (!this.isEnabled()) {
            return;
        }

        if (this.has()) {
            debug.log("已有int广告");
            return;
        }

        this.customCreate();
        if (this._ad == null) {
            debug.warn("!!int ad null");
            return;
        }

        this._loaded = false;
    },

    has: function() {
        return this._ad != null && this._loaded;
    },

    reload: function() {
        if (!this.isEnabled()) {
            return;
        }

        if (WechatAPI.isYX) {
            debug.log("block int ad reload by yxsdk");
            return;
        }

        this.destroy();

        let self = this;
        appContext.scheduleOnce(function() {
            if (!self.has()) {
                self.create();
            }
        }, 0);
    },

    destroy: function() {
        if (!this.isEnabled()) {
            return;
        }

        if (this._ad) {
            this.customDestroy();
        }

        this._ad = null;
        this._loaded = false;
    },

    customDestroy() {},
    customCreate() {},
    customShow() {},
    customShowOnLoad() {},

    canPlay() {
        if (!this.isEnabled()) {
            return false;
        }

        if (WechatAPI.isYX) {
            debug.log("block int ad canPlay by yxsdk");
            return WechatAPI.YXSDK.getIntersFlag();
        }

        return true;
    },
});