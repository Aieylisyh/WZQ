cc.Class({
    properties: {
        _ad: null,
    },

    isEnabled: function() {
        return false;
    },

    init: function() {
        debug.log('banner 初始化');
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

    show: function(posParam) {
        debug.log("!show banner");
        let self = WechatAPI.bannerAdUtil;
        if (!self.isEnabled()) {
            return;
        }

        if (self.isRemoveAdPurchased()) {
            debug.log("RemoveAdPurchased");
            return;
        }

        if (WechatAPI.isYX) {
            debug.log("block banner ad show by yxsdk");
            WechatAPI.YXSDK.showBanner();
            return;
        }

        if (self.has()) {
            self.customShow();
        } else {
            console.warn("banner customShowOnLoad but ignore");
            self.reload();
            // self.create(posParam);
            // self.customShowOnLoad();
        }
    },

    create: function(posParam, show) {
        if (!this.isEnabled()) {
            return;
        }

        if (show && WechatAPI.isYX) {
            debug.log("block banner ad create by yxsdk");
            WechatAPI.YXSDK.showBanner();
            return;
        }

        if (this.has()) {
            debug.log("已有banner广告");
        }
        this.destroy();

        this.customCreate(posParam, show);
        // if (this._ad == null) {
        //     debug.warn("!banner ad null");
        //     return;
        // }
    },

    has: function() {
        return this._ad != null;
    },

    hide: function() {
        if (this.has()) {
            this.customHide();
        }
    },

    reload: function(show = false, posParam) {
        if (!this.isEnabled()) {
            return;
        }

        if (show && WechatAPI.isYX) {
            debug.log("block banner ad reload by yxsdk");
            WechatAPI.YXSDK.showBanner();
            return;
        }

        this.destroy();

        let self = this;
        if (!self.has()) {
            self.create(posParam, show);
        }
    },

    destroy: function() {
        if (this.has()) {
            this.customDestroy();
        }

        this._ad = null;
    },

    customDestroy() {},
    customHide() {},
    customCreate(posParam, show) {},
    customShow() {},
    customShowOnLoad() {},
});