cc.Class({
    extends: cc.Component,

    properties: {
        minScale: 0.9,

        maxScale: 1.1,

        turnTime: 1,

        loop: true,

        playOnEnable: true,

        isPlaying: false,

        timer:0,
    },


    onLoad() {
        this.deltaScale = this.maxScale - this.minScale;
    },

    onEnable() {
        if (this.playOnEnable) {
            this.isPlaying = true;
        }
    },

    update(dt) {
        if (!this.isPlaying) {
            return;
        }

        let f = this.timer / this.turnTime;//f=0 big f=1 big f=0.5 small
        let factor1 = Math.cos(f * Math.PI * 2);
        let factor2 = Math.sin(f * Math.PI * 2);
        this.node.scaleX = this.minScale + this.deltaScale * factor1;
        this.node.scaleY = this.minScale + this.deltaScale * factor2;
        this.timer -= dt;
        if (this.timer < 0) {
            this.timer += this.turnTime;
        }
    },
});
