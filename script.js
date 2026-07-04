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

    const desktop = document.querySelector(".desktop");
    desktop.addEventListener("click", () => {
        closeFolder();
        closeApp();
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
    const useIcon = targetWindow.getAttribute("data-icon") || "https://cdn-icons-png.flaticon.com/512/3767/3767084.png";
    targetWindow.style.display = "none";
    if (minimizedWindows[windowId]) return;
    minimizedWindows[windowId] = true;
    const minimizedList = document.getElementById("minimizedList");
    const dockItem = document.createElement("div");
    dockItem.className = "dock-item";
    dockItem.id = `dock-slot-${windowId}`;
    dockItem.innerHTML = `<img src="${useIcon}"><span class="dock-tooltip">${actualTitle}</span>`;
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
    
    // 앱을 열 때 자동으로 최대화(maximized) 클래스 추가
    windowPopup.classList.add("maximized");
    
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
        lastClosedApp = { url: document.getElementById("appFrame").src, name: document.getElementById("windowTitle").innerText, icon: windowPopup.getAttribute("data-icon") };
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
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        if (clockElement) clockElement.innerText = `${hours}:${minutes} ${ampm}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
}
