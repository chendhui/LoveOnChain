import "allocator/arena";
import { Contract } from "ultrain-ts-lib/src/contract";
import { Log } from "ultrain-ts-lib/src/log";
import { NAME, Account } from "ultrain-ts-lib/src/account";
import { Action } from "ultrain-ts-lib/src/action";
import { Return, ReturnArray} from "ultrain-ts-lib/src/return";
import { intToString } from "ultrain-ts-lib/src/utils";

// 记录用户相关信息
class User implements Serializable {
  // @primaryid
  u_id: string;
  name: string;
  age: u32;
  sex: string;
  passwd: string;
  lover_name: string;
  asset: u32;

  constructor(_id: u64 = 0, _name: string = "unknown") {
    // do something
  }

  // 重写primaryKey()方法，返回user的id
  primaryKey(): u64 {
    return NAME(this.u_id);
  }

  prints(): void {
    Log.s("user id = ").s(this.u_id).s(", name = ").s(this.name).flush();
  }
}

// 记录用户的好友信息
class Friends implements Serializable {
  // @primaryid
  u_id: string;
  friends: string[];

  // 重写primaryKey()方法，返回user的id
  primaryKey(): u64 {
    return NAME(this.u_id);
  }

  prints(): void {
    Log.s("user id = ").s(this.u_id).s(", friends = ").s(this.friends.toString()).flush();
  }
}

// 记录所有用户的日记本，一条记录是一个日记本，里面包含多条日记
class Notebook implements Serializable {
  // @primaryid
  nb_id: string;
  nb_name: string;
  desc: string;
  owner: string[];
  // 是否分享整个笔记本
  isPrivate: boolean;

  // 重写primaryKey()方法，返回notebook的id
  primaryKey(): u64 {
    return NAME(this.nb_id);
  }

  prints(): void {
    Log.s("Notebook id = ").s(this.nb_id).s(", name = ").s(this.nb_name).flush();
  }
}

// 一条日记中包含：作者、日期、文本、图片
class Record implements Serializable {
  // 用户id 和 笔记本id
  // u_id: string;
  nb_id: string;
  writer: string[];
  date_time: string[];
  text: string[];
  // pics: string[];

  // 重写primaryKey()方法，返回notebook的id
  primaryKey(): u64 {
    return NAME(this.nb_id);
  }
}

// 一条记录表示一个用户包含的所有笔记本
class R1u1nb implements Serializable {
  //一个id表示一个笔记本
  // @primaryid
  u_id: string;
  nb_ids: string[];
  nb_names: string[];
  nb_desc: string[];
  // 是否显示给其他人
  share: boolean[];

  // 重写primaryKey()方法，返回user的id
  primaryKey(): u64 {
    return NAME(this.u_id);
  }
}


const user = "tb.user";
const notebook = "tb.notebook";
const friends = "tb.friends"
const record = "tb.record"
const r1u1nb = "tb.r1u1nb"

@database(User, "tb.user")
@database(Friends, "tb.friends")
@database(Notebook, "tb.notebook")
@database(Record, "tb.record")
@database(R1u1nb, "tb.r1u1nb")


class LoveOnChain extends Contract {

  user_db: DBManager<User>;
  notebook_db: DBManager<Notebook>;
  friends_db: DBManager<Friends>;
  record_db: DBManager<Record>;
  r1u1nb_db: DBManager<R1u1nb>;

  constructor(code: u64) {
    super(code);
    this.user_db = new DBManager<User>(NAME(user), NAME(user));
    this.notebook_db = new DBManager<Notebook>(NAME(notebook), NAME(notebook));
    this.friends_db = new DBManager<Friends>(NAME(friends), NAME(friends));
    this.record_db = new DBManager<Record>(NAME(record), NAME(record));
    this.r1u1nb_db = new DBManager<R1u1nb>(NAME(r1u1nb), NAME(r1u1nb));
  }


  // 用户注册
  @action
  register(u_id: string, name: string, age: u32, sex: string, passwd: string, lover_name: string, asset: u32): void {
    let new_user = new User();
    new_user.u_id = u_id;
    new_user.name = name;
    new_user.age = age;
    new_user.sex = sex;
    new_user.passwd = passwd;
    new_user.lover_name = lover_name;
    new_user.asset = asset;

    let existing = this.user_db.exists(NAME(u_id));
    ultrain_assert(!existing, "this user has existed in db yet.");
    this.user_db.emplace(new_user);
    Return("ok");
  }

  // 用户登陆：根据用户名验证密码
  @action
  login(u_id: string, passwd: string): void {
    let u = new User();
    this.user_db.get(NAME(u_id), u);

    if(u.passwd == passwd){
      Return("1");
    };
    if(u.passwd != passwd){
      Return("0");
    };
  }

  // 获取自己信息,包括基本信息，笔记本，好友
  @action
  get_my_account_info(u_id: string): void {
    let u = new User();
    this.user_db.get(NAME(u_id), u);

    let friend = new Friends();
    this.friends_db.get(NAME(u_id), friend);

    let relation = new R1u1nb();
    this.r1u1nb_db.get(NAME(u_id), relation);

    ReturnArray<string>([u.name, u.sex]);
    ReturnArray<string>([friend.friends.join('||')]);
    ReturnArray<string>([relation.nb_ids.join('||')]);
    ReturnArray<string>([relation.nb_names.join('||')]);
    ReturnArray<string>([relation.nb_desc.join('||')]);
    ReturnArray<string>([relation.share.join('||')]);
    // ReturnArray<string>(["notebook ids:"+relation.nb_ids.toString(), "notebook names:"+relation.nb_names.toString(), "notebook desc:"+relation.nb_desc.toString(), "share:"+relation.share.toString()]);
    // ReturnArray<string>([relation.nb_ids.join('||'), relation.nb_names.join('||'), relation.nb_desc.join('||'), relation.share.join('||')]);
    // return u + friend + relation;
  }

  // 获取某个用户信息,包括基本信息，笔记本，好友(考虑权限问题)
  @action
  get_account_info(u_id: string): void {

    let u = new User();
    this.user_db.get(NAME(u_id), u);

    let friend = new Friends();
    this.friends_db.get(NAME(u_id), friend);

    let relation = new R1u1nb();
    this.r1u1nb_db.get(NAME(u_id), relation);
    ReturnArray<string>([u.name, u.sex]);
    ReturnArray<string>([friend.friends.join('||')]);
    ReturnArray<string>([relation.nb_ids.join('||')]);
    ReturnArray<string>([relation.nb_names.join('||')]);
    ReturnArray<string>([relation.nb_desc.join('||')]);
    ReturnArray<string>([relation.share.join('||')]);
    // ReturnArray<string>(["notebook ids:"+relation.nb_ids.toString(), "notebook names:"+relation.nb_names.toString(), "notebook desc:"+relation.nb_desc.toString(), "share:"+relation.share.toString()]);
    // ReturnArray<string>([relation.nb_ids.join('||'), relation.nb_names.join('||'), relation.nb_desc.join('||'), relation.share.join('||')]);
    // return u + friend + relation;
  }

  // 用户修改个人信息
  @action
  modifyUserInfo(name: string, passwd: string): void {
    let u = new User();
    let existing = this.user_db.get(NAME(name), u);
    ultrain_assert(existing, "the person does not exist.");

    u.passwd   = passwd;

    this.user_db.modify(u);
    Return("ok");
  }

  // 添加好友
  @action
  addFriends(u_id: string, new_friend: string): void {
    // 先判断是否有好友
    let friend = new Friends();
    let existing = this.friends_db.exists(NAME(u_id));
    if(existing){
      this.friends_db.get(NAME(u_id), friend);
      friend.friends.push(new_friend);
      this.friends_db.modify(friend);
    }else{
      friend.u_id = u_id;
      
      friend.friends = [new_friend];
      this.friends_db.emplace(friend);
    }
    // 给对方账号也添加上好友
    let friend1 = new Friends();
    existing = this.friends_db.exists(NAME(new_friend));
    if(existing){
      this.friends_db.get(NAME(new_friend), friend1);
      friend1.friends.push(u_id);
      this.friends_db.modify(friend1);
    }else{
      friend1.u_id = new_friend;
      
      friend1.friends = [u_id];
      this.friends_db.emplace(friend1);
    }
    Return("ok");
  }

  // 获取好友列表
  @action
  getFriends(u_id: string): void {
    // 读取 Friend 表
    let friend = new Friends();
    this.friends_db.get(NAME(u_id), friend);
    friend.prints();
    // ReturnArray<string>(["friends:"+friend.friends.toString()]);
    ReturnArray<string>([friend.friends.join('||')])
  }

  // 创建日记本
  @action
  createNotebook(nb_id: string, nb_name: string, desc: string, owner: string[], isPrivate: boolean): void {
    // 写 Notebook 表，如果多个用户包含该日记本的写权限，则将日记本 信息 添加到所有用户的记录中（关系表）
    let notebook = new Notebook();
    let existing = this.notebook_db.exists(NAME(nb_id));
    if(existing){
      Return("Please change a notebook id.");
    }else{
      notebook.nb_id = nb_id;
      notebook.nb_name = nb_name;
      notebook.desc = desc;
      notebook.owner = owner;
      notebook.isPrivate = isPrivate;
      this.notebook_db.emplace(notebook);
    }
    // 写关系表
    for (var i = 0; i < owner.length; i++){
      let relation = new R1u1nb();
      let existing = this.r1u1nb_db.exists(NAME(owner[i]));
      if(existing){
        this.r1u1nb_db.get(NAME(owner[i]), relation);
        relation.nb_ids.push(nb_id);
        relation.nb_names.push(nb_name);
        relation.nb_desc.push(desc);
        relation.share.push(true);
        this.r1u1nb_db.modify(relation);
      }else{
        relation.u_id = owner[i];
        relation.nb_ids = [nb_id];
        relation.nb_names = [nb_name];
        relation.nb_desc = [desc];
        relation.share = [true];
        this.r1u1nb_db.emplace(relation);
      }
    }
    Return("ok"); 
  }

  // 创建一条日记
  @action
  createRecord(nb_id: string, writer: string, date_time: string, text: string): void {
    // 先判断是否有记录
    let record = new Record();
    let existing = this.record_db.exists(NAME(nb_id));
    if(existing){
      this.record_db.get(NAME(nb_id), record);
      record.writer.push(writer);
      record.date_time.push(date_time);
      record.text.push(text);
      this.record_db.modify(record);
    }else{
      record.nb_id = nb_id;
      record.writer = [writer];
      record.date_time = [date_time];
      record.text = [text];
      this.record_db.emplace(record);
    }
    Return("ok");
  }

  // 获取用户的所有日记本信息
  @action
  getNotebook(u_id: string): void {
    // 读取 Relation_u_d 表中指定 user 的记录
    let relation = new R1u1nb();
    this.r1u1nb_db.get(NAME(u_id), relation);
    // ReturnArray<string>(["notebook ids:"+relation.nb_ids.toString(), "notebook names:"+relation.nb_names.toString(), "notebook desc:"+relation.nb_desc.toString(), "share:"+relation.share.toString()]);
    ReturnArray<string>([relation.nb_ids.join('||')]);
    ReturnArray<string>([relation.nb_names.join('||')]);
    ReturnArray<string>([relation.nb_desc.join('||')]);
    ReturnArray<string>([relation.share.join('||')]);
    
  }

  // 获取某个日记本中所有日记
  @action
  getRecords(nb_id: string): void {
    // 读取 record 表中指定 id 的记录
    let record = new Record();
    this.record_db.get(NAME(nb_id), record);
    // ReturnArray<string>(["writers:"+record.writer.toString(), "date_time:"+record.date_time.toString(), "text:"+record.text.toString()]);
    ReturnArray<string>([record.writer.join('||')]);
    ReturnArray<string>([record.date_time.join('||')]);
    ReturnArray<string>([record.text.join('||')]);
  }

  @action
  pubkeyOf(account: account_name): void {
    let key = Account.publicKeyOf(account, 'wif');
    Log.s("public key with WIF is : " ).s(key).flush();
    key = Account.publicKeyOf(account, 'hex');
    Log.s("public key with HEX is : " ).s(key).flush();

  }
}
