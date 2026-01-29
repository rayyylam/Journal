// 五行颜色映射
const WUXING_COLORS = {
    '金': '#D4AF37',  // 金黄色
    '木': '#4CAF50',  // 绿色
    '水': '#2196F3',  // 蓝色
    '火': '#F44336',  // 红色
    '土': '#8B4513'   // 咖啡色
};

// 天干五行对照
const TIANGAN_WUXING = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
};

// 地支五行对照
const DIZHI_WUXING = {
    '子': '水', '亥': '水',
    '寅': '木', '卯': '木',
    '巳': '火', '午': '火',
    '申': '金', '酉': '金',
    '辰': '土', '戌': '土', '丑': '土', '未': '土'
};

/**
 * 获取天干地支的五行
 */
function getWuxing(char) {
    return TIANGAN_WUXING[char] || DIZHI_WUXING[char] || '';
}

/**
 * 获取五行对应的颜色
 */
function getWuxingColor(char) {
    const wuxing = getWuxing(char);
    return WUXING_COLORS[wuxing] || '#333';
}

/**
 * 计算指定日期的八字（年月日三柱）
 */
function calculateBazi(date) {
    // 使用 lunar-javascript 库计算
    const lunar = window.Lunar.fromDate(date);

    // 获取年柱
    const yearGanZhi = lunar.getYearInGanZhiExact();
    const yearGan = yearGanZhi.charAt(0);
    const yearZhi = yearGanZhi.charAt(1);

    // 获取月柱
    const monthGanZhi = lunar.getMonthInGanZhiExact();
    const monthGan = monthGanZhi.charAt(0);
    const monthZhi = monthGanZhi.charAt(1);

    // 获取日柱
    const dayGanZhi = lunar.getDayInGanZhi();
    const dayGan = dayGanZhi.charAt(0);
    const dayZhi = dayGanZhi.charAt(1);

    return {
        year: { gan: yearGan, zhi: yearZhi, full: yearGanZhi },
        month: { gan: monthGan, zhi: monthZhi, full: monthGanZhi },
        day: { gan: dayGan, zhi: dayZhi, full: dayGanZhi }
    };
}

/**
 * 显示今日八字
 */
function displayTodayBazi() {
    const today = new Date();
    const bazi = calculateBazi(today);

    // 更新年柱
    const yearGan = document.getElementById('year-gan');
    const yearZhi = document.getElementById('year-zhi');
    yearGan.textContent = bazi.year.gan;
    yearGan.style.color = getWuxingColor(bazi.year.gan);
    yearZhi.textContent = bazi.year.zhi;
    yearZhi.style.color = getWuxingColor(bazi.year.zhi);

    // 更新月柱
    const monthGan = document.getElementById('month-gan');
    const monthZhi = document.getElementById('month-zhi');
    monthGan.textContent = bazi.month.gan;
    monthGan.style.color = getWuxingColor(bazi.month.gan);
    monthZhi.textContent = bazi.month.zhi;
    monthZhi.style.color = getWuxingColor(bazi.month.zhi);

    // 更新日柱
    const dayGan = document.getElementById('day-gan');
    const dayZhi = document.getElementById('day-zhi');
    dayGan.textContent = bazi.day.gan;
    dayGan.style.color = getWuxingColor(bazi.day.gan);
    dayZhi.textContent = bazi.day.zhi;
    dayZhi.style.color = getWuxingColor(bazi.day.zhi);

    // 更新日期显示
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    document.getElementById('current-date').textContent = dateStr;

    // 将八字数据存储到全局，供其他模块使用
    window.currentBazi = bazi;
    window.currentDate = today.toISOString().split('T')[0]; // YYYY-MM-DD 格式
}

// 页面加载完成后显示今日八字
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', displayTodayBazi);
} else {
    displayTodayBazi();
}

// 导出函数供其他模块使用
window.calculateBazi = calculateBazi;
window.getWuxingColor = getWuxingColor;
window.getWuxing = getWuxing;
