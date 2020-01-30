let ToastDialog = cc.Class({
    extends: require("BaseDialog"),

    properties: {
        text: {
            default: null,
            type: cc.Label,
        },

        bg: {
            default: null,
            type: cc.Node,
        },

        lifeTime: 3,
    },

    show: function (info) {
        // debug.log("toast show " + info);
        // debug.log(this.node._id);
        // debug.log(this.node.active);
        if (typeof info === "string") {
            this.text.string = info;
        } else {
            this.text.string = info.string;
            this.lifeTime = info.time;
        }

        ToastDialog.setYOffset(this);
        this.timer = 0;

        this.scheduleOnce(function () {
            //debug.log("scheduleOnce！！" + this.node._id);
            this.frame.active = true;
            if (this.text && this.text.node && this.bg) {
                let w = Math.floor(this.text.node.width * this.text.node.scaleX);
                this.bg.width = w + 90;
                let h = Math.floor(this.text.node.height * this.text.node.scaleY);
                this.bg.height = h + 30;

                this.mildShowAnim();
                // debug.log(h);
                // debug.log(this.bg.height);
                // this.resizeFrame();
            }
        }, 0.05);


        // this.scheduleOnce(function () {
        //     debug.log("scheduleOnce2222222！！" + this.node._id);
        //     debug.log(this.node.active);
        //     debug.log(this.node);
        // }, 1);
    },

    update: function (dt) {
        // debug.log(this.node._id);
        // debug.log(this.text.string);
        if (this.timer < 0) {
            return;
        }

        this.timer += dt;
        if (this.timer > this.lifeTime) {
            this.hide();
        }
    },

    onHideFunc() {
        ToastDialog.beRemoved(this);
    },

    statics: {
        list: [],

        beRemoved(newToast) {
            let len = this.list.length;
            for (let i = len - 1; i >= 0; i--) {
                if (this.list[i] == newToast) {
                    //debug.log("删掉了");
                    this.list.splice(i, 1);
                    break;
                }
            }
        },

        setYOffset: function (newToast) {
            let len = this.list.length;
            let totalOffset = newToast.bg.height + 8;
            //debug.log("setYOffset len " + len);

            for (let i = len - 1; i >= 0; i--) {
                this.move(this.list[i].node, totalOffset);

                let height = this.list[i].bg.height + 8;
                totalOffset += height;
            }
            //debug.log("加入了");
            this.list.push(newToast);
        },

        move: function (toastNode, targetY) {
            //debug.log("moveToast targetY " + targetY);
            toastNode.stopAllActions();
            let action = cc.moveTo(0.2, 0, targetY);
            toastNode.runAction(action);
        },
    }
});