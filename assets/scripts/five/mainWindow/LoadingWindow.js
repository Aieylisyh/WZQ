cc.Class({
    extends: cc.Component,

    properties: {
        iconLogo: cc.Node,
    },

    start: function () {
        this.iconLogo.runAction(cc.sequence(
            cc.fadeTo(0.5, 255),
            cc.delayTime(0.5),
            cc.fadeTo(1, 0),
            this.onPreloadDone()
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