cc.Class({
    extends: cc.Component,

    properties: {
        resizeRef: cc.Node,

        frame: cc.Node, //面板主体图片对象

        frameBaseHeight: 100, //面板主体图片对象除了resizeRef额外的高度

        frameBaseWidth: 148, //面板主体图片对象除了resizeRef额外的宽度

        frameMinWidth: 300, //面板主体图片对象最小的宽度

        widgetSpecialAlign: cc.Widget,

        backgroundNode: cc.Node,

        backgroundBtn: cc.Button,

        clickBgClose: false,

        _isAnimComplete: false,

        bgOpacity: 180,
    },

    onDisable: function () {
        appContext.getDialogManager().onDialogHide(this.type);
        appContext.getDialogManager().fireQueuedDialogs();

        if (typeof this.onHideFunc === "function") {
            this.onHideFunc();
        }
    },

    hide: function () {
        if (this.node) {
            this.node.destroy();
        }
    },

    clickBgHide: function () {
        if (this._isAnimComplete) {
            this.hide();
        }
    },

    show: function (info) {
        debug.log("BaseDialog show ");
    },

    updateInfo: function (info) {
        debug.log("BaseDialog updateInfo");
    },

    fadeInBackground: function (delay = 0) {
        if (this.backgroundNode == null) {
            return;
        }

        if (this.clickBgClose) {
            this.addClickBackgroundHideEvent();
        }

        let finishedCallback = cc.callFunc(function () {
            this._isAnimComplete = true;
            this.onAnimComplete();
        }, this);

        this.backgroundNode.opacity = 0;
        this.backgroundNode.active = true;

        let action = cc.fadeTo(0.25, this.bgOpacity);
        let seq = cc.sequence(cc.delayTime(delay), action, cc.delayTime(0.1), finishedCallback);
        this.backgroundNode.runAction(seq);
    },

    onAnimComplete: function () { },

    addClickBackgroundHideEvent: function () {
        if (this.backgroundBtn == null) {
            this.backgroundBtn = this.backgroundNode.getComponent("cc.Button");
        }

        if (this.backgroundBtn == null) {
            return;
        }

        let evt = new cc.Component.EventHandler();
        evt.target = this.node;
        evt.component = this.__classname__;
        evt.handler = "clickBgHide";
        this.backgroundBtn.clickEvents.push(evt);
    },

    mildShowAnim: function (delay = 0) {
        this.frame.scale = 1;
        this.scheduleOnce(function () {
            let action1 = cc.scaleTo(0.2, 0.8);
            let action2 = cc.scaleTo(0.2, 1);
            this.frame.runAction(cc.sequence(action1, action2));
        }, delay);
    },

    fastShowAnim: function (delay = 0) {
        this.frame.scale = 0.1;
        this.scheduleOnce(function () {
            let action = cc.scaleTo(0.2, 1).easing(cc.easeBackOut());
            this.frame.runAction(action);
        }, delay);
    },

    elasticShowAnim: function (delay = 0) {
        this.frame.scale = 0.1;
        this.scheduleOnce(function () {
            let action = cc.scaleTo(0.25, 1).easing(cc.easeElasticOut());
            this.frame.runAction(action);
        }, delay);
    },

    resizeFrame: function (delay = 0.05) {
        if (this.resizeRef == null) {
            return;
        }

        if (this.frame == null) {
            return;
        }

        this.scheduleOnce(function () {
            let pHeight = this.resizeRef.height * this.resizeRef.scaleY;
            let pWidth = this.resizeRef.width * this.resizeRef.scaleX;
            this.frame.height = pHeight + this.frameBaseHeight;
            this.frame.width = Math.max(this.frameMinWidth, pWidth + this.frameBaseWidth);
            this.resetAlignment(this.node);
        }, delay);
    },

    resetAlignment: function (node) {
        if (node == null || !node.isValid) {
            return;
        }

        let w = node.getComponent(cc.Widget);
        if (w != null) {
            w.updateAlignment();
        }

        if (node.children && node.children.length > 0) {
            for (let i in node.children) {
                let c = node.children[i];
                this.resetAlignment(c);
            }
        }
    },
});