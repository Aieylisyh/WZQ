let item = {
    Mine: {
        desc: "最常见而重要的资源，除了作为海上的货币，几乎所有的工程都需要",
        subDesc: "有矿能使鬼推磨",
        imgUrl: "image/item/Mine",
        thumbName: "Mine",
        name: "矿物",
        unit: "块",
        price: 1,
        short: "A",
    },

    TurtleRock: {
        desc: "类似海龟的壳的石头，有一点软，是很好的绝缘材料。多分布于近海",
        subDesc: "这貌似就是个龟壳",
        imgUrl: "image/item/Turt",
        thumbName: "Turt",
        name: "龟岩",
        unit: "块",
        price: 100, //卖矿物的价格
        usage: {
            type: "sell",
        },
        short: "B",
    },

    VolcanicRock: {
        desc: "深海中才能找到的，海底火山喷发后留下的石头，隔热性能很好",
        subDesc: "有的被采集时还有着温度",
        imgUrl: "image/item/Volc",
        thumbName: "Volc",
        name: "火山岩",
        unit: "块",
        price: 200,
        usage: {
            type: "sell",
        },
        short: "C",
    },

    Sapphire: {
        desc: "主要成分是氧化铝，蓝色是由于混有少量钛和铁所致。是某些工程必需的材料",
        subDesc: "据说不是红色的都叫蓝宝石",
        imgUrl: "image/item/Sapp",
        thumbName: "Sapp",
        name: "蓝宝石",
        unit: "颗",
        price: 5000,
        usage: {
            type: "sell",
        },
        short: "D",
    },

    Ruby: {
        desc: "主要成分是氧化铝，红色来自铬。是某些工程必需的材料",
        subDesc: "天然的非常稀少",
        imgUrl: "image/item/Ruby",
        thumbName: "Ruby",
        name: "红宝石",
        unit: "颗",
        price: 7000,
        usage: {
            type: "sell",
        },
        short: "E",
    },

    Diamond: {
        desc: "由碳元素组成的，天然存在的最坚硬的物质。是某些工程必需的材料",
        subDesc: "不小心被营销成了定情信物",
        imgUrl: "image/item/Diamond",
        thumbName: "Diamond",
        name: "钻石",
        unit: "颗",
        price: 9000,
        usage: {
            type: "sell",
        },
        short: "F",
    },

    Fish_normal: {
        desc: "这些鱼很常见，口味酸涩，适合做成罐头，可以卖掉换取矿石",
        subDesc: "不赶紧吃，和咸鱼有什么区别",
        imgUrl: "image/item/Fish",
        thumbName: "Fish",
        name: "海鱼",
        unit: "尾",
        price: 50,
        usage: {
            type: "sell",
        },
        short: "G",
    },

    Fish_treasure: {
        desc: "这种鱼的肚子很大，剖开鱼腹，或许可以获得一些矿物",
        subDesc: "航海兴，战舰王",
        imgUrl: "image/item/FishT",
        thumbName: "FishT",
        name: "藏宝鱼",
        unit: "尾",
        price: 100,
        usage: {
            type: "open",
            content: [{
                    type: "TurtleRock", //38
                    count: 1,
                    percent: 38,
                },
                {
                    type: "VolcanicRock", //50
                    count: 1,
                    percent: 25,
                },
                {
                    type: "Sapphire", //5
                    count: 1,
                    percent: 0.1,
                },
                {
                    type: "Ruby", //7
                    count: 1,
                    percent: 0.1,
                },
            ],
        },
        short: "H",
    },

    Oyster: {
        desc: "巨大的海蚌，里面常常有宝石。从上面游过去的时候就会突然的合起来，有点可怕。", //Mine/TurtleRock/VolcanicRock/ruby/sapphire/diamond
        subDesc: "小心夹手！",
        imgUrl: "image/item/Oyster",
        thumbName: "Oyster",
        name: "巨蚌",
        unit: "只",
        price: 400,
        usage: {
            type: "open",
            content: [{
                    type: "Mine",
                    count: 190,
                    percent: 97,
                },
                {
                    type: "Sapphire",
                    count: 1,
                    percent: 0.85,
                },
                {
                    type: "Ruby",
                    count: 1,
                    percent: 0.85,
                },
                {
                    type: "Diamond",
                    count: 1,
                    percent: 0.9,
                },
                {
                    type: "VitaConsume",
                    count: 1,
                    percent: 0.14,
                },
                {
                    type: "Fragment",
                    count: 1,
                    percent: 0.03,
                },
            ],
        },
        short: "I",
    },

    VitaConsume: {
        desc: "使用后可以获得10点体力",
        subDesc: "30年品质保证",
        imgUrl: "image/item/vitaDrink",
        thumbName: "Vita",
        name: "体力特饮",
        unit: "罐",
        price: 10000,
        usage: {
            type: "restoreVita",
        },
        short: "J",
    },


    InnerBomb: {
        desc: "作战时投放，对屏幕中所有敌人造成大量伤害",
        subDesc: "电磁力和核力的完美结合",
        imgUrl: "image/item/innerExplodeItem",
        thumbName: "InnerBomb",
        name: "内向爆破弹",
        unit: "枚",
        price: 1000,
        short: "K",
        usage: {
            type: "sell",
        },
    },

    ExtraTorpedo_plus2: {
        desc: "每次额外发射2枚鱼雷（自动生效，多次获得时间累加）",
        subDesc: "多多益善",
        imgUrl: "image/game/projectile/TorpedoGreen",
        thumbName: "TorpedoGreen",
        name: "等离子鱼雷",
        unit: "天",
        //expireMS: 172800000, // 如果重复拿到 就累加有效时间
        expireMS: 86400000,
        price: 35000,
        short: "L",
        nonCountable: true,
    },

    FasterBomb: {
        desc: "提高炸弹填装速度（自动生效，多次获得时间累加）",
        subDesc: "轻型，绿色，高效",
        imgUrl: "image/game/projectile/bombGreen",
        thumbName: "BombGreen",
        name: "急速填装炸弹",
        unit: "天",
        expireMS: 86400000,
        price: 40000,
        //现在默认填装是1秒，有了这个后是0.6秒
        short: "M",
        nonCountable: true,
    },

    AutoArmor: {
        desc: "在战斗中持续恢复生命（自动生效，多次获得时间累加）",
        subDesc: "自动维修，咻咻咻",
        imgUrl: "image/item/armor",
        thumbName: "Armor",
        name: "自修复护甲",
        unit: "天",
        expireMS: 86400000,
        price: 45000,
        short: "N",
        nonCountable: true,
    },

    CriticalBomb: {
        desc: "炸弹有几率造成350%伤害（自动生效，多次获得时间累加）",
        subDesc: "超级炸弹不加价",
        imgUrl: "image/game/projectile/bombRed",
        thumbName: "BombRed",
        name: "高爆炸药",
        unit: "天",
        expireMS: 86400000,
        price: 50000,
        short: "O",
        nonCountable: true,
    },

    CriticalTorpedo: {
        desc: "鱼雷有几率造成350%伤害（自动生效，多次获得时间累加）",
        subDesc: "超级鱼雷不加价",
        imgUrl: "image/game/projectile/TorpedoRed",
        thumbName: "TorpedoRed",
        name: "小型核弹头",
        unit: "天",
        expireMS: 86400000,
        price: 50000,
        short: "P",
        nonCountable: true,
    },

    Fragment: {
        desc: "可在船舰皮肤中解锁皮肤，改变外观和能力", //阿凡达？
        subDesc: "这份设计图创意点很多，也有槽点",
        imgUrl: "image/item/Fragment",
        thumbName: "Fragment",
        name: "皮肤碎片",
        unit: "枚",
        price: 40000,
        short: "Q",
        usage: {
            type: "sell",
        },
    },

    VirtualStar: {
        desc: "1颗星等于1点经验值",
        subDesc: "作为经验值的星星",
        imgUrl: "image/game/star",
        thumbName: "Star",
        name: "经验星",
        unit: "个",
    },

    getDuplicatedItemInfo: function(index) {
        if (this[index]) {
            let str = JSON.stringify(this[index]);
            return str ? JSON.parse(str) : null;
        }
    },

    getSalePriceRate: function() {
        let playedDays = appContext.getUxManager().playedDays;
        if (playedDays <= 1) {
            return 2;
        } else if (playedDays <= 2) {
            return 2.5;
        } else if (playedDays <= 4) {
            return 3;
        } else if (playedDays <= 6) {
            return 4;
        }

        return 5;
    }
};


module.exports = item;