"""更新药品分类（按中国药品管理法分类）"""
import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal


async def update_categories():
    """更新药品分类"""
    async with AsyncSessionLocal() as db:
        # 按中国药品管理法更新/插入分类
        categories = [
            (1, "化学药品", 1),    # 西药/化学药
            (2, "中成药", 2),      # 中药成药
            (3, "中药饮片", 3),    # 中药材加工品
            (4, "生物制品", 4),    # 疫苗、血液制品等
            (5, "保健食品", 5),    # 保健品
        ]
        
        for cat_id, name, sort_order in categories:
            # 检查是否存在
            result = await db.execute(
                text("SELECT id FROM medicine_categories WHERE id = :id"),
                {"id": cat_id}
            )
            exists = result.fetchone()
            
            if exists:
                # 更新
                await db.execute(
                    text("UPDATE medicine_categories SET name = :name, sort_order = :sort_order WHERE id = :id"),
                    {"id": cat_id, "name": name, "sort_order": sort_order}
                )
                print(f"更新分类: {cat_id}. {name}")
            else:
                # 插入（包含 created_at）
                await db.execute(
                    text("INSERT INTO medicine_categories (id, name, sort_order, created_at) VALUES (:id, :name, :sort_order, NOW())"),
                    {"id": cat_id, "name": name, "sort_order": sort_order}
                )
                print(f"添加分类: {cat_id}. {name}")
        
        await db.commit()
        print("\n分类更新完成！")
        
        # 显示更新后的分类
        result = await db.execute(text("SELECT id, name, sort_order FROM medicine_categories ORDER BY sort_order"))
        rows = result.fetchall()
        print("\n当前分类列表:")
        for row in rows:
            print(f"  {row[0]}. {row[1]} (排序: {row[2]})")


if __name__ == "__main__":
    asyncio.run(update_categories())
