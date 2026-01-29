-- =====================================================
-- Supabase 数据库迁移脚本
-- 用途：添加用户认证支持和 Row Level Security
-- =====================================================

-- 步骤 1: 添加 user_id 列
-- =====================================================
ALTER TABLE journal_entries 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 添加注释
COMMENT ON COLUMN journal_entries.user_id IS '关联的用户 ID，来自 auth.users';

-- 步骤 2: 创建索引（提升查询性能）
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id 
ON journal_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_journal_entries_date 
ON journal_entries(date);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date 
ON journal_entries(user_id, date);

-- 步骤 3: 启用 Row Level Security
-- =====================================================
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- 步骤 4: 创建 RLS 策略
-- =====================================================

-- 策略 1: 用户只能查看自己的数据
CREATE POLICY "用户只能查看自己的数据"
ON journal_entries
FOR SELECT
USING (auth.uid() = user_id);

-- 策略 2: 用户只能插入自己的数据
CREATE POLICY "用户只能插入自己的数据"
ON journal_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 策略 3: 用户只能更新自己的数据
CREATE POLICY "用户只能更新自己的数据"
ON journal_entries
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 策略 4: 用户只能删除自己的数据
CREATE POLICY "用户只能删除自己的数据"
ON journal_entries
FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 验证脚本
-- =====================================================

-- 检查列是否添加成功
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'journal_entries' AND column_name = 'user_id';

-- 检查索引是否创建成功
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'journal_entries';

-- 检查 RLS 是否启用
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'journal_entries';

-- 检查策略是否创建成功
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'journal_entries';
