// const U3Utils = require('u3-utils/src')
// const {createU3, format, listener} = require('u3.js')
// const config = require('../config')

let u3 = U3.createU3({
  httpEndpoint: 'http://pioneer.natapp1.cc',
  httpEndpoint_history: 'http://pioneer-history.natapp1.cc',
  broadcast: true,
  debug: false,
  sign: true,
  logger: {
      log: console.log,
      error: console.error,
      debug: console.log
  },
  chainId:'20c35b993c10b5ea1007014857bb2b8832fb8ae22e9dcfdc61dacf336af4450f',
  keyProvider:'5J86vjJ7BrMENTmfghjdmWfZ9PDWCioQUmnMtu9Y9gmvGhpuDVz',//chendh1's private key
  symbol: 'UGAS'
});

// let call_contract = 
// {
async function test() {
  console.log("print results!");
  let contract = await u3.contract("chendh1");
  // 获取某个用户的好友 results = "user id = u1, friends = u2,u3"
  // let result = await contract.getFriends("u1", { authorization: [`chendh1@active`] });
  // console.log(result["processed"]["action_traces"][0]["return_value"]);

  // 创建笔记本
  let tx = contract.createNotebook("nb2", "nb2", "First notebook", ["u1","u2","u3"], 1, { authorization: [`chendh1@active`] });
  console.log(tx)
  };
// await contract.login(id, key_md5, { authorization: [`chendh1@active`] });
// test();

async function login_call(id, key_md5) {

  let contract = await u3.contract("chendh1");
  
  let result = await contract.login(id, key_md5, { authorization: [`chendh1@active`] });
  
  return result["processed"]["action_traces"][0]["return_value"]
  };

async function register_call(id, key_md5, name, avatar, sex, lover_id, desc) {

  let contract = await u3.contract("chendh1");
  
  let result = await contract.register(id, name, "20", sex, key_md5, lover_id, { authorization: [`chendh1@active`] });
  
  return result 
  };

/**** 
{ user_id: 唯一用户名
     * name: 姓名
     * avatar: 头像路径
     * notebooks 拥有的笔记本: [{ notebook_id 笔记本唯一ID, name 笔记本名称, creator 创建者, desc 笔记本描述,  writers: [] 笔记本写权限拥有者(id的数组，如果为空数组则是公开笔记本), public 笔记本是否在主页上公开},]
     * }  
     */
async function get_my_account_info_call(user_id, next) {

  let contract = await u3.contract("chendh1");
  
  let result = await contract.get_my_account_info(user_id, { authorization: [`chendh1@active`] });
  
  var res = result["processed"]["action_traces"][0]["return_value"]

  var res = res.substring(1,res.length-1)
  console.log(res)
  var res_array = res.split("][")
  var user_info = res_array[0].split(",")
  var name = user_info[0]
  var sex = user_info[1]
  var friends = new Array()
  if(sex == "1")
    var avatar = "res/imgs/img1.jpg"
  else
    var avatar = "res/imgs/img2.jpg"
  if(res_array.length==1){
    var res_json = {"user_id": user_id, "name": name, "avatar": avatar, "friends": [], "notebooks": []}
  }

  if(res_array.length==2){
    var friends = res_array[1].split("||")
    
    var res_json = {"user_id": user_id, "name": name, "sex": sex, "avatar": avatar, "friends": friends, "notebooks": []}
  }
  if(res_array.length==5){
    var ids = res_array[1].split("||")
    var names = res_array[2].split("||")
    var descs = res_array[3].split("||")
    var share = res_array[4].split("||")
    var notebooks = new Array()
    for(var i = 0; i < ids.length; i++){
      notebooks.push({"notebook_id": ids[i], "name": names[i], "desc": descs[i], "public": share[i]})
    }
    var res_json = {"user_id": user_id, "name": name, "avatar": avatar, "friends": [], "notebooks": notebooks}
  }
  
  if(res_array.length==6){
    var friends_names = res_array[1].split("||")
    for(var i = 0; i < friends_names.length; i++){
      friends.push({"avatar": "res/imgs/img1.jpg", "name": friends_names[i]})
    }
    var ids = res_array[2].split("||")
    var names = res_array[3].split("||")
    var descs = res_array[4].split("||")
    var share = res_array[5].split("||")
    var notebooks = new Array()
    for(var i = 0; i < ids.length; i++){
      // notebooks.push({"id": ids[i], "name": names[i], "desc": descs[i], "public": share[i]})
      notebooks.push({"id": ids[i], "name": names[i], "desc": descs[i]})
    }
    var res_json = {"user_id": user_id, "name": name, "avatar": avatar, "friends": friends, "notebooks": notebooks}
  }
  // console.log(res_json)
  var res_json = {"name": name, "avatar": avatar, "friends": friends, "notebooks": notebooks}
  next.then(res_json)
  // return res_json 
  };

async function createNotebook_call(id, notebook_auth, name, desc) {

  let contract = await u3.contract("chendh1");
  
  let result = await contract.createNotebook(id, name, desc, notebook_auth, { authorization: [`chendh1@active`] });
  
  return result 
  };

async function getNotebook_call(notebook_id, next) {

  let contract = await u3.contract("chendh1");
  
  let result = await contract.getRecords(notebook_id, { authorization: [`chendh1@active`] });
  var res = result["processed"]["action_traces"][0]["return_value"]
  var res = res.substring(1,res.length-1)
  var res_array = res.split("][")
  writers = res_array[0].split("||")
  date_time = res_array[1].split("||")
  texts = res_array[2].split("||")
  var records = new Array()
  var authors = new Array()
  for(var i = 0; i < writers.length; i++){
    author = {"name": writers[i], "avatar": "res/imgs/img1.jpg"}
    records.push({"author": author, "date": date_time[i], "text": texts[i]})
    authors.push(author)
  }
  var res_json = {"contents": records, "authors": authors}
  console.log(res_json)
  next.then(res_json)
  };

async function getFriends_call(user_id) {

  let contract = await u3.contract("chendh1");
  
  let result = await contract.getFriends(user_id, { authorization: [`chendh1@active`] });
  var res = result["processed"]["action_traces"][0]["return_value"]
  var res = res.substring(1,-1)
  var friends = res.split("||")
  return friends
  };

async function createRecord_call(notebook_id, writer_id, content) {

  let contract = await u3.contract("chendh1");
  var myDate = new Date();
  var date_time = myDate.toLocaleString(); 
  let result = await contract.createRecord(notebook_id, writer_id, date_time, content, { authorization: [`chendh1@active`] });
  return result
  };

async function addFriends_call(my_id, user_id) {

  let contract = await u3.contract("chendh1");
  let result = await contract.addFriends(my_id, user_id, { authorization: [`chendh1@active`] });
  return result
  };

// }