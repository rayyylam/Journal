/**
 * 从 URL 参数获取日期，如果没有则返回今天
 */
function getDateFromURL() {
    const params = new URLSearchParams(window.location.search);
    const dateParam = params.get('date');

    if (dateParam) {
        // 验证日期格式
        const date = new Date(dateParam);
        if (!isNaN(date.getTime())) {
            return dateParam;
        }
    }

    // 默认返回今天
    return new Date().toISOString().split('T')[0];
}

/**
 * 检查是否从日历页面跳转而来
 */
function isFromCalendar() {
    return new URLSearchParams(window.location.search).has('date');
}

/**
 * 显示或隐藏返回日历按钮
 */
function toggleBackButton() {
    const backButton = document.getElementById('back-to-calendar');
    if (backButton) {
        if (isFromCalendar()) {
            backButton.style.display = 'block';
        } else {
            backButton.style.display = 'none';
        }
    }
}

/**
 * 更新页面显示的八字和日期
 */
function updatePageDisplay(dateStr) {
    // 调用 calendar.js 中的函数显示八字
    if (window.displayTodayBazi) {
        window.displayTodayBazi(dateStr);
    }
}

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', async function () {
    // 设置当前日期（从 URL 或默认今天）
    window.currentDate = getDateFromURL();

    // 显示/隐藏返回按钮
    toggleBackButton();

    // 更新页面显示（八字和日期）
    updatePageDisplay(window.currentDate);

    const moodNote = document.getElementById('mood-note');
    const charCount = document.getElementById('char-count');
    const saveBtn = document.getElementById('save-btn');
    const message = document.getElementById('message');
    const fortuneOptions = document.querySelectorAll('.fortune-option');

    let selectedFortune = null;


    // 字数统计
    moodNote.addEventListener('input', function () {
        const count = this.value.length;
        charCount.textContent = count;

        // 超过限制时提示
        if (count > 800) {
            charCount.style.color = '#F44336';
        } else {
            charCount.style.color = '#666';
        }
    });

    // 运势选择
    fortuneOptions.forEach(option => {
        option.addEventListener('click', function () {
            // 移除所有选中状态
            fortuneOptions.forEach(opt => opt.classList.remove('selected'));
            // 添加当前选中状态
            this.classList.add('selected');
            // 选中对应的radio
            this.querySelector('input[type="radio"]').checked = true;
            selectedFortune = this.dataset.value;
        });
    });

    // 加载今日已有记录
    await loadTodayRecord();

    // 保存记录
    saveBtn.addEventListener('click', saveRecord);
});

/**
 * 加载今日已有记录
 */
async function loadTodayRecord() {
    try {
        const { data, error } = await window.supabaseClient
            .from('journal_entries')
            .select('*')
            .eq('date', window.currentDate)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 是找不到记录的错误码
            throw error;
        }

        if (data) {
            // 填充运势选择
            if (data.fortune) {
                const fortuneOption = document.querySelector(`.fortune-option[data-value="${data.fortune}"]`);
                if (fortuneOption) {
                    fortuneOption.click();
                }
            }

            // 填充心情记录
            if (data.mood_note) {
                document.getElementById('mood-note').value = data.mood_note;
                document.getElementById('char-count').textContent = data.mood_note.length;
            }

            // 更新按钮文本
            document.getElementById('save-btn').textContent = '更新记录';

            showMessage('已加载今日记录', 'info');
        }
    } catch (error) {
        console.error('加载记录失败：', error);
    }
}

/**
 * 保存或更新记录
 */
async function saveRecord() {
    const fortuneRadio = document.querySelector('input[name="fortune"]:checked');
    const moodNote = document.getElementById('mood-note').value.trim();
    const saveBtn = document.getElementById('save-btn');

    // 验证：至少要选择运势或填写心情
    if (!fortuneRadio && !moodNote) {
        showMessage('请至少选择运势或填写心情记录', 'error');
        return;
    }

    // 禁用按钮，防止重复提交
    saveBtn.disabled = true;
    saveBtn.textContent = '保存中...';

    try {
        // 获取当前用户
        const { data: { user } } = await window.supabaseClient.auth.getUser();

        if (!user) {
            throw new Error('用户未登录');
        }

        const recordData = {
            date: window.currentDate,
            user_id: user.id,  // 添加 user_id
            year_pillar: window.currentBazi.year.full,
            month_pillar: window.currentBazi.month.full,
            day_pillar: window.currentBazi.day.full,
            fortune: fortuneRadio ? fortuneRadio.value : null,
            mood_note: moodNote || null
        };

        // 使用 upsert 插入或更新
        const { data, error } = await window.supabaseClient
            .from('journal_entries')
            .upsert(recordData, {
                onConflict: 'date,user_id',  // 更新冲突检测
                returning: 'minimal'
            });

        if (error) throw error;

        showMessage('保存成功！', 'success');
        saveBtn.textContent = '更新记录';

    } catch (error) {
        console.error('保存失败：', error);
        showMessage('保存失败：' + error.message, 'error');
        saveBtn.textContent = '保存记录';
    } finally {
        saveBtn.disabled = false;
    }
}

/**
 * 显示消息提示
 */
function showMessage(text, type = 'info') {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = `message message-${type}`;
    message.style.display = 'block';

    // 3秒后自动隐藏
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}
