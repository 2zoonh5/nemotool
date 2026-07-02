document.addEventListener("DOMContentLoaded", () => {
    const icons = document.querySelectorAll(".icon");
    
    icons.forEach(icon => {
        // 아이콘 더블클릭 이벤트
        icon.addEventListener("dblclick", () => {
            const appType = icon.getAttribute("data-app");
            openApp(appType);
        });
    });
});

function openApp(appType) {
    const windowPopup = document.getElementById("appWindow");
    const appFrame = document.getElementById("appFrame");
    const windowTitle = document.getElementById("windowTitle");

    let appUrl = "";
    let appName = "";

    // 같은 폴더 내 파일명으로 바로 연결 (apps/ 제거)
    if (appType === "lol") {
        appUrl = "lol-memo.html";
        appName = "롤모장 (서폿고정 시스템)";
    } else if (appType === "pubg") {
        appUrl = "pubg.html";
        appName = "배틀그라운드 매니저";
    } else if (appType === "sudden") {
        appUrl = "sudden.html";
        appName = "서든어택 매니저";
    }

    if (appUrl) {
        appFrame.src = appUrl;
        windowTitle.innerText = appName;
        windowPopup.style.display = "flex";
    }
}

function closeApp() {
    const windowPopup = document.getElementById("appWindow");
    const appFrame = document.getElementById("appFrame");
    
    windowPopup.style.display = "none";
    appFrame.src = ""; 
}
