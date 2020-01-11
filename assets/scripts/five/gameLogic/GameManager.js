let SelfPlayer = require("SelfPlayer");
let Ai = require("Ai");
let DialogTypes = require("DialogTypes");

cc.Class({
    extends: cc.Component,

    properties: {
        game: {
            default: null,
        },
    },

    update: function(dt) {
        if (this.game == null ||
            this.game.player1 == null ||
            this.game.player2 == null) {
            return;
        }

        this.game.player1.onUpdate(dt);
        this.game.player2.onUpdate(dt);
    },

    start: function() {
        this.game = null;
        window.gm = this;

        this.initSelfPlayer();
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

    initSelfPlayer: function() {
        if (this.selfPlayer != null) {
            debug.log(this.selfPlayer);
            return;
        }

        //TODO read localStorage
        this.selfPlayer = new SelfPlayer(appContext.getUxManager().getUserInfo());
    },

    //根据远程得到的结果生成本地的棋局
    //player1 玩家1
    //player2 玩家2
    //randomSeed 随机种子，主要用于决定先手，也可用于其他需要两边一致的随机
    //gameConfig 棋局设置，什么场，什么游戏模式等等
    createGame: function(player1, player2, randomSeed, gameConfig) {
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

    playerGrabFirst: function(index, grab) {
        if (index == 1) {
            this.game.player1GrabFirst = grab;
            if (this.game.opponentPlayer.index == 1) {
                if (grab) {
                    appContext.getDialogManager().showDialog(DialogTypes.Toast, "对手抢先手");
                } else {
                    appContext.getDialogManager().showDialog(DialogTypes.Toast, "对手不抢先手");
                }
            }
        } else {
            this.game.player2GrabFirst = grab;
            if (this.game.opponentPlayer.index == 2) {
                if (grab) {
                    appContext.getDialogManager().showDialog(DialogTypes.Toast, "对手抢先手");
                } else {
                    appContext.getDialogManager().showDialog(DialogTypes.Toast, "对手不抢先手");
                }
            }
        }

        if (this.game.player1GrabFirst != null && this.game.player2GrabFirst != null) {
            this.startPlay();
        }
    },

    startGame: function() {
        debug.log("!!startGame");
        if (this.chessboardManager == null || this.chessboardManager.node == null || !this.chessboardManager.node.isValid) {
            return false;
        }

        this.chessboardManager.clearBoard();
        this.game.chessMap = this.chessboardManager.chessboard.chessMap;

        this.game.selfPlayer.notifyGrabFirst();
        this.game.opponentPlayer.notifyGrabFirst();

        appContext.getDialogManager().showDialog(DialogTypes.Toast, "正在问对面是否抢先手...");
        debug.log("!!正在问对面是否抢先手");
        //this.playerWin(1);
        return true;
    },

    startPlay: function() {
        debug.log("!!startPlay");
        if (this.chessboardManager == null || this.chessboardManager.node == null || !this.chessboardManager.node.isValid) {
            return false;
        }

        this.setupFirstPlay();
        if (this.game.firstIsSelfPlayer) {
            this.chessboardManager.setMyChessType(true);
        } else {
            this.chessboardManager.setMyChessType(false);
        }

        this.game.currentTurn = 0;
        this.startNextTurn(2);

        return true;
    },

    //提交当前的场面
    commitBoard: function(chessMap, lastChessType) {
        this.game.chessMap = chessMap;

        let winRes = Ai.checkWin(lastChessType);

        if (winRes && winRes.win) {
            this.playerWin(lastChessType);
            this.chessboardManager.setLocked(true);
        } else {
            this.startNextTurn(lastChessType);
        }
    },

    startNextTurn: function(lastChessType) {
        this.game.currentChessType = 3 - lastChessType;
        this.game.currentTurn++;

        if (this.game.firstIsSelfPlayer && this.game.currentChessType === 1 ||
            !this.game.firstIsSelfPlayer && this.game.currentChessType === 2) {
            this.game.selfPlayer.notifyPlay();
        } else {
            this.game.opponentPlayer.notifyPlay();
        }
    },

    playerWin: function(winnerType, isLooserOffline = false, isSurrender = false) {
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

        //TODO
        /*  info.chestInfo = {
              chest0: {
                  text: "大奖",
                  resUrl: "images/rankImg/rank1",
              },
              chest1: null,
              chest2: {
                  text: "参与奖",
                  resUrl: "images/rankImg/rank2",
              },
          };*/

        info.gradeExp = 1234; //TODO

        appContext.getDialogManager().showDialog(DialogTypes.RoundEnd, info);
        this.chessboardManager.setLocked(true);
        this.clearPlayers();
    },

    clearPlayers: function() {
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

    setupFirstPlay: function() {
        if (this.game == null) {
            return;
        }

        debug.log("setupFirstPlay");
        let firstIsPlayer1 = true;
        if (!this.game.player1GrabFirst && this.game.player2GrabFirst) {
            firstIsPlayer1 = false;
        } else if (this.game.player1GrabFirst && !this.game.player2GrabFirst) {
            firstIsPlayer1 = true;
        } else {
            if (this.game.player1GrabFirst && this.game.player2GrabFirst) {
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "双方都抢先手\n本局随机决定先手");
            }
            firstIsPlayer1 = this.game.randomSeed < 0.5;
        }

        this.game.firstIsPlayer1 = firstIsPlayer1;

        if (this.game.player1.isSelf() && firstIsPlayer1 ||
            this.game.player2.isSelf() && !firstIsPlayer1) {
            this.game.firstIsSelfPlayer = true;
            this.game.selfPlayer.setFirst(true);
            this.game.opponentPlayer.setFirst(false);
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "游戏开始\n本局由您先手", 1);
        } else {
            this.game.firstIsSelfPlayer = false;
            this.game.selfPlayer.setFirst(false);
            this.game.opponentPlayer.setFirst(true);
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "游戏开始\n本局由对面先手", 1);
        }
    },

    //更新当前的游戏，newGame中的每一条属性，都会覆盖当前的currentGame的对应属性。
    //如果不想覆盖，请不要让该属性存在，否则即便是null也会覆盖
    //可用于更新游戏状态，比如谁使用了先手卡
    updateCurrentGame: function(newGame) {
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

    onGetRemoteResponse: function(res) {
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
});