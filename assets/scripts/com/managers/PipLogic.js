let StringUtil = require("StringUtil");
let LoginState = require("LoginState");

cc.Class({
    properties: {
        lm: {
            get: function () {
                return appContext.getLoginManager();
            }
        },

        pipIndex: 0,
    },

    ctor: function () {
        debug.log("pip logic ok");
        let pip1 = debug.pipDownloadUrl; //1 pip with ver
        let pip2 = debug.purePipDownloadUrl; //2 pip no ver

        this.pipList = [pip1, pip2];
        this.downloadPipFinishTags = new Array(this.pipList.length);
    },

    getPipUrl: function (index) {
        return this.pipList[index] + '?mcachenum=' + Date.parse(new Date());
    },

    startDownloadPip: function () {
        this.resetDownloadFinishTags();
        this.downloadPip(0);
    },

    next: function (index) {
        if (index >= this.pipList.length - 1) {
            this.exit();
        } else {
            this.downloadPip(index + 1);
        }
    },

    downloadPip: function (index) {
        if (!WechatAPI.isEnabled()) {
            this.exit();
            return;
        }

        if (WechatAPI.isYX) {
            //使用益欣sdk 则不适用自己的配置
            debug.extraSettings.global = false;
            this.exit();
            return;
        }

        let url = this.getPipUrl(index);
        debug.log("loadPip地址 " + url + " index " + index);
        if (url == null || url == "") {
            this.next(index);
            return;
        }


        this.addWaitingTask(index);

        let self = this;
        appContext.getFileManager().loadRemoteTxtFile(url,
            function (content) {
                self.setDownloadPipFinishTag(index, true);
                if (content == null) {
                    debug.log("loadPip content == null");
                    self.next(index);
                    return;
                }

                try {
                    self.usePip(content);
                    debug.log("usePip ok");
                } catch (e) {
                    debug.warn("usePip fail");
                    debug.logObj(e);
                    self.next(index);
                }
            });
    },

    usePip: function (content) {
        debug.logObj("content:" + content);
        let json = JSON.parse(content);
        console.log(json);
        if (json == null) {
            throw new Error();
        }

        let lm = this.lm;
        for (let i in json) {
            if (debug.extraSettings[i] != null) {
                debug.extraSettings[i] = json[i];
            }
        }

        if (debug.extraSettings.global) {
            debug.extraSettings.lr = 0;
            debug.extraSettings.fgSr = 0;
        }

        if (!WechatAPI.isWx) {
            debug.extraSettings.fgSr = 0;
        }

        let statisticUrl = json.statisticUrl;
        if (StringUtil.isNotEmpty(statisticUrl)) {
            appContext.getAnalyticManager().onEventUrl = statisticUrl;
        }

        try {
            this.downloadPromo();
            this.downloadCfg();
        } catch (e) {
            debug.warn("downloadPromo Cfg exception");
            debug.logObj(e);
        }

        this.exit();
    },

    downloadPromo: function () {
        //if (WechatAPI.systemInfo.platform !== 'ios') {
        //要测试ios是否支持 暂时对ios也采用这种方式


        //头条微信现在都不再下载推广配置，改为直接在代码中写
        if (WechatAPI.isTT) {
            debug.promoInfo = {
                title: "时下热门",
                list: [
                    {
                        name: "加了米海盗",
                        localImg: "image/smallModule/promott/jlm",
                        appid: "tt82ccf4711de6783c"
                    },
                    {
                        name: "枪王战僵尸",
                        localImg: "image/smallModule/promott/qwzjs",
                        appid: "ttd419a2a44b33fcbe"
                    },
                    {
                        name: "反恐枪神",
                        localImg: "image/smallModule/promott/fkqs",
                        appid: "tt525d24e0cd77896c"
                    },
                    {
                        name: "梦想商业街",
                        localImg: "image/smallModule/promott/mxsyj",
                        appid: "ttbfc2c97f20e86aad"
                    }, {
                        name: "我的射门会转弯",
                        localImg: "image/smallModule/promott/wdsm",
                        appid: "tt78b80e05e792be9d"
                    }, {
                        name: "玩转三明治",
                        localImg: "image/smallModule/promott/smz",
                        appid: "tt237055cdbc5ad129"
                    },
                    {
                        name: "种子吃吃吃",
                        localImg: "image/smallModule/promott/zzccc",
                        appid: "ttd275a4c84d5f18ee"
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
                    {
                        name: "你好抖腿兔",
                        localImg: "image/smallModule/promott/nhdtt",
                        appid: "ttd37da5c04c571966"
                    },
                ]
            };

            WechatAPI.setTTAppLaunchOptions();

        } else if (WechatAPI.isWx) {
            debug.promoInfo = {
                title: "时下热门",
                list: [{
                    name: "臭弟弟别走",
                    localImg: "image/smallModule/promo/cddbz",
                    appid: "wxb0123872d07a84d0",
                    navQuery: "?channel=wxd439a052b42ffd16&ald_media_id=28792&ald_link_key=3d2fa3e174945924&ald_position_id=0"
                },
                {
                    name: "我的射门会拐弯",
                    localImg: "image/smallModule/promo/wdsm",
                    appid: "wx32d4d6af5d05a64b",
                    navQuery: "?chid=18901&subchid=189zqt"
                },
                {
                    name: "超级飞侠乐迪加速",
                    localImg: "image/smallModule/promo/cjfx",
                    appid: "wx0114bf81a726711d",
                    navQuery: "?ald_media_id=21010&ald_link_key=1fd0881f9b556066&ald_position_id=0"
                },
                {
                    name: "迷宫旋转",
                    localImg: "image/smallModule/promo/mgxz",
                    appid: "wxacc2ba058b5f80d6",
                    navQuery: "?ald_media_id=18982&ald_link_key=9ffa92a9f38470fc&ald_position_id=0"
                },
                {
                    name: "步步揪心",
                    localImg: "image/smallModule/promo/bbjx",
                    appid: "wxc17e027e6191feec",
                    navQuery: "?ald_media_id=17182&ald_link_key=395e661a88211a30&ald_position_id=0"
                },
                {
                    name: "百战坦克",
                    localImg: "image/smallModule/promo/bztk",
                    appid: "wxa99b9205c6ba687e",
                    navQuery: "?ald_media_id=19865&ald_link_key=e94a9cb309ea1a66&ald_position_id=0"
                },
                {
                    name: "猪猪侠之极速狂飙",
                    localImg: "image/smallModule/promo/zzx",
                    appid: "wx8735f9b390c59cfd",
                    navQuery: "?ald_media_id=27969&ald_link_key=c5e54b687b2f9039&ald_position_id=0"
                },
                {
                    name: "一起搭车",
                    localImg: "image/smallModule/promo/yqdc",
                    appid: "wx457e584926d33da6",
                    navQuery: "?ald_media_id=14540&ald_link_key=deb2841171817d81&ald_position_id=0"
                },
                {
                    name: "极速自行车高手",
                    localImg: "image/smallModule/promo/jszxcgs",
                    appid: "wx3bccea145a3d578d",
                    navQuery: "?scene=18"
                },
                {
                    name: "暴走恐龙行动",
                    localImg: "image/smallModule/promo/bzkl",
                    appid: "wxa15dbd8df5c6128f",
                    navQuery: "?ald_media_id=28365&ald_link_key=ea3c338f24b537e0&ald_position_id=0"
                }
                ]
            };
        }

        return;

        debug.log("download promo " + debug.promoDataDownloadUrl);
        let lm = this.lm;

        let self = this;
        let promoPath;
        // promoPath = debug.promoDataDownloadUrl + '?mcachenum=' + Date.parse(new Date());
        promoPath = debug.promoDataDownloadUrl + '?mcachenum=' + Date.parse(new Date());
        appContext.getFileManager().loadRemoteTxtFile(promoPath,
            function (content) {
                if (content == null) {
                    debug.log("promo null");

                    //self.exit();
                    return;
                }

                try {
                    debug.log("download promo ok");

                    let json = JSON.parse(content);
                    debug.log(json);
                    if (json == null) {
                        debug.log("promo parse error");
                        //self.exit();
                        return;
                    }

                    debug.promoInfo = json;
                    if (WechatAPI.isTT) {
                        WechatAPI.setTTAppLaunchOptions();
                    }

                    //self.exit();
                } catch (e) {
                    debug.log("promo exception");
                    debug.log(e);
                    // self.exit();
                }
            },
        );
    },

    downloadCfg: function () {
        return;

        debug.log("download Cfg");
        let lm = this.lm;

        let self = this;
        // let mainConfig = debug.promoDataDownloadUrl + '?mcachenum=' + Date.parse(new Date());
        appContext.getFileManager().loadRemoteTxtFile(mainConfig,
            function (content) {
                if (content == null) {
                    debug.log("ConfigFiles null");

                    //self.exit();
                    return;
                }

                try {
                    debug.log("downloadCfg ok");

                    let json = JSON.parse(content);
                    console.log(json);
                    if (json == null) {
                        debug.log("ConfigFiles parse error");
                        //self.exit();
                        return;
                    }

                    debug.logObj(json);

                    debug.configExtension = extension;
                    debug.setConfigByRemoteConfig(json);

                    // self.exit();
                } catch (e) {
                    debug.log("ConfigFiles exception");
                    debug.log(e);

                    //self.exit();
                }
            },
        );
    },

    exit: function () {
        this.lm.switchToState(LoginState.WxWaitAuthorize);
    },

    addWaitingTask: function (index) {
        debug.log("添加1个waitingTask, index = " + index);

        let self = this;
        appContext.getTaskManager().addWaitingTask(10,
            function () {
                debug.log("index =  " + index + " 下载pip 超时")
                appContext.getDialogManager().hideWaitingCircle();
                self.next(index);
            },
            this,
            function () {
                if (self.isDownloadPipOrConfigFinish(index)) {
                    return true
                }

                return false;
            },
            this);
    },

    isDownloadPipOrConfigFinish: function (index) {

        return this.downloadPipFinishTags[index];
    },

    setDownloadPipFinishTag: function (index, isFinish) {
        this.downloadPipFinishTags[index] = isFinish;
    },

    resetDownloadFinishTags: function () {

        for (let i = 0; i < this.downloadPipFinishTags.length; i++) {
            this.downloadPipFinishTags[i] = false;
        }
    },
});