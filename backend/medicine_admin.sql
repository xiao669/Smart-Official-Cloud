/*
 Navicat Premium Dump SQL

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80044 (8.0.44)
 Source Host           : localhost:3306
 Source Schema         : medicine_admin

 Target Server Type    : MySQL
 Target Server Version : 80044 (8.0.44)
 File Encoding         : 65001

 Date: 18/03/2026 18:02:42
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for alembic_version
-- ----------------------------
DROP TABLE IF EXISTS `alembic_version`;
CREATE TABLE `alembic_version`  (
  `version_num` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`version_num`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of alembic_version
-- ----------------------------

-- ----------------------------
-- Table structure for batches
-- ----------------------------
DROP TABLE IF EXISTS `batches`;
CREATE TABLE `batches`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `medicine_id` int NOT NULL,
  `batch_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `quantity` int NOT NULL,
  `production_date` date NULL DEFAULT NULL COMMENT '生产日期',
  `expiry_date` date NOT NULL,
  `inbound_date` datetime NOT NULL,
  `zero_stock_date` datetime NULL DEFAULT NULL COMMENT '库存变为0的时间',
  `remark` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ix_batches_batch_number`(`batch_number` ASC) USING BTREE,
  INDEX `ix_batches_medicine_id`(`medicine_id` ASC) USING BTREE,
  CONSTRAINT `batches_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of batches
-- ----------------------------
INSERT INTO `batches` VALUES (1, 1, NULL, 0, '0001-01-01', '0001-01-01', '2025-12-19 15:12:48', '2025-12-19 11:33:32', '', '2025-12-19 15:12:48');
INSERT INTO `batches` VALUES (2, 2, NULL, 1, '2023-01-02', '2025-08-01', '2025-12-19 15:21:42', NULL, '', '2025-12-19 15:21:42');
INSERT INTO `batches` VALUES (3, 3, NULL, 1, '2024-05-06', '2026-01-01', '2025-12-19 15:41:46', NULL, '', '2025-12-19 15:41:46');
INSERT INTO `batches` VALUES (4, 4, NULL, 0, '0001-01-01', '0001-01-01', '2025-12-19 15:58:50', '2025-12-19 11:20:47', '', '2025-12-19 15:58:50');
INSERT INTO `batches` VALUES (5, 5, NULL, 1, '2025-01-01', '2025-09-06', '2025-12-19 16:11:13', NULL, '', '2025-12-19 16:11:13');
INSERT INTO `batches` VALUES (8, 8, NULL, 1, '2024-12-01', '2029-12-01', '2025-12-20 01:51:13', NULL, '', '2025-12-20 01:51:13');

-- ----------------------------
-- Table structure for custom_batches
-- ----------------------------
DROP TABLE IF EXISTS `custom_batches`;
CREATE TABLE `custom_batches`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `batch_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT 0,
  `production_date` date NULL DEFAULT NULL,
  `expiry_date` date NOT NULL,
  `inbound_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `zero_stock_date` datetime NULL DEFAULT NULL COMMENT '库存变为0的时间',
  `remark` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ix_custom_batches_item_id`(`item_id` ASC) USING BTREE,
  INDEX `ix_custom_batches_batch_number`(`batch_number` ASC) USING BTREE,
  CONSTRAINT `custom_batches_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `custom_items` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of custom_batches
-- ----------------------------

-- ----------------------------
-- Table structure for custom_categories
-- ----------------------------
DROP TABLE IF EXISTS `custom_categories`;
CREATE TABLE `custom_categories`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of custom_categories
-- ----------------------------
INSERT INTO `custom_categories` VALUES (1, '分类一', '自定义分类1', 1, '2025-12-21 13:46:57');
INSERT INTO `custom_categories` VALUES (2, '分类二', '自定义分类2', 2, '2025-12-21 13:46:57');
INSERT INTO `custom_categories` VALUES (3, '分类三', '自定义分类3', 3, '2025-12-21 13:46:57');
INSERT INTO `custom_categories` VALUES (4, '其他', '其他类别', 99, '2025-12-21 13:46:57');

-- ----------------------------
-- Table structure for custom_items
-- ----------------------------
DROP TABLE IF EXISTS `custom_items`;
CREATE TABLE `custom_items`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `barcode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '条形码',
  `category_id` int NOT NULL,
  `specification` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `manufacturer` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `price` float NULL DEFAULT NULL COMMENT '单价',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  INDEX `category_id`(`category_id` ASC) USING BTREE,
  INDEX `ix_custom_items_name`(`name` ASC) USING BTREE,
  INDEX `ix_custom_items_code`(`code` ASC) USING BTREE,
  INDEX `ix_custom_items_barcode`(`barcode` ASC) USING BTREE,
  CONSTRAINT `custom_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `custom_categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of custom_items
-- ----------------------------

-- ----------------------------
-- Table structure for daily_push_counts
-- ----------------------------
DROP TABLE IF EXISTS `daily_push_counts`;
CREATE TABLE `daily_push_counts`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `push_date` date NOT NULL,
  `push_count` int NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_date`(`user_id` ASC, `push_date` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_push_date`(`push_date` ASC) USING BTREE,
  CONSTRAINT `daily_push_counts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of daily_push_counts
-- ----------------------------
INSERT INTO `daily_push_counts` VALUES (1, 20, '2025-12-19', 10);
INSERT INTO `daily_push_counts` VALUES (2, 1, '2025-12-19', 2);
INSERT INTO `daily_push_counts` VALUES (3, 20, '2025-12-20', 10);
INSERT INTO `daily_push_counts` VALUES (4, 1, '2025-12-20', 1);
INSERT INTO `daily_push_counts` VALUES (5, 20, '2025-12-22', 1);

-- ----------------------------
-- Table structure for document_batches
-- ----------------------------
DROP TABLE IF EXISTS `document_batches`;
CREATE TABLE `document_batches`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `batch_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT 0,
  `production_date` date NULL DEFAULT NULL,
  `expiry_date` date NOT NULL,
  `inbound_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `zero_stock_date` datetime NULL DEFAULT NULL COMMENT '库存变为0的时间',
  `remark` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ix_document_batches_item_id`(`item_id` ASC) USING BTREE,
  INDEX `ix_document_batches_batch_number`(`batch_number` ASC) USING BTREE,
  CONSTRAINT `document_batches_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `document_items` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of document_batches
-- ----------------------------

-- ----------------------------
-- Table structure for document_categories
-- ----------------------------
DROP TABLE IF EXISTS `document_categories`;
CREATE TABLE `document_categories`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of document_categories
-- ----------------------------
INSERT INTO `document_categories` VALUES (1, '合同文件', '合同类文档', 1, '2025-12-21 13:46:57');
INSERT INTO `document_categories` VALUES (2, '技术文档', '技术资料', 2, '2025-12-21 13:46:57');
INSERT INTO `document_categories` VALUES (3, '财务文件', '财务相关文档', 3, '2025-12-21 13:46:57');
INSERT INTO `document_categories` VALUES (4, '人事文件', '人事档案', 4, '2025-12-21 13:46:57');
INSERT INTO `document_categories` VALUES (5, '其他文档', '其他类文档', 99, '2025-12-21 13:46:57');

-- ----------------------------
-- Table structure for document_items
-- ----------------------------
DROP TABLE IF EXISTS `document_items`;
CREATE TABLE `document_items`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `barcode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '条形码',
  `category_id` int NOT NULL,
  `specification` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `manufacturer` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `price` float NULL DEFAULT NULL COMMENT '单价',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  INDEX `category_id`(`category_id` ASC) USING BTREE,
  INDEX `ix_document_items_name`(`name` ASC) USING BTREE,
  INDEX `ix_document_items_code`(`code` ASC) USING BTREE,
  INDEX `ix_document_items_barcode`(`barcode` ASC) USING BTREE,
  CONSTRAINT `document_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `document_categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of document_items
-- ----------------------------

-- ----------------------------
-- Table structure for equipment_batches
-- ----------------------------
DROP TABLE IF EXISTS `equipment_batches`;
CREATE TABLE `equipment_batches`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `batch_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT 0,
  `production_date` date NULL DEFAULT NULL,
  `expiry_date` date NOT NULL,
  `inbound_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `zero_stock_date` datetime NULL DEFAULT NULL COMMENT '库存变为0的时间',
  `remark` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ix_equipment_batches_item_id`(`item_id` ASC) USING BTREE,
  INDEX `ix_equipment_batches_batch_number`(`batch_number` ASC) USING BTREE,
  CONSTRAINT `equipment_batches_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `equipment_items` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of equipment_batches
-- ----------------------------

-- ----------------------------
-- Table structure for equipment_categories
-- ----------------------------
DROP TABLE IF EXISTS `equipment_categories`;
CREATE TABLE `equipment_categories`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of equipment_categories
-- ----------------------------
INSERT INTO `equipment_categories` VALUES (1, '办公设备', '办公用设备', 1, '2025-12-21 13:46:57');
INSERT INTO `equipment_categories` VALUES (2, '生产设备', '生产用设备', 2, '2025-12-21 13:46:57');
INSERT INTO `equipment_categories` VALUES (3, '检测设备', '检测仪器', 3, '2025-12-21 13:46:57');
INSERT INTO `equipment_categories` VALUES (4, '运输设备', '运输工具', 4, '2025-12-21 13:46:57');
INSERT INTO `equipment_categories` VALUES (5, '其他设备', '其他类设备', 99, '2025-12-21 13:46:57');

-- ----------------------------
-- Table structure for equipment_items
-- ----------------------------
DROP TABLE IF EXISTS `equipment_items`;
CREATE TABLE `equipment_items`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `barcode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '条形码',
  `category_id` int NOT NULL,
  `specification` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `manufacturer` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `price` float NULL DEFAULT NULL COMMENT '单价',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  INDEX `category_id`(`category_id` ASC) USING BTREE,
  INDEX `ix_equipment_items_name`(`name` ASC) USING BTREE,
  INDEX `ix_equipment_items_code`(`code` ASC) USING BTREE,
  INDEX `ix_equipment_items_barcode`(`barcode` ASC) USING BTREE,
  CONSTRAINT `equipment_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `equipment_categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of equipment_items
-- ----------------------------

-- ----------------------------
-- Table structure for food_batches
-- ----------------------------
DROP TABLE IF EXISTS `food_batches`;
CREATE TABLE `food_batches`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `batch_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT 0,
  `production_date` date NULL DEFAULT NULL,
  `expiry_date` date NOT NULL,
  `inbound_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `zero_stock_date` datetime NULL DEFAULT NULL COMMENT '库存变为0的时间',
  `remark` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ix_food_batches_item_id`(`item_id` ASC) USING BTREE,
  INDEX `ix_food_batches_batch_number`(`batch_number` ASC) USING BTREE,
  CONSTRAINT `food_batches_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `food_items` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of food_batches
-- ----------------------------

-- ----------------------------
-- Table structure for food_categories
-- ----------------------------
DROP TABLE IF EXISTS `food_categories`;
CREATE TABLE `food_categories`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of food_categories
-- ----------------------------
INSERT INTO `food_categories` VALUES (1, '主食', '米面粮油等主食', 1, '2025-12-21 13:46:57');
INSERT INTO `food_categories` VALUES (2, '蔬菜', '新鲜蔬菜', 2, '2025-12-21 13:46:57');
INSERT INTO `food_categories` VALUES (3, '水果', '新鲜水果', 3, '2025-12-21 13:46:57');
INSERT INTO `food_categories` VALUES (4, '肉类', '肉类食品', 4, '2025-12-21 13:46:57');
INSERT INTO `food_categories` VALUES (5, '调味品', '调味料', 5, '2025-12-21 13:46:57');
INSERT INTO `food_categories` VALUES (6, '其他', '其他食品', 99, '2025-12-21 13:46:57');

-- ----------------------------
-- Table structure for food_items
-- ----------------------------
DROP TABLE IF EXISTS `food_items`;
CREATE TABLE `food_items`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `barcode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '条形码',
  `category_id` int NOT NULL,
  `specification` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `manufacturer` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `price` float NULL DEFAULT NULL COMMENT '单价',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  INDEX `category_id`(`category_id` ASC) USING BTREE,
  INDEX `ix_food_items_name`(`name` ASC) USING BTREE,
  INDEX `ix_food_items_code`(`code` ASC) USING BTREE,
  INDEX `ix_food_items_barcode`(`barcode` ASC) USING BTREE,
  CONSTRAINT `food_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `food_categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of food_items
-- ----------------------------

-- ----------------------------
-- Table structure for inventory_batches
-- ----------------------------
DROP TABLE IF EXISTS `inventory_batches`;
CREATE TABLE `inventory_batches`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `batch_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT 0,
  `production_date` date NULL DEFAULT NULL,
  `expiry_date` date NOT NULL,
  `inbound_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `zero_stock_date` datetime NULL DEFAULT NULL COMMENT '库存变为0的时间',
  `remark` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ix_inventory_batches_item_id`(`item_id` ASC) USING BTREE,
  INDEX `ix_inventory_batches_batch_number`(`batch_number` ASC) USING BTREE,
  CONSTRAINT `inventory_batches_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `inventory_items` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inventory_batches
-- ----------------------------
INSERT INTO `inventory_batches` VALUES (1, 2, NULL, 0, '0001-01-01', '0001-01-01', '2025-12-21 15:43:10', '2025-12-21 07:45:52', '', '2025-12-21 15:43:10');

-- ----------------------------
-- Table structure for inventory_categories
-- ----------------------------
DROP TABLE IF EXISTS `inventory_categories`;
CREATE TABLE `inventory_categories`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inventory_categories
-- ----------------------------
INSERT INTO `inventory_categories` VALUES (1, '日用品', '日常生活用品', 1, '2025-12-21 13:46:57');
INSERT INTO `inventory_categories` VALUES (2, '食品饮料', '食品和饮料类', 2, '2025-12-21 13:46:57');
INSERT INTO `inventory_categories` VALUES (3, '办公用品', '办公文具用品', 3, '2025-12-21 13:46:57');
INSERT INTO `inventory_categories` VALUES (4, '电子产品', '电子设备类', 4, '2025-12-21 13:46:57');
INSERT INTO `inventory_categories` VALUES (5, '其他', '其他类别', 99, '2025-12-21 13:46:57');

-- ----------------------------
-- Table structure for inventory_items
-- ----------------------------
DROP TABLE IF EXISTS `inventory_items`;
CREATE TABLE `inventory_items`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `barcode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '条形码',
  `category_id` int NOT NULL,
  `specification` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `manufacturer` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `price` float NULL DEFAULT NULL COMMENT '单价',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  INDEX `category_id`(`category_id` ASC) USING BTREE,
  INDEX `ix_inventory_items_name`(`name` ASC) USING BTREE,
  INDEX `ix_inventory_items_code`(`code` ASC) USING BTREE,
  INDEX `ix_inventory_items_barcode`(`barcode` ASC) USING BTREE,
  CONSTRAINT `inventory_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `inventory_categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of inventory_items
-- ----------------------------
INSERT INTO `inventory_items` VALUES (1, '柔贝佳', 'MED1766298043859', NULL, 2, '未知', '盒', '未知', NULL, NULL, 0, '2025-12-21 14:20:43', '2025-12-21 14:20:43');
INSERT INTO `inventory_items` VALUES (2, '覆盆子', 'MED1766302926619', NULL, 2, '未知', '盒', '未知', NULL, NULL, 0, '2025-12-21 15:42:05', '2025-12-21 15:42:05');

-- ----------------------------
-- Table structure for medicine_batches
-- ----------------------------
DROP TABLE IF EXISTS `medicine_batches`;
CREATE TABLE `medicine_batches`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `batch_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT 0,
  `production_date` date NULL DEFAULT NULL,
  `expiry_date` date NOT NULL,
  `inbound_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `zero_stock_date` datetime NULL DEFAULT NULL COMMENT '库存变为0的时间',
  `remark` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ix_medicine_batches_item_id`(`item_id` ASC) USING BTREE,
  INDEX `ix_medicine_batches_batch_number`(`batch_number` ASC) USING BTREE,
  CONSTRAINT `medicine_batches_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `medicine_items` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of medicine_batches
-- ----------------------------

-- ----------------------------
-- Table structure for medicine_categories
-- ----------------------------
DROP TABLE IF EXISTS `medicine_categories`;
CREATE TABLE `medicine_categories`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `sort_order` int NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of medicine_categories
-- ----------------------------
INSERT INTO `medicine_categories` VALUES (1, '化学药品', '中药制剂', 1, '2025-12-19 15:11:34');
INSERT INTO `medicine_categories` VALUES (2, '中成药', '西药制剂', 2, '2025-12-19 15:11:34');
INSERT INTO `medicine_categories` VALUES (3, '中药饮片', NULL, 3, '2025-12-20 02:00:03');
INSERT INTO `medicine_categories` VALUES (4, '生物制品', NULL, 4, '2025-12-20 02:00:03');
INSERT INTO `medicine_categories` VALUES (5, '保健食品', NULL, 5, '2025-12-20 02:00:03');

-- ----------------------------
-- Table structure for medicine_items
-- ----------------------------
DROP TABLE IF EXISTS `medicine_items`;
CREATE TABLE `medicine_items`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `barcode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '条形码',
  `category_id` int NOT NULL,
  `specification` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `manufacturer` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `price` float NULL DEFAULT NULL COMMENT '单价',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  INDEX `category_id`(`category_id` ASC) USING BTREE,
  INDEX `ix_medicine_items_name`(`name` ASC) USING BTREE,
  INDEX `ix_medicine_items_code`(`code` ASC) USING BTREE,
  INDEX `ix_medicine_items_barcode`(`barcode` ASC) USING BTREE,
  CONSTRAINT `medicine_items_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `medicine_categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of medicine_items
-- ----------------------------

-- ----------------------------
-- Table structure for medicines
-- ----------------------------
DROP TABLE IF EXISTS `medicines`;
CREATE TABLE `medicines`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `barcode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '药品条形码',
  `category_id` int NOT NULL,
  `specification` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `manufacturer` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `price` decimal(10, 2) NULL DEFAULT NULL COMMENT '药品单价',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `is_deleted` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `ix_medicines_code`(`code` ASC) USING BTREE,
  INDEX `category_id`(`category_id` ASC) USING BTREE,
  INDEX `ix_medicines_name`(`name` ASC) USING BTREE,
  INDEX `idx_medicines_barcode`(`barcode` ASC) USING BTREE,
  CONSTRAINT `medicines_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `medicine_categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of medicines
-- ----------------------------
INSERT INTO `medicines` VALUES (1, '克拉霉素胶囊', 'MED1766128311326', NULL, 1, '8粒×1板', '盒', '未知', NULL, NULL, 0, '2025-12-19 15:11:50', '2025-12-19 15:11:50');
INSERT INTO `medicines` VALUES (2, '连花清咳片', 'MED1766128880671', NULL, 1, '24片装', '盒', '石家庄以岭药业股份有限公司', NULL, NULL, 0, '2025-12-19 15:21:19', '2025-12-19 15:21:19');
INSERT INTO `medicines` VALUES (3, '甲硝唑片', 'MED1766130086641', NULL, 1, '0.2g×100片', '盒', '远大药', NULL, NULL, 0, '2025-12-19 15:41:25', '2025-12-19 15:41:25');
INSERT INTO `medicines` VALUES (4, '人工牛黄甲硝唑胶囊', 'MED1766131100304', NULL, 1, '12粒×3板', '盒', '未知', NULL, NULL, 0, '2025-12-19 15:58:18', '2025-12-19 15:58:18');
INSERT INTO `medicines` VALUES (5, '西瓜霜润喉', 'MED1766131857450', NULL, 1, '每小盒36片', '盒', '桂林三金药业股份有限公司', NULL, NULL, 0, '2025-12-19 16:10:56', '2025-12-19 16:10:56');
INSERT INTO `medicines` VALUES (6, '鼻炎康片', 'MED1766155153847', NULL, 1, '未知', '盒', '国药集团德众（佛山）药业有限公司', NULL, NULL, 1, '2025-12-19 22:39:12', '2025-12-20 01:00:06');
INSERT INTO `medicines` VALUES (7, '阿莫西林胶囊', 'MED1766155671478', '6940200200678', 1, '10粒/板×4板', '盒', '仁和', NULL, NULL, 1, '2025-12-19 22:47:50', '2025-12-20 01:53:15');
INSERT INTO `medicines` VALUES (8, '克拉霉素胶囊', 'MED1766166644296', '6925526209284', 1, '8粒×1板', '盒', '未知', NULL, NULL, 0, '2025-12-20 01:50:42', '2025-12-20 01:51:13');
INSERT INTO `medicines` VALUES (9, '阿莫西林胶囊', 'MED1766167332224', '6940200200678', 2, '10粒/板x4板', '盒', '仁和', NULL, NULL, 0, '2025-12-20 02:02:10', '2025-12-20 02:03:17');

-- ----------------------------
-- Table structure for notifications
-- ----------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `warning_id` int NOT NULL,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_pushed` tinyint(1) NULL DEFAULT 0,
  `is_read` tinyint(1) NULL DEFAULT 0,
  `push_date` date NOT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `pushed_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_push_date`(`push_date` ASC) USING BTREE,
  INDEX `idx_is_pushed`(`is_pushed` ASC) USING BTREE,
  INDEX `warning_id`(`warning_id` ASC) USING BTREE,
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`warning_id`) REFERENCES `warnings` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 30 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of notifications
-- ----------------------------
INSERT INTO `notifications` VALUES (29, 20, 70, '【低库存】药品', '商品 覆盆子 库存不足，当前库存 0', 'low_stock', 1, 1, '2025-12-22', '2025-12-22 16:44:36', '2025-12-22 16:44:37');

-- ----------------------------
-- Table structure for ocr_records
-- ----------------------------
DROP TABLE IF EXISTS `ocr_records`;
CREATE TABLE `ocr_records`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ocr_result` json NULL,
  `corrected_data` json NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reviewer_id` int NULL DEFAULT NULL,
  `reject_reason` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `reviewed_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ocr_records_ibfk_1`(`reviewer_id` ASC) USING BTREE,
  CONSTRAINT `ocr_records_ibfk_1` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ocr_records
-- ----------------------------

-- ----------------------------
-- Table structure for operation_logs
-- ----------------------------
DROP TABLE IF EXISTS `operation_logs`;
CREATE TABLE `operation_logs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `operation` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `target_id` int NULL DEFAULT NULL,
  `details` json NULL,
  `ip_address` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ix_operation_logs_user_id`(`user_id` ASC) USING BTREE,
  INDEX `ix_operation_logs_operation`(`operation` ASC) USING BTREE,
  CONSTRAINT `operation_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of operation_logs
-- ----------------------------

-- ----------------------------
-- Table structure for replenish_suggestions
-- ----------------------------
DROP TABLE IF EXISTS `replenish_suggestions`;
CREATE TABLE `replenish_suggestions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `medicine_id` int NOT NULL,
  `current_stock` int NOT NULL,
  `avg_daily_consumption` float NOT NULL,
  `days_until_stockout` int NOT NULL,
  `suggested_quantity` int NOT NULL,
  `is_urgent` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `medicine_id`(`medicine_id` ASC) USING BTREE,
  CONSTRAINT `replenish_suggestions_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of replenish_suggestions
-- ----------------------------

-- ----------------------------
-- Table structure for sms_api_configs
-- ----------------------------
DROP TABLE IF EXISTS `sms_api_configs`;
CREATE TABLE `sms_api_configs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `config_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `config_key`(`config_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sms_api_configs
-- ----------------------------
INSERT INTO `sms_api_configs` VALUES (1, 'access_key_id', 'admin', NULL, '2025-12-19 18:05:37', '2025-12-19 18:05:37');
INSERT INTO `sms_api_configs` VALUES (2, 'access_key_secret', 'admin123', NULL, '2025-12-19 18:05:37', '2025-12-19 18:05:37');
INSERT INTO `sms_api_configs` VALUES (3, 'sign_name', '', NULL, '2025-12-19 18:05:37', '2025-12-19 18:05:37');
INSERT INTO `sms_api_configs` VALUES (4, 'template_code', '', NULL, '2025-12-19 18:05:37', '2025-12-19 18:05:37');
INSERT INTO `sms_api_configs` VALUES (5, 'expired_template_code', '', NULL, '2025-12-19 18:05:37', '2025-12-19 18:05:37');
INSERT INTO `sms_api_configs` VALUES (6, 'low_stock_template_code', '', NULL, '2025-12-19 18:05:37', '2025-12-19 18:05:37');
INSERT INTO `sms_api_configs` VALUES (7, 'sms_enabled', 'false', NULL, '2025-12-19 18:05:37', '2025-12-20 11:59:35');
INSERT INTO `sms_api_configs` VALUES (8, 'daily_limit', '1', NULL, '2025-12-19 18:05:37', '2025-12-19 18:05:37');

-- ----------------------------
-- Table structure for sms_configs
-- ----------------------------
DROP TABLE IF EXISTS `sms_configs`;
CREATE TABLE `sms_configs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `sms_enabled` tinyint(1) NULL DEFAULT 0,
  `expiry_sms_enabled` tinyint(1) NULL DEFAULT 1,
  `expired_sms_enabled` tinyint(1) NULL DEFAULT 1,
  `low_stock_sms_enabled` tinyint(1) NULL DEFAULT 0,
  `notify_time` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT '09:00',
  `notify_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `sms_configs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sms_configs
-- ----------------------------
INSERT INTO `sms_configs` VALUES (1, 1, 0, 1, 1, 0, '09:00', NULL, '2025-12-20 01:57:19', '2025-12-20 01:57:26');

-- ----------------------------
-- Table structure for sms_daily_counts
-- ----------------------------
DROP TABLE IF EXISTS `sms_daily_counts`;
CREATE TABLE `sms_daily_counts`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `send_date` date NOT NULL,
  `send_count` int NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_date`(`user_id` ASC, `send_date` ASC) USING BTREE,
  CONSTRAINT `sms_daily_counts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sms_daily_counts
-- ----------------------------

-- ----------------------------
-- Table structure for sms_logs
-- ----------------------------
DROP TABLE IF EXISTS `sms_logs`;
CREATE TABLE `sms_logs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NULL DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sms_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `warning_id` int NULL DEFAULT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending',
  `error_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `error_message` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `biz_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `sent_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `warning_id`(`warning_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  CONSTRAINT `sms_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `sms_logs_ibfk_2` FOREIGN KEY (`warning_id`) REFERENCES `warnings` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sms_logs
-- ----------------------------

-- ----------------------------
-- Table structure for stocktake_items
-- ----------------------------
DROP TABLE IF EXISTS `stocktake_items`;
CREATE TABLE `stocktake_items`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `stocktake_id` int NOT NULL,
  `batch_id` int NOT NULL,
  `expected_quantity` int NOT NULL,
  `actual_quantity` int NULL DEFAULT NULL,
  `discrepancy` int NULL DEFAULT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `batch_id`(`batch_id` ASC) USING BTREE,
  INDEX `ix_stocktake_items_stocktake_id`(`stocktake_id` ASC) USING BTREE,
  CONSTRAINT `stocktake_items_ibfk_1` FOREIGN KEY (`stocktake_id`) REFERENCES `stocktakes` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `stocktake_items_ibfk_2` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of stocktake_items
-- ----------------------------

-- ----------------------------
-- Table structure for stocktakes
-- ----------------------------
DROP TABLE IF EXISTS `stocktakes`;
CREATE TABLE `stocktakes`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `creator_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `completed_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `stocktakes_ibfk_1`(`creator_id` ASC) USING BTREE,
  CONSTRAINT `stocktakes_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of stocktakes
-- ----------------------------

-- ----------------------------
-- Table structure for transactions
-- ----------------------------
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `batch_id` int NOT NULL,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `reason` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `recipient` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `operator_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `ix_transactions_batch_id`(`batch_id` ASC) USING BTREE,
  INDEX `transactions_ibfk_2`(`operator_id` ASC) USING BTREE,
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of transactions
-- ----------------------------
INSERT INTO `transactions` VALUES (1, 1, 'inbound', 1, '入库', NULL, 20, '2025-12-19 15:12:48');
INSERT INTO `transactions` VALUES (4, 2, 'inbound', 1, '入库', NULL, 20, '2025-12-19 15:21:42');
INSERT INTO `transactions` VALUES (5, 3, 'inbound', 1, '入库', NULL, 20, '2025-12-19 15:41:46');
INSERT INTO `transactions` VALUES (6, 4, 'inbound', 1, '入库', NULL, 20, '2025-12-19 15:58:50');
INSERT INTO `transactions` VALUES (7, 5, 'inbound', 1, '入库', NULL, 20, '2025-12-19 16:11:13');
INSERT INTO `transactions` VALUES (8, 4, 'outbound', 1, '销售', NULL, 1, '2025-12-19 19:20:47');
INSERT INTO `transactions` VALUES (9, 1, 'outbound', 1, '销售', NULL, 1, '2025-12-19 19:33:32');
INSERT INTO `transactions` VALUES (12, 8, 'inbound', 1, '入库', NULL, 20, '2025-12-20 01:51:13');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `realname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `user_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `last_login` datetime NULL DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `push_cid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `current_mode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medicine' COMMENT '当前使用场景',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `ix_users_username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', 'sha256:6ca87741ae18b7ca1b9fa961855958aa:66d9c5308bcc97f928ad3340888afe98e17a4af05e1a8acd3275f14260359fee', 'System Admin', 'admin', NULL, '13800138000', NULL, 1, '2025-12-22 07:21:40', '2025-12-18 16:42:52', '48ecb38eeee99df1b30be5881efefc91', 'medicine');
INSERT INTO `users` VALUES (20, '13885514894', 'sha256:ffb72e7354800ba8bf6c41bb7920c9d4:97f03dac4eedf50f64f422d86010c371ed6767926b48307b5f448c889bc8c4de', '管理员', 'manager', '', '17785823489', '', 1, '2025-12-22 09:48:04', '2025-12-19 11:40:34', '507f02610ae2e4eec214f85b5b3e03ea', 'medicine');

-- ----------------------------
-- Table structure for warning_configs
-- ----------------------------
DROP TABLE IF EXISTS `warning_configs`;
CREATE TABLE `warning_configs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `config_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `config_value` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `config_key`(`config_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of warning_configs
-- ----------------------------
INSERT INTO `warning_configs` VALUES (1, 'expiry_warning_days', '30', NULL, '2025-12-19 23:52:19');
INSERT INTO `warning_configs` VALUES (2, 'low_stock_threshold', '10', NULL, '2025-12-19 23:52:19');
INSERT INTO `warning_configs` VALUES (3, 'reminder_time', '09:00', NULL, '2025-12-19 23:52:19');
INSERT INTO `warning_configs` VALUES (4, 'reminder_enabled', 'true', NULL, '2025-12-19 23:52:19');
INSERT INTO `warning_configs` VALUES (5, 're_remind_enabled', 'true', NULL, '2025-12-20 01:07:40');
INSERT INTO `warning_configs` VALUES (6, 're_remind_days', '3', NULL, '2025-12-20 01:07:40');
INSERT INTO `warning_configs` VALUES (7, 'site_name', '医药管理系统', NULL, '2025-12-20 01:07:40');
INSERT INTO `warning_configs` VALUES (8, 'expiry_threshold_days', '90', NULL, '2025-12-20 01:07:40');
INSERT INTO `warning_configs` VALUES (9, 'auto_cleanup_days', '30', NULL, '2025-12-20 01:07:40');
INSERT INTO `warning_configs` VALUES (10, 'token_expire_days', '7', NULL, '2025-12-20 01:07:40');
INSERT INTO `warning_configs` VALUES (11, 'sms_code_expire_minutes', '5', NULL, '2025-12-20 01:07:40');
INSERT INTO `warning_configs` VALUES (12, 'sms_code_max_attempts', '5', NULL, '2025-12-20 01:07:40');
INSERT INTO `warning_configs` VALUES (13, 'reminder_start_time', '08:00', NULL, '2025-12-20 01:07:40');
INSERT INTO `warning_configs` VALUES (14, 'reminder_end_time', '20:00', NULL, '2025-12-20 01:07:40');

-- ----------------------------
-- Table structure for warnings
-- ----------------------------
DROP TABLE IF EXISTS `warnings`;
CREATE TABLE `warnings`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'medicine',
  `medicine_id` int NULL DEFAULT NULL,
  `item_id` int NULL DEFAULT NULL,
  `batch_id` int NULL DEFAULT NULL,
  `message` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `read_at` datetime NULL DEFAULT NULL,
  `is_dismissed` tinyint(1) NULL DEFAULT 0,
  `dismissed_at` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `medicine_id`(`medicine_id` ASC) USING BTREE,
  INDEX `batch_id`(`batch_id` ASC) USING BTREE,
  INDEX `ix_warnings_type`(`type` ASC) USING BTREE,
  INDEX `idx_warnings_mode`(`mode` ASC) USING BTREE,
  CONSTRAINT `warnings_ibfk_1` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `warnings_ibfk_2` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 71 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of warnings
-- ----------------------------
INSERT INTO `warnings` VALUES (70, 'low_stock', 'inventory', NULL, 2, NULL, '商品 覆盆子 库存不足，当前库存 0', 1, '2025-12-21 15:46:10', NULL, 1, '2025-12-22 16:46:51');

SET FOREIGN_KEY_CHECKS = 1;
