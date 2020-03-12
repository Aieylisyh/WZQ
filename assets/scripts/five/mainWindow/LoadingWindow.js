cc.Class({
    extends: cc.Component,

    properties: {
        iconLogo: cc.Node,
    },

    start: function () {
        this.iconLogo.runAction(cc.sequence(
            cc.fadeTo(1, 255),
            cc.delayTime(0.4),
            cc.fadeTo(0.8, 0),
            cc.callFunc(function(){
                this.onPreloadDone();
            },this),
        ));
    },

    onPreloadDone: function () {
        appContext.getRemoteAPI().loadFakePlayerInfo();
        appContext.getLoginManager().login();
        this.scheduleOnce(function () {
            appContext.getAppController().backToMain();
        }, 0);
    },
});