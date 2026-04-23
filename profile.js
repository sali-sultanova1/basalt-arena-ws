const API_URL  = 'https://69e78e0368208c1debe9130a.mockapi.io/api/v1/participants';

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

async function loadMyProfile() {
    try {
        const userId = localStorage.getItem('loggedInUserId') || '11'; 
        const userRes = await fetch(`${API_URL}/${userId}`);
        const user = await userRes.json();
        if (!user || user === "Not found") {
            return;
        }

        window.currentProfileData = user; 
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
        
        if (document.querySelector('.profile-nickname')) 
            document.querySelector('.profile-nickname').textContent = `@${user.tg}`;
        if (document.querySelector('.profile-bio')) 
            document.querySelector('.profile-bio').textContent = user.bio;
        if (document.querySelector('.tech-text')) 
            document.querySelector('.tech-text').textContent = user.stack;
        if (document.querySelector('.avatar-img img')) 
            document.querySelector('.avatar-img img').src = user.avatar;

        const stats = document.querySelectorAll('.stat-value');
        if (stats.length >= 4) {
            stats[0].textContent = user.score || 0;             
            stats[1].textContent = `#${user.globalRate || 0}`;  
            stats[2].textContent = user.sprintNum || 0;         
            const moneyVal = user.money ? Number(user.money).toLocaleString() : '0';
            stats[3].textContent = `${moneyVal} ₽`; 
        }

        const badges = document.querySelectorAll('.badge-text');
        if (badges.length >= 4) {
            badges[0].textContent = `${user.scoreGrowth || '+0%'} за месяц`;
            badges[1].textContent = user.rankGrowth || '+0 позиций';
            badges[2].textContent = `${user.sprintParticipation || '0%'} участия`;
            badges[3].textContent = `${user.moneyGrowth || '+0'} ₽`;
        }

        const badgeContainers = document.querySelectorAll('.stat-badge');

        if (badges.length >= 4) {
            const growthData = [
                { val: user.scoreGrowth, unit: " за месяц" },
                { val: user.rankGrowth,  unit: "" },
                { val: user.sprintParticipation, unit: " участия" },
                { val: user.moneyGrowth, unit: " ₽" }
            ];

            growthData.forEach((item, i) => {
                if (badges[i]) {
                    badges[i].textContent = item.val ? `${item.val}${item.unit}` : `+0${item.unit}`;
                    if (item.val && item.val.includes('-')) {
                        badgeContainers[i].style.background = "rgba(255, 71, 71, 0.15)";
                        badges[i].style.color = "#FF4747";
                        const icon = badgeContainers[i].querySelector('svg path');
                        if (icon) icon.style.fill = "#FF4747";
                    }
                }
            });
        }

        const contactValues = document.querySelectorAll('.contact-value');
        if (contactValues.length >= 3) {
            contactValues[0].textContent = `@${user.tg}`;
            contactValues[1].textContent = user.email;
            contactValues[2].textContent = user.gitLink ? `/${user.gitLink}` : "—";
        }

        const achGrid = document.querySelector('.achievements-grid');
        if (achGrid && user.achievements) {
            achGrid.innerHTML = user.achievements.map(ach => {
                const cardClass = ach.disabled ? 'disabled' : '';
                const circleClass = ach.disabled ? 'border-red' : '';
                const nameClass = ach.disabled ? 'text-pink' : '';
                return `
                <div class="ach-card ${cardClass}">
                    <div class="ach-icon-wrapper">
                        <div class="ach-icon-circle ${circleClass}">${ach.iconPath}</div>
                    </div>
                    <div class="ach-info">
                        <h3 class="ach-name ${nameClass}">${ach.name}</h3>
                        <p class="ach-description">${ach.desc}</p>
                    </div>
                </div>`;
            }).join('');
        }

        const allInputs = document.querySelectorAll('.input-control');
        if (allInputs.length >= 3) {
            allInputs[0].value = user.name || "";
            allInputs[1].value = user.email || "";
            allInputs[2].value = user.tg || "";
        }
        const textArea = document.querySelector('.textarea-control');
        if (textArea) textArea.value = user.bio;

    } catch (err) {
        console.error("Ошибка загрузки:", err);
    }
}

const cancelBtn = document.querySelector('.btn-cancel');
if (cancelBtn) {
    cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.currentProfileData) {
            const inputs = document.querySelectorAll('.input-control');
            const bioTextarea = document.querySelector('.textarea-control');

            if (inputs.length >= 3) {
                inputs[0].value = window.currentProfileData.name || "";
                inputs[1].value = window.currentProfileData.email || "";
                inputs[2].value = `@${window.currentProfileData.tg || ""}`;
            }
            if (bioTextarea) bioTextarea.value = window.currentProfileData.bio || "";
        }
    });
}

const saveBtn = document.querySelector('.btn-save'); 
if (saveBtn) {
    saveBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const userId = localStorage.getItem('loggedInUserId') || '11'; 
        const inputs = document.querySelectorAll('.input-control');
        const bioTextarea = document.querySelector('.textarea-control');

        const updatedData = {
            name: inputs[0].value,
            email: inputs[1].value,                
            tg: inputs[2].value.replace('@', ''),
            bio: bioTextarea ? bioTextarea.value : ""
        };

        try {
            saveBtn.disabled = true;
            const res = await fetch(`${API_URL}/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (res.ok) {
                const btnSpan = saveBtn.querySelector('.btn-save-text');
                if (btnSpan) {
                    const original = btnSpan.textContent;
                    btnSpan.textContent = 'Сохранено';
                    setTimeout(() => { btnSpan.textContent = original; }, 2000);
                }

                const headerName = document.querySelector('.profile-details .username');
                if (headerName) headerName.textContent = updatedData.name;
                
                const mainProfileName = document.querySelector('.profile-nickname');
                if (mainProfileName) {
                    mainProfileName.textContent = `@${updatedData.name}`
                }

                if (document.querySelector('.profile-bio')) 
                    document.querySelector('.profile-bio').textContent = updatedData.bio;

                const contactValues = document.querySelectorAll('.contact-value');
                if (contactValues.length >= 2) {
                    contactValues[0].textContent = `@${updatedData.tg}`;
                    contactValues[1].textContent = updatedData.email;
                }
                window.currentProfileData = { ...window.currentProfileData, ...updatedData };
            }
        } catch (err) {
            console.error("Ошибка:", err);
        } finally {
            saveBtn.disabled = false;
        }
    });
}

loadMyProfile();