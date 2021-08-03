cc.Class({
    extends: require("BaseDialog"),

    properties: {
        bgMusicCheck: cc.Toggle,

        soundEffectCheck: cc.Toggle,

        chatCheck: cc.Toggle,

        crossCheck: cc.Toggle,

        confirmChessCheck: cc.Toggle,
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

    // 点击"十字准星"
    onClickBtnMuteCross: function () {
        appContext.getSoundManager().playBtn();
        let gameSettingManager = appContext.getGameSettingManager();

        if (this.crossCheck.isChecked) {
            gameSettingManager.unmuteCross();
        } else {
            gameSettingManager.muteCross();
        }
    },

    // 点击"落子确认"
    onClickBtnConfirmChess: function () {
        appContext.getSoundManager().playBtn();
        let gameSettingManager = appContext.getGameSettingManager();

        if (this.confirmChessCheck.isChecked) {
            gameSettingManager.unmuteConfirmChess();
        } else {
            gameSettingManager.muteConfirmChess();
        }
    },

    onClickBtnClose: function () {
        this.hide();
    },

    refreshByGameSetting: function () {
        let gsm = appContext.getGameSettingManager();
        //debug.log("refreshByGameSetting");

        this.bgMusicCheck.isChecked = !gsm.getMuteMusic();
        this.soundEffectCheck.isChecked = !gsm.getMuteSound();
        this.chatCheck.isChecked = !gsm.getMuteChat();
        this.crossCheck.isChecked = !gsm.getMuteCross();
        this.confirmChessCheck.isChecked = !gsm.getMuteConfirmChess();

        // debug.log(this.bgMusicCheck.isChecked);
        // debug.log(this.soundEffectCheck.isChecked);
        // debug.log(this.chatCheck.isChecked);
        // debug.log(this.crossCheck.isChecked);
        // debug.log(this.confirmChessCheck.isChecked);
    },
});
