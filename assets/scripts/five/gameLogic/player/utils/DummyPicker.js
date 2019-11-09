let Dummy = require("Dummy");

cc.Class({
    statics: {
        matchOpponent: function () {
            //搜索对手时调用，什么参数都不用传
            //会自动检测是否有网，自动分配合理的对手

            let dummyParam = this.pickTestDummy();
            let time = 1 + Math.random() * 3;
            let success = true;

            return {
                dummyParam: dummyParam,//假人数据
                time: time,//匹配时间
                success: success,//匹配是否成功 只有在没网才会失败
            };
        },

        //用段位，性别，城市挑选假人，都是可选参数
        pickDummy: function (grade, sex, city) {

        },

        //用名字精确挑选假人
        pickDummyByName: function (nickName) {

        },

        // 再次挑选上一局对手假人
        pickLastRoundDummy: function () {

        },

        //挑选测试假人
        //这里罗列了所有的假人属性
        pickTestDummy: function () {
            let param = {
                //基本资料。永远不变，也不会被影响其表现
                biography: {
                    nickName: "游客玩家",
                    sex: 0,//0 female, 1 male
                    grade: 10,
                    image: "http://g.hiphotos.baidu.com/zhidao/pic/item/5366d0160924ab18c9b4abbc37fae6cd7a890b9e.jpg",
                    city: "仙本那",
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

            return new Dummy(param);
        },
    }
});