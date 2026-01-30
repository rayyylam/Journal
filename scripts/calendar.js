/**
 * 八字显示模块
 * 依赖 constants.js 和 utils.js
 */


/**
 * 显示指定日期的八字
 * @param {Date|String} date - 可选，要显示的日期，默认为今天
 */
function displayTodayBazi(date) {
    const targetDate = date ? (typeof date === 'string' ? new Date(date) : date) : new Date();
    const bazi = calculateBazi(targetDate);

    // 更新年柱
    const yearGan = document.getElementById('year-gan');
    const yearZhi = document.getElementById('year-zhi');
    if (yearGan && yearZhi) {
        yearGan.textContent = bazi.year.gan;
        yearGan.style.color = getWuxingColor(bazi.year.gan);
        yearZhi.textContent = bazi.year.zhi;
        yearZhi.style.color = getWuxingColor(bazi.year.zhi);
    }

    // 更新月柱
    const monthGan = document.getElementById('month-gan');
    const monthZhi = document.getElementById('month-zhi');
    if (monthGan && monthZhi) {
        monthGan.textContent = bazi.month.gan;
        monthGan.style.color = getWuxingColor(bazi.month.gan);
        monthZhi.textContent = bazi.month.zhi;
        monthZhi.style.color = getWuxingColor(bazi.month.zhi);
    }

    // 更新日柱
    const dayGan = document.getElementById('day-gan');
    const dayZhi = document.getElementById('day-zhi');
    if (dayGan && dayZhi) {
        dayGan.textContent = bazi.day.gan;
        dayGan.style.color = getWuxingColor(bazi.day.gan);
        dayZhi.textContent = bazi.day.zhi;
        dayZhi.style.color = getWuxingColor(bazi.day.zhi);
    }

    // 更新日期显示
    const dateStr = `${targetDate.getFullYear()}年${targetDate.getMonth() + 1}月${targetDate.getDate()}日`;
    const currentDateElem = document.getElementById('current-date');
    if (currentDateElem) {
        currentDateElem.textContent = dateStr;
    }

    // 将八字数据存储到全局，供其他模块使用
    window.currentBazi = bazi;
    window.currentDate = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD 格式
}

// 页面加载完成后显示今日八字
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', displayTodayBazi);
} else {
    displayTodayBazi();
}

// displayTodayBazi 也导出为全局函数
window.displayTodayBazi = displayTodayBazi;
