"""
重置管理员密码为 admin123
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import asyncio
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from sqlalchemy import select

async def reset_admin_password():
    """重置管理员密码"""
    async with AsyncSessionLocal() as db:
        try:
            # 查找 admin 用户
            result = await db.execute(
                select(User).where(User.username == "admin")
            )
            admin_user = result.scalar_one_or_none()

            if not admin_user:
                print("未找到 admin 用户")
                # 显示所有用户
                result = await db.execute(select(User))
                users = result.scalars().all()
                print(f"\n数据库中现有用户:")
                for user in users:
                    print(f"  - {user.username}")
                return

            # 重置密码
            new_password = "admin123"
            admin_user.password_hash = get_password_hash(new_password)

            await db.commit()

            print("=" * 60)
            print("成功重置管理员密码")
            print("=" * 60)
            print(f"\n登录信息:")
            print(f"  用户名: admin")
            print(f"  密码: {new_password}")
            print("\n" + "=" * 60)

        except Exception as e:
            await db.rollback()
            print(f"错误: {e}")
            raise

if __name__ == "__main__":
    asyncio.run(reset_admin_password())
