// [데이터 정의] 각 게임 폴더를 더블클릭했을 때 생성될 세부 기능 리스트
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

document.addEventListener("DOMContentLoaded", () => {
    const folders = document.querySelectorAll("[data-folder]");
    
    // 1. 메인 바탕화면 폴더 아이콘 더블클릭
    folders.forEach(folder => {
        folder.addEventListener("dblclick", (e) => {
            e.stopPropagation(); // 바탕화면 클릭 이벤트가 발동되는 것을 차단
            const folderType = folder.getAttribute("data-folder");
            openFolder(folderType);
        });
        
        // 싱글 클릭 시 바탕화면 클릭 이벤트로 이어져서 창이 닫히는 버그 방지
        folder.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    });

    // 2. 창 내부(폴더창, 프로그램창)를 클릭했을 때는 바탕화면 클릭으로 인식하지 않도록 보호막 설정
    const popups = document.querySelectorAll(".window-popup");
    popups.forEach(popup => {
        popup.addEventListener("click", (e) => {
            e.stopPropagation(); // 창 안쪽을 누를 때는 바탕화면 클릭 기능 발동 안 됨
        });
        popup.addEventListener("dblclick", (e) => {
            e.stopPropagation();
        });
    });

    // 3. [요구사항 1 적용] 순수 바탕화면 영역을 클릭하면 어떤 창이 켜져 있든 싹 다 종료하고 나감
    const desktop = document.querySelector(".desktop");
    desktop.addEventListener("click", () => {
        closeFolder();
        closeApp();
    });

    // 실시간 시계 작동
    startMacClock();
});

// [폴더 창 열기]
function openFolder(type) {
    const folderWindow = document.getElementById("folderWindow");
    const folderTitle = document.getElementById("folderTitle");
    const folderContent = document.getElementById("folderContent");
    
    const data = folderData[type];
    if (!data) return;

    folderTitle.innerText = data.title;
    folderContent.innerHTML = ""; 

    data.apps.forEach(app => {
        const iconDiv = document.createElement("div");
        iconDiv.className = "icon";
        iconDiv.innerHTML = `
            <img src="${app.icon}" alt="${app.name}">
            <span class="icon-name">${app.name}</span>
        `;
        
        // 폴더 내부 아이콘 클릭 시 버블링 방지
        iconDiv.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        // 폴더 안의 아이콘 더블클릭 시 진짜 프로그램 창 실행
        iconDiv.addEventListener("dblclick", (e) => {
            e.stopPropagation(); 
            openApp(app.url, app.name);
        });
        folderContent.appendChild(iconDiv);
    });

    folderWindow.style.display = "flex";
}

// [요구사항 2 적용] 폴더 창의 빨간 버튼 클릭 시 뒤로가기 없이 칼같이 창 종료
function closeFolder() {
    const folderWindow = document.getElementById("folderWindow");
    if (folderWindow) {
        folderWindow.style.display = "none";
    }
}

// [진짜 프로그램(iframe) 실행 창 열기]
function openApp(url, name) {
    const windowPopup = document.getElementById("appWindow");
    const appFrame = document.getElementById("appFrame");
    const windowTitle = document.getElementById("windowTitle");

    appFrame.src = url;
    windowTitle.innerText = name;
    windowPopup.style.display = "flex";
}

// [요구사항 2 적용] 프로그램 창의 빨간 버튼 클릭 시 칼같이 창 종료 및 데이터 초기화
function closeApp() {
    const windowPopup = document.getElementById("appWindow");
    const appFrame = document.getElementById("appFrame");
    if (windowPopup) {
        windowPopup.style.display = "none";
        appFrame.src = ""; // 깔끔하게 비우기
    }
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
        hours = hours % 12 || 12;
        
        if (clockElement) {
            clockElement.innerText = `${month}월 ${date}일 (${dayOfWeek}) ${ampm} ${hours}:${minutes}`;
        }
    }
    updateClock();
    setInterval(updateClock, 1000);
}
