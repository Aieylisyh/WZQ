let DialogTypes = require("DialogTypes");

cc.Class({
    extends: cc.Component,

    properties: {
        sprite: cc.Sprite,

        label: cc.Label,

        outLine: cc.LabelOutline,
    },

    nav: function() {
        if (WechatAPI.isTT) {
            debug.log(WechatAPI.ttAppLaunchOptions);
            if (WechatAPI.ttAppLaunchOptions != null) {
                // 打开互跳弹窗
                tt.showMoreGamesModal({
                    appLaunchOptions: WechatAPI.ttAppLaunchOptions,
                    success(res) {
                        console.log('success')
                        console.log(res)
                    },
                    fail(res) {
                        console.log('fail')
                        console.log(res)
                    }
                })
            }
        } else if (WechatAPI.isWx) {
            if (this.isIntegrated) {
                appContext.getDialogManager().showDialog(DialogTypes.Promotion);
                return;
            }

            let appId = this.appId;
            let path = this.navQuery;

            //https://developers.weixin.qq.com/minigame/dev/api/open-api/miniprogram-navigate/wx.navigateToMiniProgram.html

            appContext.getAnalyticManager().sendALD("promo_" + appId);
            wx.navigateToMiniProgram({
                // appId: "wxa4f02dce73cea6ff",
                // path: "?ald_media_id=12261&ald_link_key=03e1248846967945&ald_position_id=0",
                appId: appId,
                path: path,
                success(res) {
                    //debug.log(res);
                },
            });
        }
    },

    setup(info) {
        //debug.log(info);
        if (info.localImg != null && info.localImg != "") {
            //debug.log("!load local promo img " + info.localImg);
            appContext.getFileManager().applySpriteSafe(info.localImg, this.sprite);
        } else {
            let url = info.remoteImg;
            debug.log("!load remote promo img");
            appContext.getFileManager().hasImageFile(url, function(res) {
                if (res) {
                    //console.log("!use existed img");
                    this.applyRemoteImg(res);
                } else {
                    //console.log("!use download img");
                    this.downloadRemoteImg(url);
                }
            }, this);
        }

        if (this.label) {
            if (this.isHot) {
                if (this.isHotTT) {
                    this.label.string = "更多游戏";
                } else {
                    this.label.string = "时下热门";
                }

                this.label.node.scale = 0.65;
            }
            if (this.isIntegrated) {
                this.label.string = "游戏大厅";
                this.label.node.scale = 0.7;
            } else {
                this.label.string = info.name;
            }
        }

        this.appId = info.appid;
        this.navQuery = info.navQuery;
    },

    downloadRemoteImg: function(url) {
        if (url == null || url == "") {
            return;
        } else {
            appContext.getFileManager().downloadAndSaveFile(url, function(path) {
                if (path) {
                    this.applyRemoteImg(path, url);
                }
            }, this);
        }
    },

    applyRemoteImg: function(path) {
        let self = this;

        cc.loader.load(path, function(err, tex) {
            if (self.node == null || self.sprite == null) {
                return;
            }

            if (tex != null && tex.height != null && tex.height > 0) {
                self.sprite.spriteFrame = new cc.SpriteFrame(tex);
            }
        });
    },

    setHotStyle() {
        this.sequenceAutoChange();
        this.isHot = true;

        if (this.outLine) {
            this.outLine.enabled = true;
        }
    },

    setIntegratedStyle() {
        this.sequenceAutoChange(1);
        this.isIntegrated = true;
        this.isHot = false;

        if (this.outLine) {
            this.outLine.enabled = false;
        }
    },

    setHotStyleTT() {
        this.sequenceAutoChange();
        this.isHot = true;
        this.isHotTT = true;

        if (this.outLine) {
            this.outLine.enabled = true;
        }
    },

    sequenceAutoChange(t) {
        if (!t) {
            t = 3.8;
        }

        let repeat = cc.repeatForever(
            cc.sequence(
                cc.callFunc(function() {
                    this.change();
                }, this),
                cc.delayTime(t),
            )
        );

        this.node.runAction(repeat);
    },

    change() {
        //debug.log("!!change");
        let promoInfo = debug.getPromoList();
        if (promoInfo == null) {
            return;
        }

        let index = Math.floor(Math.random() * promoInfo.length);
        let info = promoInfo[index];
        if (info) {
            this.setup(info);
        }
    },
});