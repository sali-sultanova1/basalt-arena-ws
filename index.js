const SPRINT_API = 'https://69e78e0368208c1debe9130a.mockapi.io/api/v1/sprint/1';
const API_URL = 'https://69e78e0368208c1debe9130a.mockapi.io/api/v1/participants';

(function() {
    const expiry = localStorage.getItem('sessionExpiry');
    if (expiry) {
        const now = new Date().getTime();
        if (now > parseInt(expiry)) {
            localStorage.removeItem('loggedInUserId');
            localStorage.removeItem('sessionExpiry');
            window.location.href = 'login.html';
        }
    }
})();

async function loadSprintPage() {
    try {
        const userId = localStorage.getItem('loggedInUserId') || '11'; 
        const userRes = await fetch(`${API_URL}/${userId}`);
        const user = await userRes.json();

        const headerName = document.querySelector('.profile-details .username');
        if (headerName) headerName.textContent = user.name;

        const headerRole = document.querySelector('.profile-details .role');
        if (headerRole) headerRole.textContent = user.role || 'Участник';
        
        const avatarImage = document.querySelector('.avatar image');

        if (avatarImage) {
            const finalAvatarPath = user.avatar || 'img/dev_architect.png';
            
            avatarImage.setAttribute('href', finalAvatarPath);
            avatarImage.setAttribute('xlink:href', finalAvatarPath);
        }

        const response = await fetch(SPRINT_API);
        const data = await response.json();

        const criteriaBox = document.querySelector('.criteria-list'); 
        if (criteriaBox && data.criteria) {
            criteriaBox.innerHTML = data.criteria.map(item => `<li>${item}</li>`).join('');
        }

        if (document.querySelector('.main-title-text')) 
            document.querySelector('.main-title-text').textContent = data.title;
        
        if (document.querySelector('.status-text')) 
            document.querySelector('.status-text').textContent = data.status;

        if (document.querySelector('.task-card-title'))
            document.querySelector('.task-card-title').textContent = `Текущая задача: ${data.sprintName}`;
        
        if (document.querySelector('.quote-box p')) 
            document.querySelector('.quote-box p').textContent = data.quote;
            
        if (document.querySelector('.main-description')) {
            document.querySelector('.main-description').innerHTML = data.description;
        }
        if (document.querySelector('.rank-main')) 
            document.querySelector('.rank-main').textContent = data.rank;
            
        if (document.querySelector('.points-value')) 
            document.querySelector('.points-value').textContent = data.points;

        const linksBox = document.querySelector('.links');
        if (linksBox && data.usefulLinks) {
            linksBox.innerHTML = data.usefulLinks.map(link => {
                let iconSvg = '';
                if (link.type === 'terminal') {
                    iconSvg = `<svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1.11111 8.88892C0.805556 8.88892 0.543982 8.78012 0.326389 8.56253C0.108796 8.34493 0 8.08336 0 7.7778V1.11114C0 0.805582 0.108796 0.544008 0.326389 0.326415C0.543982 0.108823 0.805556 2.67029e-05 1.11111 2.67029e-05H10C10.3056 2.67029e-05 10.5671 0.108823 10.7847 0.326415C11.0023 0.544008 11.1111 0.805582 11.1111 1.11114V7.7778C11.1111 8.08336 11.0023 8.34493 10.7847 8.56253C10.5671 8.78012 10.3056 8.88892 10 8.88892H1.11111ZM1.11111 7.7778H10V2.22225H1.11111V7.7778ZM3.05556 7.22225L2.27778 6.44447L3.70833 5.00003L2.26389 3.55558L3.05556 2.7778L5.27778 5.00003L3.05556 7.22225ZM5.55556 7.22225V6.11114H8.88889V7.22225H5.55556Z" fill="#F1F5F9"/></svg>`;
                } else if (link.type === 'doc') {
                    iconSvg = `<svg width="9" height="12" viewBox="0 0 9 12" fill="none"><path d="M2.22064 8.88263H6.66191V7.77232H2.22064V8.88263ZM2.22064 6.662H6.66191V5.55168H2.22064V6.662ZM1.11032 11.1033C0.804981 11.1033 0.543594 10.9946 0.326156 10.7771C0.108719 10.5597 0 10.2983 0 9.99295V1.1104C0 0.805066 0.108719 0.543679 0.326156 0.326241C0.543594 0.108804 0.804981 8.58307e-05 1.11032 8.58307e-05H5.55159L8.88255 3.33104V9.99295C8.88255 10.2983 8.77383 10.5597 8.55639 10.7771C8.33896 10.9946 8.07757 11.1033 7.77223 11.1033H1.11032ZM4.99643 3.8862V1.1104H1.11032V9.99295H7.77223V3.8862H4.99643ZM1.11032 1.1104V3.8862V9.99295V1.1104Z" fill="#F1F5F9"/></svg>`;
                } else {
                    iconSvg = `<svg width="12" height="6" viewBox="0 0 12 6" fill="none"><path d="M4.99643 5.55151H2.7758C2.00783 5.55151 1.3532 5.28087 0.81192 4.73959C0.27064 4.19831 0 3.54369 0 2.77572C0 2.00775 0.27064 1.35312 0.81192 0.811841C1.3532 0.270561 2.00783 -7.9155e-05 2.7758 -7.9155e-05H4.99643V1.11024H2.7758C2.31316 1.11024 1.91993 1.27216 1.59608 1.596C1.27224 1.91985 1.11032 2.31308 1.11032 2.77572C1.11032 3.23835 1.27224 3.63159 1.59608 3.95543C1.91993 4.27927 2.31316 4.4412 2.7758 4.4412H4.99643V5.55151ZM3.33096 3.33088V2.22056H7.77223V3.33088H3.33096ZM6.10675 5.55151V4.4412H8.32739C8.79002 4.4412 9.18326 4.27927 9.5071 3.95543C9.83095 3.63159 9.99287 3.23835 9.99287 2.77572C9.99287 2.31308 9.83095 1.91985 9.5071 1.596C9.18326 1.27216 8.79002 1.11024 8.32739 1.11024H6.10675V-7.9155e-05H8.32739C9.09536 -7.9155e-05 9.74998 0.270561 10.2913 0.811841C10.8325 1.35312 11.1032 2.00775 11.1032 2.77572C11.1032 3.54369 10.8325 4.19831 10.2913 4.73959C9.74998 5.28087 9.09536 5.55151 8.32739 5.55151H6.10675Z" fill="#F1F5F9"/></svg>`;
                }
                return `
                    <a href="${link.url}" class="link" target="_blank">
                        <span class="icon-main">${iconSvg}</span>
                        <span class="btn-text">${link.name}</span>
                    </a>
                `;
            }).join('');
        }

        if (data.deadline) initTimer(data.deadline);
        const form = document.querySelector('.send-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const submitBtn = form.querySelector('button[type="submit"]');
                const textLabel = submitBtn.querySelector('.btn-label');
                
                const repo = form.querySelector('input[placeholder*="github.com"]').value;
                const demo = form.querySelector('input[placeholder*="demo.basalt"]').value;

                try {
                    const originalText = textLabel ? textLabel.textContent : 'ОТПРАВИТЬ';
                    submitBtn.disabled = true;
                    const currentId = localStorage.getItem('loggedInUserId') || '11';

                    const res = await fetch(`${API_URL}/${currentId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            repoUrl: repo, 
                            demoUrl: demo,
                            lastSubmissionDate: new Date().toISOString()
                        })
                    });

                    if (res.ok) {
                        if (textLabel) textLabel.textContent = 'ОТПРАВЛЕНО';
                        form.reset();
                        setTimeout(() => {
                            if (textLabel) textLabel.textContent = originalText;
                            submitBtn.disabled = false;
                        }, 2000);
                    }
                } catch (err) { 
                    submitBtn.disabled = false;
                }
            };
        }

    } catch (err) { console.error("Ошибка загрузки:", err); }
}

function initTimer(deadlineStr) {
    const targetDate = new Date(deadlineStr).getTime();
    const hEl = document.getElementById('hours');
    const mEl = document.getElementById('minutes');
    const sEl = document.getElementById('seconds');

    setInterval(() => {
        const diff = targetDate - new Date().getTime();
        if (diff <= 0) return;
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        if (hEl) hEl.textContent = String(h).padStart(2, '0');
        if (mEl) mEl.textContent = String(m).padStart(2, '0');
        if (sEl) sEl.textContent = String(s).padStart(2, '0');
    }, 1000);
}

loadSprintPage();