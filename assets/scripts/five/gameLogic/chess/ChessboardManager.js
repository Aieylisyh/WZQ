let ChessType = require("ChessType");

cc.Class({
    extends: cc.Component,

    properties: {
        _locked: true,

        chessboard: require("Chessboard"),

        touchOffset: 84,
    },


    start() {
        appContext.getGameManager().chessboardManager = this;
        appContext.getGameManager().onGameWindowReady();
        this.deplacing = false;
    },

    setState(s) {
        this._state = s;
    },

    onTouchStart: function (touchPos) {
        if (this._locked) {
            return;
        }

        touchPos.y += this.touchOffset;
        this.chessboard.placeChessChecker(touchPos);
        let muteCross = appContext.getGameSettingManager().getMuteCross();
        this.chessboard.setChessChecker(!muteCross, true, false);
        //if (appContext.getGameManager().game.currentChessType == appContext.getGameManager().game.selfPlayer.chessType
    },

    onTouchMove: function (touchPos) {
        if (this._locked) {
            return;
        }

        touchPos.y += this.touchOffset;

        this.chessboard.placeChessChecker(touchPos);
    },

    onTouchEnd: function (touchPos) {
        if (this._locked) {
            return;
        }

        touchPos.y += this.touchOffset;
        let game = appContext.getGameManager().game;
        let current = this.chessboard.getCurrentChessByPos(touchPos);

        if (!this.deplacing && current != null && appContext.getGameManager().moveChessPlay) {
            debug.log("deplaceStart");
            this.deplaceStart(current);
            this.onTouchStart(touchPos);
            return;
        }

        if (this.deplacing && current == null) {
            debug.log("deplaceEnd");
            this.deplaceEnd(this.chessboard.positionToChessPoint(touchPos));
            return;
        }

        //debug.log("ConfirmChess");
        let muteConfirmChess = appContext.getGameSettingManager().getMuteConfirmChess();
        if (muteConfirmChess) {
            //不显示chess checker直接下
            if (current == null) {
                this.commitChessAt(this.chessboard.chessChecker.x, this.chessboard.chessChecker.y, appContext.getGameManager().game.currentChessType);
            }
        } else {
            //显示chess checker
            this.chessboard.setChessChecker(false, true, true);
        }

        //if (appContext.getGameManager().game.currentChessType == game.selfPlayer.chessType
    },

    deplaceStart(current) {
        //debug.log("deplaceStart");
        //debug.log(current);
        this.deplacing = true;
        this.crtDeplacing = current;
        this.chessboard.toggleNewChessEffect(false);

        let game = appContext.getGameManager().game;
        this.chessboard.chessChecker.setDemoChess(
            current.type == 1 ? ChessType.Black : ChessType.White);
        this.chessboard.setChessAt(current.x, current.y);
        if (game.currentChessType == game.selfPlayer.chessType) {
            //自己的回合
        } else {
            //对方的回合
            if (!appContext.getGameManager().soloPlay) {
                //摆棋模式
                game.opponentPlayer.clearTask();//如果对方是ai下棋，则需要打断ai的计时器
            }
        }

        this.chessboard.toggleNewChessEffect(false);

        //吐槽
        let w = appContext.getWindowManager().currentWindowNode;
        let gw = w.getComponent("GameWindow");
        if (gw != null) {
            gw.deplaceChat();
        }
    },

    deplaceEnd(pos) {
        //新的棋子特效移动到新的位置
        //debug.log("deplaceEnd");
        this.deplacing = false;
        this.chessboard.toggleChessChecker(false);
        this.chessboard.setChessAt(pos.x, pos.y, this.crtDeplacing.type, this.crtDeplacing.index);
        this.chessboard.placeNewChessEffect(pos.x, pos.y);
        this.chessboard.toggleNewChessEffect(true);
        this.crtDeplacing = null;
    },

    clearBoard: function () {
        this.chessboard.clearBoard();
        this.deplacing = false;
        this.crtDeplacing = null;
    },

    setLocked: function (locked) {
        this._locked = locked;
    },

    playWinEffect() {
        this.chessboard.playWinEffect();
    },

    //提交一步棋
    commitChessAt: function (x, y, type) {
        let game = appContext.getGameManager().game;
        this.chessboard.toggleChessChecker(false);
        //debug.log("commitChessAt" + x + " " + y + " " + game.currentTurn);
        this.chessboard.setChessAt(x, y, type, game.currentTurn);
        this.chessboard.toggleNewChessEffect(true);
        this.chessboard.placeNewChessEffect(x, y);

        appContext.getGameManager().playChat("done");
        //向GameManager提交一步棋，发送当前盘面和当前走棋的type给对手，等待对手的回复
        this.chessboard.toggleChessChecker(false);
        appContext.getGameManager().commitBoard(this.chessboard.chessMap, type);
    },

    onClickCommit: function () {
        if (this.chessboard.chessChecker.commitBtnIsCorrect === true) {
            //this.commitChessAt(this.chessboard.chessChecker.x, this.chessboard.chessChecker.y, this.myChessType);
            let game = appContext.getGameManager().game;

            if (game && game.selfPlayer) {
                game.selfPlayer.makeDecision(this.chessboard.chessChecker.x, this.chessboard.chessChecker.y, game.currentChessType);
            }
        } else {
            debug.log("不能在这里落子！");
        }
    },
});