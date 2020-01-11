cc.Class({
    extends: require("BaseDialog"),

    properties: {
        bgMusicCheck: cc.Toggle,

        soundEffectCheck: cc.Toggle,
    },

    show: function (info) {
        this.refreshByGameSetting();
        this.fadeInBackground();
        this.fastShowAnim();
    },

    // 点击"背景音乐"
    onClickBgMusic: function () {
        let gameSettingManager = appContext.getGameSettingManager();

        if (this.bgMusicCheck.isChecked) {
            gameSettingManager.unmuteMusic();
        } else {
            gameSettingManager.muteMusic();
        }
    },

    // 点击"下棋音效"
    onClickBtnSoundEffect: function () {
        let gameSettingManager = appContext.getGameSettingManager();

        if (this.soundEffectCheck.isChecked) {
            gameSettingManager.unmuteSound();
        } else {
            gameSettingManager.muteSound();
        }
    },

    onClickBtnClose: function () {
        this.hide();
    },

    refreshByGameSetting: function () {
        let gsm = appContext.getGameSettingManager();

        this.bgMusicCheck.isChecked = !gsm.getMuteMusic();
        this.soundEffectCheck.isChecked = !gsm.getMuteSound();
    },
});
