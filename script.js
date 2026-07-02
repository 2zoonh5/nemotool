const folderData = {
    pubg: { title: "배틀그라운드 매니저", apps: [{ id: "pubg-stat", name: "전적 검색", icon: "https://cdn-icons-png.flaticon.com/512/2893/2893051.png", url: "pubg-stat.html" }, { id: "pubg-map", name: "자기장 타이머", icon: "https://cdn-icons-png.flaticon.com/512/854/854878.png", url: "pubg-timer.html" }] },
    lol: { title: "리그오브레전드 매니저", apps: [{ id: "lol-memo", name: "롤모장 (맞밸)", icon: "https://cdn-icons-png.flaticon.com/512/825/825590.png", url: "lol-memo.html" }] },
    sudden: { title: "서든어택 매니저", apps: [{ id: "sudden-aim", name: "에임 조준선", icon: "https://cdn-icons-png.flaticon.com/512/5750/5750226.png", url: "sudden-aim.html" }] }
};

let minimizedWindows = {};
let lastClosedApp = null; 

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-folder]").forEach(folder => {
        folder.addEventListener("dblclick", (e) => { 
            e.stopPropagation(); 
            openFolder(folder.getAttribute("data-folder")); 
        });
    });

    // 바탕화면이나 빈 공간 누르면 활성화된 모든 드롭다운 메뉴 및 윈도우 파괴 소거
    document.addEventListener("click", () => {
        closeAllDropdowns();
    });

    const desktop = document.querySelector(".desktop");
    desktop.addEventListener("click", () => {
        closeFolder();
        closeApp();
    });

    startMacClock();
});

/* ⬇️ 상단바 드롭다운 전용 스크립트 모듈 */
function toggleDropdown(event, id) {
    event.stopPropagation(); // 바탕화면 클릭으로 인식되어 꺼지는 버그 예방
    const target = document.getElementById(id);
    const isOpen = target.style.display === "block";
    
    closeAllDropdowns(); // 다른 열린 드롭다운 먼저 리셋
    if (!isOpen) {
        target.style.display = "block";
    }
}

function closeAllDropdowns() {
    document.querySelectorAll(".mac-dropdown").forEach(menu => {
        menu.style.display = "none";
    });
}

// 드롭다운 메뉴 내 배경화면 스위칭 연동
function changeBg(theme) {
    const body = document.body;
    body.className = ""; // 클래스 초기화
    if (theme === 'sunset') body.classList.add("bg-sunset");
    if (theme === 'cyber') body.classList.add("bg-cyber");
    closeAllDropdowns();
}

function openFolder(type) {
    const folderWindow = document.getElementById("folderWindow");
    const data = folderData[type];
    if (!data) return;

    folderWindow.setAttribute("data-current-folder", type);
    folderWindow.setAttribute("data-icon", "https://cdn-icons-png.flaticon.com/512/3767/3767084.png");
    
    document.getElementById("folderTitle").innerText = data.title;
    const content = document.getElementById("folderContent");
    content.innerHTML = ""; 

    data.apps.forEach(app => {
        const iconDiv = document.createElement("div");
        iconDiv.className = "icon";
        iconDiv.innerHTML = `<img src="${app.icon}"> <span class="icon-name">${app.name}</span>`;
        iconDiv.addEventListener("dblclick", (e) => { 
            e.stopPropagation(); 
            openApp(app.url, app.name, app.icon); 
        });
        content.appendChild(iconDiv);
    });
    folderWindow.style.display = "flex";
    updateForwardButtonState();
}

function minimizeWindow(windowId) {
    const targetWindow = document.getElementById(windowId);
    const actualTitle = targetWindow.querySelector('.window-title').innerText;
    const useIcon = targetWindow.getAttribute("data-icon") || "https://cdn-icons-png.flaticon.com/512/3767/3767084.png";

    targetWindow.style.display = "none";
    
    if (minimizedWindows[windowId]) return;
    minimizedWindows[windowId] = true;
    
    const minimizedList = document.getElementById("minimizedList");
    const dockItem = document.createElement("div");
    dockItem.className = "dock-item";
    dockItem.id = `dock-slot-${windowId}`;
    
    dockItem.innerHTML = `
        <img src="${useIcon}">
        <span class="dock-tooltip">${actualTitle}</span>
    `;
    
    dockItem.addEventListener("click", (e) => { e.stopPropagation(); restoreWindow(windowId); });
    minimizedList.appendChild(dockItem);
    updateDockVisibility();
}

function restoreWindow(windowId) {
    const targetWindow = document.getElementById(windowId);
    if (targetWindow) targetWindow.style.display = "flex";
    removeFromDock(windowId);
}

function removeFromDock(windowId) {
    delete minimizedWindows[windowId];
    const slot = document.getElementById(`dock-slot-${windowId}`);
    if (slot) slot.remove();
    updateDockVisibility();
}

function updateDockVisibility() {
    const dockContainer = document.getElementById("macDockContainer");
    dockContainer.classList.toggle("active", Object.keys(minimizedWindows).length > 0);
}

function closeFolder() {
    document.getElementById("folderWindow").style.display = "none";
    document.getElementById("folderWindow").classList.remove("maximized");
    removeFromDock("folderWindow");
    lastClosedApp = null;
    updateForwardButtonState();
}

function openApp(url, name, icon) {
    document.getElementById("folderWindow").style.display = "none"; 
    const windowPopup = document.getElementById("appWindow");
    
    windowPopup.setAttribute("data-icon", icon);
    
    document.getElementById("appFrame").src = url;
    document.getElementById("windowTitle").innerText = name; 
    windowPopup.style.display = "flex";
}

function closeApp() {
    const windowPopup = document.getElementById("appWindow");
    windowPopup.style.display = "none";
    windowPopup.classList.remove("maximized");
    removeFromDock("appWindow");
    lastClosedApp = null;
    closeFolder(); 
}

function backToFolder() {
    const windowPopup = document.getElementById("appWindow");
    if (windowPopup.style.display !== "none") {
        lastClosedApp = { 
            url: document.getElementById("appFrame").src, 
            name: document.getElementById("windowTitle").innerText,
            icon: windowPopup.getAttribute("data-icon")
        };
        windowPopup.style.display = "none";
    }
    removeFromDock("appWindow");
    document.getElementById("folderWindow").style.display = "flex";
    updateForwardButtonState();
}

function forwardToApp() {
    if (!lastClosedApp) return;
    openApp(lastClosedApp.url, lastClosedApp.name, lastClosedApp.icon);
    lastClosedApp = null; 
    updateForwardButtonState();
}

function updateForwardButtonState() {
    const forwardBtn = document.getElementById("folderForwardBtn");
    forwardBtn.classList.toggle("disabled", !lastClosedApp);
}

function toggleMaximize(windowId) {
    document.getElementById(windowId).classList.toggle("maximized");
}

/* 🕒 4번 요구사항 반영: 가독성을 올린 정교한 Mac OS 고증 시계 메커니즘 */
function startMacClock() {
    const clockElement = document.getElementById("macClock");
    function updateClock() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const date = now.getDate();
        const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
        const dayOfWeek = weekDays[now.getDay()];
        
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? '오후' : '오전';
        hours = hours % 12 || 12;
        
        if (clockElement) {
            // 실제 Mac OS 표기 규격과 100% 동일하게 레이아웃 보정
            clockElement.innerText = `${month}월 ${date}일 (${dayOfWeek}) ${ampm} ${hours}:${minutes}`;
        }
    }
    updateClock();
    setInterval(updateClock, 1000);
}
