-- =====================================================
-- 修复数据库唯一约束
-- 用途：添加 (date, user_id) 联合唯一约束以支持多用户
-- =====================================================

-- 步骤 1: 删除旧的 date 唯一约束（如果存在）
-- =====================================================
-- 先查看现有约束
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'journal_entries'::regclass;

-- 删除旧的 date 唯一约束（查看上面的结果，找到约束名称）
-- 如果约束名是 journal_entries_date_key，执行：
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_date_key;

-- 步骤 2: 添加新的联合唯一约束
-- =====================================================
ALTER TABLE journal_entries 
ADD CONSTRAINT journal_entries_date_user_id_key 
UNIQUE (date, user_id);

-- 步骤 3: 验证
-- =====================================================
-- 检查新约束是否创建成功
SELECT conname, contype, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'journal_entries'::regclass 
  AND contype = 'u'; -- u = unique constraint

-- 预期结果：应该看到 journal_entries_date_user_id_key 约束
