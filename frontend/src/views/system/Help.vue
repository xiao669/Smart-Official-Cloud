<template>
  <div class="help-page">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span class="title">📖 系统使用教程</span>
          <span class="subtitle">详细了解智管云系统的各项功能</span>
        </div>
      </template>

      <div class="help-content">
        <!-- 目录导航 -->
        <div class="toc-sidebar">
          <div class="toc-title">📑 目录</div>
          <div class="toc-list">
            <div 
              v-for="section in sections" 
              :key="section.id"
              class="toc-item"
              :class="{ active: activeSection === section.id }"
              @click="scrollToSection(section.id)"
            >
              <span class="toc-icon">{{ section.icon }}</span>
              <span class="toc-text">{{ section.title }}</span>
            </div>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="content-area" ref="contentRef">
          <!-- 系统概述 -->
          <section id="overview" class="help-section">
            <div class="section-header">
              <span class="section-icon">🏠</span>
              <h2>系统概述</h2>
            </div>
            <div class="section-body">
              <div class="intro-box">
                <p class="intro-text">
                  <strong>智管云</strong> 是一款专为{{ itemName }}管理设计的库存管理软件，
                  帮助您轻松管理{{ itemName }}信息、库存出入库、有效期预警等日常工作。
                </p>
              </div>
              
              <div class="feature-overview">
                <h3>🌟 核心功能</h3>
                <div class="feature-cards">
                  <div class="feature-card">
                    <div class="card-icon">{{ modeIcon }}</div>
                    <div class="card-title">{{ itemName }}管理</div>
                    <div class="card-desc">添加、编辑、删除{{ itemName }}信息</div>
                  </div>
                  <div class="feature-card">
                    <div class="card-icon">📦</div>
                    <div class="card-title">库存管理</div>
                    <div class="card-desc">入库、出库、库存查询</div>
                  </div>
                  <div class="feature-card">
                    <div class="card-icon">🔔</div>
                    <div class="card-title">预警管理</div>
                    <div class="card-desc">临期、过期、低库存预警</div>
                  </div>
                  <div class="feature-card">
                    <div class="card-icon">📊</div>
                    <div class="card-title">报表统计</div>
                    <div class="card-desc">数据分析、报表导出</div>
                  </div>
                </div>
              </div>

              <div class="platform-info">
                <h3>📱 支持平台</h3>
                <div class="platform-list">
                  <div class="platform-item">
                    <span class="platform-icon">💻</span>
                    <span class="platform-name">PC端网页版</span>
                    <span class="platform-desc">功能完整，适合日常办公</span>
                  </div>
                  <div class="platform-item">
                    <span class="platform-icon">📱</span>
                    <span class="platform-name">手机App</span>
                    <span class="platform-desc">随时随地，移动办公</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 登录说明 -->
          <section id="login" class="help-section">
            <div class="section-header">
              <span class="section-icon">🔐</span>
              <h2>登录说明</h2>
            </div>
            <div class="section-body">
              <div class="step-guide">
                <h3>登录方式</h3>
                <p>系统支持两种登录方式：</p>
                
                <div class="login-methods">
                  <div class="method-card">
                    <div class="method-header">
                      <span class="method-icon">👤</span>
                      <span class="method-title">账号密码登录</span>
                    </div>
                    <div class="method-steps">
                      <div class="step">
                        <span class="step-num">1</span>
                        <span class="step-text">输入用户名</span>
                      </div>
                      <div class="step">
                        <span class="step-num">2</span>
                        <span class="step-text">输入密码</span>
                      </div>
                      <div class="step">
                        <span class="step-num">3</span>
                        <span class="step-text">点击"登录"按钮</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="method-card">
                    <div class="method-header">
                      <span class="method-icon">📱</span>
                      <span class="method-title">短信验证码登录</span>
                    </div>
                    <div class="method-steps">
                      <div class="step">
                        <span class="step-num">1</span>
                        <span class="step-text">切换到"验证码登录"标签</span>
                      </div>
                      <div class="step">
                        <span class="step-num">2</span>
                        <span class="step-text">输入已注册的手机号</span>
                      </div>
                      <div class="step">
                        <span class="step-num">3</span>
                        <span class="step-text">点击"获取验证码"</span>
                      </div>
                      <div class="step">
                        <span class="step-num">4</span>
                        <span class="step-text">输入收到的验证码并登录</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="tip-box warning">
                  <span class="tip-icon">⚠️</span>
                  <div class="tip-content">
                    <strong>注意：</strong>验证码有效期为5分钟，最多可尝试5次。
                    如果手机号未在系统中注册，将无法收到验证码。
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 药品管理 -->
          <section id="medicine" class="help-section">
            <div class="section-header">
              <span class="section-icon">{{ modeIcon }}</span>
              <h2>{{ itemName }}管理</h2>
            </div>
            <div class="section-body">
              <h3>功能入口</h3>
              <p>点击左侧菜单 <strong>"{{ itemName }}管理"</strong> 进入{{ itemName }}管理页面。</p>

              <div class="function-list">
                <div class="function-item">
                  <div class="function-header">
                    <span class="function-icon">➕</span>
                    <span class="function-title">添加{{ itemName }}</span>
                  </div>
                  <div class="function-body">
                    <ol class="step-list">
                      <li>点击页面右上角 <el-tag type="primary" size="small">添加{{ itemName }}</el-tag> 按钮</li>
                      <li>填写{{ itemName }}信息：
                        <ul>
                          <li><strong>{{ itemName }}编码</strong>（必填）：唯一标识，如 YP001</li>
                          <li><strong>{{ itemName }}名称</strong>（必填）：如 阿莫西林胶囊</li>
                          <li><strong>分类</strong>（必填）：选择{{ itemName }}分类</li>
                          <li><strong>规格</strong>：如 0.25g*24粒</li>
                          <li><strong>单位</strong>（必填）：如 盒、瓶</li>
                          <li><strong>生产厂家</strong>：{{ itemName }}生产企业</li>
                        </ul>
                      </li>
                      <li>点击 <el-tag type="primary" size="small">确定</el-tag> 保存</li>
                    </ol>
                  </div>
                </div>

                <div class="function-item">
                  <div class="function-header">
                    <span class="function-icon">📥</span>
                    <span class="function-title">批量导入</span>
                  </div>
                  <div class="function-body">
                    <ol class="step-list">
                      <li>点击 <el-tag size="small">下载模板</el-tag> 获取Excel模板</li>
                      <li>按模板格式填写{{ itemName }}信息</li>
                      <li>点击 <el-tag type="success" size="small">导入</el-tag> 上传Excel文件</li>
                    </ol>
                    <div class="tip-box info">
                      <span class="tip-icon">💡</span>
                      <div class="tip-content">
                        模板中带 * 号的列为必填项，{{ itemName }}编码不能重复。
                      </div>
                    </div>
                  </div>
                </div>

                <div class="function-item">
                  <div class="function-header">
                    <span class="function-icon">🗑️</span>
                    <span class="function-title">删除{{ itemName }}</span>
                  </div>
                  <div class="function-body">
                    <p>删除规则：</p>
                    <ul>
                      <li><el-tag type="success" size="small">可删除</el-tag> 过期或临期{{ itemName }}（无论库存多少）</li>
                      <li><el-tag type="danger" size="small">需清空库存</el-tag> 正常{{ itemName }}必须库存为0才能删除</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 库存管理 -->
          <section id="inventory" class="help-section">
            <div class="section-header">
              <span class="section-icon">📦</span>
              <h2>库存管理</h2>
            </div>
            <div class="section-body">
              <h3>功能入口</h3>
              <p>点击左侧菜单 <strong>"库存管理"</strong> 进入库存管理页面。</p>

              <div class="inventory-stats">
                <h3>📊 库存统计</h3>
                <p>页面顶部显示库存统计信息：</p>
                <div class="stat-explain">
                  <div class="stat-item">
                    <span class="stat-badge total">总库存</span>
                    <span class="stat-desc">所有{{ itemName }}的库存总数</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-badge normal">正常</span>
                    <span class="stat-desc">有效期 > 90天的批次数量</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-badge warning">临期</span>
                    <span class="stat-desc">有效期 ≤ 90天的批次数量</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-badge danger">过期</span>
                    <span class="stat-desc">已过期的批次数量</span>
                  </div>
                </div>
              </div>

              <div class="function-list">
                <div class="function-item">
                  <div class="function-header">
                    <span class="function-icon">📥</span>
                    <span class="function-title">入库操作</span>
                  </div>
                  <div class="function-body">
                    <ol class="step-list">
                      <li>点击 <el-tag type="primary" size="small">入库</el-tag> 按钮</li>
                      <li>选择要入库的{{ itemName }}</li>
                      <li>填写批次信息：
                        <ul>
                          <!-- <li><strong>批次号</strong>：{{ itemName }}批次编号</li> -->
                          <li><strong>数量</strong>：入库数量</li>
                          <li><strong>生产日期</strong>：{{ itemName }}生产日期</li>
                          <li><strong>有效期</strong>：{{ itemName }}有效期至</li>
                        </ul>
                      </li>
                      <li>点击确定完成入库</li>
                    </ol>
                  </div>
                </div>

                <div class="function-item">
                  <div class="function-header">
                    <span class="function-icon">📤</span>
                    <span class="function-title">出库操作</span>
                  </div>
                  <div class="function-body">
                    <ol class="step-list">
                      <li>在库存列表中找到要出库的批次</li>
                      <li>点击该行的 <el-tag type="warning" size="small">出库</el-tag> 按钮</li>
                      <li>填写出库信息：
                        <ul>
                          <li><strong>出库数量</strong>：不能超过当前库存</li>
                          <li><strong>出库原因</strong>：销售/报损/过期销毁/其他</li>
                          <li><strong>领用人</strong>：可选填写</li>
                        </ul>
                      </li>
                      <li>点击确定完成出库</li>
                    </ol>
                  </div>
                </div>

                <div class="function-item">
                  <div class="function-header">
                    <span class="function-icon">🔍</span>
                    <span class="function-title">筛选查询</span>
                  </div>
                  <div class="function-body">
                    <ul>
                      <li><strong>搜索框</strong>：输入{{ itemName }}名称、编码快速搜索</li>
                      <li><strong>状态筛选</strong>：按正常/临期/过期筛选</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 预警管理 -->
          <section id="warning" class="help-section">
            <div class="section-header">
              <span class="section-icon">🔔</span>
              <h2>预警管理</h2>
            </div>
            <div class="section-body">
              <h3>预警类型</h3>
              <div class="warning-types">
                <div class="warning-type">
                  <el-tag type="danger" effect="dark">过期预警</el-tag>
                  <span class="type-desc">{{ itemName }}已过有效期</span>
                </div>
                <div class="warning-type">
                  <el-tag type="warning" effect="dark">临期预警</el-tag>
                  <span class="type-desc">{{ itemName }}即将过期（默认30天内）</span>
                </div>
                <div class="warning-type">
                  <el-tag type="info" effect="dark">低库存预警</el-tag>
                  <span class="type-desc">库存低于阈值（默认10件）</span>
                </div>
              </div>

              <h3>预警处理流程</h3>
              <div class="flow-diagram">
                <div class="flow-step">
                  <div class="flow-num">1</div>
                  <div class="flow-content">
                    <div class="flow-title">生成预警</div>
                    <div class="flow-desc">系统自动检测</div>
                  </div>
                </div>
                <div class="flow-arrow">→</div>
                <div class="flow-step">
                  <div class="flow-num">2</div>
                  <div class="flow-content">
                    <div class="flow-title">查看处理</div>
                    <div class="flow-desc">标记为已读</div>
                  </div>
                </div>
                <div class="flow-arrow">→</div>
                <div class="flow-step">
                  <div class="flow-num">3</div>
                  <div class="flow-content">
                    <div class="flow-title">重新提醒</div>
                    <div class="flow-desc">N天后未处理</div>
                  </div>
                </div>
                <div class="flow-arrow">→</div>
                <div class="flow-step">
                  <div class="flow-num">4</div>
                  <div class="flow-content">
                    <div class="flow-title">自动清理</div>
                    <div class="flow-desc">30天后删除</div>
                  </div>
                </div>
              </div>

              <h3>操作说明</h3>
              <ul class="action-list">
                <li><el-tag type="primary" size="small">手动检查</el-tag> 立即检查所有{{ itemName }}状态</li>
                <li><el-tag type="success" size="small">一键已读</el-tag> 将所有未读预警标记为已读</li>
                <li><el-tag type="warning" size="small">清理预警</el-tag> 清理已读或过期预警</li>
                <li><el-tag size="small">预警配置</el-tag> 设置预警阈值和提醒规则</li>
              </ul>
            </div>
          </section>

          <!-- 系统配置 -->
          <section id="settings" class="help-section">
            <div class="section-header">
              <span class="section-icon">⚙️</span>
              <h2>系统配置</h2>
            </div>
            <div class="section-body">
              <h3>功能入口</h3>
              <p>点击左侧菜单 <strong>"系统管理" → "系统配置"</strong></p>

              <div class="config-explain">
                <h3>可配置项</h3>
                <table class="config-table">
                  <thead>
                    <tr>
                      <th>配置项</th>
                      <th>说明</th>
                      <th>默认值</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>临期预警天数</td>
                      <td>有效期剩余多少天触发临期预警</td>
                      <td>30天</td>
                    </tr>
                    <tr>
                      <td>低库存阈值</td>
                      <td>库存低于多少触发低库存预警</td>
                      <td>10件</td>
                    </tr>
                    <tr>
                      <td>重新提醒</td>
                      <td>已读预警多少天后重新提醒</td>
                      <td>3天</td>
                    </tr>
                    <tr>
                      <td>自动清理</td>
                      <td>多少天前的已读预警自动删除</td>
                      <td>30天</td>
                    </tr>
                    <tr>
                      <td>临期阈值</td>
                      <td>有效期多少天内算临期</td>
                      <td>90天</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- 用户管理 -->
          <section id="users" class="help-section">
            <div class="section-header">
              <span class="section-icon">👥</span>
              <h2>用户管理</h2>
            </div>
            <div class="section-body">
              <div class="tip-box warning">
                <span class="tip-icon">⚠️</span>
                <div class="tip-content">
                  <strong>权限说明：</strong>只有管理员账号才能访问用户管理功能。
                </div>
              </div>

              <h3>用户类型</h3>
              <div class="user-types">
                <div class="user-type">
                  <el-tag type="danger">管理员</el-tag>
                  <span class="type-desc">拥有所有权限，可管理用户</span>
                </div>
                <div class="user-type">
                  <el-tag type="primary">操作员</el-tag>
                  <span class="type-desc">日常操作权限，不能管理用户</span>
                </div>
              </div>

              <h3>添加用户</h3>
              <ul>
                <li><el-tag type="primary" size="small">添加用户</el-tag> 创建账号密码用户</li>
                <li><el-tag type="success" size="small">添加手机号用户</el-tag> 只需手机号，自动生成账号密码</li>
              </ul>
            </div>
          </section>

          <!-- App使用 -->
          <section id="app" class="help-section">
            <div class="section-header">
              <span class="section-icon">📱</span>
              <h2>手机App使用</h2>
            </div>
            <div class="section-body">
              <h3>App功能</h3>
              <div class="app-features">
                <div class="app-feature">
                  <span class="feature-icon">🏠</span>
                  <span class="feature-name">首页</span>
                  <span class="feature-desc">查看库存统计和预警信息</span>
                </div>
                <div class="app-feature">
                  <span class="feature-icon">{{ modeIcon }}</span>
                  <span class="feature-name">{{ itemName }}</span>
                  <span class="feature-desc">浏览{{ itemName }}列表和详情</span>
                </div>
                <div class="app-feature">
                  <span class="feature-icon">📷</span>
                  <span class="feature-name">扫码</span>
                  <span class="feature-desc">扫描条形码快速查询</span>
                </div>
                <div class="app-feature">
                  <span class="feature-icon">➕</span>
                  <span class="feature-name">入库</span>
                  <span class="feature-desc">快速入库操作</span>
                </div>
                <div class="app-feature">
                  <span class="feature-icon">⚙️</span>
                  <span class="feature-name">设置</span>
                  <span class="feature-desc">账号设置和系统配置</span>
                </div>
              </div>

              <h3>登录方式</h3>
              <p>App同样支持账号密码和短信验证码两种登录方式。</p>
            </div>
          </section>

          <!-- 常见问题 -->
          <section id="faq" class="help-section">
            <div class="section-header">
              <span class="section-icon">❓</span>
              <h2>常见问题</h2>
            </div>
            <div class="section-body">
              <el-collapse>
                <el-collapse-item title="Q: 忘记密码怎么办？" name="1">
                  <p>可以使用手机号验证码登录，或联系管理员重置密码。</p>
                </el-collapse-item>
                <el-collapse-item title="Q: 为什么收不到验证码？" name="2">
                  <p>请确认：1) 手机号已在系统中注册；2) 手机信号正常；3) 未被运营商拦截。</p>
                </el-collapse-item>
                <el-collapse-item :title="`Q: ${itemName}删除不了怎么办？`" name="3">
                  <p>正常状态的{{ itemName }}需要先清空库存才能删除。过期或临期{{ itemName }}可以直接删除。</p>
                </el-collapse-item>
                <el-collapse-item title="Q: 预警太多怎么处理？" name="4">
                  <p>可以使用"一键已读"标记所有预警，或使用"清理预警"批量删除。</p>
                </el-collapse-item>
                <el-collapse-item title="Q: 如何修改预警阈值？" name="5">
                  <p>进入"系统管理" → "系统配置"，可以修改临期天数和低库存阈值。</p>
                </el-collapse-item>
              </el-collapse>
            </div>
          </section>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useMode } from '@/composables/useMode'

const { itemName, modeIcon } = useMode()

const activeSection = ref('overview')
const contentRef = ref<HTMLElement>()

// 动态生成目录，根据场景替换术语
const sections = computed(() => [
  { id: 'overview', title: '系统概述', icon: '🏠' },
  { id: 'login', title: '登录说明', icon: '🔐' },
  { id: 'medicine', title: `${itemName.value}管理`, icon: modeIcon.value },
  { id: 'inventory', title: '库存管理', icon: '📦' },
  { id: 'warning', title: '预警管理', icon: '🔔' },
  { id: 'settings', title: '系统配置', icon: '⚙️' },
  { id: 'users', title: '用户管理', icon: '👥' },
  { id: 'app', title: 'App使用', icon: '📱' },
  { id: 'faq', title: '常见问题', icon: '❓' }
])

function scrollToSection(id: string) {
  activeSection.value = id
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function handleScroll() {
  if (!contentRef.value) return
  
  const scrollTop = contentRef.value.scrollTop
  
  for (const section of sections.value) {
    const element = document.getElementById(section.id)
    if (element) {
      const offsetTop = element.offsetTop - 100
      const offsetBottom = offsetTop + element.offsetHeight
      
      if (scrollTop >= offsetTop && scrollTop < offsetBottom) {
        activeSection.value = section.id
        break
      }
    }
  }
}

onMounted(() => {
  contentRef.value?.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  contentRef.value?.removeEventListener('scroll', handleScroll)
})
</script>


<style scoped lang="scss">
.help-page {
  .main-card {
    :deep(.el-card__header) {
      background: linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #14b8a6 100%);
      border-bottom: none;
      padding: 20px 24px;
    }
    :deep(.el-card__body) {
      padding: 0;
    }
  }
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  .title { font-size: 22px; font-weight: 700; color: #fff; }
  .subtitle { font-size: 14px; color: rgba(255, 255, 255, 0.8); }
}

.help-content {
  display: flex;
  min-height: 600px;
}

.toc-sidebar {
  width: 220px;
  background: #f8f9fc;
  border-right: 1px solid #e4e7ed;
  padding: 20px 0;
  position: sticky;
  top: 0;
  height: fit-content;
}

.toc-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  padding: 0 20px 16px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 12px;
}

.toc-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 3px solid transparent;
  
  &:hover {
    background: #e8e9eb;
  }
  
  &.active {
    background: linear-gradient(90deg, rgba(14, 116, 144, 0.15) 0%, transparent 100%);
    border-left-color: #0e7490;
    .toc-text { color: #0e7490; font-weight: 600; }
  }
  
  .toc-icon { font-size: 16px; }
  .toc-text { font-size: 14px; color: #606266; }
}

.content-area {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
  max-height: 80vh;
}

.help-section {
  margin-bottom: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid #e4e7ed;
  
  &:last-child {
    border-bottom: none;
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  
  .section-icon { font-size: 28px; }
  h2 { font-size: 22px; font-weight: 700; color: #303133; margin: 0; }
}

.section-body {
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 24px 0 12px;
    padding-left: 12px;
    border-left: 3px solid #0e7490;
  }
  
  p { font-size: 15px; color: #606266; line-height: 1.8; margin: 8px 0; }
  ul, ol { padding-left: 24px; color: #606266; line-height: 2; }
}

.intro-box {
  background: linear-gradient(135deg, rgba(14, 116, 144, 0.15) 0%, rgba(20, 184, 166, 0.15) 100%);
  border-radius: 12px;
  padding: 24px;
  border-left: 4px solid #0e7490;
  
  .intro-text { font-size: 16px; line-height: 1.8; margin: 0; }
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.feature-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
  
  .card-icon { font-size: 36px; margin-bottom: 12px; }
  .card-title { font-size: 15px; font-weight: 600; color: #303133; }
  .card-desc { font-size: 13px; color: #909399; margin-top: 4px; }
}

.platform-list {
  display: flex;
  gap: 24px;
  margin-top: 16px;
}

.platform-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: #f8f9fc;
  border-radius: 12px;
  flex: 1;
  
  .platform-icon { font-size: 32px; }
  .platform-name { font-size: 16px; font-weight: 600; color: #303133; }
  .platform-desc { font-size: 13px; color: #909399; margin-left: auto; }
}

.login-methods {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 16px;
}

.method-card {
  background: #f8f9fc;
  border-radius: 12px;
  padding: 20px;
  
  .method-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e7ed;
    
    .method-icon { font-size: 24px; }
    .method-title { font-size: 16px; font-weight: 600; color: #303133; }
  }
}

.method-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .step-num {
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
  }
  
  .step-text { font-size: 14px; color: #606266; }
}

.tip-box {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
  
  &.info {
    background: rgba(64, 158, 255, 0.1);
    border: 1px solid rgba(64, 158, 255, 0.3);
    .tip-icon { color: #409eff; }
  }
  
  &.warning {
    background: rgba(230, 162, 60, 0.1);
    border: 1px solid rgba(230, 162, 60, 0.3);
    .tip-icon { color: #e6a23c; }
  }
  
  .tip-icon { font-size: 20px; }
  .tip-content { font-size: 14px; color: #606266; line-height: 1.6; }
}

.function-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 16px;
}

.function-item {
  background: #f8f9fc;
  border-radius: 12px;
  overflow: hidden;
  
  .function-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    background: linear-gradient(90deg, rgba(14, 116, 144, 0.15) 0%, transparent 100%);
    border-bottom: 1px solid #e4e7ed;
    
    .function-icon { font-size: 20px; }
    .function-title { font-size: 15px; font-weight: 600; color: #303133; }
  }
  
  .function-body {
    padding: 16px 20px;
  }
}

.step-list {
  li {
    margin-bottom: 8px;
    ul { margin-top: 8px; }
  }
}

.stat-explain {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8f9fc;
  border-radius: 8px;
  
  .stat-badge {
    padding: 4px 12px;
    border-radius: 4px;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    
    &.total { background: #0e7490; }
    &.normal { background: #67c23a; }
    &.warning { background: #e6a23c; }
    &.danger { background: #f56c6c; }
  }
  
  .stat-desc { font-size: 13px; color: #606266; }
}

.warning-types, .user-types {
  display: flex;
  gap: 24px;
  margin-top: 12px;
}

.warning-type, .user-type {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .type-desc { font-size: 14px; color: #606266; }
}

.flow-diagram {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: #f8f9fc;
  border-radius: 12px;
  margin-top: 16px;
}

.flow-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  
  .flow-num {
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #0e7490 0%, #14b8a6 100%);
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
  }
  
  .flow-title { font-size: 14px; font-weight: 600; color: #303133; }
  .flow-desc { font-size: 12px; color: #909399; }
}

.flow-arrow { font-size: 20px; color: #c0c4cc; }

.action-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  
  li {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.config-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  
  th, td {
    padding: 12px 16px;
    text-align: left;
    border: 1px solid #e4e7ed;
  }
  
  th {
    background: #f8f9fc;
    font-weight: 600;
    color: #303133;
  }
  
  td { color: #606266; }
}

.app-features {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.app-feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: #f8f9fc;
  border-radius: 12px;
  text-align: center;
  
  .feature-icon { font-size: 32px; }
  .feature-name { font-size: 15px; font-weight: 600; color: #303133; }
  .feature-desc { font-size: 12px; color: #909399; }
}

:deep(.el-collapse) {
  border: none;
  
  .el-collapse-item__header {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    background: #f8f9fc;
    padding: 16px 20px;
    border-radius: 8px;
    margin-bottom: 8px;
  }
  
  .el-collapse-item__content {
    padding: 16px 20px;
    font-size: 14px;
    color: #606266;
  }
}
</style>
