let ShareType = {
    None: 0, //纯分享

    SeekLuck: 1, // 求好运，点者有奖励。双向

    SeekHelp: 2, // 求具体道具的非破产助力，点者有奖励。双向

    XuanyaoGrade: 3, // 炫耀段位，点者有奖励。双向

    XuanyaoFanbei: 4, // 炫耀翻倍，点者有奖励。双向

    XuanyaoReward: 5, // 炫耀得奖励，点者有奖励。双向

    XuanyaoRace: 6, // 炫耀比赛，点者有奖励。双向

    InviteBonusPacket: 7, //旧版红包分享，点者有奖励。双向

    WxGameRoom: 8, //好友场邀请

    WxGameDuelRoom: 1008, //好友场邀请

    RankGroup: 9, //群排行

    CollapseSeekHelp: 10, //破产助力，点者有奖励。双向

    Teach: 11,//教学

    Replay: 12,//录像

    RoundEnd: 13,//分享成绩，点者有奖励。单向

    InstantReward: 14,//分享到群立得奖励，点者有奖励。单向

    InstantRewardUrge: 15,//分享到群立得奖励，点者有奖励。单向。使用可怜的图文

    InviteNewUser:16,//拉新
};

module.exports = ShareType;