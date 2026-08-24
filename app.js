/**
 * JoJo AI Toolbox - 静态版本主脚本
 * 数据驱动，从 config.json 加载配置
 */

// 全局配置
let config = null;
let activeTag = null;

/**
 * 初始化应用
 */
async function init() {
  try {
    // 加载配置
    const response = await fetch('config.json');
    config = await response.json();

    // 设置页面标题
    document.title = config.title || 'JoJo AI Toolbox';

    // 初始化各个模块
    initStarryBackground();
    initAvatar();
    initContentText();
    initFilterButtons();
    initToolsGrid();
    initModal();

  } catch (error) {
    console.error('加载配置失败:', error);
    document.body.innerHTML = '<div style="text-align:center;padding:50px;color:#fff;">加载失败，请检查 config.json 文件</div>';
  }
}

/**
 * 初始化星空背景
 */
function initStarryBackground() {
  const container = document.getElementById('starry-bg');
  const starCount = 150;

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.width = `${Math.random() > 0.8 ? 3 : 2}px`;
    star.style.height = star.style.width;
    star.style.animationDelay = `${Math.random() * 3}s`;
    star.style.animationDuration = `${2 + Math.random() * 2}s`;
    container.appendChild(star);
  }
}

/**
 * 初始化头像区域
 */
function initAvatar() {
  const container = document.getElementById('avatar-container');
  const avatarImg = document.getElementById('avatar-img');
  const floatingText = document.getElementById('floating-text');

  // 设置头像
  if (config.avatar.url) {
    avatarImg.src = config.avatar.url;
  }

  // 设置漂浮文字
  floatingText.textContent = config.floatingText.text;

  // 点击打开弹窗
  container.addEventListener('click', openModal);
}

/**
 * 初始化正文内容
 */
function initContentText() {
  const contentSection = document.getElementById('content-text');
  if (config.contentText) {
    // 将换行转换为段落，支持空行分隔
    const paragraphs = config.contentText.split('\n').map(p => p.trim());
    contentSection.innerHTML = paragraphs.map(p => p ? `<p style="text-indent:0">${p}</p>` : '<br>').join('');
  }
}

/**
 * 初始化筛选按钮
 */
function initFilterButtons() {
  const container = document.getElementById('filter-buttons');

  config.filterTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = tag.name;
    btn.dataset.tagId = tag.id;

    // 默认选中"全部"
    if (tag.name === '全部') {
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => {
      // 更新激活状态
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 筛选模块
      activeTag = tag.name === '全部' ? null : tag.id;
      renderToolsGrid();
    });

    container.appendChild(btn);
  });
}

/**
 * 初始化工具网格
 */
function initToolsGrid() {
  renderToolsGrid();
}

/**
 * 渲染工具网格
 */
function renderToolsGrid() {
  const container = document.getElementById('tools-grid');
  container.innerHTML = '';

  // 筛选模块
  const filteredModules = activeTag
    ? config.modules.filter(m => m.tags.includes(activeTag))
    : config.modules;

  if (filteredModules.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#888;padding:40px;">暂无符合条件的工具</div>';
    return;
  }

  filteredModules.forEach(module => {
    const card = createToolCard(module);
    container.appendChild(card);
  });
}

/**
 * 创建工具卡片
 */
function createToolCard(module) {
  const card = document.createElement('div');
  card.className = 'tool-card';

  // 图片区域
  const imageDiv = document.createElement('div');
  imageDiv.className = 'tool-image';

  if (module.imageUrl) {
    const img = document.createElement('img');
    img.src = module.imageUrl;
    img.alt = module.title;
    imageDiv.appendChild(img);
  } else {
    const placeholder = document.createElement('span');
    placeholder.className = 'tool-placeholder';
    placeholder.textContent = '图片占位';
    imageDiv.appendChild(placeholder);
  }

  // 标题
  const title = document.createElement('div');
  title.className = 'tool-title';
  title.textContent = module.title;

  // 描述
  const desc = document.createElement('div');
  desc.className = 'tool-desc';
  desc.textContent = module.description;

  card.appendChild(imageDiv);
  card.appendChild(title);
  card.appendChild(desc);

  // 点击跳转
  card.addEventListener('click', () => {
    if (module.link && module.link !== '#') {
      window.open(module.link, '_blank');
    }
  });

  return card;
}

/**
 * 初始化弹窗
 */
function initModal() {
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');
  const copyBtn = document.getElementById('copy-btn');

  // 设置弹窗内容
  document.getElementById('modal-title').textContent = config.wechatModal.title;
  document.getElementById('account-input').value = config.wechatModal.accountName;

  const qrImg = document.getElementById('qr-code');
  if (config.wechatModal.qrCodeUrl) {
    qrImg.src = config.wechatModal.qrCodeUrl;
  }

  // 关闭弹窗
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // 复制功能
  copyBtn.addEventListener('click', async () => {
    const accountName = config.wechatModal.accountName;

    try {
      await navigator.clipboard.writeText(accountName);
      showCopySuccess();
    } catch {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = accountName;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showCopySuccess();
    }
  });
}

/**
 * 显示复制成功提示
 */
function showCopySuccess() {
  const copyBtn = document.getElementById('copy-btn');
  const copyTip = document.getElementById('copy-tip');

  copyBtn.classList.add('copied');
  copyBtn.textContent = '已复制';
  copyTip.textContent = '已复制到剪贴板';

  setTimeout(() => {
    copyBtn.classList.remove('copied');
    copyBtn.textContent = '复制';
    copyTip.textContent = '';
  }, 2000);
}

/**
 * 打开弹窗
 */
function openModal() {
  document.getElementById('modal-overlay').classList.add('active');
}

/**
 * 关闭弹窗
 */
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

// 启动应用
document.addEventListener('DOMContentLoaded', init);
