/*
 * @Author: baozhoutao@steedos.com
 * @Date: 2025-01-22 12:51:08
 * @LastEditors: baozhoutao@steedos.com
 * @LastEditTime: 2025-01-22 16:47:31
 * @Description: 
 */

export const AmisRender = function ({schema = {}, data = {}, env = {}}) {
  const Builder = (window as any).Builder; // or use a more specific type
  const BuilderComponent = (window as any).BuilderComponent

  const mergedData = {
    ...Builder.settings,
    ...data,
  }
  const mergedEnv = {
    assetUrls: Builder.settings.assetUrls,
    unpkgUrl: 'https://unpkg.steedos.cn',
    ...env,
  }

  const assetUrls = mergedEnv.assetUrls || []
  const content = {
    data: {
      blocks: [
        {
          "@type": "@builder.io/sdk:Element",
          "@version": 2,
          layerName: "Page",
          id: `builder-assets`,
          component: {
            name: "Core:AssetsLoader",
            options: {
              urls: assetUrls,
              unpkgUrl: 'https://unpkg.steedos.cn'
            },
          },
          children: [
            {
              id: `builder-amis`,
              "@type": "@builder.io/sdk:Element",
              "@version": 2,
              component: {
                name: "Core:Amis",
                options: {
                  schema: schema,
                  data: mergedData,
                  env: mergedEnv,
                },
              },
              responsiveStyles: {
                large: {
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  flexShrink: "0",
                  boxSizing: "border-box",
                  width: "100%",
                },
              },
            },
          ],
          responsiveStyles: {
            large: {
              display: "flex" ,
              flexDirection: "column",
              position: "relative",
              flexShrink: "0",
              boxSizing: "border-box",
              width: "100%",
            },
          },
        },
      ],
    },
  };

  return <BuilderComponent model="pages" content={content} data={data}/>
}
