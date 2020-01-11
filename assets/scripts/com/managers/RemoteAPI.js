let DataContainerUpdater = require("DataContainerUpdater");

cc.Class({
    name: "RemoteAPI",

    ctor: function () {
        this.bindDataContainer();
    },

    bindDataContainer: function () {
        let kv = {};

        DataContainerUpdater.bind.call(this, kv);
    },

    loadFakePlayerInfo() {
        this.fakePlayerInfo = {
            data: [],
            bUserNickNames: [],
        };

        for (let i = 1; i < 15; i++) {
            this.loadBasicUserInfoByIndex(i);
        }

        this.loadBUserInfo();//刚好有30个名字，对应30个头像 他们的id分别是b_1 到 b_30

        //成功后data有700个元素，序号是0到699
        //bUserNickNames有三个元素
    },

    loadBUserInfo() {
        let path = "playerInfo/b/nickname";
        debug.log("loadBUserInfo " + path);
        let self = this;
        appContext.getFileManager().loadResourceSafe(path, null,
            function (content) {
                if (content != null) {
                    try {
                        debug.log(content);
                        let s = content.text.split("\n");
                        debug.log(s);

                        self.fakePlayerInfo.bUserNickNames = s;
                        debug.log("loadBUserInfo ok");
                    } catch (e) {
                        debug.log(e);
                    }
                } else {
                    debug.log("loadBUserInfo fail");
                }
            },
            this, true);
    },

    loadBasicUserInfoByIndex(i = 0) {
        let path = "playerInfo/data/" + i;
        debug.log("loadBasicUserInfoByIndex " + path);

        let self = this;
        appContext.getFileManager().loadResourceSafe(path, null,
            function (content) {
                if (content != null) {
                    try {
                        debug.log(content);
                        let json = JSON.parse(content);
                        if (json == null) {
                            return;
                        }

                        for (let iter in json) {
                            let item = json[iter];
                            self.fakePlayerInfo.data.push({
                                avatarUrl: item.avatarUrl,
                                nickname: item.nickName,
                                id: "n_" + (self.fakePlayerInfo.data.length + 1),
                            });
                        }

                        debug.log("loadBasicUserInfoByIndex ok " + i);
                    } catch (e) {
                        debug.log(e);
                    }
                } else {
                    debug.log("loadBasicUserInfoByIndex fail " + i);
                }
            },
            this, true);
    },

    applySpriteFrameOfBUserByIndex(targetSprite, path) {
        debug.log("getSpriteFrameOfBUserByIndex " + path);
        appContext.getFileManager().applySpriteSafe(path, targetSprite, null, true);
    },
});