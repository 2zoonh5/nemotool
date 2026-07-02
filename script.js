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

// 최소화 상태를 관리하는 객체
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

    // 바탕화면 클릭 시 (단, 최소화된 것이 아닐 때만) 열려있는 모든 것 완전 종료
    const desktop = document.querySelector(".desktop");
    desktop.addEventListener("click", () => {
        closeFolder();
        closeApp();
    });

    startMacClock();
});

// 폴더 창 열기
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

    // 최소화되어있던 상태라면 초기화
    folderWindow.style.display = "flex";
}

// 🔴 빨간 버튼: 폴더 창 완전 종료 및 독 리스트에서 제외
function closeFolder() {
    document.getElementById("folderWindow").style.display = "none";
    document.getElementById("folderWindow").classList.remove("maximized");
    removeFromDock("folderWindow");
}

// 프로그램 창 열기
function openApp(url, name) {
    const windowPopup = document.getElementById("appWindow");
    const appFrame = document.getElementById("appFrame");
    const windowTitle = document.getElementById("windowTitle");

    appFrame.src = url;
    windowTitle.innerText = name;
    windowPopup.style.display = "flex";
}

// 🔴 빨간 버튼: 프로그램 창 완전 종료 및 독 리스트에서 제거
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

// 🟡 노란색 버튼: 창을 숨기고 하단 Dock 바 오른쪽에 축소 아이콘 생성
function minimizeWindow(windowId, displayName) {
    const targetWindow = document.getElementById(windowId);
    targetWindow.style.display = "none"; // 창 숨김
    
    // 이미 독바에 등록되어 있다면 중복 생성 금지
    if (minimizedWindows[windowId]) return;

    minimizedWindows[windowId] = true;
    
    // 독 리스트 영역 가져오기
    const minimizedList = document.getElementById("minimizedList");
    
    // 임시 슬롯 생성 (실제 가상 폴더인지 아이콘인지 매핑 이미지 분기)
    const folderIcon = "https://cdn-icons-png.flaticon.com/512/3767/3767084.png";
    const appIcon = "https://cdn-icons-png.flaticon.com/512/2893/2893051.png";
    const useIcon = (windowId === 'folderWindow') ? folderIcon : appIcon;

    const dockItem = document.createElement("div");
    dockItem.className = "dock-item";
    dockItem.id = `dock-slot-${windowId}`;
    dockItem.innerHTML = `
        <img src="${useIcon}" alt="minimized">
        <span class="dock-tooltip">${displayName} (최소화됨)</span>
    `;
    
    // 클릭하면 다시 창 복원시키고 독바에서 제거
    dockItem.addEventListener("click", (e) => {
        e.stopPropagation();
        restoreWindow(windowId);
    });

    minimizedList.appendChild(dockItem);
}

// 최소화 해제 복원 기능
function restoreWindow(windowId) {
    const targetWindow = document.getElementById(windowId);
    if (targetWindow) {
        targetWindow.style.display = "flex"; // 복원
    }
    removeFromDock(windowId);
}

// 독 바에서 끄기 전용 클리너 
function removeFromDock(windowId) {
    delete minimizedWindows[windowId];
    const slot = document.getElementById(`dock-slot-${windowId}`);
    if (slot) {
        slot.remove();
    }
}

// 🟢 초록색 버튼: 실제 맥북처럼 전체화면 토글 시스템 구동
function toggleMaximize(windowId) {
    const targetWindow = document.getElementById(windowId);
    if (targetWindow) {
        targetWindow.classList.toggle("maximized");
    }
}

// Mac OS 실시간 시계
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
