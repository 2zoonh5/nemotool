// [데이터 정의] 각 게임 폴더를 더블클릭했을 때 생성될 세부 기능 리스트
const folderData = {
    pubg: {
        title: "배틀그라운드 매니저 폴더",
        apps: [
            { id: "pubg-stat", name: "전적 검색", icon: "https://cdn-icons-png.flaticon.com/512/2893/2893051.png", url: "pubg-stat.html" },
            { id: "pubg-map", name: "자기장 타이머", icon: "https://cdn-icons-png.flaticon.com/512/854/854878.png", url: "pubg-timer.html" }
        ]
    },
    lol: {
        title: "리그오브레전드 매니저 폴더",
        apps: [
            { id: "lol-memo", name: "롤모장 (맞밸)", icon: "https://cdn-icons-png.flaticon.com/512/825/825590.png", url: "lol-memo.html" },
            { id: "lol-tier", name: "티어 예측기", icon: "https://cdn-icons-png.flaticon.com/512/3112/3112946.png", url: "lol-tier.html" }
        ]
    },
    sudden: {
        title: "서든어택 매니저 폴더",
        apps: [
            { id: "sudden-crosshair", name: "에임 조준선 설정", icon: "https://cdn-icons-png.flaticon.com/512/5750/5750226.png", url: "sudden-aim.html" }
        ]
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // 바탕화면에 있는 메인 폴더 아이콘들 이벤트 바인딩
    const folders = document.querySelectorAll("[data-folder]");
    folders.forEach(folder => {
        folder.addEventListener("dblclick", () => {
            const folderType = folder.getAttribute("data-folder");
            openFolder(folderType);
        });
    });

    startMacClock();
});

// [1] 폴더 창 열기
function openFolder(type) {
    const folderWindow = document.getElementById("folderWindow");
    const folderTitle = document.getElementById("folderTitle");
    const folderContent = document.getElementById("folderContent");
    
    const data = folderData[type];
    if (!data) return;

    folderTitle.innerText = data.title;
    folderContent.innerHTML = ""; // 기존 내부 아이콘 초기화

    // 폴더 데이터에 등록된 앱 아이콘들을 화면에 동적 생성
    data.apps.forEach(app => {
        const iconDiv = document.createElement("div");
        iconDiv.className = "icon";
        iconDiv.innerHTML = `
            <img src="${app.icon}" alt="${app.name}">
            <span class="icon-name">${app.name}</span>
        `;
        // 폴더 내부의 기능을 더블클릭하면 진짜 프로그램 창이 뜸
        iconDiv.addEventListener("dblclick", () => {
            openApp(app.url, app.name);
        });
        folderContent.appendChild(iconDiv);
    });

    folderWindow.style.display = "flex";
}

function closeFolder() {
    document.getElementById("folderWindow").style.display = "none";
}

// [2] 진짜 프로그램(iframe) 실행 창 열기
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
    windowPopup.style.display = "none";
    appFrame.src = "";
}

// Mac OS 스타일 실시간 시계
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
