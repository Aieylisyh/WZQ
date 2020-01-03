let StringUtil = require("StringUtil");
let LoadResPath = require("LoadResPath");
let GameUtil = require("GameUtil");

cc.Class({
    extends: cc.Component,

    properties: {
        headIconImg: cc.Sprite,

        nicknameLabel: cc.Label,

        gradeLabel: cc.Label,

        rankingImg: cc.Sprite,

        rankLabel: cc.Label,
    },

    bindData: function (data) {
        this.reset();
        if (data == null) {
            return;
        }

        // 昵称todo
        let nickname = data.nickname;
        if (StringUtil.isNotEmpty(nickname)) {
            this.nicknameLabel.string = nickname;
        }

        // 胜场todo
        let grade = data.grade + "";
        if (StringUtil.isNotEmpty(grade)) {
            this.gradeLabel.string = grade;
        }

        // 排行todo
        let rank = data.rank;
        if (rank > 3) {
            this.rankLabel.string = rank;
            this.rankLabel.node.active = true;
        } else {
            this.rankingImg.node.active = true;
            let rankImgPath = this.getRankImgPath(rank);
            this.setRankImg(rankImgPath);
        }

        // 头像todo
        let headIconUrl = data.headIconUrl;
        // 性别todo(背景图片自带男默认图像)
        let sex = data.sex;
        GameUtil.setHeadIconImg(headIconUrl, this.headIconImg, defaultIconPath);
    },

    reset: function () {
        this.headIconImg.spriteFrame = null;
        this.nicknameLabel.string = "";
        this.gradeLabel.string = "";
        this.rankingImg.spriteFrame = null;
        this.rankingImg.node.active = false;
        this.rankLabel.string = "";
        this.rankLabel.node.active = false;
    },

    // 设置排行榜图片
    setRankImg: function (rankImgPath) {
        if (StringUtil.isEmpty(rankImgPath)) {
            return;
        }

        appContext.getFileManager().applySpriteSafe(rankImgPath, this.rankingImg);
    },

    getRankImgPath: function (rank) {
        switch (rank) {
            case 1:
                return LoadResPath.ImgPath.rank1;

            case 2:
                return LoadResPath.ImgPath.rank2;

            case 3:
                return LoadResPath.ImgPath.rank3;

            default:
                debug.log("无法匹配的排行：rank = " + rank);
                return "";
        }
    },
});
