cc.Class({
    extends: cc.Component,

    properties: {
        _backgroundAudio: null,

        // 是否播放背景音乐
        _isPlayBackgroundMusic: false,

        backgroundMusicUrl: "customRes/sound/mainbg.mp3",

        audioCache: [],

        soufix: ".mp3",

        appSoundManager: require("AppSoundManager"),
    },

    start: function() {
        this.audioCache = [];

        this._isPlayBackgroundMusic = false;

        if (WechatAPI.isApp && this.appSoundManager) {
            debug.log("sound manager is app using cocos native sound");
            this.soufix = "_clip"; //对于原生平台，直接播放一个audioclip
        }
    },

    getSoundSFXFullPath: function(path) {
        // return debug.pureFileDownloadRoot + this.soundSfxUrl + path;
        return "customRes/sound/" + path;
    },

    playSFX: function(path) {
        if (!path) {
            debug.warn("playSFX bad path " + path);
            return;
        }

        if (appContext.getGameSettingManager().noSound) {
            return;
        }

        if (WechatAPI.isApp && this.appSoundManager) {
            this.appSoundManager.playSFX(path);
            return;
        }

        if (WechatAPI.isEnabled() && wx.createInnerAudioContext != null) {
            if (this.audioCache[path] == null) {
                this.audioCache[path] = [];
            }

            let hasIdleAudio = false;
            for (let i in this.audioCache[path]) {
                let audio = this.audioCache[path][i];
                if (audio != null) {
                    if (audio.paused && audio.duration > 0) {
                        audio.stop();
                        if (audio.src !== this.getSoundSFXFullPath(path)) {
                            audio.src = this.getSoundSFXFullPath(path);
                        }

                        if (typeof audio.play == "function") {
                            audio.play();
                            hasIdleAudio = true;
                            break;
                        }
                    }
                }
            }

            if (!hasIdleAudio) {
                //下载一次后不用再次下载
                //debug.log("播放首次");
                if (typeof window.wx.createInnerAudioContext != "function") {
                    debug.log("!!createInnerAudioContext is not a function!!!");
                    return;
                }

                let sfx = window.wx.createInnerAudioContext();
                sfx.src = this.getSoundSFXFullPath(path);
                sfx.loop = false;
                sfx.autoplay = true;

                if (typeof sfx.play == "function") {
                    sfx.play();
                }

                this.audioCache[path].push(sfx);
            }
        }
    },

    playExplode: function() {
        let r = Math.random();
        if (r < 0.5) {
            this.playExplode1();
        } else {
            this.playExplode2();
        }
    },

    playExplode1: function() {
        this.playSFX("BoulderImpact1" + this.soufix);
    },

    playExplode2: function() {
        this.playSFX("BoulderImpact2" + this.soufix);
    },

    playStar: function() {
        this.playSFX("star" + this.soufix);
    },

    playAcc: function() {
        this.playSFX("acc" + this.soufix);
    },

    playBoardWindow: function() {
        this.playSFX("boardWindow" + this.soufix);
    },

    playBomb: function() {
        let r = Math.random();
        if (r < 0.5) {
            this.playClick1();
        } else {
            this.playClick2();
        }
    },

    playClick1: function() {
        this.playSFX("ClickSimple" + this.soufix);
    },

    playClick2: function() {
        this.playSFX("clk" + this.soufix);
    },

    playFireCannon: function() {
        this.playSFX("firecannon" + this.soufix);
    },

    playHint: function() {
        this.playSFX("hint" + this.soufix);
    },

    playSmallBtn: function() {
        this.playSFX("smallBtn" + this.soufix);
    },

    playLoose: function() {
        this.playSFX("loose" + this.soufix);
    },

    playMainBg: function() {
        this.playSFX("mainbg" + this.soufix);
    },

    playUpgrade: function() {
        this.playSFX("upgrade" + this.soufix);
    },

    playTorpedo: function() {
        this.playSFX("torpedo" + this.soufix);
    },

    playWin: function() {
        this.playSFX("win" + this.soufix);
    },

    playReward: function() {
        this.playSFX("reward" + this.soufix);
    },

    playDing: function() {
        this.playSFX("ding" + this.soufix); //shuijing to use
    },

    playBubble: function() {
        this.playSFX("bubble" + this.soufix); //chat bubble to use
    },

    playElecDing: function() {
        this.playSFX("elecDing" + this.soufix);
    },

    playEnterRoom: function() {
        this.playSFX("enterRoom" + this.soufix); // to use
    },

    playHurry: function() {
        this.playSFX("hurry" + this.soufix);
    },

    playJump: function() {
        this.playSFX("jump" + this.soufix);
    },

    playPopBloom: function() {
        this.playSFX("popBloom" + this.soufix); // to use
    },

    playString: function() {
        this.playSFX("string" + this.soufix);
    },

    playSelectAvatar: function() {
        this.playSFX("SelectAvatar" + this.soufix);
    },

    playUseGold: function() {
        this.playSFX("use_gold" + this.soufix);
    },

    playHit: function() {
        this.playSFX("hit" + this.soufix);
    },

    // 播放背景音乐
    startBackgroundMusic: function() {
        if (WechatAPI.isApp && this.appSoundManager) {
            this.appSoundManager.startBackgroundMusic();
            return;
        }

        debug.log("start bg Music");
        if (!WechatAPI.isEnabled() || appContext.getGameSettingManager().noSound) {
            this.stopBackgroundMusic();
            return;
        }

        if (this._backgroundAudio == null) {
            debug.log("startBackgroundMusic createBackgroundAudio");
            this.createBackgroundAudio();
        }

        if (!this._backgroundAudio.paused) {
            this._isPlayBackgroundMusic = true;
            return;
        }

        if (this._isPlayBackgroundMusic) {
            debug.log("startBackgroundMusic _isPlayBackgroundMusic");
            this._backgroundAudio.stop();
        }

        this._isPlayBackgroundMusic = true;
        this._backgroundAudio.src = this.backgroundMusicUrl;
        this._backgroundAudio.loop = true;
        this._backgroundAudio.autoplay = true;
        this._backgroundAudio.play();
    },

    // 停止背景音乐
    stopBackgroundMusic: function() {
        if (WechatAPI.isApp && this.appSoundManager) {
            this.appSoundManager.stopBackgroundMusic();
            return;
        }

        debug.log("stop bgmusic");
        if (!WechatAPI.isEnabled() || this._backgroundAudio == null) {
            this._isPlayBackgroundMusic = false;
            return;
        }

        this._isPlayBackgroundMusic = false;
        this._backgroundAudio.pause();
    },

    // 创建背景音乐的innerAudioContext
    createBackgroundAudio: function() {
        if (WechatAPI.isApp && this.appSoundManager) {
            this.appSoundManager.createBackgroundAudio();
            return;
        }

        debug.log("createBackgroundAudio");
        if (!WechatAPI.isEnabled()) {
            return;
        }
        if (this._backgroundAudio != null) {
            return;
        }

        if (typeof window.wx.createInnerAudioContext != "function") {
            debug.log("!!createInnerAudioContext is not a function!!!");
            return;
        }

        this._backgroundAudio = window.wx.createInnerAudioContext();
        this._backgroundAudio.src = this.backgroundMusicUrl;
        this._backgroundAudio.loop = true;

        if (this._backgroundAudio) {
            this._backgroundAudio.autoplay = true;
            if (typeof this._backgroundAudio.play == "function") {
                this._backgroundAudio.play();
            }
        } else {
            debug.log("!!createBackgroundAudio fail!!!");
        }
    },

    onShow: function() {
        if (WechatAPI.isApp && this.appSoundManager) {
            this.appSoundManager.onShow();
            return;
        }

        debug.log("onShow bg Music");
        if (this._isPlayBackgroundMusic) {
            this.startBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }
    },
});