/*
 * @Author: 殷亮辉 yinlianghui@hotoa.com
 * @Date: 2025-01-02 15:39:40
 * @LastEditors: 殷亮辉 yinlianghui@hotoa.com
 * @LastEditTime: 2025-01-07 11:14:35
 */
// import { getMeta, getColumnDef, getGridOptions, getTableHeader } from '../tables';
import { getColumnDef, getDataTypeDefinitions } from '../AirtableGrid/gridOptions';
import { getDataSource } from './dataSource';
import { getTableAdminEvents } from './fieldsAdmin';

async function getMeta(tableId: string, baseId: string = 'default', baseUrl: string = '') {
    if (!tableId) {
        return;
    }
    const tablesApi = `${baseUrl}/api/v6/tables`;
    const metaApi = `${tablesApi}/meta/bases/${baseId}/tables`;
    try {
        const response = await fetch(`${metaApi}/${tableId}`, {
            credentials: 'include',
            // "headers": {
            //     'Content-Type': 'application/json',
            //     "Authorization": "Bearer ${context.tenantId},${context.authToken}" //TODO context中没取到数据
            // }
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`getUISchema`, tableId, error);
    }
}


export async function getTablesGridSchema(
    tableId: string,
    baseId: string,
    mode: string, //edit/read/admin
    { env, data }
) {
    const baseUrl = data.rootUrl;// 开发环境 b6 server 需要配置 B6_PROXY_TARGET 环境变量，代理 B6_HOST 为平台 RootUrl
    const meta = await getMeta(tableId, baseId, baseUrl);
    const dataSource = getDataSource({ baseUrl, baseId, tableId });

    const getColumnDefs = async ({ dispatchEvent }) => {
        let dataTypeDefinitions = getDataTypeDefinitions();
        var columnDefs = meta.fields.map(function (field: any) {
            return getColumnDef(field, dataTypeDefinitions, mode, { dispatchEvent, env });
        });
        return columnDefs;
    }

    let tableAdminEvents = {};
    const isAdmin = mode === "admin";
    if (isAdmin) {
        tableAdminEvents = getTableAdminEvents(tableId);
    }

    const amisSchema = {
        "type": "service",
        "id": `service_tables_grid_${tableId}`,
        "name": "page",
        "className": "steedos-tables-grid h-full",
        "body": [
            {
                "type": "steedos-airtable-grid",
                "className": "h-full",
                "title": meta.label,
                "mode": mode,
                "getColumnDefs": getColumnDefs,
                "dataSource": dataSource,
                tableId
            }
        ],
        "onEvent": {
            ...tableAdminEvents
        }
    };
    return {
        meta,
        amisSchema,
    };
}