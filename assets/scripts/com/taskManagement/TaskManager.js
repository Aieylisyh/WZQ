let TaskWrapper = require("TaskWrapper");

cc.Class({
    properties: {
        _taskList: [],

        taskHandler:[],
    },

    onUpdate: function (dt) {
        for (let i = this._taskList.length - 1; i >= 0; i--) {
            let task = this._taskList[i];
            if (task == null || task.done) {
                this._taskList.splice(i, 1);
                continue;
            }

            task.update(dt);
        }
    },

    addTask: function (timeout, onTimeout, onTimeoutCaller, checker, checkerCaller, onComplete, onCompleteCaller, dataContainerBindInfo) {
        let task = new TaskWrapper();
        task.setup(timeout, onTimeout, onTimeoutCaller, checker, checkerCaller, onComplete, onCompleteCaller, dataContainerBindInfo);
        this._taskList.push(task);
        return task;
    },

    addWaitingTask: function (timeout, onTimeout, onTimeoutCaller, checker, checkerCaller, dataContainerBindInfo) {
        let task = new TaskWrapper();
        task.setup(timeout, onTimeout, onTimeoutCaller, checker, checkerCaller, appContext.getDialogManager().hideWaitingCircle, appContext.getDialogManager(), dataContainerBindInfo);
        this._taskList.push(task);

        appContext.getDialogManager().showWaitingCircle();

        return task;
    },
});