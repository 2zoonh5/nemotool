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
    startMacClock();
});

function openFolder(type) {
    const folderWindow = document.getElementById("folderWindow");
    const data = folderData[type];
    if (!data) return;

    folderWindow.setAttribute("data-current-folder", type);
    // [보완] 폴더 창이 열릴 때 기본 폴더 노란색 아이콘을 기억하게 세팅
    folderWindow.setAttribute("data-icon", "https://cdn-icons-png.flaticon.com/512/3767/3767084.png");
    
    document.getElementById("folderTitle").innerText = data.title;
    const content = document.getElementById("folderContent");
    content.innerHTML = ""; 

    data.apps.forEach(app => {
        const iconDiv = document.createElement("div");
        iconDiv.className = "icon";
        iconDiv.innerHTML = `<img src="${app.icon}"> <span class="icon-name">${app.name}</span>`;
        // [보완] 실행 시 고유 앱 아이콘 주소까지 함께 전달하도록 수정
        iconDiv.addEventListener("dblclick", (e) => { 
            e.stopPropagation(); 
            openApp(app.url, app.name, app.icon); 
        });
        content.appendChild(iconDiv);
    });
    folderWindow.style.display = "flex";
    updateForwardButtonState();
}

// 🟡 보완된 최소화 함수: 제목과 개별 아이콘을 동적으로 정확하게 추출
function minimizeWindow(windowId) {
    const targetWindow = document.getElementById(windowId);
    const actualTitle = targetWindow.querySelector('.window-title').innerText;
    
    // [완벽 동기화] 창에 세팅된 개별 아이콘 이미지 주소를 완벽하게 읽어옴
    const useIcon = targetWindow.getAttribute("data-icon") || "https://cdn-icons-png.flaticon.com/512/3767/3767084.png";

    targetWindow.style.display = "none";
    
    if (minimizedWindows[windowId]) return;
    minimizedWindows[windowId] = true;
    
    const minimizedList = document.getElementById("minimizedList");

    const dockItem = document.createElement("div");
    dockItem.className = "dock-item";
    dockItem.id = `dock-slot-${windowId}`;
    
    // 알맞은 전용 아이콘과 타이틀 주입
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

// [보완] 앱이 켜질 때 해당 프로그램의 전용 아이콘 주소를 캐싱하도록 인자 추가
function openApp(url, name, icon) {
    document.getElementById("folderWindow").style.display = "none"; 
    const windowPopup = document.getElementById("appWindow");
    
    // 창 자체가 현재 실행된 앱의 아이콘 주소를 저장하도록 설계
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
            icon: windowPopup.getAttribute("data-icon") // 아이콘 상태 보존
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

function startMacClock() {
    const clockElement = document.getElementById("macClock");
    function updateClock() {
        const now = new Date();
        const ampm = now.getHours() >= 12 ? '오후' : '오전';
        const hours = now.getHours() % 12 || 12;
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clockElement.innerText = `${now.getMonth() + 1}월 ${now.getDate()}일 ${ampm} ${hours}:${minutes}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
}
