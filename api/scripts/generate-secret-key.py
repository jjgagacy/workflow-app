import secrets
import base64

key = secrets.token_bytes(48)

# 使用 URL 安全的 Base64 编码
encoded_key = base64.b64encode(key).rstrip(b'=').decode('utf-8')
print(f"Generated Secret Key: {encoded_key}")
