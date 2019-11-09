let ResultCode = {
    //请求成功
    OK: 0,

    //失败。
    FAILED: 10,

    //数据库操作失败。
    DATA_FAILED: 20,

    //参数错误
    INVALID_PARAM: 30,

    //用户在数据库中不存在。
    COMMODITY_USER_NOT_IN_DB: 51,

    //用户金蛋不够。
    COMMODITY_BUY_MONEY_LIMIT: 52,

    //用户银票不够。
    COMMODITY_BUY_YINPIAO_LIMIT: 54,

    //商品不存在。
    COMMODITY_NOT_FOUND: 53,

    //玩家等级不够，无法购买商品。
    COMMODITY_BUY_LEVEL_LIMIT: 55,

    //数据库中没有用户的背包数据。
    COMMODITY_BAG_NOT_IN_DB: 61,

    //用户没有指定的商品。
    COMMODITY_USER_NOT_HAVE: 62,

    //用户商品数量不够。
    COMMODITY_COUNT_NOT_ENOUGH: 63,

    //商品已经过期。
    COMMODITY_VALIDITY_EXPIRED: 64,

    //商品已经在使用中。
    COMMODITY_ALREADY_IN_USE: 65,

    //商品已经不再使用中。
    COMMODITY_ALREADY_NOT_USE: 66,

    //玩家没有必要使用该商品
    COMMODITY_USE_NOT_NECESSARY: 67,

    //在错误的时间使用商品
    COMMODITY_USE_WRONG_TIME: 68,

    //VIP等级不够，无法购买该VIP商品
    COMMODITY_BUY_VIP_LIMIT: 69,

    //不满足房间的底注条件
    LESS_THAN_THRESHHOLD: 71,

    //玩家无权进入比赛房。
    RACE_ROOM_NOT_AUTHORIZED: 72,

    //PServer结果码
    //大厅服务器在玩家服务器中已经注册过了。
    P_HSERVER_ALREADY_REGISTERED: 100,

    //注册时用户名不合法
    P_REGISTER_USERNAME_ILLEGAL: 111,

    //注册时昵称名不合法
    P_REGISTER_NICKNAME_ILLEGAL: 112,

    //注册时密码输入不合法
    P_REGISTER_PASSWORD_ILLEGAL: 113,

    //用户名已存在
    P_REGISTER_USER_EXIST: 121,

    //用户密码错误
    P_LOGIN_PASSWORD_WRONG: 122,

    //用户不存在
    P_LOGIN_USER_NOT_FOUND: 123,

    //昵称已存在
    P_REGISTER_NICKNAME_EXIST: 124,

    //没有可用的大厅服务器。
    P_LOGIN_NO_HALL_SERVER: 131,

    //无效的客户端版本号。
    P_LOGIN_INVALID_CLIENT_VERSION: 132,

    //需要转正的游客不存在
    P_REGULARIZE_NO_VISITOR: 141,

    //客户端的visitorUsername与deviceId不匹配。
    //客户端收到这个code之后，应当清空保存的visitorUsername，直接使用deviceId登陆。
    P_USER_WRONG_DEVICE: 150,

    //HServer结果码
    //游戏服务器已经在大厅服务器中注册过了。
    H_GSERVER_ALREADY_REGISTERED: 201,

    //聊天服务器已经在大厅服务器中注册过了
    H_CSERVER_ALREADY_REGISTERED: 202,

    //大厅已满，无法接受新玩家
    H_PSERVER_HALL_FULL: 203,

    //没有发现用户。
    H_VALIDATE_PLAYER_NOT_FOUND: 211,

    //无效的Token值。
    H_VALIDATE_INVALID_TOKEN: 212,

    //无效的客户端版本。
    INVALID_CLIENT_VERSION: 213,

    //没有礼物可以领取
    H_NO_GIFT: 221,

    //今天已经领过礼物了
    H_GIFT_HAVE_BEEN_RECEIVED: 222,

    //房间里面已经存在用户了，无法进入。
    H_ROOM_PLAYER_ALREADY_EXIST: 224,

    //房间已经满了，无法进入。
    H_ROOM_FULL: 225,

    //参加比赛，结果报名费不够。
    H_CHOOSE_RACE_ROOM_NO_ENOUGH_FEE: 226,

    //交易信息不存在
    H_TRADE_NOT_EXIST: 231,

    //交易未完成
    H_TRADE_NOT_PAID: 232,

    //交易结束（可能是手动关闭也可能是验证不通过，对应Trade的状态：验证不通过 4，手动关闭 5）
    H_TRADE_CLOSED: 233,

    //订单已付款，正等待发货
    H_TRADE_PAID_WAIT_POST: 234,

    //创建订单时累计支付额度超过渠道设定的上限
    H_TRADE_OUTOF_LIMIT: 235,

    //短信支付的订单是过期的（处理过了），无法再领取金蛋
    H_TRADE_OUTOF_DATE: 236,

    //为他人充值的时候，充值的账户不存在
    H_TRADE_RECEIVER_NOT_EXIST: 237,

    //未找到支付包
    H_TRADE_PREPAYMENT_NOT_FOUND: 238,

    //未找到支付渠道
    H_TRADE_PAYCHANNEL_NOT_FOUND: 239,

    //苹果IAP的收据无效
    H_TRADE_RECEIPT_INVALID: 240,

    //玩家未完善过个人信息
    H_PRIVACY_NOT_EXIST: 241,

    //玩家更新个人信息失败
    H_PRIVACY_CHANGE_FAILED: 242,

    //未发现房间
    H_ROOM_NOT_FOUND: 243,

    //选择游戏服务器的时候发生错误
    H_CHOOSE_GAME_SERVER_ERROR: 244,

    //HServer向GServer发送玩家失败。
    H_SEND_PLAYER_TO_GSERVER_ERROR: 245,

    //没有找到CSERVER
    H_CSERVER_NOT_FOUND: 246,

    //修改个人信息时昵称输入不合法
    H_EDIT_NICKNAME_ILLEGAL: 251,

    //修改个人信息时昵称已被使用
    H_EDIT_NICKNAME_USED: 252,

    //修改密码时密码输入不合法
    H_EDIT_PASSWORD_ILLEGAL: 253,

    //修改密码时旧密码错误
    H_EDIT_PASSWORD_NOT_AUTH: 254,

    //修改个人信息时性别不合法
    H_EDIT_SEX_ILLEGAL: 255,

    //今天领取的经验和金蛋都已达上限，不能再领取了
    H_NO_MORE_REWARD: 261,

    //今天领取的经验奖励已达上限，不能再领取了
    H_NO_MORE_EXP_REWARD: 262,

    //今天领取的经验奖励已达上限，不能再领取了
    H_NO_MORE_MONEY_REWARD: 263,

    //货币兑换的接收者不存在
    H_EXCHANGE_RECEIVER_NOT_EXIST: 271,

    //货币兑换的时候源货币不足
    H_EXCHANGE_SOURCE_NOT_ENOUGH: 272,

    //兑换包不存在。
    H_EXCHANGE_NOT_FOUND: 273,

    //兑换失败。
    H_EXCHANGE_FAIL: 274,

    //升级商品的时候等级不足
    H_UPGRADE_COMMODITY_INSUFFICIENT_LEVEL: 281,

    //升级商品的时候钱不足
    H_UPGRADE_COMMODITY_INSUFFICIENT_MONEY: 282,

    //货币类型不支持
    CURRENCY_NOT_SUPPORTED: 283,

    //GServer结果码
    //玩家不在线，无法跟踪。
    PLAYER_NOT_PLAYING: 290,

    //玩家所在的桌子满了，无法跟踪。
    DEST_TABLE_FULL: 291,

    //没有发现用户
    G_USER_NOT_FOUND: 311,

    //无效的Token值
    G_INVALID_TOKEN: 312,

    //GServer 通知 HServer 玩家登陆失败
    GH_PLAYER_CON_FAIL: 313,

    //没有发现房间
    G_ROOM_NOT_FOUND: 321,

    //新建玩家失败
    G_NEW_PLAYER_ERROR: 322,

    //房间已经满了
    G_ROOM_FULL: 323,

    //选桌时未找到该桌子
    G_CHOOSE_TABLE_NOT_FOUND: 331,

    //裁判不能够进入正在打的桌子
    G_CHOOSE_TABLE_PLAYING_JUDGE_REJECTED: 332,

    //向已有桌子添加玩家时，桌子已满
    G_TABLE_FULL: 341,

    //向已有桌子添加玩家时，玩家已在
    G_PLAYER_ALREADY_IN: 342,

    //出的牌不对
    G_INVALID_POKER: 351,

    //没有出牌权
    G_NOT_CHUPAI_RIGHT: 352,

    //服务器端强制客户端出牌
    G_FORCE_CHUPAI: 353,

    //玩家在第一次出牌的时候，发送了不出命令，此时出牌是无效的。
    G_FIRST_BUCHU: 354,

    //玩家在强制出牌的时候，发送了不出命令，是无效的。
    G_FORCE_CHUPAI_BUCHU: 355,

    //玩家在接风的时候，发送了不出命令，是无效的。
    G_JIEFENG_BUCHU: 356,

    //玩家出的牌没有匹配出牌型。
    G_CHUPAI_NO_MATCHED_PATTERN: 361,

    //玩家出的牌不够大。
    G_CHUPAI_NO_GREATER: 362,

    //玩家的进贡无效。
    G_INVALID_JINGONG: 363,

    //玩家的还贡无效。
    G_INVALID_HUANGONG: 364,

    //进入桌子失败。
    G_CHOOSE_TABLE_ERROR: 365,

    //牌局正在进行，无法离开桌子
    G_TABLE_PLAYING_CANNOT_LEAVE: 366,

    //玩家出的牌不符合牌型
    G_CHUPAI_PATTERN_NO_MATCHED: 367,

    //没打到目标，将惩罚玩家。
    //需要弹出惩罚警告对话框。
    LEAVE_WILL_PUNISH: 368,

    //桌子不允许观众进入
    G_TABLE_AUDIENCE_REJECTED: 371,

    //桌子不允许裁判进入
    G_TABLE_JUDGE_REJECTED: 372,

    //桌子已有裁判
    G_TABLE_JUDGE_ALREADY_HAVE: 373,

    //VIP等级不够无法踢人
    G_KICK_VIP_LEVEL_NOT_ENOUGH: 381,

    //结果码
    //没有权限
    USER_NOT_FOUND: 411,

    //无效的Token值
    C_INVALID_TOKEN: 412,

    //没有语音的接收者
    C_NO_TO_USERS: 421,

    //喇叭个数不够
    C_SPEAKER_NOT_ENOUGH: 422,

    //找不到好友的详细信息
    C_FRIEND_NO_DETAIL: 431,

    //好友个数超过上限
    C_FRIEND_COUNT_OUT_OF_LIMIT: 441,

    //好友不在线
    C_FRIEND_OFFLINE: 442,

    //好友关系已存在
    C_FRIEND_ALREADY_ADDED: 443,

    //好友关系不存在
    C_FRIEND_RELATION_NOT_EXIST: 451,

    RESOURCE_NOT_ENOUGH: 500,
}

module.exports = ResultCode;