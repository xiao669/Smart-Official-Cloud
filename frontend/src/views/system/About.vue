<template>
  <div class="about-page">
    <el-card class="main-card">
      <!-- 顶部横幅 -->
      <div class="hero-section">
        <div class="hero-bg"></div>
        <div class="hero-content">
          <div class="app-logo">{{ modeIcon }}</div>
          <h1 class="app-name">智管云</h1>
          <p class="app-slogan">智能{{ itemName }}库存管理系统</p>
          <div class="version-badge">
            <span class="version-label">当前版本</span>
            <span class="version-number">v6.0.2</span>
          </div>
        </div>
      </div>

      <!-- 产品介绍 -->
      <div class="section">
        <div class="section-header">
          <span class="section-icon">📖</span>
          <h2>产品介绍</h2>
        </div>
        <div class="section-body">
          <div class="intro-card">
            <p class="intro-text">
              <strong>智管云</strong> 是一款专为{{ itemName }}管理设计的专业库存管理软件。
              系统采用现代化的技术架构，提供PC端网页版和手机App双平台支持，帮助您轻松管理{{ itemName }}信息、
              库存出入库、有效期预警等日常工作，提升工作效率，降低管理成本。
            </p>
          </div>
        </div>
      </div>

      <!-- 核心功能 -->
      <div class="section">
        <div class="section-header">
          <span class="section-icon">🌟</span>
          <h2>核心功能</h2>
        </div>
        <div class="section-body">
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon-wrap">
                <span class="feature-icon">{{ modeIcon }}</span>
              </div>
              <h3>{{ itemName }}管理</h3>
              <p>完善的{{ itemName }}信息管理，支持批量导入导出，分类管理，快速检索</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon-wrap">
                <span class="feature-icon">📦</span>
              </div>
              <h3>库存管理</h3>
              <p>入库出库一键操作，批次追踪，库存盘点，实时掌握库存动态</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon-wrap">
                <span class="feature-icon">🔔</span>
              </div>
              <h3>智能预警</h3>
              <p>临期预警、过期预警、低库存预警，多维度保障{{ itemName }}安全</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon-wrap">
                <span class="feature-icon">📊</span>
              </div>
              <h3>数据报表</h3>
              <p>多维度数据统计分析，可视化图表展示，支持报表导出</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon-wrap">
                <span class="feature-icon">📷</span>
              </div>
              <h3>OCR识别</h3>
              <p>智能识别{{ itemName }}信息，拍照即可录入，大幅提升工作效率</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon-wrap">
                <span class="feature-icon">📱</span>
              </div>
              <h3>移动办公</h3>
              <p>手机App随时随地管理，扫码查询，移动入库，便捷高效</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 技术特点 -->
      <div class="section">
        <div class="section-header">
          <span class="section-icon">⚡</span>
          <h2>技术特点</h2>
        </div>
        <div class="section-body">
          <div class="tech-list">
            <div class="tech-item">
              <div class="tech-icon">🚀</div>
              <div class="tech-content">
                <h4>高性能架构</h4>
                <p>采用 FastAPI + Vue3 现代技术栈，响应迅速，体验流畅</p>
              </div>
            </div>
            <div class="tech-item">
              <div class="tech-icon">🔐</div>
              <div class="tech-content">
                <h4>安全可靠</h4>
                <p>JWT认证、速率限制、反爬虫、数据加密，多重安全防护</p>
              </div>
            </div>
            <div class="tech-item">
              <div class="tech-icon">📱</div>
              <div class="tech-content">
                <h4>多端支持</h4>
                <p>PC网页版 + 手机App，数据实时同步，随时随地办公</p>
              </div>
            </div>
            <div class="tech-item">
              <div class="tech-icon">🎨</div>
              <div class="tech-content">
                <h4>简洁易用</h4>
                <p>界面简洁美观，操作直观便捷，老年人也能轻松上手</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 支持平台 -->
      <div class="section">
        <div class="section-header">
          <span class="section-icon">💻</span>
          <h2>支持平台</h2>
        </div>
        <div class="section-body">
          <div class="platform-cards">
            <div class="platform-card">
              <div class="platform-icon">💻</div>
              <h3>PC端网页版</h3>
              <p>功能完整，适合日常办公</p>
              <ul>
                <li>✅ 完整的{{ itemName }}管理功能</li>
                <li>✅ 详细的数据报表</li>
                <li>✅ 系统配置管理</li>
                <li>✅ 用户权限管理</li>
              </ul>
            </div>
            <div class="platform-card">
              <div class="platform-icon">📱</div>
              <h3>手机App</h3>
              <p>随时随地，移动办公</p>
              <ul>
                <li>✅ 扫码快速查询</li>
                <li>✅ 移动入库出库</li>
                <li>✅ 预警消息推送</li>
                <li>✅ 离线数据缓存</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 更新日志 -->
      <div class="section">
        <div class="section-header">
          <span class="section-icon">📝</span>
          <h2>更新日志</h2>
        </div>
        <div class="section-body">
          <el-timeline>
            <el-timeline-item timestamp="2025-12-20" placement="top" type="primary">
              <div class="timeline-card">
                <h4>v6.0.2 - 界面优化</h4>
                <ul>
                  <li>全新首页布局，自定义导航栏</li>
                  <li>新增首页快捷搜索功能</li>
                  <li>优化TabBar图标为线条风格</li>
                  <li>优化数据加载为静默刷新</li>
                </ul>
              </div>
            </el-timeline-item>
            <el-timeline-item timestamp="2025-12-18" placement="top">
              <div class="timeline-card">
                <h4>v4.0.1 - 功能优化</h4>
                <ul>
                  <li>新增系统配置中心，集中管理所有配置</li>
                  <li>新增使用教程页面</li>
                  <li>优化预警重新提醒功能</li>
                  <li>优化库存筛选功能</li>
                </ul>
              </div>
            </el-timeline-item>
            <el-timeline-item timestamp="2025-12-15" placement="top">
              <div class="timeline-card">
                <h4>v4.0.0 - 重大更新</h4>
                <ul>
                  <li>新增短信验证码登录</li>
                  <li>新增预警自动清理功能</li>
                  <li>新增已读预警重新提醒</li>
                  <li>优化界面设计</li>
                </ul>
              </div>
            </el-timeline-item>
            <el-timeline-item timestamp="2025-11-01" placement="top">
              <div class="timeline-card">
                <h4>v3.0.0 - 功能完善</h4>
                <ul>
                  <li>新增OCR智能识别</li>
                  <li>新增补货建议功能</li>
                  <li>优化移动端体验</li>
                </ul>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>

      <!-- 免责声明 -->
      <div class="section disclaimer-section">
        <div class="section-header">
          <span class="section-icon">⚠️</span>
          <h2>免责声明</h2>
        </div>
        <div class="section-body">
          <div class="disclaimer-box">
            <div class="disclaimer-icon">⚠️</div>
            <div class="disclaimer-content">
              <p><strong>重要提示：</strong></p>
              <ul>
                <li>本系统仅用于辅助{{ itemName }}库存管理，<strong>无任何收银交易功能</strong></li>
                <li>本系统仅供个人学习研究使用，<strong>不可用于商业用途</strong></li>
                <li>使用本系统产生的任何问题，开发者不承担任何责任</li>
                <li>{{ itemName }}管理涉及安全问题，请以实际库存为准</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 联系我们 -->
      <div class="section">
        <div class="section-header">
          <span class="section-icon">📧</span>
          <h2>联系我们</h2>
        </div>
        <div class="section-body">
          <div class="contact-info">
            <div class="contact-item">
              <span class="contact-icon">📧</span>
              <span class="contact-label">技术支持</span>
              <span class="contact-value">support@medicine-admin.com</span>
            </div>
            <div class="contact-item">
              <span class="contact-icon">🌐</span>
              <span class="contact-label">官方网站</span>
              <span class="contact-value">www.medicine-admin.com</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部版权 -->
      <div class="footer">
        <p class="copyright">© 2025-2026 智管云 All Rights Reserved</p>
        <p class="made-with">Made with ❤️ by ZhiGuanYun Team</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useMode } from '@/composables/useMode'

const { itemName, modeIcon } = useMode()
</script>


<style scoped lang="scss">
.about-page {
  .main-card {
    :deep(.el-card__body) {
      padding: 0;
    }
  }
}

.hero-section {
  position: relative;
  padding: 60px 40px;
  text-align: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #14b8a6 100%);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
}

.hero-content {
  position: relative;
  z-index: 1;
}

.app-logo {
  font-size: 80px;
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.app-name {
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.app-slogan {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 24px;
}

.version-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 20px;
  border-radius: 24px;
  backdrop-filter: blur(10px);
  
  .version-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }
  
  .version-number {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
  }
}

.section {
  padding: 40px;
  border-bottom: 1px solid #f0f2f5;
  
  &:last-of-type {
    border-bottom: none;
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  
  .section-icon {
    font-size: 28px;
  }
  
  h2 {
    font-size: 22px;
    font-weight: 700;
    color: #303133;
    margin: 0;
  }
}

.intro-card {
  background: linear-gradient(135deg, rgba(14, 116, 144, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%);
  border-radius: 16px;
  padding: 24px;
  border-left: 4px solid #0e7490;
}

.intro-text {
  font-size: 16px;
  line-height: 1.8;
  color: #606266;
  margin: 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  background: #f8f9fc;
  border-radius: 16px;
  padding: 28px;
  text-align: center;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.15);
  }
  
  .feature-icon-wrap {
    width: 72px;
    height: 72px;
    margin: 0 auto 16px;
    background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .feature-icon {
    font-size: 36px;
  }
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px;
  }
  
  p {
    font-size: 14px;
    color: #909399;
    margin: 0;
    line-height: 1.6;
  }
}

.tech-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.tech-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #f8f9fc;
  border-radius: 12px;
  
  .tech-icon {
    font-size: 32px;
    flex-shrink: 0;
  }
  
  .tech-content {
    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 4px;
    }
    
    p {
      font-size: 14px;
      color: #909399;
      margin: 0;
    }
  }
}

.platform-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.platform-card {
  background: #f8f9fc;
  border-radius: 16px;
  padding: 28px;
  text-align: center;
  
  .platform-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }
  
  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px;
  }
  
  > p {
    font-size: 14px;
    color: #909399;
    margin: 0 0 16px;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    text-align: left;
    
    li {
      padding: 8px 0;
      font-size: 14px;
      color: #606266;
      border-bottom: 1px dashed #e4e7ed;
      
      &:last-child {
        border-bottom: none;
      }
    }
  }
}

.timeline-card {
  background: #f8f9fc;
  border-radius: 12px;
  padding: 16px 20px;
  
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 12px;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      font-size: 14px;
      color: #606266;
      padding: 4px 0;
      
      &::before {
        content: '•';
        color: #0e7490;
        margin-right: 8px;
      }
    }
  }
}

.disclaimer-section {
  background: #fff8e6;
}

.disclaimer-box {
  display: flex;
  gap: 20px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #ffeeba;
  
  .disclaimer-icon {
    font-size: 40px;
    flex-shrink: 0;
  }
  
  .disclaimer-content {
    p {
      font-size: 16px;
      color: #856404;
      margin: 0 0 12px;
    }
    
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      
      li {
        font-size: 14px;
        color: #856404;
        padding: 6px 0;
        
        &::before {
          content: '⚠️';
          margin-right: 8px;
        }
      }
    }
  }
}

.contact-info {
  display: flex;
  gap: 40px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: #f8f9fc;
  border-radius: 12px;
  
  .contact-icon {
    font-size: 24px;
  }
  
  .contact-label {
    font-size: 14px;
    color: #909399;
  }
  
  .contact-value {
    font-size: 15px;
    font-weight: 500;
    color: #303133;
  }
}

.footer {
  text-align: center;
  padding: 40px;
  background: #f8f9fc;
  
  .copyright {
    font-size: 14px;
    color: #909399;
    margin: 0 0 8px;
  }
  
  .made-with {
    font-size: 13px;
    color: #c0c4cc;
    margin: 0;
  }
}
</style>
