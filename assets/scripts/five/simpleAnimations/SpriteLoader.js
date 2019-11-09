cc.Class({
    extends: cc.Component,

    properties: {
        sprite: cc.Sprite,

        resUrl: "",

        showTime: 0,

        delayTime: 0,

        applyWidget: false,

        importance: 1,//重要性：1为必定加载，2为中配加载 3为高配加载

        widget: cc.Widget,
    },

    onEnable: function () {
        if (this.sprite.spriteFrame != null && this.node.opacity < 255) {
            let action = cc.fadeTo(this.showTime, 255);
            this.node.runAction(action);
        } else {
            this.delayTime = 0;
        }
    },

    start: function () {
        if (this.importance == 3 && !WechatAPI.deviceManager.lessImpBigImage) {
            this.done = true;
            return;
        }
        if (this.importance == 2 && !WechatAPI.deviceManager.impbigImage) {
            this.done = true;
            return;
        }
        this.retryTimes = 1;
        this.done = false;
    },

    update: function (dt) {
        if (this.done) {
            return;
        }

        if (this.delayTime < 0) {
            return;
        }

        this.delayTime -= dt;
        if (this.delayTime <= 0) {
            this.loadImage();
        }
    },

    loadImage: function () {
        let doneTraitment = {};
        doneTraitment.autoApply = this.showTime <= 0 ? true : false;
        doneTraitment.callback = this.applyImage;
        doneTraitment.caller = this;
        appContext.getFileManager().applySpriteSafe(this.resUrl, this.sprite, doneTraitment, true, 20);
    },

    applyImage: function (loadedSpriteFrame) {
        if (this == null || this.node == null) {
            return;
        }

        if (loadedSpriteFrame == null) {
            if (this.retryTimes > 0) {
                this.retryTimes--;
                this.delayTime = 1;
            }
            return;
        }

        if (this.showTime <= 0 || !WechatAPI.deviceManager.miscBasic) {
            this.sprite.spriteFrame = loadedSpriteFrame;
        } else {
            this.node.opacity = 0;
            this.sprite.spriteFrame = loadedSpriteFrame;
            let action = cc.fadeTo(this.showTime, 255);
            this.node.runAction(action);
        }
        if (this.applyWidget && this.widget) {
            this.widget.updateAlignment();
        }
        this.done = true;
    },
});