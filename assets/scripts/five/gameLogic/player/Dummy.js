//假人，提供以下服务
//出棋 认输 悔棋 互动 掉线
//不会做出系统不支持的行为，比如低段位不能悔棋

// 假人资料:
// 基本的个人资料。公示的信息

// 本质属性：
// 假人的本质属性，永远不变

// 表现属性：(根据本质属性计算出，也接受微调))
// 根据本质属性计算出来的具体在游戏中可以体现出来的属性

let Ai = require("Ai");

let Dummy = cc.Class({

    extends: require("Player"),

    properties: {
        //假人资料
        biography: {
            default: null,
        },

        //本质属性
        personality: {
            default: null,
        },

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

        this.task = [];
        this.taskProcessTimer = this.taskProcessTime;

        //为本质属性，个人资料赋值，并由此计算出其外在属性
        this.biography = param.biography;
        this.personality = param.personality;
        this.status = Dummy.getStatus(this.biography, this.personality);

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
            //debug.log("dummy processTask " + task.turns);
            task.turns -= 1;
        } else {
            finished = true;
            //debug.log("dummy  finish processTask " + task.type);
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


        let myTurn = Math.floor((game.currentTurn + 1) / 2);

        if (myTurn > 3 && Math.random() < this.status.offlineChance / 100) {
            if (Math.random() < 0.4) {
                debug.log("dummy offline timeout");
                this.addTask({
                    turns: 30,
                    type: 2,
                });
                return;
            }

            debug.log("dummy offline socket bad");
            this.offline();  // 如果返回空，默认为对手掉线
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

        if (WechatAPI.isEnabled()) {
            //如果是微信平台，发送消息给副线程
            WechatAPI.threadWorker.startWorker(param);
        } else {
            //如果不是微信平台，调用主域的ai，同步执行代码，会卡
            let solution = Ai.getSolution(param);
            this.makeDecision(solution);
        }
    },

    offline: function () {
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
            turns: Math.random() * 2 + 0.3,
            type: 3,
            param: grab,
        });
    },

    grabFirst: function (grab) {
        debug.log("假人抢先手:" + grab);

        appContext.getGameManager().playerGrabFirst(this.index, grab);
    },

    makeDecision: function (solution) {
        if (solution == null) {
            this.offline();  // 如果返回空，默认为对手掉线
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

            if (solution.oppoPro > 1 && Math.random() < this.status.admitLooseChance / 100) {
                this.surrender();
                return;
            }
        }

        if (solution.selfPro >= 1) {
            //有优势
            this.onPro();
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

        getStatus: function (bio, per) {
            let missChance = 18;
            let offlineChance = 8;
            let rawSolutionTurns = 3;
            let admitLooseChance = 30;
            let grabFirstChance = 1;

            switch (bio.grade) {
                case 1:
                    missChance = 60;
                    offlineChance = 2;
                    rawSolutionTurns = 2 + Math.floor(Math.random() * 2.4);
                    admitLooseChance = 20;
                    grabFirstChance = 1;
                    break;

                case 2:
                    missChance = 50;
                    offlineChance = 2;
                    rawSolutionTurns = 2 + Math.floor(Math.random() * 1.7);
                    admitLooseChance = 30;
                    grabFirstChance = 9;
                    break;

                case 3:
                    missChance = 38;
                    offlineChance = 2;
                    rawSolutionTurns = 1 + Math.floor(Math.random() * 2);
                    admitLooseChance = 40;
                    grabFirstChance = 16;
                    break;

                case 4:
                    missChance = 28;
                    offlineChance = 2;
                    rawSolutionTurns = 1 + Math.floor(Math.random() * 1.5);
                    admitLooseChance = 30;
                    grabFirstChance = 25;
                    break;

                case 5:
                    missChance = 20;
                    offlineChance = 1;
                    rawSolutionTurns = 1;
                    admitLooseChance = 20;
                    grabFirstChance = 36;
                    break;

                case 6:
                    missChance = 12;
                    offlineChance = 1;
                    rawSolutionTurns = Math.floor(Math.random() * 2);
                    admitLooseChance = 16;
                    grabFirstChance = 42;
                    break;

                case 7:
                    missChance = 8;
                    offlineChance = 1;
                    rawSolutionTurns = Math.floor(Math.random() * 1.5);
                    admitLooseChance = 13;
                    grabFirstChance = 50;
                    break;

                case 8:
                    missChance = 5;
                    offlineChance = 1;
                    rawSolutionTurns = Math.floor(Math.random() * 1.2);
                    admitLooseChance = 10;
                    grabFirstChance = 60;
                    break;

                case 9:
                    missChance = 2;
                    offlineChance = 0;
                    rawSolutionTurns = 0;
                    admitLooseChance = 8;
                    grabFirstChance = 75;
                    per.playStyle = 0;//强制没有风格
                    break;

                case 10:
                    missChance = 0;
                    offlineChance = 0;
                    rawSolutionTurns = 0;
                    admitLooseChance = 2;
                    grabFirstChance = 85;
                    per.playStyle = 0;//强制没有风格
                    break;
            }

            let turnTimeMin = 1;
            let turnTimeMax = 5;

            switch (per.playSpeed) {
                case 1:
                    turnTimeMin = 0.5;
                    turnTimeMax = 3.1;
                    break;

                case 2:
                    turnTimeMin = 1;
                    turnTimeMax = 5.5;
                    break;

                case 3:
                    turnTimeMin = 5.5;
                    turnTimeMax = 12;
                    break;

                case 4:
                    turnTimeMin = 0.5;
                    turnTimeMax = 13;
                    break;
            }

            let evaluatingParam = null; //设置下棋风格
            //平均，原有参数为   [[0, 1], [2, 3], [4, 12], [10, 64], [256, 256]],
            if (per.playStyle == 1) {
                evaluatingParam = [[0, 2], [2, 8], [4, 60], [10, 64], [256, 256]];  //黑棋进攻，白棋防御
            } else if (per.playStyle == 2) {
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