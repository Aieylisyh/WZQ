cc.Class({
    extends: require("BaseDialog"),

    properties: {
        textLabel: cc.RichText,
    },

    /**
     * info:
     * - 可以直接是string
     * - 可是是对象：包含msg和onHideFunc属性
     */
    show: function (info) {
        if (info == null) {
            this.hide()
            return;
        }
        
        if (typeof info === "string") {
            this.textLabel.string = info;
        } else if (typeof info === "object") {
            this.textLabel.string = info.msg;
            this.onHideFunc = info.onHideFunc;
        }

        this.resizeFrame();
        this.fadeInBackground();
        this.fastShowAnim();
    },
});