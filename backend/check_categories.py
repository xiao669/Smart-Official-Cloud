"""查看药品分类"""
import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal


async def check():
    async with AsyncSessionLocal() as db:
        result = await db.execute(text("SELECT * FROM medicine_categories ORDER BY sort_order"))
        rows = result.fetchall()
        print("当前分类列表:")
        for row in rows:
            print(f"  ID={row[0]}, 名称={row[1]}, 排序={row[2]}")


if __name__ == "__main__":
    asyncio.run(check())
