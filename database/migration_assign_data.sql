-- =====================================================
-- 数据迁移脚本
-- 用途：将现有数据关联到管理员账号
-- =====================================================

-- ⚠️ 重要提示：
-- 1. 请先在 Supabase Dashboard 创建管理员账号
-- 2. 复制管理员的 User ID
-- 3. 将下面的 'YOUR_USER_ID_HERE' 替换为实际的 User ID
-- 4. 然后执行此脚本

-- 步骤 1: 将所有现有记录关联到管理员账号
-- =====================================================
UPDATE journal_entries
SET user_id = 'YOUR_USER_ID_HERE'
WHERE user_id IS NULL;

-- 步骤 2: 验证迁移结果
-- =====================================================

-- 检查是否还有未关联的记录（应该返回 0）
SELECT COUNT(*) as unassigned_records
FROM journal_entries
WHERE user_id IS NULL;

-- 检查已关联的记录数量
SELECT COUNT(*) as assigned_records
FROM journal_entries
WHERE user_id IS NOT NULL;

-- 查看按用户分组的记录数
SELECT user_id, COUNT(*) as record_count
FROM journal_entries
GROUP BY user_id;

-- 步骤 3: 设置 user_id 为必填（可选，建议在验证成功后执行）
-- =====================================================
-- ALTER TABLE journal_entries 
-- ALTER COLUMN user_id SET NOT NULL;
