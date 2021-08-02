let ChessType = require("ChessType");

cc.Class({
    extends: cc.Component,

    properties: {
        checkCross:  require("ChessCheckerCross"),//十字准星

        //checkCross: cc.Node,//十字准星

        commitBtn: cc.Node, //打钩按钮

        demoChess: cc.Node, //预览棋子

        demoSprite: cc.Sprite,

        whiteChessSpriteFrame: cc.SpriteFrame,

        blackChessSpriteFrame: cc.SpriteFrame,

        forbiddenSpriteFrame: cc.SpriteFrame,

        correctSpriteFrame: cc.SpriteFrame,

        commitBtnSprite: cc.Sprite,
    },

    toggleCheckCross: function (isActive = true, isBlack) {
        this.checkCross.node.active = isActive;
        if(isActive){
            this.checkCross.SetBlack(isBlack);
        }
    },

    toggleCommitBtn: function (isActive = true) {
        this.commitBtn.active = isActive;
    },

    toggleDemoChess: function (isActive = true) {
        this.demoChess.active = isActive;
    },

    setDemoChess: function (type) {
        if (type==null) {
            if(appContext.getGameManager().game.currentChessType== 1){
                type = ChessType.Black;
            }else{
                type = ChessType.White;
            }
        }

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