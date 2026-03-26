"""
重置管理员密码为 admin123
"""
import pymysql
from passlib.context import CryptContext

# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '123456',
    'database': 'medicine_admin'
}

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def reset_admin_password():
    """重置管理员密码"""
    conn = pymysql.connect(**DB_CONFIG)
    cursor = conn.cursor()

    try:
        # 生成新密码的哈希值
        new_password = "admin123"
        password_hash = pwd_context.hash(new_password)

        print("=" * 60)
        print("重置管理员密码")
        print("=" * 60)

        # 更新 admin 用户的密码
        cursor.execute("""
            UPDATE users
            SET password_hash = %s
            WHERE username = 'admin'
        """, (password_hash,))

        affected_rows = cursor.rowcount
        conn.commit()

        if affected_rows > 0:
            print(f"\n✓ 成功重置管理员密码")
            print(f"\n登录信息:")
            print(f"  用户名: admin")
            print(f"  密码: {new_password}")
        else:
            print("\n✗ 未找到 admin 用户")

            # 检查是否有其他用户
            cursor.execute("SELECT username FROM users")
            users = cursor.fetchall()
            if users:
                print(f"\n数据库中现有用户:")
                for user in users:
                    print(f"  - {user[0]}")

        print("\n" + "=" * 60)

    except Exception as e:
        conn.rollback()
        print(f"\n✗ 错误: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    reset_admin_password()
