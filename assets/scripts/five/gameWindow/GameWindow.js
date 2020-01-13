
let DialogTypes = require("DialogTypes");

cc.Class({
    extends: cc.Component,

    properties: {
        selfPlayer: require("GamePlayer"),

        opponentPlayer: require("GamePlayer"),

        chatBoard: cc.Node,

        btnSurrender: cc.Node,

        selfEmoji: require("EmojiDisplayer"),

        opponentEmoji: require("EmojiDisplayer"),

        selfChatBubble: require("ChatBubble"),

        opponentChatBubble: require("ChatBubble"),

        emoji_happy: cc.SpriteFrame,
        emoji_smile: cc.SpriteFrame,
        emoji_normal: cc.SpriteFrame,
        emoji_die: cc.SpriteFrame,
        emoji_love: cc.SpriteFrame,
    },

    reset: function () {
        this.selfPlayer.reset();
        this.opponentPlayer.reset();
    },

    // 显示倒计时
    showInfo: function () {
        this.selfPlayer.setInfo(true);
        this.opponentPlayer.setInfo(!true);
    },

    // 显示倒计时
    showTimer: function (isSelfRound) {
        this.selfPlayer.showTimer(isSelfRound);
        this.opponentPlayer.showTimer(!isSelfRound);
    },

    // 点击"悔棋"按钮
    onClickBtnUndo: function () {
        appContext.getDialogManager().showDialog(DialogTypes.Toast, "暂时不能悔棋 敬请期待");
    },

    // 点击"认输"按钮
    onClickBtnSurrender: function () {
        let info = {
            content: "您真的要认输吗",
            btn1: {
                name: "认 输",
                clickFunction: function () {
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
    onClickBtnSetting: function () {
        appContext.getDialogManager().showDialog(DialogTypes.GameSetting);
    },

    // 点击"聊天"按钮
    onClickBtnChat: function () {
        //appContext.getDialogManager().showDialog(DialogTypes.Toast, "暂时不能聊天 敬请期待");
        this.chatBoard.active = true;
    },

    onStartGame() {
        //show surrender
        this.btnSurrender.active = true;
    },

    closeChatBoard() {
        this.chatBoard.active = false;
    },

    toggleChatBoard() {
        this.chatBoard.active = !this.chatBoard.active;
    },

    onClickChat(e, param) {
        debug.log("onClickChat " + param);
        appContext.getGameManager().showChat(true, param);
        this.closeChatBoard();
    },

    playEmoji(isSelf, type) {
        let sf = this.getEmojiSpriteframeByType(type);
        if (isSelf) {
            this.selfEmoji.play(sf);
        } else {
            this.opponentEmoji.play(sf);
        }
    },

    playChat(isSelf, content) {
        if (content == "" || content == null) {
            return;
        }
        
        if (isSelf) {
            this.selfChatBubble.play(content);
        } else {
            this.opponentChatBubble.play(content);
        }
    },

    getEmojiSpriteframeByType(type) {
        let sf = this.emoji_happy;
        switch (type) {
            case "happy":
                sf = this.emoji_happy;
                break;

            case "normal":
                sf = this.emoji_normal;
                break;

            case "die":
                sf = this.emoji_die;
                break;

            case "love":
                sf = this.emoji_love;
                break;

            case "smile":
                sf = this.emoji_smile;
                break;
        }

        return sf;
    }
});