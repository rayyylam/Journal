// Supabase 配置
const SUPABASE_URL = 'https://hbuxqcjnbvtlfjmynkfs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhidXhxY2puYnZ0bGZqbXlua2ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODEwNzQsImV4cCI6MjA4NTE1NzA3NH0.hmGVn3ClqW5X7Y7zj11gN54bDr-KPzH_kOvOs5kqD6c';

// 等待 Supabase 库加载完成后初始化客户端
function initSupabaseClient() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client initialized');
    } else {
        console.error('Supabase library not loaded');
    }
}

// 立即尝试初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabaseClient);
} else {
    initSupabaseClient();
}
