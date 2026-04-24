const API_URL = 'https://69e78e0368208c1debe9130a.mockapi.io/api/v1/participants';
const SPRINT_API = 'https://69e78e0368208c1debe9130a.mockapi.io/api/v1/sprint';

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

let participants = [];
let isExpanded = false;

async function addLike(userId, element) {
    if (window.event) window.event.stopPropagation();

    const myId = localStorage.getItem('loggedInUserId') || 'guest';
    const historyKey = `likes_by_${myId}`;
    let myHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    const heartNumEl = element.querySelector('.heart-num');
    let currentLikes = parseInt(heartNumEl.textContent) || 0;
    const isAlreadyLiked = myHistory.includes(userId);

    if (isAlreadyLiked) {
        currentLikes = Math.max(0, currentLikes - 1);
        myHistory = myHistory.filter(id => id !== userId);
        element.classList.remove('active-like');
    } else {
        currentLikes++;
        myHistory.push(userId);
        element.classList.add('active-like');
    }

    heartNumEl.textContent = currentLikes;
    localStorage.setItem(historyKey, JSON.stringify(myHistory));

    try {
        fetch(`${API_URL}/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ likes: currentLikes })
        });
    } catch (err) {
    }
}

async function loadHallMeta() {
    try {
        const response = await fetch(SPRINT_API);
        let data = await response.json();
        if (Array.isArray(data)) data = data[0];

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

        const dateObj = new Date(data.hallFinishDate);
        const dateNoYear = dateObj.toLocaleDateString('ru-RU', { 
            day: 'numeric', month: 'long' 
        });

        const beautifulDate = dateObj.toLocaleDateString('ru-RU', { 
            day: 'numeric', month: 'long', year: 'numeric' 
        }).replace(' г.', '');
        const finalDateString = `Завершён ${beautifulDate}`;

        if (document.querySelector('.banner-title')) document.querySelector('.banner-title').textContent = data.hallBannerTitle;
        if (document.querySelector('.modal-brief-title')) document.querySelector('.modal-brief-title').textContent = data.title;
        if (document.querySelector('.quote-box-modal')) document.querySelector('.quote-box-modal').textContent = data.quote;
        
        if (document.querySelector('.modal-brief-desc')) {
            document.querySelector('.modal-brief-desc').innerHTML = data.description;
        }

        const dateElements = document.querySelectorAll('.modal-date-tag-text');
        dateElements.forEach(el => el.textContent = finalDateString);
        const bannerDateSpan = document.querySelector('.date-badge span');
        if (bannerDateSpan) bannerDateSpan.textContent = `Завершён ${dateNoYear}`;

        const modalTagsRow = document.querySelector('.tags-row-modal');
        if (modalTagsRow && data.bannerTags) {
            const classes = ['first', 'second', 'third', 'fourth'];
            const tagsHtml = data.bannerTags.map((tag, i) => 
                `<span class="modal-tag ${classes[i] || ''}">${tag}</span>`
            ).join(' ');
            
            const dateIcon = document.querySelector('.modal-date-tag')?.outerHTML || '';
            modalTagsRow.innerHTML = tagsHtml + dateIcon;
        }

        const criteriaList = document.querySelector('#brief-modal .criteria-list');

        if (criteriaList && data.criteria) {
            criteriaList.innerHTML = data.criteria.map(item => `
                <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px;">
                    <span class="check">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.73333 9.73325L10.4333 5.03325L9.5 4.09992L5.73333 7.86658L3.83333 5.96658L2.9 6.89992L5.73333 9.73325ZM6.66667 13.3333C5.74444 13.3333 4.87778 13.1583 4.06667 12.8083C3.25556 12.4583 2.55 11.9833 1.95 11.3833C1.35 10.7833 0.875 10.0777 0.525 9.26658C0.175 8.45547 0 7.58881 0 6.66658C0 5.74436 0.175 4.8777 0.525 4.06658C0.875 3.25547 1.35 2.54992 1.95 1.94992C2.55 1.34992 3.25556 0.874918 4.06667 0.524918C4.87778 0.174918 5.74444 -8.2016e-05 6.66667 -8.2016e-05C7.58889 -8.2016e-05 8.45556 0.174918 9.26667 0.524918C10.0778 0.874918 10.7833 1.34992 11.3833 1.94992C11.9833 2.54992 12.4583 3.25547 12.8083 4.06658C13.1583 4.8777 13.3333 5.74436 13.3333 6.66658C13.3333 7.58881 13.1583 8.45547 12.8083 9.26658C12.4583 10.0777 11.9833 10.7833 11.3833 11.3833C10.7833 11.9833 10.0778 12.4583 9.26667 12.8083C8.45556 13.1583 7.58889 13.3333 6.66667 13.3333ZM6.66667 11.9999C8.15556 11.9999 9.41667 11.4833 10.45 10.4499C11.4833 9.41658 12 8.15547 12 6.66658C12 5.1777 11.4833 3.91658 10.45 2.88325C9.41667 1.84992 8.15556 1.33325 6.66667 1.33325C5.17778 1.33325 3.91667 1.84992 2.88333 2.88325C1.85 3.91658 1.33333 5.1777 1.33333 6.66658C1.33333 8.15547 1.85 9.41658 2.88333 10.4499C3.91667 11.4833 5.17778 11.9999 6.66667 11.9999Z" fill="#00FF9D"/>
                        </svg>
                    </span> 
                    <span class="modal-criteria-text">${item}</span>
                </li>
            `).join('');
        }

        const tabsList = document.querySelector('.tabs-list');

        if (tabsList && data.navigationTabs) {
            tabsList.innerHTML = data.navigationTabs.map(tab => `
                <button class="tab-item ${tab.active ? 'active' : ''}">
                    ${tab.active ? `
                        <span class="tab-icon">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://w3.org">
                                <path d="M7.5 11.25C8.27813 11.25 9.42188 10.8844 10.1531 10.1531C10.8844 9.42188 11.25 8.5375 11.25 7.5C11.25 6.4625 10.8844 5.57812 10.1531 4.84687C9.42188 4.11562 8.5375 3.75 7.5 3.75C6.4625 3.75 5.57812 4.11562 4.84688 4.84687C4.11563 5.57812 3.75 6.4625 3.75 7.5C3.75 8.5375 4.11563 9.42188 4.84688 10.1531C5.57812 10.8844 6.4625 11.25 7.5 11.25ZM7.5 15C3.35625 15 0 11.6437 0 7.5C0 3.35625 3.35625 0 7.5 0C11.6437 0 15 3.35625 15 7.5C15 11.6437 11.6437 15 7.5 15ZM7.5 1.5C4.18125 1.5 1.5 4.18125 1.5 7.5C1.5 10.8187 4.18125 13.5 7.5 13.5C10.8187 13.5 13.5 10.8187 13.5 7.5C13.5 4.18125 10.8187 1.5 7.5 1.5Z" fill="#0DCCF2"/>
                            </svg>
                        </span>` : ''}
                    <span class="tab-label">${tab.label}</span>
                </button>
            `).join('');
}

        const metrics = document.querySelectorAll('.metric-main-value');
        if (metrics.length >= 2) {
            metrics[0].textContent = data.totalSubmissions;
            metrics[1].textContent = data.successRate;
        }

        const winnersBox = document.querySelector('.winners-section .winners-card');
        if (winnersBox && data.pastWinners) {
            winnersBox.innerHTML = data.pastWinners.map(w => `
                <div class="winner-row">
                    <div class="rank-box"><span class="rank-num">${w.rank}</span></div>
                    <div class="winner-info"><div class="comp-name">${w.comp}</div><div class="winner-username">${w.user}</div></div>
                    <div class="winner-arrow"><svg width="6" height="9" viewBox="0 0 6 9" fill="none"><path d="M3.45 4.5L0 1.05L1.05 0L5.55 4.5L1.05 9L0 7.95L3.45 4.5Z" fill="#475569"/></svg></div>
                </div>`).join('');
        }
    } catch (err) { console.error("Ошибка загрузки мета-данных:", err); }
}

async function fetchParticipants() {
    try {
        const response = await fetch(API_URL);
        participants = await response.json();
        participants.sort((a, b) => a.place - b.place);
        renderHall();
    } catch (err) { console.error("Ошибка загрузки участников:", err); }
}

function renderHall() {
    const grid = document.getElementById('hall-grid');
    if (!grid) return;
    const visibleParticipants = isExpanded ? participants : participants.slice(0, 10);

    const cardsHtml = visibleParticipants.map(user => {
        const isFirst = user.place === 1;

        const myId = localStorage.getItem('loggedInUserId') || 'guest';
        const myHistory = JSON.parse(localStorage.getItem(`likes_by_${myId}`) || '[]');
        const activeClass = myHistory.includes(user.id) ? 'active-like' : '';

        const beautifulDate = new Date(user.date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).replace(' г.', ''); 

        return ` 
        <div class="winner-card rank-${user.place}">
            ${isFirst ? '<div class="card-glow"></div>' : ''} 
            <div class="card-content-wrapper">
                <div class="user-profile-hall">
                    <div class="avatar-box">
                        <div class="avatar-wrapper">
                            <div class="avatar-frame">
                                <img src="${user.avatar}" alt="${user.name}">
                            </div>
                            <div class="rank-label">${user.place}</div>
                        </div>
                    </div>
                    
                    <div class="user-info">
                        <div class="name-row">
                            <span class="user-name">${user.name}</span>
                            ${isFirst ? '<span class="medal-icon"><svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.25625 8.775L4.9125 6.6375L3.1875 5.25H5.325L6 3.15L6.675 5.25H8.8125L7.06875 6.6375L7.725 8.775L6 7.44375L4.25625 8.775ZM1.5 15.75V9.95625C1.025 9.43125 0.65625 8.83125 0.39375 8.15625C0.13125 7.48125 0 6.7625 0 6C0 4.325 0.58125 2.90625 1.74375 1.74375C2.90625 0.581249 4.325 -9.53674e-07 6 -9.53674e-07C7.675 -9.53674e-07 9.09375 0.581249 10.2563 1.74375C11.4188 2.90625 12 4.325 12 6C12 6.7625 11.8688 7.48125 11.6063 8.15625C11.3438 8.83125 10.975 9.43125 10.5 9.95625V15.75L6 14.25L1.5 15.75ZM6 10.5C6 10.5 6.3125 10.5 6.9375 10.5C7.5625 10.5 8.3125 10.0625 9.1875 9.1875C10.0625 8.3125 10.5 7.25 10.5 6C10.5 4.75 10.0625 3.6875 9.1875 2.8125C8.3125 1.9375 7.25 1.5 6 1.5C4.75 1.5 3.6875 1.9375 2.8125 2.8125C1.9375 3.6875 1.5 4.75 1.5 6C1.5 7.25 1.9375 8.3125 2.8125 9.1875C3.6875 10.0625 4.75 10.5 6 10.5ZM3 13.5187L6 12.75L9 13.5187V11.1937C8.5625 11.4437 8.09063 11.6406 7.58438 11.7844C7.07813 11.9281 6.55 12 6 12C5.45 12 4.92188 11.9281 4.41563 11.7844C3.90938 11.6406 3.4375 11.4437 3 11.1937V13.5187Z" fill="#EAB308"/></svg></span>' : ''}
                        </div>
                        <div class="meta-row">
                            <span class="date">${beautifulDate}</span>
                            <span class="dot-sep"></span>
                            <span class="score-text yellow">Оценка наставника: ${user.score}</span>
                        </div>
                        <a href="https://t.me/${user.tg.replace('@','')}" target="_blank" class="tg-link">
                        <div class="plane-icon">
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 7.77783V5.43594e-05L9.23611 3.88894L0 7.77783ZM0.972222 6.3195L6.73264 3.88894L0.972222 1.45839V3.15978L3.88889 3.88894L0.972222 4.61811V6.3195ZM0.972222 6.3195V3.88894V1.45839V3.15978V4.61811V6.3195Z" fill="#0DCCF2"/>
                            </svg>
                            <span class="username">@${user.tg}</span>
                        </div>
                        </a>
                    </div>
                </div>

                <div class="action-controls">
                    <div class="split-rect ${isFirst ? '' : 'compact'}">
                        <div class="action-btn">
                            <div class="icon">
                                <svg width="15" height="9" viewBox="0 0 15 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4.5 9L0 4.5L4.5 0L5.56875 1.06875L2.11875 4.51875L5.55 7.95L4.5 9ZM10.5 9L9.43125 7.93125L12.8813 4.48125L9.45 1.05L10.5 0L15 4.5L10.5 9Z" fill="#94A3B8"/>
                                </svg>
                            </div>
                            ${isFirst ? '<span class="label">код</span>' : ''}
                        </div>

                        <div class="vertical-divider"></div>
                        <div class="action-btn">
                            <div class="icon">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.7 5.99673L4.1625 6.61548C4.3375 6.26548 4.51875 5.92798 4.70625 5.60298C4.89375 5.27798 5.1 4.95298 5.325 4.62798L4.275 4.42173L2.7 5.99673ZM5.3625 7.55298L7.5 9.67173C8.025 9.47173 8.5875 9.16548 9.1875 8.75298C9.7875 8.34048 10.35 7.87173 10.875 7.34673C11.75 6.47173 12.4344 5.49985 12.9281 4.4311C13.4219 3.36235 13.6375 2.37798 13.575 1.47798C12.675 1.41548 11.6875 1.6311 10.6125 2.12485C9.5375 2.6186 8.5625 3.30298 7.6875 4.17798C7.1625 4.70298 6.69375 5.26548 6.28125 5.86548C5.86875 6.46548 5.5625 7.02798 5.3625 7.55298ZM8.7 6.33423C8.7 6.33423 8.62813 6.26235 8.48438 6.1186C8.34063 5.97485 8.26875 5.6936 8.26875 5.27485C8.26875 4.8561 8.4125 4.50298 8.7 4.21548C8.9875 3.92798 9.34375 3.78423 9.76875 3.78423C10.1938 3.78423 10.55 3.92798 10.8375 4.21548C11.125 4.50298 11.2688 4.8561 11.2688 5.27485C11.2688 5.6936 11.125 6.04673 10.8375 6.33423C10.55 6.62173 10.1938 6.76548 9.76875 6.76548C9.34375 6.76548 8.9875 6.62173 8.7 6.33423ZM9.05625 12.353L10.6313 10.778L10.425 9.72798C10.1 9.95298 9.775 10.1561 9.45 10.3374C9.125 10.5186 8.7875 10.6967 8.4375 10.8717L9.05625 12.353ZM14.925 0.109228C15.1625 1.62173 15.0156 3.0936 14.4844 4.52485C13.9531 5.9561 13.0375 7.32173 11.7375 8.62173L12.1125 10.478C12.1625 10.728 12.15 10.9717 12.075 11.2092C12 11.4467 11.875 11.653 11.7 11.828L8.55 14.978L6.975 11.2842L3.76875 8.07798L0.075 6.50298L3.20625 3.35298C3.38125 3.17798 3.59063 3.05298 3.83438 2.97798C4.07812 2.90298 4.325 2.89048 4.575 2.94048L6.43125 3.31548C7.73125 2.01548 9.09375 1.09673 10.5188 0.559228C11.9438 0.0217276 13.4125 -0.128272 14.925 0.109228ZM1.40625 10.4592C1.84375 10.0217 2.37812 9.79985 3.00938 9.7936C3.64063 9.78735 4.175 10.003 4.6125 10.4405C5.05 10.878 5.26562 11.4124 5.25938 12.0436C5.25313 12.6749 5.03125 13.2092 4.59375 13.6467C4.28125 13.9592 3.75938 14.228 3.02813 14.453C2.29688 14.678 1.2875 14.878 0 15.053C0.175 13.7655 0.375 12.7561 0.6 12.0249C0.825 11.2936 1.09375 10.7717 1.40625 10.4592ZM2.475 11.5092C2.35 11.6342 2.225 11.8624 2.1 12.1936C1.975 12.5249 1.8875 12.8592 1.8375 13.1967C2.175 13.1467 2.50938 13.0624 2.84063 12.9436C3.17188 12.8249 3.4 12.703 3.525 12.578C3.675 12.428 3.75625 12.2467 3.76875 12.0342C3.78125 11.8217 3.7125 11.6405 3.5625 11.4905C3.4125 11.3405 3.23125 11.2686 3.01875 11.2749C2.80625 11.2811 2.625 11.3592 2.475 11.5092Z" fill="#94A3B8"/>
                                </svg>
                            </div>
                            ${isFirst ? '<span class="label">код</span>' : ''}
                        </div>
                    </div>
                        
                    <div class="heart-box ${isFirst ? '' : 'compact'} ${activeClass}" onclick="event.stopPropagation(); addLike('${user.id}', this)">
                        <div class="heart-icon">
                            <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.5 13.7625L6.4125 12.7875C5.15 11.65 4.10625 10.6687 3.28125 9.8437C2.45625 9.0187 1.8 8.27808 1.3125 7.62183C0.825 6.96558 0.484375 6.36245 0.290625 5.81245C0.096875 5.26245 0 4.69995 0 4.12495C0 2.94995 0.39375 1.9687 1.18125 1.1812C1.96875 0.393701 2.95 -4.95911e-05 4.125 -4.95911e-05C4.775 -4.95911e-05 5.39375 0.13745 5.98125 0.412451C6.56875 0.68745 7.075 1.07495 7.5 1.57495C7.925 1.07495 8.43125 0.68745 9.01875 0.412451C9.60625 0.13745 10.225 -4.95911e-05 10.875 -4.95911e-05C12.05 -4.95911e-05 13.0313 0.393701 13.8188 1.1812C14.6063 1.9687 15 2.94995 15 4.12495C15 4.69995 14.9031 5.26245 14.7094 5.81245C14.5156 6.36245 14.175 6.96558 13.6875 7.62183C13.2 8.27808 12.5438 9.0187 11.7188 9.8437C10.8938 10.6687 9.85 11.65 8.5875 12.7875L7.5 13.7625ZM7.5 11.7375C8.7 10.6625 9.6875 9.74058 10.4625 8.97183C11.2375 8.20308 11.85 7.53433 12.3 6.96558C12.75 6.39683 13.0625 5.89058 13.2375 5.44683C13.4125 5.00308 13.5 4.56245 13.5 4.12495C13.5 3.37495 13.25 2.74995 12.75 2.24995C12.25 1.74995 11.625 1.49995 10.875 1.49995C10.2875 1.49995 9.74375 1.66558 9.24375 1.99683C8.74375 2.32808 8.4 2.74995 8.2125 3.26245H6.7875C6.6 2.74995 6.25625 2.32808 5.75625 1.99683C5.25625 1.66558 4.7125 1.49995 4.125 1.49995C3.375 1.49995 2.75 1.74995 2.25 2.24995C1.75 2.74995 1.5 3.37495 1.5 4.12495C1.5 4.56245 1.5875 5.00308 1.7625 5.44683C1.9375 5.89058 2.25 6.39683 2.7 6.96558C3.15 7.53433 3.7625 8.20308 4.5375 8.97183C5.3125 9.74058 6.3 10.6625 7.5 11.7375Z" fill="#0DCCF2"/>
                            </svg>
                        </div>
                        <span class="heart-num">${user.likes || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    `}).join('');
    
    let footerHtml ='';
    if (participants.length > 10 && !isExpanded) {
        const extraCount = participants.length - 10;
        footerHtml = `
            <div class="hall-footer">
                <div class="footer-link" onclick="expandHall()" style="cursor: pointer";>
                    <span class="footer-text">загрузить еще ${extraCount} решений</span>
                    <div class="footer-arrows">
                        <svg width="9" height="11" viewBox="0 0 9 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.5 10.05L0 5.55005L1.05 4.50005L4.5 7.9313L7.95 4.50005L9 5.55005L4.5 10.05ZM4.5 5.55005L0 1.05005L1.05 4.86374e-05L4.5 3.4313L7.95 4.86374e-05L9 1.05005L4.5 5.55005Z" fill="#64748B"/>
                        </svg>
                    </div>
                </div>
            </div>`;
    }
    grid.innerHTML = cardsHtml + footerHtml;
}
function expandHall() {
    isExpanded = true;
    renderHall();
}

loadHallMeta();
fetchParticipants();