/*
 * @Author: baozhoutao@steedos.com
 * @Date: 2022-07-23 09:12:14
 * @LastEditors: baozhoutao@steedos.com
 * @LastEditTime: 2022-08-16 09:57:50
 * @Description: 
 */

const Tpl = require('../tpl');

function getListBody(fields, options){
    const columns = [];
    _.each(fields, function(field){

        const tpl = Tpl.getFieldTpl(field, options);

        let type = 'text';
        if(tpl){
            type = 'tpl';
        }
        if(!field.hidden && !field.extra){
            columns.push({
                name: field.name,
                label: field.label,
                sortable: field.sortable,
                // searchable: field.searchable,
                width: field.width,
                type: type,
                tpl: tpl,
                toggled: field.toggled
                // toggled: true 
            })
        }
    });

    return {
        "type": "hbox",
        "columns": columns
      };
}

function getDefaultParams(options){
    return {
        perPage: options.top || 10
    }
}

export function getListSchema(fields, options){
    return {
        mode: "list",
        name: "thelist",
        draggable: false,
        headerToolbar: ['reload'],
        defaultParams: getDefaultParams(options),
        syncLocation: false,
        keepItemSelectionOnPageChange: true,
        checkOnItemClick: true,
        labelTpl: `\${name}`, //TODO 获取name字段
        listItem: {
            body: [...(getListBody(fields, options).columns)],
            actions: options.actions === false ? null : [
                {
                    icon: "fa fa-eye",
                    label: "查看",
                    type: "button",
                    actionType: "link",
                    link: `/app/${options.appId}/${options.tabId}/view/\${_id}`
                }
            ]
        }
    }
}


export function getCardSchema(fields, options){
    return {
        mode: "cards",
        name: "cards",
        draggable: false,
        headerToolbar: ['switch-per-page', 'reload'],
        defaultParams: getDefaultParams(options),
        syncLocation: false,
        keepItemSelectionOnPageChange: false,
        checkOnItemClick: false,
        labelTpl: `\${${options.labelFieldName}}`,
        card: {
            "type": "card",
            "header": {
                "title": Tpl.getFieldTpl(_.find(fields, (f)=>{
                    return f.name === options.labelFieldName;
                }), options),
              },
            "body": [...(getListBody(_.filter(fields, (f)=>{
                return f.name != options.labelFieldName
            }), options).columns)]
          }
    }
}