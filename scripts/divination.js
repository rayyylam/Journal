// 小六壬算卦功能脚本
// 基于 Vue 3 实现

const { createApp, ref, reactive, onMounted } = Vue;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

createApp({
    setup() {
        // ===== 状态控制 =====
        const showTip = ref(false);
        const showMainContent = ref(false);
        const showWarning = ref(false);
        const showResult = ref(false);
        const showNumInput = ref(false);

        // ===== 数据 =====
        const activeKey = ref('');
        const isAnimating = ref(false);
        const finalResult = ref(null);
        const logInfo = ref('');

        const nums = reactive({ n1: '', n2: '', n3: '' });

        // ===== 页面挂载 =====
        onMounted(() => {
            setTimeout(() => { showTip.value = true; }, 500);
            setTimeout(() => { showMainContent.value = true; }, 3000);
        });

        // ===== 六宫格配置 =====
        const gridList = [
            { key: 'liu_lian', label: '留连' },
            { key: 'su_xi', label: '速喜' },
            { key: 'chi_kou', label: '赤口' },
            { key: 'da_an', label: '大安' },
            { key: 'kong_wang', label: '空亡' },
            { key: 'xiao_ji', label: '小吉' }
        ];

        const sequence = ['da_an', 'liu_lian', 'su_xi', 'chi_kou', 'xiao_ji', 'kong_wang'];

        // ===== 卦象字典 =====
        const dict = {
            da_an: {
                label: '大安',
                summary: '万事大吉',
                advice: '身不动时，五行属木。\n目前状态稳定，不必焦虑。'
            },
            liu_lian: {
                label: '留连',
                summary: '事有拖延',
                advice: '卒未归时，五行属土。\n事情进展缓慢，需要耐心等待。'
            },
            su_xi: {
                label: '速喜',
                summary: '喜事临门',
                advice: '人便至时，五行属火。\n好消息马上就到，这就是你要的答案。'
            },
            chi_kou: {
                label: '赤口',
                summary: '多有争执',
                advice: '官事凶时，五行属金。\n容易发生争执口角，建议多听少说。'
            },
            xiao_ji: {
                label: '小吉',
                summary: '值得去做',
                advice: '人来喜时，五行属水。\n会有小小的快乐和收获，前路可行。'
            },
            kong_wang: {
                label: '空亡',
                summary: '时机未到',
                advice: '音信稀时，五行属土。\n结果容易落空，建议暂时放下，静观其变。'
            }
        };

        // ===== 获取农历信息 =====
        const getLunarInfo = () => {
            if (!window.Lunar) {
                alert('农历库加载中，请稍后重试...');
                return null;
            }

            const d = new Date();
            const lunar = window.Lunar.fromDate(d);
            const m = Math.abs(lunar.getMonth());
            const day = Math.abs(lunar.getDay());
            const hour = d.getHours();

            // 计算时辰索引 (1-12)
            let hIndex = 1;
            if (hour >= 23 || hour < 1) hIndex = 1; // 子时
            else hIndex = Math.floor((hour + 1) / 2) + 1;

            const monthCn = lunar.getMonthInChinese();
            const dayCn = lunar.getDayInChinese();
            const dayZhi = lunar.getDayZhi();
            const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
            const shiCn = zhi[hIndex - 1];

            return {
                m, d: day, h: hIndex, dayZhi,
                text: `${monthCn}月${dayCn}日 ${shiCn}时`
            };
        };

        // ===== 核心动画逻辑 =====
        const runStep = async (startIndex, count) => {
            let currentIdx = startIndex;

            // 视觉优化：如果次数太多，只展示最后的循环
            let visualCount = count;
            if (count > 12) {
                visualCount = (count % 6) + 12;
            }

            for (let i = 1; i <= visualCount; i++) {
                if (i > 1) {
                    currentIdx = (currentIdx + 1) % sequence.length;
                }
                activeKey.value = sequence[currentIdx];

                // 渐进式加速
                const progress = i / visualCount;
                const delay = 50 + (progress * progress * 300);
                await sleep(delay);
            }
            return currentIdx;
        };

        // ===== 模式1：时间起卦 =====
        const startByTime = async () => {
            if (isAnimating.value) return;

            const info = getLunarInfo();
            if (!info) return;

            // 判断子日、子时
            if (info.dayZhi === '子' || info.h === 1) {
                logInfo.value = info.text;
                showWarning.value = true;
                return;
            }

            logInfo.value = info.text;
            await runDivinationSequence(info.m, info.d, info.h);
        };

        // ===== 模式2：数字起卦 =====
        const startByNumber = async () => {
            const n1 = parseInt(nums.n1);
            const n2 = parseInt(nums.n2);
            const n3 = parseInt(nums.n3);

            if (!n1 || !n2 || !n3 || n1 <= 0 || n2 <= 0 || n3 <= 0) {
                alert('请输入有效的正整数');
                return;
            }

            showNumInput.value = false;
            logInfo.value = `数字灵感: ${n1}, ${n2}, ${n3}`;

            await runDivinationSequence(n1, n2, n3);
        };

        // ===== 通用占卜流程 =====
        const runDivinationSequence = async (v1, v2, v3) => {
            isAnimating.value = true;
            activeKey.value = '';
            showResult.value = false;
            showWarning.value = false;

            let idx = 0; // 从大安(索引0)开始

            // 三步走
            idx = await runStep(idx, v1);
            await sleep(300);
            idx = await runStep(idx, v2);
            await sleep(300);
            idx = await runStep(idx, v3);

            const key = sequence[idx];
            finalResult.value = dict[key];

            await sleep(300);
            showResult.value = true;
            isAnimating.value = false;
        };

        // ===== 交互函数 =====
        const openNumModal = () => {
            showResult.value = false;
            nums.n1 = '';
            nums.n2 = '';
            nums.n3 = '';
            showNumInput.value = true;
        };

        const fillRandomNumbers = () => {
            nums.n1 = Math.floor(Math.random() * 20) + 1;
            nums.n2 = Math.floor(Math.random() * 20) + 1;
            nums.n3 = Math.floor(Math.random() * 20) + 1;
        };

        const closeResult = () => {
            showResult.value = false;
            activeKey.value = '';
        };

        // ===== 返回数据和方法 =====
        return {
            gridList, activeKey, isAnimating, showResult, finalResult, logInfo,
            showTip, showMainContent, showWarning, showNumInput, nums,
            startByTime, startByNumber, closeResult, openNumModal, fillRandomNumbers
        };
    }
}).mount('#divination-app');
