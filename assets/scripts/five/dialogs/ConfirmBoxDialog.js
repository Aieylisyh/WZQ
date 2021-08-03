cc.Class({
    extends: require("BaseDialog"),

    properties: {
        label: cc.RichText,

        btn1Sprite: cc.Sprite,

        btn2Sprite: cc.Sprite,

        closeBtn: cc.Node,

        adIcon: cc.Node,

        questionMark: cc.Node,
    },

    show: function (info) {

        if (typeof info == "string") {
            info = {
                content: info,
                hideCloseBtn: true
            };
        }

        if (info == null || info.content == null) {
            this.hide();
            return;
        }

        this.questionMark.active = false;
        if (info.isPromoSurrender) {
            this.questionMark.active = true;
            this.promoSurrenderIndex = 0;
        }

        this.label.string = info.content;
        this.clickFunction = null
        if (info.adIcon) {
            this.adIcon.active = true;
        } else {
            this.adIcon.active = false;
        }
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

        if (info.hideCloseBtn) {
            this.closeBtn.active = false;
        } else if (info.btnClose != null) {
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

    onClickPromoSurrender() {
        this.promoSurrenderIndex++;
        if (this.promoSurrenderIndex == 1) {
            this.label.string = "真想认输么？";
        } else if (this.promoSurrenderIndex == 2) {
            this.label.string = "你真的真的想认输么？";
        } else if (this.promoSurrenderIndex == 2) {
            this.label.string = "真的真的真的想认输么";
        } else if (this.promoSurrenderIndex == 3) {
            this.label.string = "现在反悔还来得及\n确定要认输么？";
        } else if (this.promoSurrenderIndex == 4) {
            this.label.string = "你认输的态度很好！\n感动了策划\n他给您开通了【悔棋】功能！\n\n还有，记得点取消";
            this.questionMark.active = false;
            //悔棋解锁状态记录在程序的运行时，不保存本地数据，用户重新启动游戏后悔棋按钮解锁状态将被重置
            appContext.getGameManager().promoRevertUnlocked = true;
            let w = appContext.getWindowManager().currentWindowNode;
            let gw = w.getComponent("GameWindow");
            if (gw != null) {
                gw.showBtnRevert();
            }
        }
        this.resizeFrame();
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