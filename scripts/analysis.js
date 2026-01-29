// 导入天干地支五行映射（从 calendar.js）
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const WUXING_LIST = ['木', '火', '土', '金', '水'];

document.addEventListener('DOMContentLoaded', function () {
  const monthInput = document.getElementById('month-input');
  const analyzeBtn = document.getElementById('analyze-btn');

  // 设置默认月份为当前月份
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  monthInput.value = currentMonth;

  // 分析按钮点击事件
  analyzeBtn.addEventListener('click', analyzeMonth);
});

/**
 * 分析指定月份的运势数据
 */
async function analyzeMonth() {
  const monthInput = document.getElementById('month-input');
  const selectedMonth = monthInput.value; // 格式：YYYY-MM

  if (!selectedMonth) {
    showResults('<div class="error">请选择月份</div>');
    return;
  }

  showResults('<div class="loading">正在分析...</div>');

  try {
    // 等待 Supabase 客户端就绪
    await window.waitForSupabase();

    // 检查客户端是否存在
    if (!window.supabaseClient) {
      throw new Error('数据库连接未就绪，请刷新页面重试');
    }

    // 计算月份的开始和结束日期
    const [year, month] = selectedMonth.split('-').map(Number);
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0); // 获取该月最后一天
    const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    // 查询该月所有记录
    const { data, error } = await window.supabaseClient
      .from('journal_entries')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDateStr)
      .order('date', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      showResults(`<div class="no-data">📭 ${year}年${month}月暂无记录</div>`);
      return;
    }

    // 统计分析
    const analysis = analyzeData(data);

    // 显示结果
    displayAnalysisResults(year, month, data.length, analysis);

  } catch (error) {
    console.error('分析失败：', error);
    showResults(`<div class="error">分析失败：${error.message}</div>`);
  }
}

/**
 * 分析数据
 */
function analyzeData(records) {
  const analysis = {
    fortuneCount: { '吉': 0, '平': 0, '凶': 0 },
    fortunePillars: { '吉': [], '平': [], '凶': [] },
    tianganStats: { '吉': {}, '凶': {} },
    dizhiStats: { '吉': {}, '凶': {} },
    wuxingStats: { '吉': {}, '凶': {} }
  };

  // 初始化统计对象
  TIANGAN.forEach(gan => {
    analysis.tianganStats['吉'][gan] = 0;
    analysis.tianganStats['凶'][gan] = 0;
  });
  DIZHI.forEach(zhi => {
    analysis.dizhiStats['吉'][zhi] = 0;
    analysis.dizhiStats['凶'][zhi] = 0;
  });
  WUXING_LIST.forEach(wx => {
    analysis.wuxingStats['吉'][wx] = 0;
    analysis.wuxingStats['凶'][wx] = 0;
  });

  records.forEach(record => {
    const fortune = record.fortune;
    if (!fortune) return;

    // 统计运势数量
    analysis.fortuneCount[fortune]++;

    // 收集日柱
    analysis.fortunePillars[fortune].push(record.day_pillar);

    // 只统计吉日和凶日
    if (fortune === '吉' || fortune === '凶') {
      const dayPillar = record.day_pillar;
      const gan = dayPillar.charAt(0);
      const zhi = dayPillar.charAt(1);

      // 统计天干
      if (analysis.tianganStats[fortune][gan] !== undefined) {
        analysis.tianganStats[fortune][gan]++;
      }

      // 统计地支
      if (analysis.dizhiStats[fortune][zhi] !== undefined) {
        analysis.dizhiStats[fortune][zhi]++;
      }

      // 统计五行
      const ganWuxing = window.getWuxing(gan);
      const zhiWuxing = window.getWuxing(zhi);
      if (ganWuxing) analysis.wuxingStats[fortune][ganWuxing]++;
      if (zhiWuxing) analysis.wuxingStats[fortune][zhiWuxing]++;
    }
  });

  return analysis;
}

/**
 * 显示分析结果
 */
function displayAnalysisResults(year, month, totalRecords, analysis) {
  const html = `
    <div class="analysis-content">
      <h2>${year}年${month}月运势分析</h2>
      <p class="total-records">共记录 ${totalRecords} 天</p>
      
      <!-- 运势分布 -->
      <div class="stat-section">
        <h3>📊 运势分布</h3>
        <div class="fortune-distribution">
          <div class="fortune-item fortune-ji">
            <svg class="fortune-icon" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 13s1.5 2 4 2 4-2 4-2"/>
            </svg>
            <span class="fortune-name">吉</span>
            <span class="fortune-count">${analysis.fortuneCount['吉']} 天</span>
          </div>
          <div class="fortune-item fortune-ping">
            <svg class="fortune-icon" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <span class="fortune-name">平</span>
            <span class="fortune-count">${analysis.fortuneCount['平']} 天</span>
          </div>
          <div class="fortune-item fortune-xiong">
            <svg class="fortune-icon" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M16 14s-1.5-2-4-2-4 2-4 2"/>
            </svg>
            <span class="fortune-name">凶</span>
            <span class="fortune-count">${analysis.fortuneCount['凶']} 天</span>
          </div>
        </div>
      </div>
      
      <!-- 日柱统计 -->
      ${renderPillarStats('吉日的日柱', analysis.fortunePillars['吉'])}
      ${renderPillarStats('凶日的日柱', analysis.fortunePillars['凶'])}
      
      <!-- 天干统计 -->
      ${renderStats('天干统计（吉日）', analysis.tianganStats['吉'], TIANGAN)}
      ${renderStats('天干统计（凶日）', analysis.tianganStats['凶'], TIANGAN)}
      
      <!-- 地支统计 -->
      ${renderStats('地支统计（吉日）', analysis.dizhiStats['吉'], DIZHI)}
      ${renderStats('地支统计（凶日）', analysis.dizhiStats['凶'], DIZHI)}
      
      <!-- 五行统计 -->
      ${renderWuxingStats('五行统计（吉日）', analysis.wuxingStats['吉'])}
      ${renderWuxingStats('五行统计（凶日）', analysis.wuxingStats['凶'])}
      
      <!-- 智能提示 -->
      ${generateInsight(analysis)}
    </div>
  `;

  showResults(html);
}

/**
 * 渲染日柱统计
 */
function renderPillarStats(title, pillars) {
  if (pillars.length === 0) {
    return `
      <div class="stat-section">
        <h3>${title}</h3>
        <p class="no-data-text">暂无数据</p>
      </div>
    `;
  }

  // 统计每个日柱出现的次数
  const pillarCount = {};
  pillars.forEach(pillar => {
    pillarCount[pillar] = (pillarCount[pillar] || 0) + 1;
  });

  // 按次数排序
  const sorted = Object.entries(pillarCount).sort((a, b) => b[1] - a[1]);

  const items = sorted.map(([pillar, count]) => {
    const gan = pillar.charAt(0);
    const zhi = pillar.charAt(1);
    const ganColor = window.getWuxingColor(gan);
    const zhiColor = window.getWuxingColor(zhi);

    return `<span class="pillar-tag">
      <span style="color: ${ganColor}">${gan}</span><span style="color: ${zhiColor}">${zhi}</span>
      (${count}次)
    </span>`;
  }).join('');

  return `
    <div class="stat-section">
      <h3>${title}</h3>
      <div class="pillar-list">${items}</div>
    </div>
  `;
}

/**
 * 渲染通用统计（天干/地支）
 */
function renderStats(title, stats, list) {
  const items = list
    .filter(item => stats[item] > 0)
    .map(item => {
      const color = window.getWuxingColor(item);
      return `<span class="stat-tag">
        <span style="color: ${color}">${item}</span>: ${stats[item]}次
      </span>`;
    })
    .join('');

  if (!items) {
    return `
      <div class="stat-section">
        <h3>${title}</h3>
        <p class="no-data-text">暂无数据</p>
      </div>
    `;
  }

  return `
    <div class="stat-section">
      <h3>${title}</h3>
      <div class="stat-list">${items}</div>
    </div>
  `;
}

/**
 * 渲染五行统计
 */
function renderWuxingStats(title, stats) {
  const items = WUXING_LIST
    .map(wuxing => {
      const count = stats[wuxing] || 0;
      const color = window.WUXING_COLORS[wuxing];
      return `<span class="stat-tag">
        <span style="color: ${color}">${wuxing}</span>: ${count}次
      </span>`;
    })
    .join('');

  return `
    <div class="stat-section">
      <h3>${title}</h3>
      <div class="stat-list">${items}</div>
    </div>
  `;
}

/**
 * 生成智能提示（可复制的总结文字）
 */
function generateInsight(analysis) {
  // 生成可复制的纯文本总结
  const summaryText = generateSummaryText(analysis);

  return `
    <div class="insight-section">
      <h3>💡 AI 分析提示</h3>
      <p class="insight-description">已为您生成数据总结，您可以复制以下文字到 AI 软件（如 ChatGPT、Claude 等）配合您的具体元素进行深度分析：</p>
      <div class="copy-box">
        <div class="summary-text" id="summary-text">${summaryText}</div>
        <button class="copy-btn" onclick="copySummary()">📋 复制总结</button>
      </div>
      <p class="copy-hint">💡 提示：复制后可以补充您的出生年月日时等信息，让 AI 为您提供更精准的元素分析建议。</p>
    </div>
  `;
}

/**
 * 生成可复制的总结文字
 */
function generateSummaryText(analysis) {
  const lines = [];

  // 1. 运势总览
  const totalDays = analysis.fortuneCount['吉'] + analysis.fortuneCount['平'] + analysis.fortuneCount['凶'];
  lines.push(`根据我过去的运势记录（共${totalDays}天）：`);
  lines.push('');

  // 2. 运势分布
  if (totalDays > 0) {
    lines.push(`运势分布：吉日${analysis.fortuneCount['吉']}天，平日${analysis.fortuneCount['平']}天，凶日${analysis.fortuneCount['凶']}天。`);
    lines.push('');
  }

  // 3. 吉日分析
  if (analysis.fortuneCount['吉'] > 0) {
    lines.push('【吉日特征】');

    // 天干统计
    const jiTiangan = Object.entries(analysis.tianganStats['吉'])
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);

    if (jiTiangan.length > 0) {
      const top3Gan = jiTiangan.slice(0, 3).map(([gan, count]) => `${gan}日${count}次`).join('、');
      lines.push(`天干方面：${top3Gan}等运势较好。`);
    }

    // 地支统计
    const jiDizhi = Object.entries(analysis.dizhiStats['吉'])
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);

    if (jiDizhi.length > 0) {
      const top3Zhi = jiDizhi.slice(0, 3).map(([zhi, count]) => `${zhi}日${count}次`).join('、');
      lines.push(`地支方面：${top3Zhi}等运势较好。`);
    }

    // 五行统计
    const jiWuxing = Object.entries(analysis.wuxingStats['吉'])
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);

    if (jiWuxing.length > 0) {
      const top2Wx = jiWuxing.slice(0, 2).map(([wx, count]) => `${wx}${count}次`).join('、');
      lines.push(`五行方面：${top2Wx}出现较多。`);
    }

    lines.push('');
  }

  // 4. 凶日分析
  if (analysis.fortuneCount['凶'] > 0) {
    lines.push('【凶日特征】');

    // 天干统计
    const xiongTiangan = Object.entries(analysis.tianganStats['凶'])
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);

    if (xiongTiangan.length > 0) {
      const top3Gan = xiongTiangan.slice(0, 3).map(([gan, count]) => `${gan}日${count}次`).join('、');
      lines.push(`天干方面：${top3Gan}等运势较差。`);
    }

    // 地支统计
    const xiongDizhi = Object.entries(analysis.dizhiStats['凶'])
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);

    if (xiongDizhi.length > 0) {
      const top3Zhi = xiongDizhi.slice(0, 3).map(([zhi, count]) => `${zhi}日${count}次`).join('、');
      lines.push(`地支方面：${top3Zhi}等运势较差。`);
    }

    // 五行统计
    const xiongWuxing = Object.entries(analysis.wuxingStats['凶'])
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);

    if (xiongWuxing.length > 0) {
      const top2Wx = xiongWuxing.slice(0, 2).map(([wx, count]) => `${wx}${count}次`).join('、');
      lines.push(`五行方面：${top2Wx}出现较多。`);
    }

    lines.push('');
  }

  // 5. 总结建议
  const jiWuxingTop = Object.entries(analysis.wuxingStats['吉'])
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])[0];

  const xiongWuxingTop = Object.entries(analysis.wuxingStats['凶'])
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])[0];

  if (jiWuxingTop || xiongWuxingTop) {
    lines.push('【初步分析】');
    if (jiWuxingTop && xiongWuxingTop) {
      lines.push(`从数据来看，${jiWuxingTop[0]}可能是我的喜用神，而${xiongWuxingTop[0]}可能对我不利。`);
    } else if (jiWuxingTop) {
      lines.push(`从数据来看，${jiWuxingTop[0]}可能是我的喜用神。`);
    }
    lines.push('');
  }

  lines.push('请根据以上数据和我的元素，帮我分析我的喜用神和忌神，并给出调理建议。');

  return lines.join('\n');
}

/**
 * 复制总结文字到剪贴板
 */
function copySummary() {
  const summaryText = document.getElementById('summary-text').innerText;

  navigator.clipboard.writeText(summaryText).then(() => {
    // 显示复制成功提示
    const btn = document.querySelector('.copy-btn');
    const originalText = btn.textContent;
    btn.textContent = '✅ 已复制';
    btn.style.background = '#4CAF50';

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 2000);
  }).catch(err => {
    alert('复制失败，请手动选择文字复制');
    console.error('复制失败：', err);
  });
}

/**
 * 显示结果
 */
function showResults(html) {
  document.getElementById('analysis-results').innerHTML = html;
}

// 导出 WUXING_COLORS 供使用
if (!window.WUXING_COLORS) {
  window.WUXING_COLORS = {
    '金': '#D4AF37',
    '木': '#4CAF50',
    '水': '#2196F3',
    '火': '#F44336',
    '土': '#8B4513'
  };
}
