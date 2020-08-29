let StringUtil = require("StringUtil");
let LoginState = require("LoginState");
let prefix = "images/smallModule/promott/";

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
        this.downloadPromo();
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
        if (WechatAPI.isUC|| WechatAPI.isYY) {
            debug.log("isUC isYY");
            debug.extraSettings.global = false;
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
                    //self.downloadMisc();
                    debug.log("usePip ok");
                } catch (e) {
                    debug.warn("usePip fail");
                    debug.logObj(e);
                    self.next(index);
                }
            });
    },

    usePip: function (content) {
        console.log(content);
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

        let statisticUrl = json.statisticUrl;
        if (StringUtil.isNotEmpty(statisticUrl)) {
            appContext.getAnalyticManager().onEventUrl = statisticUrl;
        }

        this.exit();
    },

    downloadMisc() {
        try {
            this.downloadPromo();
            this.downloadCfg();
        } catch (e) {
            debug.warn("downloadPromo Cfg exception");
            debug.logObj(e);
        }
    },

    downloadPromo: function () {
        if (WechatAPI.isTT) {
            debug.promoInfo = {
                title: "时下热门",
                list: [
                    {
                        name: "超级好玩",
                        localImg: prefix + "ttae35d888311fdef4",
                        appid: "ttae35d888311fdef4"
                    },
                    {
                        name: "停不下来",
                        localImg: prefix + "tta58bd3363aa1cb7f",
                        appid: "tta58bd3363aa1cb7f"
                    },
                    {
                        name: "休闲益智",
                        localImg: prefix + "tt544422f9cb6e3a93",
                        appid: "tt544422f9cb6e3a93"
                    },
                    {
                        name: "她们在玩",
                        localImg: prefix + "tt17ef615288c57025",
                        appid: "tt17ef615288c57025"
                    },
                    {
                        name: "帅哥都玩",
                        localImg: prefix + "tt6d481bf5f2624129",
                        appid: "tt6d481bf5f2624129"
                    },
                ]
            };

            WechatAPI.setTTAppLaunchOptions();

        }
    },

    downloadCfg: function () {
        console.log("download Cfg");
        let lm = this.lm;

        let self = this;
        let mainConfig = debug.promoDataDownloadUrl + '?mcachenum=' + Date.parse(new Date());
        appContext.getFileManager().loadRemoteTxtFile(mainConfig,
            function (content) {
                if (content == null) {
                    debug.log("ConfigFiles null");

                    //self.exit();
                    return;
                }

                try {
                    debug.log("配置下载ok");

                    let json = JSON.parse(content);
                    console.log(json);
                    if (json == null) {
                        debug.log("ConfigFiles parse error");
                        //self.exit();
                        return;
                    }
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