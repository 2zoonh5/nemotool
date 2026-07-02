const folderData = {
    pubg: {
        title: "배틀그라운드 매니저",
        apps: [
            { id: "pubg-stat", name: "전적 검색", icon: "https://cdn-icons-png.flaticon.com/512/2893/2893051.png", url: "pubg-stat.html" },
            { id: "pubg-map", name: "자기장 타이머", icon: "https://cdn-icons-png.flaticon.com/512/854/854878.png", url: "pubg-timer.html" }
        ]
    },
    lol: {
        title: "리그오브레전드 매니저",
        apps: [
            { id: "lol-memo", name: "롤모장 (맞밸)", icon: "https://cdn-icons-png.flaticon.com/512/825/825590.png", url: "lol-memo.html" }
        ]
    },
    sudden: {
        title: "서든어택 매니저",
        apps: [
            { id: "sudden-aim", name: "에임 조준선", icon: "https://cdn-icons-png.flaticon.com/512/5750/5750226.png", url: "sudden-aim.html" }
        ]
    }
};

let minimizedWindows = {};

document.addEventListener("DOMContentLoaded", () => {
    const folders = document.querySelectorAll("[data-folder]");
    
    folders.forEach(folder => {
        folder.addEventListener("dblclick", (e) => {
            e.stopPropagation(); 
            const folderType = folder.getAttribute("data-folder");
            openFolder(folderType);
        });
        folder.addEventListener("click", (e) => { e.stopPropagation(); });
    });

    const popups = document.querySelectorAll(".window-popup");
    popups.forEach(popup => {
        popup.addEventListener("click", (e) => { e.stopPropagation(); });
        popup.addEventListener("dblclick", (e) => { e.stopPropagation(); });
    });

    const desktop = document.querySelector(".desktop");
    desktop.addEventListener("click", () => {
        closeFolder();
        closeApp();
    });

    startMacClock();
});

function openFolder(type) {
    const folderWindow = document.getElementById("folderWindow");
    const folderTitle = document.getElementById("folderTitle");
    const folderContent = document.getElementById("folderContent");
    
    const data = folderData[type];
    if (!data) return;

    folderWindow.setAttribute("data-current-folder", type);
    folderTitle.innerText = data.title;
    folderContent.innerHTML = ""; 

    data.apps.forEach(app => {
        const iconDiv = document.createElement("div");
        iconDiv.className = "icon";
        iconDiv.innerHTML = `
            <img src="${app.icon}" alt="${app.name}">
            <span class="icon-name">${app.name}</span>
        `;
        iconDiv.addEventListener("click", (e) => { e.stopPropagation(); });
        iconDiv.addEventListener("dblclick", (e) => {
            e.stopPropagation(); 
            openApp(app.url, app.name);
        });
        folderContent.appendChild(iconDiv);
    });

    folderWindow.style.display = "flex";
}

function closeFolder() {
    document.getElementById("folderWindow").style.display = "none";
    document.getElementById("folderWindow").classList.remove("maximized");
    removeFromDock("folderWindow");
}

function openApp(url, name) {
    const windowPopup = document.getElementById("appWindow");
    const appFrame = document.getElementById("appFrame");
    const windowTitle = document.getElementById("windowTitle");

    appFrame.src = url;
    windowTitle.innerText = name;
    windowPopup.style.display = "flex";
}

function closeApp() {
    const windowPopup = document.getElementById("appWindow");
    const appFrame = document.getElementById("appFrame");
    if (windowPopup) {
        windowPopup.style.display = "none";
        windowPopup.classList.remove("maximized");
        appFrame.src = ""; 
    }
    removeFromDock("appWindow");
    closeFolder(); 
}

// ◀ 왼쪽에 새로 배치된 화살표 누를 때 작동할 찐 뒤로가기
function backToFolder() {
    const windowPopup = document.getElementById("appWindow");
    const appFrame = document.getElementById("appFrame");
    if (windowPopup) {
        windowPopup.style.display = "none";
        windowPopup.classList.remove("maximized");
        appFrame.src = "";
    }
    removeFromDock("appWindow");
}

// 🟡 노란색 버튼: 독바 영역 업데이트 처리 연동
function minimizeWindow(windowId, displayName) {
    const targetWindow = document.getElementById(windowId);
    targetWindow.style.display = "none";
    
    if (minimizedWindows[windowId]) return;
    minimizedWindows[windowId] = true;
    
    const minimizedList = document.getElementById("minimizedList");
    const folderIcon = "https://cdn-icons-png.flaticon.com/512/3767/3767084.png";
    const appIcon = "https://cdn-icons-png.flaticon.com/512/2893/2893051.png";
    const useIcon = (windowId === 'folderWindow') ? folderIcon : appIcon;

    const dockItem = document.createElement("div");
    dockItem.className = "dock-item";
    dockItem.id = `dock-slot-${windowId}`;
    dockItem.innerHTML = `
        <img src="${useIcon}" alt="minimized">
        <span class="dock-tooltip">${displayName}</span>
    `;
    
    dockItem.addEventListener("click", (e) => {
        e.stopPropagation();
        restoreWindow(windowId);
    });

    minimizedList.appendChild(dockItem);
    updateDockVisibility(); // 독바 가시성 업데이트 호출
}

function restoreWindow(windowId) {
    const targetWindow = document.getElementById(windowId);
    if (targetWindow) {
        targetWindow.style.display = "flex";
    }
    removeFromDock(windowId);
}

function removeFromDock(windowId) {
    delete minimizedWindows[windowId];
    const slot = document.getElementById(`dock-slot-${windowId}`);
    if (slot) {
        slot.remove();
    }
    updateDockVisibility(); // 독바 가시성 업데이트 호출
}

// ★ 하단 바 제어 로직: 최소화된 슬롯 아이콘 개수가 0개이면 아래로 숨기고, 1개 이상일 때만 위로 띄움
function updateDockVisibility() {
    const dockContainer = document.getElementById("macDockContainer");
    const itemCount = Object.keys(minimizedWindows).length;
    
    if (itemCount > 0) {
        dockContainer.classList.add("active");
    } else {
        dockContainer.classList.remove("active");
    }
}

// 🟢 초록색 버튼: 전체화면 토글
function toggleMaximize(windowId) {
    const targetWindow = document.getElementById(windowId);
    if (targetWindow) {
        targetWindow.classList.toggle("maximized");
    }
}

// 시계 시스템
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
            clockElement.innerText = `${month}월 ${date}일 (${dayOfWeek}) ${ampm} ${hours}:${minutes}`;
        }
    }
    updateClock();
    setInterval(updateClock, 1000);
}
