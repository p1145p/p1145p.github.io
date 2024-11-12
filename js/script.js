// 
// 
// 此文件包括页面加载逻辑以及页面操作调用逻辑
// 
// 

// 初始化页面
window.addEventListener('DOMContentLoaded', function () {
    const path = window.location.hash;
    if (path === '#/register') {
        navigateTo('register');
    } else {
        navigateTo('login');
    }
    // 移除加载遮罩
    document.title = window.config.title;
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.parentNode.removeChild(loadingOverlay);
});

// 单页路由函数
function navigateTo(page) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    if (page === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        window.history.pushState({}, '', '#/login');
    } else if (page === 'register') {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        window.history.pushState({}, '', '#/register');
    }
}

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

// 验证码函数
async function validate() {
    // 拼接验证码API
    var url = window.config.host + `api/v1/passport/comm/sendEmailVerify`;
    
    // 检查人机验证状态
    if (window.is_recaptcha === 1) {
        console.log('人机验证已开启');
        
        // 检查站点密钥
        if (!window.recaptcha_site_key) {
            sendsnackbar("未检测到站点密钥，人机验证异常退出");
            return;
        }
        
        // 调用验证码
        try {
            await turnstile.render("#turnstile-container", {
                sitekey: window.recaptcha_site_key, // 替换为您的站点密钥
                callback: turnstile_send
            });
        } catch (error) {
            sendsnackbar("人机验证过程中发生错误");
            return;
        }
    } else {
        console.log('人机验证异常，验证流程结束');
        send();
    }

    function turnstile_send(turnstile) {
        // 进入正常流程
        const formData = {
            email: document.getElementById('register_email').value,
            recaptcha_data: turnstile
        };
        post(url, formData)
            .then(handleResponse)
            .catch(() => sendsnackbar("网络或服务器错误"));
    }

    function send() {
        // 进入正常流程
        const formData = {
            email: document.getElementById('register_').value
        };
        post(url, formData)
            .then(handleResponse)
            .catch(() => sendsnackbar("网络或服务器错误"));
    }

    function handleResponse(response) {
        switch (response.message) {
            case "验证码有误":
                sendsnackbar("人机验证不通过");
                break;
            default:
                sendsnackbar(response.message);
        }
    }
}

// 注册函数
function register() {

    //拼接登录api
    var url = window.config.host + `api/v1/passport/auth/register`;

    // 创建一个 FormData 对象并定义登录请求值
    const formData = {
        email: document.getElementById('register_email').value,
        email_code: document.getElementById('register_validate').value,
        invite_code: document.getElementById('register_invitation').value,
        password: document.getElementById('register_password').value
    };
    // 调用网络请求函数
    post(url, formData)
        .then(response => {
            sendsnackbar(response.message);
        })

}