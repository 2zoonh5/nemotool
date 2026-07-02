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
    folders.forEach(folder => {
        folder.addEventListener("dblclick", (e) => {
            e.stopPropagation(); // 바탕화면 클릭 이벤트로 번지는 것 차단
            const folderType = folder.getAttribute("data-folder");
            openFolder(folderType);
        });
    });

    // ★ 바탕화면 클릭 시 폴더 창 닫기 기능 추가
    const desktop = document.querySelector(".desktop");
    desktop.addEventListener("click", (e) => {
        // 클릭한 대상이 아이콘이 아니라 순수 바탕화면일 때만 폴더를 닫음
        if (e.target === desktop) {
            closeFolder();
        }
    });

    startMacClock();
});

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
        iconDiv.addEventListener("dblclick", (e) => {
            e.stopPropagation(); // 더블클릭 이벤트 버블링 방지
            openApp(app.url, app.name);
        });
        folderContent.appendChild(iconDiv);
    });

    folderWindow.style.display = "flex";
}

function closeFolder() {
    document.getElementById("folderWindow").style.style.display = "none";
}

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
