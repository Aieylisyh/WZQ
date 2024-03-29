let SelfPlayer = require("SelfPlayer");
let Ai = require("Ai");
let DialogTypes = require("DialogTypes");

cc.Class({
    extends: cc.Component,

    properties: {
        game: {
            default: null,
        },

        soloPlay: false,

        moveChessPlay: false,
    },

    update: function (dt) {
        if (this.game == null ||
            this.game.player1 == null ||
            this.game.player2 == null) {
            return;
        }

        this.game.player1.onUpdate(dt);
        this.game.player2.onUpdate(dt);
    },

    start: function () {
        this.game = null;
        this.promoRevertUnlocked = false;
        //window.gm = this;
    },

    setCurrentMatchMakingInfo(info) {
        this.currentMatchMakingInfo = info;
    },

    onGameWindowReady() {
        debug.log("!!onGameWindowReady");
        if (this.currentMatchMakingInfo != null) {
            //如果有比赛者信息，则开始游戏
            this.startGame();
        } else {
            //否则退回主菜单
            appContext.getAppController().backToMain();
        }
    },

    getSelfPlayer: function () {
        return new SelfPlayer(appContext.getUxManager().getUserInfo());
    },

    //根据远程得到的结果生成本地的棋局
    //player1 玩家1
    //player2 玩家2
    //randomSeed 随机种子，主要用于决定先手，也可用于其他需要两边一致的随机
    //gameConfig 棋局设置，什么场，什么游戏模式等等
    createGame: function (player1, player2, randomSeed, gameConfig) {
        debug.log("!!createGame");
        this.clearPlayers();

        let game = {};

        game.player1 = player1;
        game.player2 = player2;
        game.player1.index = 1;
        game.player2.index = 2;

        game.randomSeed = randomSeed;
        game.gameConfig = gameConfig;

        if (game.player1.isSelf()) {
            game.selfPlayer = game.player1;
            game.opponentPlayer = game.player2;
        } else {
            game.selfPlayer = game.player2;
            game.opponentPlayer = game.player1;
        }

        console.log("opponentPlayer");
        console.log(game.opponentPlayer);
        console.log("selfPlayer");
        console.log(game.selfPlayer);
        this.game = game;
    },

    playerGrabFirst: function (index, bGrab) {
        debug.log("!抢先手注意看参数");
        debug.log(arguments);

        if (!this.grabFirstProcess) {
            debug.log("!抢先手但是不在有效时间");
            return;
        }

        if (index == 1) {
            this.game.player1GrabFirst = bGrab;
        } else {
            this.game.player2GrabFirst = bGrab;
        }

        if (this.game.player1GrabFirst != null && this.game.player2GrabFirst != null) {
            this.grabFirstEnd();
        }
    },

    startGame: function () {
        debug.log("!!startGame");
        if (this.chessboardManager == null || this.chessboardManager.node == null || !this.chessboardManager.node.isValid) {
            return false;
        }

        //gamewindow
        this.getGameWindow().showInfo();
        WechatAPI.ttRecorder.willShare = false;
        WechatAPI.ttRecorder.stop();

        this.chessboardManager.clearBoard();
        this.game.chessMap = this.chessboardManager.chessboard.chessMap;

        this.startGrabFirstSection();

        return true;
    },

    startGrabFirstSection() {
        debug.log("!抢先手开始");
        if (appContext.nextFirstHand == true || appContext.getGameManager().soloPlay) {
            //appContext.nextFirstHand = false;
            this.grabFirstEnd();
            return;
        }

        this.game.selfPlayer.notifyGrabFirst();
        this.game.opponentPlayer.notifyGrabFirst();
        this.grabFirstProcess = true;


        // appContext.getDialogManager().showDialog(DialogTypes.Toast, "正在问对面是否抢先手...");
        // debug.log("!!正在问对面是否抢先手");
        //this.playerWin(1);
    },

    grabFirstEnd() {
        debug.log("!抢先手 结束");
        this.grabFirstProcess = false;
        this.startPlay();
    },

    getGameWindow() {
        if (this.gw == null || this.gw.node == null || !this.gw.node.isValid) {
            this.gw = appContext.getWindowManager().getCurrentWindowNode().getComponent("GameWindow");
        }
        if (this.gw == null) {
            //否则退回主菜单
            appContext.getAppController().backToMain();
        }

        return this.gw;
    },

    startPlay: function () {
        debug.log("!!startPlay");
        if (this.chessboardManager == null || this.chessboardManager.node == null || !this.chessboardManager.node.isValid) {
            return false;
        }

        this.setupFirstPlay();
        this.getGameWindow().onStartGame(this.game.firstIsSelfPlayer);
        this.game.currentTurn = 0;
        this.startNextTurn(2);
        return true;
    },

    //提交当前的场面
    commitBoard: function (chessMap, lastChessType) {
        this.game.chessMap = chessMap;
        appContext.getSoundManager().playChess();
        let winRes = Ai.checkWin(lastChessType);
        // debug.log("winRes");
        // debug.log(winRes);

        if (winRes && winRes.win) {
            this.delayedPlayerWin(lastChessType);
        } else {
            if (this.getCurrentPlayerIsSelf()) {
                this.getGameWindow().onPlayerCommitChess();
            }

            this.startNextTurn(lastChessType);
        }
    },

    startNextTurn: function (lastChessType) {
        this.game.currentChessType = 3 - lastChessType;
        this.game.currentTurn++;
        debug.log("回合" + this.game.currentTurn);
        if (this.game.currentTurn > 225) {
            this.drawGame();
            return;
        }

        WechatAPI.ttRecorder.start(true);

        if (this.getCurrentPlayerIsSelf()) {
            this.game.selfPlayer.notifyPlay();
            this.getGameWindow().showTimer(true);
        } else {
            this.game.opponentPlayer.notifyPlay();
            this.getGameWindow().showTimer(false);
        }
    },

    getCurrentPlayerIsSelf() {
        return (this.game.firstIsSelfPlayer && this.game.currentChessType === 1 ||
            !this.game.firstIsSelfPlayer && this.game.currentChessType === 2);
    },

    delayedPlayerWin(winnerType, isLooserOffline = false, isSurrender = false) {
        this.chessboardManager.setLocked(true);
        this.chessboardManager.playWinEffect();
        this.scheduleOnce(function () {
            this.playerWin(winnerType, isLooserOffline, isSurrender);
        }, 4);
    },

    drawGame() {
        let info = {};
        info.selfPlayer = this.game.selfPlayer;
        info.opponentPlayer = this.game.opponentPlayer;
        info.win = false;

        info.isLooserOffline = false;
        info.isSurrender = false;
        info.isDrawGame = true;
        info.totalHands = Math.floor((this.game.currentTurn + 1) / 2);
        info = appContext.getUxManager().registerGameEnd(info);
        appContext.getDialogManager().showDialog(DialogTypes.RoundEnd, info);

        this.chessboardManager.setLocked(true);
        this.getGameWindow().reset();
        this.clearPlayers();
    },

    playerWin: function (winnerType, isLooserOffline = false, isSurrender = false) {
        let info = {};
        info.selfPlayer = this.game.selfPlayer;
        info.opponentPlayer = this.game.opponentPlayer;
        if ((winnerType == 1 && this.game.firstIsPlayer1) || (winnerType == 2 && !this.game.firstIsPlayer1)) {
            info.win = true;
        } else {
            info.win = false;
        }

        info.isLooserOffline = isLooserOffline;
        info.isSurrender = isSurrender;
        info.totalHands = Math.floor((this.game.currentTurn + 1) / 2);
        info = appContext.getUxManager().registerGameEnd(info);
        appContext.getDialogManager().showDialog(DialogTypes.RoundEnd, info);

        this.chessboardManager.setLocked(true);
        this.getGameWindow().reset();
        this.clearPlayers();
    },

    clearPlayers: function () {
        if (this.game != null) {
            if (this.game.opponentPlayer != null) {
                this.game.opponentPlayer.destroy();
            }
            if (this.game.selfPlayer != null) {
                this.game.selfPlayer.destroy();
            }

            this.game.opponentPlayer = null;
            this.game.selfPlayer = null;
        }
    },

    setupFirstPlay: function () {
        if (this.game == null) {
            return;
        }

        debug.log("setupFirstPlay");
        let firstIsPlayer1 = true;

        if (appContext.nextFirstHand == true || appContext.getGameManager().soloPlay) {
            appContext.nextFirstHand = false;
            firstIsPlayer1 = this.game.player1.isSelf();
        } else {
            if (!this.game.player1GrabFirst && this.game.player2GrabFirst) {
                firstIsPlayer1 = false;
                //appContext.getDialogManager().showDialog(DialogTypes.Toast, "一方抢了先手");
            } else if (this.game.player1GrabFirst && !this.game.player2GrabFirst) {
                firstIsPlayer1 = true;
                //appContext.getDialogManager().showDialog(DialogTypes.Toast, "双方都抢了先手");//n本局随机决定先手
            } else {
                if (this.game.player1GrabFirst && this.game.player2GrabFirst) {
                    appContext.getDialogManager().showDialog(DialogTypes.Toast, "双方都抢了先手");//n本局随机决定先手
                }
                firstIsPlayer1 = this.game.randomSeed < 0.5;
            }
        }
        this.game.firstIsPlayer1 = firstIsPlayer1;

        if (this.game.player1.isSelf() && firstIsPlayer1 ||
            this.game.player2.isSelf() && !firstIsPlayer1) {
            this.game.firstIsSelfPlayer = true;
            this.game.selfPlayer.setFirst(true);
            this.game.opponentPlayer.setFirst(false);
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "本局由您先手");
        } else {
            this.game.firstIsSelfPlayer = false;
            this.game.selfPlayer.setFirst(false);
            this.game.opponentPlayer.setFirst(true);
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "本局由对面先手");
        }
        appContext.getSoundManager().playStartRound();
        //appContext.getDialogManager().showDialog(DialogTypes.Toast, "游戏开始");
    },

    //更新当前的游戏，newGame中的每一条属性，都会覆盖当前的currentGame的对应属性。
    //如果不想覆盖，请不要让该属性存在，否则即便是null也会覆盖
    //可用于更新游戏状态，比如谁使用了先手卡
    updateCurrentGame: function (newGame) {
        if (newGame == null) {
            return;
        }

        if (this.game == null) {
            return null;
        }

        for (let i in newGame) {
            this.game[i] = newGame[i];
        }
    },

    onGetRemoteResponse: function (res) {
        let cbm = appContext.getGameManager().chessboardManager;
        if (cbm == null) {
            debug.log("onGetRemoteResponse cbm is null!");
            return;
        }

        if (this.game == null) {
            return;
        }

        this.game.opponentPlayer.makeDecision(res);
    },

    showChat(isSelf, chatType) {
        debug.log("showChat " + isSelf + " " + chatType);
        this.getGameWindow().playEmoji(isSelf, chatType);
    },

    getOpening() {
        //暂时不用这个，开局的信息太多，影响用户体验
        let index = Math.floor(Math.random() * 30);
        let p1 = "";
        let p2 = "";

        if (index == 0) {
            p1 = "我的棋力会把你撕成碎片";
            p2 = "这可是你自找的";
        } else if (index == 1) {
            p1 = "当心你的背后";
            p2 = "放马过来吧";
        } else if (index == 2) {
            p1 = "我会夺取你的棋子";
            p2 = "我可没时间陪你玩游戏";
        } else if (index == 3) {
            p1 = "五子棋灵指引我前进";
            p2 = "看谁笑到最后";
        } else if (index == 4) {
            p1 = "你认输吧";
            p2 = "我偏不";
        } else if (index == 5) {
            p1 = "我下棋可是专业的";
            p2 = "你是输棋很专业吧";
        } else if (index == 6) {
            p1 = "在我的棋力下颤抖吧！";
            p2 = "会有人怕你？";
        } else if (index == 7) {
            p1 = "为了五子棋之王";
            p2 = "为了我么?";
        } else if (index == 8) {
            p1 = "我是要成为棋王的人";
            p2 = "像我一样努力，你也可以";
        } else if (index == 9) {
            p1 = "我下棋是很精准的";
            p2 = "你这个棋子就放歪了";
        } else if (index == 10) {
            p1 = "下五子棋哪家强";
            p2 = "对面这家最不强";
        } else if (index == 11) {
            p1 = "你这手棋下的不错";
            p2 = "这是真的夸我吗？";
        } else if (index == 12) {
            p1 = "失败乃成功之母";
            p2 = "看来你离成功不远了";
        } else if (index == 13) {
            p1 = "快点，我要赢了";
            p2 = "你只会输的更快";
        } else if (index == 14) {
            p1 = "别着急，慢慢来";
            p2 = "怕了么？";
        } else if (index < 17) {
            p1 = "天下归心";
            p2 = "万棋归宗";
        } else if (index < 20) {
            p1 = "我突破";
            p2 = "看破了";
        } else if (index < 23) {
            p1 = "雕虫小技";
            p2 = "你被看穿了";
        } else if (index < 26) {
            p1 = "你的计谋被识破了";
            p2 = "我识破了你的识破";
        } else {
            p1 = "神之一手";
            p2 = "...";
        }

        return {
            p1: p1,
            p2: p2,
        };
    },

    getHurry() {
        //30秒出
        let index = Math.floor(Math.random() * 4);
        let p1 = "";

        if (index == 0) {
            p1 = "时间不多了！";
        } else if (index == 1) {
            p1 = "我必须做出判断！";
        } else if (index == 2) {
            p1 = "时间紧迫！";
        } else if (index == 3) {
            p1 = "再不落子就输了！";
        }
        return p1;
    },

    getThink() {
        //10秒出  20秒出
        let index = Math.floor(Math.random() * 7);
        let p1 = "";

        if (index == 0) {
            p1 = "怎么办呢...";
        } else if (index == 1) {
            p1 = "难以抉择...";
        } else if (index == 2) {
            p1 = "我想想...";
        } else if (index == 3) {
            p1 = "该怎么下...";
        } else if (index == 4) {
            p1 = "...";
        } else {

        }
        return p1;
    },

    getDone() {
        //10秒出  20秒出
        let index = Math.floor(Math.random() * 20);
        let p1 = "";

        if (index == 0) {
            p1 = "轮到你了";
        } else if (index == 1) {
            p1 = "该你了";
        } else {

        }
        return p1;
    },

    playChat(type) {
        if (appContext.getGameManager().soloPlay) {
            //no chat in solo mode
            return;
        }

        let isSelf = this.getCurrentPlayerIsSelf();
        if (Math.random() > 0.91) {
            let phrase = this.getOpening();
            this.getGameWindow().playChat(isSelf, phrase.p1);
            this.scheduleOnce(function () {
                this.getGameWindow().playChat(!isSelf, phrase.p2);
            }, 3);

            return;
        }

        switch (type) {
            case "think1":
            case "think2":
                this.getGameWindow().playChat(isSelf, this.getThink());
                break;

            case "hurry":
                this.getGameWindow().playChat(isSelf, this.getHurry());
                break;

            case "done":
                this.getGameWindow().playChat(isSelf, this.getDone());
                break;
        }
    },

    notifyReplyChat(type) {
        if (this.game != null && this.game.opponentPlayer != null) {
            this.game.opponentPlayer.replyChat(type);
        }
    }
});