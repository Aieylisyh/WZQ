cc.Class({
    extends: cc.Component,

    properties: {
        widget: cc.Widget,

        fitRight: false,

        fitLeft: false,

        additionalDist: 90,

        fitWidth: false,

        extendWidth: 120,
    },

    start() {
        if (WechatAPI.hasScreenFringe()) {
            if (this.widget) {
                if (this.fitRight) {
                    this.widget.right = this.widget.right + this.additionalDist;
                } else if (this.fitLeft) {
                    this.widget.left = this.widget.left + this.additionalDist;
                }

                this.widget.updateAlignment();
            }

            if (this.fitWidth) {
                this.node.width += this.extendWidth;
            }
        }
    },
});