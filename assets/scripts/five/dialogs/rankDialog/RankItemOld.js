let StringUtil = require("StringUtil");

cc.Class({
    extends: cc.Component,

    properties: {
        rankingImg: cc.Sprite,

        rankLabel: cc.Label,

        playerinfo: require("PlayerInfo"),
    },

    setRank(rank) {
        // 排行todo
        if (rank > 3) {
            this.rankLabel.string = rank;
            this.rankLabel.node.active = true;
            this.rankingImg.node.active = false;
        } else {
            if (this.setRankImg(rank)) {
                this.rankingImg.node.active = true;
                this.rankLabel.node.active = false;
            } else {
                this.rankLabel.string = rank;
                this.rankLabel.node.active = true;
                this.rankingImg.node.active = false;
            }
        }
    },

    setInfo(isSelf, data) {
        this.isSelf = isSelf;
        if (isSelf) {
            this.playerinfo.setup(appContext.getUxManager().getUserInfo());
        } else {
            this.playerinfo.setup(data);
        }
    },

    // 设置排行榜图片
    setRankImg: function (rank) {
        let rankImgPath = "";
        switch (rank) {
            case 1:
                rankImgPath = "images/rankImg/rank1";

            case 2:
                rankImgPath = "images/rankImg/rank2";

            case 3:
                rankImgPath = "images/rankImg/rank3";

            default:
                debug.log("无法匹配的排行： " + rank);
        }

        if (StringUtil.isEmpty(rankImgPath)) {
            return false;
        }

        appContext.getFileManager().applySpriteSafe(rankImgPath, this.rankingImg);
        return true;
    },
});
