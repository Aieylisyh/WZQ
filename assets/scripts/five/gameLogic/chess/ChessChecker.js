let ChessType = require("ChessType");

cc.Class({
    extends: cc.Component,

    properties: {
        checkCross: require("ChessCheckerCross"),//十字准星

        //checkCross: cc.Node,//十字准星

        commitBtn: cc.Node, //打钩按钮

        demoChess: cc.Node, //预览棋子

        deplacementSprite: cc.Sprite, //移动棋子

        deplacementSpriteFrame1: cc.SpriteFrame, //移动棋子
        deplacementSpriteFrame2: cc.SpriteFrame, //移动棋子

        demoSprite: cc.Sprite,

        whiteChessSpriteFrame: cc.SpriteFrame,

        blackChessSpriteFrame: cc.SpriteFrame,

        forbiddenSpriteFrame: cc.SpriteFrame,

        correctSpriteFrame: cc.SpriteFrame,

        commitBtnSprite: cc.Sprite,
    },

    toggleCheckCross: function (isActive = true, isBlack) {
        this.checkCross.node.active = isActive;
        if (isActive) {
            this.checkCross.SetBlack(isBlack);
        }
    },

    toggleDeplacement: function (isActive = true, animTime = 1) {
        this.deplacementSprite.node.active = isActive;

        if (isActive) {
            this.deplacementSprite.node.stopAllActions();
            var action = cc.sequence(
                cc.callFunc(function () {
                    this.changeDeplacement1();
                }, this),
                cc.delayTime(0.25),
                cc.callFunc(function () {
                    this.changeDeplacement2();
                }, this),
                cc.delayTime(0.25),
            ).repeat(animTime);
            this.deplacementSprite.node.runAction(action)
        }
    },

    changeDeplacement1() {
        this.deplacementSprite.spriteFrame = this.deplacementSpriteFrame1;
    },
    changeDeplacement2() {
        this.deplacementSprite.spriteFrame = this.deplacementSpriteFrame2;
    },

    toggleCommitBtn: function (isActive = true) {
        this.commitBtn.active = isActive;
    },

    toggleDemoChess: function (isActive = true) {
        this.demoChess.active = isActive;
    },

    setDemoChess: function (type) {
        if (type == null) {
            if (appContext.getGameManager().game.currentChessType == 1) {
                type = ChessType.Black;
            } else {
                type = ChessType.White;
            }
        }

        let cbm = appContext.getGameManager().chessboardManager;
        if (!cbm.deplacing && appContext.getGameManager().moveChessPlay && type == ChessType.Forbidden) {
            this.toggleDeplacement(true, 3);
        } else {
            this.toggleDeplacement(false);
        }

        if (type == ChessType.Black) {
            this.demoSprite.spriteFrame = this.blackChessSpriteFrame;
        } else if (type == ChessType.White) {
            this.demoSprite.spriteFrame = this.whiteChessSpriteFrame;
        } else if (type == ChessType.Forbidden) {
            this.demoSprite.spriteFrame = this.forbiddenSpriteFrame;
        } else if (type == ChessType.Null) {
            this.demoSprite.spriteFrame = null;
        }
    },

    setCommitBtn: function (isCorrect = true) {
        this.commitBtnIsCorrect = isCorrect;
        this.commitBtnSprite.spriteFrame = isCorrect ? this.correctSpriteFrame : this.forbiddenSpriteFrame;
    },
});