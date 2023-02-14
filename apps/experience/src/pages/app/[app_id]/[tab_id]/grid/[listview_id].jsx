/*
 * @Author: baozhoutao@steedos.com
 * @Date: 2022-07-04 11:24:28
 * @LastEditors: baozhoutao@steedos.com
 * @LastEditTime: 2022-12-14 18:16:53
 * @Description: 
 */
import React, { useState, useEffect, Fragment, useRef } from 'react';
import { useRouter } from 'next/router'
import { getPage, Router } from "@steedos-widgets/amis-lib";
import { Loading } from '@/components/Loading';

import { AmisRender } from "@/components/AmisRender";


export default function Page ({ formFactor: defaultFormFactor }) {
  const router = useRouter();

  const { app_id, tab_id, listview_id, display } = router.query;
  const [page, setPage] = useState(false);

  if (display)
    Router.setTabDisplayAs(tab_id, display)

  const displayAs = (defaultFormFactor === 'SMALL')? 'grid': display? display : Router.getTabDisplayAs(tab_id);

  const formFactor = (displayAs === 'split') ? 'SMALL': defaultFormFactor

  useEffect(() => {
    // 微页面
    getPage({type: 'list', appId: app_id, objectName: tab_id, formFactor}).then((data) => {
      setPage(data);
    });
  }, [app_id, tab_id]);

  if(page === false){
    return <Loading></Loading>
  }

  const listViewId = SteedosUI.getRefId({
    type: "listview",
    appId: app_id,
    name: tab_id,
  });
  const scopeId = `${listViewId}-page`;
  const schema = page? JSON.parse(page.schema) : {
    "type": "steedos-object-listview",
    "objectApiName": tab_id,
    "columnsTogglable": false,
    "showHeader": true,
    "showDisplayAs": (defaultFormFactor !== 'SMALL'),
    "formFactor": formFactor,
    "className": displayAs === 'grid'? 
      "absolute inset-0 sm:m-3 sm:mb-0 sm:border sm:shadow sm:rounded border-slate-300 border-solid bg-gray-100" : 
      "absolute top-0 bottom-0 w-[388px] border-r border-slate-300 border-solid bg-gray-100"
  }

  return (
    <>
        <AmisRender
        data={{
          objectName: tab_id,
          listViewId: listViewId,
          listName: listview_id,
          appId: app_id,
          formFactor: formFactor,
          scopeId: listViewId,
        }}
        className={displayAs === 'grid'? "steedos-listview p-0	sm:m-3": "steedos-listview p-0"}
        id={listViewId}
        schema={schema}
        router={router}
        ></AmisRender>
    </>
  )
}
