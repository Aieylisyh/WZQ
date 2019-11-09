// let StringUtil = require("StringUtil");
let Encoder = require("Encoder");
let DataUtil = require("DataUtil");

let WxShare = {
    basePath: "customRes/",

    getShareTitle: function(param) {
        if (param) {
            if (param.title) {
                return param.title;
            }
        }

        return "官方正版潜艇大战，休闲免费3秒上手";
    },

    getImgUrl: function(param) {
        if (param) {
            if (param.img) {
                return this.basePath + param.img;
            }
        }

        return this.basePath + "share.png";
    },

    //根据类型获取query
    getQuery: function(param) {
        let query = "app=zqt";
        let userInfo = appContext.getUxManager().getUserInfo();

        if (userInfo && userInfo.openId) {
            query += "&sharerOpenId=" + userInfo.openId;
        }
        if (userInfo && userInfo.nickName) {
            query += "&sharerNickName=" + userInfo.nickName;
        }
        if (param && param.items) {
            query += "&items=" + Encoder.makeGiftCode(param.items);
        }

        return this.refineQuery(query);
    },

    refineQuery: function(query) {
        let res = {};

        let cardCode = null;
        if (query != "") {
            cardCode = DataUtil.getRandomPasswordByLength(5);
            query += "&cardCode=" + cardCode;
        }

        res.query = query;
        if (cardCode != null) {
            res.cardCode = cardCode;
        }

        return res;
    },

    getShareInfo: function(param) {
        debug.log("getShareInfo");

        let shareObj = {};
        shareObj.title = this.getShareTitle(param);
        shareObj.imageUrl = this.getImgUrl(param);

        let queryObj = this.getQuery(param);
        shareObj.query = queryObj.query;

        if (param != null) {
            this.cb = param.cb;
        }

        if (queryObj.cardCode != null) {
            shareObj.cardCode = queryObj.cardCode;
        }

        return shareObj;
    },


    listenOnShare: function() {
        //这个方法会在初始化游戏时执行，除非在回调函数里，否则请不要使用运行时定义的全局变量如debug

        WechatAPI.getWx().onShareAppMessage(function() {
            appContext.getAnalyticManager().addEvent("share_start");
            appContext.getAnalyticManager().addEvent("share_default");
            let shareObj = WechatAPI.shareUtil.getShareInfo();
            return shareObj;
        });
    },

    onShow: function() {
        // debug.log("wxshare onshow");
        // debug.log(this.cb.time);
        if (this.cb && typeof this.cb.time == "number") {
            let delta = Date.now() - this.cb.time;
            debug.log("wxshare onShow");
            debug.log(delta);
            if (delta < 2500) {
                if (typeof this.cb.failCb == "function") {
                    this.cb.failCb.call(this.cb.caller);
                }
            } else if (delta < 20000) {
                if (typeof this.cb.sucCb == "function") {
                    this.cb.sucCb.call(this.cb.caller);
                }
            } else {
                //too long
            }
        }

        this.cb = null;
    },

    share: function(param) {
        appContext.getAnalyticManager().addEvent("share_start");
        let shareObj = this.getShareInfo(param);

        if (shareObj.cardCode != null) {
            appContext.getUxManager().recordCardCode(shareObj.cardCode);
            delete shareObj.cardCode;
        }

        if (this.cb != null) {
            this.cb.time = Date.now();
            //debug.log(this.cb.time);
        }
        WechatAPI.getWx().shareAppMessage(shareObj);
    },
};

module.exports = WxShare;