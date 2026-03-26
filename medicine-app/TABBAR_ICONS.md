# TabBar 图标说明

## 📱 图标需求

由于uni-app的TabBar需要使用图片图标，需要准备以下图标文件：

### 图标列表

1. **首页图标**
   - 未选中：`static/tabbar/home.png`
   - 选中：`static/tabbar/home-active.png`
   - 图标：🏠 房子图标

2. **药品图标**
   - 未选中：`static/tabbar/medicine.png`
   - 选中：`static/tabbar/medicine-active.png`
   - 图标：💊 药丸图标

3. **预警图标**
   - 未选中：`static/tabbar/warning.png`
   - 选中：`static/tabbar/warning-active.png`
   - 图标：⚠️ 警告图标

4. **我的图标**
   - 未选中：`static/tabbar/user.png`
   - 选中：`static/tabbar/user-active.png`
   - 图标：👤 用户图标

## 🎨 设计规范

### 尺寸要求
- 图标尺寸：81px × 81px（推荐）
- 或者：162px × 162px（2倍图）
- 或者：243px × 243px（3倍图）

### 颜色规范
- **未选中状态**：#909399（灰色）
- **选中状态**：#667EEA（紫色）

### 设计建议
1. 使用简洁的线条图标
2. 保持图标风格统一
3. 确保图标在小尺寸下清晰可辨
4. 背景透明（PNG格式）

## 🔧 临时方案

如果暂时没有图标文件，可以：

1. **使用文字图标**：修改 `pages.json`，移除 `iconPath` 和 `selectedIconPath`
2. **使用 iconfont**：集成阿里巴巴矢量图标库
3. **使用 emoji**：虽然不推荐，但可以临时使用

## 📝 当前配置

```json
{
  "tabBar": {
    "color": "#909399",
    "selectedColor": "#667EEA",
    "borderStyle": "white",
    "backgroundColor": "#FFFFFF",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页"
      },
      {
        "pagePath": "pages/medicine/list",
        "text": "药品"
      },
      {
        "pagePath": "pages/warning/index",
        "text": "预警"
      },
      {
        "pagePath": "pages/settings/index",
        "text": "我的"
      }
    ]
  }
}
```

## 🎯 优化效果

- ✅ 选中颜色改为紫色（#667EEA），与登录页面风格统一
- ✅ 边框样式改为白色，更加简洁
- ✅ "设置"改为"我的"，更符合移动端习惯
- ✅ 准备了图标配置（需要图标文件）

## 🚀 下一步

1. 准备图标文件并放置到 `static/tabbar/` 目录
2. 或者使用无图标版本（纯文字）
3. 测试TabBar在不同设备上的显示效果
