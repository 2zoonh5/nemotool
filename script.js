const folderData = {
    pubg: { title: "배틀그라운드 매니저", apps: [{ id: "pubg-stat", name: "전적 검색", icon: "https://cdn-icons-png.flaticon.com/512/2893/2893051.png", url: "pubg-stat.html" }, { id: "pubg-map", name: "자기장 타이머", icon: "https://cdn-icons-png.flaticon.com/512/854/854878.png", url: "pubg-timer.html" }] },
    lol: { title: "리그오브레전드 매니저", apps: [{ id: "lol-memo", name: "롤모장 (맞밸)", icon: "https://cdn-icons-png.flaticon.com/512/825/825590.png", url: "lol-memo.html" }] },
    sudden: { title: "서든어택 매니저", apps: [{ id: "sudden-aim", name: "에임 조준선", icon: "https://cdn-icons-png.flaticon.com/512/5750/5750226.png", url: "sudden-aim.html" }] }
};

let minimizedWindows = {};
let lastClosedApp = null; 

document.addEventListener("DOMContentLoaded", () => {
    // [신규 기믹] 바탕화면 아이콘을 자동으로 미러링하여 고정 독바 아이콘 생성
    syncDesktopToDock();

    document.querySelectorAll("[data-folder]").forEach(folder => {
        folder.addEventListener("dblclick", (e) => { 
            e.stopPropagation(); 
            openFolder(folder.getAttribute("data-folder")); 
        });
    });

    document.addEventListener("click", () => {
        closeAllDropdowns();
        closeAllSystemPanels();
    });

    const desktop = document.querySelector(".desktop");
    desktop.addEventListener("click", () => {
        closeFolder();
        closeApp();
    });

    startMacClock();
});

// ⚓ [스마트 동적 바인딩] 바탕화면의 폴더 구조와 아이콘을 추적해 고정 독 리스트 순서대로 복제 빌드
function syncDesktopToDock() {
    const fixedDockList = document.getElementById("fixedDockList");
    const desktopIcons = document.querySelectorAll(".desktop .icon");
    
    fixedDockList.innerHTML = ""; // 초기화
    
    desktopIcons.forEach(icon => {
        const folderType = icon.getAttribute("data-folder");
        const imgSrc = icon.querySelector("img").src;
        const name = icon.querySelector("span").innerText;
        
        const dockItem = document.createElement("div");
        dockItem.className = "dock-item";
        dockItem.innerHTML = `
            <img src="${imgSrc}">
            <span class="dock-tooltip">${name}</span>
        `;
        
        // 하단바 아이콘 클릭 시 해당 폴더 다이렉트 팝업
        dockItem.addEventListener("click", (e) => {
            e.stopPropagation();
            openFolder(folderType);
        });
        
        fixedDockList.appendChild(dockItem);
    });
}

/* 🔍 [진짜 기능 작동] Spotlight 실시간 데스크탑 필터링 검색 엔진 */
function searchDesktop(query) {
    const icons = document.querySelectorAll(".desktop .icon");
    const cleanQuery = query.toLowerCase().trim();

    icons.forEach(icon => {
        const iconName = icon.querySelector(".icon-name").innerText.toLowerCase();
        if (iconName.includes(cleanQuery)) {
            icon.style.display = "flex";
            icon.style.opacity = "1";
            icon.style.transform = "scale(1)";
        } else {
            // 매칭되지 않는 아이콘은 투명화 및 축소 처리하며 부드럽게 숨김
            icon.style.opacity = "0";
            icon.style.transform = "scale(0.8)";
            setTimeout(() => {
                if(icon.style.opacity === "0") icon.style.display = "none";
            }, 200);
        }
    });
}

// 🔊 [제어센터 기능 연동] 가상 오디오 볼륨 제어 핸들러
function updateWebVolume(volume) {
    document.getElementById('volumeVal').innerText = volume + '%';
    // 웹OS 내부에 탑재될 iframe 및 모든 오디오 엘리먼트 볼륨 실시간 컨트롤 구조 확보
    const iframes = document.querySelectorAll("iframe");
    iframes.forEach(iframe => {
        try {
            if(iframe.contentWindow.document.querySelector("audio")) {
                iframe.contentWindow.document.querySelectorAll("audio").forEach(aud => aud.volume = volume / 100);
            }
        } catch(e) { /* 크로스 도메인 예방 블록 */ }
    });
}

/* 패널 제어 로직 */
function toggleDropdown(event, id) {
    event.stopPropagation(); 
    closeAllSystemPanels(); 
    const target = document.getElementById(id);
    const isOpen = target.style.display === "block";
    
    closeAllDropdowns(); 
    if (!isOpen) target.style.display = "block";
}

function closeAllDropdowns() {
    document.querySelectorAll(".mac-dropdown").forEach(menu => menu.style.display = "none");
}

function toggleSystemPanel(event, id) {
    event.stopPropagation();
    closeAllDropdowns(); 
    const target = document.getElementById(id);
    const isOpen = target.style.display === "flex";

    closeAllSystemPanels();
    if (!isOpen) {
        target.style.display = "flex";
        if(id === 'spotlightPanel') {
            const input = document.getElementById("spotlightInput");
            input.value = ""; // 초기화
            searchDesktop(""); // 바탕화면 복원
            setTimeout(() => input.focus(), 50);
        }
    }
}

function closeAllSystemPanels() {
    const spotlight = document.getElementById("spotlightPanel");
    const control = document.getElementById("controlPanel");
    if(spotlight) spotlight.style.display = "none";
    if(control) control.style.display = "none";
}

function changeBg(theme) {
    const body = document.body;
    body.className = ""; 
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
    
    // 유저 피드백 반영: 흰색 점을 영구 제거한 순수 플랫 디자인
    dockItem.innerHTML = `
        <img src="${useIcon}">
        <span class="dock-tooltip">${actualTitle}</span>
    `;
    
    dockItem.addEventListener("click", (e) => { e.stopPropagation(); restoreWindow(windowId); });
    minimizedList.appendChild(dockItem);
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

/* 🕒 [1번 피드백 반영] 시계 서식을 h:mm a (예: 11:24 AM)로 전면 포맷팅 보정 */
function startMacClock() {
    const clockElement = document.getElementById("macClock");
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12 || 12; // 12시간제 변환
        
        if (clockElement) {
            clockElement.innerText = `${hours}:${minutes} ${ampm}`;
        }
    }
    updateClock();
    setInterval(updateClock, 1000);
}
