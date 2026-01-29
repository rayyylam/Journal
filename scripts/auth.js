// 认证逻辑
document.addEventListener('DOMContentLoaded', async function () {
    // 等待 Supabase 客户端就绪
    await window.waitForSupabase();

    // 检查是否已登录
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (session) {
        // 已登录，跳转到主页
        window.location.href = 'index.html';
        return;
    }

    // 登录表单处理
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const loginMessage = document.getElementById('login-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        // 显示加载状态
        loginBtn.disabled = true;
        loginBtn.querySelector('.btn-text').style.display = 'none';
        loginBtn.querySelector('.btn-loading').style.display = 'inline';
        loginMessage.style.display = 'none';

        try {
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // 登录成功
            showMessage('登录成功，正在跳转...', 'success');

            // 延迟跳转，让用户看到成功消息
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);

        } catch (error) {
            console.error('登录失败：', error);

            let errorMessage = '登录失败，请重试';

            if (error.message.includes('Invalid login credentials')) {
                errorMessage = '邮箱或密码错误';
            } else if (error.message.includes('Email not confirmed')) {
                errorMessage = '请先确认您的邮箱';
            }

            showMessage(errorMessage, 'error');

            // 恢复按钮状态
            loginBtn.disabled = false;
            loginBtn.querySelector('.btn-text').style.display = 'inline';
            loginBtn.querySelector('.btn-loading').style.display = 'none';
        }
    });

    /**
     * 显示消息
     */
    function showMessage(message, type) {
        loginMessage.textContent = message;
        loginMessage.className = `form-message ${type}`;
        loginMessage.style.display = 'block';
    }
});
