/*
 * @Author: baozhoutao@steedos.com
 * @Date: 2022-09-09 11:54:45
 * @LastEditors: baozhoutao@steedos.com
 * @LastEditTime: 2022-09-13 15:24:56
 * @Description: 
 */
import React, {useEffect, useState} from 'react';
import { registerRemoteAssets, amisRender, getSteedosAuth, getRootUrl } from '@steedos-widgets/amis-lib';
import { defaultsDeep } from 'lodash';
import { Builder } from '@steedos-builder/react';

if (Builder.isBrowser){
  (window as any).Builder = Builder;
  Builder.set({ 
    rootUrl: process.env.STEEDOS_ROOT_URL,
    context: {
      rootUrl: process.env.STEEDOS_ROOT_URL,
      userId: process.env.STEEDOS_USERID || localStorage.getItem('steedos:userId'),
      tenantId: process.env.STEEDOS_TENANTID || localStorage.getItem('steedos:spaceId'),
      authToken: process.env.STEEDOS_AUTHTOKEN || localStorage.getItem('steedos:token'),
    } 
  });
}
const AmisRender = ({schema, data = {}, router = null, assetUrls = null, getModalContainer = null})=> {
  useEffect(()=>{
    const steedosAuth: any = getSteedosAuth();
    const defData = defaultsDeep({}, data , {
        data: {
            context: {
                rootUrl: getRootUrl(null),
                userId: steedosAuth.userId,
                tenantId: steedosAuth.spaceId,
                authToken: steedosAuth.token
            }
        }
    });
    console.log(`assetUrls`, assetUrls)
    registerRemoteAssets(assetUrls).then((assets)=>{
      amisRender(`#amis-root`, defaultsDeep(defData , schema), data, {getModalContainer: getModalContainer}, {router: router, assets: assets});
    })
  }, [])
  return (
  <>
    <div id="amis-root">loading...</div>
  </>
)}

const loadJS = async (src)=>{
  return await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.onload = () => {
      resolve(true);
    };
    script.src = src;
    document.body.appendChild(script);
  })
}
const loadCss = async (href)=>{
  return await new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.setAttribute('href', href);
    link.setAttribute('rel', 'stylesheet');
    document.body.appendChild(link);
    resolve(true);
  })
}


export default {
  title: 'Amis',
  decorators: [(Story)=>{
    const [isLoaded, setIsLoaded] = useState(false);
      useEffect(() => {
        Promise.all([
          loadJS('https://unpkg.com/amis/sdk/sdk.js'), 
          loadJS('https://unpkg.com/lodash/lodash.min.js'),
          loadJS('https://unpkg.com/@steedos-builder/react@0.2.30/dist/builder-react.unpkg.js'),
          loadCss('https://unpkg.com/@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css'),
          loadCss('https://unpkg.com/amis/lib/themes/antd.css'),
          loadCss('https://unpkg.com/amis/lib/helper.css'),
          loadCss('https://unpkg.com/amis/sdk/iconfont.css'),
          loadCss('https://unpkg.com/@fortawesome/fontawesome-free@6.2.0/css/all.min.css'),
        ]).then(()=>{
          setIsLoaded(true)
        }).catch((error)=>{
          console.error(error)
        })
        return () => {
          // clean up effects of script here
        };
      }, []);

      return isLoaded ? <Story /> : <div>Loading...</div>;
  }]
};

/** 以上为可复用代码 **/

export const Login = () => (
  <AmisRender schema={{
    "type": "form",
    "mode": "horizontal",
    "api": "/accounts/password/login",
    "body": [
      {
        "label": "Username",
        "type": "input-text",
        "name": "username",
      },
      {
        "label": "Password",
        "type": "input-password",
        "name": "password",
      }
    ],
    "submitText": "Login",
    "title": "Login to Steedos"
  }}
  />
)


export const ObjectListview = () => (
  <AmisRender schema={{
    type: 'page',
    title: '列表视图',
    body: {
      "type": "steedos-object-listview",
      "objectApiName": "space_users",
      "listviewName": "all"
    },
  }}
  assetUrls={process.env.STEEDOS_EXPERIENCE_ASSETURLS}
  />
)


export const ObjectForm = () => (
  <AmisRender schema={{
    type: 'page',
    title: '表单',
    body: {
      "type": "steedos-object-form",
      "objectApiName": "organizations",
    },
  }}
  assetUrls={process.env.STEEDOS_EXPERIENCE_ASSETURLS}
  />
)

export const RecordDetailRelatedList = () => (
  <AmisRender schema={{
    type: 'page',
    title: '相关列表',
    body: {
      "type": "steedos-record-detail-related-list",
      "objectApiName": "space_users",
      "recordId": "kDrtGu7aZPwYdyFpe",
      "relatedObjectApiName": "instances"
    },
  }}
  assetUrls={process.env.STEEDOS_EXPERIENCE_ASSETURLS}
  />
)

export const RecordDetailHeader = () => (
  <AmisRender schema={{
    type: 'page',
    title: '标题面板',
    body: {
      "type": "steedos-record-detail-header",
      "objectApiName": "space_users",
      "recordId": "kDrtGu7aZPwYdyFpe"
    },
  }}
  assetUrls={process.env.STEEDOS_EXPERIENCE_ASSETURLS}
  />
)

export const AmisSpaceUsersPicker = () => (
  <AmisRender schema={{
      "type": "form",
      "mode": "horizontal",
      "body": [
        {
          "label": "Owner",
          "type": "steedos-space-users-picker",
          "name": "owner",
        }
      ],
      "title": "AmisSpaceUsersPicker"
    }}
    assetUrls={process.env.STEEDOS_EXPERIENCE_ASSETURLS}
  />
)