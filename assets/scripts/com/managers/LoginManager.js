let LoginState = require("LoginState");
let SequenceStateMachine = require("SequenceStateMachine");
let PipLogic = require('PipLogic');
const WechatAPI = require("./WechatAPI");
// let StorageKey = require("StorageKey");
// let StringUtil = require("StringUtil");
// let DialogTypes = require("DialogTypes");
// let DataKey = require('DataKey');
// let AppState = require('AppState');

cc.Class({
    init: function () {
        debug.log("!lm init!");
        //单机游戏登录流程：
        //0 下载和使用pip 1 读取内部数据存储。 2 如果没有，要求点击授权按钮。 3 收到回调后记录用户数据
        this._stateMachine = new SequenceStateMachine(this, LoginState.Wait);
        this._stateMachine.registerState(LoginState.Wait, this.enterStateWait);
        this._stateMachine.registerState(LoginState.DownloadPip, this.enterStateDownloadPip);
        this._stateMachine.registerState(LoginState.WxWaitAuthorize, this.enterStateWxWaitAuthorize);
        this._stateMachine.registerState(LoginState.Finish, this.enterStateFinish);

        this._stateMachine.linkState(LoginState.Wait, [], true);
        this._stateMachine.linkState(LoginState.DownloadPip, [LoginState.Wait, LoginState.Finish]);
        this._stateMachine.linkState(LoginState.WxWaitAuthorize, [LoginState.Wait, LoginState.DownloadPip]);
        this._stateMachine.linkState(LoginState.Finish, [LoginState.WxWaitAuthorize]);

        this._stateMachine.setBackupState(LoginState.Wait);

        if (WechatAPI.systemInfo.windowWidth == null) {
            WechatAPI.setSystemInfo();
        }
        //初始化登录相关信息和配置 游戏启动后仅执行一次
        this.pipDownloadUrl = debug.pipDownloadUrl;
        this.purePipDownloadUrl = debug.purePipDownloadUrl;
        this.pipLogic = new PipLogic();
    },

    isInLoginProcess: function () {
        if (this._stateMachine == null) {
            return false;
        }

        let state = this._stateMachine.getState();
        return (
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
        WechatAPI.GC();
        // appContext.getNetworkManager().resetReconnectFailTimes();
        if (WechatAPI.isTT) {
            // tt.login({
            //     success(res) {
            //         console.log(`login调用成功${res.code} ${res.anonymousCode}`);
            //     },
            //     fail(res) {
            //         console.log(`login调用失败`);
            //     }
            // });
        }
        this.switchToState(LoginState.DownloadPip);
    },

    //////////////////////////////////////////////////////start enter state function//////////////////////////////////////////
    enterStateWait: function () {
        if (appContext.getWindowManager().isInLoadingWindow()) {
            let pWindow = appContext.getWindowManager().getCurrentWindowNode();
            if (pWindow != null) {
                let comp = pWindow.getComponent("LoadingWindow");
                if (comp != null) {
                    //comp.showCustomerServiceBtn();
                }
            }
        } else {
            debug.log("enterStateWait isInLoadingWindow==false");
        }
    },

    enterStateDownloadPip: function () {
        if(WechatAPI.isTT){
            this.pipLogic.startDownloadPip();
            debug.log("startDownloadPip");
        }
        // this.switchToState(LoginState.WxWaitAuthorize);
    },

    enterStateWxWaitAuthorize: function () {
        //创建授权窗口
        if (!WechatAPI.isEnabled()) {

        }

        //这个游戏现在改成了不需要授权的

        this.switchToState(LoginState.Finish);
        return;
        /*
                let self = this;
                debug.log("检测是否需要授权");
                WechatAPI.getWx().getSetting({
                    success(res) {
                        if (!res.authSetting['scope.userInfo']) {
                            self.authorize();
                        } else {
                            debug.log("不要授权");
                            self.switchToState(LoginState.Finish);
                        }
                    }
                });*/
    },
    /*
        authorize: function() {
            let self = this;
            if (typeof WechatAPI.getWx().createUserInfoButton === "function") {
                debug.log("创建授权窗口");
                debug.log(WechatAPI.systemInfo);
                if (self.userInfoButton == null) {
                    let baseHeight = 63.5;
                    let baseWidth = 180;
                    //let ratio = WechatAPI.deviceManager.getPixelRatio();
                    self.userInfoButton = wx.createUserInfoButton({
                        type: 'image',

                        //注意确保这个同名文件要在安装包内
                        image: 'customRes/button_auth.png',

                        style: {
                            left: WechatAPI.systemInfo.windowWidth * 0.5 - baseWidth * 0.5,
                            top: WechatAPI.systemInfo.windowHeight * 0.7 - baseHeight,
                            width: baseWidth,
                            height: baseHeight,
                        }
                    });

                    self.userInfoButton.onTap(function(res) {
                        if (res.errMsg == null) {
                            return;
                        }
                        if (res.errMsg.match(/ok/i) == null) {
                            return;
                        }

                        //self.hideAuthorizeClaim();
                        appContext.getUxManager().setUserInfo(res);
                        self.switchToState(LoginState.Finish);
                        self.userInfoButton.destroy();
                    });
                }
            } else {
                WechatAPI.getWx().getSetting({
                    success(res) {
                        if (res == null || res.authSetting == null || res.authSetting['scope.userInfo'] == null) {
                            //没有授权，能显示授权弹窗

                            WechatAPI.getWx().authorize({
                                scope: 'scope.userInfo',

                                success: function(res) {
                                    debug.log(res);
                                    self.hideAuthorizeClaim();
                                    self.switchToState(LoginState.Finish);
                                },
                            })

                        } else if (res.authSetting['scope.userInfo'] === true) {
                            //已经授权，按理说不可能有这种情况
                            self.hideAuthorizeClaim();
                            self.switchToState(LoginState.Finish);
                        } else {
                            //拒绝过授权，不能再显示授权弹窗，必须用授权设置
                            WechatAPI.getWx().openSetting({
                                success: function(res) {
                                    if (res.authSetting['scope.userInfo'] === true) {
                                        //self.hideAuthorizeClaim();
                                        self.switchToState(LoginState.Finish);
                                    }
                                },
                            })
                        }
                    },
                })
            }
        },
    */
    enterStateFinish: function () {
        if (this.userInfoButton) {
            this.userInfoButton.destroy();
        }
        debug.log("onLoginFinish");
        appContext.getUxManager().onLoginFinish();
        appContext.getAppController().startListenWxOnShowParam(); //允许AppController自刷新启动参数
    },
});