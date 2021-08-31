
let DialogTypes = require("DialogTypes");

cc.Class({
    extends: cc.Component,

    properties: {
        selfPlayer: require("GamePlayer"),

        opponentPlayer: require("GamePlayer"),

        chatBoard: cc.Node,

        btnSurrender: cc.Node,

        btnRevert: cc.Node,

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

        tip: cc.Node,
    },

    onLoad: function () {
        if (WechatAPI.followBtn && typeof WechatAPI.followBtn.destroy == "function") {
            WechatAPI.followBtn.destroy();
            WechatAPI.followBtn = null;
        }

        this.cheatCode = 0;
    },

    start() {
        if (WechatAPI.isTT) {
            WechatAPI.bannerAdUtil && WechatAPI.bannerAdUtil.hide();

            if (WechatAPI.PoorTTBtn) {
                WechatAPI.PoorTTBtn.hide();
            }


        } else {
            WechatAPI.bannerAdUtil && WechatAPI.bannerAdUtil.reload();
        }

        this.resetRecordBtns();

        let matchDialog = appContext.getDialogManager().getCachedDialog(DialogTypes.Match);
        if (matchDialog) {
            matchDialog.hide();
        }
    },

    onClickRecord() {
        console.log('!!!点击录屏');
        WechatAPI.ttRecorder.start();

        this.resetRecordBtns();
    },

    update(dt) {
        if (WechatAPI.isTT && WechatAPI.ttRecorder) {
            let state = WechatAPI.ttRecorder.state;

            switch (state) {
                case "stopped":
                    this.recordBtn.active = true;
                    this.recordingBtn.active = false;
                    break;

                case "stopping":
                    this.recordBtn.active = false;
                    this.recordingBtn.active = false;
                    break;

                case "started":
                    if (WechatAPI.ttRecorder.isAuto) {
                        this.recordBtn.active = true;
                        this.recordingBtn.active = false;
                    } else {
                        this.recordBtn.active = false;
                        this.recordingBtn.active = true;
                    }
                    break;

                case "starting":
                    this.recordBtn.active = false;
                    this.recordingBtn.active = false;
                    break;

                case "wait":
                    this.recordBtn.active = false;
                    this.recordingBtn.active = false;
                    break;
            }
        }
    },

    onClickRecording() {
        console.log('!!!点击结束录屏');
        WechatAPI.ttRecorder.willShare = true;
        WechatAPI.ttRecorder.stop();

        this.resetRecordBtns();
    },

    resetRecordBtns() {
        this.recordBtn.active = false;
        this.recordingBtn.active = false;
    },

    reset: function () {
        this.selfPlayer.reset();
        this.opponentPlayer.reset();
        this.btnRevert.active = false;
        this.btnSurrender.active = false;
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
                clickFunction: function () {
                    if (appContext.getGameManager().game && appContext.getGameManager().game.selfPlayer) {
                        appContext.getGameManager().game.selfPlayer.surrender();
                    } else {
                        appContext.getAppController().clearGameData();
                    }
                },
            },
            btn2: {
                name: "取 消",
            },
            hideCloseBtn: true,
        };

        if (debug.enableRevert && debug.enablePromoRevert && !appContext.getGameManager().promoRevertUnlocked) {
            info.isPromoSurrender = true;
        }
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

        this.chessSPLeft.node.scale = 0;
        this.chessSPRight.node.scale = 0;
        this.chessSPLeft.spriteFrame = firstIsSelfPlayer ? this.chessSFBlack : this.chessSFWhite;
        this.chessSPRight.spriteFrame = firstIsSelfPlayer ? this.chessSFWhite : this.chessSFBlack;

        this.chessSPLeft.node.runAction(cc.scaleTo(2, 1).easing(cc.easeElasticOut()));
        this.chessSPRight.node.runAction(cc.scaleTo(2, 1).easing(cc.easeElasticOut()));

        this.resetRecordBtns();
    },

    closeChatBoard() {
        this.chatBoard.active = false;
    },

    toggleChatBoard() {
        this.chatBoard.active = !this.chatBoard.active;
    },

    onClickChat(e, param) {
        appContext.getSoundManager().playBtn();
        //debug.log("onClickChat " + param);
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
        if (appContext.getGameSettingManager().getMuteChat()) {
            return;
        }

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

    //点击左棋盒子
    onClickSelfChess() {
        if (!debug.unlimitedRoundTimingAndPromoFeature) {
            return;
        }

        let solo = appContext.getGameManager().soloPlay;
        this.ToggleSoloPlay(!solo);
        if (solo) {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "摆棋已关闭");
        } else {
            let info = {
                content: "摆棋已开启\n\n将轮流为双方落子\n\n再次点击左棋盒关闭摆棋",
                hideCloseBtn: true,
            };

            appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, info);
        }

        return;
        if (debug.enableLog) {
            let firstIsSelfPlayer = appContext.getGameManager().game.firstIsSelfPlayer;
            if (firstIsSelfPlayer) {
                appContext.getGameManager().playerWin(1, false, true);
            } else {
                appContext.getGameManager().playerWin(2, false, true);
            }
        } else {
            this.cheatCode += 1;
        }
    },

    //点击悔棋

    // 如果在自己的回合悔棋，但是对方没有上一个棋子，则无法悔棋
    // 如果在自己的回合悔棋，但是自己没有上一个棋子，则无法悔棋
    // 如果在自己的回合悔棋，则回退对方的上一个棋子和自己的上一个棋子，继续自己的回合，不重置回合时间

    // 如果在对方的回合悔棋，自己没有上一个棋子，则无法悔棋
    // 如果在对方的回合悔棋，则回退自己的上一个棋子，立即结束对方当前的回合，并开始自己的回合
    // 	如果对方是ai下棋，则需要打断ai的计时器
    // 	如果对方是摆棋，则无法额外操作
    // 如果在非回合阶段悔棋，包括开始准备阶段和胜利结算阶段，则无法悔棋
    onClickRevert() {
        //debug.log("悔棋");
        let game = appContext.getGameManager().game;

        //commitBoard后轮到我的type game.opponentPlayer.chessType/game.selfPlayer.chessType
        let commitBoardChessType = game.opponentPlayer.chessType;

        let cbm = appContext.getGameManager().chessboardManager;
        let index = game.currentTurn - 1;

        cbm.chessboard.toggleChessChecker(false);
        let chess1, chess2;

        if (game.currentChessType == game.selfPlayer.chessType) {
            //自己的回合
            if (index < 2) {
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "没有可以悔的棋");
                return;
            }
            chess1 = cbm.chessboard.findChessByIndex(index);
            //debug.log("悔棋1:" + index);
            //debug.log(chess1);
            cbm.chessboard.setChessAt(chess1.x, chess1.y, null, 0);

            if (!appContext.getGameManager().soloPlay) {
                //非摆棋模式
                chess2 = cbm.chessboard.findChessByIndex(index - 1);
                cbm.chessboard.setChessAt(chess2.x, chess2.y, null, 0);
                game.currentTurn = index - 2;
            } else {
                game.currentTurn = index - 1;
                commitBoardChessType = game.selfPlayer.chessType;
            }
            this.revertChat();

        } else {
            //对方的回合
            if (!appContext.getGameManager().soloPlay) {
                //摆棋模式
                game.opponentPlayer.clearTask();//如果对方是ai下棋，则需要打断ai的计时器
            }

            if (index < 1) {
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "没有可以悔的棋");
                return;
            }
            chess1 = cbm.chessboard.findChessByIndex(index);
            //debug.log("悔棋1:" + index);
            //debug.log(chess1);
            cbm.chessboard.setChessAt(chess1.x, chess1.y, null, 0);
            this.revertChat();
            game.currentTurn = index - 1;
        }

        appContext.getGameManager().commitBoard(cbm.chessboard.chessMap, commitBoardChessType);
        cbm.chessboard.toggleNewChessEffect(false);
        if (index > 1) {
            let lastChess = cbm.chessboard.findChessByIndex(index - 1);
            if (lastChess != null) {
                cbm.chessboard.placeNewChessEffect(lastChess.x, lastChess.y);
                cbm.chessboard.toggleNewChessEffect(true);
            }
        }
    },

    revertChat() {
        if (Math.random() > 0.5) {
            this.playChat(true, "我悔棋了");
        } else {
            this.playChat(true, "悔棋了，见谅");
        }
        if (Math.random() > 0.5) {
            this.playChat(false, "...");
        }
    },

    deplaceChat() {
        if (Math.random() > 0.5) {
            this.playChat(true, "我想移个棋");
        } else {
            this.playChat(true, "这棋下歪了");
        }
        if (Math.random() > 0.5) {
            this.playChat(false, "...");
        }
    },

    //点击右边盒子
    onClickOppoChess() {
        if (!debug.unlimitedRoundTimingAndPromoFeature) {
            return;
        }

        let moveChessPlay = appContext.getGameManager().moveChessPlay;
        this.ToggleMoveChessPlay(!moveChessPlay);
        if (moveChessPlay) {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "移棋已关闭");
        } else {
            let info = {
                content: "移棋已开启\n\n把正在下的棋\n对准棋盘上【任意棋子】\n就可以移动此棋子\n\n再次点击右棋盒关闭移棋",
                hideCloseBtn: true,
            };

            appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, info);
        }

        return;
        if (debug.enableLog) {
            appContext.getGameManager().showChat(false, "happy");
        } else {
            this.cheatCode += 100;
        }
    },

    ToggleSoloPlay(b) {
        appContext.getGameManager().soloPlay = b;
    },

    ToggleMoveChessPlay(b) {
        appContext.getGameManager().moveChessPlay = b;
    },

    onClickProfil() {
        appContext.getSoundManager().playBtn();
        appContext.getDialogManager().showDialog(DialogTypes.PlayerInfo);
        //console.log("cheatCode" + this.cheatCode);
        //if (this.cheatCode == 306) {
        //  appContext.getUxManager().resetGameInfo();
        //}
    },

    onPlayerInfoDialogHide() {
        this.selfPlayer.playerinfo.setup(appContext.getUxManager().getUserInfo());
    },

    onPlayerCommitChess() {
        this.tip.active = false;
        //show surrender
        this.btnSurrender.active = true;

        if (debug.enableRevert && !debug.enablePromoRevert) {
            this.showBtnRevert();
        } else if (debug.enableRevert && debug.enablePromoRevert) {
            if (appContext.getGameManager().promoRevertUnlocked) {
                this.showBtnRevert();
            } else {
                this.showBtnRevert(false);
            }
        } else {
            this.showBtnRevert(false);
        }
    },

    showBtnRevert(b = true) {
        this.btnRevert.active = b;
    },

});