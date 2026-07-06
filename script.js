const folderData = {
    pubg: { title: "배틀그라운드", apps: [{ id: "pubg-gacha", name: "가챠머신", icon: "p_gacha_icon.png", targetId: "pubg-gacha-Window" }] },
    lol: { title: "리그오브레전드", apps: [{ id: "lol-memo", name: "롤모장", icon: "l_memo_icon.png", targetId: "lol-memo-Window" }] },
    sudden: { title: "서든어택", apps: [{ id: "sa-memo", name: "서모장", icon: "s_memo_icon.png", targetId: "sa-memo-Window" }] }
};

let minimizedWindows = {};
let lastClosedApp = null; 

document.addEventListener("DOMContentLoaded", () => {
    syncDesktopToDock();
    makeWindowsDraggable(); 
    preventInspection();

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
        const folderWindow = document.getElementById("folderWindow");
        if (folderWindow && folderWindow.style.display === "flex") {
            minimizeWindow('folderWindow');
        }
        document.querySelectorAll(".app-window").forEach(appWin => {
            if (appWin.style.display === "flex") {
                minimizeWindow(appWin.id);
            }
        });
    });

    startMacClock();
});

function preventInspection() {
    document.addEventListener('contextmenu', event => event.preventDefault());

    document.addEventListener('keydown', e => {
        if (
            e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'i' || e.key === 'j')) || 
            (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
        ) {
            e.preventDefault();
            return false;
        }
    });
}

function makeWindowsDraggable() {
    let activeWindow = null;
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;
    let ticking = false;

    document.querySelectorAll(".window-popup").forEach(win => {
        const header = win.querySelector(".window-header");
        if (!header) return;

        header.addEventListener("mousedown", (e) => {
            if (
                e.target.closest(".mac-buttons") ||
                e.target.closest(".nav-buttons")
            ) return;

            if (win.classList.contains("maximized")) return;

            isDragging = true;
            activeWindow = win;

            offsetX = e.clientX - win.offsetLeft;
            offsetY = e.clientY - win.offsetTop;

            document.querySelectorAll(".window-popup").forEach(w => {
                w.style.zIndex = "10";
            });
            win.style.zIndex = "100";

            document.body.style.userSelect = "none";
            document.querySelectorAll("iframe").forEach(ifrm => {
                ifrm.style.pointerEvents = "none";
            });
        });
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging || !activeWindow) return;

        // 브라우저가 화면을 갱신할 수 있을 때만 위치 계산 (렉 줄이기 및 부드러운 이동)
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (!isDragging || !activeWindow) {
                    ticking = false;
                    return;
                }

                let x = e.clientX - offsetX;
                let y = e.clientY - offsetY;

                // 상단 메뉴바(25px) 밑으로 내려가지 않도록 가이드 제한
                if (y < 25) y = 25;

                activeWindow.style.left = x + "px";
                activeWindow.style.top = y + "px";

                ticking = false; // 드래그 계산 완료 후 플래그 해제
            });
            ticking = true; // 프레임이 실행되는 동안 추가 이벤트 무시
        }
    });

    document.addEventListener("mouseup", () => {
        if (!isDragging) return;
        
        isDragging = false;
        activeWindow = null;
        
        // 드래그 종료 후 원상복구
        document.body.style.userSelect = "";
        document.querySelectorAll("iframe").forEach(ifrm => {
            ifrm.style.pointerEvents = "auto";
        });
    });
}

// 2. macOS 전용 알림창 모달 핸들러 함수
function showMacAlert(mainMsg, subMsg) {
    document.getElementById("macAlertMain").innerText = mainMsg;
    document.getElementById("macAlertSub").innerText = subMsg;
    document.getElementById("macAlertOverlay").style.display = "flex";
    closeAllDropdowns();
}

function closeMacAlert() {
    document.getElementById("macAlertOverlay").style.display = "none";
}

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
        const folderType = icon.getAttribute("data-folder");
        const folderName = icon.querySelector(".icon-name").innerText.toLowerCase();
        
        let internalAppNames = "";
        if (folderData[folderType]) {
            internalAppNames = folderData[folderType].apps.map(app => app.name.toLowerCase()).join(" ");
        }

        if (folderName.includes(cleanQuery) || internalAppNames.includes(cleanQuery)) {
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

// 3. 감성 그라데이션 신규 추가 테마 확장 반영
function changeBg(theme) {
    const body = document.body;
    body.className = ""; 
    if (theme === 'sunset') body.classList.add("bg-sunset");
    else if (theme === 'cyber') body.classList.add("bg-cyber");
    else if (['mojave', 'aqua', 'sakura', 'nebula'].includes(theme)) {
        body.classList.add(`bg-${theme}`);
    }
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
            openApp(app.targetId); 
        });
        content.appendChild(iconDiv);
    });
    
    folderWindow.style.left = "20vw";
    folderWindow.style.top = "15vh";
    folderWindow.style.display = "flex";
    updateForwardButtonState();
}

function minimizeWindow(windowId) {
    const targetWindow = document.getElementById(windowId);
    if (!targetWindow || targetWindow.style.display === "none") return;

    if (windowId === 'folderWindow') {
        targetWindow.style.display = "none";
        return;
    }

    const actualTitle = targetWindow.querySelector('.window-title').innerText;
    let useIcon = targetWindow.getAttribute("data-icon") || "https://cdn-icons-png.flaticon.com/512/3767/3767084.png";

    targetWindow.style.display = "none";
    if (minimizedWindows[windowId]) return;
    
    minimizedWindows[windowId] = true;
    const minimizedList = document.getElementById("minimizedList");
    const dockItem = document.createElement("div");
    dockItem.className = "dock-item";
    dockItem.id = `dock-slot-${windowId}`;
    dockItem.innerHTML = `<img src="${useIcon}"><span class="dock-tooltip">${actualTitle}</span>`;
    
    dockItem.addEventListener("click", (e) => { 
        e.stopPropagation(); 
        restoreWindow(windowId); 
    });
    minimizedList.appendChild(dockItem);
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
    if (slot) slot.remove();
}

function closeFolder() {
    document.getElementById("folderWindow").style.display = "none";
    document.getElementById("folderWindow").classList.remove("maximized");
    lastClosedApp = null;
    updateForwardButtonState();
}

function openApp(windowId) {
    document.getElementById("folderWindow").style.display = "none"; 
    const windowPopup = document.getElementById(windowId);
    
    windowPopup.classList.add("maximized");
    windowPopup.style.display = "flex";
}

function closeApp(windowId) {
    const windowPopup = document.getElementById(windowId);
    windowPopup.style.display = "none";
    windowPopup.classList.remove("maximized");
    
    const iframe = windowPopup.querySelector("iframe");
    if (iframe) {
        const currentSrc = iframe.src;
        iframe.src = currentSrc;
    }
    
    removeFromDock(windowId);
    lastClosedApp = null;
    closeFolder(); 
}

function backToFolder(windowId) {
    const windowPopup = document.getElementById(windowId);
    if (windowPopup.style.display !== "none") {
        lastClosedApp = { 
            targetId: windowId
        };
        windowPopup.style.display = "none";
    }
    removeFromDock(windowId);
    
    const folderWindow = document.getElementById("folderWindow");
    folderWindow.style.left = "20vw";
    folderWindow.style.top = "15vh";
    folderWindow.style.display = "flex";
    updateForwardButtonState();
}

function forwardToApp() {
    if (!lastClosedApp) return;
    openApp(lastClosedApp.targetId);
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
