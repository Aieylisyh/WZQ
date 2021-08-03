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
    },

    setState(s) {
        this._state = s;
    },

    onTouchStart: function (touchPos) {
        if (this._locked) {
            return;
        }

        touchPos.y += this.touchOffset;
        let game = appContext.getGameManager().game;
        this.chessboard.placeChessChecker(touchPos);
        if (appContext.getGameManager().game.currentChessType == game.selfPlayer.chessType) {
            //this.chessboard.setChessChecker(true, true, false);
            this.chessboard.setChessChecker(false, true, false);
        } else {
            this.chessboard.setChessChecker(false, true, false);
        }
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
        //推广需要版 不显示chess checker直接下
        debug.log("!!!onTouchEnd " + touchPos);
        let current = this.chessboard.getCurrentChessByPos(touchPos);
        debug.log(current);
        if (current == null) {
            debug.log("current == null");
            game.selfPlayer.makeDecision(this.chessboard.chessChecker.x, this.chessboard.chessChecker.y, appContext.getGameManager().game.currentChessType);
        }
        //显示chess checker
        //if(game.currentChessType == game.selfPlayer.chessType){
        //this.chessboard.setChessChecker(false, true, true);
        //}else{
        //game.selfPlayer.makeDecision(this.chessboard.chessChecker.x, this.chessboard.chessChecker.y, appContext.getGameManager().game.currentChessType);
        //}
    },

    clearBoard: function () {
        this.chessboard.clearBoard();
    },

    setLocked: function (locked) {
        this._locked = locked;
    },

    playWinEffect() {
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
                game.selfPlayer.makeDecision(this.chessboard.chessChecker.x, this.chessboard.chessChecker.y, appContext.getGameManager().game.currentChessType);
            }
        } else {
            debug.log("不能在这里落子哦！");
        }
    },
});