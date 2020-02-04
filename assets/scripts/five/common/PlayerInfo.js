
let StringUtil = require("StringUtil");
let LoadResPath = require("LoadResPath");
let GameUtil = require("GameUtil");
let Grade = require("Grade");

// 此组件多地方通用(目前是MainWindow和PlayerInfoDialog)，删除属性时需检查下
cc.Class({
    extends: cc.Component,

    properties: {
        headIconImg: cc.Sprite,  // 头像

        sexTagImg: cc.Sprite, // 性别图片

        nicknameLabel: cc.Label, // 昵称

        maxKeepWinLabel: cc.Label, // 最高连胜

        crtKeepWinLabel: cc.Label, // 连胜

        winRateLabel: cc.Label, // 胜率

        winCountLabel: cc.Label, // 胜场

        roundCountLabel: cc.Label, // 总场次

        winHandLabel: cc.Label, // 平均对局回合

        gradeLevelLabel: cc.Label, // 段位

        gradeNameLabel: cc.Label, // 段位

        gradeScoreLabel: cc.Label, // 段位积分


        gradePB: cc.ProgressBar,

        gradePBTop: cc.Label,

        gradePBBottom: cc.Label,

        gradeIcon: cc.Sprite,
    },

    setup: function (user) {
        if (user == null) {
            return;
        }

        let sex = user.basic.sex;
        if (this.sexTagImg != null) {
            let sexTagPath = sex === 1 ? LoadResPath.ImgPath.boyTag : LoadResPath.ImgPath.girlTag;
            appContext.getFileManager().applySpriteSafe(sexTagPath, this.sexTagImg);
        }

        if (this.headIconImg != null) {
            // let w = this.headIconImg.node.width;
            // let h = this.headIconImg.node.height;
            if (user.basic.headIconRawUrl != null && typeof user.basic.headIconRawUrl == "string") {
                GameUtil.applyHeadIcon(user.basic.headIconRawUrl, this.headIconImg);

            } else {
                GameUtil.setHeadIcon(user.basic.headIconUrl, user.basic.headIconPath, this.headIconImg);
            }
            // this.headIconImg.node.width = w;
            // this.headIconImg.node.height = h;
        }

        if (this.nicknameLabel != null) {
            let nickname = user.basic.nickname;
            if (StringUtil.isNotEmpty(nickname)) {
                this.nicknameLabel.string = StringUtil.trimString(nickname, 10);
            }
        }

        if (this.maxKeepWinLabel != null) {
            this.maxKeepWinLabel.string = user.basic.maxKeepWin || 0;
        }
        if (this.crtKeepWinLabel != null) {
            this.crtKeepWinLabel.string = user.basic.crtKeepWin || 0;
        }

        let winCount = user.basic.winCount;
        let roundCount = user.basic.roundCount;
        if (this.winRateLabel != null) {
            let winRate = Math.round((winCount / roundCount) * 100);
            this.winRateLabel.string = (winRate || 100) + "%";
        }
        if (this.winCountLabel != null) {
            this.winCountLabel.string = winCount;
        }
        if (this.roundCountLabel != null) {
            this.roundCountLabel.string = roundCount;
        }
        if (this.winHandLabel != null) {
            let winHand = Math.round(user.basic.totalHands / roundCount);
            if (!winHand) {
                winHand = 0;
            }
            this.winHandLabel.string = winHand;
        }


        let gradeAndFillInfo = Grade.getGradeAndFillInfoByScore(user.basic.currentScore);
        let gradeInfo = Grade.getGradeInfo(gradeAndFillInfo.grade);
        if (this.gradeLevelLabel != null) {
            this.gradeLevelLabel.string = gradeAndFillInfo.grade;
        }

        if (this.gradeNameLabel != null) {
            this.gradeNameLabel.string = gradeInfo.name;
        }


        if (this.gradeScoreLabel != null) {
            this.gradeScoreLabel.string = gradeAndFillInfo.fillAmount;
        }

        if (this.gradePBTop != null) {
            this.gradePBTop.string = gradeAndFillInfo.fillTop;
        }

        if (this.gradePBBottom != null) {
            this.gradePBBottom.string = gradeAndFillInfo.fillBottom;
        }

        if (this.gradePB != null) {
            let v = gradeAndFillInfo.fillAmount / gradeInfo.exp;
            if (!v) {
                v = 0;
            } else if (v > 1) {
                v = 1;
            }

            this.gradePB.value = gradeAndFillInfo.fillAmount / gradeInfo.exp;
        }

        this.setGradeIcon(gradeInfo.imgPath);
    },

    setGradeIcon(imgPath) {
        if (this.gradeIcon != null) {
            appContext.getFileManager().applySpriteSafe(imgPath, this.gradeIcon);
        }
    },

    notifyClick() {
        if (this.nicknameLabel != null) {
            let s = this.nicknameLabel.string;

            if (StringUtil.isEmpty(s) || s == "我") {
                this.nicknameLabel.string = "点此修改信息";
            }
        }
    },
});
