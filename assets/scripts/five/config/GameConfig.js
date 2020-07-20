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

        devFileDownloadRoot: 'https://devfile.ttigd.cn',

        releaseFileDownloadRoot: 'https://wxfile.ttigd.cn',

        testPlatform: "",

        appId: "wxd439a052b42ffd16", //wx wxd439a052b42ffd16, oppo, vivo etc in their ad Util

        platformOppo: false,

        platformVivo: false,

        platformApp: false,

        platformToutiao: false,

        platformBaidu: false,

        platformUC: false,

        platformMZ: false,

        remoteFileUrlSuffix_wx: "/wx",

        remoteFileUrlSuffix_vivo: "/vivo",

        remoteFileUrlSuffix_oppo: "/oppo",

        remoteFileUrlSuffix_app: "/app",

        remoteFileUrlSuffix_tt: "/tt",

        remoteFileUrlSuffix_baidu: "/bd",

        remoteFileUrlSuffix_uc: "/uc",

        remoteFileUrlSuffix_mz: "/mz",
    },

    init: function () {
        let debug = window.debug = debug = {
            appId: this.appId,
            platformOppo: this.platformOppo,
            platformVivo: this.platformVivo,
            platformApp: this.platformApp,
            platformToutiao: this.platformToutiao,
            platformBaidu: this.platformBaidu,
            platformUC: this.platformUC,
            platformMZ: this.platformMZ,
            
            extraSettings: {
                fg: true,
                fgCount: 5, //free gift count
                fgSr: 0, //share rate, 0 is always ad, 100 is always share
                fgRate: 25, //percentage chance to show fg(weapon)
                lr: 0, //lureRate
                nobanner: false,
                protectionLevelLow: 2,
                protectionLevelHigh: 4,
                lureChestLevelTrigger1: 2,
                lureChestLevelTrigger2: 4,
                hideInvite: false,
                checkinMustAd: false,
                wxBannerInterval: 30,
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
        } else if (WechatAPI.isMZ) {
            debug.pureFileDownloadRoot += this.remoteFileUrlSuffix_mz;
        } else if (WechatAPI.isApp) {
            debug.pureFileDownloadRoot += this.remoteFileUrlSuffix_app;
        } else if (WechatAPI.isTT) {
            debug.pureFileDownloadRoot += this.remoteFileUrlSuffix_tt;
        } else if (WechatAPI.isBaidu) {
            debug.pureFileDownloadRoot += this.remoteFileUrlSuffix_baidu;
        } else if (WechatAPI.isUC) {
            debug.pureFileDownloadRoot += this.remoteFileUrlSuffix_uc;
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