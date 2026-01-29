// 认证守卫 - 保护需要登录的页面
(async function () {
    // 等待 Supabase 客户端就绪
    await window.waitForSupabase();

    // 检查登录状态
    const { data: { session } } = await window.supabaseClient.auth.getSession();

    if (!session) {
        // 未登录，重定向到登录页
        window.location.href = 'auth.html';
        return;
    }

    // 已登录，获取用户信息
    window.currentUser = session.user;

    // 监听认证状态变化
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
            // 用户登出，跳转到登录页
            window.location.href = 'auth.html';
        } else if (event === 'TOKEN_REFRESHED') {
            // Token 刷新，更新用户信息
            window.currentUser = session?.user;
        }
    });
})();

/**
 * 登出函数
 */
async function logout() {
    try {
        const { error } = await window.supabaseClient.auth.signOut();
        if (error) throw error;

        // 跳转到登录页
        window.location.href = 'auth.html';
    } catch (error) {
        console.error('登出失败：', error);
        alert('登出失败，请重试');
    }
}

// 导出登出函数
window.logout = logout;
