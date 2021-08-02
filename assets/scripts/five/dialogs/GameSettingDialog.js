cc.Class({
    extends: require("BaseDialog"),

    properties: {
        bgMusicCheck: cc.Toggle,

        soundEffectCheck: cc.Toggle,

        chatCheck: cc.Toggle,
    },

    show: function (info) {
        this.refreshByGameSetting();
        this.fadeInBackground();
        this.fastShowAnim();
    },

    // 点击"背景音乐"
    onClickBgMusic: function () {
        appContext.getSoundManager().playBtn();
        let gameSettingManager = appContext.getGameSettingManager();

        if (this.bgMusicCheck.isChecked) {
            gameSettingManager.unmuteMusic();
        } else {
            gameSettingManager.muteMusic();
        }
    },

    // 点击"下棋音效"
    onClickBtnSoundEffect: function () {
        appContext.getSoundManager().playBtn();
        let gameSettingManager = appContext.getGameSettingManager();

        if (this.soundEffectCheck.isChecked) {
            gameSettingManager.unmuteSound();
        } else {
            gameSettingManager.muteSound();
        }
    },

     // 点击"文字吐槽"
     onClickBtnMuteChat: function () {
        appContext.getSoundManager().playBtn();
        let gameSettingManager = appContext.getGameSettingManager();

        if (this.chatCheck.isChecked) {
            gameSettingManager.unmuteChat();
        } else {
            gameSettingManager.muteChat();
        }
    },

    onClickBtnClose: function () {
        this.hide();
    },

    refreshByGameSetting: function () {
        let gsm = appContext.getGameSettingManager();

        this.bgMusicCheck.isChecked = !gsm.getMuteMusic();
        this.soundEffectCheck.isChecked = !gsm.getMuteSound();
        this.chatCheck.isChecked = !gsm.getMuteChat();
    },
});
