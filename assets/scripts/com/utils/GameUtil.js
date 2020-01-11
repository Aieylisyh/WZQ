let StringUtil = require("StringUtil");
let DataKey = require("DataKey");
let StorageKey = require("StorageKey");
let LoadResPath = require("LoadResPath");

let GameUtil = {
    setHeadIcon: function (headIconUrl, localPath, targetSprite, defaultIconPath = "") {
        if (StringUtil.isNotEmpty(localPath)) {
            this.applyHeadIcon(localPath, targetSprite);
        } else {
            //   let defaultIconPath = sex === 1 ? LoadResPath.ImgPath.boy_defaultHeadIcon : LoadResPath.ImgPath.girl_defaultHeadIcon;
            if (StringUtil.isEmpty(defaultIconPath)) {
                defaultIconPath = LoadResPath.ImgPath.boy_defaultHeadIcon;
            }
            this.setHeadIconImg(headIconUrl, targetSprite, defaultIconPath);
        }
    },

    // 设置头像图片
    setHeadIconImg: function (headIconUrl, targetSprite, defaultIconPath = "") {
        if (StringUtil.isNotEmpty(headIconUrl)) {
            appContext.getFileManager().hasImageFile(headIconUrl, function (path) {
                if (path) {
                    this.applyHeadIcon(path, targetSprite);
                } else {
                    this.downloadAndApplyHeadIcon(headIconUrl, targetSprite, defaultIconPath);
                }
            }, this);
        } else {
            this.setDefaultHeadIcon(defaultIconPath, targetSprite);
        }
    },

    downloadAndApplyHeadIcon: function (headIconUrl, targetSprite, defaultIconPath = "") {
        appContext.getFileManager().downloadAndSaveFile(headIconUrl, function (path) {
            if (targetSprite == null || targetSprite.node == null) {
                return;
            }

            if (path) {
                this.applyHeadIcon(path, targetSprite);
            } else {
                this.setDefaultHeadIcon(defaultIconPath, targetSprite);
            }
        }, this);
    },

    applyHeadIcon: function (path, targetSprite) {
        if (targetSprite == null || targetSprite.node == null) {
            return;
        }

        cc.loader.load(path, function (err, tex) {
            if (targetSprite == null || targetSprite.node == null) {
                return;
            }

            if (tex != null && tex.height != null && tex.height > 0) {
                targetSprite.spriteFrame = new cc.SpriteFrame(tex);
            } else {
                targetSprite.spriteFrame = null;
            }
        })
    },

    setDefaultHeadIcon: function (defaultIconPath, targetSprite) {
        if (StringUtil.isNotEmpty(defaultIconPath)) {
            appContext.getFileManager().applySpriteSafe(defaultIconPath, targetSprite);
        } else {
            debug.log("defaultIconPath is null");
        }
    },

    //////////////////////////////////////////////////////////

    getUserFromDataContainer: function () {
        let dc = appContext.getDataRepository().getContainer(DataKey.MyUser);
        if (dc == null) {
            return null;
        }

        return dc.read();
    },

    //从对应的key中取得时间戳，判断时间戳和当前时间比是否超过一定小时数，如果没有时间戳则默认超过
    hasStroageTimerPassedHours: function (key, hours) {
        let lastTime = WechatAPI.getStorageSync(key);
        if (lastTime != null && lastTime != "") {
            if (this.getPassedHoursByTimerString(lastTime) > hours) {
                return true;
            }
        } else {
            return true;
        }

        return false;
    },

    getPassedHoursByTimerString: function (lastTime) {
        let t = parseInt(lastTime);
        if (typeof t != "number" || t <= 0) {
            return 0;
        }
        return this.getDeltaHoursByMS(Date.now(), t);
    },

    getDeltaHoursByMS: function (t1, t2) {
        let delta = t1 - t2;
        return delta / 3600000;
    },

    getAheadDays(dateNew, dateOld) {
        let day1 = Math.floor(dateNew / 86400000);
        let day2 = Math.floor(dateOld / 86400000);
        let delta = day1 - day2;

        return delta;
    },

    setUX: function () {
        if (WechatAPI.uxData != null) {
            return;
        }

        WechatAPI.uxData = {};
        debug.log("setUX");

        let lastEnterGameTimestamp = WechatAPI.getStorageSync(StorageKey.LastEnterGameTimestamp);
        let firstEnterGameTimestamp = WechatAPI.getStorageSync(StorageKey.FirstEnterGameTimestamp);

        let playedDays = 0;
        let isFirstTime = firstEnterGameTimestamp == null || firstEnterGameTimestamp == "";

        if (isFirstTime) {
            debug.log("用户首次进入游戏");//（不清缓存的情况）

            let sceneId = cc.enterAppSceneId || WechatAPI.cache.enterAppSceneId || 0;
            let titleId = null;
            let imageId = null;

            let promoteChannel = WechatAPI.cache.promoteChannel;
            if (promoteChannel) {
                appContext.getAnalyticManager().addEvent("play_promote__1__" + promoteChannel);
            } else {
                promoteChannel = "ttigd_xyx";
            }

            if (cc.tempData != null) {
                titleId = cc.tempData["shareTitle"];
                imageId = cc.tempData["shareImgUrl"];
            }

            if (sceneId == null) {
                sceneId = WechatAPI.cache.enterAppSceneId;
                if (sceneId == null) {
                    sceneId = 0;
                }
            }

            if (titleId == null) {
                titleId = WechatAPI.cache.shareTitle;
            }

            if (imageId == null) {
                imageId = WechatAPI.cache.shareImgUrl;
            }

            let firstEnterGameInfo = {};

            // 让服务器记录用户渠道
            let urlAndData = WechatAPI.webService.getRequestUrlAndData(RequestType.PromoteChannel, promoteChannel);
            if (urlAndData) {
                WechatAPI.webService.postRequest(WechatAPI.webService.getRequestObject(urlAndData.url, urlAndData.data))
            }

            firstEnterGameInfo.promoteChannel = promoteChannel;

            if (titleId != null) {
                firstEnterGameInfo.titleId = titleId;
                appContext.getAnalyticManager().addEvent("play_title__1__" + titleId);
            };

            if (imageId != null) {
                firstEnterGameInfo.imageId = imageId;
                imageId = StringUtil.removeText(imageId, WechatAPI.wxShare.basePath);
                appContext.getAnalyticManager().addEvent("play_image__1__" + imageId);
            }
            if (sceneId != null) {
                firstEnterGameInfo.sceneId = sceneId;
                appContext.getAnalyticManager().addEvent("play_sceneId__1__" + sceneId);
            }

            WechatAPI.setStorage(StorageKey.LastEnterGameTimestamp, Date.now());
            WechatAPI.setStorage(StorageKey.FirstEnterGameTimestamp, Date.now());
            WechatAPI.setStorage(StorageKey.FirstEnterGameInfo, firstEnterGameInfo);

            WechatAPI.uxData.firstEnterGameInfo = firstEnterGameInfo;
        } else {
            if (lastEnterGameTimestamp == null || lastEnterGameTimestamp == "") {
                WechatAPI.setStorage(StorageKey.LastEnterGameTimestamp, Date.now());
            } else {
                let delta = GameUtil.getAheadDays(Date.now(), lastEnterGameTimestamp);
                if (delta > 0) {
                    WechatAPI.setStorage(StorageKey.LastEnterGameTimestamp, Date.now());

                    if (delta >= 4) {
                        //停玩3天以上后重新进入游戏
                        appContext.getAnalyticManager().addEvent("returnUser__" + (delta - 1));
                    }
                }
            }

            playedDays = GameUtil.getAheadDays(Date.now(), firstEnterGameTimestamp);

            if (playedDays > 0 && playedDays < 8) {
                appContext.getAnalyticManager().addEvent("play_model__" + playedDays + "__" + WechatAPI.systemInfo.model);

                let firstEnterGameInfo = WechatAPI.getStorageSync(StorageKey.FirstEnterGameInfo);
                if (firstEnterGameInfo != null) {
                    if (firstEnterGameInfo.titleId != null && firstEnterGameInfo.titleId > -1) {
                        appContext.getAnalyticManager().addEvent("play_title__" + playedDays + "__" + firstEnterGameInfo.titleId);
                    }
                    if (firstEnterGameInfo.imageId != null) {
                        appContext.getAnalyticManager().addEvent("play_image__" + playedDays + "__" + firstEnterGameInfo.imageId);
                    }
                    if (firstEnterGameInfo.sceneId != null) {
                        appContext.getAnalyticManager().addEvent("play_sceneId__" + playedDays + "__" + firstEnterGameInfo.sceneId);
                    }
                    if (firstEnterGameInfo.promoteChannel != null) {
                        appContext.getAnalyticManager().addEvent("play_promote__" + playedDays + "__" + firstEnterGameInfo.promoteChannel);
                    }
                }
            }
        }

        WechatAPI.uxData.playedDays = playedDays;
        WechatAPI.uxData.isFirstTime = isFirstTime;

        appContext.getAnalyticManager().accelerateUpload(0);
    },
}

module.exports = GameUtil;