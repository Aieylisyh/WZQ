cc.Class({
    extends: require("BaseDialog"),

    properties: {
        rankItemPrefab: cc.Prefab,

        rankItemsContainer: cc.Node,

        selfRankItem: require("RankItem"),
    },

    show: function (info) {
        if (info == null) {
            return;
        }

        // 根据段位和积分排序todo
        let rankList = info.rankList;
        if (rankList != null && rankList.length > 0) {
            this.sortRankList(rankList);
            this.createRankItems(rankList);
        }

        this.resizeFrame();
        this.fadeInBackground();
        this.fastShowAnim();
    },

    sortRankList: function (rankList) {
        // TODO 暂定第1个是自己
        rankList[0].isSelf = true;

        rankList.sort(function (m, n) {
            let result = 1;
            if (m.grade > n.grade) {
                result = 1;
            } else if (m.grade < n.grade) {
                result = -1;
            } else if (m.grade === n.grade) {
                if (m.currentScore > n.currentScore) {
                    result = 1;
                } else if (m.currentScore < n.currentScore) {
                    result = -1;
                } else if (m.currentScore === n.currentScore) {
                    if (m.nickName >= n.nickName) {
                        result = 1;
                    } else {
                        result = -1;
                    }
                }
            }

            return result;
        });
    },

    createRankItems: function (rankList) {
        for (let i = 0; i < rankList.length; i++) {
            let rankData = rankList[i];
            rankData.rank = i + 1;

            let rankObj = cc.instantiate(this.rankItemPrefab);
            this.rankItemsContainer.addChild(rankObj);
            let rankItemComp = rankObj.getComponent("RankItem");
            rankItemComp.bindData(rankData);

            if (rankData.isSelf) {
                this.selfRankItem.bindData(rankData);
            }
        }
    },

    onClickBtnClose: function () {
        this.hide();
    },
});
