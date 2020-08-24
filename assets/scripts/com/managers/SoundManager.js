cc.Class({
    extends: cc.Component,

    properties: {
        _backgroundAudio: null,

        // 是否播放背景音乐
        _isPlayBackgroundMusic: false,

        backgroundMusicUrl: "customRes/sound/wuziqi.mp3",
        //s.backgroundMusicUrl="customRes/sound/wuziqi.mp3"

        audioCache: [],

        soufix: ".mp3",

        appSoundManager: require("AppSoundManager"),
    },

    start: function () {
        this.audioCache = [];

        this._isPlayBackgroundMusic = false;

        if (WechatAPI.isApp && this.appSoundManager) {
            debug.log("sound manager is app using cocos native sound");
            this.soufix = "_clip"; //对于原生平台，直接播放一个audioclip
        }
    },

    getSoundSFXFullPath: function (path) {
        // return debug.pureFileDownloadRoot + this.soundSfxUrl + path;
        return "customRes/sound/" + path;
    },

    checkMiniGameAPI() {
        if (WechatAPI.isEnabled() && typeof window.wx.createInnerAudioContext == "function") {
            return true;
        }

        return false;
    },

    playSFX: function (path) {
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

        if (this.checkMiniGameAPI()) {
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
                let sfx = window.wx.createInnerAudioContext();
                sfx.src = this.getSoundSFXFullPath(path);
                sfx.loop = false;
                sfx.autoplay = true;

                if (typeof sfx.play == "function") {
                    sfx.play();
                }

                this.audioCache[path].push(sfx);
            }
        } else {
            this.playSFX_Cocos(path)
        }
    },

    playSFX_Cocos(path) {
        if (this.audioCache[path] == null) {
            this.audioCache[path] = [];
        }

        let hasIdleAudio = false;
        for (let i in this.audioCache[path]) {
            let audio = this.audioCache[path][i];
            if (audio != null) {
                if (!audio.isPlaying && audio.getDuration() > 0) {
                    //audio.stop();
                    audio.play();
                    hasIdleAudio = true;
                    break;
                }
            }
        }

        if (!hasIdleAudio) {
            let self = this;

            cc.loader.load(this.getSoundSFXFullPath(path), (err, audioClip) => {
                var audioSource = self.addComponent(cc.AudioSource);
                audioSource.clip = audioClip;
                audioSource.play();

                self.audioCache[path].push(audioSource);
            });
        }
    },


    playExplode: function () {
        let r = Math.random();
        if (r < 0.5) {
            this.playExplode1();
        } else {
            this.playExplode2();
        }
    },

    playBtn: function () {
        this.playSFX("ClickSimple" + this.soufix);
    },

    playChess: function () {
        this.playSFX("clk" + this.soufix);
    },

    playStartRound: function () {
        this.playSFX("ding" + this.soufix);
    },

    playUseGold: function () {
        this.playSFX("use_gold" + this.soufix);
    },

    // 播放背景音乐
    startBackgroundMusic: function () {
        if (WechatAPI.isApp && this.appSoundManager) {
            this.appSoundManager.startBackgroundMusic();
            return;
        }

        debug.log("start bg Music");
        if (appContext.getGameSettingManager().noSound) {
            this.stopBackgroundMusic();
            return;
        }

        if (this._backgroundAudio == null) {
            debug.log("startBackgroundMusic createBackgroundAudio");
            this.createBackgroundAudio();
            return;
        }

        if (this.checkMiniGameAPI()) {
            if (!this._backgroundAudio.paused) {
                this._isPlayBackgroundMusic = true;
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
        } else {
            this._isPlayBackgroundMusic = true;
            this._backgroundAudio.play();
        }
    },

    // 停止背景音乐
    stopBackgroundMusic: function () {
        if (WechatAPI.isApp && this.appSoundManager) {
            this.appSoundManager.stopBackgroundMusic();
            return;
        }

        debug.log("stop bgmusic");
        if (this.checkMiniGameAPI()) {
            if (this._backgroundAudio) {
                if (typeof this._backgroundAudio.pause == "function") {
                    this._backgroundAudio.pause();
                }
            }
            this._isPlayBackgroundMusic = false;

        } else {
            if (this._backgroundAudio) {
                if (typeof this._backgroundAudio.pause == "function") {
                    this._backgroundAudio.pause();
                }
            }
            this._isPlayBackgroundMusic = false;
        }
    },

    // 创建背景音乐的innerAudioContext
    createBackgroundAudio: function () {
        if (WechatAPI.isApp && this.appSoundManager) {
            this.appSoundManager.createBackgroundAudio();
            return;
        }

        debug.log("createBackgroundAudio");
        if (this._backgroundAudio != null) {
            return;
        }

        if (this.checkMiniGameAPI()) {
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
        } else {
            let self = this;

            cc.loader.load(this.backgroundMusicUrl, (err, audioClip) => {
                var audioSource = self.addComponent(cc.AudioSource);
                audioSource.clip = audioClip;
                audioSource.loop = true;
                audioSource.play();
                self._backgroundAudio = audioSource;
            });
        }
    },

    onShow: function () {
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