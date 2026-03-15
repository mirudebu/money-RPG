let waterCount = 0;
let currentViewDate = new Date();
const moodColors = { "😊": "#F2CDAC", "😡": "#EF9A9A", "😢": "#90CAF9", "😆": "#FFE082" };

window.onload = () => {
    document.getElementById('currentDateDisplay').innerText = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
    renderCalendar();
};

function showPage(pageId, btnEl) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(pageId + 'Page').classList.add('active');
    btnEl.classList.add('active');
    if(pageId === 'history') renderCalendar();
}

function addWater(amount) {
    waterCount += amount;
    updateWaterUI();
}

function resetWater() {
    if(confirm("重置今日飲水？")) { waterCount = 0; updateWaterUI(); }
}

function updateWaterUI() {
    document.getElementById('waterValue').innerText = waterCount;
    const percent = Math.min((waterCount / 2000) * 100, 100);
    document.getElementById('waterLevel').style.height = percent + "%";
}

function saveData() {
    const todayStr = new Date().toLocaleDateString();
    const record = {
        date: todayStr,
        water: waterCount,
        poop: document.querySelector('input[name="poop"]:checked').value,
        exercise: document.querySelector('input[name="exercise"]:checked').value,
        mood: document.querySelector('input[name="mood"]:checked').value,
        note: document.getElementById('moodNote').value
    };

    let history = JSON.parse(localStorage.getItem('healthHistory') || "[]");
    const idx = history.findIndex(h => h.date === todayStr);
    if(idx > -1) history[idx] = record; else history.unshift(record);

    localStorage.setItem('healthHistory', JSON.stringify(history));
    alert("紀錄成功 ✨");
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const title = document.getElementById('monthTitle');
    grid.innerHTML = "";
    const y = currentViewDate.getFullYear(), m = currentViewDate.getMonth();
    title.innerText = `${y}年 ${m + 1}月`;

    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const history = JSON.parse(localStorage.getItem('healthHistory') || "[]");

    for (let i = 0; i < firstDay; i++) grid.innerHTML += `<div></div>`;

    for (let d = 1; d <= daysInMonth; d++) {
        const loopDate = new Date(y, m, d).toLocaleDateString();
        const dayData = history.find(h => h.date === loopDate);
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.innerText = d;
        if(dayData) {
            dayEl.style.backgroundColor = moodColors[dayData.mood] || "#E0EAEA";
            dayEl.style.color = "#FFF";
            dayEl.style.fontWeight = "bold";
        }
        dayEl.onclick = () => showDetail(dayData, `${y}/${m+1}/${d}`);
        grid.appendChild(dayEl);
    }
}

function showDetail(dayData, dateStr) {
    const detail = document.getElementById('selectedDetail');
    detail.style.display = "block";
    if(dayData) {
        detail.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <strong style="color:var(--td-teal-deep)">${dateStr}</strong>
                <span style="font-size:24px;">${dayData.mood}</span>
            </div>
            <div class="detail-stats-grid">
                <div class="stat-box"><span class="stat-label">飲水</span><span class="stat-value">${dayData.water}ml</span></div>
                <div class="stat-box"><span class="stat-label">排便</span><span class="stat-value">${dayData.poop}</span></div>
                <div class="stat-box"><span class="stat-label">運動</span><span class="stat-value">${dayData.exercise === '有運動' ? '💪' : '☕'}</span></div>
            </div>
            <div class="detail-note-section">
                <strong>心情筆記：</strong><br>${dayData.note || "無備註"}
            </div>
        `;
    } else {
        detail.innerHTML = `<h4>${dateStr}</h4><p style="color:#999;font-size:13px;">尚未紀錄數據</p>`;
    }
}

function changeMonth(step) {
    currentViewDate.setMonth(currentViewDate.getMonth() + step);
    renderCalendar();
}