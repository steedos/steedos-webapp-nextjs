/*
 * @Author: baozhoutao@steedos.com
 * @Date: 2022-07-04 11:24:28
 * @LastEditors: baozhoutao@steedos.com
 * @LastEditTime: 2022-12-16 12:00:35
 * @Description:
 */
import React, { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/router";
import { AmisRender } from "@/components/AmisRender";
import { getPage, getUISchema } from "@steedos-widgets/amis-lib";
import { Loading } from '@/components/Loading';

const getTabDisplayAs = (tab_id) => {
  const key = `tab:${tab_id}:display`;
  const value = localStorage.getItem(key)
  return value ? value : 'grid'
}

const setTabDisplayAs = (tab_id, displayAs) => {
  const key = `tab:${tab_id}:display`;
  localStorage.setItem(key, displayAs)
}

export default function Record({formFactor: defaultFormFactor}) {
  console.log(defaultFormFactor)
  const router = useRouter();
  const [uiSchema, setUiSchema] = useState(null);
  const { app_id, tab_id, listview_id, record_id, display, side_object = tab_id, side_listview_id = listview_id } = router.query;
  const [page, setPage] = useState(false);

  if (display)
    setTabDisplayAs(tab_id, display)

  const displayAs = (defaultFormFactor === 'SMALL')? 'grid': display? display : getTabDisplayAs(tab_id);

  useEffect(() => {
    const p1 = getPage({type: 'record', appId: app_id, objectName: tab_id, defaultFormFactor});
    const p2 = getUISchema(tab_id);
    Promise.all([p1, p2]).then((values) => {
      setPage(values[0]);
      setUiSchema(values[1]);
    });

  }, [app_id, tab_id]);

  const renderId = SteedosUI.getRefId({
    type: "detail",
    appId: app_id,
    name: tab_id,
  });

  if(page === false || uiSchema === null){
    return <Loading></Loading>
  }

  const schema = page? JSON.parse(page.schema) : {
    "type": "service",
    "className": "m-0 sm:m-3",
    "name": `amis-${app_id}-${tab_id}-detail`,
    "body": [
      {
        "type": "steedos-record-detail",
        "objectApiName": "${objectName}",
        "recordId": "${recordId}",
        appId: app_id,
        "id": "u:48d2c28eb755",
        onEvent: {
            "recordLoaded": {
                "actions": [
                    {
                        "actionType": "reload",
                        "data": {
                          "name": `\${record.${uiSchema.NAME_FIELD_KEY || 'name'}}`
                        }
                    }
                ]
              }
        },
      }
    ],
    "regions": [
      "body"
    ],
    "id": "u:d138f5276481"
  }

  const listViewId = SteedosUI.getRefId({
    type: "listview",
    appId: app_id,
    name: side_object,
  });
  const listSchema = page? JSON.parse(page.schema) : {
    "type": "steedos-object-listview",
    "objectApiName": side_object,
    "columnsTogglable": false,
    "showHeader": true,
    "formFactor": 'SMALL',
    "className": "border-r border-slate-300 border-solid"
  }

  return (
    <>
      {displayAs === 'split' && (
        <div className="flex">
          <div className="w-[388px] flex-none">
            <AmisRender
              data={{
                objectName: side_object,
                listViewId: listViewId,
                listName: side_listview_id,
                appId: app_id,
                formFactor: defaultFormFactor,
                scopeId: listViewId,
              }}
              className="steedos-listview p-0	flex flex-1 flex-col"
              id={listViewId}
              schema={listSchema}
              router={router}
            ></AmisRender>
          </div>
          <div className="flex-1">
            <AmisRender
              data={{
                objectName: tab_id,
                recordId: record_id,
                appId: app_id,
                formFactor: defaultFormFactor,
                scopeId: renderId+"-page"
              }}
              className="steedos-record-detail"
              id={`${renderId}-page`}
              schema={schema}
              router={router}
          ></AmisRender>
          </div>
        </div>
      )}

      {displayAs !== 'split' && schema && uiSchema && (
        <AmisRender
          data={{
            objectName: tab_id,
            recordId: record_id,
            appId: app_id,
            formFactor: defaultFormFactor,
            scopeId: renderId+"-page"
          }}
          className="steedos-record-detail"
          id={`${renderId}-page`}
          schema={schema}
          router={router}
        ></AmisRender>
      )}
      
    </>
  )
}
