//假人，提供以下服务
//出棋 认输 悔棋 互动 掉线
//不会做出系统不支持的行为，比如低段位不能悔棋

// 假人资料:
// 基本的个人资料。公示的信息

// 本质属性：
// 假人的本质属性，永远不变

// 表现属性：(根据本质属性计算出，也接受微调))
// 根据本质属性计算出来的具体在游戏中可以体现出来的属性
let DialogTypes = require("DialogTypes");
let Ai = require("Ai");
let Grade = require("Grade");
const WechatAPI = require("../../../com/managers/WechatAPI");

let Dummy = cc.Class({

    extends: require("Player"),

    properties: {
        //表现属性
        status: {
            default: null,
        },

        //当前假人的任务，任务有下棋（断线，认输），回复表情，处理用户请求等等
        tasks: [],

        //任务处理的单位时间
        taskProcessTime: 1,
    },

    __ctor__: function (param) {
        this.type = "dummy";

        debug.log("dummy init");
        debug.log(param);

        this.clearTask();
        this.taskProcessTimer = this.taskProcessTime;

        //为本质属性，个人资料赋值，并由此计算出其外在属性
        this.basic = param.basic;
        this.status = Dummy.getStatus(param);

        //为额外的外在属性赋值（如果有的话）
        if (param.extraStatus) {
            for (let i in param.extraStatus) {
                //debug.log("replace status " + i + "\n" + param.extraStatus[i]);
                if (param.extraStatus[i] != null) {
                    this.status[i] = param.extraStatus[i]
                }
            }
        }

        debug.log(this.status);
    },

    onUpdate: function (dt) {
        this.taskProcessTimer -= dt;

        if (this.taskProcessTimer < 0) {
            this.taskProcessTimer += this.taskProcessTime;
            this.processTasks();
        }
    },

    isSelf: function () {
        return false;
    },

    addTask: function (task) {
        debug.log("+dummy task");
        debug.log(task);
        this.tasks.push(task);
    },

    processTasks: function () {
        for (let i = 0; i < this.tasks.length; i++) {
            let finished = this.processTask(this.tasks[i]);

            if (finished) {
                this.tasks.splice(i, 1);
            }
        }
    },

    notifyPlay: function () {
        //debug.log("dummy notifyPlay");
        if (appContext.getGameManager().soloPlay) {
            //摆棋模式
            appContext.getGameManager().chessboardManager.setLocked(false);
        } else {
            appContext.getGameManager().chessboardManager.setLocked(true);
            this.addTask(Dummy.getPlayChessTask(this.status));
        }
    },

    clearTask() {
        this.tasks = [];
    },

    //执行一个task
    processTask: function (task) {
        let finished = false;

        if (task.turns > 0) {
            //debug.log("dummy processTask " + task.turns);
            task.turns -= 1;
        } else {
            finished = true;
            debug.log("dummy finish processTask " + task.type);
            switch (task.type) {
                case 1:
                    //一般下棋 这个动作中，也可能下歪 可能认输
                    this.playChess();
                    break;

                case 2:
                    //掉线
                    this.offline();
                    break;

                case 3:
                    //抢先手
                    this.grabFirst(task.param);
                    break;

                case 4:
                    //认输
                    this.surrender();
                    break;

                case 5:
                    //chat
                    this.chat(task.param);
            }
        }

        return finished;
    },

    setFirst: function (isFirst) {
        this.isFirst = isFirst;
        this.chessType = isFirst ? 1 : 2;
    },

    playChess: function () {
        let game = appContext.getGameManager().game;
        if (game == null) {
            return;
        }
        let cbm = appContext.getGameManager().chessboardManager;
        //正在移动棋子，等玩家
        if (cbm.deplacing) {
            return;
        }

        // debug.log("dummy playChess");
        let myTurn = Math.floor((game.currentTurn + 1) / 2);

        if (myTurn > 8 && Math.random() < this.status.offlineChance / 100) {
            debug.log("dummy will addOffLineTask");
            this.addOffLineTask();
            return;
        }

        let param = Ai.getAnalyseParam();
        param.type = this.chessType;

        if (Math.random() < this.status.missChance / 100) {
            debug.log("dummy will miss play ");
            param.missPlay = true;
        } else if (myTurn <= this.status.rawSolutionTurns) {
            debug.log("dummy will use raw solution");
            param.rawSolution = true;
        }

        param.evaluatingParam = this.status.evaluatingParam;
        param.coreNoMiss = this.status.coreNoMiss;
        // if (WechatAPI.isEnabled()) {
        //     //如果是微信平台，发送消息给副线程
        //     WechatAPI.threadWorker.startWorker(param);
        // } else {
        //     //如果不是微信平台，调用主域的ai，同步执行代码，会卡
        //     let solution = Ai.getSolution(param);
        //     this.makeDecision(solution);
        // }
        let solution = Ai.getSolution(param);
        this.makeDecision(solution);
    },

    offline: function () {
        if (appContext.getGameManager().getCurrentPlayerIsSelf()) {
            return;
        }

        //try { throw new Exception(); } catch (e) { debug.log(e) }
        debug.log("假人掉线了");
        appContext.getGameManager().playerWin(3 - this.chessType, true);
    },

    surrender: function () {
        if (appContext.getGameManager().getCurrentPlayerIsSelf()) {
            return;
        }

        debug.log("假人认输了");
        appContext.getGameManager().playerWin(3 - this.chessType, false, true);
    },

    notifyGrabFirst: function () {
        debug.log("假人在决定是否抢先手");
        let grab = false;
        if (Math.random() < this.status.grabFirstChance / 100) {
            grab = true;
        }

        this.addTask({
            turns: Math.random() * 2 + 0.2,
            type: 3,
            param: grab,
        });
    },

    addOffLineTask() {
        //let time = Math.random() * 5 + 25;
        let time = Math.random() * 10 + 22;
        debug.log("dummy addOffLineTask " + time);
        this.addTask({
            turns: time,
            type: 2,
        });
    },

    addSurrenderTask() {
        let time = Math.random() * 10;
        this.addTask({
            turns: time,
            type: 4,
        });
    },

    addChatTask(param, enableMultiAdd = true, isReAdd = false) {
        let time = Math.random() * 2.4 + 0.5;
        if (isReAdd) {
            time = Math.random() * 0.6 + 0.5;
        }

        debug.log("dummy addChatTask " + time);
        debug.log(param);
        this.addTask({
            turns: time,
            type: 5,
            param: param,
        });

        if (enableMultiAdd && Math.random() > 0.8) {
            debug.log("re addChatTask ");
            this.addChatTask(param, true, true);
        }
    },

    grabFirst: function (grab) {
        debug.log("假人抢先手:" + grab);
        if (grab) {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "对手使用了先手卡");
        }
        appContext.getGameManager().playerGrabFirst(this.index, grab);
    },

    makeDecision: function (solution) {
        if (appContext.getGameManager().getCurrentPlayerIsSelf()) {
            return;
        }

        if (solution == null) {
            debug.log("因为solution == null掉线");
            this.addOffLineTask();  // 如果返回空，默认为对手掉线
            return;
        }

        let cbm = appContext.getGameManager().chessboardManager;
        if (cbm == null) {
            debug.log("cbm is null!");
            return;
        }

        if (appContext.getGameManager().game.currentChessType != this.chessType) {
            debug.log("currentChessType not match dummy!");
            return;
        }

        if (solution.isMiss) {
            this.onMiss();
        }

        if (solution.oppoPro >= 1) {
            //有劣势
            this.onCon();

            if (solution.oppoPro > 1.01 && Math.random() < this.status.admitLooseChance / 100) {
                this.addSurrenderTask();
                return;
            }
        }

        if (solution.selfPro >= 1) {
            //有优势
            this.onPro();
        }

        cbm.commitChessAt(solution.x, solution.y, solution.type);
    },

    replyChat(replyOriginType) {
        if (appContext.getGameManager().soloPlay) {
            return;
        }

        if (Math.random() > 0.5) {
            this.addChatTask({
                isReply: true,
                replyOriginType: replyOriginType,
            });
        }
    },

    chat(param) {
        if (!param) {
            return;
        }

        let modifier = {};
        debug.log("dummy chat");
        debug.log(param);

        if (param.isReply) {
            switch (param.replyOriginType) {
                case "happy":
                    modifier.happy = true;
                    modifier.smile = true;
                    break;

                case "normal":
                    modifier.normal = true;
                    modifier.happy = true;
                    modifier.smile = true;
                    modifier.die = true;
                    break;

                case "die":
                    modifier.die = true;
                    modifier.smile = true;
                    modifier.happy = true;
                    break;

                case "love":
                    modifier.love = true;
                    modifier.normal = true;
                    modifier.die = true;
                    break;

                case "smile":
                    modifier.smile = true;
                    modifier.happy = true;
                    break;

                default:
                    modifier.happy = true;
                    modifier.smile = true;
                    modifier.love = true;
                    break;

            }
        }

        if (param.miss) {
            modifier.miss = true;
        }
        if (param.toWin) {
            modifier.toWin = true;
        }
        if (param.toLoose) {
            modifier.toLoose = true;
        }

        appContext.getGameManager().showChat(false, Dummy.getEmojiType(modifier));
    },

    onPro: function () {
        debug.log("假人的机会来了");
        if (Math.random() > 0.85) {
            this.addChatTask({
                toWin: true,
            });
        }
    },

    onCon: function () {
        debug.log("假人快没希望了");
        if (Math.random() > 0.9) {
            this.addChatTask({
                toLoose: true,
            });
        }
    },

    onMiss() {
        if (Math.random() > 0.4) {
            this.addChatTask({
                miss: true,
            });
        }
    },

    destroy: function () {
        this.clearTask();
    },

    statics: {
        getEmojiType(modifier) {
            debug.log("getEmojiType");
            debug.log(modifier);
            let pool = [];
            pool.push("happy");
            pool.push("normal");
            pool.push("die");
            pool.push("love");
            pool.push("smile");
            if (modifier) {
                if (modifier.miss) {
                    pool.push("die");
                    pool.push("die");
                    pool.push("normal");
                    pool.push("normal");
                    pool.push("normal");
                }

                if (modifier.toWin) {
                    pool.push("happy");
                    pool.push("happy");
                    pool.push("happy");
                    pool.push("smile");
                    pool.push("smile");
                    pool.push("smile");
                    pool.push("die");
                }

                if (modifier.toLoose) {
                    pool.push("normal");
                    pool.push("normal");
                    pool.push("normal");
                    pool.push("die");
                    pool.push("die");
                    pool.push("love");
                }

                if (modifier.happy) {
                    for (let i = 0; i < 4; i++) {
                        pool.push("happy");
                    }
                }

                if (modifier.normal) {
                    for (let i = 0; i < 4; i++) {
                        pool.push("normal");
                    }
                }

                if (modifier.die) {
                    for (let i = 0; i < 4; i++) {
                        pool.push("die");
                    }
                }

                if (modifier.love) {
                    for (let i = 0; i < 4; i++) {
                        pool.push("love");
                    }
                }

                if (modifier.smile) {
                    for (let i = 0; i < 4; i++) {
                        pool.push("smile");
                    }
                }
            }

            return pool[Math.floor(pool.length * Math.random())];
        },

        getPlayChessTask: function (status) {
            let turnTime = status.turnTimeMin + Math.random() * (status.turnTimeMax - status.turnTimeMin);
            if (debug.enableLog) {
                turnTime = 0;
            }

            debug.log("dummy will play in " + turnTime);
            return {
                turns: turnTime,
                type: 1,
            };
        },

        getStatus: function (param) {
            let grade = Grade.getGradeAndFillInfoByScore(param.basic.currentScore).grade;
            debug.log(param);
            debug.log("dummy getStatus " + grade);

            let missChance = 18;
            let offlineChance = 0;
            let rawSolutionTurns = 3;
            let admitLooseChance = 15;
            let grabFirstChance = 1;

            let turnTimeMin = 0;
            let turnTimeMax = 1;
            let fastChance = 0.5;
            let turnTimeAdd = 0;

            let playStyle = 0;
            let coreNoMiss = 95;

            switch (grade) {
                case 1:
                    missChance = 90;
                    offlineChance = 0;
                    rawSolutionTurns = 5 + Math.floor(Math.random() * 4);
                    admitLooseChance = 0;
                    grabFirstChance = 10;
                    fastChance = 96;
                    turnTimeAdd = -0.1;
                    playStyle = 2;
                    coreNoMiss = 45;
                    break;

                case 2:
                    missChance = 80;
                    offlineChance = 0;
                    rawSolutionTurns = 4 + Math.floor(Math.random() * 4);
                    admitLooseChance = 35;
                    grabFirstChance = 10;
                    fastChance = 92;
                    turnTimeAdd = -0.1;
                    playStyle = 1;
                    coreNoMiss = 50;
                    break;

                case 3:
                    missChance = 75;
                    offlineChance = 0.3;
                    rawSolutionTurns = 3 + Math.floor(Math.random() * 3);
                    admitLooseChance = 35;
                    grabFirstChance = 10;
                    fastChance = 90;
                    turnTimeAdd = 0;
                    playStyle = 2;
                    coreNoMiss = 60;
                    break;

                case 4:
                    missChance = 40;
                    offlineChance = 0.5;
                    rawSolutionTurns = 2 + Math.floor(Math.random() * 3);
                    admitLooseChance = 20;
                    grabFirstChance = 30;
                    fastChance = 80;
                    turnTimeAdd = 0;
                    playStyle = 1;
                    coreNoMiss = 75;
                    break;

                case 5:
                    missChance = 25;
                    offlineChance = 0.5;
                    rawSolutionTurns = 1 + Math.floor(Math.random() * 3);
                    admitLooseChance = 15;
                    grabFirstChance = 35;
                    fastChance = 80;
                    turnTimeAdd = 0;
                    playStyle = 2;
                    coreNoMiss = 90;
                    break;

                case 6:
                    missChance = 16;
                    offlineChance = 0.3;
                    rawSolutionTurns = Math.floor(Math.random() * 3);
                    admitLooseChance = 12;
                    grabFirstChance = 40;
                    fastChance = 80;
                    turnTimeAdd = 0;
                    playStyle = 1;
                    coreNoMiss = 93;
                    break;

                case 7:
                    missChance = 9;
                    offlineChance = 0.1;
                    rawSolutionTurns = Math.floor(Math.random() * 2);
                    admitLooseChance = 10;
                    grabFirstChance = 50;
                    fastChance = 80;
                    turnTimeAdd = 0;
                    coreNoMiss = 95;
                    break;

                case 8:
                    missChance = 4;
                    offlineChance = 0;
                    rawSolutionTurns = 0;
                    admitLooseChance = 5;
                    grabFirstChance = 55;
                    fastChance = 80;
                    turnTimeAdd = 0;
                    coreNoMiss = 96;
                    break;

                case 9:
                    missChance = 2;
                    offlineChance = 0;
                    rawSolutionTurns = 0;
                    admitLooseChance = 1;
                    grabFirstChance = 75;
                    fastChance = 75;
                    turnTimeAdd = 0.5;
                    coreNoMiss = 98;
                    break;

                case 10:
                    missChance = 0;
                    offlineChance = 0;
                    rawSolutionTurns = 0;
                    admitLooseChance = 0;
                    grabFirstChance = 80;
                    fastChance = 75;
                    turnTimeAdd = 0.7;
                    coreNoMiss = 100;
                    break;
            }

            turnTimeMin = 0.4 + turnTimeAdd;
            if (Math.random() * 100 > fastChance) {
                turnTimeMax = 7 + turnTimeAdd;
            } else {
                turnTimeMax = 2.7 + turnTimeAdd;
            }

            //offlineChance = 100;//test
            // turnTimeMin = 0;//test
            // turnTimeMax = 0;//test

            // missChance = 0;
            // offlineChance = 0;
            // rawSolutionTurns = 0;
            // admitLooseChance = 0;
            // grabFirstChance = 0;
            // fastChance = 100;
            // turnTimeAdd = 0;

            //TODO
            let evaluatingParam = null; //设置下棋风格
            //平均，原有参数为   [[0, 1], [2, 3], [4, 12], [10, 64], [256, 256]],
            if (playStyle == 1) {
                evaluatingParam = [[0, 2], [2, 8], [4, 60], [10, 64], [256, 256]];  //黑棋进攻，白棋防御
            } else if (playStyle == 2) {
                evaluatingParam = [[0, 1], [4, 5], [10, 12], [10, 64], [256, 256]];     //黑棋防御，白棋进攻
            }

            return {
                missChance: missChance,//% 点歪或者下错几率
                //在威胁值不高时可能使用raw solution，也可能点歪
                //在威胁值高时可能点歪，几率会下降到原先的5% f

                offlineChance: offlineChance,//% 第4手开始的掉线几率 f
                evaluatingParam: evaluatingParam,// 下棋攻防修正参数，写null使用默认 f
                rawSolutionTurns: rawSolutionTurns,//前几步乱下 f

                admitLooseChance: admitLooseChance,//% 劣势认输率 f
                grabFirstChance: grabFirstChance,//% 抢先手率 f

                turnTimeMin: turnTimeMin, //回合最小时间 f
                turnTimeMax: turnTimeMax, //回合最大时间 f

                coreNoMiss: coreNoMiss,
            };
        },
    },

});