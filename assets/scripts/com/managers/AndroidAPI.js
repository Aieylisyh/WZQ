let StringUtil = require("StringUtil");
//从native 调用这里：  wx.nativeAPI.onNativeMsg

//https://docs.cocos.com/creator/manual/zh/advanced-topics/java-reflection.html

//var o = jsb.reflection.callStaticMethod(className, methodName, methodSignature, parameters...)
//参数中的类名必须是包含 Java 包路径的完整类名，例如我们在 org.cocos2dx.javascript 这个包下面写了一个 Test 类：
//package org.cocos2dx.javascript;
//那么这个 Test 类的完整类名应该是 org/cocos2dx/javascript/Test，
//注意这里必须是斜线 / ，而不是在Java代码中我们习惯的点 .


//jsb.reflection.callStaticMethod("org/cocos2dx/javascript/Test", "hello", 
//"(Ljava/lang/String;)V", "this is a message from js");

let AndroidAPI = {

    javaEntry: "sihe/minigame/zhaqianting/AppActivity",

    test: function() {
        debug.log("测试 js native interaction");
        debug.log(jsb.reflection.callStaticMethod(this.javaEntry, "test", "()I"));
        debug.log("测试 done");
    },

    copyToClipboard: function(s) {
        debug.log("copyToClipboard fail");
    },

    openUrl: function(url) {
        if (StringUtil.isEmpty(url)) {
            return;
        }
        debug.log("openUrl fail");
        //jsb.reflection.callStaticMethod(this.javaEntry, "openUrl:", url);
    },

    ////////////////////////九忆广告sdk ad/////////////////////////
    showOpeningAd() {
        //need？
        debug.log("showOpeningAd");
        //这样写，每个调用返回一个成功与否的字符
        debug.log(jsb.reflection.callStaticMethod(this.javaEntry, "showOpeningAd", "()I"));
    },

    showIntAd() {
        debug.log("showIntAd");
        debug.log(jsb.reflection.callStaticMethod(this.javaEntry, "showIntAd", "()I"));
    },

    showBannerAd() {
        debug.log("showBannerAd");
        debug.log(jsb.reflection.callStaticMethod(this.javaEntry, "showBannerAd", "()I"));
    },

    hideBannerAd() {
        debug.log("hideBannerAd");
        debug.log(jsb.reflection.callStaticMethod(this.javaEntry, "hideBannerAd", "()I"));
    },

    showVideoAd() {
        debug.log("showVideoAd");
        debug.log(jsb.reflection.callStaticMethod(this.javaEntry, "showVideoAd", "()I"));
    },

    loadVideoAd() {
        debug.log("loadVideoAd");
        debug.log(jsb.reflection.callStaticMethod(this.javaEntry, "loadVideoAd", "()I"));
    },

    showNativeAd() {
        debug.log("showNativeAd");
        debug.log(jsb.reflection.callStaticMethod(this.javaEntry, "showNativeAd", "()I"));
    },

    // showNativeAd() {
    //     //是否需要这个，再有上面的基础上
    // },

    // loadNativeAd() {
    //     //是否需要这个，再有上面的基础上
    // },

    onVideoAdLoaded(param) {
        debug.log("onVideoAdLoaded");
        debug.log(param);

        WechatAPI.videoAdUtil.onLoaded();
    },

    onVideoAdCeased() {
        debug.log("onVideoAdCeased");

        WechatAPI.videoAdUtil.onCeased();
    },

    onVideoAdDone() {
        debug.log("onVideoAdDone");

        WechatAPI.videoAdUtil.onDone();
    },

    onNativeAdLoaded(param) {
        debug.log("onNativeAdLoaded");
        debug.log(param);

        WechatAPI.nativeAdUtil.onLoaded();
    },

    enableBannerAd() {
        debug.log("onEnableBannerAd");
        WechatAPI.bannerAdUtil.isEnabled = function() {
            return true
        };
    },

    enableVideoAd() {
        debug.log("onEnableVideoAd");
        WechatAPI.videoAdUtil.isEnabled = function() {
            return true
        };
    },

    enableIntAd() {
        debug.log("onEnableIntAd");
        WechatAPI.interstitialAdUtil.isEnabled = function() {
            return true
        };
    },

    enableNativeAd() {
        debug.log("onEnableNativeAd");
        WechatAPI.nativeAdUtil.isEnabled = function() {
            return true
        };
    },

    disableBannerAd() {
        debug.log("onDisableBannerAd");
        WechatAPI.bannerAdUtil.isEnabled = function() {
            return false
        };
    },

    disableVideoAd() {
        debug.log("onDisableVideoAd");
        WechatAPI.videoAdUtil.isEnabled = function() {
            return false
        };
    },

    disableIntAd() {
        debug.log("onDisableIntAd");
        WechatAPI.interstitialAdUtil.isEnabled = function() {
            return false
        };
    },

    disableNativeAd() {
        debug.log("onDisableNativeAd");
        WechatAPI.nativeAdUtil.isEnabled = function() {
            return false
        };
    },


    //收到来自android的消息。 通过这种方式来交互  参数默认都是字符串
    onNativeMsg: function(msg) {
        if (msg == null) {
            return;
        }

        let obj = null;
        try {
            debug.log(msg);
            obj = JSON.parse(msg);
        } catch (e) {
            debug.log("onNativeMsg exception");
            debug.warn(e);
        }
        debug.log("解析成功 obj:");
        for (let i in obj) {
            debug.log(i + ":  " + obj[i]);
        }

        this.handleMsg(obj.type, obj.param);
    },

    // 处理解析后的消息
    handleMsg: function(type, param) {
        // 判断收到消息的是哪种行为
        switch (type) {
            case "":
                break;

            default:
                break;
        }
    },
};

module.exports = AndroidAPI;