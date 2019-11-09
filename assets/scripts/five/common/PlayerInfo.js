let DataContainerUpdater = require("DataContainerUpdater");
let DataKey = require("DataKey");
let StringUtil = require("StringUtil");
let LoadResPath = require("LoadResPath");
let GameUtil = require("GameUtil");

// 此组件多地方通用(目前是MainWindow和PlayerInfoDialog)，删除属性时需检查下
cc.Class({
    extends: cc.Component,

    properties: {
        headIconImg: cc.Sprite,  // 头像

        sexTagImg: cc.Sprite, // 性别图片

        nicknameLabel: cc.Label, // 昵称

        maxKeepWinLabel: cc.Label, // 最高连胜

        winRateLabel: cc.Label, // 胜率

        winCountLabel: cc.Label, // 胜场

        roundCountLabel: cc.Label, // 总场次

        gradeLevelLabel: cc.Label, // 段位

        gradeScoreLabel: cc.Label, // 段位积分
    },

    start() {
        this.onUserUpdate();
    },

    onUserUpdate: function (user) {
        if (user == null) {
            return;
        }

        // todo
        let sex = user.sex;
        if (this.sexTagImg != null) {
            let sexTagPath = sex === 1 ? LoadResPath.ImgPath.boyTag : LoadResPath.ImgPath.girlTag;
            this.setSexTagImg(sexTagPath);
        }

        if (this.headIconImg != null) {
            // todo
            let headIconUrl = user.headIconUrl;
            let defaultIconPath = sex === 1 ? LoadResPath.ImgPath.boy_defaultHeadIcon : LoadResPath.ImgPath.girl_defaultHeadIcon;
            GameUtil.setHeadIconImg(headIconUrl, this.headIconImg, defaultIconPath);
        }

        if (this.nicknameLabel != null) {
            // todo
            let nickName = user.nickName;
            if (StringUtil.isNotEmpty(nickName)) {
                this.nicknameLabel.string = nickName;
            }
        }

        if (this.maxKeepWinLabel != null) {
            // todo
            let maxKeepWin = user.maxKeepWin;
            this.maxKeepWinLabel.string = maxKeepWin;
        }

        // todo
        let winCount = user.winCount;
        let roundCount = user.roundCount;
        if (this.winRateLabel != null) {
            let winRate = Math.round((winCount / roundCount) * 10000) / 100 + "%";
            this.winRate.string = winRate;
        }
        if (this.winCountLabel != null) {
            this.winCountLabel.string = winCount;
        }
        if (this.roundCountLabel != null) {
            this.roundCountLabel.string = roundCount;
        }

        if (this.gradeLevelLabel != null) {
            // todo
            let level = user.level;
            this.gradeLevelLabel.string = level;
        }

        if (this.gradeScoreLabel != null) {
            // todo
            let currentScore = user.currentScore;
            let totalScore = "200";
            this.gradeScoreLabel.string = currentScore + "/" + totalScore;
        }
    },

    setSexTagImg: function (sexTagPath) {
        if (StringUtil.isNotEmpty(sexTagPath)) {
            appContext.getFileManager().applySpriteSafe(sexTagPath, this.sexTagImg);
        }
    },
});
