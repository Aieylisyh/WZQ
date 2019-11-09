let StringUtil = require("StringUtil");

// AppStore中的AppId: 1278792634
// 微信的AppId: wxd7dfb81088f364f1
let KeyChain = {
    AccessGroup: "LFHM7DN793.com.diamondcat.ttigd", // 同一个开发者账号下不同应用可以通过 AccessGroup 访问 (与unity老版本对应，不可改变)

    OldDeviceIdKey: "visitor", // 游客id (keyChain的key, 与unity老版本对应，不可改变)

    NewDeviceIdKey: "newVisitorId", // 游客id (keyChain的key 新版本使用的)

    DefaultService: "ttigd", // (keyChain的serviceName, 和unity版本对应，不可改变)

    TradeService: "igd-trade",
};

let IosAPI =
{
    AppIdInAppStore: 1278792634, // app在appStore平台上的appid

    apiEntryName: "AppController",

    OCErrCode: {
        WXSuccess: 0,    /**< 成功    */
        WXErrCodeCommon: -1,   /**< 普通错误类型    */
        WXErrCodeUserCancel: -2,   /**< 用户点击取消并返回    */
        WXErrCodeSentFail: -3,   /**< 发送失败    */
        WXErrCodeAuthDeny: -4,   /**< 授权失败    */
        WXErrCodeUnsupport: -5,   /**< 微信不支持    */
        WXErrNotInstalled: -6,   /**< 微信没有安装    */
    },

    OCMsgCmd: {
        authRes: "authRes",
        toast: "toast",
        messageBox: "messageBox",
        shareRes: "shareRes",
        appleIap: "appleIap",
        Pony: "Pony",
    },

    currentBehaviorType: null,

    BehaviorType: {
        RequestAuthCodeForLogin: 1, // 登录时，请求微信授权码
        RequestAuthCodeForBind: 2, // 账号绑定时，请求微信授权码
        Pony: 3,
        AppleIap: 4,
    },

    // 无需主动调用，在oc代码里会自己注册
    //app启动后会自动调用，一般来讲无需使用
    register: function () {
        debug.log("RegisterAppID");
        let a = jsb.reflection.callStaticMethod(this.apiEntryName, "RegisterAppID:", "wxd7dfb81088f364f1");
        debug.log(a);
    },

    // (已封装, 请使用deviceAPI)
    isWechatInstalled: function () {
        debug.log("CheckWXInstalled");
        return jsb.reflection.callStaticMethod(this.apiEntryName, "CheckWXInstalled");
        //注册过appid后才会返回true，否则一定是false

        // 1、目前移动应用上微信登录只提供原生的登录方式，需要用户安装微信客户端才能配合使用。
        // 2、对于Android应用，建议总是显示微信登录按钮，当用户手机没有安装微信客户端时，请引导用户下载安装微信客户端。
        // 3、对于iOS应用，考虑到iOS应用商店审核指南中的相关规定，建议开发者接入微信登录时，
        // 先检测用户手机是否已安装微信客户端（使用sdk中isWXAppInstalled函数 ），
        // 对未安装的用户隐藏微信登录按钮，只提供其他登录方式（比如手机号注册登录、游客登录等）。
    },

    // 登录时，请求微信授权码 (已封装, 请使用deviceAPI)
    requestWxAuthCodeForLogin: function () {
        this.currentBehaviorType = this.BehaviorType.RequestAuthCodeForLogin;
        this.startAuth();
    },

    // 绑定微信时，请求授权码 (已封装, 请使用deviceAPI)
    requestWxAuthCodeForBind: function () {
        this.currentBehaviorType = this.BehaviorType.RequestAuthCodeForBind;
        this.startAuth();
    },

    //开始微信登陆，会跳转到微信
    //如果用户成功登陆会跳回app  产生一个onOCMsg回调
    startAuth: function () {
        debug.log("SendAuthRequest");
        let a = jsb.reflection.callStaticMethod(this.apiEntryName, "SendAuthRequest:State:", "snsapi_userinfo", "ttigdisgood");
        //"ttigdisgood": State用于保持请求和回调的状态，授权请求后原样带回给第三方。
        //该参数可用于防止csrf攻击（跨站请求伪造攻击），建议第三方带上该参数，可设置为简单的随机数加session进行校验
        //此处State最好用deviceId
        debug.log(a);
        //我的iphone手机会闪退，同样的iphone6没问题 可能是国外appstore下载微信的缘故？？？
    },

    // (已封装, 请使用deviceAPI)
    copyToClipboard: function (s) {
        debug.log("copyToClipboard");
        jsb.reflection.callStaticMethod(this.apiEntryName, "copyToClipboard:", s);
        // UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
        // pasteboard.string = self.link.text;
    },

    // (已封装, 请使用deviceAPI)
    startIapPay: function (productId, billNum) {
        debug.log("startIapPay");
        appContext.getAnalyticManager().addEvent("startIapPay");
        this.appleIapPayOcCallback = false;
        appContext.getTaskManager().addWaitingTask(10,
            function () {
                //appContext.getDialogManager().showToast("调用支付超时，请稍后重试");
                appContext.getDialogManager().hideWaitingCircle();
            },
            this,
            function () {
                if (this.appleIapPayOcCallback) {
                    this.appleIapPayOcCallback = false;
                    return true;
                }

                return false;
            },
            this);

        jsb.reflection.callStaticMethod("IapManager", "iapPay:outTradeNo:", productId, billNum);
    },

    // 测试
    startIapPayTest: function () {
        this.startIapPay("com.diamondcat.ttigd.jd_30", "startIapPayTest");
    },

    // 测试
    ponyTest: function () {
        this.startPony('{"appId":"wxddeccee845dd4d4b", "nonceStr":"1540874164086", "partnerId":"1336386001","prepayId":"wx30123603008677551ef56c5b0837422838", "timeStamp":"1540874164", "sign":"DFB6D7FE0ADC308DC26DEF5BD524DDE7"}');
    },

    // (已封装, 请使用deviceAPI)
    startPony: function (p) {
        debug.log("startPony");
        appContext.getAnalyticManager().addEvent("startPony");
        jsb.reflection.callStaticMethod(this.apiEntryName, "pony:", p);
    },

    // (已封装, 请使用deviceAPI)
    shareToMoment: function (param, from = "moment") {
        param.scene = 1;
        if (StringUtil.isNotEmpty(param.url) && StringUtil.isNotEmpty(from)) {
            param.url += "?from=" + from;
        }

        this.share(param);
    },

    // (已封装, 请使用deviceAPI)
    shareToConversation: function (param, from = "chat") {
        param.scene = 0;
        if (StringUtil.isNotEmpty(param.url) && StringUtil.isNotEmpty(from)) {
            param.url += "?from=" + from;
        }

        this.share(param);
    },

    share: function (param) {
        appContext.getAnalyticManager().addEvent("start_share__" + param.scene);
        this.shareRaw(param.url, param.tit, param.txt, param.img, param.imgPath, param.tmb, param.scene);
    },

    shareRaw: function (url, tit, txt, img, imgPath, tmb, scene) {
        debug.log("ios App wx shareRaw");
        debug.log(arguments);

        // handleWxShare:(NSString *)url
        //        imgUrl:(NSString *)imgUrl
        //       imgPath:(NSString *)imgPath
        //         title:(NSString *)title
        //       content:(NSString *)content
        //      thumbUrl:(NSString *)thumbUrl
        //     awardCode:(NSString *)awardCode
        //       toScene:(enum WXScene)scene {

        // WXSceneSession          = 0,   /**< 聊天界面    */
        // WXSceneTimeline         = 1,   /**< 朋友圈     */
        // WXSceneFavorite         = 2,   /**< 收藏       */
        // WXSceneSpecifiedSession = 3,   /**< 指定联系人  */
        jsb.reflection.callStaticMethod(this.apiEntryName, "handleWxShare:imgUrl:imgPath:title:content:thumbUrl:awardCode:toScene:",
            url, img, imgPath, tit, txt, tmb, "", scene);
    },

    //收到来自objectiveC的消息。 iOS系统通过这种方式来交互  参数默认都是字符串
    onOCMsg: function (msg) {
        debug.log("iosAPI收到来自objectiveC的消息");
        if (msg == null) {
            return;
        }

        let obj = null;
        try {
            debug.log(msg);
            obj = JSON.parse(msg);
        } catch (e) {
            debug.log("iosAPI onOCMsg exception");
            debug.warn(e);
        }
        debug.log("解析成功 obj:");
        for (let i in obj) {
            debug.log(i + ":  " + obj[i]);
        }

        let result = null;
        let resultCode = null;
        if (obj) {
            resultCode = parseInt(obj.resultCode);
        }
        switch (resultCode) {
            case this.OCErrCode.WXSuccess:
                result = this.processOCCommand(obj);
                break;

            case this.OCErrCode.WXErrCodeCommon:
                if (obj.errMsg != null) {
                    appContext.getDialogManager().showToast(obj.errMsg);
                }
                break;

            case this.OCErrCode.WXErrCodeUserCancel:
                appContext.getDialogManager().showToast("玩家取消");
                break;

            case this.OCErrCode.WXErrCodeSentFail:
                appContext.getDialogManager().showToast("发送失败", true);
                break;

            case this.OCErrCode.WXErrCodeAuthDeny:
                appContext.getDialogManager().showToast("授权失败", true);
                break;

            case this.OCErrCode.WXErrCodeUnsupport:
                appContext.getDialogManager().showToast("微信不支持", true);
                break;

            case this.OCErrCode.WXErrNotInstalled:
                appContext.getDialogManager().showToast("没有安装微信");
                break;

            default:
                debug.log("not supported onOCMsg result!");
        }

        this.handleOCMsgByBehaviorType(result);
    },

    processOCCommand: function (obj) {
        debug.log("processOCCommand");
        if (obj == null) {
            debug.log("obj is null");
            return null;
        }

        let result = null;
        if (obj.cmd != null) {
            //确保都有obj.cmd
            debug.log(obj.cmd);
            switch (obj.cmd) {
                case this.OCMsgCmd.authRes:
                    result = obj.Code;
                    break;

                case this.OCMsgCmd.appleIap:
                    this.appleIapPayOcCallback = true;
                    debug.log("cc收到苹果支付回复");
                    //obj.TransId
                    //PaymentUtil.onIapResponce(obj.Receipt, obj.OutTradeNo);
                    break;

                case this.OCMsgCmd.Pony:
                    debug.log("cc收到微支回复");
                    break;

                case this.OCMsgCmd.shareRes:
                    debug.log("cc收到微信分享回复");
                    appContext.shareUtil.onShareResponce(obj);
                    break;

                default:
                    break;
            }
        } else {
            debug.log("在processOCCommand之前请确保都有cmd");
        }

        return result;
    },

    // 处理解析后的objectiveC消息
    handleOCMsgByBehaviorType: function (result) {
        // 判断收到消息的是哪种行为
        switch (this.currentBehaviorType) {
            case this.BehaviorType.RequestAuthCodeForLogin:
                appContext.getLoginManager().onGetWechatAuthCode(result);
                break;

            case this.BehaviorType.RequestAuthCodeForBind:
                if (StringUtil.isNotEmpty(result)) {
                    appContext.getRemoteAPI().sendWechatBind(result);
                } else {
                    appContext.getDialogManager().showToast("微信授权失败", true);
                }
                break;

            default:
                break;
        }
        this.currentBehaviorType = null;
    },

    ////////////////start 以下是与keyChain交互///////////////////////
    // 从keyChain中获取deviceId
    getDeviceIdFromKeyChain: function () {
        let deviceId = this.getNewDeviceIdToKeyChain();
        debug.log("读取新的keyChain中deviceId");
        if (StringUtil.isEmpty(deviceId)) {
            debug.log("未读取到，尝试从unity版本存的keyChain中读取");
            deviceId = this.getOldDeviceIdToKeyChain();
            if (StringUtil.isNotEmpty(deviceId)) {
                debug.log("读取unity版本keyChain成功, 保存到新的keyChain中");
                this.saveDeviceIdToKeyChain(deviceId);
            } else {
                debug.log("没有读取到unity版本keyChain中数据");
            }
        }
        debug.log("deviceId: " + deviceId);

        return deviceId;
    },

    // 得到新版版本存在keychain中的id
    getNewDeviceIdToKeyChain: function () {
        let newDeviceId = this.getContentFromKeyChainOfService(KeyChain.NewDeviceIdKey, KeyChain.DefaultService);
        return newDeviceId;
    },

    // 得到旧版本存在keychain中的id
    getOldDeviceIdToKeyChain: function () {
        let oldDeviceId = this.getContentFromKeyChainOfService(KeyChain.OldDeviceIdKey, KeyChain.DefaultService);
        return oldDeviceId;
    },

    saveDeviceIdToKeyChain: function (deviceId) {
        this.saveContentToKeyChainOfService(KeyChain.NewDeviceIdKey, deviceId, KeyChain.DefaultService, KeyChain.AccessGroup);
    },

    removeDeviceIdFromKeyChain: function () {
        this.removeContentFromKeyChain(KeyChain.NewDeviceIdKey);
    },

    //获取所有本app用的keychain的key
    getKeyChainList: function (serviceName) {
        if (jsb == null) {
            return;
        }

        let result = jsb.reflection.callStaticMethod("SAMKeychain", "accountsForService:", serviceName);
        debug.log("获取所有本app用的keychain的key ");
        return result;
    },

    getContentFromKeyChainOfService: function (key, service, accessGroup = KeyChain.AccessGroup) {
        if (jsb == null) {
            return null;
        }

        let result = jsb.reflection.callStaticMethod(this.apiEntryName, "getContentFromKeyChainOfService:accessGroup:service:", key, accessGroup, service);
        return result;
    },

    saveContentToKeyChainOfService: function (key, content, service, accessGroup = KeyChain.AccessGroup) {
        if (jsb == null) {
            return false;
        }

        let isSuccess = jsb.reflection.callStaticMethod(this.apiEntryName, "saveContentToKeyChainOfService:forKey:accessGroup:service:", content, key, accessGroup, service);
        return isSuccess;
    },

    // 清除数据
    removeContentFromKeyChain: function (key, service = KeyChain.DefaultService, accessGroup = KeyChain.AccessGroup) {
        if (jsb == null) {
            return false;
        }

        let isSuccess = jsb.reflection.callStaticMethod(this.apiEntryName, "removeContentFromKeyChain:service:accessGroup:", key, service, accessGroup);
        return isSuccess;
    },

    //验证出问题的苹果订单
    validReceipts: function () {
        debug.log("验证苹果订单validReceipts");

        let keysString = this.getKeyChainList("igd-trade");

        if (StringUtil.isEmpty(keysString)) {
            return;
        }

        let keys = [];
        let list1 = keysString.match(/acct\s=\s[\w-\+]+;/g);
        let list2 = keysString.match(/acct\s=\s\"[\w-\+]+\";/g);

        if (list1) {
            for (let i in list1) {
                if (list1[i]) {
                    list1[i] = list1[i].replace(/acct\s=\s/, "");
                    list1[i] = list1[i].replace(/;/g, "");
                    keys.push(list1[i]);
                }
            }
        }

        if (list2) {
            for (let i in list2) {
                if (list2[i]) {
                    list2[i] = list2[i].replace(/acct\s=\s/, "");
                    list2[i] = list2[i].replace(/;/g, "");
                    list2[i] = list2[i].replace(/\"/g, "");
                    keys.push(list2[i]);
                }
            }
        }

        if (keys == null || keys.length == 0) {
            debug.log("keys is null or length == 0");
            return;
        }

        for (let i in keys) {
            if (keys[i] != null) {
                let key = keys[i];
                //debug.log("key: " + key);
                if (key == null || key == "") {
                    continue;
                }

                let receipt = this.getContentFromKeyChainOfService(key, "igd-trade");
                //debug.log(receipt);
                if (receipt == null || receipt == "") {
                    continue;
                }

                debug.log("checkReceipt of " + key);
                debug.log("receipt: " + receipt);
                appContext.getAnalyticManager().addEvent("sendAppleIapRes__recheck");
                appContext.getRemoteAPI().sendAppleIapRes(receipt, key);
            }
        }
    },

    getIpv6Address: function (host) {
        let url = jsb.reflection.callStaticMethod(this.apiEntryName, "getIPWithHostName:", host);
        return url;
    },

    openAppStore: function () {
        let url = "itms-apps://itunes.apple.com/app/id" + this.AppIdInAppStore;
        this.openUrl(url);
    },

    openUrl: function (url) {
        if (StringUtil.isEmpty(url)) {
            return;
        }

        jsb.reflection.callStaticMethod(this.apiEntryName, "openUrl:", url);
    },
};

module.exports = IosAPI;