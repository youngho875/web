//////////////////////////////////////////////////////////////////////////
// CesiumJS Draggable Vertical Icon Menu (Robust JS Hover Delay Fixed)
//////////////////////////////////////////////////////////////////////////

(function() {
    const viewer = window.CesiumViewer;
    
    // ✨ 불필요해진 CSS 브릿지를 제거하고 깔끔하게 정돈된 스타일 주입
    const style = document.createElement('style');
    style.innerHTML = `
        #menu {
            position: absolute;
            top: 15px; 
            left: 15px;   
            background: rgba(20, 20, 20, 0.85); 
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            padding: 12px 8px;
            width: 46px;      
            max-height: 95vh;
            display: flex;
            flex-direction: column;
            gap: 12px;        
            align-items: center;
            border-radius: 30px; 
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 1000;
            cursor: move; 
            user-select: none;
            box-sizing: border-box;
        }

        /* 🟢 이미지 형태의 아이콘 버튼 공통 스타일 */
        .icon-btn, .drop-trigger {
            position: relative;
            width: 36px;
            height: 36px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            box-sizing: border-box;
            padding: 0;
        }

        .icon-btn:hover, .drop-trigger:hover {
            background: rgba(0, 122, 204, 0.5);
            border-color: #007acc;
            box-shadow: 0 0 12px rgba(0, 122, 204, 0.6);
            transform: scale(1.1);
        }

        .icon-btn img, .drop-trigger img {
            width: 20px;
            height: 20px;
            pointer-events: none; 
            filter: invert(1);    
        }

        /* 🎈 풍선도움말(Tooltip) 기본 설정 (일반 단독 버튼용) */
        .icon-btn::after {
            content: attr(data-tooltip); 
            position: absolute;
            left: 54px;                 
            top: 50%;
            transform: translateY(-50%) scale(0.8);
            background: rgba(15, 15, 15, 0.95);
            color: #ffffff;
            font-size: 12px;
            font-family: 'Segoe UI', sans-serif;
            font-weight: 500;
            padding: 6px 10px;
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1010;
            box-shadow: 4px 4px 15px rgba(0, 0, 0, 0.5);
        }
        .icon-btn::before {
            content: '';
            position: absolute;
            left: 48px;
            top: 50%;
            transform: translateY(-50%);
            border-width: 4px 6px 4px 0;
            border-style: solid;
            border-color: transparent rgba(15, 15, 15, 0.95) transparent transparent;
            pointer-events: none;
            opacity: 0;
            transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1010;
        }
        .icon-btn:hover::after, .icon-btn:hover::before {
            opacity: 1;
            transform: translateY(-50%) scale(1);
        }

        /* 📦 드롭다운 감싸는 래퍼 */
        .dropdown-wrapper {
            position: relative;
            display: inline-block;
            width: 100%;
            display: flex;
            justify-content: center;
        }

        /* 📦 우측으로 펼쳐지는 드롭다운 서브메뉴 리스트 */
        .dropdown-content {
            display: none; /* JS를 통해 제어되므로 Hover 관련 CSS는 제외 */
            position: absolute;
            left: 52px; /* 아이콘 버튼 우측 배치 */
            top: 50%;
            transform: translateY(-50%);
            background-color: rgba(25, 25, 26, 0.98); 
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            min-width: 180px;
            border-radius: 6px;
            box-shadow: 5px 5px 25px rgba(0,0,0,0.5);
            border: 1px solid rgba(255, 255, 255, 0.12);
            z-index: 1005; 
            padding: 6px 0;
            overflow: hidden;
            cursor: default;
        }

        .dropdown-content a {
            color: #d4d4d8;
            padding: 10px 16px;
            text-decoration: none;
            display: block;
            font-size: 13px;
            transition: all 0.2s;
            text-align: left;
        }
        .dropdown-content a:hover {
            background-color: rgba(0, 122, 204, 0.25);
            color: #fff;
            padding-left: 20px;
        }
        .dropdown-content label {
            color: #d4d4d8;
            padding: 10px 16px;
            display: flex;
            align-items: center;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s;
            text-align: left;
        }
        .dropdown-content label:hover {
            background-color: rgba(255, 255, 255, 0.05);
            color: #fff;
        }

        input[type="radio"], input[type="checkbox"] {
            margin-right: 8px;
            accent-color: #007acc;
            cursor: pointer;
        }

        /* Reset 전용 버튼 경고 컬러 스타일링 */
        .btn-reset {
            background: rgba(239, 68, 68, 0.15) !important;
            border-color: rgba(239, 68, 68, 0.3) !important;
        }
        .btn-reset:hover {
            background: rgba(239, 68, 68, 0.7) !important;
            border-color: #ef4444 !important;
            box-shadow: 0 0 12px rgba(239, 68, 68, 0.6) !important;
        }
    `;
    document.head.appendChild(style);

    // 메뉴 UI 생성
    const menu = document.createElement('div');
    menu.id = 'menu';
    document.body.appendChild(menu);

    // 💡 헬퍼 1: 단독 실행형 아이콘 버튼 생성 함수
    function createIconButton(tooltipText, iconName, clickCallback, customClass = '') {
        const btn = document.createElement('button');
        btn.className = `icon-btn ${customClass}`;
        btn.setAttribute('data-tooltip', tooltipText);

        const img = document.createElement('img');
        img.src = `https://api.iconify.design/material-symbols:${iconName}-rounded.svg`;
        btn.appendChild(img);

        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            clickCallback(e);
        });

        menu.appendChild(btn);
        return btn;
    }

    // 💡 헬퍼 2: [대폭 개선] 마우스 지연 반응 타이머 기반 드롭다운 생성 함수
    function createDropdownIconButton(tooltipText, iconName) {
        const wrapper = document.createElement('div');
        wrapper.className = 'dropdown-wrapper';

        const triggerBtn = document.createElement('button');
        triggerBtn.className = 'drop-trigger';
        triggerBtn.setAttribute('title', tooltipText); 

        const img = document.createElement('img');
        img.src = `https://api.iconify.design/material-symbols:${iconName}-rounded.svg`;
        triggerBtn.appendChild(img);
        wrapper.appendChild(triggerBtn);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'dropdown-content';
        wrapper.appendChild(contentDiv);

        // --- ⏳ 지연 반응(Debounce) 제어 변수 및 이벤트 바인딩 ---
        let closeTimer = null;

        const showMenu = () => {
            if (closeTimer) {
                clearTimeout(closeTimer);
                closeTimer = null;
            }
            contentDiv.style.display = 'block';
        };

        const hideMenuDeferred = () => {
            // 마우스가 이탈하더라도 즉시 닫지 않고 200ms(0.2초) 여유를 둡니다.
            if (!closeTimer) {
                closeTimer = setTimeout(() => {
                    contentDiv.style.display = 'none';
                }, 200); 
            }
        };

        // 1. 트리거 아이콘에 마우스가 들어오고 나갈 때
        wrapper.addEventListener('mouseenter', showMenu);
        wrapper.addEventListener('mouseleave', hideMenuDeferred);

        // 2. 우측 드롭다운 내용물 자체에 마우스가 올라가고 이탈할 때도 동일 제어권 유지
        contentDiv.addEventListener('mouseenter', showMenu);
        contentDiv.addEventListener('mouseleave', hideMenuDeferred);

        menu.appendChild(wrapper);
        return contentDiv; 
    }


    // ==========================================
    // ⚙️ 버튼 및 드롭다운 아이콘 셋 정의
    // ==========================================

    // 1. 군대부호 (단독 버튼)
    createIconButton('🎨 군대부호', 'military-tech', () => {
        if (typeof openSymbolPopup === 'function') openSymbolPopup();
    });

    // 2. 홈 뷰 (단독 버튼)
    createIconButton('🏠 Home', 'home', () => {
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(126.9317, 37.5204, 7000),
            duration: 2
        });
    });

    // 3. ⭐ 즐겨찾기 (드롭다운 아이콘)
    const favDropContent = createDropdownIconButton('⭐ 즐겨찾기', 'star');
    
    const moveLink = document.createElement('a');
    moveLink.textContent = '📍 위치 이동 제어';
    moveLink.href = '#';
    moveLink.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
    moveLink.style.fontWeight = 'bold';
    moveLink.style.color = '#38bdf8';
    moveLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (window.moveLocation && typeof window.moveLocation.showMoveInfo === 'function') {
            window.moveLocation.showMoveInfo();
        }
    });
    favDropContent.appendChild(moveLink);

    // 즐겨찾기 체크박스 헬퍼
    const createFavCheckbox = (name, longitude, latitude, groupName) => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = groupName;
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 10000)
                });
            }
        });
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(name));
        favDropContent.appendChild(label);
    };

    createFavCheckbox('📍 Tokyo', 139.6917, 35.6895, 'city');
    createFavCheckbox('📍 New York', -74.0060, 40.7128, 'city');
    createFavCheckbox('📍 Paris', 2.3522, 48.8566, 'city');


    // 4. 📐 측정 도구 (드롭다운 아이콘)
    const measureDropContent = createDropdownIconButton('📐 측정 기능 모음', 'straighten');
    const measureActions = [
        { name: '📏 거리 측정', action: () => { if(window.distance) distance.start(); } },
        { name: '📐 면적 측정', action: () => { if(window.measure) measure.start(); } },
        { name: '👁️‍🗨️ 가시선(LOS) 작도', action: () => { if(window.drawSightViewLine) drawSightViewLine.start(); } },
        { name: '📊 차폐/LOS 분석', action: () => { 
            if (window.angleLos && typeof window.angleLos.showMoveInfo === 'function') window.angleLos.showMoveInfo();
        }}
    ];
    measureActions.forEach(item => {
        const link = document.createElement('a');
        link.textContent = item.name;
        link.href = '#';
        link.addEventListener('click', function(e) {
            e.preventDefault();
            item.action();
        });
        measureDropContent.appendChild(link);
    });


    // 5. 🚀 대탄도탄 작전 (드롭다운 아이콘)
    const opDropContent = createDropdownIconButton('🚀 대탄도탄 작전 모음', 'rocket-launch');
    const opActions = [
        { name: '🌐 Dome 그리기', action: () => {
            if (window.domeDrawing && typeof window.domeDrawing.createControlPanel === 'function') {
                const existBox = document.getElementById('controlPanel');
                !existBox ? window.domeDrawing.createControlPanel() : window.domeDrawing.toggleInfoBox();
            }
        }},
        { name: '📡 레이다 빔', action: () => {
            if (window.radar && typeof window.radar.createInfoBox === 'function') {
                const existBox = document.getElementById('radarInfoBox');
                !existBox ? window.radar.createInfoBox() : window.radar.toggleInfoBox();
            }
        }},
        { name: '🚀 탄도탄 경로', action: () => {
            if (window.curve && typeof window.curve.createInfoBox === 'function') {
                const existBox = document.getElementById('missileinfoBox');
                !existBox ? window.curve.createInfoBox() : window.curve.toggleInfoBox();
            }
        }},
        { name: '✈️ 항공기 항적', action: () => {
            if (window.airpath && typeof window.airpath.createInfoBox === 'function') {
                const existBox = document.getElementById('airpathinfoBox');
                !existBox ? window.airpath.createInfoBox() : window.airpath.toggleInfoBox();
            }
        }},
        { name: '🔥 유도탄 항적', action: () => {
            if (window.particle && typeof window.particle.createInfoBox === 'function') {
                const existBox = document.getElementById('particleinfoBox');
                !existBox ? window.particle.createInfoBox() : window.particle.toggleInfoBox();
            }
        }},
        { name: '📈 풀업 항적', action: () => {
            if (window.pullup && typeof window.pullup.createInfoBox === 'function') {
                const existBox = document.getElementById('pullupinfoBox');
                !existBox ? window.pullup.createInfoBox() : window.pullup.toggleInfoBox();
            }
        }}
    ];
    opActions.forEach(item => {
        const link = document.createElement('a');
        link.textContent = item.name;
        link.href = '#';
        link.addEventListener('click', function(e) {
            e.preventDefault();
            item.action();
        });
        opDropContent.appendChild(link);
    });


    // 6. ✏️ 그리기 도구 (드롭다운 아이콘)
    const drawDropContent = createDropdownIconButton('✏️ 자유 투명도 그리기', 'edit');
    const drawActions = [
        { name: '⬡ 폴리곤 그리기', activate: window.PolygonDrawing?.activate, reset: window.PolygonDrawing?.reset },
        { name: '▱ 폴리라인 그리기', activate: window.PolylineDrawing?.activate, reset: window.PolylineDrawing?.reset },
        { name: '○ 원 그리기', activate: window.circleDrawing?.activate, reset: window.circleDrawing?.reset },
        { name: '― 라인 그리기', activate: window.lineDrawing?.activate, reset: window.lineDrawing?.reset }
    ];
    drawActions.forEach(action => {
        const link = document.createElement('a');
        link.textContent = action.name;
        link.href = '#';
        link.addEventListener('click', function(e) {
            e.preventDefault();
            drawActions.forEach(a => a.reset && a.reset());
            if(action.activate) action.activate();
        });
        drawDropContent.appendChild(link);
    });


    // 7. 나침반 (단독 버튼)
    createIconButton('🧭 나침반', 'explore', () => {
        if (typeof toggleCompass === 'function') toggleCompass();
    });

    // 8. 3차원 모델 (단독 버튼)
    createIconButton('📦 3D 모델', 'view-in-ar', () => {
        if (mapDrawing && mapDrawing.toggleTilesetVisibility) mapDrawing.toggleTilesetVisibility();
    });

    // 9. 빌보드 (단독 버튼)
    createIconButton('🖼️ 빌보드 핀 배치', 'pin-drop', () => {
        if (billboard && billboard.craeteBillboard) billboard.craeteBillboard();
    });    

    // 10. 지도 리셋 (단독 버튼, 경고 스타일)
    createIconButton('🔄 Reset Layers', 'refresh', () => {
        viewer.imageryLayers.removeAll();
        viewer.imageryLayers.addImageryProvider(Cesium.createWorldImagery());
    }, 'btn-reset');


    // ==========================================
    // 🖱️ 메뉴 마우스 드래그 이동 기능 로직 구현
    // ==========================================
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    menu.addEventListener('mousedown', function(e) {
        const isClickableElement = e.target.closest('button') || 
                                   e.target.closest('.dropdown-content') ||
                                   e.target.tagName === 'IMG';
        if (isClickableElement) return;

        isDragging = true;
        viewer.scene.screenSpaceCameraController.enableInputs = false;

        offsetX = e.clientX - menu.getBoundingClientRect().left;
        offsetY = e.clientY - menu.getBoundingClientRect().top;
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;

        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;

        const maxX = window.innerWidth - menu.offsetWidth;
        const maxY = window.innerHeight - menu.offsetHeight;

        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));

        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
    });

    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            viewer.scene.screenSpaceCameraController.enableInputs = true;
        }
    });

})();