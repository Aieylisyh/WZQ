cc.Class({
    extends: cc.Component,

    properties: {
        enableLog: true,

        useDevFileDownloadRoot: true,

        //在文件下载地址后加上版本号，比如020版本时
        //从https://root下载，就变成了从https://root/020下载
        attachVersionToFileDownloadRoot: false,

        useDevLocalServerIp: true, //用本地测试服务器的ip

        useDevRemoteServerIp: true, //用本地测试服务器的ip

        clientVersion: '',

        pipDownloadPath: '/pip/pip.',

        devFileDownloadRoot: '',

        releaseFileDownloadRoot: '',

        testPlatform: "",

        appId: "wx4072065173bb346e",//wx4072065173bb346e fashicun

        platformOppo: false,

        platformVivo: false,

        platformApp: false,

        platformToutiao: false,

        remoteFileUrlSuffix_wx: "/wx",

        remoteFileUrlSuffix_vivo: "/vivo",

        remoteFileUrlSuffix_oppo: "/oppo",

        remoteFileUrlSuffix_app: "/app",

        remoteFileUrlSuffix_tt: "/tt",
    },

    init: function () {
        let debug = window.debug = debug = {
            appId: this.appId,
            platformOppo: this.platformOppo,
            platformVivo: this.platformVivo,
            platformApp: this.platformApp,
            platformToutiao: this.platformToutiao,

            extraSettings: {
                global: true,
            },

            configExtension: null, // 下载配置的后缀名, 默认值为null, 不要设为""

            setConfigByRemoteConfig: function (remoteCfg) {
                //软写入 不覆盖没有配置的
                //什么都不配就是最严格的
                for (let i in remoteCfg) {
                    //debug.log(i + " " + remoteCfg[i]);
                    debug.extraSettings[i] = remoteCfg[i];
                }

                debug.extraSettings.hasRemoteConfig = true;
                debug.extraSettings.hasSetupByServerConfig = false;
            },

            setEnableLog: function (isEnabled) {
                if (isEnabled) {
                    if (WechatAPI.isWx) {
                        debug.log = debug.console.log;
                        debug.info = debug.console.info;
                        debug.error = debug.console.error;
                        debug.warn = debug.console.warn;
                        debug.logObj = function (obj) {
                            if (obj == null || typeof obj !== "object") {
                                debug.log(obj);
                            } else {
                                for (let i in obj) {
                                    if (typeof obj[i] == "function") {
                                        debug.log(i + ": function()");
                                    } else {
                                        debug.log(i + ": " + obj[i]);
                                    }
                                }
                            }
                        }
                    } else {
                        debug.log = function (s) {
                            console.log(s);
                        };
                        debug.info = function (s) {
                            console.info(s);
                        };
                        debug.warn = function (s) {
                            console.warn(s);
                        };
                        debug.error = function (s) {
                            console.error(s);
                        };
                        debug.logObj = function (s) {
                            console.log(s);
                        };
                    }
                } else {
                    debug.log = debug.info = debug.error = debug.warn = debug.logObj = function () { };
                }

                debug.enableLog = isEnabled;
            },

            console: console,
            version: this.clientVersion,
            useDevRemoteServerIp: this.useDevRemoteServerIp,
            useDevLocalServerIp: this.useDevLocalServerIp,

            promoInfo: {
                title: "时下热门",
                list: [
                    {
                        name: "我的射门会转弯",
                        localImg: "image/smallModule/promott/wdsm",
                        appid: "tt78b80e05e792be9d"
                    },
                    {
                        name: "弓箭手王者",
                        localImg: "image/smallModule/promott/gjswz",
                        appid: "tt6c451af8f36f596b"
                    },
                    {
                        name: "蚂蚁部落大作战",
                        localImg: "image/smallModule/promott/mybl",
                        appid: "tt2a405cfdb56a26a1"
                    },
                    {
                        name: "牛仔对决",
                        localImg: "image/smallModule/promott/nzdj",
                        appid: "tt515627ebce7c7b79"
                    },
                    {
                        name: "坦克兵团",
                        localImg: "image/smallModule/promott/tkbt",
                        appid: "tt8415f2a81b3fb5f2"
                    },
                    {
                        name: "消灭曹操",
                        localImg: "image/smallModule/promott/xmcc",
                        appid: "tt6d481bf5f2624129"
                    },
                    {
                        name: "玩转三明治",
                        localImg: "image/smallModule/promott/smz",
                        appid: "tt237055cdbc5ad129"
                    },

                    {
                        name: "超级守门员",
                        localImg: "image/smallModule/promott/cjsmy",
                        appid: "tt39254f98a60fd13b"
                    },
                    {
                        name: "别掉进岩浆",
                        localImg: "image/smallModule/promott/bdjyj",
                        appid: "tt43e43559dcce8145"
                    },

                ]
            },

            getPromoList: function () {
                let str = JSON.stringify(debug.promoInfo);
                let promoInfo = str ? JSON.parse(str) : null;
                if (promoInfo == null || promoInfo.list == null || promoInfo.list.length < 1) {
                    return;
                }

                return promoInfo.list;
            }
        };

        debug.testPlatform = this.testPlatform;
        debug.setEnableLog(this.enableLog);
        if (this.useDevFileDownloadRoot) {
            debug.pureFileDownloadRoot = this.devFileDownloadRoot;
        } else {
            debug.pureFileDownloadRoot = this.releaseFileDownloadRoot;
        }
    },

    setUrl() {
        if (WechatAPI.isWx) {
            debug.pureFileDownloadRoot += this.remoteFileUrlSuffix_wx;
        } else if (WechatAPI.isVivo) {
            debug.pureFileDownloadRoot += this.remoteFileUrlSuffix_vivo;
        } else if (WechatAPI.isOppo) {
            debug.pureFileDownloadRoot += this.remoteFileUrlSuffix_oppo;
        } else if (WechatAPI.isApp) {
            debug.pureFileDownloadRoot += this.remoteFileUrlSuffix_app;
        } else if (WechatAPI.isTT) {
            debug.pureFileDownloadRoot += this.remoteFileUrlSuffix_tt;
        }

        debug.pipDownloadUrl = debug.pureFileDownloadRoot + this.pipDownloadPath + this.clientVersion + ".txt";
        debug.purePipDownloadUrl = debug.pureFileDownloadRoot + this.pipDownloadPath + "txt";
        debug.promoDataDownloadUrl = debug.pureFileDownloadRoot + "/promoList.txt";
        //other config

        if (window.wxDownloader != null) {
            window.wxDownloader.REMOTE_SERVER_ROOT = debug.fileDownloadRoot;
        }

        debug.info("fileDownloadRoot: " + debug.fileDownloadRoot);
        debug.info("pipDownloadUrl: " + debug.pipDownloadUrl);
        debug.info("purePipDownloadUrl: " + debug.purePipDownloadUrl);
    }
});