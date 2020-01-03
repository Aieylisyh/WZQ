let LoginState = require("LoginState");
let StorageKey = require("StorageKey");
let StringUtil = require("StringUtil");
let SequenceStateMachine = require("SequenceStateMachine");
let DialogTypes = require("DialogTypes");
let GameUtil = require("GameUtil");

cc.Class({
    init: function () {
        //注册所有的状态和切换
        //登录使用状态机，但分为3大步
        //1 下载配置 2 授权获取用户信息 3 连接服务器。
        //大步里面有小步，小步不影响大步

        this._stateMachine = new SequenceStateMachine(this, LoginState.Null);
        this._stateMachine.registerState(LoginState.Null);
        this._stateMachine.registerState(LoginState.Wait, this.enterStateWait);
        this._stateMachine.registerState(LoginState.WxCheckSession, this.enterStateWxCheckSession);
        this._stateMachine.registerState(LoginState.WxLogin, this.enterStateWxLogin);
        this._stateMachine.registerState(LoginState.WxGetUserInfo, this.enterStateWxGetUserInfo);
        this._stateMachine.registerState(LoginState.DownloadPip, this.enterStateDownloadPip);
        this._stateMachine.registerState(LoginState.DownloadDefaultPip, this.enterStateDownloadDefaultPip);
        this._stateMachine.registerState(LoginState.ConnectWxPServer, this.enterStateConnectWxPServer);
        this._stateMachine.registerState(LoginState.GotWxPloginResult, this.enterStateGetWxPloginResult);
        this._stateMachine.registerState(LoginState.ConnectWxHServer, this.enterStateConnectWxHServer);
        this._stateMachine.registerState(LoginState.GotWxHloginResult, this.enterStateGotWxHloginResult);
        this._stateMachine.registerState(LoginState.WxGetSetting, this.enterStateWxGetSetting);
        this._stateMachine.registerState(LoginState.WxWaitAuthorize, this.enterStateWxWaitAuthorize);
        this._stateMachine.registerState(LoginState.Finish, this.enterStateFinish);

        this._stateMachine.linkState(LoginState.Null, []);
        this._stateMachine.linkState(LoginState.Wait, [], true);

        this._stateMachine.linkState(LoginState.DownloadPip, [LoginState.Wait, LoginState.Finish, LoginState.Null]);
        this._stateMachine.linkState(LoginState.DownloadDefaultPip, [LoginState.DownloadPip]);

        this._stateMachine.linkState(LoginState.WxCheckSession, [LoginState.Wait, LoginState.DownloadDefaultPip, LoginState.DownloadPip]);
        this._stateMachine.linkState(LoginState.WxLogin, [LoginState.WxCheckSession]);
        this._stateMachine.linkState(LoginState.WxGetSetting, [LoginState.WxLogin, LoginState.WxWaitAuthorize]);
        this._stateMachine.linkState(LoginState.WxWaitAuthorize, [LoginState.WxGetSetting]);
        this._stateMachine.linkState(LoginState.WxGetUserInfo, [LoginState.WxGetSetting, LoginState.WxWaitAuthorize]);

        this._stateMachine.linkState(LoginState.ConnectWxPServer, [LoginState.WxGetUserInfo, LoginState.WxGetSetting, LoginState.DownloadPip]);
        this._stateMachine.linkState(LoginState.GotWxPloginResult, [LoginState.ConnectWxPServer, LoginState.Wait, LoginState.Finish]);
        this._stateMachine.linkState(LoginState.ConnectWxHServer, [LoginState.GotWxPloginResult, LoginState.WxCheckSession]);
        this._stateMachine.linkState(LoginState.GotWxHloginResult, [LoginState.ConnectWxHServer, LoginState.Wait, LoginState.Finish]);

        this._stateMachine.linkState(LoginState.Finish, [LoginState.GotWxHloginResult]);

        this._stateMachine.setBackupState(LoginState.Wait);

        if (WechatAPI.systemInfo.windowWidth == null) {
            WechatAPI.setSystemInfo();
        }

        //初始化登录相关信息和配置 游戏启动后仅执行一次
        this.clearLoginCache();
        this.wxPServerUrl = debug.wxPServerUrl;
        this.wxHServerUrl = debug.wxHServerUrl;
        this.wxInviteUrl = debug.wxInviteUrl;
        this.enterpriseUrl = debug.enterpriseUrl;
        this.billboardUrl = debug.billboardUrl;
        this.wxRoomScoreRankUrl = debug.wxRoomScoreRankUrl;
        this.pipDownloadUrl = debug.pipDownloadUrl;
        this.purePipDownloadUrl = debug.purePipDownloadUrl;
    },

    isInLoginProcess: function () {
        if (this._stateMachine == null) {
            return false;
        }

        let state = this._stateMachine.getState();
        return (state != LoginState.Null &&
            state != LoginState.Wait &&
            state != LoginState.Finish
        );
    },

    switchToState: function (state) {
        //对外暴露的转变状态的方法，可以传递最多6个额外参数
        if (!this._stateMachine) {
            return;
        }

        this._stateMachine.switchToState(state, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
    },

    login: function () {
        debug.log("开始登录");
        this.hasLogin = true;
        if (WechatAPI.isEnabled()) {
            wx.triggerGC();
        }

        this.switchToState(LoginState.DownloadPip);
    },

    getPipUrl: function (isDefault = false) {
        return (isDefault ? this.purePipDownloadUrl : this.pipDownloadUrl) + '?mcachenum=' + Date.parse(new Date());
    },

    loadAndUsePip(path) {
        debug.log("loadAndUsePip " + path);
        let self = this;
        try {
            cc.loader.load(path, function (err, content) {
                if (content != null) {
                    try {
                        let json = JSON.parse(content);
                        if (json == null || !json.url) {
                            throw new Error();
                        }

                        debug.log("pip");
                        debug.log(json);

                        let pipApiUrl = json.pipApiUrl;
                        if (StringUtil.isNotEmpty(pipApiUrl)) {
                            debug.wxInviteUrl = pipApiUrl;
                            self.wxInviteUrl = pipApiUrl;
                        }

                        let pipWxScoreUrl = json.pipWxScoreUrl;
                        if (StringUtil.isNotEmpty(pipWxScoreUrl)) {
                            debug.wxRoomScoreRankUrl = pipWxScoreUrl;
                            self.wxRoomScoreRankUrl = pipWxScoreUrl;
                        }

                        let pipWxPServerUrl = json.url;
                        if (StringUtil.isNotEmpty(pipWxPServerUrl)) {
                            debug.pipWxPServerUrl = pipWxPServerUrl;
                            self.pipWxPServerUrl = pipWxPServerUrl;
                        }

                        let forceUpdate = json.forceUpdate;
                        WechatAPI.forceUpdate(forceUpdate);

                        self.downloadConfigFiles(json.extraSettings);
                    } catch (e) {
                        debug.log(e);
                        self.switchToState(LoginState.DownloadDefaultPip);
                    }
                } else {
                    debug.log("loadAndUsePip content == null");
                    self.switchToState(LoginState.DownloadDefaultPip);
                }
            });
        } catch (e) {
            debug.log(e);
            self.switchToState(LoginState.DownloadDefaultPip);
        }
    },

    loadAndUseDefaultPip(path) {
        debug.log("loadAndUseDefaultPip " + path);
        let self = this;

        try {
            cc.loader.load(path, function (err, content) {
                if (content != null) {
                    try {
                        let json = JSON.parse(content);
                        if (json == null || !json.url) {
                            throw new Error();
                        }

                        debug.log("DefaultPip");
                        debug.log(json);

                        let pipApiUrl = json.pipApiUrl;
                        if (StringUtil.isNotEmpty(pipApiUrl)) {
                            debug.wxInviteUrl = pipApiUrl;
                            self.wxInviteUrl = pipApiUrl;
                        }

                        let pipWxPServerUrl = json.url;
                        if (StringUtil.isNotEmpty(pipWxPServerUrl)) {
                            debug.pipWxPServerUrl = pipWxPServerUrl;
                            self.pipWxPServerUrl = pipWxPServerUrl;
                        }

                        let lastestVersion = json.lastestVersion;
                        WechatAPI.dealVersion(lastestVersion, debug.version);

                        self.downloadConfigFiles(json.extraSettings);
                    } catch (e) {
                        debug.log(e);
                        debug.warn("pipWxPServerUrl fail");
                        self.switchToState(LoginState.WxCheckSession);
                    }
                } else {
                    debug.warn("load pip 失败");
                    self.switchToState(LoginState.WxCheckSession);
                }
            });
        } catch (e) {
            debug.log(e);
            debug.warn("load pipWxPServerUrl fail");
            self.switchToState(LoginState.WxCheckSession);
        }
    },

    downloadConfigFiles: function (extension = "") {
        if (debug.extraSettings.hasRemoteConfig === true) {
            this.switchToState(LoginState.WxCheckSession);
            return;
        }

        let url = debug.pureFileDownloadRoot + '/misc/config' + extension + '.txt?mcachenum=' + Date.parse(new Date());

        let self = this;
        appContext.getFileManager().downloadFile(url, function (path) {
            if (path) {
                try {
                    cc.loader.load(path, function (err, content) {
                        if (content != null) {
                            try {
                                let json = JSON.parse(content);
                                if (json == null) {
                                    return;
                                }
                                debug.log("downloadConfigFiles");
                                debug.log(json);
                                debug.extraSettings = json;
                                debug.extraSettings.hasRemoteConfig = true;
                                self.switchToState(LoginState.WxCheckSession);
                            } catch (e) {
                                debug.log(e);
                                self.switchToState(LoginState.WxCheckSession);
                            }
                        } else {
                            self.switchToState(LoginState.WxCheckSession);
                        }
                    });
                } catch (e) {
                    debug.log(e);
                    self.switchToState(LoginState.WxCheckSession);
                }
            } else {
                self.switchToState(LoginState.WxCheckSession);
            }
        }, this);
    },


    clearLoginStorageAndCache: function () {
        // 不清除本地缓存的username(防止在登录界面的客服面板copy空的username)，每次登陆都会重新覆盖username 
        // WechatAPI.removeStorageSync(StorageKey.Username);
        this.clearLoginCache();
    },

    clearLoginCache: function () {
        WechatAPI.loginInfo = {};
    },

    showRelaunchDialog: function () {
        let info = {
            content: "登录时出了点问题\n如网络环境不好，请待网络正常后重试\n如网络环境良好，请关闭游戏后再打开",
            btn1: {
                name: "关闭游戏",
                clickFunction: function () {
                    wx.exitMiniProgram();
                },
                isRed: true,
            },
            btn2: {
                name: "稍后重试",
                isRed: false,
            },
        };
        appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, info);
    },

    onClickAuthorizeClaim: function () {
        debug.log("onClickAuthorizeClaim");
        //以下所有失败都不需要处理，因为什么也不用做！

        let self = this;
        WechatAPI.getWx().getSetting({
            success(res) {
                if (res == null || res.authSetting == null || res.authSetting['scope.userInfo'] == null) {
                    //没有授权，能显示授权弹窗

                    WechatAPI.getWx().authorize({
                        scope: 'scope.userInfo',

                        success: function (res) {
                            debug.log(res);
                            self.hideAuthorizeClaim();
                            self.switchToState(LoginState.WxGetUserInfo);
                        },
                    })

                } else if (res.authSetting['scope.userInfo'] === true) {
                    //已经授权，按理说不可能有这种情况
                    self.hideAuthorizeClaim();
                    self.switchToState(LoginState.WxGetUserInfo);
                } else {
                    //拒绝过授权，不能再显示授权弹窗，必须用授权设置
                    WechatAPI.getWx().openSetting({
                        success: function (res) {
                            if (res.authSetting['scope.userInfo'] === true) {
                                self.hideAuthorizeClaim();
                                self.switchToState(LoginState.WxGetUserInfo);
                            }
                        },
                    })
                }
            },
        })
    },

    //到这一步，就应该确保已经授权了
    hideAuthorizeClaim: function () {
        let ag = appContext.getDialogManager().getCachedDialog(DialogTypes.AuthorizeGetAward);
        if (ag != null && typeof ag.hide === "function") {
            ag.hide();
        }
    },

    createAuthorizeButtonIfNeed: function () {
        let canUseAuthorizeBtn = typeof WechatAPI.getWx().createUserInfoButton === "function";//是否可用微信授权按钮

        if (canUseAuthorizeBtn) {
            //在诱导授权奖励窗口的“授权领取”按钮上覆盖微信授权按钮
            let self = this;
            if (self.userInfoButton == null) {
                let baseHeight = WechatAPI.systemInfo.windowHeight * 0.35;
                let baseWidth = WechatAPI.systemInfo.windowWidth * 0.4;

                self.userInfoButton = wx.createUserInfoButton({
                    type: 'image',

                    //注意确保这个同名文件要在安装包内
                    image: 'customRes/transparent.png',

                    style: {
                        left: WechatAPI.systemInfo.windowWidth * 0.5 - baseWidth * 0.5,
                        top: WechatAPI.systemInfo.windowHeight - baseHeight,
                        width: baseWidth,
                        height: baseHeight,
                    }
                });

                WechatAPI.loginInfo.usedUserInfoButton = false;
                self.userInfoButton.onTap(function (res) {
                    debug.log(res);
                    if (res.errMsg == null) {
                        return;
                    }
                    if (res.errMsg.match(/ok/i) == null) {
                        return;
                    }

                    self.hideAuthorizeClaim();
                    WechatAPI.loginInfo.encryptedData = res.encryptedData;
                    WechatAPI.loginInfo.signature = res.signature;
                    WechatAPI.loginInfo.iv = res.iv;
                    WechatAPI.loginInfo.userInfo = res.userInfo;
                    WechatAPI.loginInfo.usedUserInfoButton = true;

                    // debug.log("授权按钮搞到的信息 ");
                    // debug.log(WechatAPI.loginInfo);
                    self.switchToState(LoginState.WxGetSetting);
                    self.userInfoButton.destroy();
                });
            }
        }
    },

    startAuthorizeClaim: function () {
        let info = {
            desc: "恭喜您！本月活动期间\n新用户可获得[萌新大礼包]",
            hasAnim: true,
            isChest: true,
            autoOpen: true,
            thirdPartyResourceList: [],
            currencyList: [],
            hardList: [
                { title: "发型2件", img: "localRes/currency/hair_m" },
                { title: "时装2套", img: "localRes/currency/dress_m" },
                { title: "1000个", img: "localRes/currency/egg_m" },
            ],
            throwList: [
                { img: "localRes/currency/alive_m", count: 1 },
                { img: "localRes/currency/decor_m", count: 2 },
                { img: "localRes/currency/kick_m", count: 3 },
                { img: "localRes/currency/lottery_m", count: 1 },
                { img: "localRes/currency/luck_m", count: 1 },
                { img: "localRes/currency/race_m", count: 1 },
                { img: "localRes/currency/recorder_m", count: 1 },
                { img: "localRes/currency/yinpiao_m", count: 1 },
                { img: "localRes/currency/mission_pack", count: 2 },
                { img: "localRes/currency/egg_m", count: 2 },
                { img: "localRes/currency/hongbao_m", count: 3 },
                { img: "localRes/currency/hair_m", count: 2 },
                { img: "localRes/currency/dress_m", count: 2 },
            ],
            isAuthorizeClaim: true,
        };

        let title = debug.extraSettings.hideRedPacket ? "礼包1个" : "红包1元";
        info.hardList.push({ title: title, img: "localRes/currency/hongbao_m" });

        if (debug.extraSettings.authorizeClaimMode == 1) {
            info.isChest = false;
        } else if (debug.extraSettings.authorizeClaimMode == 3) {
            info.autoOpen = false;
        }

        appContext.getDialogManager().showDialog(DialogTypes.AuthorizeGetAward, info);
    },
    //////////////////////////////////////////////////////start enter state function//////////////////////////////////////////
    enterStateWait: function () {
        if (appContext.getWindowManager().isInLoadingWindow()) {
            let pWindow = appContext.getWindowManager().getCurrentWindowNode();
            if (pWindow != null) {
                let comp = pWindow.getComponent("LoadingWindow");
                if (comp != null) {
                    comp.showBtnWechatLogin();
                    comp.showCustomerServiceBtn();
                }
            }
        } else {
            debug.log("enterStateWait isInLoadingWindow==false");
        }
    },

    enterStateDownloadPip: function () {
        let url = this.getPipUrl();
        if (url == null || url == "") {
            this.switchToState(LoginState.DownloadDefaultPip);
            return;
        }

        appContext.getFileManager().downloadFile(url, function (path) {
            if (path) {
                this.loadAndUsePip(path);
            } else {
                debug.warn("Pip下载失败 " + url);
                this.switchToState(LoginState.DownloadDefaultPip);
            }
        }, this);

        this._stateMachine.addWaitingTask(LoginState.DownloadPip, function () {
            this.switchToState(LoginState.Wait);
        }, this);
    },

    enterStateDownloadDefaultPip: function () {
        let url = this.getPipUrl(true);
        if (url == null || url == "") {
            debug.warn("DefaultPip地址错误");
            this.switchToState(LoginState.WxCheckSession);
            return;
        }

        appContext.getFileManager().downloadFile(url, function (path) {
            if (path) {
                this.loadAndUseDefaultPip(path);
            } else {
                debug.warn("DefaultPip下载失败 " + url);
                this.switchToState(LoginState.WxCheckSession);
            }
        }, this);

        this._stateMachine.addWaitingTask(LoginState.DownloadDefaultPip, function () {
            this.switchToState(LoginState.Wait);
        }, this);
    },

    enterStateWxCheckSession: function () {
        if (WechatAPI.isEnabled()) {
            let self = this;

            WechatAPI.getWx().checkSession({
                success: function (res) {
                    console.log("session未过期，并且在本生命周期一直有效");
                    let storageUsername = null;
                    //let storageUsername = WechatAPI.getWx().getStorageSync(StorageKey.Username);
                    if (false && StringUtil.isMeaningfulString(storageUsername)) {
                        // 不是用快捷登录，需要重新写逻辑
                        // console.log("Got username from storage:" + storageUsername);
                        // WechatAPI.loginInfo.username = storageUsername;
                        // WechatAPI.loginInfo.sessionValid = true;
                        // self.switchToState(LoginState.ConnectWxPServer);
                    } else {
                        console.log("No username from storage");
                        self.switchToState(LoginState.WxLogin);
                    }
                },

                fail: function (res) {
                    debug.log(res);
                    console.log("session过期");
                    self.switchToState(LoginState.WxLogin);
                }
            })

            this._stateMachine.addWaitingTask(LoginState.WxCheckSession, function () {
                this.switchToState(LoginState.Wait);
                appContext.getAnalyticManager().addEvent("bug__NoCallbackCheckSession");
                appContext.getAnalyticManager().accelerateUpload();

                this.showRelaunchDialog();
            }, this, 15);
        } else {
            this.switchToState(LoginState.Wait);
        }
    },

    enterStateWxLogin: function () {
        this.clearLoginStorageAndCache();

        this._stateMachine.addWaitingTask(LoginState.WxLogin, function () {
            this.switchToState(LoginState.Wait);
            appContext.getAnalyticManager().addEvent("bug__NoCallbackWxLogin");
            appContext.getAnalyticManager().accelerateUpload();

            this.showRelaunchDialog();
        }, this);

        let self = this;
        wx.login({
            success: function (res) {
                WechatAPI.loginInfo.code = res.code;
                if (StringUtil.isNotEmpty(WechatAPI.loginInfo.code)) {
                    debug.warn("WxLogin Suc");
                    self.switchToState(LoginState.WxGetSetting);
                } else {
                    debug.warn("WxLogin fail");
                    self.switchToState(LoginState.Wait);
                }
            },

            fail: function (res) {
                self.switchToState(LoginState.Wait);
            },
        });
    },

    enterStateWxGetSetting: function () {
        let self = this;
        if (!WechatAPI.isEnabled()) {
            this.switchToState(LoginState.Wait);
            return;
        }

        this._stateMachine.addWaitingTask(LoginState.WxGetSetting, function () {
            this.switchToState(LoginState.Wait);
        }, this);

        if (WechatAPI.loginInfo.usedUserInfoButton === true) {
            debug.info("刚刚使用过用户信息按钮，当前的登录信息: ");
            debug.info(WechatAPI.loginInfo);
            WechatAPI.loginInfo.usedUserInfoButton = false;
            self.switchToState(LoginState.ConnectWxPServer);
            return;
        }

        WechatAPI.getWx().getSetting({
            success(res) {
                if (res == null || res.authSetting == null || !res.authSetting['scope.userInfo']) {
                    self.switchToState(LoginState.WxWaitAuthorize);
                } else {
                    self.switchToState(LoginState.WxGetUserInfo);
                }
            },

            fail: function () {
                self.switchToState(LoginState.Wait);
            },
        })
    },

    enterStateWxWaitAuthorize: function () {
        //创建诱导授权奖励窗口
        this.startAuthorizeClaim();
    },

    enterStateWxGetUserInfo: function () {
        let self = this;
        this._stateMachine.addWaitingTask(LoginState.WxGetUserInfo, function () {
            appContext.getAnalyticManager().addEvent("bug__NoCallbackGetUserInfo");
            appContext.getAnalyticManager().accelerateUpload();
            this.switchToState(LoginState.Wait);
        }, this);

        if (!WechatAPI.isEnabled()) {
            this.switchToState(LoginState.Wait);
            return;
        }

        WechatAPI.getWx().getUserInfo({
            withCredentials: true,

            success: function (res) {
                WechatAPI.loginInfo.usedUserInfoButton = false;
                WechatAPI.loginInfo.encryptedData = res.encryptedData;
                WechatAPI.loginInfo.signature = res.signature;
                WechatAPI.loginInfo.iv = res.iv;
                WechatAPI.loginInfo.userInfo = res.userInfo;
                debug.info("当前的登录信息: ");
                debug.info(WechatAPI.loginInfo);

                self.switchToState(LoginState.ConnectWxPServer);
            },

            fail: function () {
                self.clearLoginStorageAndCache();
                appContext.getAnalyticManager().addEvent("bug__FailGetUserInfo");
                self.switchToState(LoginState.Wait);
                self.hideAuthorizeClaim();
            },
        });
    },

    enterStateGetWxPloginResult: function (suc, username, token, url, code) {
        debug.log("onPLoginResult suc " + username + " username:" + username + " token:" + token + " url:" + url);
        if (username != null && username != "") {
            WechatAPI.loginInfo.username = username;
            WechatAPI.setStorage(StorageKey.Username, username);
        }

        if (token != null && token != "") {
            WechatAPI.loginInfo.token = token;
        }

        this.wxHServerUrl = url;
        this.switchToState(LoginState.ConnectWxHServer, url);

        this._stateMachine.addWaitingTask(LoginState.GotWxPloginResult, function () {
            this.switchToState(LoginState.Wait);
        }, this);
    },

    enterStateGotWxHloginResult: function (success, code) {
        this.switchToState(LoginState.Finish);

        this._stateMachine.addWaitingTask(LoginState.GotWxHloginResult, function () {
            this.switchToState(LoginState.Wait);
        }, this);
    },

    enterStateFinish: function () {
        //TODO 分服连接其他服务器？     
        GameUtil.setUX();
        GameUtil.getLatestNotice(); // 拉取最新公告
        appContext.getAppController().startListenWxOnShowParam(); //允许AppController自刷新启动参数
    },
    //////////////////////////////////////////////////////fin enter state function//////////////////////////////////////////
});