/*
 * @Author: baozhoutao@steedos.com
 * @Date: 2022-07-20 16:29:22
 * @LastEditors: baozhoutao@steedos.com
 * @LastEditTime: 2024-11-17 13:05:44
 * @Description: 
 */
import { getRootUrl } from "../../steedos.client";

export function getSvgUrl(source, name) {
    var foo, url;
    foo = name != null ? name.split(".") : void 0;
    if (foo && foo.length > 1) {
      source = foo[0];
      if (!(source != null ? source.endsWith("-sprite") : void 0)) {
        source += "-sprite";
      }
      name = foo[1];
    }
    url = "/assets/icons/" + source + "/svg/symbols.svg#" + name;
    return `${getRootUrl()}${url}`;
}

export function getImageFieldUrl(url, readonly) {
  if (window.Meteor) {
    if(window.Meteor.isCordova != true){
      //  '//'的位置
      const doubleSlashIndex = url.indexOf('//');
      const urlIndex = url.indexOf('/', doubleSlashIndex + 2);
      const rootUrl = url.substring(urlIndex);
      return rootUrl;
    }else{
      if(readonly || url.startsWith('http')){
        return `${url}?token=${window.btoa(JSON.stringify({ authToken : Builder.settings.context.authToken }))}`
      }
    }
  }
  return url;
}

if(typeof window  != 'undefined'){
  window.getImageFieldUrl = getImageFieldUrl;
}



// js color

function toGrayscale(r, g, b){
  return (
    0.2126 * r +
    0.7152 * g +
    0.0722 * b
  );
}

function isLight(r, g, b){
  // 专业的亮度是 > 255 / 2. 此处的阈值调整为200 
  return toGrayscale(r, g, b) > 200
}

export function getContrastColor(bgColor) {
  var backgroundColor = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(backgroundColor.substr(0, 2), 16);
  var g = parseInt(backgroundColor.substr(2, 2), 16);
  var b = parseInt(backgroundColor.substr(4, 2), 16);
  return isLight(r, g, b) ? "#000000" : "#ffffff";
}

export function getLookupListView(refObjectConfig) {
  if(!refObjectConfig){
    return null;
  }
  const listNameAll = "all";
  const listNameLookup = "lookup";
  let listViewAll, listViewLookup;

  _.each(
    refObjectConfig.list_views,
    (view, name) => {
      if (name === listNameAll) {
        listViewAll = view;
        if(!listViewAll.name){
          listViewAll.name = name;
        }
      }
      else if (name === listNameLookup) {
        listViewLookup = view;
        if(!listViewLookup.name){
          listViewLookup.name = name;
        }
      }
    }
  );
  let listView = listViewLookup || listViewAll;
  return listView;
}


/**
 * 获取可比较的amis版本号
 * @returns 只返回前两位版本，第三位忽略，比如3.6.3返回3.6
 */
export function getComparableAmisVersion() {
  let amis = (window.amisRequire && window.amisRequire('amis')) || window.Amis;
  let amisVersion = amis && amis.version;
  if(amisVersion){
      let comparableVersions = amisVersion.split(".");
      let comparableVersion = parseFloat(comparableVersions[0].toString() + "." + comparableVersions[1].toString());
      return comparableVersion;
  }
}

/**
 * 判断浏览器类型
 * @returns 按需返回浏览器类型;
 */
 export function getBowserType() {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Chrome")!== -1 && userAgent.indexOf("Safari") !== -1 && userAgent.indexOf("Edg") === -1) {
      return "Chrome";
    } else if (userAgent.indexOf("Firefox") !== -1) {
      return "Firefox";
    } else if (userAgent.indexOf("Safari") !== -1 && userAgent.indexOf("Chrome") === -1 && userAgent.indexOf("Edge") === -1) {
      return "Safari";
    } else if (userAgent.indexOf("Edg") !== -1) {
      return "Edge";
    } else {
      return "Unknown browser"; // 其他浏览器...（可根据自己需要确定是否新增其他浏览器的判断）
    }
}