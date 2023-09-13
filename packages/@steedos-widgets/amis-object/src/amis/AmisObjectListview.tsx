/*
 * @Author: baozhoutao@steedos.com
 * @Date: 2022-09-01 14:44:57
 * @LastEditors: 殷亮辉 yinlianghui@hotoa.com
 * @LastEditTime: 2023-09-12 17:20:36
 * @Description: 
 */
import './AmisObjectListview.less';
import { getListSchema, getObjectListHeader, getUISchema, Router, i18next, createObject } from '@steedos-widgets/amis-lib'
import { keys, pick, difference, find, has, first, values } from 'lodash';

export const AmisObjectListView = async (props) => {
  // console.time('AmisObjectListView')
  console.log(`AmisObjectListView props`, props)
  const { $schema, top, perPage, showHeader=true, data, defaultData, 
      crud = {},
      className="", 
      crudClassName, 
      showDisplayAs = false,
      sideSchema,
      columnsTogglable=false,
      filterVisible = true,
      headerToolbarItems, rowClassNameExpr, hiddenColumnOperation=false, columns,
      crudDataFilter, onCrudDataFilter, env, rebuildOn} = props;
  let { headerSchema } = props;
  let ctx = props.ctx;
  let listName = defaultData?.listName || data?.listName || props?.listName;
  // console.log('AmisObjectListView ==listName=>', listName)
  let defaults: any = {};
  let objectApiName = props.objectApiName || "space_users"; // 只是为了设计器,才在此处设置了默认值. TODO , 使用其他方式来辨别是否再设计器中
  if(!ctx){
    ctx = {};
  }
  const displayAs = Router.getTabDisplayAs(objectApiName);
  // console.log(`AmisObjectListView`, 'displayAs===>', displayAs, objectApiName)
  let formFactor = props.formFactor;
  if(!formFactor){
    const isMobile = window.innerWidth < 768;
    if(isMobile){
      formFactor = 'SMALL';
    }
    else{
      formFactor = 'LARGE';
    }
  }

  // 分栏模式不应该改变尺寸变量值
  // if(["split"].indexOf(displayAs) > -1){
  //   formFactor = 'SMALL';
  // }

  if(!ctx.formFactor){
    ctx.formFactor = formFactor;
  }

  const uiSchema = await getUISchema(objectApiName, false);
  const listView =  find(
    uiSchema.list_views,
    (listView, name) => {
        // 传入listViewName空值则取第一个
        if(!listName){
          listName = name;
        }
        return name === listName || listView._id === listName;
    }
  );
  if(!listView) {
    return {
      "type": "alert",
      "body": `${i18next.t('frontend_listview_warning_start')}${listName}${i18next.t('frontend_listview_warning_end')}`,
      "level": "warning",
      "showIcon": true,
      "className": "mb-3"
    }
  }

  listName = listView.name;

  if (!(ctx && ctx.defaults)) {
    // 支持把crud组件任意属性通过listSchema属性传入到底层crud组件中
    const schemaKeys = difference(keys($schema), ["type", "showHeader","id", "crud"]);
    // 此次是从 props中 抓取到 用户配置的 crud属性, 此处是一个排除法
    const listSchema = pick(props, schemaKeys);
    // className不传入crud组件，crud单独识别crudClassName属性
    listSchema.className = crudClassName;
    listSchema.onEvent = {}; // 为啥要将一个内置event放在此处?
    // 下面expression中_isRelated参数判断的是列表视图分栏模式下，新建、编辑、删除相关子表记录时不应该刷新左侧（主表）列表视图组件
    listSchema.onEvent[`@data.changed.${objectApiName}`] = {
      "actions": [
        {
          "args": {
            "url": "/app/${appId}/${objectName}/view/${event.data.result.data.recordId}?side_object=${objectName}&side_listview_id=${listName}",
            "blank": false
          },
          "actionType": "link",
          "expression": "${!!!event.data.recordId && event.data.__deletedRecord != true && event.data._isRelated != true}" //是新建, 则进入详细页面. 
        },
        {
          "actionType": "reload",
          "expression": "${(event.data.recordId || event.data.__deletedRecord === true || event.data.displayAs === 'split') && event.data._isRelated != true}" //不是新建, 或分栏模式下新建主对象记录, 则刷新列表
        }
      ]
    }
    defaults = {
      listSchema: Object.assign( {}, listSchema, crud )
    };
  }

  let setDataToComponentId = ctx && ctx.setDataToComponentId;
  if(!setDataToComponentId){
    setDataToComponentId = `service_listview_${objectApiName}`;
  }

  // const amisSchemaData = Object.assign({}, data, defaultData);
  const amisSchemaData = createObject(data, defaultData);
  const listViewId = ctx?.listViewId || amisSchemaData.listViewId;
  const listViewSchemaProps = { 
    top, perPage, showHeader, defaults, ...ctx, listViewId, setDataToComponentId, filterVisible, showDisplayAs, displayAs, 
    headerToolbarItems, rowClassNameExpr, hiddenColumnOperation, columns,
    crudDataFilter, onCrudDataFilter, amisData: amisSchemaData, env
  }

  if(!headerSchema){
    headerSchema = getObjectListHeader(uiSchema, listName, ctx); 
  }

  // TODO: recordPermissions和_id是右上角按钮需要强依赖的变量，应该写到按钮那边去
  const serviceData: any = Object.assign({}, { showDisplayAs, displayAs, recordPermissions: uiSchema.permissions, _id: null, $listviewId: listName });
  if(has(props, 'objectApiName')){
    serviceData.objectName = objectApiName;
  }
  if(has(props, 'listName') && has(props, '$$editor')){
    serviceData.listName = listName;
  }
  if(!has(data, 'uiSchema')){
    serviceData.uiSchema = uiSchema;
  }

  serviceData.defaultListName = listName ? listName : first(values(uiSchema.list_views))?.name
  // console.timeEnd('AmisObjectListView')
  // console.log('serviceData===>', serviceData)
  // console.log('headerSchema===>', headerSchema)
  return {
    type: "service",
    data: serviceData,
    className: `${className} sm:bg-gray-100 h-full sm:shadow sm:rounded-tl sm:rounded-tr steedos-object-listview`,
    body: [{
      "type": "wrapper",
      "size": "none",
      "className": "flex flex-1 h-full",
      body: [
        sideSchema ? {
          "type": "wrapper",
          "size": "none",
          "className": "flex-shrink-0 min-w-[200px] h-full border-r border-gray-200 lg:order-first lg:flex lg:flex-col",
          "body": sideSchema
        } : null,
        {
          "type": "wrapper",
          "size": "none",
          "className": sideSchema ? `flex-1 focus:outline-none lg:order-last w-96 h-full` : 'w-full h-full',
          "body": {
            type: "wrapper",
            className: "p-0 m-0 steedos-object-table h-full flex flex-col",
            body: [
              ...headerSchema, //list view header,
              {
                "type": "service",
                "id": "service_schema_api_" + objectApiName,
                "schemaApi": {
                    // 这里url上加objectApiName属性是因为设计器中切换对象时不会变更列表视图界面，不可以用objectName=${objectName}使用作用域中objectName变量是因为设计器那边不会监听识别data变化来render组件
                    "url": "${context.rootUrl}/graphql?objectName=" + objectApiName + "&listName=${listName}&display=${display}&rebuildOn=" + rebuildOn,
                    "method": "post",
                    "messages": {
                    },
                    "headers": {
                        "Authorization": "Bearer ${context.tenantId},${context.authToken}"
                    },
                    "requestAdaptor": "api.data={query: '{spaces__findOne(id: \"none\"){_id,name}}'};return api;",
                    "adaptor": `
                        // console.log('service listview schemaApi adaptor....', api.body); 
                        let { appId, objectName, defaultListName: listName, display, formFactor: defaultFormFactor} = api.body;
                        if(api.body.listName){
                          listName = api.body.listName;
                        }
                        return new Promise((resolve)=>{
                          const listViewSchemaProps = ${JSON.stringify(listViewSchemaProps)};
                          const formFactor = (["split"].indexOf(display) > -1) ? 'SMALL': defaultFormFactor;
                          listViewSchemaProps.formFactor = formFactor;
                          listViewSchemaProps.displayAs = display;
                          console.log("====listViewSchemaProps===>", listName, display, listViewSchemaProps)
                          window.getListSchema(appId, objectName, listName, listViewSchemaProps).then((schema)=>{
                            try{
                              const uiSchema = schema.uiSchema;
                              const listView = _.find(
                                uiSchema.list_views,
                                (listView, name) => {
                                    // 传入listViewName空值则取第一个
                                    if(!listName){
                                      listName = name;
                                    }
                                    return name === listName || listView._id === listName;
                                }
                              );
                              if(listView){
                                window.Steedos && window.Steedos.setDocumentTitle && window.Steedos.setDocumentTitle({pageName: listView.label || listView.name})
                              }
                            }catch(e){
                              console.error(e)
                            }
                            payload.data = schema.amisSchema;
                            console.log("payload================>", payload)
                            resolve(payload)
                          });
                        });
                      `
                },
                // "body": body,
                // "data": serviceData
              }
            ]
          }
        }
      ]
    }
    ]
  }
}