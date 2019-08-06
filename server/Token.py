import time
import hmac
import base64
from itsdangerous import TimedJSONWebSignatureSerializer, BadSignature, SignatureExpired

from Configs import *

secret_key = "zzzfff"
token_expiration_time = 3600


'''
    These two methods use 'itsdangerous' to generate and decode tokens
    Once a user login, server will get the user's openid from weixin's api
    But we should not directly send the openid back to user's phone, instead, using a token
    The token using server's private key to encrypt the user's openid, along with some other informations
    like expiration date
    So after user's phone got the token, it's following requests will send the token,
    and then server decodes the token, get the user's open id,
    so the server knows which user send this request
    And after expiration-time, the token will be useless
    User must resend the "getting token" request
'''


def generate_token(info: dict):
    tokener = TimedJSONWebSignatureSerializer(secret_key, token_expiration_time)
    return tokener.dumps(info).decode("utf-8")


def decode_token(token:str):
    tokener = TimedJSONWebSignatureSerializer(secret_key, token_expiration_time)
    try:
        data = tokener.loads(token)
    except SignatureExpired:
        return {"err_msg": "se:Signature expired"}
    except BadSignature:
        return {"err_msg": "bs:Bad Signature"}
    return data