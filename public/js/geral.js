let getDailyViewsInterval;
let getMonthlyViewsInterval;
let getTotalViewsInterval;
const apiBaseUrl = "{{{apiBaseUrl}}}".replace(/&quot;/g, '');
const apiKey = "{{apiKey}}".replace(/&quot;/g, '');

function copyLink(link, button) {
    navigator.clipboard.writeText(link)
        .then(() => {
            button.style.backgroundColor = 'green';
            button.textContent = 'Link copiado!';
            setTimeout(() => {
                button.style.backgroundColor = '';
                button.textContent = 'Copiar Link';
            }, 3000);
        })
        .catch(() => {
            button.style.backgroundColor = 'red';
            button.textContent = 'Erro!';
            setTimeout(() => {
                button.style.backgroundColor = '';
                button.textContent = 'Copiar Link';
            }, 3000);
        });
}

async function getDailyViews() {
    try {
        const response = await fetch(`${apiBaseUrl}/api/dailyviews`);
        if (response.ok) {
            const data = await response.json();
            const viewCountElement = document.getElementById('dailyViews');
            viewCountElement.textContent = data.counter;
        } else {
            console.error('Erro ao obter contador:', response.status);
        }
    } catch (error) {
        console.error('Erro na requisição GET:', error);
    }
}

async function getMonthlyViews() {
    try {
        const response = await fetch(`${apiBaseUrl}/api/monthlyviews`);
        if (response.ok) {
            const data = await response.json();
            const viewCountElement = document.getElementById('monthlyViews');
            viewCountElement.textContent = data.counter;
        } else {
            console.error('Erro ao obter contador:', response.status);
        }
    } catch (error) {
        console.error('Erro na requisição GET:', error);
    }
}

async function getTotalViews() {
    try {
        const response = await fetch(`${apiBaseUrl}/api/totalviews`);
        if (response.ok) {
            const data = await response.json();
            const viewCountElement = document.getElementById('totalViews');
            viewCountElement.textContent = data.counter;
        } else {
            console.error('Erro ao obter contador:', response.status);
        }
    } catch (error) {
        console.error('Erro na requisição GET:', error);
    }
}

async function incrementViews() {
    try {
        const response = await fetch(`${apiBaseUrl}/api/incrementViews`, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            getDailyViews();
            getMonthlyViews();
            getTotalViews();
        } else {
            console.error('Erro ao incrementar contador:', response.status);
        }
    } catch (error) {
        console.error('Erro na requisição POST:', error);
    }
}

function startAutoUpdateViews() {
    getDailyViewsInterval = setInterval(getDailyViews, 10000);
    getMonthlyViewsInterval = setInterval(getMonthlyViews, 10000);
    getTotalViewsInterval = setInterval(getTotalViews, 10000);
}

function stopAutoUpdateViews() {
    if (getDailyViewsInterval) {
        clearInterval(getDailyViewsInterval);
    }
    if (getMonthlyViewsInterval) {
        clearInterval(getMonthlyViewsInterval);
    }
    if (getTotalViewsInterval) {
        clearInterval(getTotalViewsInterval);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    Promise.all([
        getDailyViews(),
        getMonthlyViews(),
        getTotalViews(),
    ]).then(() => {
        incrementViews();
        startAutoUpdateViews();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            startAutoUpdateViews();
        } else {
            stopAutoUpdateViews();
        }
    });
});