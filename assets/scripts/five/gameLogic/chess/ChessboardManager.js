cc.Class({
    extends: cc.Component,

    properties: {
        _locked: true,

        chessboard: require("Chessboard"),

        touchOffset: 84,

        myChessType: {
            get: function () {
                return this._myChessType;
            },
            visible: false,
        },
    },

    start() {
        appContext.getGameManager().chessboardManager = this;
        appContext.getGameManager().onGameWindowReady();
    },

    setState(s) {
        this._state = s;
    },

    setMyChessType: function (isBlack = true) {
        if (isBlack) {
            this._myChessType = 1;
        } else {
            this._myChessType = 2;
        }

        this.chessboard.chessChecker.setDemoChess(this._myChessType, true);
    },

    onTouchStart: function (touchPos) {
        if (this._locked) {
            return;
        }

        touchPos.y += this.touchOffset;

        this.chessboard.placeChessChecker(touchPos);
        this.chessboard.setChessChecker(true, true, false);
    },

    onTouchMove: function (touchPos) {
        if (this._locked) {
            return;
        }

        touchPos.y += this.touchOffset;

        this.chessboard.placeChessChecker(touchPos);
    },

    onTouchEnd: function (pos) {
        if (this._locked) {
            return;
        }

        this.chessboard.setChessChecker(false, true, true);
    },

    clearBoard: function () {
        this.chessboard.clearBoard();
    },

    setLocked: function (locked) {
        this._locked = locked;
    },

    playWinEffect(){
        this.chessboard.playWinEffect();
    },

    //提交一步棋
    commitChessAt: function (x, y, type) {
        this.chessboard.toggleChessChecker(false);
        this.chessboard.setChessAt(x, y, type);
        this.chessboard.toggleNewChessEffect(true);
        this.chessboard.placeNewChessEffect(x, y);

        //向GameManager提交一步棋，发送当前盘面和当前走棋的type给对手，等待对手的回复
        appContext.getGameManager().playChat("done");
        appContext.getGameManager().commitBoard(this.chessboard.chessMap, type);
    },

    onClickCommit: function () {
        if (this.chessboard.chessChecker.commitBtnIsCorrect === true) {
            //this.commitChessAt(this.chessboard.chessChecker.x, this.chessboard.chessChecker.y, this.myChessType);
            let game = appContext.getGameManager().game;

            if (game && game.selfPlayer) {
                game.selfPlayer.makeDecision(this.chessboard.chessChecker.x, this.chessboard.chessChecker.y, this.myChessType);
            }
        } else {
            debug.log("不能在这里落子哦！");
        }
    },
});