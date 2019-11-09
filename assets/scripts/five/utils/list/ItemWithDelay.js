cc.Class({
    extends: require("ListItem"),

    properties: {
        bindDataDelay: 0,

        bindDataDelayCount: -1,
    },

    bindData: function (currentIndex, data) {
        this.currentIndex = currentIndex;
        this.data = data;

        this.onApplyDataInstant(currentIndex, data);
        this.bindDataDelayCount = this.bindDataDelay;
    },

    onApplyDataInstant: function (currentIndex, data) {
    },

    onApplyDataDelayed: function (currentIndex, data) {
    },

    showUpAction: function () {
        this.node.scale = 0.6;
        let action = cc.scaleTo(0.3, 1, 1).easing(cc.easeCubicActionOut());
        this.node.runAction(action);
    },

    update: function (dt) {
        if (this.bindDataDelayCount >= 0) {
            this.bindDataDelayCount -= dt;
            if (this.bindDataDelayCount < 0) {
                this.onApplyDataDelayed(this.currentIndex, this.data);
            }
        }
    },

    getData: function () {
        return this.data;
    },
});