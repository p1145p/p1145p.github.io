// 
// 
// 此文件包括页面加载逻辑以及页面操作调用逻辑
// 
// 
// 单页路由函数
function navigateTo(page) {
    const pages = {
        'login': {
            element: document.getElementById('login-form'),
            path: '#/login'
        },
        'register': {
            element: document.getElementById('register-form'),
            path: '#/register'
        },
        'forgot': {
            element: document.getElementById('forgot-form'),
            path: '#/forgot'
        },
        'dashboard': {
            element: document.getElementById('dashboard'),
            path: '#/dashboard'
        },
        'store': {
            element: document.getElementById('store'),
            path: '#/dashboard/store'
        }
    };

    const header = document.getElementById('header');
    const sidebar = document.getElementById('sidebar');

    if (pages[page]) {
        for (let key in pages) {
            pages[key].element.style.display = 'none';
        }
        pages[page].element.style.display = 'block';
        
        // 特定页面不显示顶边栏和侧边栏
        if (page === 'login' || page === 'register' || page === 'forgot') {
            header.style.display = 'none';
            sidebar.style.display = 'none';
        } else {
            header.style.display = 'block';
            sidebar.style.display = 'block';
        }
        
        window.history.pushState({}, '', pages[page].path);
    } else {
        console.error('Invalid page:', page);
    }
}

// 页面加载时设置路由
window.addEventListener('DOMContentLoaded', function () {
    const path = window.location.hash;
    document.title = window.config.title;

    // 移除加载遮罩
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.parentNode.removeChild(loadingOverlay);

    // 默认页面
    let defaultPage = 'login';

    // 根据 URL 路径确定要显示的页面
    switch (path) {
        case '#/register':
            navigateTo('register');
            break;
        case '#/forgot':
            navigateTo('forgot');
            break;
        case '#/dashboard':
            navigateTo('dashboard');
            break;
        case '#/dashboard/store':
            navigateTo('store');
            break;
        case '#/login':
        default:
            navigateTo(defaultPage);
            break;
    }
});

// 登陆函数
function login() {

    //拼接登录api
    var url = window.config.host + `api/v1/passport/auth/login`;

    // 创建一个 FormData 对象并定义登录请求值
    const formData = {
        email: document.getElementById('login_email').value,
        password: document.getElementById('login_password').value
    };
    // 调用网络请求函数
    post(url, formData)
        .then(response => {
            sendsnackbar(response.message);
        })

}

// 通用的 reCAPTCHA 验证函数
async function verifyRecaptcha(onSuccess, onFailure) {
    // 如果人机验证未开启，直接调用成功回调
    if (window.is_recaptcha !== 1) {
        console.log('人机验证未开启，跳过验证流程');
        onSuccess();
        return;
    }

    // 检查站点密钥
    if (!window.recaptcha_site_key) {
        console.error("未检测到站点密钥，人机验证异常退出");
        onFailure("未检测到站点密钥");
        return;
    }

    // 调起验证窗口
    mdui.dialog({
        headline: "人机验证",
        actions: [
            {
                text: "关闭",
            }
        ],
        body: '<div id="turnstile-container">请稍等片刻......</div>'
    });

    // 调用验证码
    try {
        await turnstile.render("#turnstile-container", {
            sitekey: window.recaptcha_site_key,
            size: "normal",
            callback: (token) => {
                // reCAPTCHA 验证成功
                onSuccess(token);

            }
        });
    } catch (error) {
        // reCAPTCHA 验证过程中发生错误
        console.error("人机验证过程中发生错误:", error);
        onFailure("人机验证过程中发生错误");
    }
}

// 使用示例：发送邮箱验证码
async function sendEmailVerify() {
    const url = window.config.host + `api/v1/passport/comm/sendEmailVerify`;
    verifyRecaptcha(
        (token) => {
            // 进入正常流程
            const formData = {
                email: document.getElementById('register_email').value,
                email: document.getElementById('forgot_email').value,
                recaptcha_data: token
            };
            post(url, formData)
                .then(response => sendsnackbar(response.message))
                .catch(() => sendsnackbar("网络或服务器错误"));
        },
        () => {
            // 验证失败，不执行任何操作
            sendsnackbar("人机验证未通过");
        }
    );
}

// 使用示例：注册
async function register() {
    const url = window.config.host + `api/v1/passport/auth/register`;
    verifyRecaptcha(
        (token) => {
            // 进入注册流程
            const formData = {
                email: document.getElementById('register_email').value,
                email_code: document.getElementById('register_validate').value,
                invite_code: document.getElementById('register_invitation').value,
                password: document.getElementById('register_password').value,
                recaptcha_data: token
            };
            post(url, formData)
                .then(response => sendsnackbar(response.message))
                .catch(() => sendsnackbar("网络或服务器错误"));
        },
        () => {
            // 验证失败，不执行任何操作
            sendsnackbar("人机验证未通过");
        }
    );
}

// 重置密码函数
async function forgot() {
    const url = window.config.host + `api/v1/passport/auth/forget`;
    verifyRecaptcha(
        (token) => {
            // 进入注册流程
            const formData = {
                email: document.getElementById('forgot_email').value,
                email_code: document.getElementById('forgotr_validate').value,
                password: document.getElementById('forgot_password').value,
                recaptcha_data: token
            };
            post(url, formData)
                .then(response => sendsnackbar(response.message))
                .catch(() => sendsnackbar("网络或服务器错误"));
        },
        () => {
            // 验证失败，不执行任何操作
            sendsnackbar("人机验证未通过");
        }
    );
}