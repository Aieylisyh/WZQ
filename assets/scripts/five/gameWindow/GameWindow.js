
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

        chessSPLeft: cc.Sprite,

        chessSPRight: cc.Sprite,

        chessSFBlack: cc.SpriteFrame,

        chessSFWhite: cc.SpriteFrame,

        recordBtn: cc.Node,
        recordingBtn: cc.Node,
        recordingTimeLabel: cc.Label,
    },

    onLoad: function () {
        if (WechatAPI.followBtn && typeof WechatAPI.followBtn.destroy == "function") {
            WechatAPI.followBtn.destroy();
            WechatAPI.followBtn = null;
        }
    },

    start() {
        if (WechatAPI.isTT) {
            WechatAPI.bannerAdUtil && WechatAPI.bannerAdUtil.reload(true);
            this.onResetRecording();

            if (WechatAPI.PoorTTBtn) {
                WechatAPI.PoorTTBtn.hide();
            }
        }
    },

    onClickRecord() {
        this.recordBtn.active = false;
        this.recordingBtn.active = true;
        WechatAPI.recordGameStart();

        this.gameRecordtime = 0;
        this.gameRecordtimeInt = 0;
        this.recordingTimeLabel.string = "0";
        this.recording = true;

        WechatAPI.cache.autoRecording = false;
    },

    update(dt) {
        if (this.recording) {
            this.gameRecordtime += dt;
            let tempInt = Math.floor(this.gameRecordtime);
            if (tempInt != this.gameRecordtimeInt) {
                if (WechatAPI.getCanStopGameRecording()) {
                    this.gameRecordtimeInt = tempInt;
                    this.recordingTimeLabel.string = tempInt;
                } else {
                    this.onResetRecording();
                    this.recording = false;
                }
            }
        }
    },

    onClickRecording() {
        WechatAPI.recordGameEnd();
        this.onResetRecording();

        this.recording = false;
    },

    onResetRecording() {
        this.recordBtn.active = true;
        this.recordingBtn.active = false;
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

    // 点击"认输"按钮
    onClickBtnSurrender: function () {
        appContext.getSoundManager().playBtn();
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
        appContext.getSoundManager().playBtn();
        appContext.getDialogManager().showDialog(DialogTypes.GameSetting);
    },

    // 点击"聊天"按钮
    onClickBtnChat: function () {
        //appContext.getDialogManager().showDialog(DialogTypes.Toast, "暂时不能聊天 敬请期待");
        appContext.getSoundManager().playBtn();
        this.chatBoard.active = true;
    },

    onStartGame(firstIsSelfPlayer) {
        //show surrender
        this.btnSurrender.active = true;
        this.chessSPLeft.node.scale = 0;
        this.chessSPRight.node.scale = 0;
        this.chessSPLeft.spriteFrame = firstIsSelfPlayer ? this.chessSFBlack : this.chessSFWhite;
        this.chessSPRight.spriteFrame = firstIsSelfPlayer ? this.chessSFWhite : this.chessSFBlack;

        this.chessSPLeft.node.runAction(cc.scaleTo(2, 1).easing(cc.easeElasticOut()));
        this.chessSPRight.node.runAction(cc.scaleTo(2, 1).easing(cc.easeElasticOut()));
        // this.scheduleOnce(function () {
        //     this.chessSPRight.node.runAction(cc.scaleTo(1, 1).easing(cc.easeElasticOut()));
        // }, 1);

    },

    closeChatBoard() {
        this.chatBoard.active = false;
    },

    toggleChatBoard() {
        this.chatBoard.active = !this.chatBoard.active;
    },

    onClickChat(e, param) {
        appContext.getSoundManager().playBtn();
        debug.log("onClickChat " + param);
        appContext.getGameManager().showChat(true, param);
        appContext.getGameManager().notifyReplyChat(param);
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
    },

    onClickSelfChess() {
        if (debug.enableLog) {
            let firstIsSelfPlayer = appContext.getGameManager().game.firstIsSelfPlayer;
            if (firstIsSelfPlayer) {
                appContext.getGameManager().playerWin(1, false, true);
            } else {
                appContext.getGameManager().playerWin(2, false, true);
            }
        }
    },

    onClickOppoChess() {
        if (debug.enableLog) {
            appContext.getGameManager().showChat(false, "happy");
        }
    },

    onClickProfil() {
        appContext.getSoundManager().playBtn();
        appContext.getDialogManager().showDialog(DialogTypes.PlayerInfo);
    },

    onPlayerInfoDialogHide() {
        this.selfPlayer.playerinfo.setup(appContext.getUxManager().getUserInfo());
    },
});