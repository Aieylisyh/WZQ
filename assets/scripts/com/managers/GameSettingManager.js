
cc.Class({
    properties: {
        _muteSound: false,

        _muteMusic: false,

        _muteSoundKey: "muteSoundKey",

        _muteMusicKey: "muteMusicKey",
    },

    ctor: function () {
        this.updateCachedSetting();
    },

    updateCachedSetting: function () {
        WechatAPI.getStorage(this._muteSoundKey, function (data) {
            if (data === "true") {
                this._muteSound = true;
            } else {
                this._muteSound = false;
            }
        }, this);

        WechatAPI.getStorage(this._muteMusicKey, function (data) {
            if (data === "true") {
                this._muteMusic = true;
            } else {
                this._muteMusic = false;
            }
        }, this);
    },

    getMuteSound: function () {
        return this._muteSound;
    },

    getMuteMusic: function () {
        return this._muteMusic;
    },

    muteSound: function () {
        this._muteSound = true;
        WechatAPI.setStorage(this._muteSoundKey, "true");
    },

    unmuteSound: function () {
        this._muteSound = false;
        WechatAPI.setStorage(this._muteSoundKey, "false");
    },

    muteMusic: function () {
        this._muteMusic = true;
        WechatAPI.setStorage(this._muteMusicKey, "true");
        appContext.getSoundManager().stopBackgroundMusic();
    },

    unmuteMusic: function () {
        this._muteMusic = false;
        WechatAPI.setStorage(this._muteMusicKey, "false");
        appContext.getSoundManager().startBackgroundMusic();
    },
});