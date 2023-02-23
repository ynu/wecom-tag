import assert from 'assert';
import cache from 'memory-cache';
import { addTagUsers, get, create, del, delUsersFromTag, usersFromTag } from '../index.mjs';

const { CORP_ID, SECRET, TEST_DEPT_ID, TEST_USER_ID } = process.env;
const options = {
  corpId: CORP_ID,
  secret: SECRET,
};

let tagid;
describe('wecom-user-api 测试', function () {
  after(() => cache.clear());
  this.timeout(100000);
  it('create 创建标签', async () => {
    tagid = await create('test', null, options);
    assert.ok(tagid);
  });
  it('addTagUsers 向tag中添加用户', async () => {
    const res = await addTagUsers(tagid, [TEST_USER_ID], [TEST_DEPT_ID], options);
    assert.equal(res, 0);
  });
  it('usersFromTag 获取tag中所有用户，包括部门中的所有用户', async () => {
    const res = await usersFromTag(tagid, options);
    assert.ok(res.length > 0);
  });
  it('delUsersFromTag 从tag中删除用户', async () => {
    const res = await delUsersFromTag(tagid, {
      ...options,
      userlist: [TEST_USER_ID],
      partylist: [TEST_DEPT_ID],
    });
    assert.equal(res, 0);
  });
  it('get 获取标签', async () => {
    const res = await get(tagid, options);
    assert.equal(res.tagname, 'test');
    assert.equal(res.userlist.length, 0);
    assert.equal(res.partylist.length, 0);
  });
  it('del 删除标签', async () => {
    const res = await del(tagid, options);
    assert.equal(res, 0);
  });
})