let ChessType = require("ChessType");

cc.Class({
    extends: cc.Component,

    properties: {
        checkCross: cc.Node,//十字准星

        commitBtn: cc.Node, //打钩按钮

        demoChess: cc.Node, //预览棋子

        demoSprite: cc.Sprite,

        whiteChessSpriteFrame: cc.SpriteFrame,

        blackChessSpriteFrame: cc.SpriteFrame,

        forbiddenSpriteFrame: cc.SpriteFrame,

        correctSpriteFrame: cc.SpriteFrame,

        commitBtnSprite: cc.Sprite,
    },

    toggleCheckCross: function (isActive = true) {
        this.checkCross.active = isActive;
    },

    toggleCommitBtn: function (isActive = true) {
        this.commitBtn.active = isActive;
    },

    toggleDemoChess: function (isActive = true) {
        this.demoChess.active = isActive;
    },

    setDemoChess: function (type, cacheType = false) {
        if (cacheType) {
            this.demoType = type;
        }

        type = type || this.demoType;

        if (type == ChessType.Black) {
            this.demoSprite.spriteFrame = this.blackChessSpriteFrame;
        } else if (type == ChessType.White) {
            this.demoSprite.spriteFrame = this.whiteChessSpriteFrame;
        } else if (type == ChessType.Forbidden) {
            this.demoSprite.spriteFrame = this.forbiddenSpriteFrame;
        } else if (type == ChessType.Black) {
            this.demoSprite.spriteFrame = null;
        }
    },

    setCommitBtn: function (isCorrect = true) {
        this.commitBtnIsCorrect = isCorrect;
        this.commitBtnSprite.spriteFrame = isCorrect ?  this.correctSpriteFrame :  this.forbiddenSpriteFrame;
    },
});