// 全局变量
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // 0-11
let allRecords = {}; // 存储所有记录，key 为日期字符串
let currentSelectedDate = null; // 当前选中的日期

/**
 * 日历视图模块
 * 依赖 constants.js、utils.js 和 supabase.js
 */



// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', async function () {
    // 等待 Supabase 客户端就绪
    await window.waitForSupabase();

    // 初始化事件监听
    document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => changeMonth(1));
    document.getElementById('close-detail').addEventListener('click', closeDetail);
    document.getElementById('edit-date-btn').addEventListener('click', editCurrentDate);

    // 加载当前月份
    await loadMonth(currentYear, currentMonth);
});

/**
 * 切换月份
 */
function changeMonth(delta) {
    currentMonth += delta;

    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    } else if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }

    loadMonth(currentYear, currentMonth);
}

/**
 * 加载指定月份的数据和日历
 */
async function loadMonth(year, month) {
    // 更新标题
    document.getElementById('current-month').textContent = `${year}年${month + 1}月`;

    // 从 Supabase 加载该月的所有记录
    await loadMonthRecords(year, month);

    // 渲染日历（仅当该请求是最新请求时）
    if (year === currentYear && month === currentMonth) {
        renderCalendar(year, month);
    }
}

/**
 * 从 Supabase 加载月份记录
 */
async function loadMonthRecords(year, month) {
    try {
        const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const endDate = new Date(year, month + 1, 0);
        const endDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

        const { data, error } = await window.supabaseClient
            .from('journal_entries')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDateStr);

        if (error) throw error;

        // 将记录存储到 allRecords 对象中
        allRecords = {};
        if (data) {
            data.forEach(record => {
                allRecords[record.date] = record;
            });
        }
    } catch (error) {
        console.error('加载记录失败：', error);
    }
}

/**
 * 渲染日历网格
 */
function renderCalendar(year, month) {
    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';

    // 获取当月第一天是星期几 (0-6, 0是周日)
    const firstDay = new Date(year, month, 1).getDay();

    // 获取当月总天数
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 获取上个月的总天数
    const prevMonthDays = new Date(year, month, 0).getDate();

    // 今天的日期
    const today = new Date();
    const isCurrentMonth = (year === today.getFullYear() && month === today.getMonth());
    const todayDate = today.getDate();

    // 填充上个月的日期
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        const dayEl = createDayElement(day, true, null);
        calendarGrid.appendChild(dayEl);
    }

    // 填充当月的日期
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const record = allRecords[dateStr];
        const isToday = isCurrentMonth && day === todayDate;

        const dayEl = createDayElement(day, false, record, isToday, dateStr);
        calendarGrid.appendChild(dayEl);
    }

    // 填充下个月的日期以填满网格
    const totalCells = calendarGrid.children.length;
    const remainingCells = (Math.ceil(totalCells / 7) * 7) - totalCells;

    for (let day = 1; day <= remainingCells; day++) {
        const dayEl = createDayElement(day, true, null);
        calendarGrid.appendChild(dayEl);
    }
}

/**
 * 创建日历格子元素
 */
function createDayElement(day, isOtherMonth, record, isToday = false, dateStr = null) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';

    if (isOtherMonth) {
        dayEl.classList.add('other-month');
    }

    if (isToday) {
        dayEl.classList.add('today');
    }

    if (record) {
        dayEl.classList.add('has-record');
    }

    // 日期数字
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayEl.appendChild(dayNumber);

    // 如果不是其他月份，显示日柱
    if (!isOtherMonth && dateStr) {
        const date = new Date(dateStr);
        const bazi = window.calculateBazi(date);

        const pillarEl = document.createElement('div');
        pillarEl.className = 'day-pillar';

        const gan = document.createElement('span');
        gan.textContent = bazi.day.gan;
        gan.style.color = window.getWuxingColor(bazi.day.gan);

        const zhi = document.createElement('span');
        zhi.textContent = bazi.day.zhi;
        zhi.style.color = window.getWuxingColor(bazi.day.zhi);

        pillarEl.appendChild(gan);
        pillarEl.appendChild(zhi);
        dayEl.appendChild(pillarEl);

        // 如果有记录，显示运势指示器
        if (record && record.fortune) {
            const indicator = document.createElement('div');
            indicator.className = 'fortune-indicator';

            if (record.fortune === '吉') {
                indicator.classList.add('ji');
            } else if (record.fortune === '平') {
                indicator.classList.add('ping');
            } else if (record.fortune === '凶') {
                indicator.classList.add('xiong');
            }

            dayEl.appendChild(indicator);
        }

        // 点击事件
        dayEl.addEventListener('click', () => showDetail(dateStr, bazi, record));
    }

    return dayEl;
}

/**
 * 显示日期详情
 */
function showDetail(dateStr, bazi, record) {
    const detailSection = document.getElementById('date-detail');

    // 记录当前选中的日期
    currentSelectedDate = dateStr;

    // 解析日期字符串
    const [year, month, day] = dateStr.split('-').map(Number);
    document.getElementById('detail-date').textContent = `${year}年${month}月${day}日`;

    // 显示八字
    document.getElementById('detail-year-gan').textContent = bazi.year.gan;
    document.getElementById('detail-year-gan').style.color = window.getWuxingColor(bazi.year.gan);
    document.getElementById('detail-year-zhi').textContent = bazi.year.zhi;
    document.getElementById('detail-year-zhi').style.color = window.getWuxingColor(bazi.year.zhi);

    document.getElementById('detail-month-gan').textContent = bazi.month.gan;
    document.getElementById('detail-month-gan').style.color = window.getWuxingColor(bazi.month.gan);
    document.getElementById('detail-month-zhi').textContent = bazi.month.zhi;
    document.getElementById('detail-month-zhi').style.color = window.getWuxingColor(bazi.month.zhi);

    document.getElementById('detail-day-gan').textContent = bazi.day.gan;
    document.getElementById('detail-day-gan').style.color = window.getWuxingColor(bazi.day.gan);
    document.getElementById('detail-day-zhi').textContent = bazi.day.zhi;
    document.getElementById('detail-day-zhi').style.color = window.getWuxingColor(bazi.day.zhi);

    // 显示运势信息
    const fortuneInfo = document.getElementById('fortune-info');

    if (record) {
        let html = '';

        if (record.fortune) {
            const fortuneClass = record.fortune === '吉' ? 'ji' : record.fortune === '平' ? 'ping' : 'xiong';
            const fortuneEmoji = record.fortune === '吉' ? '😊' : record.fortune === '平' ? '😐' : '😞';
            html += `<div class="fortune-badge ${fortuneClass}">${fortuneEmoji} ${record.fortune}</div>`;
        }

        if (record.mood_note) {
            html += `<div class="mood-text">${record.mood_note}</div>`;
        }

        if (!record.fortune && !record.mood_note) {
            html = '<p class="no-record">暂无记录</p>';
        }

        fortuneInfo.innerHTML = html;
    } else {
        fortuneInfo.innerHTML = '<p class="no-record">暂无记录</p>';
    }

    // 显示详情区域
    detailSection.style.display = 'block';

    // 滚动到详情区域
    detailSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * 关闭详情
 */
function closeDetail() {
    document.getElementById('date-detail').style.display = 'none';
    currentSelectedDate = null;
}

/**
 * 编辑当前选中的日期
 */
function editCurrentDate() {
    if (currentSelectedDate) {
        // 跳转到主页，携带日期参数
        window.location.href = `index.html?date=${currentSelectedDate}`;
    }
}
