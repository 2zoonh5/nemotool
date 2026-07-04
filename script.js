const folderData = {
    pubg: { title: "배틀그라운드", apps: [{ id: "pubg-gacha", name: "가챠머신", icon: "p_gacha_icon.png", url: "pubg-gacha.html" }] },
    lol: { title: "리그오브레전드", apps: [{ id: "lol-memo", name: "롤모장", icon: "l_memo_icon.png", url: "lol-memo.html" }] },
    sudden: { title: "서든어택", apps: [{ id: "sa-memo", name: "서모장", icon: "s_memo_icon.png", url: "sa-memo.html" }] }
};

let minimizedWindows = {};
let lastClosedApp = null; 

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

function minimizeWindow(windowId) {
    const targetWindow = document.getElementById(windowId);
    const actualTitle = targetWindow.querySelector('.window-title').innerText;
    
    // 앱 고유 식별을 위해 창 ID 뒤에 현재 타이틀(이름)을 조합한 고유 키 생성
    // (이걸 안 해주면 롤모장과 가챠머신이 같은 'appWindow'라 중복 처리됨)
    const uniqueKey = windowId === 'appWindow' ? `${windowId}-${actualTitle}` : windowId;

    let useIcon = targetWindow.getAttribute("data-icon");
    if (!useIcon || useIcon.includes("flaticon")) {
        const currentFolder = targetWindow.getAttribute("data-current-folder");
        if (currentFolder === "pubg") useIcon = "pubg_icon.png";
        else if (currentFolder === "lol") useIcon = "lol_icon.png";
        else if (currentFolder === "sudden") useIcon = "sa_icon.png";
        else useIcon = "https://cdn-icons-png.flaticon.com/512/3767/3767084.png";
    }

    // 최소화할 때 현재 창의 데이터를 백업 (나중에 복원할 때 필요)
    let appData = null;
    if (windowId === 'appWindow') {
        appData = {
            url: document.getElementById("appFrame").src,
            name: actualTitle,
            icon: useIcon
        };
    }

    targetWindow.style.display = "none";
    if (minimizedWindows[uniqueKey]) return;
    
    minimizedWindows[uniqueKey] = true;
    const minimizedList = document.getElementById("minimizedList");
    const dockItem = document.createElement("div");
    dockItem.className = "dock-item";
    dockItem.id = `dock-slot-${uniqueKey.replace(/[^a-zA-Z0-9-]/g, '')}`; // 특수문자 제거 안전한 ID 생성
    dockItem.innerHTML = `<img src="${useIcon}"><span class="dock-tooltip">${actualTitle}</span>`;
    
    dockItem.addEventListener("click", (e) => { 
        e.stopPropagation(); 
        restoreWindow(windowId, uniqueKey, appData); 
    });
    minimizedList.appendChild(dockItem);
}

function restoreWindow(windowId, uniqueKey, appData) {
    const targetWindow = document.getElementById(windowId);
    if (targetWindow) {
        // 앱 창을 복원할 때는 백업해둔 해당 앱의 URL과 이름, 아이콘을 다시 로드
        if (windowId === 'appWindow' && appData) {
            document.getElementById("appFrame").src = appData.url;
            document.getElementById("windowTitle").innerText = appData.name;
            targetWindow.setAttribute("data-icon", appData.icon);
            targetWindow.classList.add("maximized");
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
    document.getElementById("folderWindow").style.display = "none"; 
    const windowPopup = document.getElementById("appWindow");
    windowPopup.setAttribute("data-icon", icon);
    document.getElementById("appFrame").src = url;
    document.getElementById("windowTitle").innerText = name; 
    
    windowPopup.classList.add("maximized");
    windowPopup.style.display = "flex";
}

function closeApp() {
    const windowPopup = document.getElementById("appWindow");
    const actualTitle = document.getElementById("windowTitle").innerText;
    windowPopup.style.display = "none";
    windowPopup.classList.remove("maximized");
    
    // 닫을 때 해당 앱 이름으로 등록된 독바 슬롯을 제거
    removeFromDock(`appWindow-${actualTitle}`);
    lastClosedApp = null;
    closeFolder(); 
}

function backToFolder() {
    const windowPopup = document.getElementById("appWindow");
    const actualTitle = document.getElementById("windowTitle").innerText;
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
