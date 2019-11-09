let StringUtil = require("StringUtil");

cc.Class({
    properties: {
        isNative: {
            get: function() {
                return cc.sys.isNative;
            },
        },

        platform: {
            get: function() {
                return cc.sys.platform;
                //DESKTOP_BROWSER:101
                //IPAD:5
                //IPHONE:4
                //ANDROID:3
            },
        },

        os: {
            get: function() {
                return cc.sys.os;
            },
        },

    },

    init: function() {
        debug.log('app bridge 初始化');
        if (!this.isNative) {
            debug.log('不是的！！');
            return;
        }

        //setAsIos
        this.setAsAndroid();
        this.isEnabled = (this.nativeAPI != null);

        // 注册监听切换回前台的事件
        cc.game.on(cc.game.EVENT_SHOW, this.onShow, this);

        // 注册监听切换回后台的事件
        cc.game.on(cc.game.EVENT_HIDE, this.onHide, this);
    },

    setAsAndroid() {
        this.nativeAPI = require("AndroidAPI");

        let BannerAdUtil = require("BannerAdUtil_app");
        this.bannerAdUtil = new BannerAdUtil();

        let VideoAdUtil = new require("VideoAdUtil_app");
        this.videoAdUtil = new VideoAdUtil();

        let InterstitialAdUtil = new require("InterstitialAdUtil_app");
        this.interstitialAdUtil = new InterstitialAdUtil();

        let NativeAdUtil = new require("NativeAdUtil_app");
        this.nativeAdUtil = new NativeAdUtil();
    },

    setAsIos() {
        this.nativeAPI = require("IosAPI");

        this.wxInstalled = this.isWechatInstalled();
        debug.log("isWechatInstalled " + this.wxInstalled);
    },

    gc: function() {
        debug.log("gc");
    },

    // 如果是存取对象，请用下面的api
    // 注意：如果存的是123，取出时会变成"123"
    setStorageSync: function(storageKey, storageData) {
        if (StringUtil.isEmpty(storageKey)) {
            return
        }

        cc.sys.localStorage.setItem(storageKey, storageData);
    },

    // 存对象专用api
    setObjectStorageSync: function(storageKey, storageData) {
        if (StringUtil.isEmpty(storageKey)) {
            return;
        }

        cc.sys.localStorage.setItem(storageKey, JSON.stringify(storageData));
    },

    // 如果是存取对象，请用下面的api
    getStorageSync: function(storageKey) {
        if (StringUtil.isEmpty(storageKey)) {
            return;
        }

        return cc.sys.localStorage.getItem(storageKey);
    },

    // 取对象专用api
    getObjectStorageSync: function(storageKey) {
        if (StringUtil.isEmpty(storageKey)) {
            return;
        }

        try {
            return JSON.parse(cc.sys.localStorage.getItem(storageKey));
        } catch (e) {
            debug.log(e);
        }

        return;
    },

    removeStorageSync: function(storageKey) {
        if (StringUtil.isEmpty(storageKey)) {
            return
        }

        cc.sys.localStorage.removeItem(storageKey);
    },

    //收到来自objectiveC的消息。 iOS系统通过这种方式来交互  参数默认都是字符串 貌似只能带一个参数
    onNativeMsg: function(msg) {
        debug.log("收到来自native的消息");
        this.nativeAPI.onNativeMsg(msg);
    },

    // 监听回到前台
    onShow: function() {
        console.log("native onShow");
    },

    // 监听切换到后台
    onHide: function() {
        console.log("native onHide");
    },



    ///////////////以下是使用IosAPI或者AndroidAPI//////////////////
    isWechatInstalled: function() {
        return this.nativeAPI && this.nativeAPI.isWechatInstalled();
    },

    copyToClipboard: function(content) {
        this.nativeAPI.copyToClipboard(content);
    },

    // 登录时，请求微信授权码
    requestWxAuthCodeForLogin: function() {
        this.nativeAPI.requestWxAuthCodeForLogin();
    },

    // 绑定微信时，请求授权码
    requestWxAuthCodeForBind: function() {
        this.nativeAPI.requestWxAuthCodeForBind();
    },

    // 微信支付
    startPony: function(stringifiedParam) {
        this.nativeAPI.startPony(stringifiedParam);
    },

    // 内购支付
    startIapPay: function(productId, billNum) {
        this.nativeAPI.startIapPay(productId, billNum);
    },

    // 分享到朋友圈
    shareToMoment: function(shareObj) {
        this.nativeAPI.shareToMoment(shareObj)
    },

    // 分享到群或者好友
    shareToConversation: function(shareObj) {
        this.nativeAPI.shareToConversation(shareObj);
    },

    getIpv6Address: function(dns) {
        return this.nativeAPI.getIpv6Address(dns);
    },

    openUrl: function() {
        this.nativeAPI.openUrl();
    },
});