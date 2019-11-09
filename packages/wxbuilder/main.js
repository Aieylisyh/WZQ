'use strict';

var path = require('path');
var fs = require('fs');
var localResUUIDs = [];
var cachedOption = null;

function onBeforeChangeFiles(options, callback) {
  options.previewHeight = 640;
  options.previewWidth = 1136;

  //changeRenderMode(options);
  callback();
}

function onBuildFinish(options, callback) {
  Editor.log("onBuildFinish");
  if (options.buildResults != null) {
    cachedOption = options;
  }

  modifyGameJson(options);
  replaceFileInDirRecursively(options, options.project + '\\wechatGameConfigFiles', "");
  modifyGameJs(options);

  callback();
}

function onRemoveNonLocalFiles() {
  Editor.log("onRemoveNonLocalFiles");
  localResUUIDs = [];

  if (cachedOption == null) {
    return;
  }

  let basePath = cachedOption.project + '\\assets\\resources\\localRes';
  processFileInDirRecursively(cachedOption, basePath, "");
  //Editor.log(localResUUIDs);
  let rawassetsUrl = path.join(cachedOption.dest, 'res', 'raw-assets');

  emptyDir(rawassetsUrl);
  //rmEmptyDir(rawassetsUrl);

  localResUUIDs = [];
}

function modifyGameJs(options) {
  let filePath = path.join(options.dest, 'game.js'); //找到 'game.js'
  let script = fs.readFileSync(filePath, 'utf8');
  let obj = script.split("\n");
  // for (let i = 0; i < obj.length; i++) {
  //   let line = obj[i];
  //   if (line.search(/^\s*wxDownloader\./) > -1) {
  //     obj[i] = "";
  //   }
  // }
  obj[0] = "require('utils/ald-game.js');\n" + obj[0];
  script = obj.join("\n");
  //script += '\n' + "require('custom.js');"; //加一行
  fs.writeFileSync(filePath, script);
}

function modifyGameJson(options) {
  let filePath = path.join(options.dest, 'game.json');
  let script = fs.readFileSync(filePath, 'utf8');
  let obj = script.split("\n");
  for (let i = 0; i < obj.length; i++) {
    if (i == 1) {
      obj[i] = obj[i] + '\n"openDataContext": "src/myOpenDataContext",';
    }
  }
  script = obj.join("\n");
  fs.writeFileSync(filePath, script);
}

function replaceFileInDirRecursively(options, baseDirPath, additionalDirPath) {
  //Editor.log("replaceFileInDirRecursively " + baseDirPath + additionalDirPath);
  let paths = fs.readdirSync(baseDirPath + additionalDirPath, 'utf8'); //读取外部文件
  //Editor.log(paths);

  for (let i = 0; i < paths.length; i++) {
    let tpPath = baseDirPath + additionalDirPath + '\\' + paths[i];
    if (!fs.statSync(tpPath).isFile()) {
      //Editor.log(tpPath + " is dir");
      if (!fs.existsSync(options.dest + additionalDirPath + '\\' + paths[i])) {
        //Editor.log("mkdir " + options.dest + additionalDirPath + '\\' + paths[i]);
        fs.mkdirSync(options.dest + additionalDirPath + '\\' + paths[i]);
      }
      replaceFileInDirRecursively(options, baseDirPath, additionalDirPath + '\\' + paths[i]);
    } else {
      //Editor.log(tpPath + " is file");
      try {
        let optionParam = 'utf8';
        if (paths[i].search(/\.png$/) > -1 || paths[i].search(/\.jpg$/) > -1 ||
          paths[i].search(/\.mp3$/) > -1 || paths[i].search(/\.ogg$/) > -1) {
          optionParam = null;
        }
        let tpFile = fs.readFileSync(tpPath, optionParam);
        //Editor.log("saving file to " + options.dest + additionalDirPath);
        fs.writeFileSync(options.dest + additionalDirPath + '\\' + paths[i], tpFile);
      } catch (e) {
        Editor.log(e);
      }
    }
  }
}

function processFileInDirRecursively(options, baseDirPath, additionalDirPath) {
  let paths = fs.readdirSync(baseDirPath + additionalDirPath, 'utf8'); //读取外部文件
  //Editor.log(paths);

  for (let i = 0; i < paths.length; i++) {
    let tpPath = baseDirPath + additionalDirPath + '\\' + paths[i];
    if (!fs.statSync(tpPath).isFile()) {
      processFileInDirRecursively(options, baseDirPath, additionalDirPath + '\\' + paths[i]);
    } else {
      //Editor.log(tpPath + " is file");
      getFileReadRawAssetsPath(options, tpPath);
    }
  }
}

function getFileReadRawAssetsPath(options, path) {
  let relativeUrl = absPathToRelativeUrl(path);

  if (relativeUrl.search(/.meta$/) > -1) {
    return;
  }
  var resUuid = Editor.assetdb.urlToUuid(relativeUrl);
  if (resUuid == null || resUuid == "") {
    return;
  }

  // 通过 options.buildResults 访问 BuildResults
  var buildResults = options.buildResults;
  // 获得指定资源依赖的所有资源
  var depends = buildResults.getDependencies(resUuid);
  if (depends.length > 0) {
    for (var i = 0; i < depends.length; ++i) {
      var uuid = depends[i];
      var url = Editor.assetdb.uuidToUrl(uuid);
      // 获取资源类型
      var type = buildResults.getAssetType(uuid);
      // 获得资源在项目中的绝对路径
      var path = Editor.assetdb.uuidToFspath(uuid);

      if (type == "cc.Texture2D") {
        //Editor.log(`url ${url} uuid ${uuid}`);
        localResUUIDs.push(uuid);
      }
    }
  } else {
    var type = buildResults.getAssetType(resUuid);

    if (type == "cc.Texture2D") {
      //Editor.log(`url ${relativeUrl} uuid ${resUuid}`);
      localResUUIDs.push(resUuid);
    }
  }
}

function emptyDir(fileUrl) {
  var files = fs.readdirSync(fileUrl); //读取该文件夹

  files.forEach(function(file) {

    var stats = fs.statSync(fileUrl + '/' + file);

    if (stats.isDirectory()) {

      emptyDir(fileUrl + '/' + file);

    } else {

      let canDelete = true;
      if (localResUUIDs != null && localResUUIDs.length > 0) {

        for (let i = 0; i < localResUUIDs.length; i++) {
          if (file.indexOf(localResUUIDs[i]) > -1) {
            canDelete = false;
          }
        }
      }
      if (canDelete) {
        fs.unlinkSync(fileUrl + '/' + file);
        //Editor.log("删除" + fileUrl + '/' + file);
      }
    }
  });
}

//删除所有的空文件夹
function rmEmptyDir(fileUrl) {
  var files = fs.readdirSync(fileUrl);
  if (files.length > 0) {
    files.forEach(function(fileName) {
      let childFileUrl = fileUrl + '/' + fileName;
      let childFile = fs.readdirSync(childFileUrl);

      if (childFile.length <= 0) {
        fs.rmdirSync(childFileUrl);
      } else {
        //Editor.log(childFile);
      }
    });

  } else {
    fs.rmdirSync(fileUrl);
  }
}

function absPathToRelativeUrl(path) {
  path = path.replace(/^.*assets/, 'db:\/\/assets');
  path = path.replace(/\\/g, '\/');
  return path;
}

function changeRenderMode(options) {
  let filePath = path.join(options.dest, 'main.js'); //找到 'main.js'
  let script = fs.readFileSync(filePath, 'utf8');
  let obj = script.split("\n");
  for (let i = 0; i < obj.length; i++) {
    let line = obj[i];
    let temp = line.search(/^\s*cc.game.run/);
    if (temp > -1) {
      obj[i] = "if(navigator !=null && navigator.systemInfo != null && navigator.systemInfo.system.search('iOS 10') > -1 ){\noption.renderMode = 1;\n};\n" + obj[i];
      continue;
    }

    temp = line.search(/^\s*cc.view.resizeWithBrowserSize/);
    if (temp > -1) {
      obj[i] = "cc.ContainerStrategy.prototype._setupContainer = function (view, w, h) \n{\nvar locCanvas = cc.game.canvas, locContainer = cc.game.container;\n\nif (!CC_WECHATGAME && cc.sys.os === cc.sys.OS_ANDROID) {\ndocument.body.style.width = (view._isRotated ? h : w) + 'px';\ndocument.body.style.height = (view._isRotated ? w : h) + 'px';\n}\n\n\n// Setup style\nlocContainer.style.width = locCanvas.style.width = w + 'px';\nlocContainer.style.height = locCanvas.style.height = h + 'px';\n // Setup pixel ratio for retina display\n var devicePixelRatio = view._devicePixelRatio = 1;\nif (view.isRetinaEnabled()) {\ndevicePixelRatio = view._devicePixelRatio = window.devicePixelRatio || 1;\n}\n//Setup canvas\nlocCanvas.width = w * devicePixelRatio;\n locCanvas.height = h * devicePixelRatio;\n};\ncc.view.enableRetina(true);\n" + obj[i];
      continue;
    }
  }

  script = obj.join("\n");
  fs.writeFileSync(filePath, script);
}

module.exports = {
  load() {
    // execute when package loaded
    Editor.Builder.on('before-change-files', onBeforeChangeFiles);
    Editor.Builder.on('build-finished', onBuildFinish);
    //require('electron').ipcMain.on('deleteNonLocal', onRemoveNonLocalFiles);
  },

  unload() {
    // execute when package unloaded
    Editor.Builder.removeListener('before-change-files', onBeforeChangeFiles);
    Editor.Builder.removeListener('build-finished', onBuildFinish);
    //require('electron').ipcMain.removeListener('deleteNonLocal', onRemoveNonLocalFiles);
  },
}