let DialogTypes = require("DialogTypes");
let PlayerInfo = require("PlayerInfo");

cc.Class({
    extends: require("BaseDialog"),

    properties: {
        rankItemPrefab: cc.Prefab,

        rankItemsContainer: cc.Node,

        playerinfo: PlayerInfo,

        //rankDay: "",//今日上升超过百分之多少

        superPassLabel: cc.Label,//总排名超过百分之多少
    },

    show: function () {
        this.fadeInBackground();
        this.fastShowAnim();

        let user = appContext.getUxManager().getUserInfo();
        this.playerinfo.setup(user);

        let score = user.basic.currentScore;
        this.superPassLabel.string = this.getSuperpass(score);
    },

    onAnimComplete: function () {
        this.showRanks();
    },

    showRanks: function () {
        //
        // selfRankItem
        // let rankList = null;
        // for (let i = 0; i < rankList.length; i++) {
        //     let rankData = rankList[i];
        //     rankData.rank = i + 1;

        //     let rankObj = cc.instantiate(this.rankItemPrefab);
        //     this.rankItemsContainer.addChild(rankObj);
        //     let rankItemComp = rankObj.getComponent("RankItem");
        //     rankItemComp.bindData(rankData);

        //     if (rankData.isSelf) {
        //         this.selfRankItem.bindData(rankData);
        //     }
        // }
        for (let i = 1; i < 11; i++) {
            this.scheduleOnce(function () {
                let rankObj = cc.instantiate(this.rankItemPrefab);
                this.rankItemsContainer.addChild(rankObj);
                let rankItemComp = rankObj.getComponent("RankItem");
                rankItemComp.setup(i);
            }, 0.2 * (i - 1));
        }
    },

    onClickQuestion: function () {
        appContext.getSoundManager().playBtn();
        let info = {
            content: "\n对决的记忆，胜负都早已是往日烟云\n\n一场场对弈，已成为棋力进步的阶梯",
        };
        info.hideCloseBtn = true;
        appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, info);

    },

    onClickInfo: function () {
        appContext.getDialogManager().showDialog(DialogTypes.PlayerInfo);
    },

    getSuperpass: function (score) {
        //积分9900差不多可以几乎登顶
        let f = score / 10000;
        f = Math.sqrt(f);//开根号提高排名

        let superpass = Math.floor(f * 1000);

        if (superpass > 999) {
            superpass = 999;
        }
        if (superpass < 1) {
            superpass = 1;
        }
        return superpass / 10;
    },
});
