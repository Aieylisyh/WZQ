//大类型

//大类型对应的脚本


let GameResourceData = cc.Class({
    properties: {
        _data: null, //数据 非必要

        _category: null, //大类型

        _type: null, //次级类型（即具体资源的id）

        _amount: null, //数量

        data: {
            get: function () {
                return this._data;
            },
        },

        category: {
            get: function () {
                return this._category;
            },
        },

        type: {
            get: function () {
                return this._type;
            },
        },

        amount: {
            get: function () {
                return this._amount;
            },
        },

        //获得处理当前数据的脚本类
        class: {
            get: function () {
                return GameResourceData.getClassByCategory(this.category);
            },
        },

        //获得物品名称
        labelName: {
            get: function () {
                let c = this.class;
                if (!c) {
                    return "";
                }

                return c.labelOf(this.type);
            },
        },

        unit: {
            get: function () {
                let c = this.class;
                if (!c) {
                    return "";
                }

                return c.unitOf(this.type);
            },
        },

        //获得纯粹的图片名称 无前缀 无后缀（比如金蛋就是egg 不是egg_s）
        pureImgName: {
            get: function () {
                let c = this.class;
                if (!c) {
                    return "";
                }

                return c.getPureImgName(this.type);
            },
        },
    },

    __ctor__: function (rawData, category) {
        if (rawData == null) {
            return;
        }

        category = category || this.guessCategory(rawData);
        let c = GameResourceData.getClassByCategory(category);
        if (!c) {
            return;
        }

        this._data = rawData;
        let type = c.getType(rawData);
        let amount = c.getAmount(rawData);

        this.setup(category, type, amount);
    },

    //设置属性
    setup: function (category, type, amount = 0) {
        this._category = category;
        this._type = type;
        this._amount = amount;
    },

    //获得资源图的完整路径
    //商品服装没有小图，如果传2,3返回图标，否则都返回商品原图
    getImgPath: function (size = 2) {
        let suffix = this.getImgSuffix(size);

        return this.getImgRoot(size) + this.getImgName(suffix);
    },

    //获得图片名称的后缀 如s m l
    //size 1 小 2 中 3 大
    //商品服装没有小图
    getImgSuffix: function (size = 2) {
        if (this.category === CommodityCategory && size !== 2 && size !== 3) {
            return;
        }

        return size == 1 ? "s" : (size == 2 ? "m" : "l");
    },

    //获得图片名称的根路径
    //size 1 小 2 中 3 大
    //商品服装没有小图，如果传2,3返回图标，否则都返回商品原图
    getImgRoot: function (size = 2) {
        let rootSmall = "localRes/currency/";
        let rootMid = rootSmall;
        let rootLarge = "bigIcons/";
        let rootFigure = "figureImg/";

        let root = size == 1 ? rootSmall : (size == 2 ? rootMid : rootLarge);

        if (this.category == CommodityCategory && size !== 2 && size !== 3) {
            root = rootFigure;//商品原图
        }

        return root;
    },

    //获得图片的名称。大小后缀可选择性填写
    getImgName(suffix) {
        let res = this.pureImgName;
        if (suffix !== "" && typeof suffix == "string") {
            res += "_" + suffix;
        }

        return res;
    },

    //获得资源对应的富文本标签,通过大小参数
    getRichTextLabelBySize: function (size = 2) {
        return this.getRichTextLabel(this.getImgName(this.getImgSuffix(size)));
    },

    //获得资源对应的富文本标签
    getRichTextLabel: function (imgNameWithSuffix) {
        return "<img src='" + imgNameWithSuffix + "'/>";
    },


    // 静态成员定义
    statics: {
        //根据一个复合的对象，获得资源列表
        //得到奖励的消息的对象符合参数要求，也可以自己构建这个对象
        categories: {
        },

        fetchList: function (info) {
            if (!info) {
                return;
            }

            return res;
        },

        //根据大类型，获取对应的脚本类
        getClassByCategory: function (category) {
            switch (category) {

                default:
                    debug.warn("getClassByCategory undefined category");
            }
        },

        //判断该索引key，是否属于某个游戏物品资源的大类型category，即该索引是否存匹配某个大类型预设的id字段
        matchType: function (key, category) {
            let c = GameResourceData.getClassByCategory(category);
            if (c == null) {
                return false;
            }

            for (let i in c) {
                if (key === c[i]) {
                    return true;
                }
            }

            return false;
        },

        //猜测大类型
        guessCategory: function (data) {
            let s = "function";
            if (typeof data.getCommodityId === s) {
                return CommodityCategory;
            } else if (typeof data.getItemId === s) {
                return ResourceItemCategory;
            } else if (typeof data.getAmount === s) {
                return ThirdPartyCategory;
            } else if (typeof data.getCount === s) {
                return CurrencyCategory;
            }
        },
    },
});