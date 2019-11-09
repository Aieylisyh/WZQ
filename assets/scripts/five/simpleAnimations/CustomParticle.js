cc.Class({
    extends: cc.Component,

    properties: {
        lifeTime: 5,
    },

    update: function (dt) {
        this.lifeTime -= dt;
        if (this.lifeTime < 0) {
            if (this.node) {
                this.node.destroy();
            }
        }
    },

    init:function(){

    },
});