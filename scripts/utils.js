/**
 * 通用工具函数
 * 依赖 constants.js，需要在 constants.js 之后加载
 */

/**
 * 获取天干或地支对应的五行
 * @param {string} char - 天干或地支字符
 * @returns {string} 对应的五行
 */
window.getWuxing = function (char) {
    return window.TIANGAN_WUXING[char] || window.DIZHI_WUXING[char] || '';
};

/**
 * 获取五行对应的颜色
 * @param {string} char - 天干或地支字符
 * @returns {string} 对应五行的颜色值
 */
window.getWuxingColor = function (char) {
    const wuxing = window.getWuxing(char);
    return window.WUXING_COLORS[wuxing] || '#333';
};

/**
 * 计算指定日期的八字（年月日三柱）
 * @param {Date} date - 要计算八字的日期
 * @returns {Object} 包含年月日三柱的八字对象
 */
window.calculateBazi = function (date) {
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
};
