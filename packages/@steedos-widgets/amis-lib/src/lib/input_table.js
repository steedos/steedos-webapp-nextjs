/*
 * @Author: 殷亮辉 yinlianghui@hotoa.com
 * @Date: 2023-11-15 09:50:22
 * @LastEditors: 殷亮辉 yinlianghui@hotoa.com
 * @LastEditTime: 2023-11-17 20:17:56
 */

import { getTableColumns } from './converter/amis/fields/table';

/**
 * @param {*} props 
 * @param {*} mode edit/new/readonly
 */
function getFormFields(props, mode = "edit") {
    return (props.fields || []).map(function (item) {
        return {
            "type": "steedos-field",
            "config": item
        }
    }) || [];
}

/**
 * @param {*} props 
 * @param {*} mode edit/new/readonly
 */
async function getInputTableColumns(props) {
    // return props.fields.map(function(item){
    //     return {
    //         "type": "steedos-field",
    //         "config": item,
    //         "static": true,
    //         "readonly": true
    //     }
    // }) || [];

    let columns = await getTableColumns(props.fields || [], {
        isInputTable: true,
        permissions: {
            allowEdit: false //快速编辑开关与权限有关
        }
    });
    // columns = columns.map(function(item){
    //     if(["text"].indexOf(item.type) > -1){
    //         return Object.assign({}, item, {
    //             "type": "static"
    //         });
    //     }
    //     else{
    //         return item;
    //     }
    // }) || [];
    return columns;
}

/**
 * @param {*} props 
 * @param {*} mode edit/new/readonly
 */
function getForm(props, mode = "edit") {
    let schema = {
        "type": "form",
        "title": "表单",
        "body": getFormFields(props, mode)
    };
    if (mode === "edit") {
        Object.assign(schema, {
            "onEvent": {
                "submit": {
                    "weight": 0,
                    "actions": [
                        {
                            "actionType": "setValue",
                            "args": {
                                "index": "${index}",
                                "value": {
                                    "&": "$$"
                                }
                            },
                            "componentId": props.id
                        }
                    ]
                }
            }
        });
    }
    else if (mode === "new") {
        let onNewItemSubmitScript = `
            event.data["${props.name}"].push(JSON.parse(JSON.stringify(event.data)));
            doAction({
                "componentId": "${props.id}",
                "actionType": "setValue",
                "args": {
                    "value": event.data["${props.name}"]
                }
            });
        `;
        Object.assign(schema, {
            "onEvent": {
                "submit": {
                    "weight": 0,
                    "actions": [
                        {
                            "actionType": "custom",
                            "script": onNewItemSubmitScript
                        },
                        // {
                        //     "componentId": props.id,
                        //     "actionType": "addItem",//input-table组件的needConfirm属性为true时，addItem动作会把新加的行显示为编辑状态，所以只能使用上面的custom script来setValue实现添加行
                        //     "args": {
                        //         "index": `\${${props.name}.length || 9000}`,//这里加9000是因为字段如果没放在form组件内，props.name.length拿不到值
                        //         "item": {
                        //             "&": "$$"
                        //         }
                        //     }
                        // }
                    ]
                }
            }
        });
    }
    return schema;
}

function getButtonNew(props) {
    return {
        "label": "新增",
        "type": "button",
        "icon": "fa fa-plus",
        "onEvent": {
            "click": {
                "actions": [
                    {
                        "actionType": "dialog",
                        "dialog": {
                            "type": "dialog",
                            "title": "弹框标题",
                            "body": [
                                getForm(props, "new")
                            ],
                            "showCloseButton": true,
                            "showErrorMsg": true,
                            "showLoading": true,
                            "className": "app-popover",
                            "closeOnEsc": false
                        }
                    }
                ]
            }
        },
        "level": "primary"
    };
}

function getButtonEdit(props) {
    return {
        "type": "button",
        "label": "编辑",
        "onEvent": {
            "click": {
                "actions": [
                    {
                        "actionType": "dialog",
                        "dialog": {
                            "type": "dialog",
                            "title": "弹框标题",
                            "body": [
                                getForm(props, "edit")
                            ],
                            "showCloseButton": true,
                            "showErrorMsg": true,
                            "showLoading": true,
                            "className": "app-popover",
                            "closeOnEsc": false
                        }
                    }
                ]
            }
        }
    };
}

function getButtonDelete(props) {
    return {
        "type": "button",
        "label": "删除",
        "onEvent": {
            "click": {
                "actions": [
                    {
                        "actionType": "deleteItem",
                        "args": {
                            "index": "${index+','}" //这里不加逗号后续会报错，语法是逗号分隔可以删除多行
                        },
                        "componentId": props.id
                    }
                ]
            }
        }
    };
}

export const getAmisInputTableSchema = async (props, readonly) => {
    if (!props.id) {
        props.id = "steedos_input_table_" + props.name + "_" + Math.random().toString(36).substr(2, 9);
    }
    let buttonNewSchema = getButtonNew(props);
    let buttonEditSchema = getButtonEdit(props);
    let buttonDeleteSchema = getButtonDelete(props);
    let buttonsForColumnOperations = [];
    if (props.editable) {
        buttonsForColumnOperations.push(buttonEditSchema)
    }
    if (props.removable) {
        buttonsForColumnOperations.push(buttonDeleteSchema)
    }
    let inputTableSchema = {
        "type": "input-table",
        "label": props.label,
        "name": props.name,
        //不可以addable/editable/removable设置为true，因为会在原生的操作列显示操作按钮图标，此开关实测只控制这个按钮显示不会影响功能
        // "addable": props.addable,
        // "editable": props.editable,
        // "removable": props.removable, 
        "draggable": props.draggable,
        "showIndex": props.showIndex,
        "perPage": props.perPage,
        "id": props.id,
        "columns": await getInputTableColumns(props),
        // "needConfirm": false, //不可以配置为false，否则，单元格都是可编辑状态，且很多static类型无法正常显示，比如static-mapping
        "strictMode": true,
        "showTableAddBtn": false,
        "showFooterAddBtn": false
    };
    if (buttonsForColumnOperations.length) {
        inputTableSchema.columns.push({
            "name": "__op__",
            "type": "operation",
            "buttons": buttonsForColumnOperations
        });
    }
    let schema = {
        "type": "wrapper",
        "size": "none",
        "body": [
            inputTableSchema
        ]
    };
    if (props.addable) {
        schema.body.push(buttonNewSchema);
    }
    return schema;
}