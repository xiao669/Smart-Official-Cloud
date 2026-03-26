"""
直接用 SQL 重置管理员密码
使用已知的正确密码哈希
"""
import pymysql

# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '123456',
    'database': 'medicine_admin'
}

def reset_admin_password():
    """重置管理员密码"""
    conn = pymysql.connect(**DB_CONFIG, charset='utf8mb4')
    cursor = conn.cursor()

    try:
        # 这是 admin123 的正确哈希值（从数据库中提取的）
        # 使用 sha256 格式
        password_hash = 'sha256:6ca87741ae18b7ca1b9fa961855958aa:66d9c5308bcc97f928ad3340888afe98e17a4af05e1a8acd3275f14260359fee'

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
            print("\n成功重置管理员密码")
            print("\n登录信息:")
            print("  用户名: admin")
            print("  密码: admin123")
        else:
            print("\n未找到 admin 用户")

            # 检查是否有其他用户
            cursor.execute("SELECT username FROM users")
            users = cursor.fetchall()
            if users:
                print("\n数据库中现有用户:")
                for user in users:
                    print(f"  - {user[0]}")

        print("\n" + "=" * 60)

    except Exception as e:
        conn.rollback()
        print(f"\n错误: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    reset_admin_password()
