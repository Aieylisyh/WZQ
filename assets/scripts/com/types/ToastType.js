let ToastType = {
    // 普通Toast 深色字
    Normal: 0,

    // 普通Toast，但是字体是红色
    Error: 1,

    // 需要玩家关闭的对话框。
    // 有背景，点击背景也会关闭。
    MessageBox: 2,

    // 需要玩家点击确认的对话框。
    // 有背景，只有点击确认按钮，才会关闭。
    ConfirmBox: 3,
}

module.exports = ToastType; 