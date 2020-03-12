let WindowManager = cc.Class({
    extends: cc.Component,

    properties: {
        mainWindowPath: "prefab/MainWindow",

        gameWindowPath: "prefab/GameWindow",

        loadingWindowPath: "prefabs/LoadingWindow",

        _windowPathSwitchingTo: "",

        _currentWindowPath: "",

        currentWindowNode: {
            type: cc.Node,
            default: null,
            visible: false,
        },

        windowContainer: cc.Node,

        windowPrefabs: {
            type: [cc.Prefab],
            default: [],
            visible: false,
        },
    },

    start: function () {
        this._windowPathSwitchingTo = "";
        this._currentWindowPath = "";
    },

    switchToGameWindow: function () {
        this.switchToWindow(this.gameWindowPath);
    },

    switchToMainWindow: function () {
        this.switchToWindow(this.mainWindowPath);
    },

    switchToLoadingWindow: function () {
        this.switchToWindow(this.loadingWindowPath);
    },


    switchToWindow: function (path) {
        if (this._windowPathSwitchingTo === path) {
            return;
        }

        if (this._windowPathSwitchingTo === "" && this._currentWindowPath === path) {
            //没有正在切换中的window，且要切换到的window就是当前window
            return;
        }

        this._windowPathSwitchingTo = path;
        let prefab = this.windowPrefabs[path];
        if (prefab != null && typeof prefab == "object") {
            this.switchWindow(prefab, path);
            //debug.log("direct switch");
        } else {
            //debug.log("undirect switch");
            appContext.getFileManager().loadResourceSafe(path, cc.Prefab, function (prefab) {
                if (prefab != null) {
                    this.windowPrefabs[path] = prefab;
                }
                this.switchWindow(prefab, path);
            }, this);
        }
    },

    switchWindow: function (prefab, path) {
        if (prefab == null) {
            debug.warn("switchToWindow prefab null");
        } else {
            if (path === this._windowPathSwitchingTo) {
                try {
                    this.onSceneLoaded(path, prefab);
                } catch (e) {
                    debug.log(e);
                }
            }
        }
    },

    onSceneLoaded: function (path, pPrefab) {
        if (path === this._windowPathSwitchingTo) {
            if (path !== this._currentWindowPath) {
                this._windowPathSwitchingTo = "";
                if (this.currentWindowNode && this.currentWindowNode.isValid) {
                    this.currentWindowNode.destroy();
                }
                let pWindow = cc.instantiate(pPrefab);
                pWindow.parent = this.windowContainer;

                this.currentWindowNode = pWindow;
                this._currentWindowPath = path;

                WechatAPI.GC();
            } else {
                debug.log("过程中已经切换到了目标场景，取消switchToWindow");
            }
        } else {
            debug.log("过程中又切换其他场景，取消switchToWindow");
        }
    },

    isInMainWindow: function () {
        return this._currentWindowPath === this.mainWindowPath;
    },

    isInLoadingWindow: function () {
        return this._currentWindowPath === this.loadingWindowPath;
    },

    isInGameWindow: function () {
        return this._currentWindowPath === this.gameWindowPath;
    },

    getCurrentWindowNode: function () {
        return this.currentWindowNode;
    },

    shakeWindow: function (force = 1) {
        this.windowContainer.stopAllActions();
        this.windowContainer.x = 0;
        this.windowContainer.y = 0;

        let shake01 = cc.moveBy(0.06, 0, 8 * force);
        let shake02 = cc.moveBy(0.06, 0, -16 * force);
        let shake03 = cc.moveBy(0.06, 0, 16 * force);

        let end = cc.callFunc(function () {
            this.windowContainer.x = 0;
            this.windowContainer.y = 0;
        }, this);

        let seqShake = cc.sequence(shake01, shake02, shake03, shake02, shake01, end);
        this.windowContainer.runAction(seqShake);
    },
});