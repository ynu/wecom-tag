/**
 * 企业微信API-通讯录管理-标签管理
 * @see https://open.work.weixin.qq.com/api/doc/90000/90135/90209
 */
import axios from 'axios';
import { getToken, qyHost, WecomError } from 'wecom-common';
import { simpleList } from 'wecom-user';
import Debug from 'debug';
 const info = Debug('wecom-tag:info');
 const debug = Debug('wecom-tag:debug');
 const warn = Debug('wecom-tag:warn');
 
 const { CONTACTS_SECRET } = process.env;
 
/**
  * 增加标签成员
  * @param {Number} tagid 标签ID
  * @param {Array} userlist 用户ID列表
  * @param {Array} partylist 部门ID列表
  * @returns 错误代码
  */
export const addTagUsers = async (tagid, userlist, partylist = [], options = {}) => {
   // 由于只能由通讯录同步应用操作全局标签，此处使用通讯录同步的secret
   options.secret = options.secret || CONTACTS_SECRET;
   const token = await getToken(options);
   const res = await axios.post(`${qyHost}/tag/addtagusers?access_token=${token}`, {
    tagid,
    userlist,
    partylist,
  });
   const { errcode, errmsg } = res.data;
   if (errcode) {
    throw new WecomError(errcode, errmsg);
   }
   return errcode;
 };
 
/**
  * 创建标签
  * @param {String}} tagname 标签名称
  * @param {String}} tagid 标签id，可选
  * @see https://developer.work.weixin.qq.com/document/path/90210
  * @returns
  */
export const create = async (tagname, tagid, options = {}) => {
   // 由于只能由通讯录同步应用操作全局标签，此处使用通讯录同步的secret
   options.secret = options.secret || CONTACTS_SECRET;
   const token = await getToken(options);
   const res = await axios.post(`${qyHost}/tag/create?access_token=${token}`, {
    tagname,
    tagid,
  });
   const { errcode, errmsg } = res.data;
   if (errcode) {
    throw new WecomError(errcode, errmsg);
   }
   return res.data.tagid;
 };
 
export const get = async (tagid, options) => {
   info(`获取标签(${tagid})成员`);
   const token = await getToken(options);
   const res = await axios.get(`${qyHost}/tag/get?access_token=${token}&tagid=${tagid}`);
   const { errcode, errmsg } = res.data;
   if (errcode) {
    throw new WecomError(errcode, errmsg);
   }
   return res.data;
 }

 /**
  * 删除标签
  * @param {*} tagid 
  * @param {*} options 
  * @see https://developer.work.weixin.qq.com/document/path/90212
  * @returns 
  */
export const del = async (tagid, options) => {
  info(`删除标签(${tagid})`);
  const token = await getToken(options);
  const res = await axios.get(`${qyHost}/tag/delete?access_token=${token}&tagid=${tagid}`);
  const { errcode, errmsg } = res.data;
  if (errcode) {
   throw new WecomError(errcode, errmsg);
  }
  return errcode;
}
 
export const delUsersFromTag = async (tagid, options = {}) => {
   info(`删除标签${tagid}成员`);
   options.secret = options.secret || CONTACTS_SECRET;
   const { userlist, partylist } = options;
   const token = await getToken(options);
   const body = { tagid };
   if (userlist) body.userlist = userlist;
   if (partylist) body.partylist = partylist;
   const res = await axios.post(`${qyHost}/tag/deltagusers?access_token=${token}`, body);
   const { errcode, errmsg } = res.data;
   if (errcode) {
    throw new WecomError(errcode, errmsg);
   }
   return errcode;
 }
 
 
export const usersFromTag = async (tagid, options) => {
  info(`获取标签内的所有用户，部门则递归获取部门内的所有用户`);
 
  let users = [];
  const tag = await get(tagid, options);
  users = tag.userlist;
  for (let i = 0; i < tag.partylist.length; i++) {
    const party = tag.partylist[i];
    const ul = await simpleList(party, {
      ...options,
      fetchChild: true,
    });
    for (let j = 0; j < ul.length; j++) {
      if (!users.find(u => u.userid === ul[j].userid)) {
        users.push({
          userid: ul[j].userid,
          name: ul[j].name,
        });
      }
    }
  }
  return users;
}

 
export default {
  addTagUsers,
  create,
  get,
  del,
  delUsersFromTag,
  usersFromTag,
};
 