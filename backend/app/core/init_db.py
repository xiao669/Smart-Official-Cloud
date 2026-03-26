"""数据库初始化脚本"""
import asyncio
import aiomysql
from sqlalchemy import text
from app.core.database import engine, AsyncSessionLocal
from app.models.base import Base
from app.models.user import User
from app.models.medicine import Medicine, MedicineCategory
from app.models.inventory import Batch, Transaction, Stocktake, StocktakeItem
from app.models.warning import Warning, WarningConfig
from app.models.ocr import OcrRecord
from app.models.log import OperationLog
from app.core.security import get_password_hash
from app.core.config import settings


async def create_database():
    """创建数据库（如果不存在）"""
    print(f"Connecting to MySQL server...")
    try:
        conn = await aiomysql.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
        )
        async with conn.cursor() as cursor:
            await cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS {settings.DB_NAME} "
                f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
            print(f"Database '{settings.DB_NAME}' created or already exists.")
        conn.close()
    except Exception as e:
        print(f"Error creating database: {e}")
        raise


async def create_tables():
    """创建所有表"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created.")


async def init_data():
    """初始化基础数据"""
    async with AsyncSessionLocal() as db:
        # 检查是否已有管理员用户
        result = await db.execute(text("SELECT COUNT(*) FROM users"))
        count = result.scalar()

        if count == 0:
            # 创建默认管理员
            admin = User(
                username="admin",
                password_hash=get_password_hash("admin123"),
                realname="System Admin",
                user_type="admin",
            )
            db.add(admin)

            # 创建默认药品分类（按中国药品管理法分类）
            categories = [
                MedicineCategory(name="化学药品", sort_order=1),      # 西药/化学药
                MedicineCategory(name="中成药", sort_order=2),        # 中药成药
                MedicineCategory(name="中药饮片", sort_order=3),      # 中药材加工品
                MedicineCategory(name="生物制品", sort_order=4),      # 疫苗、血液制品等
                MedicineCategory(name="保健食品", sort_order=5),      # 保健品
            ]
            for cat in categories:
                db.add(cat)

            # 创建默认预警配置
            configs = [
                WarningConfig(
                    config_key="expiry_warning_days",
                    config_value="30",
                    description="Expiry warning days",
                ),
                WarningConfig(
                    config_key="low_stock_threshold",
                    config_value="10",
                    description="Low stock threshold",
                ),
            ]
            for config in configs:
                db.add(config)

            await db.commit()
            print("Initial data created.")
            print("Default admin account: admin / admin123")
        else:
            print("Database already has data, skipping initialization.")


async def main():
    """主函数"""
    # 先创建数据库
    await create_database()
    # 再创建表
    await create_tables()
    # 最后初始化数据
    await init_data()


if __name__ == "__main__":
    asyncio.run(main())
