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

    show: function(info) {
        if (typeof info === "string") {
            this.text.string = info;
        } else {
            this.text.string = info.string;
            this.lifeTime = info.time;
        }

        this.scheduleOnce(function() {
            this.frame.active = true;
            
            if (this.text && this.text.node && this.bg) {
                let w = Math.floor(this.text.node.width * this.text.node.scaleX);
                this.bg.width = w + 90;
                let h = Math.floor(this.text.node.height * this.text.node.scaleY);
                this.bg.height = h + 40;
                this.timer = 0;
                this.mildShowAnim();
                // debug.log(h);
                // debug.log(this.bg.height);
                // this.resizeFrame();
                ToastDialog.setYOffset(this);
            }
        }, 0.05);
    },

    update: function(dt) {
        if (this.timer < 0) {
            return;
        }

        this.timer += dt;
        if (this.timer > this.lifeTime) {
            this.hide();
        }
    },

    statics: {
        list: [],

        setYOffset: function(newToast) {
            let len = this.list.length;

            let totalOffset = newToast.bg.height + 8;

            for (let i = len - 1; i >= 0; i--) {
                if (this.list[i] == null || this.list[i].node == null || !this.list[i].node.isValid) {
                    this.list.splice(i, 1);
                    continue;
                }

                this.moveToast(this.list[i].node, totalOffset);

                let height = this.list[i].bg.height + 8;
                totalOffset += height;
            }

            this.list.push(newToast);
        },

        moveToast: function(toastNode, targetY) {
            let action = cc.moveTo(0.25, 0, targetY);
            toastNode.runAction(action);
        },
    }
});