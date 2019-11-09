cc.Class({
    extends: cc.Component,

    properties: {
        bgMusic: {
            type: cc.AudioSource,
            default: null,
        },

        BoulderImpact1_clip: {
            type: cc.AudioClip,
            default: null,
        },

        BoulderImpact2_clip: {
            type: cc.AudioClip,
            default: null,
        },

        star_clip: {
            type: cc.AudioClip,
            default: null,
        },

        acc_clip: {
            type: cc.AudioClip,
            default: null,
        },

        boardWindow_clip: {
            type: cc.AudioClip,
            default: null,
        },

        ClickSimple_clip: {
            type: cc.AudioClip,
            default: null,
        },

        clk_clip: {
            type: cc.AudioClip,
            default: null,
        },

        firecannon_clip: {
            type: cc.AudioClip,
            default: null,
        },

        hint_clip: {
            type: cc.AudioClip,
            default: null,
        },

        smallBtn_clip: {
            type: cc.AudioClip,
            default: null,
        },

        loose_clip: {
            type: cc.AudioClip,
            default: null,
        },

        upgrade_clip: {
            type: cc.AudioClip,
            default: null,
        },

        mainbg_clip: {
            type: cc.AudioClip,
            default: null,
        },

        torpedo_clip: {
            type: cc.AudioClip,
            default: null,
        },

        win_clip: {
            type: cc.AudioClip,
            default: null,
        },

        reward_clip: {
            type: cc.AudioClip,
            default: null,
        },

        ding_clip: {
            type: cc.AudioClip,
            default: null,
        },

        bubble_clip: {
            type: cc.AudioClip,
            default: null,
        },

        elecDing_clip: {
            type: cc.AudioClip,
            default: null,
        },

        enterRoom_clip: {
            type: cc.AudioClip,
            default: null,
        },

        hurry_clip: {
            type: cc.AudioClip,
            default: null,
        },

        jump_clip: {
            type: cc.AudioClip,
            default: null,
        },

        popBloom_clip: {
            type: cc.AudioClip,
            default: null,
        },

        string_clip: {
            type: cc.AudioClip,
            default: null,
        },

        SelectAvatar_clip: {
            type: cc.AudioClip,
            default: null,
        },

        use_gold_clip: {
            type: cc.AudioClip,
            default: null,
        },

        hit_clip: {
            type: cc.AudioClip,
            default: null,
        },

    },

    start: function() {
        //debug.log("app soundmanager start");
    },

    playSFX: function(path) {
        //debug.log("app playSFX");
        if (this[path]) {
            cc.audioEngine.play(this[path], false, 1);
        }
    },

    // 播放背景音乐
    startBackgroundMusic: function() {
        //debug.log("app start bg Music");
        this.bgMusic.play();
    },

    // 停止背景音乐
    stopBackgroundMusic: function() {
        //debug.log("app stop bg Music");
        this.bgMusic.pause();
    },

    // 创建背景音乐的innerAudioContext
    createBackgroundAudio: function() {
        //debug.log("app createBackgroundAudio");
    },

    onShow: function() {
        //debug.log("app onShow bg Music");
        if (!appContext.getWindowManager().isInGameWindow()) {
            //this.bgMusic.play();
        }
    },
});