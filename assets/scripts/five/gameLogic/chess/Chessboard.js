let ChessType = require("ChessType");

cc.Class({
    extends: cc.Component,

    properties: {
        boardSize: 588,

        div: 15,

        chessPool: require("ChessPool"),

        chessParent: cc.Node,

        chessChecker: require("ChessChecker"),//确认下棋组件

        chessMap: [],

        newChessEffect: cc.Node,

        winEff1: cc.Node,

        winEff2: cc.Node,

        winEff3: cc.Node,

        winEff4: cc.Node,
    },

    start() {
        this.divSize = this.boardSize / (this.div - 1);
        this.halfSize = this.boardSize * 0.5;

        this.chessMap = [];

        for (let x = 0; x < this.div; x++) {
            this.chessMap[x] = [];
            for (let y = 0; y < this.div; y++) {
                this.chessMap[x][y] = null;
            }
        }
    },

    //根据横纵路数获取坐标
    chessPointToPosition(x, y) {
        if (x < 0 || y < 0) {
            return null;
        }

        if (x > this.div || y > this.div) {
            return null;
        }

        return {
            x: x * this.divSize - this.halfSize,
            y: y * this.divSize - this.halfSize,
        };
    },

    //触点坐标到横纵路数
    positionToChessPoint(touchPos) {
        let pos = {};
        pos.x = this.convertTouchPosValue(touchPos.x);
        pos.y = this.convertTouchPosValue(touchPos.y);

        return pos;
    },

    convertTouchPosValue(v) {
        v = Math.min(v, this.halfSize);
        v = Math.max(v, -this.halfSize);
        v += this.halfSize;

        return Math.round(v / this.divSize);
    },

    setChessAt(x, y, type) {
        let current = this.chessMap[x][y];
        if (current != null) {
            if (current.type === ChessType.White) {
                this.chessPool.recycleWhiteChess(current);
            } else if (current.type === ChessType.Black) {
                this.chessPool.recycleBlackChess(current);
            } else {
                debug.log("unexpected Chess");
                debug.log(current);
            }
        }

        let c = this.getNewChess(type);
        this.chessMap[x][y] = c;

        if (c == null) {
            return;
        }

        c.x = x;
        c.y = y;
        c.type = type;

        c.node.parent = this.chessParent;
        let pos = this.chessPointToPosition(x, y);
        c.node.x = pos.x;
        c.node.y = pos.y;
    },

    getNewChess(type) {
        if (type === ChessType.White) {
            return this.chessPool.getWhiteChess();
        } else if (type === ChessType.Black) {
            return this.chessPool.getBlackChess();
        }

        return null;
    },

    toggleChessChecker(isActive = true) {
        this.chessChecker.node.active = isActive;
    },

    placeChessChecker(touchPos) {
        //这里的来回转化是必须的
        let point = this.positionToChessPoint(touchPos);
        if (this.chessChecker.node.x == point.x && this.chessChecker.node.y == point.y) {
            return;
        }

        let current = this.chessMap[point.x][point.y];//落子在已有的棋子 显示禁止
        if (current != null) {
            this.chessChecker.setDemoChess(ChessType.Forbidden);
            this.chessChecker.setCommitBtn(false);
        } else {
            this.chessChecker.setDemoChess();//传空的参数，恢复demo棋子
            this.chessChecker.setCommitBtn();
        }

        this.toggleChessChecker();
        this.chessChecker.x = point.x;//这是设置内存不是显示位置，不加.node
        this.chessChecker.y = point.y;

        let pos = this.chessPointToPosition(point.x, point.y);
        this.chessChecker.node.x = pos.x;
        this.chessChecker.node.y = pos.y;
    },

    setChessChecker(cross, demo, commit) {
        this.chessChecker.toggleCheckCross(cross);
        this.chessChecker.toggleDemoChess(demo);
        this.chessChecker.toggleCommitBtn(commit);
    },

    clearBoard: function () {
        this.toggleChessChecker(false);
        this.toggleNewChessEffect(false);

        for (let x = 0; x < this.div; x++) {
            for (let y = 0; y < this.div; y++) {
                this.setChessAt(x, y);
            }
        }
    },

    toggleNewChessEffect(isActive = true) {
        this.newChessEffect.active = isActive;
    },

    placeNewChessEffect(x, y) {
        if (this.newChessEffect.x == x && this.newChessEffect.y == y) {
            return;
        }

        let pos = this.chessPointToPosition(x, y);
        this.newChessEffect.x = pos.x;
        this.newChessEffect.y = pos.y;

        //appContext.getWindowManager().shakeWindow(0.2);
    },

    playWinEffect() {
        appContext.getWindowManager().shakeWindow(1);
        this.winEff1.scale = 0;
        this.winEff2.scale = 0;
        this.winEff3.scale = 0;
        this.winEff4.scale = 0;
        this.winEff1.active = true;
        this.winEff2.active = true;
        this.winEff3.active = true;
        this.winEff4.active = true;
        let action1 = cc.scaleTo(0.1, 1, 1);
        let action2 = cc.scaleTo(0.3, 15, 0.5);
        let action3 = cc.scaleTo(0.2, 0, 0);
        this.winEff1.runAction(cc.sequence(cc.delayTime(0.4), action1, action2, action3, cc.delayTime(0.4), action1, action2, action3));
        this.winEff2.runAction(cc.sequence(cc.delayTime(0.6), action1, action2, action3, cc.delayTime(0.4), action1, action2, action3));
        this.winEff3.runAction(cc.sequence(cc.delayTime(0.8), action1, action2, action3, cc.delayTime(0.4), action1, action2, action3));
        this.winEff4.runAction(cc.sequence(cc.delayTime(1.0), action1, action2, action3, cc.delayTime(0.4), action1, action2, action3));
    },
});