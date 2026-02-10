---
description: 代码优化重构流程 - 消除重复代码，提升代码质量
---

# 代码优化重构 Workflow

这个 workflow 帮助你系统化地优化和重构代码，消除重复定义，提升代码可维护性。

## 适用场景

- 项目代码中存在大量重复的常量、函数定义
- 代码组织混乱，缺少统一的工具模块
- 需要在不改变功能的前提下优化代码结构
- 提升代码可读性和可维护性

## 前置准备

1. 确保项目代码已提交到 Git，有完整的版本控制
2. 确保项目功能正常运行
3. 准备好本地测试环境

---

## 第一步：代码审查和问题识别

### 1.1 扫描重复代码

```bash
# 查找重复的常量定义
grep -r "const.*=" --include="*.js" --include="*.ts" . | sort | uniq -d

# 查找重复的函数定义
grep -r "function.*{" --include="*.js" --include="*.ts" . | sort | uniq -d
```

### 1.2 识别问题类型

记录以下问题：
- [ ] **常量重复**：相同的常量在多个文件中定义
- [ ] **函数重复**：相同或相似的函数在多个地方实现
- [ ] **工具函数分散**：通用工具函数散落在业务代码中
- [ ] **依赖混乱**：模块间依赖关系不清晰

### 1.3 统计代码量

```bash
# 统计总行数
find . -name "*.js" -o -name "*.ts" | xargs wc -l | tail -1

# 统计各文件行数
find . -name "*.js" -o -name "*.ts" | xargs wc -l | sort -n
```

---

## 第二步：创建优化计划

### 2.1 创建 implementation_plan.md

在项目 artifacts 目录中创建优化计划，包含：

**问题清单**
- 列出所有发现的重复和问题
- 标注文件位置和行数
- 估算可优化的代码量

**优化方案**
- 决定创建哪些公共模块（如 `constants.js`、`utils.js`）
- 列出需要重构的文件
- 明确不改变的内容（业务逻辑）

**风险评估**
- 标注高风险的修改
- 列出需要重点测试的功能

### 2.2 请求用户审核

- 使用 `notify_user` 请求审核计划
- 确认优化方向和范围
- 获得批准后再继续

---

## 第三步：实施重构

### 3.1 创建公共模块

**选择模块化方案**：
- **全局变量方式**（推荐用于传统项目）：通过 `window` 对象挂载，兼容性好
- **ES Module 方式**（推荐用于现代项目）：使用 `export/import`，更规范

**示例：创建 constants.js**
```javascript
// 全局变量方式
window.MY_CONSTANTS = {
    COLOR_PRIMARY: '#2E4E3F',
    // ...其他常量
};

// 或 ES Module 方式
export const MY_CONSTANTS = {
    COLOR_PRIMARY: '#2E4E3F',
    // ...其他常量
};
```

### 3.2 重构现有文件

**原则**：
- 一次只修改一个文件
- 搜索并替换局部定义为全局引用
- 删除重复的定义代码
- 保持函数签名和返回值不变

**模式**：
```javascript
// 优化前
const COLORS = { red: '#F00' };
function getColor(name) { return COLORS[name]; }

// 优化后（删除定义，直接使用全局）
// 依赖 constants.js 和 utils.js
```

### 3.3 更新引用

**HTML 文件**：添加新模块的 script 标签
```html
<script src="scripts/constants.js"></script>
<script src="scripts/utils.js"></script>
```

**注意加载顺序**：依赖项必须在使用者之前加载

---

## 第四步：测试验证

### 4.1 创建测试页面

创建 `test-modules.html` 验证模块加载：

```html
<!DOCTYPE html>
<html>
<head>
    <title>模块测试</title>
    <script src="scripts/constants.js"></script>
    <script src="scripts/utils.js"></script>
</head>
<body>
    <h1>模块测试</h1>
    <div id="results"></div>
    <script>
        // 测试常量和函数是否正确加载
        const results = [];
        results.push(typeof window.MY_CONSTANTS !== 'undefined' ? 'PASS' : 'FAIL');
        // ...更多测试
        document.getElementById('results').innerHTML = results.join('<br>');
    </script>
</body>
</html>
```

### 4.2 功能测试清单

逐一测试所有页面和功能：
- [ ] 所有页面正常加载，无控制台错误
- [ ] 核心功能正常工作
- [ ] 数据读写操作正常
- [ ] 交互功能响应正确
- [ ] 样式显示无异常

### 4.3 性能检查

```bash
# 查看优化后的代码统计
find . -name "*.js" | xargs wc -l | tail -1
```

对比优化前后的代码量变化

---

## 第五步：文档和提交

### 5.1 创建 walkthrough.md

记录优化成果：
- 优化前后对比（代码行数、文件数量）
- 具体优化内容（新增/修改/删除的文件）
- 测试验证结果
- 技术决策说明

### 5.2 提交代码

```bash
# 查看变更
git status

# 添加所有变更
git add .

# 提交（使用规范的 commit message）
git commit -m "refactor: 优化代码结构，消除重复定义

- 新建 constants.js 和 utils.js 公共模块
- 统一管理常量和工具函数
- 重构 xxx.js、yyy.js
- 移除 N 行重复代码，总代码量减少 X%
- 更新 HTML 文件的脚本引用"

# 推送到远程
git push origin main
```

---

## 常见问题

### Q1: 如何决定使用全局变量还是 ES Module？

**使用全局变量**：
- 项目原本使用传统 script 标签
- 需要兼容旧浏览器
- 风险较低，改动较小

**使用 ES Module**：
- 现代项目，已使用模块化
- 使用构建工具（Webpack、Vite 等）
- 追求更好的代码组织

### Q2: 优化过程中发现 bug 怎么办？

1. 立即停止优化工作
2. 切换到新分支修复 bug
3. Bug 修复后，重新审视优化计划
4. 确保优化不会引入或掩盖问题

### Q3: 如何确保不改变功能？

1. 只修改代码结构，不修改业务逻辑
2. 保持所有函数签名和返回值不变
3. 使用测试页面验证核心功能
4. 对关键功能进行手动测试

---

## 成功标准

- ✅ 代码重复率显著降低（至少减少 50%）
- ✅ 代码总量减少或持平
- ✅ 所有功能测试通过
- ✅ 无新增控制台错误
- ✅ 代码组织更清晰，依赖关系更明确
- ✅ 文档完整，便于后续维护

---

## 扩展阅读

- [重构：改善既有代码的设计](https://martinfowler.com/books/refactoring.html)
- [代码整洁之道](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)
- [JavaScript 设计模式](https://www.patterns.dev/posts/classic-design-patterns)
