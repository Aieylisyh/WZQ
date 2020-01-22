cc.Class({
    extends: cc.Component,

    properties: {
        lockIsDark: false,

        feedbackLocked: true,

        locked: {
            get: function () {
                return this._locked;
            },

            set: function (value) {
                if (this.lockIsDark) {
                    this.node.color = value ? new cc.Color(128, 128, 128) : new cc.Color(255, 255, 255);
                } else {
                    this.node.opacity = value ? 100 : 255;
                }

                this._locked = value;
            },

            visible: false,
        }
    },

    onLoad: function () {
        let self = this;
        self.locked = false;

        self.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            self.shakeStart.call(self);
        });

        self.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            self.shakeEnd.call(self);
        });

        self.node.on(cc.Node.EventType.TOUCH_END, function () {
            self.shakeEnd.call(self);
        });
    },

    shakeStart: function () {
        if (this.locked && !this.feedbackLocked) {
            return;
        }

            let action1 = cc.scaleTo(0.1, 1.08, 1.08).easing(cc.easeCubicActionOut());
            let action2 = cc.scaleTo(0.1, 1.02, 1.02).easing(cc.easeCubicActionOut());
            let action3 = cc.scaleTo(0.1, 1.13, 1.13).easing(cc.easeCubicActionOut());
            let action4 = cc.scaleTo(0.1, 1.06, 1.06).easing(cc.easeCubicActionOut());
            let seq = cc.sequence(action1, action2, action3, action4);
            this.node.runAction(seq);
    },

    shakeEnd: function () {
        if (this.locked && !this.feedbackLocked) {
            return;
        }

        let action1 = cc.scaleTo(0.1, 0.93, 0.93).easing(cc.easeCubicActionOut());
        let action2 = cc.scaleTo(0.1, 1.05, 1.05).easing(cc.easeCubicActionOut());
        let action3 = cc.scaleTo(0.1, 1, 1).easing(cc.easeCubicActionOut());
        let seq = cc.sequence(action1, action2, action3);
        this.node.runAction(seq);
    },

    showUp: function () {
        let action1 = cc.scaleTo(0.3, 1.15, 1.15).easing(cc.easeCubicActionOut());
        let action2 = cc.scaleTo(0.2, 1, 1).easing(cc.easeCubicActionOut());
        let seq = cc.sequence(action1, action2);
        this.node.runAction(seq);
    },

    fastShowUp: function () {
        this.node.scale = 0.6;
        let action1 = cc.scaleTo(0.1, 1.3, 1.3);
        let action2 = cc.scaleTo(0.2, 1, 1).easing(cc.easeBackOut());
        let seq = cc.sequence(action1, action2);
        this.node.runAction(seq);
    },

    shake: function () {
        let action1 = cc.scaleTo(0.1, 1.3, 1.3);
        let action2 = cc.scaleTo(0.2, 1, 1).easing(cc.easeBackOut());
        let seq = cc.sequence(action1, action2);
        this.node.runAction(seq);
    },

    onDisable: function () {
        this.node.stopAllActions();
        this.node.scale = 1;
    }
});