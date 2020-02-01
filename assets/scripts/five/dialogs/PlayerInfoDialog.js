let DialogTypes = require("DialogTypes");
let Grade = require("Grade");
let PlayerInfo = require("PlayerInfo");
let StringUtil = require("StringUtil");

cc.Class({
    extends: require("BaseDialog"),

    properties: {
        playerinfo: PlayerInfo, // 昵称

        nicknameEB: cc.EditBox, // 昵称

        triangle01: cc.Node,// 上连胜h左技巧w

        triangle02: cc.Node,// 左技巧h下胜率w

        triangle03: cc.Node,// 下胜率h右段位w

        triangle04: cc.Node,// 右段位h上连胜w
    },

    show: function () {
        this.setCharacterAttribute();
        this.playerinfo.setup(appContext.getUxManager().getUserInfo());

        this.fadeInBackground();
        this.fastShowAnim();
    },

    // 设置人物属性图
    setCharacterAttribute: function () {
        // todo
        let userBasic = appContext.getUxManager().getUserInfo().basic;
        debug.log(userBasic);
        // maxKeepWin: 0
        // crtKeepWin: 0
        // totalHands: 0
        // winCount: 0
        // roundCount: 0
        // currentScore: 0

        let gradeAndFillInfo = Grade.getGradeAndFillInfoByScore(userBasic.currentScore);
        //let gradeInfo = Grade.getGradeInfo(gradeAndFillInfo.grade);

        let to_keepWin = 0.5;
        to_keepWin = userBasic.maxKeepWin / 12;
        if (to_keepWin > 1) {
            to_keepWin = 1;
        }

        let to_grade = 0.5;
        to_grade = gradeAndFillInfo.grade / 10;

        let to_winRate = 0.5;
        if (userBasic.roundCount > 0) {
            to_winRate = userBasic.winCount / userBasic.roundCount;
        }

        let to_skill = 0.5;
        if (userBasic.totalHands > 0 && userBasic.roundCount > 0) {
            let averageHands = userBasic.totalHands / userBasic.roundCount;
            to_skill = (averageHands - 12) / 60;
            if (to_skill > 1) {
                to_skill = 1;
            }
            if (to_skill < 0) {
                to_skill = 0;
            }
            to_skill = 1 - to_skill;
        }

        debug.log("to_keepWin " + to_keepWin);
        debug.log("to_grade " + to_grade);
        debug.log("to_winRate " + to_winRate);
        debug.log("to_skill " + to_skill);
        this.to_keepWin = to_keepWin;
        this.to_grade = to_grade;
        this.to_winRate = to_winRate;
        this.to_skill = to_skill;

        this.settingCharacterAttribute = true;
        this.settingCharacterAttributeTimer = 0;
        this.settingCharacterAttributeTime = 0.8;
        this.settingCharacterAttributeStep = 1;
    },

    update(dt) {
        if (this.settingCharacterAttribute) {
            this.settingCharacterAttributeTimer += dt;
            if (this.settingCharacterAttributeTimer > this.settingCharacterAttributeTime) {
                this.settingCharacterAttributeTimer = this.settingCharacterAttributeTime;
                if (this.settingCharacterAttributeStep == 1) {
                    this.settingCharacterAttributeTimer = 0;
                    this.settingCharacterAttributeStep = 2;
                    this.settingCharacterAttributeTime = 1.2;
                } else {
                    this.settingCharacterAttribute = false;
                }

            }

            let length = 120;
            let ratio = this.settingCharacterAttributeTimer / this.settingCharacterAttributeTime * length;

            let keepWin, grade, winRate, skill;
            if (this.settingCharacterAttributeStep == 1) {
                let r = 0.5 * ratio;
                keepWin = r;
                grade = r;
                winRate = r;
                skill = r;

                this.triangle01.width = skill;
                this.triangle01.height = keepWin;

                this.triangle02.width = winRate;
                this.triangle02.height = skill;

                this.triangle03.width = grade;
                this.triangle03.height = winRate;

                this.triangle04.width = keepWin;
                this.triangle04.height = grade;
            } else {
                let rest = (length - ratio) * 0.5;
                keepWin = this.to_keepWin * ratio + rest;
                grade = this.to_grade * ratio + rest;
                winRate = this.to_winRate * ratio + rest;
                skill = this.to_skill * ratio + rest;

                this.triangle01.width = skill;
                this.triangle01.height = keepWin;

                this.triangle02.width = winRate;
                this.triangle02.height = skill;

                this.triangle03.width = grade;
                this.triangle03.height = winRate;

                this.triangle04.width = keepWin;
                this.triangle04.height = grade;
            }
        }
    },

    onClickBtnNickname: function () {
        appContext.getSoundManager().playSmallBtn();
        let s = this.nicknameEB.string;
        s = StringUtil.trimSpace(s);
        debug.log("onClickBtnNickname " + s);
        if (StringUtil.isEmpty(s)) {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "请输入昵称");
        } else {
            let userInfo = appContext.getUxManager().getUserInfo();
            let crtNickname = userInfo.basic.nickname;
            if (crtNickname == s) {
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "昵称没有变化");
            } else {
                userInfo.basic.nickname = s;
                appContext.getUxManager().saveUserInfo(userInfo);

                appContext.getDialogManager().showDialog(DialogTypes.Toast, "昵称修改并上传成功！");
                this.playerinfo.setup(userInfo);
            }
        }
    },


    onClickBtnProfile: function () {
        appContext.getSoundManager().playSmallBtn();
        if (WechatAPI.isTT) {
            let self = this;

            if (typeof tt.authorize == "function") {
                tt.authorize({
                    scope: "scope.album",
                    success() {
                        tt.chooseImage({
                            sourceType: ["album"],
                            count: 1,
                            
                            success(res) {
                                self.onUploadFileOK(res.tempFilePaths[0]);
                            },

                            fail() {
                                tt.openSetting({
                                    success(res) {
                                        self.onUploadFileOK(res.tempFilePaths[0]);
                                    },
                                    fail() {
                                        appContext.getDialogManager().showDialog(DialogTypes.Toast, "请授权以使用头像");
                                    }
                                })
                            }
                        });
                    }
                });
            } else {

                appContext.getDialogManager().showDialog(DialogTypes.Toast, "您的应用版本不能上传头像");
            }



        } else {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "抱歉，暂时不能上传头像");

        }
    },

    onUploadFileOK(tempFilePath) {
        debug.log("onUploadFileOK " + tempFilePath);
        let self = this;

        // tt.compressImage({
        //     src: tempFilePath, // 图片路径
        //     quality: 75, // 压缩质量
        //     success(compressedTempFilePath) {
        //         debug.log("compressImage " + compressedTempFilePath);
        //         tt.saveFile({
        //             tempFilePath: compressedTempFilePath,
        //             success(res) {
        //                 debug.log("saveFile " + res);
        //                 appContext.getDialogManager().showDialog(DialogTypes.Toast, "头像上传成功！");
        //                 userInfo.basic.headIconUrl = null;
        //                 userInfo.basic.headIconPath = res;

        //                 appContext.getUxManager().saveUserInfo(userInfo);
        //                 this.playerinfo.setup(userInfo);
        //             }
        //         });
        //     },
        // });
        tt.saveFile({
            tempFilePath: tempFilePath,
            success(res) {
                // debug.log("saveFile");
                // debug.log(res);

                let userInfo = appContext.getUxManager().getUserInfo();
                userInfo.basic.headIconRawUrl = res.savedFilePath;
                appContext.getUxManager().saveUserInfo(userInfo);
                self.playerinfo.setup(userInfo);
                self.scheduleOnce(function () {
                    appContext.getDialogManager().showDialog(DialogTypes.Toast, "头像上传成功！\n建议使用方形图片作为头像");
                }, 1);
            }
        });
    },

    // 点击"分享"按钮
    onClickBtnShare: function () {
        appContext.getSoundManager().playSmallBtn();
        WechatAPI.shareUtil.share();
    },

    onHideFunc() {
        let w = appContext.getWindowManager().currentWindowNode;
        let gw = w.getComponent("GameWindow");
        let mw = w.getComponent("MainWindow");
        mw && mw.onPlayerInfoDialogHide();
        gw && gw.onPlayerInfoDialogHide();
    },
});
