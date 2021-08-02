let item = {
    Gold: {
        desc: "金币",
        subDesc: "金币",
        imgUrl: "image/item/Gold",
        thumbName: "Gold",
        name: "金币",
        unit: "",
        price: 1,
        short: "A",
    },

    GrabFirstCard: {
        desc: "先手卡",
        subDesc: "先手卡",
        imgUrl: "image/item/GrabFirstCard",
        thumbName: "GrabFirstCard",
        name: "先手卡",
        unit: "张",
        price: 150,
        short: "B",
    },

    KeepGradeCard: {
        desc: "保段卡",
        subDesc: "保段卡",
        imgUrl: "image/item/KeepGradeCard",
        thumbName: "KeepGradeCard",
        name: "保段卡",
        unit: "张",
        price: 300,
        short: "C",
    },

    getDuplicatedItemInfo: function (index) {
        if (this[index]) {
            let str = JSON.stringify(this[index]);
            return str ? JSON.parse(str) : null;
        }
    },

    getTextByItem(list) {
        let res = "";
        let isFirst = true;

        for (let i in list) {
            let itemInfo = list[i];
            let item = this[itemInfo.type];
            if (!item) {
                continue;
            }

            if (!isFirst) {
                res += "  ";
            }
            res += item.name + itemInfo.count + item.unit;
            if (isFirst) {
                isFirst = false;
            }
        }


        return res;
    },
};


module.exports = item;