const API_URL = 'https://69e78e0368208c1debe9130a.mockapi.io/api/v1/participants';
const SPRINT_API = 'https://69e78e0368208c1debe9130a.mockapi.io/api/v1/sprint/1';

async function loadLoginStats() {
    const SPRINT_API = 'https://69e78e0368208c1debe9130a.mockapi.io/api/v1/sprint/1';
    try {
        const response = await fetch(SPRINT_API);
        if (!response.ok) throw new Error('Ошибка сервера');
        let data = await response.json();

        if (Array.isArray(data)) {
            data = data[0];
        }

        const statusText = document.querySelector('.status-text-mono');
        if (statusText && data.currentSprint) {
            statusText.textContent = `Спринт #${data.currentSprint} в эфире`;
        }

        const fighters = document.querySelector('.stat-value-white');
        if (fighters && data.fightersCount) {
            fighters.textContent = data.fightersCount;
        }

        const sprints = document.querySelector('.stat-value-turquoise');
        if (sprints && data.sprintsTotal) {
            sprints.textContent = data.sprintsTotal;
        }

        const prizes = document.querySelector('.stat-value-green');
        if (prizes && data.prizeAmount) {
            prizes.textContent = data.prizeAmount;
        }

    } catch (err) { 
        console.error("Ошибка загрузки данных:", err); 
    }
}

loadLoginStats();

document.addEventListener('click', function(e) {
    const target = e.target.closest('.tab');
    if (!target || target.classList.contains('active')) return;

    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const mainLabel = document.querySelector('.login-label-form');
    const mainInput = document.querySelector('#main-input');
    const btnText = document.getElementById('btn-text');
    const forgotLink = document.querySelector('.forgot-pass');

    const elementsToAnimate = [mainLabel, mainInput, btnText];
    elementsToAnimate.forEach(el => el.classList.remove('fade-update'));
    void mainLabel.offsetWidth; 

    if (target.id === 'tab-register') {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        mainLabel.innerText = 'EMAIL АДРЕС';
        mainInput.placeholder = 'mail@example.com';
        btnText.innerText = 'Создать аккаунт';
        if(forgotLink) { forgotLink.style.opacity = '0'; forgotLink.style.visibility = 'hidden'; }
    } else {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        mainLabel.innerText = 'ЛОГИН ИЛИ EMAIL';
        mainInput.placeholder = 'dev_architect';
        btnText.innerText = 'Войти в арену';
        if(forgotLink) { forgotLink.style.visibility = 'visible'; forgotLink.style.opacity = '1'; }
    }
    elementsToAnimate.forEach(el => el.classList.add('fade-update'));
});

const authForm = document.querySelector('.auth-form');

if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const mainInput = document.getElementById('main-input');
        const passwordInput = document.querySelector('input[type="password"]');
        const btnText = document.getElementById('btn-text');
        const rememberMe = document.querySelector('.checkbox-input'); 
        if (!mainInput || !passwordInput) return;
        const loginValue = mainInput.value.trim();
        const passwordValue = passwordInput.value.trim();
        const isLogin = document.getElementById('tab-login').classList.contains('active');
        const originalText = btnText ? btnText.textContent : 'ВОЙТИ';

        try {
            if (btnText) btnText.textContent = 'Вход...';

            const response = await fetch(API_URL);
            const users = await response.json();

            if (isLogin) {
                const user = users.find(u => 
                    (u.name === loginValue || u.tg === loginValue) && 
                    String(u.password) === String(passwordValue)
                );

                if (user) {
                    localStorage.setItem('loggedInUserId', user.id);
                    if (rememberMe && rememberMe.checked) {
                        const expiryDate = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
                        localStorage.setItem('sessionExpiry', expiryDate);
                    } else {
                        localStorage.removeItem('sessionExpiry');
                    }
                     window.location.href = 'index.html'; 
                    } else {
                        btnText.textContent = originalText;
                        alert('Неверный логин или пароль')
                    }
   
            } else {
                const newUser = {
                    name: loginValue,
                    tg: "", 
                    password: passwordValue,
                    email: loginValue.includes('@') ? loginValue : "",
                    gitLink: "",
                    bio: "",  
                    stack: "",
                    score: 0, 
                    money: 0,
                    avatar: 'img/dev_architect.png',
                    role: 'Боец арены',
                    globalRate: 0, 
                    sprintNum: 0,
                    achivements: []
                };

                const regRes = await fetch(API_URL, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(newUser)
                });
                
                if (regRes.ok) {
                    const created = await regRes.json();
                    localStorage.setItem('loggedInUserId', created.id);
                    window.location.href = 'index.html';
                }
            }
        } catch (err) {
            console.error("Ошибка сети:", err);
            btnText.textContent = 'ОШИБКА СЕТИ';
            setTimeout(() => {
            btnText.textContent = originalText;
            }, 2000);
        }
    });
}