/**
 * amis v2.2.0
 * Copyright 2018-2022 baidu
 */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var amisCore = require('amis-core');
require('./ColumnToggler.js');
var fileSaver = require('file-saver');
var mobxStateTree = require('mobx-state-tree');
var moment = require('moment');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var moment__default = /*#__PURE__*/_interopDefaultLegacy(moment);

/**
 * 导出 Excel 功能
 */
/**
 * 将 url 转成绝对地址
 */
var getAbsoluteUrl = (function () {
    var link;
    return function (url) {
        if (!link)
            link = document.createElement('a');
        link.href = url;
        return link.href;
    };
})();
function exportExcel(ExcelJS, props, toolbar) {
    var _a, _b;
    return tslib.__awaiter(this, void 0, void 0, function () {
        var store, env, __, data, columns, rows, tmpStore, filename, res, workbook, worksheet, exportColumnNames, _i, columns_1, column, filteredColumns, firstRowLabels, firstRow, remoteMappingCache, rowIndex, _c, rows_1, row, rowData, sheetRow, columIndex, _d, filteredColumns_1, column, name_1, value, type, imageData, imageDimensions, imageWidth, imageHeight, imageMaxSize, imageMatch, imageExt, imageId, linkURL, e_1, href, linkURL, body, text, absoluteURL, map, source, sourceValue, mapKey, res, viewValue, viewValue, _e, fromNow, _f, format, _g, valueFormat, ISODate, NormalDate, buffer, blob;
        return tslib.__generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    store = props.store, env = props.env, props.classnames, __ = props.translate, data = props.data;
                    columns = store.exportColumns || [];
                    rows = [];
                    filename = 'data';
                    if (!(typeof toolbar === 'object' && toolbar.api)) return [3 /*break*/, 2];
                    return [4 /*yield*/, env.fetcher(toolbar.api, data)];
                case 1:
                    res = _h.sent();
                    if (!res.data) {
                        env.notify('warning', __('placeholder.noData'));
                        return [2 /*return*/];
                    }
                    if (Array.isArray(res.data)) {
                        rows = res.data;
                    }
                    else {
                        rows = res.data.rows || res.data.items;
                    }
                    // 因为很多方法是 store 里的，所以需要构建 store 来处理
                    tmpStore = amisCore.TableStore.create(mobxStateTree.getSnapshot(store));
                    tmpStore.initRows(rows);
                    rows = tmpStore.rows;
                    return [3 /*break*/, 3];
                case 2:
                    rows = store.rows;
                    _h.label = 3;
                case 3:
                    if (typeof toolbar === 'object' && toolbar.filename) {
                        filename = amisCore.filter(toolbar.filename, data, '| raw');
                    }
                    if (rows.length === 0) {
                        env.notify('warning', __('placeholder.noData'));
                        return [2 /*return*/];
                    }
                    workbook = new ExcelJS.Workbook();
                    worksheet = workbook.addWorksheet('sheet', {
                        properties: { defaultColWidth: 15 }
                    });
                    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
                    exportColumnNames = toolbar.columns;
                    if (amisCore.isPureVariable(exportColumnNames)) {
                        exportColumnNames = amisCore.resolveVariableAndFilter(exportColumnNames, data, '| raw');
                    }
                    // 自定义导出列配置
                    if (toolbar.exportColumns && Array.isArray(toolbar.exportColumns)) {
                        columns = toolbar.exportColumns;
                        // 因为后面列 props 都是从 pristine 里获取，所以这里归一一下
                        for (_i = 0, columns_1 = columns; _i < columns_1.length; _i++) {
                            column = columns_1[_i];
                            column.pristine = column;
                        }
                    }
                    filteredColumns = exportColumnNames
                        ? columns.filter(function (column) {
                            var filterColumnsNames = exportColumnNames;
                            if (column.name && filterColumnsNames.indexOf(column.name) !== -1) {
                                return true;
                            }
                            return false;
                        })
                        : columns;
                    firstRowLabels = filteredColumns.map(function (column) {
                        return column.label;
                    });
                    firstRow = worksheet.getRow(1);
                    firstRow.values = firstRowLabels;
                    worksheet.autoFilter = {
                        from: {
                            row: 1,
                            column: 1
                        },
                        to: {
                            row: 1,
                            column: firstRowLabels.length
                        }
                    };
                    remoteMappingCache = {};
                    rowIndex = 1;
                    _c = 0, rows_1 = rows;
                    _h.label = 4;
                case 4:
                    if (!(_c < rows_1.length)) return [3 /*break*/, 19];
                    row = rows_1[_c];
                    rowData = amisCore.createObject(data, row.data);
                    rowIndex += 1;
                    sheetRow = worksheet.getRow(rowIndex);
                    columIndex = 0;
                    _d = 0, filteredColumns_1 = filteredColumns;
                    _h.label = 5;
                case 5:
                    if (!(_d < filteredColumns_1.length)) return [3 /*break*/, 18];
                    column = filteredColumns_1[_d];
                    columIndex += 1;
                    name_1 = column.name;
                    value = amisCore.getVariable(rowData, name_1);
                    if (typeof value === 'undefined' && !column.pristine.tpl) {
                        return [3 /*break*/, 17];
                    }
                    // 处理合并单元格
                    if (name_1 in row.rowSpans) {
                        if (row.rowSpans[name_1] === 0) {
                            return [3 /*break*/, 17];
                        }
                        else {
                            // start row, start column, end row, end column
                            worksheet.mergeCells(rowIndex, columIndex, rowIndex + row.rowSpans[name_1] - 1, columIndex);
                        }
                    }
                    type = column.type || 'plain';
                    if (!((type === 'image' || type === 'static-image') && value)) return [3 /*break*/, 11];
                    _h.label = 6;
                case 6:
                    _h.trys.push([6, 9, , 10]);
                    return [4 /*yield*/, amisCore.toDataURL(value)];
                case 7:
                    imageData = _h.sent();
                    return [4 /*yield*/, amisCore.getImageDimensions(imageData)];
                case 8:
                    imageDimensions = _h.sent();
                    imageWidth = imageDimensions.width;
                    imageHeight = imageDimensions.height;
                    imageMaxSize = 100;
                    if (imageWidth > imageHeight) {
                        if (imageWidth > imageMaxSize) {
                            imageHeight = (imageMaxSize * imageHeight) / imageWidth;
                            imageWidth = imageMaxSize;
                        }
                    }
                    else {
                        if (imageHeight > imageMaxSize) {
                            imageWidth = (imageMaxSize * imageWidth) / imageHeight;
                            imageHeight = imageMaxSize;
                        }
                    }
                    imageMatch = imageData.match(/data:image\/(.*);/);
                    imageExt = 'png';
                    if (imageMatch) {
                        imageExt = imageMatch[1];
                    }
                    // 目前 excel 只支持这些格式，所以其它格式直接输出 url
                    if (imageExt != 'png' && imageExt != 'jpeg' && imageExt != 'gif') {
                        sheetRow.getCell(columIndex).value = value;
                        return [3 /*break*/, 17];
                    }
                    imageId = workbook.addImage({
                        base64: imageData,
                        extension: imageExt
                    });
                    linkURL = getAbsoluteUrl(value);
                    worksheet.addImage(imageId, {
                        // 这里坐标位置是从 0 开始的，所以要减一
                        tl: { col: columIndex - 1, row: rowIndex - 1 },
                        ext: {
                            width: imageWidth,
                            height: imageHeight
                        },
                        hyperlinks: {
                            tooltip: linkURL
                        }
                    });
                    return [3 /*break*/, 10];
                case 9:
                    e_1 = _h.sent();
                    console.warn(e_1.stack);
                    return [3 /*break*/, 10];
                case 10: return [3 /*break*/, 17];
                case 11:
                    if (!(type == 'link' || type === 'static-link')) return [3 /*break*/, 12];
                    href = column.pristine.href;
                    linkURL = (typeof href === 'string' && href
                        ? amisCore.filter(href, rowData, '| raw')
                        : undefined) || value;
                    body = column.pristine.body;
                    text = typeof body === 'string' && body
                        ? amisCore.filter(body, rowData, '| raw')
                        : undefined;
                    absoluteURL = getAbsoluteUrl(linkURL);
                    sheetRow.getCell(columIndex).value = {
                        text: text || absoluteURL,
                        hyperlink: absoluteURL
                    };
                    return [3 /*break*/, 17];
                case 12:
                    if (!(type === 'mapping' || type === 'static-mapping')) return [3 /*break*/, 16];
                    map = column.pristine.map;
                    source = column.pristine.source;
                    if (!source) return [3 /*break*/, 15];
                    sourceValue = source;
                    if (amisCore.isPureVariable(source)) {
                        sourceValue = amisCore.resolveVariableAndFilter(source, rowData, '| raw');
                    }
                    mapKey = JSON.stringify(source);
                    if (!(mapKey in remoteMappingCache)) return [3 /*break*/, 13];
                    map = remoteMappingCache[mapKey];
                    return [3 /*break*/, 15];
                case 13: return [4 /*yield*/, env.fetcher(sourceValue, rowData)];
                case 14:
                    res = _h.sent();
                    if (res.data) {
                        remoteMappingCache[mapKey] = res.data;
                        map = res.data;
                    }
                    _h.label = 15;
                case 15:
                    if (typeof value !== 'undefined' && map && ((_a = map[value]) !== null && _a !== void 0 ? _a : map['*'])) {
                        viewValue = (_b = map[value]) !== null && _b !== void 0 ? _b : (value === true && map['1']
                            ? map['1']
                            : value === false && map['0']
                                ? map['0']
                                : map['*']);
                        sheetRow.getCell(columIndex).value = amisCore.removeHTMLTag(viewValue);
                    }
                    else {
                        sheetRow.getCell(columIndex).value = amisCore.removeHTMLTag(value);
                    }
                    return [3 /*break*/, 17];
                case 16:
                    if (type === 'date' || type === 'static-date') {
                        viewValue = void 0;
                        _e = column.pristine, fromNow = _e.fromNow, _f = _e.format, format = _f === void 0 ? 'YYYY-MM-DD' : _f, _g = _e.valueFormat, valueFormat = _g === void 0 ? 'X' : _g;
                        if (value) {
                            ISODate = moment__default["default"](value, moment__default["default"].ISO_8601);
                            NormalDate = moment__default["default"](value, valueFormat);
                            viewValue = ISODate.isValid()
                                ? ISODate.format(format)
                                : NormalDate.isValid()
                                    ? NormalDate.format(format)
                                    : false;
                        }
                        if (fromNow) {
                            viewValue = moment__default["default"](value).fromNow();
                        }
                        if (viewValue) {
                            sheetRow.getCell(columIndex).value = viewValue;
                        }
                    }
                    else {
                        if (column.pristine.tpl) {
                            sheetRow.getCell(columIndex).value = amisCore.removeHTMLTag(amisCore.filter(column.pristine.tpl, rowData));
                        }
                        else {
                            sheetRow.getCell(columIndex).value = value;
                        }
                    }
                    _h.label = 17;
                case 17:
                    _d++;
                    return [3 /*break*/, 5];
                case 18:
                    _c++;
                    return [3 /*break*/, 4];
                case 19: return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                case 20:
                    buffer = _h.sent();
                    if (buffer) {
                        blob = new Blob([buffer], {
                            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        });
                        fileSaver.saveAs(blob, filename + '.xlsx');
                    }
                    return [2 /*return*/];
            }
        });
    });
}

exports.exportExcel = exportExcel;
