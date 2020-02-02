
let MessageRouter = require("MessageRouter");
let DataRepository = require("DataRepository");
let RemoteAPI = require("RemoteAPI");
let LoginManager = require("LoginManager");
let TaskManager = require("TaskManager");
let FileManager = require("FileManager");
let GameSettingManager = require("GameSettingManager");
let UserExperienceManager = require("UserExperienceManager");
let WechatAPI = require("WechatAPI");

//一个拥有单例模式的AppContext，可以从中获取各种需要的实例
cc.Class({
    extends: cc.Component,

    properties: {
        gameManager: {
            default: null,
            type: require("GameManager"),
        },

        windowManager: {
            default: null,
            type: require("WindowManager"),
        },

        dialogManager: {
            default: null,
            type: require("DialogManager"),
        },

        soundManager: {
            default: null,
            type: require("SoundManager"),
        },

        appController: {
            default: null,
            type: require("AppController"),
        },

        statisticsManager: {
            default: null,
            type: require("StatisticsManager"),
        },

        cfg: {
            default: null,
            type: require("GameConfig"),
        },
    },

    start: function () {
        window.WechatAPI = WechatAPI;
        window.appContext = this;

        //初始化实例，注意顺序
        //程序配置
        this.cfg.init();
        // try {
        //     WechatAPI.init();
        // } catch (e) {
        //     debug.log(e);
        // }
        WechatAPI.init();
        this.cfg.setUrl();

        //数据仓库
        if (this._dataRepository == null) {
            this._dataRepository = new DataRepository();
        }

        //负责接收消息，并且将消息分发给Handler处理
        if (this._messageRouter == null) {
            this._messageRouter = new MessageRouter();
        }

        //负责对外发送消息
        if (this._remoteAPI == null) {
            this._remoteAPI = new RemoteAPI();
        }

        //负责延时任务
        if (this._taskManager == null) {
            this._taskManager = new TaskManager();
        }

        //负责登录微信小游戏和登录游戏服务器
        if (this._loginManager == null) {
            this._loginManager = new LoginManager();
            this._loginManager.init();
        }

        //负责文件下载缓存等
        if (this._fileManager == null) {
            this._fileManager = new FileManager();
        }

        //游戏设置保存区
        if (this._gameSettingManager == null) {
            this._gameSettingManager = new GameSettingManager();
        }

        //用户体验
        if (this._uxManager == null) {
            this._uxManager = new UserExperienceManager();
        }


        if (WechatAPI.isEnabled()) {
            // if (WechatAPI.isWx) {
            //     this.getAnalyticManager().enableALD = true;
            //     this.getAnalyticManager().aldTag = "WX_";
            // }
        } else {
            //cc.director.setDisplayStats(false); //去掉网页上的性能面板 
        }

        //appContext.webService = WechatAPI.webService;
        this.appController.startListenWxOnShowEarlyParam();

        //切换到首场景
        this.scheduleOnce(function () {
            let lm = appContext.getLoginManager();
            if (!lm.isInLoginProcess()) {
                this.getAnalyticManager().addEvent("login");
                this.getLoginManager().login();
            }
            this.getRemoteAPI().loadFakePlayerInfo();
            this.windowManager.switchToMainWindow();
        }, 0);
    },

    update: function (dt) {
        //对没有必要继承cc.Component的实例调用onUpdate方法
        this._taskManager.onUpdate(dt);
        this._uxManager.onUpdate(dt);
    },

    lateUpdate: function (dt) {
        this._messageRouter.onLateUpdate(dt);
    },

    getLoginManager: function () {
        return this._loginManager;
    },

    getWindowManager: function () {
        return this.windowManager;
    },

    getMessageRouter: function () {
        return this._messageRouter;
    },

    getDataRepository: function () {
        return this._dataRepository;
    },

    getDialogManager: function () {
        return this.dialogManager;
    },

    getRemoteAPI: function () {
        return this._remoteAPI;
    },

    getAnalyticManager: function () {
        return this.statisticsManager;
    },

    getSoundManager: function () {
        return this.soundManager;
    },

    getTaskManager: function () {
        return this._taskManager;
    },

    getAppController: function () {
        return this.appController;
    },

    getFileManager: function () {
        return this._fileManager;
    },

    getGameSettingManager: function () {
        return this._gameSettingManager;
    },

    getUxManager: function () {
        return this._uxManager;
    },

    getGameManager: function () {
        return this.gameManager;
    },

    dynamicRequire: function (s) {
        let res = null;

        try {
            res = require(s);
        } catch (e) {
            debug.warn(e);
        }

        return res;
    },
});