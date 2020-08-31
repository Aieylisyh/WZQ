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
    },

    isRemoveAdPurchased() {
        if (appContext.getUxManager().gameInfo.removeAdPurchased) {
            return true;
        }

        return false;
    },

    show: function() {
        // if (this.isRemoveAdPurchased()) {
        //     debug.log("RemoveAdPurchased");
        //     return;
        // }

        // if (!this.canPlay()) {
        //     this.tryNative();
        //     return;
        // }

        // if (!this.tryNative()) {
        //     this.customShow();
        // }
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
    },

    has: function() {
        return this._ad != null;
    },

    reload: function() {
        if (!this.isEnabled()) {
            return;
        }

        if (WechatAPI.isYX) {
            debug.log("block int ad reload by yxsdk");
            return;
        }

        // this.destroy();

        // let self = this;
        // appContext.scheduleOnce(function() {
        //     if (!self.has()) {
        //         self.create();
        //     }
        // }, 0);
        this.customReload();
    },

    destroy: function() {
        if (!this.isEnabled()) {
            return;
        }

        if (WechatAPI.isYY) {
            this.customDestroy();
            return;
        }
        
        if (this.has()) {
            this.customDestroy();
        }

        this._ad = null;
    },

    customDestroy() {},
    customCreate() {},
    customShow() {},
    customShowOnLoad() {},
    customReload() {},
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