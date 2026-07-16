window.lineDrawing = (function() {
    const viewer = window.CesiumViewer;

    let startPosition = null;    // 시작점 좌표 (Cartesian3)
    let endPosition = null;      // 끝점 좌표 (Cartesian3)
    
    let activeLine = null;       // 실시간 움직이는 동적 라인 엔티티
    let startPointMarker = null; // 시작점 조절용 마커 엔티티
    let endPointMarker = null;   // 끝점 조절용 마커 엔티티
    
    let startShapeMarker = null; // 스타일 시각화용 시작점 마커
    let endShapeMarker = null;   // 스타일 시각화용 끝점 마커
    
    let drawnLines = [];         // 확정 고정된 라인 엔티티 배열
    let isEditing = false;       // 현재 편집 모드 중인지 여부
    let editingLine = null;      // 현재 편집 중인 라인 인스턴스
    let activeControlMarker = null; // 편집 시 마우스를 따라 움직이는 타겟 마커 ('start' 또는 'end')

    let configPanel = null;      // 설정 UI 패널 엘리먼트

    // 기본 설정값 객체
    const currentConfig = {
        name: '신규 라인',
        color: '#ff0000',
        width: 4,
        type: 'solid',       // 'solid' | 'dashed'
        startStyle: 'none',  // 'none' | 'arrow' | 'circle'
        endStyle: 'none'     // 'none' | 'arrow' | 'circle'
    };

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    // 🎨 UI 패널 생성, 스타일 적용 및 드래그 기능 추가
    function createConfigPanel() {
        if (document.getElementById('line-config-panel')) return;

        const style = document.createElement('style');
        style.innerHTML = `
            #line-config-panel {
                position: absolute;
                bottom: 15px;
                left: 15px;
                background: rgba(25, 25, 26, 0.95);
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 8px;
                padding: 14px;
                width: 220px;
                color: #e2e8f0;
                font-family: 'Segoe UI', sans-serif;
                font-size: 12px;
                z-index: 1005;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                display: flex;
                flex-direction: column;
                gap: 10px;
                user-select: none;
            }
            #line-config-header {
                position: relative;
                margin: -14px -14px 5px -14px;
                padding: 10px 14px;
                font-size: 13px;
                font-weight: bold;
                color: #38bdf8;
                background: rgba(255, 255, 255, 0.03);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
                cursor: move;
                text-align: center;
            }
            #line-config-close {
                position: absolute;
                right: 12px;
                top: 8px;
                cursor: pointer;
                font-size: 16px;
                color: #94a3b8;
                transition: color 0.2s, transform 0.2s;
                line-height: 1;
            }
            #line-config-close:hover {
                color: #ef4444;
                transform: scale(1.2);
            }
            .config-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 8px;
            }
            .config-row label {
                flex-shrink: 0;
                width: 70px;
            }
            .config-row input, .config-row select {
                flex-grow: 1;
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #fff;
                border-radius: 4px;
                padding: 4px 6px;
                font-size: 12px;
                outline: none;
                box-sizing: border-box;
            }
            .config-row input[type="color"] {
                padding: 0;
                height: 24px;
                cursor: pointer;
            }
            #cfg-apply-btn {
                background: #007acc;
                border: none;
                color: white;
                padding: 8px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                font-size: 12px;
                transition: background 0.2s;
                margin-top: 5px;
            }
            #cfg-apply-btn:hover {
                background: #0098ff;
            }
        `;
        document.head.appendChild(style);

        configPanel = document.createElement('div');
        configPanel.id = 'line-config-panel';
        configPanel.innerHTML = `
            <div id="line-config-header">
                🧭 선 스타일 설정
                <span id="line-config-close" title="닫기">&times;</span>
            </div>
            <div class="config-row">
                <label>선 이름</label>
                <input type="text" id="cfg-name" value="${currentConfig.name}">
            </div>
            <div class="config-row">
                <label>선 색상</label>
                <input type="color" id="cfg-color" value="${currentConfig.color}">
            </div>
            <div class="config-row">
                <label>선 두께</label>
                <input type="number" id="cfg-width" min="1" max="20" value="${currentConfig.width}">
            </div>
            <div class="config-row">
                <label>선 종류</label>
                <select id="cfg-type">
                    <option value="solid" ${currentConfig.type === 'solid' ? 'selected' : ''}>실선 (Solid)</option>
                    <option value="dashed" ${currentConfig.type === 'dashed' ? 'selected' : ''}>점선 (Dashed)</option>
                </select>
            </div>
            <div class="config-row">
                <label>시작점 형태</label>
                <select id="cfg-start">
                    <option value="none" ${currentConfig.startStyle === 'none' ? 'selected' : ''}>없음 (None)</option>
                    <option value="arrow" ${currentConfig.startStyle === 'arrow' ? 'selected' : ''}>화살표 (Arrow)</option>
                    <option value="circle" ${currentConfig.startStyle === 'circle' ? 'selected' : ''}>원형 (Circle)</option>
                </select>
            </div>
            <div class="config-row">
                <label>끝점 형태</label>
                <select id="cfg-end">
                    <option value="none" ${currentConfig.endStyle === 'none' ? 'selected' : ''}>없음 (None)</option>
                    <option value="arrow" ${currentConfig.endStyle === 'arrow' ? 'selected' : ''}>화살표 (Arrow)</option>
                    <option value="circle" ${currentConfig.endStyle === 'circle' ? 'selected' : ''}>원형 (Circle)</option>
                </select>
            </div>
            <button id="cfg-apply-btn">적용하기</button>
        `;
        document.body.appendChild(configPanel);

        configPanel.addEventListener('mousedown', function(e) { e.stopPropagation(); });
        configPanel.addEventListener('click', function(e) { e.stopPropagation(); });
        configPanel.addEventListener('dblclick', function(e) { e.stopPropagation(); });

        document.getElementById('cfg-apply-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            applyConfigFromUI();
        });

        document.getElementById('line-config-close').addEventListener('click', function(e) {
            e.stopPropagation();
            close();
        });

        makeElementDraggable(configPanel, document.getElementById('line-config-header'));
    }

    function makeElementDraggable(element, handle) {
        let isMoving = false;
        let offsetX = 0;
        let offsetY = 0;

        handle.addEventListener('mousedown', function(e) {
            if (e.target.id === 'line-config-close') return;

            isMoving = true;
            viewer.scene.screenSpaceCameraController.enableInputs = false;
            offsetX = e.clientX - element.getBoundingClientRect().left;
            offsetY = e.clientY - element.getBoundingClientRect().top;
            e.stopPropagation();
        });

        document.addEventListener('mousemove', function(e) {
            if (!isMoving) return;
            let x = e.clientX - offsetX;
            let y = e.clientY - offsetY;

            const maxX = window.innerWidth - element.offsetWidth;
            const maxY = window.innerHeight - element.offsetHeight;
            x = Math.max(0, Math.min(x, maxX));
            y = Math.max(0, Math.min(y, maxY));

            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
            element.style.bottom = 'auto';
        });

        document.addEventListener('mouseup', function() {
            if (isMoving) {
                isMoving = false;
                viewer.scene.screenSpaceCameraController.enableInputs = true;
            }
        });
    }

    function applyConfigFromUI() {
        const nameInput = document.getElementById('cfg-name');
        currentConfig.name = nameInput.value.trim() !== '' ? nameInput.value : '신규 라인';
        
        currentConfig.color = document.getElementById('cfg-color').value;
        currentConfig.width = parseInt(document.getElementById('cfg-width').value, 10) || 4;
        currentConfig.type = document.getElementById('cfg-type').value;
        currentConfig.startStyle = document.getElementById('cfg-start').value;
        currentConfig.endStyle = document.getElementById('cfg-end').value;

        const applyBtn = document.getElementById('cfg-apply-btn');
        applyBtn.style.background = '#22c55e';
        applyBtn.textContent = '적용 완료 ✔';
        setTimeout(() => {
            applyBtn.style.background = '#007acc';
            applyBtn.textContent = '적용하기';
        }, 1000);

        if (isEditing || startPosition) {
            updateDynamicStyles();
        }
    }

    function setUIToConfig(config) {
        document.getElementById('cfg-name').value = config.name;
        document.getElementById('cfg-color').value = config.color;
        document.getElementById('cfg-width').value = config.width;
        document.getElementById('cfg-type').value = config.type;
        document.getElementById('cfg-start').value = config.startStyle;
        document.getElementById('cfg-end').value = config.endStyle;
        
        Object.assign(currentConfig, config);
    }

    function createControlPoint(position) {
        return viewer.entities.add({
            position: position,
            point: {
                pixelSize: 10,
                color: Cesium.Color.YELLOW,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        });
    }

    function getLineMaterial(hexColor, isDashed) {
        const color = Cesium.Color.fromCssColorString(hexColor);
        if (isDashed) {
            return new Cesium.PolylineDashMaterialProperty({
                color: color,
                gapColor: Cesium.Color.TRANSPARENT,
                dashLength: 16.0
            });
        }
        return new Cesium.ColorMaterialProperty(color);
    }

    function getArrowOrientation(fromPos, toPos) {
        const direction = Cesium.Cartesian3.subtract(toPos, fromPos, new Cesium.Cartesian3());
        Cesium.Cartesian3.normalize(direction, direction);
        
        return Cesium.Transforms.headingPitchRollQuaternion(
            fromPos,
            new Cesium.HeadingPitchRoll(
                Math.atan2(direction.y, direction.x) - Cesium.Math.PI_OVER_TWO,
                Math.asin(direction.z),
                0
            )
        );
    }

    function updateEndpointShape(type, position, targetProperty, relativePos, colorHex) {
        if (targetProperty.value) {
            viewer.entities.remove(targetProperty.value);
            targetProperty.value = null;
        }

        if (type === 'none' || !position || !relativePos) return;

        const color = Cesium.Color.fromCssColorString(colorHex);

        if (type === 'circle') {
            targetProperty.value = viewer.entities.add({
                position: position,
                sphere: {
                    radii: new Cesium.Cartesian3(5.0, 5.0, 5.0),
                    material: color
                }
            });
        } else if (type === 'arrow') {
            const orientation = getArrowOrientation(relativePos, position);
            targetProperty.value = viewer.entities.add({
                position: position,
                orientation: orientation,
                cylinder: {
                    length: 12.0,
                    topRadius: 0.0,
                    bottomRadius: 4.0,
                    material: color
                }
            });
        }
    }

    function updateDynamicStyles() {
        if (activeLine && activeLine.polyline) {
            activeLine.polyline.material = getLineMaterial(currentConfig.color, currentConfig.type === 'dashed');
            activeLine.polyline.width = currentConfig.width;
        }
        
        updateEndpointShape(currentConfig.startStyle, startPosition, { get value() { return startShapeMarker; }, set value(v) { startShapeMarker = v; } }, endPosition, currentConfig.color);
        updateEndpointShape(currentConfig.endStyle, endPosition, { get value() { return endShapeMarker; }, set value(v) { endShapeMarker = v; } }, startPosition, currentConfig.color);
    }

    function drawDynamicLine() {
        return viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(() => {
                    return (startPosition && endPosition) ? [startPosition, endPosition] : [];
                }, false),
                width: currentConfig.width,
                material: getLineMaterial(currentConfig.color, currentConfig.type === 'dashed'),
                clampToGround: true,
                classificationType: Cesium.ClassificationType.BOTH
            }
        });
    }

    function drawStaticLine(start, end, config) {
        const lineEntity = viewer.entities.add({
            name: config.name,
            polyline: {
                positions: [start, end],
                width: config.width,
                material: getLineMaterial(config.color, config.type === 'dashed'),
                clampToGround: true,
                classificationType: Cesium.ClassificationType.BOTH
            }
        });

        let startShape = null;
        let endShape = null;
        
        const startContainer = { get value() { return startShape; }, set value(v) { startShape = v; } };
        const endContainer = { get value() { return endShape; }, set value(v) { endShape = v; } };

        updateEndpointShape(config.startStyle, start, startContainer, end, config.color);
        updateEndpointShape(config.endStyle, end, endContainer, start, config.color);

        lineEntity.customData = {
            start: start,
            end: end,
            config: { ...config },
            subEntities: []
        };

        if (startShape) lineEntity.customData.subEntities.push(startShape);
        if (endShape) lineEntity.customData.subEntities.push(endShape);

        drawnLines.push(lineEntity);
        return lineEntity;
    }

    function activate() {
        close();
        createConfigPanel();
        
        if (viewer.selectionIndicator) {
            viewer.selectionIndicator.viewModel.showSelection = false;
        }

        bindEvents();
    }

    // 🟢 [수정 핵심] 드로잉 확정 및 초기화 통합 헬퍼 함수
    function finalizeLineDrawing() {
        if (!startPosition || !endPosition) return;

        const nameInput = document.getElementById('cfg-name');
        if (nameInput) {
            currentConfig.name = nameInput.value.trim() !== '' ? nameInput.value : '신규 라인';
        }

        // 정적 라인 생성 고정
        drawStaticLine(startPosition, endPosition, currentConfig);
        
        // UI 보조 마커 제거 및 상태 초기화
        clearUIElements();

        startPosition = null;
        endPosition = null;
        isEditing = false;
        editingLine = null;
        activeControlMarker = null;

        viewer.selectedEntity = undefined;
        viewer.trackedEntity = undefined;
    }

    function bindEvents() {
        deactivate();

        // 1. 마우스 좌클릭 (점 찍기 / 편집 선 선택)
        handler.setInputAction(function(event) {
            const pickedObject = viewer.scene.pick(event.position);

            // [A] 편집 모드 진입: 이미 고정된 라인을 클릭했을 때
            if (!startPosition && !isEditing && Cesium.defined(pickedObject) && pickedObject.id && drawnLines.includes(pickedObject.id)) {
                editingLine = pickedObject.id;
                isEditing = true;

                drawnLines = drawnLines.filter(l => l.id !== editingLine.id);
                setUIToConfig(editingLine.customData.config);

                startPosition = editingLine.customData.start;
                endPosition = editingLine.customData.end;

                editingLine.customData.subEntities.forEach(ent => viewer.entities.remove(ent));
                viewer.entities.remove(editingLine);

                startPointMarker = createControlPoint(startPosition);
                endPointMarker = createControlPoint(endPosition);

                activeLine = drawDynamicLine();
                updateDynamicStyles();
                return;
            }

            // [B] 편집 도중 노란색 가이드 꼭짓점 클릭: 드래그 앵커 활성화
            if (isEditing && Cesium.defined(pickedObject) && pickedObject.id) {
                if (pickedObject.id === startPointMarker) {
                    activeControlMarker = 'start'; 
                    return;
                } else if (pickedObject.id === endPointMarker) {
                    activeControlMarker = 'end';   
                    return;
                }
            }

            // [C] 편집 완료 처리: 편집 모드 상태에서 다른 빈 지형을 한 번 더 클릭하면 편집 확정
            if (isEditing && activeControlMarker) {
                finalizeLineDrawing();
                return;
            }

            const earthPosition = viewer.scene.pickPosition(event.position);
            if (!Cesium.defined(earthPosition)) return;

            // [D] 신규 드로잉 첫 번째 클릭 (시작점 확정)
            if (!startPosition) {
                startPosition = earthPosition;
                endPosition = earthPosition; 

                startPointMarker = createControlPoint(startPosition);
                endPointMarker = createControlPoint(endPosition);
                activeLine = drawDynamicLine();
                
                activeControlMarker = 'end'; // 이제 마우스 움직임에 따라 끝점이 따라다님
            } 
            // [E] 신규 드로잉 두 번째 클릭 (끝점 확정 -> 직선 완성)
            else if (startPosition && activeControlMarker === 'end') {
                endPosition = earthPosition;
                finalizeLineDrawing(); // 바로 완성 및 완전 초기화
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // 2. 마우스 이동 (실시간 가이드 피드백)
        handler.setInputAction(function(event) {
            if (!startPosition || !activeLine || !activeControlMarker) return;

            const movePosition = viewer.scene.pickPosition(event.endPosition);
            if (Cesium.defined(movePosition)) {
                if (activeControlMarker === 'start') {
                    startPosition = movePosition;
                    if (startPointMarker) startPointMarker.position.setValue(startPosition);
                } else if (activeControlMarker === 'end') {
                    endPosition = movePosition;
                    if (endPointMarker) endPointMarker.position.setValue(endPosition);
                }
                updateDynamicStyles();
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    function clearUIElements() {
        if (startPointMarker) { viewer.entities.remove(startPointMarker); startPointMarker = null; }
        if (endPointMarker) { viewer.entities.remove(endPointMarker); endPointMarker = null; }
        if (startShapeMarker) { viewer.entities.remove(startShapeMarker); startShapeMarker = null; }
        if (endShapeMarker) { viewer.entities.remove(endShapeMarker); endShapeMarker = null; }
        if (activeLine) { viewer.entities.remove(activeLine); activeLine = null; }
    }

    function deactivate() {
        if (handler) {
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        }
    }

    function close() {
        deactivate();
        clearUIElements();

        startPosition = null;
        endPosition = null;
        isEditing = false;
        editingLine = null;
        activeControlMarker = null;

        if (configPanel) {
            configPanel.remove();
            configPanel = null;
        }

        viewer.selectedEntity = undefined;
        viewer.trackedEntity = undefined;
        
        if (viewer.selectionIndicator) {
            viewer.selectionIndicator.viewModel.showSelection = true;
        }
    }

    function reset() {
        deactivate();
        clearUIElements();

        drawnLines.forEach(l => {
            if (l.customData && l.customData.subEntities) {
                l.customData.subEntities.forEach(sub => viewer.entities.remove(sub));
            }
            viewer.entities.remove(l);
        });
        drawnLines = [];

        startPosition = null;
        endPosition = null;
        isEditing = false;
        editingLine = null;
        activeControlMarker = null;

        if (configPanel) {
            configPanel.remove();
            configPanel = null;
        }

        viewer.selectedEntity = undefined;
        viewer.trackedEntity = undefined;
        
        if (viewer.selectionIndicator) {
            viewer.selectionIndicator.viewModel.showSelection = true;
        }

        bindEvents();
    }

    return {
        activate: activate,
        reset: reset,
        close: close
    };
})();