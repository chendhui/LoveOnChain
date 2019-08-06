encoding = 'utf-8'

html_path = "../../web"
databaseMsgs = {
    # login
    "00": "用户名和私钥不匹配",
    # All actions
    "01": "Token已经过期，请重新登录",
    "02": "Token验证失败",
    "03": "服务器无法连接区块链节点",
    "04": "无法连接服务器，请检查网络连接",
    # register_account
    "11": "该id已经被注册",
    # get_account_info

    # 对应的data：该id
    "21": "无法找到该id对应的用户",
    # get_my_notebook_info
    "31": "无法找到该id对应的笔记本",
    "34": "该id对应的笔记本不是我的笔记本",
    # get_notebook_contents
    "41": "start、end下标不合法",
    # make_friend
    "51": "好友操作未定义",
    "52": "不能向自己发起好友申请",
    "53": "无法同意/拒绝不存在的好友申请",
    "54": "已经发送同样的好友申请",
    "55": "对方已经发起好友申请",
    "56": "对方已经是你的好友",
    "57": "对方尚未是你的好友，无法删除",
    # create_notebook
    "61": "该笔记本id已经被注册",
    "62": "无法找到该写权限用户的id",
    "63": "笔记本写权限人数超出限制",
    # write_notebook_content
    "91": "不具有对该笔记本的写权限",
    "92": "引用的楼层不存在",
    # auth_notebook
    "71": "无法找到对应的用户-笔记本记录",
    "72": "你已经接受写权限",
    "73": "你已经拒绝写权限",
    "74": "该笔记本是公开笔记本，操作无效",
    # vote_contetn
    "81": "无法找到该id对应的笔记本内容",
    # abount points
    "a1": "没有足够的积分进行该操作",
    # string length check failed
    "s0": "查询格式错误",
    "s1": "字符串长度超标",
    "s2": "笔记本写权限列表第一个应该是笔记本创建者"
}

serverMsg = {
    "00": "服务器运行出错",
    "01": "API请求参数错误",
    "02": "Token已经过期，请重新登录",
    "03": "Token无效",
    "04": "无法获取token，请重新登录，并检查浏览器Cookie设置",
}

class ServerParam:
    default_notebook_len = 20


class PointParam:
    initial_points = 100000
    create_notebook_cost = 500
    reply_notebook_cost = 50
    upvote_reward = 5


SP = ServerParam
PP = PointParam