//和掼蛋相比，toast也是dialog 
let DialogTypes = require("DialogTypes");

cc.Class({
    extends: cc.Component,

    properties: {
        dialogParent: {
            default: null,
            type: cc.Node,
        },

        _cachedDialogs: [],

        queuedDialogs: [],

        waitingCircle: {
            type: require("WaitingCircle"),
            default: null,
        },

        rootDialogPrefabPath: "prefabs/dialogs/",

        gameSettingDialogPrefabPath: "",

        matchDialogPrefabPath: "",

        rankDialogPrefabPath: "",

        roundEndDialogPrefabPath: "",

        playerInfoDialogPrefabPath: "",

        gradeInfoDialogPrefabPath: "",

        toastPrefabPath: "",

        confirmBoxPrefabPath: "",
    },

    onDialogHide: function(type) {
        this._cachedDialogs[type] = null;
    },

    getQueuedDialogsCount: function() {
        if (this.queuedDialogs == null) {
            return 0;
        }

        let count = 0;
        for (let i in this.queuedDialogs) {
            if (this.queuedDialogs[i]) {
                count++
            }
        }

        return count;
    },

    fireQueuedDialogs: function() {
        if (this.queuedDialogs == null) {
            return;
        }

        let obj = this.queuedDialogs.shift();
        if (obj == null) {
            if (this.areAllDialogsClosed()) {
                this.onCloseAllDialogs();
            }

            return;
        }

        this.showDialog(obj.type, obj.info);
        return;
    },

    areAllDialogsClosed: function() {
        let count = 0;
        for (let i in this._cachedDialogs) {
            if (this._cachedDialogs[i] != null) {
                count++;
            }
        }

        if (count <= 0 && this.queuedDialogs.length <= 0) {
            return true;
        }

        return false;
    },

    onCloseAllDialogs: function() {
        //debug.log("onCloseAllDialogs");
        if (appContext.getWindowManager().currentWindowNode) {
            debug.log("dispatchEvent");
            appContext.getWindowManager().currentWindowNode.dispatchEvent(new cc.Event.EventCustom('CloseAllDialogs'));
        }

        if (appContext.gameplayManager && appContext.gameplayManager.node) {
            appContext.gameplayManager.resume();
        }
    },

    closeAllDialogs: function() {
        for (let i in this.dialogParent.children) {
            let item = this.dialogParent.children[i];
            if (item == null) {
                continue;
            }

            let comp = item.getComponent("BaseDialog");
            if (comp != null && typeof comp.hide == "function") {
                comp.hide();
            }
        }
    },

    enqueueDialog: function(type, info) {
        //把一个dialog放入队列，关闭某个dialog时将显示队列中的dialog
        if (this._cachedDialogs[type] && this.isDialogTypeCached(type)) {
            //如果现在正在显示这个dialog或者正在加载这个dialog 则依然不放入队列
            //这个忽略，可能导致一系列问题。比如连续弹出奖励dialog应该可以显示。所以只针对isCached的dialog有效
            return;
        }

        this.queuedDialogs.push({
            type: type,
            info: info
        });
    },

    showOrEnqueueDialog: function(type, info) {
        //如果一个Cached对话正在显示或者即将显示，就加入队列，否则直接显示
        let hasDialogShowing = false;
        for (let key in this._cachedDialogs) {
            let dialog = this._cachedDialogs[key];
            if (dialog != null && (typeof dialog === "object" || dialog === true)) {
                hasDialogShowing = true;
                break;
            }
        }

        if (hasDialogShowing) {
            this.enqueueDialog(type, info);
        } else {
            this.showDialog(type, info);
        }
    },

    updateDataBasedDialogs: function() {
        let needUpdateDialogTypes = [
            DialogTypes.Inventory,
            DialogTypes.Upgrade,
            DialogTypes.Shop,
            DialogTypes.PlayerInfo
        ];

        for (let i in needUpdateDialogTypes) {
            let type = needUpdateDialogTypes[i];
            if (type) {
                let isCached = this.isDialogTypeCached(type);
                if (isCached && this._cachedDialogs[type] != null) {
                    if (this._cachedDialogs[type].updateInfo != null) {
                        this._cachedDialogs[type].updateInfo();
                    }
                }
            }
        }
    },

    isDialogTypeCached: function(type) {
        let isCached = true;

        switch (type) {
            case DialogTypes.PushItem:
            case DialogTypes.MessageBox:
            case DialogTypes.ConfirmBox:
            case DialogTypes.MissionTip:
            case DialogTypes.Toast:
            case DialogTypes.CommonShare:
            case DialogTypes.Item:
                isCached = false;
                break;
        }

        return isCached;
    },

    getDialogPrefabPathByType: function(type) {
        let prefabPath = "";

        switch (type) {
            case DialogTypes.PlayerInfo:
                prefabPath = this.playerInfoDialogPrefabPath;
                break;

            case DialogTypes.Invite:
                prefabPath = this.InviteDialogPrefabPath;
                break;

            case DialogTypes.GameSetting:
                prefabPath = this.gameSettingDialogPrefabPath;
                break;

            case DialogTypes.ConfirmBox:
                prefabPath = this.confirmBoxPrefabPath;
                break;

            case DialogTypes.Shop:
                prefabPath = this.shopDialogPrefabPath;
                break;

            case DialogTypes.ClientService:
                prefabPath = this.clientServiceDialogPrefabPath;
                break;

            case DialogTypes.AddToDesktop:
                prefabPath = this.addToDesktopPrefabPath;
                break;

            case DialogTypes.GameGuide:
                prefabPath = this.gameGuidePrefabPath;
                break;

            case DialogTypes.SimpleShare:
                prefabPath = this.simpleShareDialogPath;
                break;

            case DialogTypes.Toast:
                prefabPath = this.toastPrefabPath;
                break;

            case DialogTypes.Win:
                prefabPath = this.winDialogPath;
                break;

            case DialogTypes.Loose:
                prefabPath = this.looseDialogPrefabPath;
                break;

            case DialogTypes.ItemTip:
                prefabPath = this.itemTipDialogPath;
                break;

            case DialogTypes.LevelUp:
                prefabPath = this.levelUpDialogPath;
                break;

            case DialogTypes.Mail:
                prefabPath = this.mailDialogPath;
                break;

            case DialogTypes.GradeInfo:
                prefabPath = this.gradeInfoDialogPrefabPath;
                break;

            case DialogTypes.RoundEnd:
                prefabPath = this.roundEndDialogPrefabPath;
                break;

            case DialogTypes.Item:
                prefabPath = this.itemDialogPath;
                break;

            case DialogTypes.Inventory:
                prefabPath = this.inventoryDialogPath;
                break;

            case DialogTypes.Match:
                prefabPath = this.matchDialogPrefabPath;
                break;

            case DialogTypes.Rank:
                prefabPath = this.rankDialogPrefabPath;
                break;

            case DialogTypes.IdleLevel:
                prefabPath = this.idleLevelDialogPath;
                break;

            case DialogTypes.Wiki:
                prefabPath = this.wikiDialogPath;
                break;

            case DialogTypes.MoreFunc:
                prefabPath = this.moreFuncDialogPath;
                break;

            case DialogTypes.Promotion:
                prefabPath = this.promotionDialogPath;
                break;

            case DialogTypes.Checkin:
                prefabPath = this.checkinDialogPath;
                break;

            case DialogTypes.Lottery:
                prefabPath = this.lotteryDialogPath;
                break;

            case DialogTypes.StartGamePromotion:
                prefabPath = this.startGamePromotionDialogPath;
                break;

            case DialogTypes.Avatar:
                prefabPath = this.avatarDialogPath;
                break;

            case DialogTypes.FreeAvatar:
                prefabPath = this.freeAvatarDialogPath;
                break;

            default:
                break;
        }

        return prefabPath;
    },

    showDialog: function(type, info) {
        let prefabPath = this.getDialogPrefabPathByType(type);
        let isCached = this.isDialogTypeCached(type);

        if (isCached && this._cachedDialogs[type] != null) {
            debug.log("try to show cached dialog:" + type);
            if (this._cachedDialogs[type].updateInfo != null) {
                this._cachedDialogs[type].updateInfo(info);
            }
            return;
        }

        if (!prefabPath || prefabPath === "") {
            debug.warn("showing dialog " + type + " while prefabPath does not exist");
            return;
        }

        if (isCached) {
            this._cachedDialogs[type] = true;
        }

        let resPath = this.rootDialogPrefabPath + prefabPath;
        appContext.getFileManager().loadResourceSafe(resPath, cc.Prefab, function(prefab) {
            let comp = null;
            let dialogObj = null;
            if (prefab != null) {
                try {
                    dialogObj = cc.instantiate(prefab);
                    comp = dialogObj.getComponent("BaseDialog");
                } catch (e) {
                    debug.log(e);
                    console.log("can't instantiate " + type);
                    return;
                }

                if (comp == null) {
                    console.log("can't get BaseDialog " + type);
                    return;
                }

                comp.type = type;
                comp.show(info);
                if (isCached) {
                    this._cachedDialogs[type] = comp;
                }

                let widget = comp.widgetSpecialAlign;
                if (widget != null) {
                    widget.target = appContext.node;
                }

                this.dialogParent.addChild(dialogObj);

                if (appContext.getWindowManager().currentWindowNode) {
                    appContext.getWindowManager().currentWindowNode.dispatchEvent(new cc.Event.EventCustom('HasDialog'));
                }
                if (appContext.gameplayManager && appContext.gameplayManager.node) {
                    appContext.gameplayManager.pause();
                }
            } else {
                this._cachedDialogs[type] = null;
                // 防止加载失败影响后面的dialog弹出
                this.fireQueuedDialogs();
            }

            cc.loader.releaseRes(resPath, cc.Prefab);
        }, this);
    },

    getCachedDialog: function(type) {
        if (type == null || type == "") {
            return null;
        }

        let cachedDialog = this._cachedDialogs[type];
        if (cachedDialog == null || typeof cachedDialog !== "object") {
            return null;
        }

        return cachedDialog;
    },

    showWaitingCircle: function() {
        // this.waitingCircle.show();
    },

    hideWaitingCircle: function() {
        //this.waitingCircle.hide();
    },

    showTip: function(tip, x, y) {
        this.tip.show(tip);
        this.tip.move(x, y);
    },

    hideTip: function() {
        this.tip.hide();
    },

    updateTip: function(x, y) {
        this.tip.move(x, y);
    },

    appendMiniResourcesHud: function(cb, caller) {
        let resPath = this.rootDialogPrefabPath + this.miniResourcesHudPath;

        appContext.getFileManager().loadResourceSafe(resPath, cc.Prefab, function(prefab) {
            let node = cc.instantiate(prefab);
            let comp = node.getComponent("MiniResourcesHud");
            cc.loader.releaseRes(resPath, cc.Prefab);
            if (caller.node && caller.node.isValid) {
                cb.call(caller, node, comp);
            }
        }, this);
    },

    appendVitaHud: function(cb, caller) {
        let resPath = this.rootDialogPrefabPath + this.vitaHudPath;

        appContext.getFileManager().loadResourceSafe(resPath, cc.Prefab, function(prefab) {
            let node = cc.instantiate(prefab);
            cc.loader.releaseRes(resPath, cc.Prefab);
            if (caller.node && caller.node.isValid) {
                cb.call(caller, node);
            }
        }, this);
    },

    appendFg: function(cb, caller) {
        let resPath = this.rootDialogPrefabPath + this.fgPath;

        appContext.getFileManager().loadResourceSafe(resPath, cc.Prefab, function(prefab) {
            let node = cc.instantiate(prefab);
            if (caller.node && caller.node.isValid) {
                cb.call(caller, node);
            }
        }, this);
    },

    appendFghc: function(cb, caller) {
        let resPath = this.rootDialogPrefabPath + this.fghcPath;

        appContext.getFileManager().loadResourceSafe(resPath, cc.Prefab, function(prefab) {
            let node = cc.instantiate(prefab);
            if (caller.node && caller.node.isValid) {
                cb.call(caller, node);
            }
        }, this);
    },
});