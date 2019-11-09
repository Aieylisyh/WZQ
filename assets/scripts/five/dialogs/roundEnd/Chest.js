cc.Class({
    extends: cc.Component,

    properties: {
        contentSprite: cc.Sprite,

        contentLabel: cc.Label,

        chestNode: cc.Node,

        btn: cc.Button,

        contentNode: cc.Node,

        glow: cc.Node,
    },

    init: function (dialog, id) {
        console.log(id);
        this.dialog = dialog;
        this.id = id;

        this.timer = null;
        this.chestNode.active = true;
        this.chestNode.scale = 0.1;
        let action1 = cc.scaleTo(0.5, 1).easing(cc.easeBackOut());
        let action2 = cc.callFunc(function () {
            this.startAnimateChest();
        }, this);

        let seq = cc.sequence(action1, action2);
        this.chestNode.runAction(seq);
    },

    startAnimateChest: function () {
        this.timer = 0;
    },

    update: function (dt) {
        if (this.timer != null && this.chestNode.active) {
            this.timer += dt * 5;
            let f = Math.sin(this.timer) * 0.07;
            this.chestNode.scaleX = 1 + f;
            this.chestNode.scaleY = 1 - f;
        }
    },

    onClick: function () {
        if (this.dialog == null) {
            return;
        }

        this.dialog.onClickChest(this);
    },

    onOpen: function (hasGlow, info) {
        this.chestNode.active = false;
        this.contentNode.active = true;

        if (info == null) {
            this.contentLabel.string = "空箱子";
            return;
        }

        this.glow.active = hasGlow;
        this.contentLabel.string = info.text;
        appContext.getFileManager().applySpriteSafe(info.resUrl, this.contentSprite);
    },
});
