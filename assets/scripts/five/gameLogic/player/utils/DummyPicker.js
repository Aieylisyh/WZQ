let Dummy = require("Dummy");
let Grade = require("Grade");

cc.Class({
    statics: {
        matchOpponent: function () {
            //搜索对手时调用，什么参数都不用传
            //会自动检测是否有网，自动分配合理的对手
            let user = appContext.getUxManager().getUserInfo();
            let gradeAndFillInfo = Grade.getGradeAndFillInfoByScore(user.basic.currentScore);
            //let gradeInfo = Grade.getGradeInfo(gradeAndFillInfo.grade);
            debug.log("matchOpponent");
            debug.log(user);
            let dummyPlayer = this.pickDummy(gradeAndFillInfo.grade);
            let success = true;
            if (!dummyPlayer) {
                success = false;
            }

            return {
                dummyPlayer: dummyPlayer,//假人数据
                success: success,//匹配是否成功 只有在没网才会失败
            };
        },

        userExample() {
            let user = {
                basic: {
                    //基本资料。永远不变，也不会被影响其表现
                    nickname: "tester proto",
                    sex: 0,//0 female, 1 male
                    headIconUrl: "http://g.hiphotos.baidu.com/zhidao/pic/item/5366d0160924ab18c9b4abbc37fae6cd7a890b9e.jpg",
                    headIconPath: null,//prior
                    maxKeepWin: 1,
                    totalHands:13,
                    winCount: 2,
                    roundCount: 4,
                    currentScore: 1000,//这是总分，总分不会小于0。 显示出来的得分是计算段位之后的总分
                },
                //本质属性，永远不变，可能被影响
                personality: {
                    playSpeed: 1,//下棋速度 1 fast 2 normal 3 slow 4 unstable
                    playStyle: 2,//下棋风格0 normal 1 pro attack 2 pro defense
                    interactionPreference: 1,//互动偏好 0 none 1 emoji 2 text 
                    interactionFreqRate: 2,// 互动频率等级 1~5 level
                    interactionPropriety: 4,// 互动适当性等级 1~5 level spam rate, reply / greeting when need / express before win/loose
                },

                //表现属性，非必须
                //not necessairy to set these properities
                extraStatus: {
                    // missChance: 90,//% 点歪或者下错几率
                    // offlineChance: 0,//% 掉线几率
                    // evaluatingParam: null,// 下棋攻防修正参数，写null使用默认
                    // rawSolutionTurns: 0,//前几步乱下

                    // admitLooseChance: 0,//% 劣势认输率
                    // grabFirstChance: 25,//% 抢先手几率

                    // turnTimeMin: 0, //回合最小时间
                    // turnTimeMax: 0, //回合最大时间

                    // interactionEmojiChance: 70,//% 互动使用表情几率
                    // interactionChance: 20,//% 互动率
                    // interactionIntervalMin: 7,//% 互动最小间隔
                    // interactionIntervalMax: 12,//% 互动最大间隔
                    // interactionReplyChance: 70,//% 回复互动率
                    // greetingChance: 20,//% 见面问候率 再次见面为其5倍
                    // expressBeforeLooseChance: 70,//% 劣势/失误表达率
                    // expressBeforeWinChance: 70,//% 优势表达率
                },
            };

            return user;
        },

        //获得假人
        pickDummy: function (grade) {
            let dummy = null;
            debug.log("正在为grade为" + grade + "的玩家匹配对手")
            //初始化一个假人池,如果没有初始化过的话
            let tpUserPool = appContext.getUxManager().getUserPool();
            let gradeMatchModifier = Grade.getGradeMatchModifier(grade);

            let fail = Math.random() * 100 < gradeMatchModifier.fail;
            if (fail) {
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
            appContext.getUxManager().pushUserToPool(dummy.id);
            return dummy;
        },

        pickExsitUser(grade, tpUserPool) {
            let id = tpUserPool[Math.floor(tpUserPool.length * Math.random())];
            //mix bUser and user
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
            let user = this.pickUserById(id);

            let oppoGrade = grade;
            let rnd = Math.random();
            if (rnd > 0.95) {
                oppoGrade += 3;
            } else if (rnd > 0.9) {
                oppoGrade -= 3;
            } else if (rnd > 0.85) {
                oppoGrade += 2;
            } else if (rnd > 0.8) {
                oppoGrade -= 2;
            } else if (rnd > 0.6) {
                oppoGrade += 1;
            } else if (rnd > 0.4) {
                oppoGrade -= 1;
            }

            oppoGrade = Math.min(Math.max(oppoGrade, 0), 10);
            //debug.log("oppoGrade " + oppoGrade);
            user.basic.currentScore = Grade.getFitScore(oppoGrade);
            //user.fast = (Math.random() * 20 + oppoGrade < 15);
            //debug.log("refineDummy ");
            let dummy = new Dummy(user);
            debug.log(dummy);
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
            debug.log("pickUserById ");
            debug.log(id);
            if (id < 1000) {
                let rawData = data.data[id];
                debug.log(rawData);
                user.basic.nickname = rawData.nickname;
                user.basic.headIconUrl = rawData.avatarUrl;
            } else {
                user.basic.nickname = data.bUserNickNames[id - 1000];
                //user.basic.headIconPath = "playerInfo/b/" + (id - 999) + ".jpg";
                user.basic.headIconPath = "playerInfo/b/" + (id - 999);
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