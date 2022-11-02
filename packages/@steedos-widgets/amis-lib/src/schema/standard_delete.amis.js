export const getSchema = (uiSchema)=>{
    return {
        "type": "service",
        "bodyClassName": "p-0",
        "body": [
            {
                "type": "button",
                "label": "删除",
                "confirmText": "确定要删除此项目?",
                "className": "border-none",
                "onEvent": {
                    "click": {
                        "actions": [
                            {
                              "args": {
                                "api": {
                                    "method": "post",
                                    "url": "${context.rootUrl}/graphql",
                                    "data": {
                                        "&": "$$",
                                        "recordId": "${recordId}",
                                        "objectName": "${objectName}"
                                    },
                                    "requestAdaptor": "const {recordId, objectName} = api.body; var deleteArray = []; deleteArray.push(`delete:${objectName}__delete(id: \"${recordId}\")`); api.data = {query: `mutation{${deleteArray.join(',')}}`}; return api;",
                                    "headers": {
                                        "Authorization": "Bearer ${context.tenantId},${context.authToken}"
                                    }
                                },
                                "messages": {
                                    "success": "删除成功",
                                    "failed": "删除失败"
                                }
                              },
                              "actionType": "ajax"
                            },
                            {
                                "componentId": "",
                                "args": {
                                  "url": "/app/${app_id}/${objectName}/grid/all",
                                  "blank": false
                                },
                                "actionType": "link",
                                "expression": "!!!listViewId"
                            },
                            {
                                "componentId": `listview_${uiSchema.name}`,
                                "actionType": "reload",
                                "expression": "!!listViewId"
                            },
                          ]
                    }
                }
            }
        ],
        "regions": [
          "body"
        ]
      }
}