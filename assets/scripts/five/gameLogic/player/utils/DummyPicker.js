let Dummy = require("Dummy");
let Grade = require("Grade");

cc.Class({
    statics: {
        matchOpponent: function (isHardMode) {
            //搜索对手时调用，什么参数都不用传
            //会自动检测是否有网，自动分配合理的对手
            let user = appContext.getUxManager().getUserInfo();
            let grade = Grade.getGradeAndFillInfoByScore(user.basic.currentScore).grade;
            if (isHardMode) {
                grade = 10;
            } else {
                if (grade > 8) {
                    grade = 8;
                }
            }

            return this.matchDummy(grade);
        },

        matchRankedOpponent: function (grade) {
            let dummyPlayer = this.pickDummy(grade);
            let success = true;
            if (!dummyPlayer) {
                success = false;
            }

            return {
                dummyPlayer: dummyPlayer,//假人数据
                success: success,//匹配是否成功 只有在没网才会失败
            };
        },

        matchDummy: function (grade) {
            let dummyPlayer = this.pickDummy(grade);
            let success = true;
            if (!dummyPlayer) {
                success = false;
            }

            return {
                dummyPlayer: dummyPlayer,//假人数据
                success: success,//匹配是否成功 只有在没网才会失败
            };
        },

        //获得假人
        pickDummy: function (grade) {
            let dummy = null;
            debug.log("正在为grade为" + grade + "的玩家匹配对手")
            //初始化一个假人池,如果没有初始化过的话
            let tpUserPool = appContext.getUxManager().getUserPool();
            let gradeMatchModifier = Grade.getGradeMatchModifier(grade);

            //let fail = Math.random() * 100 < gradeMatchModifier.fail;
            if (false) {
                return dummy;
            }

            let pickExist = false;
            if (tpUserPool.length > 0) {
                pickExist = Math.random() * 100 < gradeMatchModifier.exist;
            }
            if (pickExist) {
                dummy = this.pickExsitUser(grade, tpUserPool);
            } else {
                if (Math.random() * 100 < gradeMatchModifier.bUser) {
                    dummy = this.pickNewBUser(grade);
                } else {
                    dummy = this.pickNewUser(grade);
                }
            }
            debug.log("挑选到dummy:");
            debug.log(dummy);
            appContext.getUxManager().pushUserToPool(dummy.id, dummy.basic.currentScore);
            return dummy;
        },

        pickExsitUser(grade, tpUserPool) {
            let id = tpUserPool[Math.floor(tpUserPool.length * Math.random())];
            //mix bUser and user
            if (appContext.getUxManager().userScoreDic && appContext.getUxManager().userScoreDic[id]) {
                let score = appContext.getUxManager().userScoreDic[id];
                grade = Grade.getGradeAndFillInfoByScore(score).grade;
                debug.log("使用之前的假人，score " + score);
            }
            return this.refineDummy(id, grade);
        },

        pickNewBUser(grade) {
            //美女玩家（1000~1029）
            let id = this.getBUserId(grade);
            return this.refineDummy(id, grade);
        },

        pickNewUser(grade) {
            //普通玩家id（0~699）
            let id = this.getUserId(grade);
            return this.refineDummy(id, grade);
        },

        refineDummy(id, grade) {
            let dummyUser = this.pickUserById(id);

            let oppoGrade = grade;
            let rnd = Math.random();

            if (appContext.getGameManager().soloPlay) {
                oppoGrade = grade;
            } else if (appContext.getGameManager().matchRank == 1) {
                if (rnd > 0.6) {
                    oppoGrade = 1;
                } else if (rnd > 0.3) {
                    oppoGrade = 2;
                } else {
                    oppoGrade = 3;
                }
            } else if (appContext.getGameManager().matchRank == 2) {
                if (rnd > 0.75) {
                    oppoGrade = 4;
                } else if (rnd > 0.5) {
                    oppoGrade = 5;
                } else if (rnd > 0.25) {
                    oppoGrade = 6;
                } else {
                    oppoGrade = 7;
                }
            } else if (appContext.getGameManager().matchRank == 3) {
                if (rnd > 0.65) {
                    oppoGrade = 8;
                } else if (rnd > 0.33) {
                    oppoGrade = 9;
                } else {
                    oppoGrade = 10;
                }
            } else {
                if (rnd > 0.96) {
                    oppoGrade += 3;
                } else if (rnd > 0.92) {
                    oppoGrade -= 3;
                } else if (rnd > 0.87) {
                    oppoGrade += 2;
                } else if (rnd > 0.82) {
                    oppoGrade -= 2;
                } else if (rnd > 0.66) {
                    oppoGrade += 1;
                } else if (rnd > 0.5) {
                    oppoGrade -= 1;
                }

                oppoGrade = Math.min(Math.max(oppoGrade, 0), 10);
                //debug.log("oppoGrade " + oppoGrade);
            }

            dummyUser.basic.currentScore = Grade.getFitScore(oppoGrade);
            //user.fast = (Math.random() * 20 + oppoGrade < 15);
            //debug.log("refineDummy ");
            let dummy = new Dummy(dummyUser);
            //debug.log(dummy);
            dummy.id = id;
            return dummy;
        },

        pickUserById(id) {
            let data = appContext._remoteAPI.fakePlayerInfo;
            let user = {
                basic: {
                    //nickname: "我",
                    sex: 1,//0 female, 1 male
                    //headIconUrl: null,
                    //headIconPath: null,//prior
                    //currentScore: 0,//这是总分，总分不会小于0。 显示出来的得分是计算段位之后的总分
                },
            };
            // debug.log("pickUserById ");
            // debug.log(id);
            if (id < 1000) {
                let rawData = data.data[id];
                //debug.log(rawData);
                //user.basic.nickname = rawData.nickname;
                user.basic.nickname = appContext.getUxManager().getRawNickname();
                user.basic.headIconUrl = rawData.avatarUrl;
            } else {
                user.basic.nickname = data.bUserNickNames[id - 1000];
                //user.basic.headIconPath = "playerInfo/b/" + (id - 999) + ".jpg";
                user.basic.headIconPath = "playerInfo/b/" + (id - 999);
            }

            if (appContext.getGameManager().soloPlay) {
                user.basic.nickname = "我的镜像"
            }

            return user;
        },

        getBUserId(grade) {
            let r = Math.random();
            if (grade < 3) {
                return Math.floor(r * 14 + 1000);
            } else if (grade < 5) {
                return Math.floor(r * 8 + 1014);
            } else if (grade < 7) {
                return Math.floor(r * 3 + 1022);
            } else if (grade < 9) {
                return Math.floor(r * 3 + 1025);
            } else {
                return Math.floor(r * 2 + 1028);
            }
        },

        getUserId(grade) {
            let r = Math.random();
            if (grade < 3) {
                return Math.floor(r * 150 + 0);
            } else if (grade < 5) {
                return Math.floor(r * 150 + 150);
            } else if (grade < 7) {
                return Math.floor(r * 150 + 300);
            } else if (grade < 9) {
                return Math.floor(r * 150 + 450);
            } else {
                return Math.floor(r * 100 + 600);
            }
        },
    }
});