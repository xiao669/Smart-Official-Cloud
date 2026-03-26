# 图标说明

## 需要的图标文件

### back-white.png
- 用途：扫码页面返回按钮
- 尺寸：48x48px
- 颜色：白色
- 格式：PNG（透明背景）

## 临时解决方案

如果没有图标文件，可以使用文字代替。在 `medicine-app/pages/scan/index.vue` 中：

将：
```vue
<cover-image class="back-icon" src="/static/icons/back-white.png" />
```

改为：
```vue
<cover-view class="back-text">←</cover-view>
```

并添加样式：
```scss
.back-text {
  font-size: 48rpx;
  color: #FFFFFF;
  font-weight: bold;
}
```
