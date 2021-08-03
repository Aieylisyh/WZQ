
cc.Class({
    properties: {
        _muteSound: false,

        _muteMusic: false,

        _muteChat: false,

        _muteCross: false,

        _muteConfirmChess: false,

        _muteSoundKey: "muteSoundKey",

        _muteMusicKey: "muteMusicKey",

        _muteChatKey: "muteChatKey",

        _muteCrossKey: "muteCrossKey",

        _muteConfirmChessKey: "muteConfirmChessKey",
    },

    ctor: function () {
        this.updateCachedSetting();
    },

    storageDataToBool(data) {
        if (data === "true") {
            return true;
        }
        if (data === true) {
            return true;
        }
        return false;
    },

    updateCachedSetting: function () {
        WechatAPI.getStorage(this._muteMusicKey, function (data) {
            this._muteMusic = this.storageDataToBool(data);
        }, this);

        WechatAPI.getStorage(this._muteSoundKey, function (data) {
            this._muteSound = this.storageDataToBool(data);
        }, this);

        WechatAPI.getStorage(this._muteChatKey, function (data) {
            this._muteChat = this.storageDataToBool(data);
        }, this);

        WechatAPI.getStorage(this._muteCrossKey, function (data) {
            this._muteCross = this.storageDataToBool(data);
        }, this);

        WechatAPI.getStorage(this._muteConfirmChessKey, function (data) {
            this._muteConfirmChess = this.storageDataToBool(data);
        }, this);
    },

    getMuteSound: function () {
        return this._muteSound;
    },

    getMuteMusic: function () {
        return this._muteMusic;
    },

    getMuteChat: function () {
        return this._muteChat;
    },

    getMuteCross: function () {
        return this._muteCross;
    },

    getMuteConfirmChess: function () {
        return this._muteConfirmChess;
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

    muteChat: function () {
        this._muteChat = true;
        WechatAPI.setStorage(this._muteChatKey, "true");
    },

    unmuteChat: function () {
        this._muteChat = false;
        WechatAPI.setStorage(this._muteChatKey, "false");
    },

    muteCross: function () {
        this._muteCross = true;
        WechatAPI.setStorage(this._muteCrossKey, "true");
    },

    unmuteCross: function () {
        this._muteCross = false;
        WechatAPI.setStorage(this._muteCrossKey, "false");
    },

    muteConfirmChess: function () {
        this._muteConfirmChess = true;
        WechatAPI.setStorage(this._muteConfirmChessKey, "true");
    },

    unmuteConfirmChess: function () {
        this._muteConfirmChess = false;
        WechatAPI.setStorage(this._muteConfirmChessKey, "false");
    },
});