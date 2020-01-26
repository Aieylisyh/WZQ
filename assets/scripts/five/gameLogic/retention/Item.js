let item = {
    Mine: {
        desc: "手气卡",
        subDesc: "手气卡",
        imgUrl: "image/item/Mine",
        thumbName: "Mine",
        name: "矿物",
        unit: "块",
        price: 1,
        short: "A",
    },

    TurtleRock: {
        desc: "加速卡",
        subDesc: "加速卡",
        imgUrl: "image/item/Turt",
        thumbName: "Turt",
        name: "龟岩",
        unit: "块",
        price: 100, 
        usage: {
            type: "sell",
        },
        short: "B",
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