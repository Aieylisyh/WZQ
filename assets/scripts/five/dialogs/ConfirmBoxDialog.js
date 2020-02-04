cc.Class({
    extends: require("BaseDialog"),

    properties: {
        label: cc.RichText,

        btn1Sprite: cc.Sprite,

        btn2Sprite: cc.Sprite,
    },

    show: function (info) {

        if (typeof info == "string") {
            info = { content: info };
        }

        if (info == null || info.content == null) {
            this.hide();
            return;
        }

        this.label.string = info.content;
        this.clickFunction = null

        if (info.btn1 != null) {

            if (info.btn1.clickFunction != null) {
                this.clickFunction = info.btn1.clickFunction;
            }

            if (info.btn1.clickFunctionCaller != null) {
                this.clickFunctionCaller = info.btn1.clickFunctionCaller;
            } else {
                this.clickFunctionCaller = this;
            }

            if (info.btn2 != null) {
                this.frameMinWidth = 600;
                this.btn1Sprite.node.x = -120;
                this.btn2Sprite.node.active = true;
                this.btn2Sprite.node.x = 120;

                if (info.btn2.clickFunction != null) {
                    this.clickFunction2 = info.btn2.clickFunction;
                }

                if (info.btn2.clickFunctionCaller != null) {
                    this.clickFunctionCaller2 = info.btn2.clickFunctionCaller;
                } else {
                    this.clickFunctionCaller2 = this;
                }

            }
        }

        if (info.btnClose != null) {
            if (info.btnClose.clickFunction != null) {
                this.clickFunctionClose = info.btnClose.clickFunction;
            }

            if (info.btnClose.clickFunctionCaller != null) {
                this.clickFunctionCloseCaller = info.btnClose.clickFunctionCaller;
            } else {
                this.clickFunctionCloseCaller = this;
            }
        }

        this.resizeFrame();
        this.fadeInBackground();
        this.fastShowAnim();
    },

    onClickClose: function () {
        appContext.getSoundManager().playBtn();
        if (this.clickFunctionClose != null && typeof this.clickFunctionClose === "function") {
            this.clickFunctionClose.call(this.clickFunctionCloseCaller);
        }
        this.hide();
    },

    onClickBtnConfirm: function () {
        appContext.getSoundManager().playBtn();
        if (this.clickFunction != null && typeof this.clickFunction === "function") {
            this.clickFunction.call(this.clickFunctionCaller);
        }

        this.hide();
    },

    onClickBtn2Confirm: function () {
        appContext.getSoundManager().playBtn();
        if (this.clickFunction2 != null && typeof this.clickFunction2 === "function") {
            this.clickFunction2.call(this.clickFunctionCaller2);
        }

        this.hide();
    },
});