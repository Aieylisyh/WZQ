let GameUtil = require("GameUtil");

cc.Class({
    extends: require("BaseDialog"),

    properties: {
        gradeIconImg: cc.Sprite,

        gradeLevelLabel: cc.Label,

        currentScoreLabel: cc.Label,
    },

    show: function (info) {
        this.fadeInBackground();
        this.fastShowAnim();
    },

    onAnimComplete: function () {
        let user = GameUtil.getUserFromDataContainer();

        let gardeIconImgPath = "";
        appContext.getFileManager().applySpriteSafe(gardeIconImgPath, this.gradeIconImg);

        let level = "";
        this.gradeLevelLabel.string = level;

        let currentScore = "";
        this.currentScoreLabel.string = currentScore;
    },

    // 点击"返回"按钮
    onClickBtnBack: function () {
        // todo
        this.hide();
    },
});
