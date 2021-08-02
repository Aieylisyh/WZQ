//let DataKey = require("DataKey");
//let StringUtil = require("StringUtil");
let DialogTypes = require("DialogTypes");
let StorageKey = require("StorageKey");
// let DataUtil = require("DataUtil");

let WechatAPI = {

    loginInfo: {},

    systemInfo: {},

    cache: {},

    threadWorker: require("ThreadWorker"),

    webService: require("WebService"),

    deviceManager: require("DeviceManager"),

    bannerAdUtil: null,

    videoAdUtil: null,

    interstitialAdUtil: null, //插屏广告

    nativeAdUtil: null, //原生广告

    enableYXSDK: true, //是否启用益欣的sdk。在这里更改！如果否，则使用我这里写的代码

    enableShare: false,

    ttRecorder: require("TTRecorder"),

    init() {
        let self = this;
        debug.log("WechatAPI init");
        //console.log("cc.sys.isNative " + cc.sys.isNative);

        if (window.qg) {
            window.wx = window.qg;
            // mz?
            if (debug.platformOppo) {
                console.log("isOppo");
                this.initYXSDK();
                this.isOppo = true;

                qg.setEnableDebug({
                    //enableDebug: debug.enableLog, // true 为打开，false 为关闭  不要开log才方便chrome调试
                    enableDebug: false,
                    success: function () {
                        // 以下语句将会在 vConsole 面板输出 
                        console.log("oppo");
                        console.info("qg info");
                        console.warn("qg warn");
                        console.debug("qg debug");
                        // console.error("qg error");//这个报错会卡死
                    },
                });

                let BannerAdUtil_oppo = require("BannerAdUtil_oppo");
                this.bannerAdUtil = new BannerAdUtil_oppo();

                let VideoAdUtil_oppo = require("VideoAdUtil_oppo");
                this.videoAdUtil = new VideoAdUtil_oppo();

                let InterstitialAdUtil_oppo = require("InterstitialAdUtil_oppo");
                this.interstitialAdUtil = new InterstitialAdUtil_oppo();

                let NativeAdUtil_oppo = require("NativeAdUtil_oppo");
                this.nativeAdUtil = new NativeAdUtil_oppo();

                let oppOpackageName = "submarine.xplay.kyx.nearme.gamecenter";
                let oppAppid = "30154796";
                // 炸潜艇H5-激励视频ID: 108240 
                // 炸潜艇H5-原生ID: 108239
                // 炸潜艇H5-开屏ID: 108237 
                // 炸潜艇H5-插屏ID: 108236
                // 炸潜艇H5-bannerID: 108235
                //需要获取用户信息才登录
                //YXSDK initAdService包含在里面，login是登陆的功能需要自己写 所以如果不需要用户信息就不用执行下面了
                if (!this.isYX) {
                    qg.login({
                        pkgName: oppOpackageName,

                        success: function (res) {
                            var data = JSON.stringify(res);
                            debug.log("!oppo login");
                            debug.log(data);
                        },
                        fail: function (res) {
                            debug.log('!Oppo login fail')
                            debug.log(JSON.stringify(res));
                        },
                        complete() {
                            debug.log("Oppo广告初始化");
                            qg.initAdService({

                                appId: oppAppid,

                                //  isDebug: debug.enableLog, // true 为打开，false 为关闭
                                isDebug: true,
                                success: function (res) {
                                    debug.log("Oppo广告成功");
                                    debug.log(res);
                                    self.initAdUtils();
                                },
                                fail: function (res) {
                                    debug.log("Oppo广告失败:" + res.code + res.msg);
                                },
                            })
                        }
                    });
                }


            } else if (debug.platformVivo) {
                console.log("isVivo");
                this.initYXSDK();
                this.isVivo = true;

                // packageName: "com.xplay.zqt.vivominigame",
                if (typeof qg.onUpdateReady == "function") {
                    qg.onUpdateReady(function (res) {
                        debug.log("vivo onUpdateReady " + res);
                        if (res == 1) {
                            qg.applyUpdate();
                        }
                    });
                }

                let BannerAdUtil_vivo = require("BannerAdUtil_vivo");
                this.bannerAdUtil = new BannerAdUtil_vivo();
                let VideoAdUtil_vivo = require("VideoAdUtil_vivo");
                this.videoAdUtil = new VideoAdUtil_vivo();
                let InterstitialAdUtil_vivo = require("InterstitialAdUtil_vivo");
                this.interstitialAdUtil = new InterstitialAdUtil_vivo();
                // this.nativeAdUtil = require("NativeAdUtil_vivo");

                this.initAdUtils();
            } else if (debug.platformMZ) {
                console.log("isMeizu");
                this.isMZ = true;
                if (typeof (mz_jsb) != "undefined") {
                    console.log("魅族有mz");
                    window.wx = window.qg;
                } else {
                    console.log("魅族无mz");
                    this.isMZ = false;
                }

                let BannerAdUtil_mz = require("BannerAdUtil_mz");
                this.bannerAdUtil = new BannerAdUtil_mz();
                let VideoAdUtil_mz = require("VideoAdUtil_mz");
                this.videoAdUtil = new VideoAdUtil_mz();
                let InterstitialAdUtil_mz = require("InterstitialAdUtil_mz");
                this.interstitialAdUtil = new InterstitialAdUtil_mz();

                this.initAdUtils();
            } else {
                console.log("platform unknown!");
            }

            qg.onError(function (data) {
                console.log("!QG onError");
                debug.log(data);
                debug.log(data.message);
            });
            //throw new TypeError("Cannot call a class as a function");
            //throw new Error("Cannot call a class as a function");

        } else if (debug.platformApp) {
            this.isApp = true;
            console.log("is app");
            let AppBridge = require("AppBridge");
            window.wx = new AppBridge();
            wx.init();

            if (jsb.Device) {
                wx.device = jsb.Device;
            } else if (cc.Device) {
                wx.device = cc.Device;
            }

            this.bannerAdUtil = wx.bannerAdUtil;
            this.videoAdUtil = wx.videoAdUtil;
            this.interstitialAdUtil = wx.interstitialAdUtil;
            this.nativeAdUtil = wx.nativeAdUtil;

            this.initAdUtils();
        } else if (debug.platformToutiao || window.wx) {
            if (debug.platformToutiao) {
                this.isTT = true;
                console.log("is toutiao");
                window.wx = window.tt;
                this.ttRecorder.setup();

                let BannerAdUtil_tt = require("BannerAdUtil_tt");
                this.bannerAdUtil = new BannerAdUtil_tt();
                let VideoAdUtil_tt = require("VideoAdUtil_tt");
                this.videoAdUtil = new VideoAdUtil_tt();
                let InterstitialAdUtil_tt = require("InterstitialAdUtil_tt");
                this.interstitialAdUtil = new InterstitialAdUtil_tt();

                wx.showShareMenu({
                    withShareTicket: true,
                });
                this.shareUtil = require("TtShare");
            } else {
                console.log("isWx");

                this.isWx = true;
                let BannerAdUtil_wx = require("BannerAdUtil_wx");
                this.bannerAdUtil = new BannerAdUtil_wx();
                let VideoAdUtil_wx = require("VideoAdUtil_wx");
                this.videoAdUtil = new VideoAdUtil_wx();
                let InterstitialAdUtil_wx = require("InterstitialAdUtil_wx");
                this.interstitialAdUtil = new InterstitialAdUtil_wx();
                //this.initCloudDev();

                wx.showShareMenu(); //显示转发按钮
                wx.updateShareMenu({
                    withShareTicket: true,
                });

                this.shareUtil = require("WxShare");

                WechatAPI.wxPromo = {};
                WechatAPI.wxPromo.ready = false;
                if (typeof wx.createGamePortal == "function") {
                    WechatAPI.wxPromo.portal = wx.createGamePortal({
                        adUnitId: "PBgAAeySGo7XS9rw",
                        success: function (res) {
                            console.log(res);
                        },
                        fail: function (res) {
                            console.log(res);
                        }
                    });
                    WechatAPI.wxPromo.portal.onLoad(
                        function () {
                            WechatAPI.wxPromo.ready = true;
                        });
                    WechatAPI.wxPromo.portal.onClose(
                        function () {
                            WechatAPI.wxPromo.ready = false;
                            WechatAPI.wxPromo.portal.load();
                        });

                    WechatAPI.wxPromo.portal.load();

                }

                // if (typeof wx.onMemoryWarning == "function") {
                //     wx.onMemoryWarning(function(res) {
                //         WechatAPI.GC();
                //     })
                // }

                wx.onShow(function (res) {
                    WechatAPI.wxOnShow(res);
                });
                WechatAPI.wxOnShow(wx.getLaunchOptionsSync());
            }

            this.initAdUtils();
            wx.onAudioInterruptionEnd(function () {
                appContext.getSoundManager().onShow();
            });
            this.enableShare = true;
            WechatAPI.shareUtil.listenOnShare(); //初始化分享

            WechatAPI.deviceManager.fitWideScreen();

            if (typeof wx.getUpdateManager === 'function') {
                const updateManager = wx.getUpdateManager();
                updateManager.onCheckForUpdate(function (res) {
                    if (res.hasUpdate) {
                        console.log("发现新版本");
                    }
                })

                updateManager.onUpdateReady(function () {
                    wx.showModal({
                        title: "检测到新版本",

                        content: "新的版本已经下载好，是否立即应用新版本?",

                        success: function (res) {
                            if (res.confirm) {
                                console.log("用户选更新");
                                updateManager.applyUpdate();
                            } else if (res.cancel) {
                                console.log("用户选不更新");
                            }
                        },
                    })
                })

                updateManager.onUpdateFailed(function () {
                    console.warn("新版本下载失败");
                })
            } else {
                console.log("不存在UpdateManager");
            }
        } else if (debug.platformBaidu) {
            console.log("isBaidu");
            this.isBaidu = true;
            window.wx = window.swan;
            this.ttRecorder.setup();

            let BannerAdUtil_baidu = require("BannerAdUtil_baidu");
            this.bannerAdUtil = new BannerAdUtil_baidu();
            let VideoAdUtil_baidu = require("VideoAdUtil_baidu");
            this.videoAdUtil = new VideoAdUtil_baidu();
            let InterstitialAdUtil_baidu = require("InterstitialAdUtil_baidu");
            this.interstitialAdUtil = new InterstitialAdUtil_baidu();

            this.initAdUtils();

            this.showAnyPromotion = function (barOrTip = false) {
                if (typeof swan.showFavoriteGuide == "function" && Math.random() < 0.5) {
                    swan.showFavoriteGuide({
                        type: barOrTip ? 'bar' : 'tip',
                        content: '一键添加到我的小程序',
                        success: res => {
                            console.log('添加成功：', res);
                        },
                        fail: err => {
                            console.log('添加失败：', err);
                        }
                    });
                } else if (typeof swan.showAddToDesktopGuid == "function") {
                    swan.showAddToDesktopGuide({
                        type: barOrTip ? 'bar' : 'tip',
                        content: '一键添加到我的桌面',
                        success: res => {
                            console.log('添加成功：', res);
                        },
                        fail: err => {
                            console.log('添加失败：', err);
                        }
                    })
                }

            };

            // let ratio = WechatAPI.deviceManager.getPixelRatio(); //0.33
            // let gameSize = WechatAPI.deviceManager.getCanvasSize(); //w640 h 1386

            // 创建按钮
            // WechatAPI.recommendationButton = swan.createRecommendationButton({
            //     type: 'list',
            //     style: {
            //         left: gameSize.width * ratio - 85 * ratio,
            //         top: gameSize.height * 0.5 * ratio + 20 * ratio,
            //     }
            // });
            this.enableShare = true;
            this.shareUtil = require("TtShare");

        } else if (debug.platformUC) {
            console.log("isUC");

            this.isUC = true;
            window.wx = window.uc;
            //console.log(uc);
            // this.ttRecorder.setup();

            let BannerAdUtil_uc = require("BannerAdUtil_uc");
            this.bannerAdUtil = new BannerAdUtil_uc();
            let VideoAdUtil_uc = require("VideoAdUtil_uc");
            this.videoAdUtil = new VideoAdUtil_uc();
            let InterstitialAdUtil_uc = require("InterstitialAdUtil_uc");
            this.interstitialAdUtil = new InterstitialAdUtil_uc();

            this.initAdUtils();

            this.enableShare = false;
            this.shareUtil = require("TtShare");
            if (debug.enableLog) {
                uc.setEnableDebug({
                    enableDebug: true,
                    complete: function (data) {
                        console.log('uc.setEnableDebug openDebug. ');
                    },
                });
            }

            uc.getLaunchOptionsSync({
                success: res => {
                    console.log('getLaunchOptionsSync success', JSON.stringify(res));
                    /**
                     *	query存在的情况下为
                     * {
                     *		query: "key1%3Dval1%26key2%3Dval2"
                     * }
                     * 不存在为空字符串
                     */
                    WechatAPI.wxOnShow(res);
                },
                fail: err => {
                    console.log('getLaunchOptionsSync fail', JSON.stringify(err));
                },
            });
        } else if (debug.platformYY) {
            console.log("isYY");

            this.isYY = true;
            window.wx = window.WanGameH5sdk;
            //console.log(WanGameH5sdk);
            WanGameH5sdk.config({
                share: {    // 邀请参数配置
                    success: function () {
                        console.log("邀请成功");
                    },
                    cancel: function () {
                        console.log("取消邀请");
                    }
                },
                focus: {   // 关注状态配置
                    success: function () {
                        console.log("异步通知关注成功");
                    }
                }
            });
            console.log("yy登录");
            WanGameH5sdk.login({
                success: function (data) {
                    // 登录成功回调
                    console.log("登录成功");
                    console.log(data);    // data: {"sid": "foo", "uid": 1140000000757060}，sid用于服务端对接参数,uid作为唯一用户标识
                    let userId = WechatAPI.getStorageSync(StorageKey.UserKey);
                    let isNewUser = false;
                    if (data.uid != userId) {
                        isNewUser = true;
                        userId = data.uid;
                        WechatAPI.setStorageSync(StorageKey.UserKey, userId);
                    }

                    appContext.getUxManager().onLoginFinish(userId);
                    let userBasic = appContext.getUxManager().getUserInfo().basic;
                    if (isNewUser) {
                        WanGameH5sdk.log({
                            action: 'createrole',
                            gser: '1',
                            servername: 'WZQ1',
                            roleid: userId,
                            rolename: userBasic.nickname,
                        });
                    }
                },

                fail: function (data) {
                    // 登录失败回调
                    console.log("登录失败");
                    console.log(data.status); // 失败状态码
                    appContext.getUxManager().onLoginFinish();
                }
            });

            let BannerAdUtil_yy = require("BannerAdUtil_yy");
            this.bannerAdUtil = new BannerAdUtil_yy();
            let VideoAdUtil_yy = require("VideoAdUtil_yy");
            this.videoAdUtil = new VideoAdUtil_yy();
            let InterstitialAdUtil_yy = require("InterstitialAdUtil_yy");
            this.interstitialAdUtil = new InterstitialAdUtil_yy();

            this.initAdUtils();

            this.enableShare = false;
            this.shareUtil = require("TtShare");
        }

        if (this.isEnabled()) {
            wx.originRequire = require;
            this.keepScreenOn();
        }
    },

    wxOnShow(res) {
        console.log("onshow 启动参数！")
        console.log(res);

        if (res) {
            if (cc.tempData == null) {
                cc.tempData = {};
            }
            if (res.query != null) {
                for (let i in res.query) {
                    cc.tempData[i] = res.query[i];
                }
            }

            if (res.shareTicket != null) {
                let key = "shareTicketOnShow";
                cc.tempData[key] = res.shareTicket;
            }

            if (res.scene != null) {
                cc.enterAppSceneId = res.scene;
            }

            if (res.referrerInfo != null) {
                cc.tempData.referrerInfo = res.referrerInfo;
            }
            cc.tempData.timestamp = Date.now();
        }

        appContext.getSoundManager().onShow();
        WechatAPI.shareUtil && WechatAPI.shareUtil.onShow();
    },

    setTTAppLaunchOptions() {
        this.ttAppLaunchOptions = null;

        this.hasTTRawMoreGame = false;
        this.hasTTNewMoreGame = false;
        if(!WechatAPI.isEnabled()){
            return;
        }
        
        if (typeof wx.createMoreGamesButton == 'function') {
            if (typeof wx.showMoreGamesModal !== 'function' || WechatAPI.systemInfo.platform == 'ios' || WechatAPI.systemInfo.platform == 'iOS') {
                //this.hasTTRawMoreGame = true;
            } else {
                this.hasTTNewMoreGame = true;
            }
        } else {
            return;
        }

        let res = [];
        let promoInfo = debug.getPromoList();
        if (promoInfo == null) {
            return;
        }

        for (let i in promoInfo) {
            let info = promoInfo[i];
            if (info) {
                res.push({
                    appId: info.appid,
                    query: 'app=wzq',
                    extraData: {}
                });
            }
        }

        this.ttAppLaunchOptions = res;
        debug.log("!!ttAppLaunchOptions");
        debug.log(this.ttAppLaunchOptions);

        if (this.hasTTRawMoreGame) {
            this.createTTPoorBtn();
        }

        // if (appContext.getWindowManager().isInMainWindow()) {
        //     let mw = appContext.getWindowManager().getCurrentWindowNode().getComponent("MainWindow");
        //     if (mw && mw.showPromo) {
        //         mw.showPromo();
        //     }
        // }
    },

    createTTPoorBtn() {
        let ratio = WechatAPI.deviceManager.getPixelRatio(); //0.33
        let gameSize = WechatAPI.deviceManager.getCanvasSize(); //w640 h 1386

        WechatAPI.PoorTTBtn = wx.createMoreGamesButton({
            type: "image",
            image: "customRes/more.png",
            style: {//-320
                //left: 10 * ratio,
                left: gameSize.width * ratio - 85 * ratio,
                top: gameSize.height * 0.5 * ratio - 290 * ratio,
                width: 75 * ratio,
                height: 75 * ratio,

                // left: 20 * ratio,
                // top: gameSize.height * 0.5 * ratio + 320 * ratio,
                // width: 72 * ratio,
                // height: 72 * ratio,
                lineHeight: 40,
                backgroundColor: "#00000000",
                textColor: "#ffffff",
                textAlign: "center",
                fontSize: 16,
                borderRadius: 0,
                borderWidth: 0,
                borderColor: '#ff0000'
            },
            appLaunchOptions: WechatAPI.ttAppLaunchOptions,
            // onNavigateToMiniGame(res) {
            //     console.log("跳转其他小游戏", res)
            // }
        });

        WechatAPI.PoorTTBtn.hide();
        debug.log("创建PoorTTBtn");
        debug.log(WechatAPI.PoorTTBtn);
    },

    initCloudDev() {
        debug.log("开始初始化微信云开发");
        //https://developers.weixin.qq.com/minigame/dev/wxcloud/reference-client-api/init.html
        let param = {};
        param.env = ""; //string | object
        //默认环境配置，传入字符串形式的环境 ID 可以指定所有服务的默认环境，
        //传入对象可以分别指定各个服务的默认环境，见下方详细定义
        //database 数据库 API 默认环境配置
        //storage 存储 API 默认环境配置
        //functions 云函数 API 默认环境配置 
        //环境 ID  aieylisyh-1u4z1
        param.traceUser = true; //是否在将用户访问记录到用户管理中，在控制台中可见

        wx.cloud.init(param);


        //在开始使用数据库 API 进行增删改查操作之前，需要先获取数据库的引用。以下调用获取默认环境的数据库的引用：
        const db = wx.cloud.database();
        //要操作一个集合，需先获取它的引用
        const todos = db.collection('todos'); //获取集合的引用并不会发起网络请求取拉取它的数据
        //假设我们有一个待办事项的 ID 为 todo-identifiant-aleatoire
        const todo = db.collection('todos').doc('todo-identifiant-aleatoire');


        //实时数据推送 调用 Collection 上的 watch 方法
        //https://developers.weixin.qq.com/minigame/dev/wxcloud/guide/database/realtime.html
        //每当数据库更新而导致查询条件对应的查询结果发生变更时，小程序可收到一个更新事件
    },

    //初始化益欣公司的sdk
    initYXSDK() {
        if (!this.enableYXSDK) {
            debug.log("不适用益欣sdk");
            return;
        }

        this.isYX = true;
        debug.log("初始化益欣sdk");
        this.YXSDK = require("ASCAd").default.getInstance();
        this.YXSDK.initAd();
        //console.log(this.YXSDK);
    },

    initAdUtils: function () {
        debug.log("!initAdUtils");
        appContext.scheduleOnce(function () {
            WechatAPI.bannerAdUtil && WechatAPI.bannerAdUtil.init();
            WechatAPI.videoAdUtil && WechatAPI.videoAdUtil.init();
            WechatAPI.interstitialAdUtil && WechatAPI.interstitialAdUtil.init();
            WechatAPI.nativeAdUtil && WechatAPI.nativeAdUtil.init();
        }, 0.5);
    },

    isEnabled: function () {
        if (this._enabled != null) {
            return this._enabled;
        }

        let enabled = false;
        try {
            if (wx != undefined) {
                enabled = true;
            }
        } catch (error) {
            //debug.log(error);
        }
        this._enabled = enabled;
        return enabled;
    },

    getWx: function () {
        if (this._enabled != null) {
            if (this._enabled) {
                return window.wx;
            }
        } else if (this.isEnabled()) {
            return window.wx;
        }
        return null;
    },

    copy: function (content, sucCallback, failCallback, caller) {
        if (!this.isEnabled()) {
            return;
        }

        if (caller == null) {
            caller = this;
        }
        if (typeof wx.setClipboardData != "function") {
            failCallback && failCallback.call(caller);
        }

        if (this.isVivo) {
            wx.setClipboardData({
                text: content,
                success: function () {
                    sucCallback && sucCallback.call(caller);
                },
                fail: function (res) {
                    failCallback && failCallback.call(caller);
                },
            })
        } else if (this.isApp) {
            console.warn("copyToClipboard not implemented");
        } else {
            wx.setClipboardData({
                data: content,
                success: function (res) {
                    sucCallback && sucCallback.call(caller);
                },

                fail: function (res) {
                    failCallback && failCallback.call(caller);
                },
            });
        }
    },

    showToast: function (title, milliseconds = 2000, icon, imagePath) {
        if (!this.isEnabled()) {
            return;
        }

        if (this.isWx || this.isTT || this.isBaidu) {
            let obj = {
                title: title,

                duration: milliseconds,
            };

            if (imagePath != null) {
                obj.image = imagePath;
            } else if (icon != null) {
                obj.icon = icon; //可选填： success  loading 
            }

            wx.showToast(obj);
        } else if (this.isVivo) {
            qg.showToast({
                message: title
            })
        } else if (this.isMZ) {
            mz.showToast({
                message: title//https://shimo.im/docs/enni3mhvNyo5fZOm/read
            })
        } else {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, title);
        }
    },

    showModal: function (title, content, onConfirm, onCancel, caller) {
        if (!this.isEnabled()) {
            return;
        }

        if (this.isWx || this.isTT || this.isBaidu) {
            wx.showModal({
                title: title,

                content: content,

                success: function (res) {
                    if (res.confirm) {
                        if (onConfirm != null) {
                            if (caller != null) {
                                onConfirm.call(caller);
                            } else {
                                onConfirm();
                            }
                        }
                    } else if (res.cancel) {
                        if (onCancel != null) {
                            if (caller != null) {
                                onCancel.call(caller);
                            } else {
                                onCancel();
                            }
                        }
                    }
                },
            })
        } else if (this.isVivo) {
            qg.showDialog({
                title: title,
                message: content,
                buttons: [{
                    text: 'btn',
                    color: '#33dd44'
                }],
                success: function (res) {
                    if (res.confirm) {
                        if (onConfirm != null) {
                            if (caller != null) {
                                onConfirm.call(caller);
                            } else {
                                onConfirm();
                            }
                        }
                    } else if (res.cancel) {
                        if (onCancel != null) {
                            if (caller != null) {
                                onCancel.call(caller);
                            } else {
                                onCancel();
                            }
                        }
                    }
                },
                cancel: function () {
                    console.log('handling cancel')
                },
                fail: function (data, code) {
                    console.log(`handling fail, code = ${code}`)
                }
            })
        } else {
            let info = {
                content: title + "\n\n" + content,
                btn1: {
                    name: "确  定",
                    clickFunction: onConfirm,
                    clickFunctionCaller: caller,
                },
                btn2: {
                    name: "取  消",
                    clickFunction: onCancel,
                    clickFunctionCaller: caller,
                },
            };

            appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, info);
        }
    },

    setStorage: function (storageKey, storageData) {
        if (!this.isEnabled()) {
            return;
        }

        if (typeof wx.setStorage == "function") {
            if (this.isYY) {
                wx.setStorage(storageKey,storageData);
            }else  if (this.isVivo) {
                wx.setStorage({
                    key: storageKey,
                    value: storageData,//vivo
                });
            } else  if (typeof wx.setStorage == "function") {
                wx.setStorage({
                    key: storageKey,
                    data: storageData,
                });
            } 
        } else if (window.localStorage && typeof window.localStorage.setItem == "function") {
            window.localStorage.setItem(storageKey, storageData);
        } else {
            this.setStorageSync(storageKey, storageData);
        }
    },

    setStorageSync: function (storageKey, storageData) {
        if (!this.isEnabled()) {
            return;
        }

        if (typeof wx.setStorage == "function") {
            if (this.isYY) {
                wx.setStorage(storageKey,storageData);
            }else  if (this.isVivo) {
                wx.setStorage({
                    key: storageKey,
                    value: storageData,//vivo
                });
            } else  if (typeof wx.setStorage == "function") {
                wx.setStorage({
                    key: storageKey,
                    data: storageData,
                });
            } 
        } else if (window.localStorage && typeof window.localStorage.setItem == "function") {
            window.localStorage.setItem(storageKey, storageData);
        } else if (cc.sys && cc.sys.localStorage) {
            let dataStr = "";
            if (typeof storageData == "string") {
                dataStr = storageData;
            } else if (typeof storageData == "object") {
                dataStr = JSON.stringify(storageData);
            } else {
                dataStr += storageData;
            }

            cc.sys.localStorage.setItem(storageKey, dataStr);
        }
    },

    removeStorageSync: function (storageKey) {
        if (!this.isEnabled()) {
            return;
        }

        if(this.isYY){
            WanGameH5sdk.removeStorage(storageKey);
            return;
        }
        if (typeof wx.removeStorageSync == "function") {
            wx.removeStorageSync(storageKey);
        } else if (typeof wx.deleteStorage == "function") {
            wx.deleteStorage({
                key: storageKey
            })
        } else if (window.localStorage && typeof window.localStorage.removeItem == "function") {
            window.localStorage.removeItem(storageKey);
        } else if (cc.sys && cc.sys.localStorage) {
            cc.sys.localStorage.removeItem(storageKey)
        }
    },

    getStorageSync: function (storageKey, tryReadAsJSON = true, typeConvertRule) {
        if (!this.isEnabled()) {
            return null;
        }

        let info;
        if (!this.isVivo && typeof wx.getStorageSync == "function") {
            info = wx.getStorageSync(storageKey);
        } else if (this.isVivo) {
            info = wx.getStorageSync({
                key: storageKey
            });
        } else if (window.localStorage && typeof window.localStorage.getItem == "function") {
            info = window.localStorage.getItem(storageKey);
        } else if (cc.sys && cc.sys.localStorage) {
            info = cc.sys.localStorage.getItem(storageKey);
        }

        //debug.log("!getStorageSync " + storageKey);
        //debug.log(info);
        if (!tryReadAsJSON) {
            if (typeConvertRule == "number") {
                return Number(info);
            } else if (typeConvertRule == "object") {
                return JSON.parse(info);
            } else {
                return info;
            }
        }

        if (info == null || info == "") {
            return null;
        }

        if (typeof info == "object") {
            return info;
        }

        try {
            //debug.log(JSON.parse(info));
            return JSON.parse(info);
        } catch (e) {
            debug.log(e);
            return info;
        }
    },

    getStorage: function (storageKey, callback, caller) {
        if (!this.isEnabled()) {
            return;
        }

        if (typeof wx.getStorage == "function") {
          if(this.isYY){
            wx.getStorage(storageKey, function(value){
                callback.call(caller,value);
            });
          }else{
            wx.getStorage({
                key: storageKey,

                success: function (res) {
                    callback.call(caller, res.data);
                },

                fail: function (res) {
                    callback.call(caller);
                },
            });
          }
        } else {
            callback.call(caller, this.getStorageSync(storageKey));
        }
    },


    GC() {
        if (this.isEnabled() && typeof wx.triggerGC == "function") {
            wx.triggerGC();
        } else if (this.isApp) {
            cc.sys && cc.sys.garbageCollect && cc.sys.garbageCollect();
        }
    },

    keepScreenOn: function () {
        if (typeof wx.setKeepScreenOn == "function") {
            //屏幕常亮
            //微信 头条 oppo vivo都是这个
            wx.setKeepScreenOn({
                keepScreenOn: true,
            });
        } else if (this.isApp) {
            if (wx.device && typeof wx.device.setKeepScreenOn == "function") {
                wx.device.setKeepScreenOn(true); //屏幕常亮
            }
        }
    },

    getOpenDataContext: function () {
        if (!this.isEnabled() || !this.isWx) {
            return null;
        }

        if (appContext.getUxManager().cachedOpenDataContext) {
            return appContext.getUxManager().cachedOpenDataContext;
        }
        try {
            if (typeof wx.getOpenDataContext === "function") {
                debug.log("getOpenDataContext is enabled");
                appContext.getUxManager().cachedOpenDataContext = wx.getOpenDataContext();
                return appContext.getUxManager().cachedOpenDataContext;
            } else {
                debug.log("getOpenDataContext is not enabled");
                return null;
            }
        } catch (e) {
            debug.warn(e);
            debug.warn("exception in getOpenDataContext");
            return null;
        }
    },

    customerService: function () {
        //https://developers.weixin.qq.com/miniprogram/dev/api/custommsg/callback_help.html
        if (!this.isEnabled() || !this.isWx) {
            return;
        }

        try {
            debug.tempBlockOnHideExit = true;
            wx.openCustomerServiceConversation({
                success: function (res) {
                    debug.log("csc suc");
                    debug.log(res);
                },

                fail: function (res) {
                    debug.log("csc fail");
                    debug.log(res);
                }
            });
        } catch (e) {
            debug.log(e);
            appContext.getDialogManager().showDialog("暂时无法打开客服页面", false, 1);
        }
    },

    showGameClubBtn: function () {
        if (!this.isEnabled() || !this.isWx || wx.createGameClubButton == null || typeof wx.createGameClubButton !== "function") {
            return;
        }

        if (this.wxGameClubBtn != null) {
            this.wxGameClubBtn.show();
        } else {
            if (this.systemInfo.windowWidth == null) {
                this.setSystemInfo();
            }

            let ratio = WechatAPI.deviceManager.getPixelRatio();
            let size = Math.floor(54 * ratio);
            let btnLeft = 16 * ratio;
            let btnTop = 16 * ratio;
            let p = {
                left: btnLeft || 12,
                top: btnTop || 12,
                width: size || 32,
                height: size || 32,
            };
            debug.log(p);
            this.wxGameClubBtn = wx.createGameClubButton({
                icon: 'light', //light
                style: p
            });
        }
    },

    hideGameClubBtn: function () {
        if (this.wxGameClubBtn != null) {
            this.wxGameClubBtn.hide();
        }
    },

    updateWxCloudScore: function (username, score) {
        score = score + "";
        if (!this.isEnabled() || !this.isWx) {
            return;
        }

        //微信版本没有这API
        if (wx.setUserCloudStorage == null || typeof wx.setUserCloudStorage !== "function") {
            return;
        }

        wx.setUserCloudStorage({
            KVDataList: [{
                key: "person_total_score",
                value: score
            }, {
                key: "username",
                value: username
            }],

            success: function (res) {
                debug.log("updateWxCloudScore success");
            },

            fail: function (res) {
                debug.log("updateWxCloudScore fail");
                debug.log(res);
            },
        });
    },

    clientService: function () {
        if (!this.isEnabled() || !this.isWx || typeof wx.openCustomerServiceConversation != "function") {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "当前微信不支持实时客服");
            return;
        }

        try {
            wx.openCustomerServiceConversation({});
        } catch (e) {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "当前微信不支持实时客服");
        }
    },

    vibrate: function () {
        if (appContext.getGameSettingManager().noVibrate) {
            return;
        }
        //vibrateLong()
        if (typeof wx.vibrateShort == "function") {
            if (this.isMZ) {
                wx.vibrateShort({});//效果特别差
            } else {
                wx.vibrateShort();
            }

        } else if (window.navigator && typeof window.navigator.vibrate == "function") {
            window.navigator.vibrate(15);
        } else if (this.isApp) {
            //在js代码里调用cc.Device.vibrate()， 参数是震动时间， 单位是秒。
            // 安卓的AndroidManifest.xml增加震动权限， 不加会闪退黑屏
            if (wx.device && typeof wx.device.vibrate == "function") {
                wx.device.vibrate(0.03)
            }
        }
    },

    setSystemInfo: function () {
        if (!this.isEnabled()) {
            return;
        }

        let s = null;
        if (window.navigator && navigator.systemInfo) {
            s = navigator.systemInfo;
        } else if (typeof wx.getSystemInfoSync == "function") {
            s = wx.getSystemInfoSync();
        } else if (this.isApp) {
            s = cc.sys;
        }

        debug.log("setSystemInfo");
        if (this.isTT) {
            if (s.appName == "Toutiao") {
                console.log("今日头条");
            } else if (s.appName == "Douyin") {
                console.log("抖音");
            }
        }

        if (this.isWx || this.isTT || this.isBaidu) {
            this.systemInfo.appName = s.appName;
            this.systemInfo.platform = s.platform;
            this.systemInfo.model = s.model;
            this.systemInfo.windowHeight = s.windowHeight;
            this.systemInfo.windowWidth = s.windowWidth;
            this.systemInfo.version = s.version;
            this.systemInfo.SDKVersion = s.SDKVersion;
        } else if (this.isYY) {
            this.systemInfo.platform = "YY";
            this.systemInfo.model = cc.sys.os;
            this.systemInfo.windowHeight = cc.view._frameSize.height;
            this.systemInfo.windowWidth = cc.view._frameSize.width;
            this.systemInfo.version = "yy";
            this.systemInfo.SDKVersion = "yy";
        } else if (this.isUC) {
            //异常的特殊 返回的字符串！
            s = JSON.parse(s);
            //statusBarHeight
            //pixelRatio
            //brand
            this.systemInfo.platform = s.osType;
            this.systemInfo.model = s.model;
            this.systemInfo.windowHeight = s.screenHeight;
            this.systemInfo.windowWidth = s.screenWidth;
            this.systemInfo.version = s.osVersionName;
            this.systemInfo.SDKVersion = s.osVersionCode;
        } else if (this.isVivo) {
            //https://minigame.vivo.com.cn/documents/#/api/system/system-info
            this.systemInfo.platform = s.osType;
            this.systemInfo.model = s.model;
            this.systemInfo.windowHeight = s.screenHeight;
            this.systemInfo.windowWidth = s.screenWidth;
            this.systemInfo.version = s.osVersionName;
            this.systemInfo.SDKVersion = s.osVersionCode;
        } else if (this.isOppo) {
            //https://minigame.vivo.com.cn/documents/#/api/system/system-info?id=qggetsysteminfosync
            this.systemInfo.platform = s.osType;
            this.systemInfo.model = s.model;
            this.systemInfo.windowHeight = s.screenHeight;
            this.systemInfo.windowWidth = s.screenWidth;
            this.systemInfo.version = s.osVersionName;
            this.systemInfo.SDKVersion = s.osVersionCode;
        } else if (this.isMZ) {
            //https://minigame.vivo.com.cn/documents/#/api/system/system-info?id=qggetsysteminfosync
            this.systemInfo.platformVersionCode = this.systemInfo.platformVersion;
            if (this.systemInfo.platformVersionCode > 1031) {
                this.systemInfo.platformVersionCode = 1064;//??????
            }

            this.systemInfo.platform = s.osType;
            this.systemInfo.model = s.model;
            this.systemInfo.windowHeight = s.screenHeight;
            this.systemInfo.windowWidth = s.screenWidth;
            this.systemInfo.version = s.osVersionName;
            this.systemInfo.SDKVersion = s.osVersionCode;
        } else if (this.isApp) {
            //let canvasSize = cc.view.getVisibleSize(); //游戏中的像素 {width: 640, height: 1137.7777777777778}
            let frameSize = cc.view.getFrameSize(); //实际像素  {width: 414, height: 736}
            this.systemInfo.platform = s.platform;
            this.systemInfo.model = cc.sys.os;
            this.systemInfo.windowHeight = frameSize.height;
            this.systemInfo.windowWidth = frameSize.width;
            this.systemInfo.version = s.osMainVersion;
            this.systemInfo.SDKVersion = s.osVersion;
        }
        debug.log(this.systemInfo);
    },
}

module.exports = WechatAPI;