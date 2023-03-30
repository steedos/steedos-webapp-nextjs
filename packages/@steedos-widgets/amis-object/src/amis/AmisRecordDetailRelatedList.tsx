/*
 * @Author: baozhoutao@steedos.com
 * @Date: 2022-09-01 14:44:57
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-30 16:45:14
 * @Description: 
 */
import { getRecordDetailRelatedListSchema } from '@steedos-widgets/amis-lib'


export const AmisRecordDetailRelatedList = async (props) => {
  // console.log(`AmisRecordDetailRelatedList props==>`, props)
  const { objectApiName, recordId, relatedObjectApiName, data, relatedKey, top, perPage, hiddenEmptyTable, appId, relatedLabel, className = '', columns, sort, filters, visible_on } = props;
  let formFactor = props.formFactor;
  if(!formFactor){
    formFactor = window.innerWidth < 768 ? 'SMALL' : 'LARGE';
  }
  if(!objectApiName || !relatedObjectApiName || !recordId){
    return {
      "type": "alert",
      "body": "缺少父级对象、父级记录或相关列表对象属性",
      "level": "warning",
      "showIcon": true,
      "className": "mb-3"
    }
  }
  const schema = (await getRecordDetailRelatedListSchema(objectApiName, recordId, relatedObjectApiName, relatedKey, {top, perPage, hiddenEmptyTable, appId, relatedLabel, className, formFactor, columns, sort, filters, visible_on, isRelated: true})).amisSchema;
  return schema
}