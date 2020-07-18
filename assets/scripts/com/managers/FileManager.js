cc.Class({
    properties: {
        _pathPrefix: "res/raw-assets/resources/",

        _fs: null,

        _wxDownloader: null,

        _currentDownloadings: [],

        _currentSavings: [],

        _loadCache: [],
    },

    ctor: function () {
        this._loadCache = [];
        this._currentDownloadings = [];
        this._currentSavings = [];

        if (typeof wx.getFileSystemManager == "function") {
            //WechatAPI.isWx || WechatAPI.isOppo || WechatAPI.isTT || WechatAPI.isBaidu  MZ
            this._fs = wx.getFileSystemManager();
        }

    },

    //encoding默认为ArrayBuffer 
    //https://developers.weixin.qq.com/minigame/dev/document/file/FileSystemManager.readFile.html
    // readFile: function(filePath, callback, caller, encoding) {
    //     let obj = {
    //         filePath: filePath,
    //         success: function(res) {
    //             debug.log("readfile suc");
    //             debug.log(res.data);
    //             callback.call(caller, res.data);
    //         },
    //         fail: function(res) {
    //             debug.log("readfile fail");
    //             debug.log(res.errMsg);
    //             callback.call(caller, null);
    //         },
    //     }

    //     if (encoding) {
    //         obj.encoding = encoding;
    //     }
    //     this._fs.readFile(obj);
    // },

    // getDownloader: function() {
    //     if (WechatAPI.isEnabled() && window.wxDownloader != null) {
    //         //微信环境，使用微信小游戏下载器的全局实例
    //         return wxDownloader;
    //     } else {
    //         //非微信环境
    //         return null;
    //     }
    // },

    loadRemoteTxtFile: function (url, cb, caller) {
        if (WechatAPI.isApp) {
            //Cocos的api太垃圾了，改用原生的。 下载后得到的是arraybuffer
            //需要解码。uft8和unicode的解码方式不同，ansi的暂时不支持
            if (url == null || url == "") {
                return;
            }

            if (window.jsb == null) {
                debug.log("loadRemoteTxtFile not原生平台!!");
                cb.call(caller);
            }

            let readAsUtf8 = true;

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                debug.log("xhr.readyState  " + xhr.readyState);
                debug.log("xhr.status  " + xhr.status);
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        debug.log("loadRemoteTxt ok");
                        let ab = xhr.response;
                        let res = null;
                        if (readAsUtf8) {
                            res = String.fromCharCode.apply(null, new Uint8Array(ab));
                        } else {
                            res = String.fromCharCode.apply(null, new Uint16Array(ab));
                        }
                        debug.log(res);
                        cb.call(caller, res);
                    } else {
                        debug.log("loadRemoteTxt not ok");
                        cb.call(caller);
                    }
                }
            }.bind(this);

            //responseType一定要在外面设置
            // xhr.responseType = 'arraybuffer'; 
            xhr.responseType = 'arraybuffer';
            xhr.open("GET", url, true);
            xhr.send();
            debug.log("xhr.send");
            return;
        }

        if (WechatAPI.isUC) {
            cc.loader.load(url, function (err, content) {
                console.log("web下载文本");
                console.log(arguments);
                cb.call(caller, content);
            });
            return;
        }

        this.downloadFile(url, function (path) {
            debug.log("downlsoad ok " + url);
            if (path) {
                debug.log(path);
                cc.loader.load(path, function (err, content) {
                    //debug.log("loadRemoteTxtFile ok " + content);
                    cb.call(caller, content);
                });
            } else {
                cb.call(caller);
            }
        }, this);
    },

    convertPathRemoveDirectory: function (path) {
        if (!WechatAPI.isEnabled() || path == null) {
            return "";
        }

        let len = path.length;
        path = path.substr(8, len);
        path = path.replace(/\//g, '__');

        let root = "customRoot";
        if (WechatAPI.isWx || WechatAPI.isTT || WechatAPI.isBaidu || WechatAPI.isOppo || WechatAPI.isUC || WechatAPI.isMZ) {
            root = wx.env.USER_DATA_PATH;
        } else if (WechatAPI.isVivo) {
            root = 'internal://files';
        } else if (WechatAPI.isApp) {
            root = jsb.fileUtils.getWritablePath();
        }

        return root + '/' + path;
    },

    isValidCommonSuffix: function (s) {
        //debug.log("fm isValidCommonSuffix " + s);
        let index = s.indexOf('.');
        if (index == -1) {
            return false;
        }

        if (typeof s !== "string") {
            return false;
        }

        if (s == "" || s == "unknown") {
            return false;
        }

        if (s.length > 4) {
            return false;
        }

        return true;
    },

    getSuffixFromPath: function (path) {
        let index = path.lastIndexOf('.');
        if (index < 0) {
            return "";
        }

        return path.substr(index);
    },

    //判断一个文件是否存在，后缀名必须一致,由于图片文件可能不明确后缀名，请用hasImageFile
    hasFile: function (url, callback, caller) {
        //debug.log("fm hasFile " + url);
        if (WechatAPI.isEnabled()) {
            let localPath = this.convertPathRemoveDirectory(url);
            let sucCb = function () {
                debug.warn('file exsit: ' + localPath);
                if (callback && caller) {
                    callback.call(caller, localPath);
                }
            };
            let failCb = function () {
                debug.warn('file unexsit: ' + localPath);
                if (callback && caller) {
                    callback.call(caller);
                }
            };
            if (WechatAPI.isWx || WechatAPI.isOppo || WechatAPI.isTT || WechatAPI.isBaidu || WechatAPI.isUC || WechatAPI.isMZ) {
                this._fs.access({
                    path: localPath,
                    success: sucCb,
                    fail: failCb,
                });
            } else if (WechatAPI.isVivo) {
                res = qg.accessFile({
                    uri: localPath
                });
                if (res === true) {
                    sucCb();
                } else {
                    failCb();
                }
            } else if (WechatAPI.isApp) {
                res = jsb.fileUtils.isFileExist(localPath);
                if (res === true) {
                    sucCb();
                } else {
                    failCb();
                }
            }

        } else {
            failCb();
        }
    },

    //判断一个文件是否存在，url不带后缀名，模糊判断jpg jpeg png三种后缀名
    //根据出现频率，优先判断png
    //返回一个可能补充加了有效后缀的文件名
    hasImageFile: function (url, callback, caller) {
        //debug.log("fm hasImageFile " + url);
        let self = this;
        let sucCb = function (param) {
            //debug.warn('ImageFile exsit: ' + param);
            if (callback && caller) {
                callback.call(caller, param);
            }
        }
        let failCb = function (param) {
            debug.warn('ImageFile unexsit: ' + param);
            if (callback && caller) {
                callback.call(caller);
            }
        }

        if (WechatAPI.isUC) {
            failCb(path);
            return;
        }

        if (WechatAPI.isEnabled()) {
            let localPath = this.convertPathRemoveDirectory(url);

            let path = localPath;
            if (WechatAPI.isWx || WechatAPI.isOppo || WechatAPI.isTT || WechatAPI.isBaidu || WechatAPI.isUC || WechatAPI.isMZ) {
                self._fs.access({
                    path: path,
                    success: function (res) {
                        sucCb(path);
                    },

                    fail: function (res) {
                        path = localPath + ".png";
                        self._fs.access({
                            path: path,
                            success: function (res) {
                                sucCb(path);
                            },
                            fail: function (res) {
                                path = localPath + ".jpg";
                                self._fs.access({
                                    path: path,
                                    success: function (res) {
                                        sucCb(path);
                                    },
                                    fail: function (res) {
                                        path = localPath + ".jpeg";
                                        self._fs.access({
                                            path: path,
                                            success: function (res) {
                                                sucCb(path);
                                            },
                                            fail: function (res) {
                                                failCb(path);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            } else if (WechatAPI.isVivo) {

                res = qg.accessFile({
                    uri: path
                });
                if (res === true) {
                    sucCb(path);
                } else {
                    path = localPath + ".png";
                    res = qg.accessFile({
                        uri: path
                    });
                    if (res === true) {
                        sucCb(path);
                    } else {
                        path = localPath + ".jpg";
                        res = qg.accessFile({
                            uri: path
                        });
                        if (res === true) {
                            sucCb(path);
                        } else {
                            path = localPath + ".jpeg";
                            res = qg.accessFile({
                                uri: path
                            });
                            if (res === true) {
                                sucCb(path);
                            } else {
                                failCb(path);
                            }
                        }
                    }
                }
            } else if (WechatAPI.isApp) {
                if (jsb.fileUtils.isFileExist(localPath) === true) {
                    sucCb();
                } else {
                    if (jsb.fileUtils.isFileExist(localPath + ".png") === true) {
                        sucCb();
                    } else {
                        if (jsb.fileUtils.isFileExist(localPath + ".jpg") === true) {
                            sucCb();
                        } else {
                            if (jsb.fileUtils.isFileExist(localPath + ".jpeg") === true) {
                                sucCb();
                            } else {
                                failCb();
                            }
                        }
                    }
                }
            }

        } else {
            failCb();
        }
    },

    downloadFile: function (url, callback, caller) {
        if (url == null || url === "") {
            debug.warn("fm downloadFile invalid url:" + url);
            if (callback && caller) {
                callback.call(caller);
            }
            return;
        }

        if (!this.isDownloading(url)) {
            if (WechatAPI.isEnabled()) {
                let self = this;

                this.addDownloadCallback(url, callback, caller);
                let downloadCb = {
                    url: url,

                    success: function (res) {
                        let tempFilePath = res.tempFilePath;
                        if (tempFilePath == null || tempFilePath === "") {
                            debug.log("fm downloadFile " + url + " no tempFilePath");
                            self.onDownloadCallback(url);
                        } else {
                            debug.log("fm downloadFile " + url + " ok " + tempFilePath);
                            self.onDownloadCallback(url, tempFilePath);
                        }
                    },

                    fail: function (res) {
                        debug.warn("fm downloadFile fail");
                        debug.log(res);
                        self.onDownloadCallback(url);
                    }
                };

                if (WechatAPI.isWx || WechatAPI.isOppo || WechatAPI.isTT || WechatAPI.isBaidu || WechatAPI.isUC || WechatAPI.isMZ) {
                    wx.downloadFile(downloadCb);
                } else if (WechatAPI.isVivo) {
                    qg.download(downloadCb);
                } else if (WechatAPI.isApp) {
                    debug.log("不要这样使用jsb的下载 直接使用downloadAndSaveFile 或 loadRemoteTxtFile");
                    // wx.downloadFile(downloadCb);
                } else {
                    cc.loader.load(downloadCb.url, function (err, content) {
                        debug.log("web下载");
                        debug.log(err);
                        debug.log(content);
                        if (err == null) {
                            downloadCb.success(content);
                        } else {
                            downloadCb.fail(content);
                        }
                    });
                }

            } else {
                if (callback && caller) {
                    callback.call(caller);
                }
            }
        } else {
            this.addDownloadCallback(url, callback, caller);
        }
    },

    //保存文件，callback传递的参数如果保存成功就是保存后的文件路径，否则是tempFilePath
    //返回一个可能补充加了有效后缀的文件名
    saveFile: function (url, tempFilePath, callback, caller) {
        if (!WechatAPI.isEnabled()) {
            return;
        }
        debug.log("!saveFile");
        debug.log(arguments);
        if (tempFilePath == null || tempFilePath === "") {
            debug.warn("fm saveFile invalid tempFilePath:" + tempFilePath);
            return;
        }

        if (url == null || url === "") {
            debug.warn("fm saveFile invalid url:" + url);
            callback.call(caller, tempFilePath);
            return;
        }


        let localPath = this.convertPathRemoveDirectory(url);

        //这里给图片加上了后缀名
        if (!this.isValidCommonSuffix(this.getSuffixFromPath(localPath))) {
            let suffix = this.getSuffixFromPath(tempFilePath);
            //debug.log("fm getSuffixFromPath " + suffix);
            localPath += suffix;
        }

        let self = this;
        if (this.isSaving(url)) {
            //do nothing 暂时没有用到过缓存成功回调的地方
            this.addSaveCallback(url, callback, caller);
        } else {
            //不需要回调，只是占个坑
            this.addSaveCallback(url, callback, caller);

            if (WechatAPI.isWx || WechatAPI.isOppo || WechatAPI.isTT || WechatAPI.isBaidu || WechatAPI.isMZ) {
                this._fs.saveFile({
                    tempFilePath: tempFilePath,
                    filePath: localPath,
                    success: function (res) {
                        debug.log('fm saveFile ' + localPath + ' ok ' + tempFilePath);
                        self.onSaveCallback(url, localPath);
                    },
                    fail: function (res) {
                        debug.log('fm saveFile ' + localPath + ' fail ' + tempFilePath);
                        self.onSaveCallback(url, tempFilePath);
                    }
                });
            } else if (WechatAPI.isVivo) {
                qg.copyFile({
                    srcUri: tempFilePath,
                    dstUri: localPath,
                    success: function (uri) {
                        console.log(`copy success: ${uri}`);
                        self.onSaveCallback(url, localPath);
                    },
                    fail: function (data, code) {
                        console.log(`handling fail, code = ${code}`);
                        self.onSaveCallback(url, tempFilePath);
                    }
                })
            } else {
                //|| WechatAPI.isUC??
                self.onSaveCallback(url, tempFilePath);
            }

        }

        return localPath
    },

    //优先使用保存后的文件 防止苹果报错
    downloadAndSaveFile: function (url, callback, caller) {
        if (WechatAPI.isApp) {
            let localPath = this.convertPathRemoveDirectory(url);
            var downloader = new jsb.Downloader();
            downloader.setOnFileTaskSuccess(function () {
                callback && callback.call(caller, localPath);
            });
            downloader.setOnTaskError(function () {
                //文件下载失败
                callback && callback.call(caller);
            });
            downloader.createDownloadFileTask(url, localPath); //创建下载任务
            return;
        }

        this.downloadFile(url, function (res) {
            this.saveFile(url, res, callback, caller);
        }, this);
    },

    /**
     * 加载一个SpriteFrame并把它显示在targetSprite对象上
     * 如果完成了，根据doneTraitment来处理
     * doneTraitment 包含以下字段，所有字段都非必须
     * doneTraitment.autoApply:加载完成后立即把它显示在targetSprite对象上，默认为true
     * doneTraitment.callback:回调函数
     * doneTraitment.caller: 回调者
     * doneTraitment.failSpriteFrame: 失败时要显示的SpriteFrame
     * doneTraitment.param: doneTraitment.callback的第3个参数，第1个参数固定为loadedSpriteFrame 第2个参数固定为targetSprite
     */
    applySpriteSafe: function (resUrl, targetSprite, doneTraitment, isSilent = true, timeout = 5) {
        if (targetSprite == null) {
            return;
        }
        if (doneTraitment == null) {
            doneTraitment = {};
        }
        if (doneTraitment.autoApply == null) {
            doneTraitment.autoApply = true;
        }
        this.loadResourceSafe(resUrl, cc.SpriteFrame, function (loadedSpriteFrame) {
            if (targetSprite == null || targetSprite.node == null) {
                return;
            }

            if (doneTraitment.autoApply) {
                if (loadedSpriteFrame != null) {
                    targetSprite.spriteFrame = loadedSpriteFrame;
                } else {
                    targetSprite.spriteFrame = doneTraitment.failSpriteFrame;
                }
            }

            if (doneTraitment.callback != null) {
                if (doneTraitment.caller == null) {
                    doneTraitment.caller = this;
                }
                doneTraitment.callback.call(doneTraitment.caller, loadedSpriteFrame, targetSprite, doneTraitment.param);
            }
        }, this, isSilent, timeout)
    },

    /**
     * 加载一个Prefab或者SpriteFrame资源和他的所有依赖资源
     * 加载成功，失败，超时，抛出异常都可以执行回调函数
     * 理论上也可以加载其他cocos类型，但不保证安全性
     */
    loadResourceSafe: function (resUrl, ccType, callback, caller, isSilent = false, fixedTimeout) {
        //debug.log("loadResourceSafe " + resUrl);

        let timeoutTime = 10;
        let typeChecker = "object";

        if (ccType == cc.SpriteFrame) {
            timeoutTime = 5;
        } else if (ccType == cc.Prefab) {
            timeoutTime = 10;
        }

        if (fixedTimeout != null && fixedTimeout > 0) {
            timeoutTime = fixedTimeout;
        }
        let self = this;
        let len = this._loadCache.length;
        this._loadCache[len] = false;
        try {
            let cb = function (err, res) {
                try {
                    if (!self._loadCache[len]) {
                        self._loadCache[len] = true;

                        if (res != null && (ccType == null || (typeof res === typeChecker && res.name != null))) {
                            //debug.warn("loadResourceSafe " + resUrl + " ok!");
                            if (callback != null) {
                                callback.call(caller, res);
                            }
                        } else {
                            //debug.warn("loadResourceSafe " + resUrl + " fail!");
                            if (callback != null) {
                                callback.call(caller);
                            }
                        }
                    } else {
                        debug.warn("loadResourceSafe " + resUrl + " fail while timeout!");
                        self.releaseCocosCache(res, resUrl);
                    }
                } catch (e) {
                    debug.warn("loadResourceSafe " + resUrl + " exception!");
                    debug.warn(e);
                    self._loadCache[len] = true;
                    self.releaseCocosCache(res, resUrl);
                    if (callback != null) {
                        callback.call(caller);
                    }
                }
            };

            if (ccType != null) {
                cc.loader.loadRes(resUrl, ccType, cb);
            } else {
                cc.loader.loadRes(resUrl, cb);
            }

        } catch (e) {
            debug.warn("loadResourceSafe " + resUrl + " exception2!");
            debug.warn(e);

            if (!self._loadCache[len]) {
                self._loadCache[len] = true;
                self.releaseCocosCache(res, resUrl);
                if (callback != null) {
                    callback.call(caller);
                }
            }
        }

        if (isSilent === true) {
            appContext.getTaskManager().addTask(timeoutTime,
                function () {
                    this._loadCache[len] = true;
                    if (callback != null) {
                        callback.call(caller);
                    }
                    debug.warn("loadResourceSafeSlient " + resUrl + " timeout!");
                    this.clearCocosCacheBrute();
                },
                this,
                function () {
                    return this._loadCache[len];
                },
                this);
        } else {
            appContext.getTaskManager().addWaitingTask(timeoutTime,
                function () {
                    this._loadCache[len] = true;
                    appContext.getDialogManager().hideWaitingCircle();
                    if (callback != null) {
                        callback.call(caller);
                    }
                    debug.warn("loadResourceSafe " + resUrl + " timeout!");
                    this.clearCocosCacheBrute();
                },
                this,
                function () {
                    return this._loadCache[len];
                },
                this);
        }
    },

    /**
     * 和loadResourceSafe相似，可以指定固定的超时时间，不显示等待转圈
     * 适用于一开始有进度条的加载，以及不应该让用户无法操作的下载
     */
    loadResourceSafeSlient: function (resUrl, ccType, callback, caller, fixedTimeout = 12) {
        this.loadResourceSafe(resUrl, ccType, callback, caller, true, fixedTimeout);
    },

    //暂时没有在用这个api
    loadRemoteImage(url, callback) {
        if (url == null || url == "") {
            return;
        }

        var saveFile = function () { };
        if (window.jsb == null) {
            debug.log("加载远程图片，不是原生平台!!");
            callback(null);
        } else {
            var dirpath = jsb.fileUtils.getWritablePath() + 'customRes/';
            //debug.log("dirpath ->" + dirpath);

            let formatedFilename = this.convertPathRemoveDirectory(url);
            // debug.log(formatedFilename);
            if (formatedFilename == null || formatedFilename == "") {
                try {
                    throw new Error()
                } catch (r) {
                    debug.warn("formatedFilename null");
                    console.warn(r);
                }

                return;
            }
            var filepath = dirpath + formatedFilename;

            if (!this.isValidCommonSuffix(this.getSuffixFromPath(filepath))) {
                filepath += '.png';
            }

            debug.log("filepath ->" + filepath);

            let self = this;

            if (jsb.fileUtils.isFileExist(filepath)) {
                debug.log('Remote found' + filepath);
                self.loadImage(filepath, callback);
                return;
            }

            saveFile = function (data) {
                if (typeof data != 'null') {
                    if (!jsb.fileUtils.isDirectoryExist(dirpath)) {

                        jsb.fileUtils.createDirectory(dirpath);
                    } else {
                        debug.log("路径exist");
                    }

                    // new Uint8Array(data) writeDataToFile  writeStringToFile
                    if (jsb.fileUtils.writeDataToFile(new Uint8Array(data), filepath)) {
                        debug.log('Remote write file succeed.');
                        self.loadImage(filepath, callback);
                    } else {
                        debug.log('Remote write file failed.');
                    }
                } else {
                    debug.log('Remote download file failed.');
                }
            };
        }

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            debug.log("xhr.readyState  " + xhr.readyState);
            debug.log("xhr.status  " + xhr.status);
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    saveFile(xhr.response);
                } else {
                    saveFile(null);
                }
            }
        }.bind(this);

        //responseType一定要在外面设置
        // xhr.responseType = 'arraybuffer'; 
        xhr.responseType = 'arraybuffer';
        xhr.open("GET", url, true);
        xhr.send();
        debug.log("xhr.send");
    },

    isDownloading: function (url) {
        let pCallbacks = this._currentDownloadings[url];
        if (pCallbacks == null || pCallbacks.length == null || pCallbacks.length < 1) {
            return false;
        }

        return true;
    },

    isSaving: function (url) {
        let pCallbacks = this._currentSavings[url];
        if (pCallbacks == null || pCallbacks.length == null || pCallbacks.length < 1) {
            return false;
        }

        return true;
    },

    addDownloadCallback: function (url, callback, caller) {
        if (this._currentDownloadings[url] == null) {
            this._currentDownloadings[url] = [];
        }

        let pCallback = {};
        pCallback.caller = caller;
        pCallback.callback = callback;
        this._currentDownloadings[url].push(pCallback);
    },

    addSaveCallback: function (path, callback, caller) {
        if (this._currentSavings[path] == null) {
            this._currentSavings[path] = [];
        }

        let pCallback = {};
        pCallback.caller = caller;
        pCallback.callback = callback;
        this._currentSavings[path].push(pCallback);
    },

    onDownloadCallback: function (url, res) {
        if (!this.isDownloading(url)) {
            return;
        }

        let pCallbacks = this._currentDownloadings[url];
        for (let i in pCallbacks) {
            let pCallback = pCallbacks[i];
            if (pCallback != null && pCallback.caller != null && pCallback.callback != null) {
                pCallback.callback.call(pCallback.caller, res);
            }
        }

        this._currentDownloadings[url] = null;
    },

    onSaveCallback(url, res) {
        if (!this.isSaving(url)) {
            return;
        }

        let pCallbacks = this._currentSavings[url];
        for (let i in pCallbacks) {
            let pCallback = pCallbacks[i];
            if (pCallback != null && pCallback.caller != null && pCallback.callback != null) {
                pCallback.callback.call(pCallback.caller, res);
            }
        }

        this._currentSavings[url] = null;
    },

    clearCocosCacheBrute: function () {
        if (cc.loader._cache != null) {
            cc.loader._cache = [];
        }
    },

    releaseCocosCache: function (res, url) {
        if (!res && !url) {
            return;
        }

        cc.loader.release(cc.loader.getDependsRecursively(res == null ? url : res));
    },
});