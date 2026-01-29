// Service Worker 版本
const CACHE_NAME = 'bazi-journal-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/calendar.html',
    '/analysis.html',
    '/divination.html',
    '/styles/main.css',
    '/styles/calendar.css',
    '/scripts/bazi.js',
    '/scripts/journal.js',
    '/scripts/calendar-view.js',
    '/scripts/analysis.js',
    '/scripts/divination.js',
    '/scripts/supabase.js',
    '/manifest.json'
];

// 安装 Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('缓存已打开');
                return cache.addAll(urlsToCache);
            })
    );
});

// 激活 Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 拦截请求
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 缓存命中 - 返回缓存的响应
                if (response) {
                    return response;
                }

                // 缓存未命中 - 尝试从网络获取
                return fetch(event.request).then(response => {
                    // 检查是否是有效响应
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // 克隆响应
                    const responseToCache = response.clone();

                    // 将响应添加到缓存
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
            .catch(() => {
                // 网络失败 - 返回离线页面（可选）
                return caches.match('/index.html');
            })
    );
});
