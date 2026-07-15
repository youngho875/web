window.moveLocation = (function() {
    const viewer = window.CesiumViewer;
    let uiPanel = null;

    // 1. [스타일, 드래그, 닫기버튼 포함] 좌표 입력창 UI 생성 함수
    function createUiPanel() {
        if (document.getElementById('uiPanel')) return;

        uiPanel = document.createElement('div');
        uiPanel.id = 'uiPanel';
        uiPanel.style.position = 'absolute';
        uiPanel.style.top = '60px'; 
        uiPanel.style.left = '20px';
        uiPanel.style.background = 'rgba(42, 42, 42, 0.95)';
        uiPanel.style.padding = '15px';
        uiPanel.style.borderRadius = '8px';
        uiPanel.style.color = 'white';
        uiPanel.style.fontFamily = 'sans-serif';
        uiPanel.style.boxShadow = '0px 4px 10px rgba(0,0,0,0.5)';
        uiPanel.style.zIndex = '1001';
        uiPanel.style.display = 'none'; 

        // 내부 HTML (우측 상단 닫기 버튼 포함)
        uiPanel.innerHTML = `
            <div id="uiPanelHeader" style="margin: 0 0 12px 0; border-bottom: 1px solid #555; padding-bottom: 5px; cursor: move; user-select: none; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 15px; font-weight: bold;">📍 이동 좌표 입력</span>
                <span id="uiPanelCloseBtn" style="cursor: pointer; color: #aaa; font-size: 18px; font-weight: bold; line-height: 1; padding: 0 2px;">&times;</span>
            </div>
            <div style="margin-bottom: 8px;">
                <label style="display: inline-block; width: 60px; font-size: 13px;">경도:</label>
                <input type="number" id="lng" value="126.9780" step="0.0001" style="width: 110px; padding: 4px; background: #222; border: 1px solid #555; color: white; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 8px;">
                <label style="display: inline-block; width: 60px; font-size: 13px;">위도:</label>
                <input type="number" id="lat" value="37.5665" step="0.0001" style="width: 110px; padding: 4px; background: #222; border: 1px solid #555; color: white; border-radius: 4px;">
            </div>
            <div style="margin-bottom: 12px;">
                <label style="display: inline-block; width: 60px; font-size: 13px;">고도(m):</label>
                <input type="number" id="alt" value="2000" step="100" style="width: 110px; padding: 4px; background: #222; border: 1px solid #555; color: white; border-radius: 4px;">
            </div>
            <button id="executeMoveBtn" style="width: 100%; padding: 6px; background-color: #007acc; border: none; color: white; font-weight: bold; border-radius: 4px; cursor: pointer;">날아가기</button>
        `;
        document.body.appendChild(uiPanel);

        // 팝업창 X 버튼 클릭 시 닫기 이벤트
        document.getElementById('uiPanelCloseBtn').addEventListener('click', function() {
            uiPanel.style.display = 'none';
        });

        // ---- 마우스 드래그 기능 구현 ----
        const header = document.getElementById('uiPanelHeader');
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        header.addEventListener('mousedown', function(e) {
            if (e.target.id === 'uiPanelCloseBtn') return; // X 버튼 클릭 시 드래그 방지

            isDragging = true;
            offsetX = e.clientX - uiPanel.offsetLeft;
            offsetY = e.clientY - uiPanel.offsetTop;
            e.preventDefault(); 
        });

        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            uiPanel.style.left = (e.clientX - offsetX) + 'px';
            uiPanel.style.top = (e.clientY - offsetY) + 'px';
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
        });

        // [날아가기] 버튼 클릭 이벤트
        document.getElementById('executeMoveBtn').addEventListener('click', function() {
            const longitude = parseFloat(document.getElementById('lng').value);
            const latitude = parseFloat(document.getElementById('lat').value);
            const altitude = parseFloat(document.getElementById('alt').value);

            if (isNaN(longitude) || isNaN(latitude) || isNaN(altitude)) {
                alert('유효한 좌표를 입력해 주세요.');
                return;
            }

            moveToLocation(longitude, latitude, altitude);
        });
    }

    // 2. Cesium 카메라 이동 로직
    function moveToLocation(longitude, latitude, altitude) {
        if (!viewer) return console.error("Cesium Viewer를 찾을 수 없습니다.");

        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude),
            orientation: {
                heading: Cesium.Math.toRadians(0.0),
                pitch: Cesium.Math.toRadians(-45.0),
                roll: 0.0
            },
            duration: 2.5
            // complete 콜백(인포박스 표출) 제거됨
        });
    }

    // 초기화 및 입력창 엘리먼트 생성
    createUiPanel();

    // menu.js 인터페이스 매핑
    return {
        showMoveInfo: function() {
            if (!uiPanel) return;
            
            if (uiPanel.style.display === 'none') {
                uiPanel.style.display = 'block';
            } else {
                uiPanel.style.display = 'none';
            }
        }
    };
})();