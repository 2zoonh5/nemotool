document.addEventListener("DOMContentLoaded", () => {
    const icons = document.querySelectorAll(".icon");
    
    // 바탕화면 아이콘 더블클릭 이벤트 바인딩
    icons.forEach(icon => {
        icon.addEventListener("dblclick", () => {
            const appType = icon.getAttribute("data-app");
            openApp(appType);
        });
    });

    // 실시간 시계 시작
    startMacClock();
});

// 앱 열기 함수 (상단 메뉴 바 클릭 시에도 호출 가능)
function openApp(appType) {
    const windowPopup = document.getElementById("appWindow");
    const appFrame = document.getElementById("appFrame");
    const windowTitle = document.getElementById("windowTitle");

    let appUrl = "";
    let appName = "";

    // 같은 폴더에 위치한 개별 html 파일 호출
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

// 앱 닫기 함수
function closeApp() {
    const windowPopup = document.getElementById("appWindow");
    const appFrame = document.getElementById("appFrame");
    
    windowPopup.style.display = "none";
    appFrame.src = ""; // 메모리 해제 및 초기화
}

// Mac OS 스타일 실시간 시계 로직
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
        
        hours = hours % 12;
        hours = hours ? hours : 12; 
        
        const timeString = `${month}월 ${date}일 (${dayOfWeek}) ${ampm} ${hours}:${minutes}`;
        
        if (clockElement) {
            clockElement.innerText = timeString;
        }
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}
