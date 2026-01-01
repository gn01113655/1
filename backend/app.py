from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__, static_folder="../frontend", static_url_path="/")
CORS(app)  # 允許前端串接API

# mysql連線
DB_HOST = "db"
DB_USER = "owner"
DB_PASSWORD = "123456"
DB_NAME = "users"


# 連接mysql伺服器
def get_connection():
    return pymysql.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
    cursorclass=pymysql.cursors.DictCursor
    )


# 檢查token是否存在
def get_user_by_token(token):
    if not token:
        return None

    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, username, level FROM member WHERE auth_token = %s", (token,)
            )
            user = cursor.fetchone()
            return user
    finally:
        conn.close()


# 傳送表頭資訊查詢帳號的level權限
def get_current_user_from_request():
    auth_header = request.headers.get("Authorization", "")
    # 預期格式 Bearer <token>
    # Authorization:Bearer b03bdda4490cc83a39e05abc15bfd28e
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]
    else:
        token = None

    user = get_user_by_token(token)
    return user

# =============================#
@app.route("/")
def index():
    return app.send_static_file("index.html")

# =====================================================================#
# 註冊帳號密碼
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "缺少username 或 password"}), 400

    # 資料庫連線並將資料寫入
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # 檢查帳號是否已經存在
            cursor.execute(
                "SELECT id FROM member WHERE username = %s",
                (username),
            )
            exist = cursor.fetchone()
            if exist:
                return jsonify({"error": "帳號已經存在"}), 400

            # 產生密碼雜湊
            password_hash = generate_password_hash(password)

            # 新增使用者
            cursor.execute(
                "INSERT INTO member(username, password_hash) VALUES(%s, %s)",
                (username, password_hash),
            )
            conn.commit()

        return jsonify({"message": "register ok!"})
    finally:
        conn.close()


# =====================================================================#
# 確認帳號是否存在資料庫
@app.route("/api/checkuni", methods=["POST"])
def checkuni():
    data = request.get_json()
    username = data.get("username")

    if not username:
        return jsonify({"error": "必須要輸入帳號確認是否已存在!"}), 400

    # 資料庫連線 抓取該筆帳號
    conn = get_connection()

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id FROM member WHERE username = %s",
                (username),
            )
            exist = cursor.fetchone()
            if exist:
                return (
                    jsonify({"status": False, "message": "帳號已經存在, 不能使用"}),
                    200,
                )
            else:
                return jsonify({"status": True, "message": "帳號不存在, 可以使用"}), 200
    finally:
        conn.close()


# =====================================================================#
# 取得會員登入資料
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "缺少username 或 password"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, username, password_hash, level FROM member WHERE username = %s",
                (username),
            )
            user = cursor.fetchone()

            if not user:
                return (
                    jsonify({"message": "登入驗證失敗(帳號錯誤!)", "status": False}),
                    200,
                )

            # 帳號比對成功後開始確認密碼check_password_hash(編碼過的, 未編碼的)
            if not check_password_hash(user["password_hash"], password):
                return (
                    jsonify({"message": "登入驗證失敗(密碼錯誤!)", "status": False}),
                    200,
                )

            # 產生驗證碼 auth_token 並更新至資料庫
            token = secrets.token_hex(16)
            cursor.execute(
                "UPDATE member SET auth_token = %s WHERE id = %s", (token, user["id"])
            )
            conn.commit()

            return (
                jsonify(
                    {
                        "message": "登入驗證成功",
                        "username": user["username"],
                        "level": user["level"],
                        "status": True,
                        "token": token,
                    }
                ),
                200,
            )

    finally:
        conn.close()


# =====================================================================#
# 驗證token是否合法
@app.route("/api/me", methods=["GET"])
def me():
    user = get_current_user_from_request()
    if not user:
        return jsonify({"error": "未登入或token無效"}), 401
    return jsonify(
        {
            "id": user["id"],
            "username": user["username"],
            "level": user["level"],
            "status": True,
        }
    )


# =====================================================================#
# 讀取所有會員資料(必須是最高權限)
@app.route("/api/admin/users", methods=["GET"])
def admin_get_all_users():
    # 確認有沒有登入(token是否合法)
    current_user = get_current_user_from_request()

    if not current_user:
        return jsonify({"error": "未登入或token無效"}), 401
    # 確認是否為admin
    if current_user["level"] != "admin":
        return jsonify({"error": "沒有權限, 只有admin可以使用這個功能(API)"}), 403

    # 列出所有的會員資料
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, username, level, city, edu, created_at FROM member ORDER BY id"
            )
            users = cursor.fetchall()

            # 回傳所有的會員資料
            return jsonify({"message": "資料讀取成功", "users": users})
    finally:
        conn.close()


# =====================================================================#
# 取得會員等級統計資料
@app.route("/api/admin/level", methods=["GET"])
def admin_level():
    # 確認有沒有登入(token是否合法)
    current_user = get_current_user_from_request()

    if not current_user:
        return jsonify({"error": "未登入或token無效"}), 401
    # 確認是否為admin
    if current_user["level"] != "admin":
        return jsonify({"error": "沒有權限, 只有admin可以使用這個功能(API)"}), 403

    # 列出所有的會員資料
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT level, COUNT(*) as count FROM member GROUP BY level "
            )
            rows = cursor.fetchall()

            # 回傳所有的會員資料
            return jsonify({"message": "會員等級資料統計成功!", "data": rows})
    finally:
        conn.close()


# =====================================================================#
# 取得會員學歷統計資料
@app.route("/api/admin/edu", methods=["GET"])
def admin_edu():
    # 確認有沒有登入(token是否合法)
    current_user = get_current_user_from_request()

    if not current_user:
        return jsonify({"error": "未登入或token無效"}), 401
    # 確認是否為admin
    if current_user["level"] != "admin":
        return jsonify({"error": "沒有權限, 只有admin可以使用這個功能(API)"}), 403

    # 列出所有的會員資料
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT edu, COUNT(*) as count FROM member GROUP BY edu")
            rows = cursor.fetchall()

            # 回傳所有的會員資料
            return jsonify({"message": "會員學歷資料統計成功!", "data": rows})
    finally:
        conn.close()


# =====================================================================#
# 取得會員居住地區統計資料
@app.route("/api/admin/city", methods=["GET"])
def admin_city():
    # 確認有沒有登入(token是否合法)
    current_user = get_current_user_from_request()

    if not current_user:
        return jsonify({"error": "未登入或token無效"}), 401
    # 確認是否為admin
    if current_user["level"] != "admin":
        return jsonify({"error": "沒有權限, 只有admin可以使用這個功能(API)"}), 403

    # 列出所有的會員資料
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT city, COUNT(*) as count FROM member GROUP BY city")
            rows = cursor.fetchall()

            # 回傳所有的會員資料
            return jsonify({"message": "會員居住地資料統計成功!", "data": rows})
    finally:
        conn.close()


# =====================================================================#
# 測試API基本通訊
@app.route("/api/ping")
def ping():
    return jsonify({"meaasge": "ping"})


# =====================================================================#
# 更新會員資料（必須是 admin）
@app.route("/api/admin/users/update", methods=["POST"])
def admin_update_user():

    # 1️⃣ 驗證 token
    current_user = get_current_user_from_request()
    if not current_user:
        return jsonify({"status": False, "message": "未登入或 token 無效"}), 401

    # 2️⃣ 驗證 admin 權限
    if current_user["level"] != "admin":
        return jsonify({"status": False, "message": "沒有權限"}), 403

    # 3️⃣ 取得前端送來的資料
    data = request.get_json()
    user_id = data.get("id")
    level = data.get("level")

    if not user_id or not level:
        return jsonify({"status": False, "message": "缺少必要欄位"}), 400

    # 4️⃣ 更新資料庫
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "UPDATE member SET level = %s WHERE id = %s", (level, user_id)
            )
            conn.commit()

        return jsonify({"status": True, "message": "更新成功"}), 200

    finally:
        conn.close()


# =====================================================================#
# RESTful 刪除會員（必須是 admin）
@app.route("/api/admin/users/<int:user_id>", methods=["DELETE"])
def admin_delete_user_restful(user_id):

    # 1️⃣ 驗證 token
    current_user = get_current_user_from_request()
    if not current_user:
        return jsonify({"status": False, "message": "未登入或 token 無效"}), 401

    # 2️⃣ 驗證 admin 權限
    if current_user["level"] != "admin":
        return jsonify({"status": False, "message": "沒有權限"}), 403

    # 3️⃣ 防止 admin 刪自己
    if user_id == current_user["id"]:
        return jsonify({"status": False, "message": "不能刪除自己"}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cursor:

            # 4️⃣ 確認會員是否存在
            cursor.execute(
                "SELECT id, level FROM member WHERE id = %s",
                (user_id,)
            )
            user = cursor.fetchone()

            if not user:
                return jsonify({"status": False, "message": "會員不存在"}), 404

            # 5️⃣（選用）禁止刪除其他 admin
            if user["level"] == "admin":
                return jsonify({"status": False, "message": "不能刪除其他管理員"}), 400

            # 6️⃣ 執行刪除
            cursor.execute(
                "DELETE FROM member WHERE id = %s",
                (user_id,)
            )
            conn.commit()

        return jsonify({
            "status": True,
            "message": "會員刪除成功"
        }), 200

    finally:
        conn.close()

# =================================#
# 主程式
if __name__ == "__main__":
    # Render 會提供 PORT 環境變數
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
