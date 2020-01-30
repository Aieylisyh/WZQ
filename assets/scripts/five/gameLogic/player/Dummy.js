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

        this.tasks = [];
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
        debug.log("假人任务");
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
        appContext.getGameManager().chessboardManager.setLocked(true);

        this.addTask(Dummy.getPlayChessTask(this.status));
    },

    //执行一个task
    processTask: function (task) {
        let finished = false;

        if (task.turns > 0) {
            debug.log("dummy processTask " + task.turns);
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
                    this.surrender();
                    break;
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

        debug.log("dummy playChess");
        let myTurn = Math.floor((game.currentTurn + 1) / 2);

        if (myTurn > 3 && Math.random() < this.status.offlineChance / 100) {
            debug.log("dummy will addOffLineTask");
            this.addOffLineTask();
            return;
        }

        let param = Ai.getAnalyseParam();
        param.type = this.chessType;


        if (myTurn <= this.status.rawSolutionTurns) {
            debug.log("dummy will use raw solution");
            param.rawSolution = true;
        }

        if (Math.random() < this.status.missChance / 100) {
            debug.log("dummy will miss play ");
            param.missPlay = true;
        }

        param.evaluatingParam = this.status.evaluatingParam;

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
        try { throw new Exception(); } catch (e) { debug.log(e) }
        debug.log("假人掉线了");
        appContext.getGameManager().playerWin(3 - this.chessType, true);
    },

    surrender: function () {
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
            turns: Math.random() * 4.8 + 0.2,
            type: 3,
            param: grab,
        });
    },

    addOffLineTask() {
        let time = Math.random() * 5 + 25;
        debug.log("dummy addOffLineTask " + time);
        this.addTask({
            turns: time,
            type: 2,
        });
    },

    addSurrenderTask() {
        let time = Math.random() * 10 + 1;
        this.addTask({
            turns: time,
            type: 4,
        });
    },

    grabFirst: function (grab) {
        debug.log("假人抢先手:" + grab);
        if (grab) {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "对手使用了先手卡");
        }
        appContext.getGameManager().playerGrabFirst(this.index, grab);
    },

    makeDecision: function (solution) {
        if (solution == null) {
            this.addOffLineTask();  // 如果返回空，默认为对手掉线
            return;
        }

        let cbm = appContext.getGameManager().chessboardManager;
        if (cbm == null) {
            debug.log("cbm is null!");
            return;
        }

        if (appContext.getGameManager().game.currentChessType != this.chessType) {
            debug.log("currentChessType is not match!");
            return;
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
            if (Math.random() > 0.25) {
                //chat
            }
        }

        cbm.commitChessAt(solution.x, solution.y, solution.type);
    },

    statics: {
        getPlayChessTask: function (status) {
            let turnTime = status.turnTimeMin + Math.random() * (status.turnTimeMax - status.turnTimeMin);

            debug.log("dummy will play in " + turnTime);
            return {
                turns: turnTime,
                type: 1,
            };
        },

        getStatus: function (param) {
            debug.log("dummy getStatus");
            debug.log(param);

            let missChance = 18;
            let offlineChance = 8;
            let rawSolutionTurns = 3;
            let admitLooseChance = 15;
            let grabFirstChance = 1;

            let turnTimeMin = 0;
            let turnTimeMax = 1;
            let fastChance = 0.5;
            let turnTimeAdd = 0;

            switch (param.grade) {
                case 1:
                    missChance = 65;
                    offlineChance = 0;
                    rawSolutionTurns = 2 + Math.floor(Math.random() * 2.8);
                    admitLooseChance = 15;
                    grabFirstChance = 5;
                    fastChance = 90;
                    turnTimeAdd = 0;
                    break;

                case 2:
                    missChance = 50;
                    offlineChance = 1;
                    rawSolutionTurns = 2 + Math.floor(Math.random() * 1.9);
                    admitLooseChance = 25;
                    grabFirstChance = 8;
                    fastChance = 80;
                    turnTimeAdd = 0;
                    break;

                case 3:
                    missChance = 38;
                    offlineChance = 1;
                    rawSolutionTurns = 1 + Math.floor(Math.random() * 2.2);
                    admitLooseChance = 30;
                    grabFirstChance = 15;
                    fastChance = 70;
                    turnTimeAdd = 0;
                    break;

                case 4:
                    missChance = 28;
                    offlineChance = 1;
                    rawSolutionTurns = 1 + Math.floor(Math.random() * 1.5);
                    admitLooseChance = 20;
                    grabFirstChance = 25;
                    fastChance = 70;
                    turnTimeAdd = 0;
                    break;

                case 5:
                    missChance = 20;
                    offlineChance = 1;
                    rawSolutionTurns = 1;
                    admitLooseChance = 15;
                    grabFirstChance = 35;
                    fastChance = 70;
                    turnTimeAdd = 0;
                    break;

                case 6:
                    missChance = 12;
                    offlineChance = 1;
                    rawSolutionTurns = Math.floor(Math.random() * 2);
                    admitLooseChance = 12;
                    grabFirstChance = 45;
                    fastChance = 70;
                    turnTimeAdd = 0;
                    break;

                case 7:
                    missChance = 8;
                    offlineChance = 1;
                    rawSolutionTurns = Math.floor(Math.random() * 1.5);
                    admitLooseChance = 7;
                    grabFirstChance = 50;
                    fastChance = 70;
                    turnTimeAdd = 0;
                    break;

                case 8:
                    missChance = 5;
                    offlineChance = 1;
                    rawSolutionTurns = Math.floor(Math.random() * 1.2);
                    admitLooseChance = 5;
                    grabFirstChance = 60;
                    fastChance = 60;
                    turnTimeAdd = 0;
                    break;

                case 9:
                    missChance = 2;
                    offlineChance = 0;
                    rawSolutionTurns = 0;
                    admitLooseChance = 1;
                    grabFirstChance = 70;
                    per.playStyle = 0;//强制没有风格
                    fastChance = 50;
                    turnTimeAdd = 0.6;
                    break;

                case 10:
                    missChance = 0;
                    offlineChance = 0;
                    rawSolutionTurns = 0;
                    admitLooseChance = 0;
                    grabFirstChance = 80;
                    per.playStyle = 0;//强制没有风格
                    fastChance = 55;
                    turnTimeAdd = 0.9;
                    break;
            }

            if (Math.random() * 100 > fastChance) {
                turnTimeMin = 1.2 + turnTimeAdd;
                turnTimeMax = 15 + turnTimeAdd;
            } else {
                turnTimeMin = 0.4 + turnTimeAdd;
                turnTimeMax = 3.2 + turnTimeAdd;
            }

            turnTimeMin = 0;
            turnTimeMax = 0;//test

            let evaluatingParam = null; //设置下棋风格
            //平均，原有参数为   [[0, 1], [2, 3], [4, 12], [10, 64], [256, 256]],
            if (param.playStyle == 1) {
                evaluatingParam = [[0, 2], [2, 8], [4, 60], [10, 64], [256, 256]];  //黑棋进攻，白棋防御
            } else if (param.playStyle == 2) {
                evaluatingParam = [[0, 1], [4, 5], [10, 12], [10, 64], [256, 256]];     //黑棋防御，白棋进攻
            }

            //TODO 表情相关的属性设置

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

                interactionEmojiChance: 70,//% 互动使用表情几率
                interactionChance: 20,//% 互动率
                interactionIntervalMin: 7,//% 互动最小间隔
                interactionIntervalMax: 12,//% 互动最大间隔
                interactionReplyChance: 70,//% 回复互动率
                greetingChance: 20,//% 见面问候率 再次见面为其5倍
                expressBeforeLooseChance: 70,//% 劣势/失误表达率
                expressBeforeWinChance: 70,//% 优势表达率
            };
        },
    },

    onPro: function () {
        debug.log("假人的机会来了");
        // 根据敌我情势 oppoPro selfPro 实现特殊行为，比如炫耀表情 主动认输等等
    },

    onCon: function () {
        debug.log("假人快没希望了");
    },

    destroy: function () {
        this.tasks = [];
    },
});