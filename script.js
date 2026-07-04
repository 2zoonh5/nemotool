const folderData = {
    pubg: { title: "배틀그라운드", apps: [{ id: "pubg-gacha", name: "가챠머신", icon: "p_gacha_icon.png", url: "pubg-gacha.html" }] },
    lol: { title: "리그오브레전드", apps: [{ id: "lol-memo", name: "롤모장", icon: "l_memo_icon.png", url: "lol-memo.html" }] },
    sudden: { title: "서든어택", apps: [{ id: "sa-memo", name: "서모장", icon: "s_memo_icon.png", url: "sa-memo.html" }] }
};

let minimizedWindows = {};
let lastClosedApp = null; 

// 각 앱별 iframe 내부의 데이터나 입력값을 저장해 둘 가상 메모리 공간
let appSessions = {};

document.addEventListener("DOMContentLoaded", () => {
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

    // 바탕화면 클릭 시 창을 끄지 않고 '최소화'
    const desktop = document.querySelector(".desktop");
    desktop.addEventListener("click", () => {
        const folderWindow = document.getElementById("folderWindow");
        const appWindow = document.getElementById("appWindow");
        
        if (appWindow && appWindow.style.display === "flex") {
            minimizeWindow('appWindow');
        }
        if (folderWindow && folderWindow.style.display === "flex") {
            minimizeWindow('folderWindow');
        }
    });

    startMacClock();
});

function syncDesktopToDock() {
    const fixedDockList = document.getElementById("fixedDockList");
    const desktopIcons = document.querySelectorAll(".desktop .icon");
    fixedDockList.innerHTML = ""; 
    desktopIcons.forEach(icon => {
        const folderType = icon.getAttribute("data-folder");
        const imgSrc = icon.querySelector("img").src;
        const name = icon.querySelector("span").innerText;
        const dockItem = document.createElement("div");
        dockItem.className = "dock-item";
        dockItem.innerHTML = `<img src="${imgSrc}"><span class="dock-tooltip">${name}</span>`;
        dockItem.addEventListener("click", (e) => {
            e.stopPropagation();
            openFolder(folderType);
        });
        fixedDockList.appendChild(dockItem);
    });
}

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
            icon.style.opacity = "0";
            icon.style.transform = "scale(0.8)";
            setTimeout(() => { if(icon.style.opacity === "0") icon.style.display = "none"; }, 200);
        }
    });
}

function updateWebVolume(volume) {
    document.getElementById('volumeVal').innerText = volume + '%';
    const iframes = document.querySelectorAll("iframe");
    iframes.forEach(iframe => {
        try {
            if(iframe.contentWindow.document.querySelectorAll("audio").length > 0) {
                iframe.contentWindow.document.querySelectorAll("audio").forEach(aud => aud.volume = volume / 100);
            }
        } catch(e) {}
    });
}

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
            input.value = ""; 
            searchDesktop(""); 
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

function saveCurrentAppSession() {
    const currentName = document.getElementById("windowTitle").innerText;
    const iframe = document.getElementById("appFrame");
    
    // 현재 열려있는 앱이 있고, iframe에 주소가 할당되어 있을 때 데이터 세이브
    if (currentName && iframe && iframe.src) {
        let textValues = [];
        try {
            // iframe 내부의 모든 input과 textarea 입력값을 추출해서 저장
            const inputs = iframe.contentWindow.document.querySelectorAll("input, textarea");
            inputs.forEach((input, index) => {
                textValues.push({ index: index, value: input.value });
            });
        } catch (e) {
            // 크로스 도메인 이슈 등이 발생할 경우 대비 안전장치
        }

        appSessions[currentName] = {
            url: iframe.src,
            isMaximized: document.getElementById("appWindow").classList.contains("maximized"),
            icon: document.getElementById("appWindow").getAttribute("data-icon"),
            inputs: textValues
        };
    }
}

function minimizeWindow(windowId) {
    const targetWindow = document.getElementById(windowId);
    const actualTitle = targetWindow.querySelector('.window-title').innerText;
    
    const uniqueKey = windowId === 'appWindow' ? `${windowId}-${actualTitle}` : windowId;

    let useIcon = targetWindow.getAttribute("data-icon");
    if (!useIcon || useIcon.includes("flaticon")) {
        const currentFolder = targetWindow.getAttribute("data-current-folder");
        if (currentFolder === "pubg") useIcon = "pubg_icon.png";
        else if (currentFolder === "lol") useIcon = "lol_icon.png";
        else if (currentFolder === "sudden") useIcon = "sa_icon.png";
        else useIcon = "https://cdn-icons-png.flaticon.com/512/3767/3767084.png";
    }

    // 최소화하기 직전의 세션 데이터를 메모리에 완벽하게 세이브!
    if (windowId === 'appWindow') {
        saveCurrentAppSession();
    }

    targetWindow.style.display = "none";
    if (minimizedWindows[uniqueKey]) return;
    
    minimizedWindows[uniqueKey] = true;
    const minimizedList = document.getElementById("minimizedList");
    const dockItem = document.createElement("div");
    dockItem.className = "dock-item";
    dockItem.id = `dock-slot-${uniqueKey.replace(/[^a-zA-Z0-9-]/g, '')}`;
    dockItem.innerHTML = `<img src="${useIcon}"><span class="dock-tooltip">${actualTitle}</span>`;
    
    dockItem.addEventListener("click", (e) => { 
        e.stopPropagation(); 
        restoreWindow(windowId, uniqueKey, actualTitle); 
    });
    minimizedList.appendChild(dockItem);
}

function restoreWindow(windowId, uniqueKey, appName) {
    const targetWindow = document.getElementById(windowId);
    if (targetWindow) {
        if (windowId === 'appWindow' && appSessions[appName]) {
            // 현재 활성화된 앱 세션을 먼저 백업해두고
            saveCurrentAppSession();
            
            // 독바에서 누른 그 앱의 데이터와 URL, 화면 상태를 정밀 복원
            const session = appSessions[appName];
            document.getElementById("appFrame").src = session.url;
            document.getElementById("windowTitle").innerText = appName;
            targetWindow.setAttribute("data-icon", session.icon);
            
            if (session.isMaximized) targetWindow.classList.add("maximized");
            else targetWindow.classList.remove("maximized");

            // iframe 로드가 완전히 끝난 직후 텍스트 복원
            const iframe = document.getElementById("appFrame");
            iframe.onload = () => {
                try {
                    const inputs = iframe.contentWindow.document.querySelectorAll("input, textarea");
                    session.inputs.forEach(item => {
                        if (inputs[item.index]) inputs[item.index].value = item.value;
                    });
                } catch(e){}
            };
        }
        targetWindow.style.display = "flex";
    }
    removeFromDock(uniqueKey);
}

function removeFromDock(uniqueKey) {
    delete minimizedWindows[uniqueKey];
    const safeId = uniqueKey.replace(/[^a-zA-Z0-9-]/g, '');
    const slot = document.getElementById(`dock-slot-${safeId}`);
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
    // 새 앱을 열기 전에 기존 열려있던 앱 세션을 최종 백업
    saveCurrentAppSession();

    document.getElementById("folderWindow").style.display = "none"; 
    const windowPopup = document.getElementById("appWindow");
    
    // 이전에 켰던 세션이 메모리에 이미 존재한다면 그 상태 그대로 로드
    if (appSessions[name]) {
        const session = appSessions[name];
        document.getElementById("appFrame").src = session.url;
        if (session.isMaximized) windowPopup.classList.add("maximized");
        else windowPopup.classList.remove("maximized");

        const iframe = document.getElementById("appFrame");
        iframe.onload = () => {
            try {
                const inputs = iframe.contentWindow.document.querySelectorAll("input, textarea");
                session.inputs.forEach(item => {
                    if (inputs[item.index]) inputs[item.index].value = item.value;
                });
            } catch(e){}
        };
    } else {
        // 아예 처음 여는 생짜 새 앱이라면 초기화 로드
        document.getElementById("appFrame").src = url;
        windowPopup.classList.add("maximized"); 
    }
    
    windowPopup.setAttribute("data-icon", icon);
    document.getElementById("windowTitle").innerText = name; 
    windowPopup.style.display = "flex";
}

function closeApp() {
    const windowPopup = document.getElementById("appWindow");
    const actualTitle = document.getElementById("windowTitle").innerText;
    windowPopup.style.display = "none";
    windowPopup.classList.remove("maximized");
    
    document.getElementById("appFrame").src = "";
    
    // 앱을 완전히 종료(X)할 때는 메모리 세션도 함께 깔끔히 증발시킴
    delete appSessions[actualTitle];
    
    removeFromDock(`appWindow-${actualTitle}`);
    lastClosedApp = null;
    closeFolder(); 
}

function backToFolder() {
    const windowPopup = document.getElementById("appWindow");
    const actualTitle = document.getElementById("windowTitle").innerText;
    
    saveCurrentAppSession();
    
    if (windowPopup.style.display !== "none") {
        lastClosedApp = { url: document.getElementById("appFrame").src, name: actualTitle, icon: windowPopup.getAttribute("data-icon") };
        windowPopup.style.display = "none";
    }
    removeFromDock(`appWindow-${actualTitle}`);
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
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        if (clockElement) clockElement.innerText = `${hours}:${minutes} ${ampm}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
}
