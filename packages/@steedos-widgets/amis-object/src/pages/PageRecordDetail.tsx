/*
 * @Author: baozhoutao@steedos.com
 * @Date: 2022-07-04 11:24:28
 * @LastEditors: baozhoutao@steedos.com
 * @LastEditTime: 2023-03-02 12:43:07
 * @Description: 
 */
import React, { useState, useEffect, Fragment, useRef } from 'react';
import { getPage, Router } from "@steedos-widgets/amis-lib";


export const PageRecordDetail = async (props) => {
  const { formFactor: defaultFormFactor, appId, objectApiName, listviewId, recordId, display, sideObject = objectApiName, sideListviewId = listviewId, $schema } = props
  
  if (display)
    Router.setTabDisplayAs(objectApiName, display)

  let displayAs = (defaultFormFactor === 'SMALL')? 'grid': display? display : sideObject? 'split': Router.getTabDisplayAs(tabId);
  const formFactor = (["split"].indexOf(displayAs) > -1) ? 'SMALL': defaultFormFactor

  const renderId = SteedosUI.getRefId({
    type: "detail",
    appId: appId,
    name: objectApiName,
  });

  const listPage = await getPage({type: 'list', appId: appId, objectName: objectApiName, formFactor})

  let recordSchema = {}
  if (recordId) {

    const recordPage = await getPage({type: 'record', appId: appId, objectName: objectApiName, formFactor: defaultFormFactor});
    recordSchema = recordPage? JSON.parse(recordPage.schema) : {
      "type": "wrapper",
      "className": "p-0 m-0 sm:m-3 flex-1",
      "name": `amis-${appId}-${objectApiName}-detail`,
      "body": [
        {
          "type": "steedos-record-detail",
          "recordId": "${recordId}",
          "objectApiName": "${objectName}",
          appId: appId,
        }
      ],
    }
  }

  const listViewId = SteedosUI.getRefId({
    type: "listview",
    appId: appId,
    name: sideObject,
  });

  const listSchema = listPage? JSON.parse(listPage.schema) : {
    "type": "steedos-object-listview",
    "objectApiName": sideObject,
    "columnsTogglable": false,
    "showHeader": true,
    "showDisplayAs": true,
    "formFactor": 'SMALL',
  }

  return {
    type: 'service',
    data: {
      ...$schema.data,
      objectName: objectApiName,
      listViewId: sideListviewId,
      listName: sideListviewId,
      recordId,
      appId: appId,
      formFactor: formFactor,
      displayAs: displayAs,
      scopeId: listViewId,
    },
    "className":  (displayAs === 'grid') ? 'p-0 min-h-[50px]' : 'p-0 flex flex-1 overflow-hidden h-full',
    body: (displayAs === 'grid') ? recordSchema : [
      {
        "type": "wrapper",
        "className": `p-0 flex-shrink-0 min-w-[388px] overflow-y-auto border-r border-gray-300 bg-gray-100 shadow lg:order-first lg:flex lg:flex-col`,
        "body": listSchema
      },
      {
        "type": "wrapper",
        "className": 'p-0 flex-1 overflow-y-auto focus:outline-none lg:order-last',
        "body": recordSchema
      }
    ]
  }
}
