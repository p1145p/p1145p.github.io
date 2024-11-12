// 
// 
// 此文件包括基础配置，网络函数，以及面板配置获取,还有一部分需要经常用到的函数
// 
// 

// 导入必要函数

// 基础配置
window.config = {
    title: "奶酪加速器", // 网站标题
    host: "https://api.shaoming.asia/", // 后端接口地址,请保证关闭了强制https，且host 地址未被墙
};

// post请求函数
async function post(url, data) {
    try {
        // 创建一个 FormData 对象
        const formData = new FormData();

        // 将数据添加到 FormData 对象中
        for (const [key, value] of Object.entries(data)) {
            formData.append(key, value);
        }

        // 发送请求
        const response = await fetch(url, {
            method: 'POST',
            body: formData // 使用 FormData 作为请求体
        });

        // 解析响应数据为JSON
        const responseData = await response.json();

        // 返回响应数据
        return responseData;
    } catch (error) {
        // 处理请求中的错误
        console.error('Request failed', error);
        throw error;
    }
}

// get请求函数
async function get(url, params = {}) {
    try {
        // 构造查询字符串
        const queryString = new URLSearchParams(params).toString();
        // 如果存在查询参数，则将它们附加到 URL 上
        const requestUrl = queryString ? `${url}?${queryString}` : url;

        // 发送 GET 请求
        const response = await fetch(requestUrl);

        // 解析响应数据为 JSON
        const data = await response.json();

        // 返回响应数据
        return data;
    } catch (error) {
        // 处理请求中的错误
        console.error('Request failed', error);
        throw error;
    }
}

// 消息提示函数
async function sendsnackbar(message) {

    mdui.snackbar({
        message: message,
        placement: "top"
    });

}

// 发送请求并处理响应
async function fetchConfig() {
    // 拼接URL
    const url = window.config.host + `api/v1/guest/comm/config`; //登录注册页基本配置
    console.log('API地址:', url);
    try {
        const data = await get(url);

        if (data.status === "success") {
            // 提取需要的数据作为全局变量
            window.is_email_verify = data.data.is_email_verify;
            window.is_recaptcha = data.data.is_recaptcha;
            window.recaptcha_site_key = data.data.recaptcha_site_key;
            window.logo = data.data.logo;
            window.email_whitelist_suffix = data.data.email_whitelist_suffix;

            console.log('全局变量已更新:', {
                is_email_verify: window.is_email_verify,
                is_recaptcha: window.is_recaptcha,
                recaptcha_site_key: window.recaptcha_site_key,
                logo: window.logo,
                email_whitelist_suffix: window.email_whitelist_suffix
            });
        }
    } catch (error) {
        console.error('请求发生错误:', error);
    }
}

// 调用函数
fetchConfig();