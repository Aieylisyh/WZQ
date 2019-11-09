let DataUtil = require("DataUtil");
let DialogTypes = require('DialogTypes');
let ConstantText = require('ConstantText');

cc.Class({
    extends: cc.Component,

    properties: {
        vitaTxt: cc.Label,

        rtTxt: cc.Label,

        tickTime: 1,

        regNode: cc.Node,
    },

    start: function() {
        this.tickTimer = 0;
    },

    update: function(dt) {
        this.tickTimer -= dt;
        if (this.tickTimer <= 0) {
            this.tickTimer = this.tickTime;
            if (appContext.getUxManager().vitaSystem) {
                appContext.getUxManager().vitaSystem.refresh();

                this.vitaTxt.string = appContext.getUxManager().vitaSystem.vita + " / " + appContext.getUxManager().vitaSystem.vitaMax;

                let rt = appContext.getUxManager().vitaSystem.getTimeRest();
                if (rt > 0) {
                    this.rtTxt.string = DataUtil.getCountDownHMSStringByMS(rt);
                    this.regNode.active = true;
                } else {
                    this.regNode.active = false;
                }
            }
        }
    },

    onClick: function() {
        if (appContext.getUxManager().vitaSystem.vita >= appContext.getUxManager().vitaSystem.vitaMax) {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "体力已满");
            return;
        }

        appContext.getUxManager().vitaSystem.vitaPromoPipeline.flowIn();
    },


    onClickQ: function() {
        appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, {
            content: ConstantText.Q_Vita,
        });
    },
});