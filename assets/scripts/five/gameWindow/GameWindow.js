let DataContainerUpdater = require("DataContainerUpdater");
let DataKey = require("DataKey");
let DialogTypes = require("DialogTypes");

cc.Class({
    extends: cc.Component,

    properties: {
        selfPlayer: require("GamePlayer"),

        opponentPlayer: require("GamePlayer"),
    },

    start: function() {
        
    },

    // 显示倒计时
    showTimer: function(isSelfRound) {
        this.selfPlayer.showTimer(isSelfRound);
        this.opponentPlayer.showTimer(!isSelfRound);
    },

    // 点击"悔棋"按钮
    onClickBtnUndo: function() {
        appContext.getDialogManager().showDialog(DialogTypes.Toast, "暂时不能悔棋 敬请期待");
    },

    // 点击"认输"按钮
    onClickBtnSurrender: function() {
        let info = {
            content: "您真的要认输吗",
            btn1: {
                name: "认 输",
                clickFunction: function() {
                    if (appContext.getGameManager().game && appContext.getGameManager().game.selfPlayer) {
                        appContext.getGameManager().game.selfPlayer.surrender();
                    } else {
                        appContext.getAppController().clearGameData();
                    }
                },
                isRed: true,
            },
            btn2: {
                name: "取 消",
                isRed: false,
            },
        };

        appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, info);
    },

    // 点击"设置"按钮
    onClickBtnSetting: function() {
        appContext.getDialogManager().showDialog(DialogTypes.GameSetting);
    },

    // 点击"聊天"按钮
    onClickBtnChat: function() {
        appContext.getDialogManager().showDialog(DialogTypes.Toast, "暂时不能聊天 敬请期待");
    },
});