cc.Class({
    extends: cc.Component,

    properties: {
        chessWhite: cc.Prefab,

        chessBlack: cc.Prefab,

        poolSize: 20,
    },

    start() {
        this.whiteChessPool = [];
        this.blackChessPool = [];
    },

    getWhiteChess() {
        let c = this.whiteChessPool.pop();
        if (c != null && c.node != null && c.node.isValid) {
            c.node.active = true;
            return c;
        }

        let chessNode = cc.instantiate(this.chessWhite);
        chessNode.chess = { node: chessNode };
        return chessNode.chess;
    },

    getBlackChess() {
        let c = this.blackChessPool.pop();
        if (c != null && c.node != null && c.node.isValid) {
            c.node.active = true;
            return c;
        }

        let chessNode = cc.instantiate(this.chessBlack);
        chessNode.chess = { node: chessNode };
        return chessNode.chess;
    },

    recycleWhiteChess(c) {
        if (c == null) {
            return;
        }

        if (this.whiteChessPool.length < this.poolSize) {
            this.whiteChessPool.push(c);
            c.node.active = false;
        } else {
            c.node.destroy();
        }
    },

    recycleBlackChess(c) {
        if (c == null) {
            return;
        }

        if (this.blackChessPool.length < this.poolSize) {
            this.blackChessPool.push(c);
            c.node.active = false;
        } else {
            c.node.destroy();
        }
    },
});