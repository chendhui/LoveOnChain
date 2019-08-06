from flask import Flask, send_from_directory, make_response
from flask import request
from Configs import *
import json
import Database as d
import Token as t

def record_exception(e:Exception):
    print("Exception: " + str(e) + "\n==========")
    traceback.print_exc()


def smsg(msg:str="ok", data:dict=None):
    return {"msg":msg, "data": data}

import traceback


"""
    返回值被包装在 smsg中，其中
    smsg["msg"]表示服务器信息，如果smsg["msg"]=='ok'
    则可以访问smsg["data"]得到内容数据
    （一般是数据库信息dbmsg）
"""
app = Flask(__name__, static_folder=html_path, static_url_path='/web')

@app.route('/hello/')
def hello_world():
    return 'Hello World!'


@app.route('/api/login/', methods=["POST"])
def login():
    try:
        rid, key_md5 = request.json.get("id"), request.json.get("key_md5")
        res = d.login(rid, key_md5)
        if res["dbmsg"] != "ok":
            return make_response(  json.dumps(smsg(data=res)))
        else:
            res["data"] = t.generate_token(res["data"])
        resp = make_response(json.dumps(smsg(data=res)))
        resp.set_cookie("token", res["data"])
        return resp
    except Exception as e:
        record_exception(e)
        return json.dumps(smsg("00"))


@app.route('/api/register/', methods=["POST"])
def register():
    try:
        rid = request.json.get("id")
        key_md5 = request.json.get("key_md5")
        name = request.json.get("name")
        avatar = request.json.get("avatar")
        desc = request.json.get("desc")
        res = d.user_register(rid, key_md5, name, avatar, desc)
        if res['dbmsg'] != "ok":
            return json.dumps(smsg(data=res))

        res = d.login(rid, key_md5)
        if res["dbmsg"] != "ok":
            return make_response(json.dumps(serverMsg(data=res)))
        else:
            res["data"] = t.generate_token(res["data"])
        resp = make_response(json.dumps(smsg(data=res)))
        resp.set_cookie("token", res["data"])
        return resp
    except Exception as e:
        record_exception(e)
        return json.dumps(smsg("00"))


@app.route('/api/account', methods=["GET"])
def get_acount_info():
    token = request.cookies.get("token")
    # Cookie中没有Token
    if token is None:
        return json.dumps(smsg("04"))
    info = t.decode_token(token)
    if "err_msg" in info:
        # Token过期
        if info["err_msg"][0:2] == "se":
            return json.dumps(smsg("02"))
        # Token无效
        else:
            return json.dumps(smsg("03"))
    uid = info["uid"]
    account_info = d.get_account_info(uid)
    return json.dumps(smsg(data=account_info))


@app.route('/api/myAccount/', methods=["GET"])
def get_my_account_info():
    token = request.cookies.get("token")
    # Cookie中没有Token
    if token is None:
        return json.dumps(smsg("04"))
    info = t.decode_token(token)
    if "err_msg" in info:
        # Token过期
        if info["err_msg"][0:2] == "se":
            return json.dumps(smsg("02"))
        # Token无效
        else:
            return json.dumps(smsg("03"))
    uid = info["uid"]
    account_info = d.get_my_account_info(uid)
    return json.dumps(smsg(data=account_info))


@app.route('/api/myFriends/', methods=["GET"])
def get_my_friends():
    """
    获取当前账户的好友列表

    :return: 当前账户的好友列表
    """
    token = request.cookies.get("token")
    # Cookie中没有Token
    if token is None:
        return json.dumps(smsg("04"))
    info = t.decode_token(token)
    if "err_msg" in info:
        # Token过期
        if info["err_msg"][0:2] == "se":
            return json.dumps(smsg("02"))
        # Token无效
        else:
            return json.dumps(smsg("03"))
    uid = info["uid"]
    friend_list = d.get_friend_list(uid)
    return json.dumps(smsg(data=friend_list))


@app.route('/api/createNotebook/', methods=["POST"])
def create_notebook():
    token = request.cookies.get("token")
    # Cookie中没有Token
    if token is None:
        return json.dumps(smsg("04"))
    info = t.decode_token(token)
    if "err_msg" in info:
        # Token过期
        if info["err_msg"][0:2] == "se":
            return json.dumps(smsg("02"))
        # Token无效
        else:
            return json.dumps(smsg("03"))
    uid = info["uid"]
    rid = request.json.get("id")
    name = request.json.get("name")
    desc = request.json.get("desc")
    write_list = request.json.get("writers_list")
    public = request.json.get("public")
    # Should check some constraints maybe
    res = d.create_notebook(rid, name, uid, desc, write_list, public)
    return json.dumps(smsg(data=res))


@app.route('/api/notebook', methods=["GET"])
def notebook():
    """
    获取笔记本信息，GET参数为
    id: 笔记本的rid

    :return: 笔记本基本信息
    """
    rid = request.args.get("id", type=str)
    if rid is None:
        return json.dumps(smsg("01"))
    notebook_info = d.get_notebook_info(rid)
    if notebook_info['dbmsg']!= "ok":
        return json.dumps(smsg(data=notebook_info))
    token = request.cookies.get("token")
    uid = None
    if token is not None:
        info = t.decode_token(token)
        if "err_msg" not in info:
            uid = info['uid']
    nid = notebook_info['data']['id'][0]
    notebook_contents = d.get_notebook_contents(nid, 0, SP.default_notebook_len, uid)
    return json.dumps(smsg(data={"info": notebook_info,
                                 "preview": notebook_contents}))


@app.route('/api/content', methods=["GET"])
def content():
    nid = request.args.get("nid", type=int)
    start = request.args.get("start", type=int)
    end = request.args.get("end", type=int)

    uid = None
    token = request.cookies.get("token")
    if token and "err_msg" not in t.decode_token(token):
        info = t.decode_token(token)
        uid = info["uid"]
    # 参数完整性
    if nid and start and end is None:
        return json.dumps(smsg("01"))
    res = d.get_notebook_contents(nid, start, end, uid)
    return json.dumps(smsg(data=res))


@app.route('/api/write/', methods=["POST"])
def write_content():
    token = request.cookies.get("token")
    # Cookie中没有Token
    if token is None:
        return json.dumps(smsg("04"))
    info = t.decode_token(token)
    if "err_msg" in info:
        # Token过期
        if info["err_msg"][0:2] == "se":
            return json.dumps(smsg("02"))
        # Token无效
        else:
            return json.dumps(smsg("03"))
    uid = info["uid"]
    nid = request.json.get("nid")
    content = request.json.get("content")
    imgs = request.json.get("imgs")
    ref = request.json.get("ref")
    res = d.write_notebook_content(uid, nid, content, imgs, ref)
    return json.dumps(smsg(data=res))


@app.route("/api/befriend", methods=["GET"])
def friend():
    """
    对好友（或好友请求）进行操作
    GET参数：
    u2: 被操作的用户
    act: 1 发起申请 2 同意 3 拒绝 4 删除
    :return: 操作信息，ok表示操作成功
    """
    token = request.cookies.get("token")
    # Cookie中没有Token
    if token is None:
        return json.dumps(smsg("04"))
    info = t.decode_token(token)
    if "err_msg" in info:
        # Token过期
        if info["err_msg"][0:2] == "se":
            return json.dumps(smsg("02"))
        # Token无效
        else:
            return json.dumps(smsg("03"))
    uid = info["uid"]
    uid2 = request.args.get('u2', type=str)
    res = d.get_simple_account_info(uid2)
    if res['dbmsg'] != 'ok':
        return json.dumps(smsg(data=res))
    uid2 = res['data']['id'][0]
    act = request.args.get('act', type=int)
    res = d.make_friend(uid, uid2, act)
    return json.dumps(smsg(data=res))

@app.route("/api/myFriendApplications", methods=["GET"])
def my_friend_applications():
    """
    GET方法获取用户发送的好友请求

    :return: 好友请求列表
    """
    token = request.cookies.get("token")
    # Cookie中没有Token
    if token is None:
        return json.dumps(smsg("04"))
    info = t.decode_token(token)
    if "err_msg" in info:
        # Token过期
        if info["err_msg"][0:2] == "se":
            return json.dumps(smsg("02"))
        # Token无效
        else:
            return json.dumps(smsg("03"))
    uid = info['uid']
    res = d.get_my_friend_applications(uid)
    return json.dumps(smsg(data=res))

@app.route("/api/friendRequests", methods=["GET"])
def friend_requests():
    """
    GET方法获取用户接收的好友请求

    :return: 好友请求列表
    """
    token = request.cookies.get("token")
    # Cookie中没有Token
    if token is None:
        return json.dumps(smsg("04"))
    info = t.decode_token(token)
    if "err_msg" in info:
        # Token过期
        if info["err_msg"][0:2] == "se":
            return json.dumps(smsg("02"))
        # Token无效
        else:
            return json.dumps(smsg("03"))
    uid = info['uid']
    res = d.get_my_friend_requests(uid)
    return json.dumps(smsg(data=res))


@app.route("/api/notebookRequests", methods=["GET"])
def notebook_requests():
    """
    获取其他用户对该用户发起的笔记本请求

    :return:
    """
    token = request.cookies.get("token")
    if token is None:
        return json.dumps(smsg("04"))
    info = t.decode_token(token)
    if "err_msg" in info:
        # Token过期
        if info["err_msg"][0:2] == "se":
            return json.dumps(smsg("02"))
        # Token无效
        else:
            return json.dumps(smsg("03"))
    uid = info['uid']
    res = d.get_my_unauthed_notebooks(uid)
    return json.dumps(smsg(data=res))


@app.route("/api/myNotebookProposals", methods=["GET"])
def my_notebook_requests():
    token = request.cookies.get("token")
    if token is None:
        return json.dumps(smsg("04"))
    info = t.decode_token(token)
    if "err_msg" in info:
        # Token过期
        if info["err_msg"][0:2] == "se":
            return json.dumps(smsg("02"))
        # Token无效
        else:
            return json.dumps(smsg("03"))
    uid = info['uid']
    res = d.get_my_notebook_requests(uid)
    return json.dumps(smsg(data=res))

@app.route('/api/notebookAuth', methods=["GET"])
def auth_notebook():
    token = request.cookies.get("token")
    if token is None:
        return json.dumps(smsg("04"))
    info = t.decode_token(token)
    if "err_msg" in info:
        # Token过期
        if info["err_msg"][0:2] == "se":
            return json.dumps(smsg("02"))
        # Token无效
        else:
            return json.dumps(smsg("03"))
    uid = info['uid']
    nid = request.args.get("nid", type=int)
    act = request.args.get("act", type=int)
    res = d.auth_notebook(uid, nid, act)
    return json.dumps(smsg(data=res))


@app.route('/api/rewardContent', methods=["GET"])
def reward_content():
    """
    v  表示奖赏类型
    1 赞同
    2 反对
    3 打赏
    4 取消（取消赞同 或 反对）
    :return:
    """
    token = request.cookies.get("token")
    if token is None:
        return json.dumps(smsg("04"))
    info = t.decode_token(token)
    if "err_msg" in info:
        # Token过期
        if info["err_msg"][0:2] == "se":
            return json.dumps(smsg("02"))
        # Token无效
        else:
            return json.dumps(smsg("03"))
    cid = request.args.get("cid", type=str)
    vtype = request.args.get("v", type=int)
    amount = request.args.get("amount", type=int)
    res = d.vote_content(cid, info["uid"], vtype, amount)
    return json.dumps(smsg(data=res))


@app.route("/api/recentNotebooks", methods=["GET"])
def recent_notebooks():
    start = request.args.get("start", type=int)
    end = request.args.get("end", type=int)
    res = d.get_top_notebooks(start, end)
    return json.dumps(smsg(data=res))


@app.route("/api/userPoints", methods=["GET"])
def user_points():
    uid = request.args.get("uid", type=int)
    res = d.get_user_points(uid)
    return json.dumps(smsg(data=res))
'''
@app.route('/web/<p>', methods=["GET"])
def web(p):
    return send_from_directory(html_path, p)
'''



if __name__ == '__main__':
    app.run("127.0.0.1", port=80, debug=True)
