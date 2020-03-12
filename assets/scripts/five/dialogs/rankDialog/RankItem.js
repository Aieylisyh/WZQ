// let StringUtil = require("StringUtil");
let Grade = require("Grade");


cc.Class({
    extends: cc.Component,

    properties: {
        winCountLabel: cc.Label,

        combatCountLabel: cc.Label,

        gradeLabel: cc.Label,

        gradeIcon: cc.Sprite,
    },

    start() {
        this.node.scale = 0.5;
        this.runAction(cc.scaleTo(0.6, 1, 1).easing(cc.easeCubicActionOut()));
    },

    setup(grade) {
        let gradeInfo = Grade.getGradeInfo(grade);

        appContext.getFileManager().applySpriteSafe(gradeInfo.imgPath, this.gradeIcon);
        this.gradeLabel.string = "对决\n  " + gradeInfo.name;

        let winCount = 0;
        let combatCount = 0;
        let rankInfo = appContext.getUxManager().gameInfo.rankInfo;
        if (rankInfo != null) {
            winCount = rankInfo["winCount_" + grade];
            combatCount = rankInfo["combatCount_" + grade];
        }

        if (!winCount) {
            winCount = 0;
        }
        if (!combatCount) {
            combatCount = 0;
        }
        this.combatCountLabel.string = combatCount;
        this.winCountLabel.string = winCount;
    },
});
