let DialogTypes = require("DialogTypes");


let SelfPlayer = cc.Class({

    extends: require("Player"),

    properties: {
        basic: {
            default: null,
        },
    },

    __ctor__: function (param) {
        this.type = "self";

        debug.log("SelfPlayer init");
        debug.log(param);

        this.basic = param.basic;
    },

    onUpdate: function (dt) {
    },

    isSelf: function () {
        return true;
    },

    setFirst: function (isFirst) {
        this.isFirst = isFirst;
        this.chessType = isFirst ? 1 : 2;
    },

    notifyPlay: function () {
        //debug.log("self notifyPlay");
        appContext.getGameManager().chessboardManager.setLocked(false);
    },

    notifyGrabFirst: function () {
        // this.grabFirst(false);
        appContext.getDialogManager().showDialog(DialogTypes.GrabFirst);
    },

    grabFirst: function (grab) {
        debug.log("玩家抢先手:" + grab);

        appContext.getGameManager().playerGrabFirst(this.index, grab);
    },

    offline: function () {
        debug.log("玩家掉线了");
        appContext.getGameManager().playerWin(3 - this.chessType);
    },

    surrender: function () {
        debug.log("玩家认输了");
        appContext.getGameManager().playerWin(3 - this.chessType, false, true);
    },

    makeDecision: function (x, y, t) {
        let cbm = appContext.getGameManager().chessboardManager;
        if (cbm == null) {
            debug.log("cbm is null!");
            return;
        }

        if (appContext.getGameManager().game.currentChessType != this.chessType) {
            if(appContext.getGameManager().soloPlay){
                //debug.log("solo Play opponent chess");
            }else{
                debug.log("currentChessType not match self!");
                return;
            }
        }

        cbm.commitChessAt(x, y, t);
    },

    destroy: function () {

    },
});