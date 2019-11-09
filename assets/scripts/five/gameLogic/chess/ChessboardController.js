cc.Class({
    extends: cc.Component,

    properties: {
        chessboardManager: require("ChessboardManager"),

        targetNode:cc.Node,
    },

    // 注册触摸监听事件
    onEnable: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    },

    // 关闭触摸监听事件
    onDisable: function () {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    },

    onTouchStart: function () {
        let pos = this.targetNode.convertToNodeSpaceAR(arguments[0].touch.getLocation());
        this.chessboardManager.onTouchStart(pos);
    },

    onTouchMove: function () {
        let pos = this.targetNode.convertToNodeSpaceAR(arguments[0].touch.getLocation());
        this.chessboardManager.onTouchMove(pos);
    },

    onTouchEnd: function () {
        let pos = this.targetNode.convertToNodeSpaceAR(arguments[0].touch.getLocation());
        this.chessboardManager.onTouchEnd(pos);
    },
});
