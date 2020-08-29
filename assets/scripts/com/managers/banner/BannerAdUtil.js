cc.Class({
    properties: {
        _ad: null,
    },

    isEnabled: function () {
        return false;
    },

    init: function () {
        debug.log('banner 初始化');
        // if (this.isEnabled()) {
        //     this.create();
        // }
    },

    isRemoveAdPurchased() {
        return false;
    },

    show: function (posParam) {
        //debug.log("!show banner");
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

        if (WechatAPI.isYY) {
            self.customShow();
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

    create: function () {
        if (!this.isEnabled()) {
            return;
        }

        if (WechatAPI.isYX) {
            debug.log("block banner ad create by yxsdk");
            WechatAPI.YXSDK.showBanner();
            return;
        }

        if (WechatAPI.isYY) {
            this.customCreate();
            return;
        }

        if (this.has()) {
            debug.log("已有banner广告不再create");
            return;
            // this.destroy();
        }


        if (!this.has()) {
            //debug.log("现在没有banner广告了");
            this.customCreate();
        } else {
            //debug.log("还是有banner广告");
        }
        // if (this._ad == null) {
        //     debug.warn("!banner ad null");
        //     return;
        // }
    },

    has: function () {
        return this._ad != null;
    },

    hide: function () {
        if (WechatAPI.isYY) {
            this.customHide();
            return;
        }


        if (this.has()) {
            this.customHide();
        }
    },

    reload: function () {
        if (!this.isEnabled()) {
            return;
        }

        if (WechatAPI.isYY) {
            this.destroy();
            this.create();
            return;
        }

        if (WechatAPI.isYX) {
            debug.log("block banner ad reload by yxsdk");
            WechatAPI.YXSDK.showBanner();
            return;
        }

        this.destroy();
        this.create();
    },

    destroy: function () {
        if (WechatAPI.isYY) {
            this.customDestroy();
            return;
        }

        if (this.has()) {
            this.customDestroy();
        }

        this._ad = null;
    },

    customDestroy() { },
    customHide() { },
    customCreate() { },
    customShow() { },
    customShowOnLoad() { },
});