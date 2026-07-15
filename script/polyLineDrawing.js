// polylineDrawingWithLatLon.js

window.PolylineDrawing = (function() {
    const viewer = window.CesiumViewer;
    
    let activeShapePoints = [];  // 현재 드로잉/편집 중인 꼭짓점 목록 (Cartesian3)
    let activeShape = null;      // 동적 가이드용 폴리라인 엔티티
    let floatingPoint = null;    // 마우스 커서를 따라다니는 임시 포인트 엔티티
    let markerEntities = [];     // 현재 화면에 배치된 꼭짓점 마커 엔티티 배열
    let drawnPolylines = [];     // 최종 확정된 고정 폴리라인 배열
    
    let isEditing = false;       // 현재 기존 폴리라인을 편집 중인지 여부
    let editingPolyline = null;  // 현재 편집 대상이 된 폴리라인 인스턴스

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    // 🎨 [최적화] 안쪽 채움 오작동이 없는 동적 가이드 폴리라인
    function drawDynamicShape() {
        return viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(() => {
                    return activeShapePoints;
                }, false),
                width: 4,
                // 🌟 핵심: 특수 셰이더 대신 단색 ColorProperty를 사용하여 내부 채움 현상 방지
                material: new Cesium.ColorMaterialProperty(Cesium.Color.RED), 
                clampToGround: true, // 지형 밀착
                classificationType: Cesium.ClassificationType.BOTH
            }
        });
    }

    // 💾 [최적화] 안쪽 채움 오작동이 없는 확정 고정 폴리라인
    function drawStaticPolyline(points) {
        const entity = viewer.entities.add({
            polyline: {
                positions: points,
                width: 4,
                // 🌟 핵심: 확정 시에도 동일하게 단색 빨간선으로 지정
                material: new Cesium.ColorMaterialProperty(Cesium.Color.RED), 
                clampToGround: true,
                classificationType: Cesium.ClassificationType.BOTH
            }
        });
        entity.customPoints = [...points];
        drawnPolylines.push(entity);
        return entity;
    }

    // 💾 확정 고정 폴리라인 생성 함수
    function drawStaticPolyline(points) {
        const entity = viewer.entities.add({
            polyline: {
                positions: points,
                width: 4,
                material: Cesium.Color.RED,
                clampToGround: true,
                classificationType: Cesium.ClassificationType.BOTH
            }
        });
        entity.customPoints = [...points];
        drawnPolylines.push(entity);
        return entity;
    }

    // 🚀 모듈 활성화 진입점
    function activate() {
        reset();
        bindEvents();
    }

    function bindEvents() {
        deactivate(); // 중복 리스너 방지

        // 1. 마우스 단일 좌클릭 (꼭짓점 추가 또는 완료된 폴리라인 클릭 시 편집 모드 활성화)
        handler.setInputAction(function(event) {
            const pickedObject = viewer.scene.pick(event.position);

            // 💡 [A] 대기 상태에서 이미 그려진 폴리라인을 클릭한 경우 -> 꼭짓점 편집 모드 활성화
            if (activeShapePoints.length === 0 && Cesium.defined(pickedObject) && pickedObject.id && drawnPolylines.includes(pickedObject.id)) {
                editingPolyline = pickedObject.id;
                isEditing = true;

                // 기존 확정 목록에서 제외 후 엔티티 임시 제거
                drawnPolylines = drawnPolylines.filter(p => p.id !== editingPolyline.id);
                activeShapePoints = [...editingPolyline.customPoints];
                viewer.entities.remove(editingPolyline);

                // 꼭짓점 제어용 노란색 마커 배치
                activeShapePoints.forEach((pt, idx) => {
                    createPoint(pt, idx);
                });

                // 편집 실시간 렌더링용 동적 폴리라인 구동
                activeShape = drawDynamicShape();
                return;
            }

            // 지형 및 3D 모델(Tiles) 단면 고도 픽킹
            const earthPosition = viewer.scene.pickPosition(event.position);
            if (!Cesium.defined(earthPosition)) return;

            // [B] 신규 작도 첫 노드 배치
            if (activeShapePoints.length === 0) {
                activeShapePoints.push(earthPosition); // 고정 첫 노드
                activeShapePoints.push(earthPosition); // 마우스 무브 추적용 가이드 노드
                
                createPoint(earthPosition, 0);
                floatingPoint = createPoint(earthPosition, 1);
                
                activeShape = drawDynamicShape();
            } else {
                // [C] 신규 꼭짓점 추가 (가이드 노드 직전 인덱스에 삽입하여 배열 재생성 부하 최소화)
                const insertIdx = activeShapePoints.length - 1;
                activeShapePoints.splice(insertIdx, 0, earthPosition);
                createPoint(earthPosition, insertIdx);
                
                if (floatingPoint) {
                    floatingPoint.customIndex = activeShapePoints.length - 1;
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // 2. 마우스 이동 (신규 작도/편집 가이드라인 추적)
        handler.setInputAction(function(event) {
            if (activeShapePoints.length > 0 && activeShape) {
                const movePosition = viewer.scene.pickPosition(event.endPosition);
                if (Cesium.defined(movePosition)) {
                    activeShapePoints[activeShapePoints.length - 1] = movePosition;
                    if (floatingPoint) {
                        floatingPoint.position.setValue(movePosition);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // 3. 마우스 더블클릭 (작도/편집 모드 완전 종료 및 확정 고정)
        handler.setInputAction(function(event) {
            if (activeShapePoints.length < 3) return; // 선이 되기 위한 최소 점 개수 체크

            // Cesium 카메라 기본 더블클릭 줌 현상 차단
            if (viewer.screenSpaceEventHandler) {
                viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            }

            // 💡 마우스 무브 추적용 임시 꼬리 좌표 노드 2개 완벽히 제거하여 데이터 싱크 유지
            activeShapePoints.pop();
            activeShapePoints.pop();

            // 정적 폴리라인 확정 생성 및 고정 목록 적치
            drawStaticPolyline(activeShapePoints);

            // 가이드라인 및 꼭짓점 UI 팩 일체 제거
            clearUIElements();

            // 내부 연산 변수 초기 상태로 클리어
            activeShapePoints = [];
            activeShape = null;
            floatingPoint = null;
            isEditing = false;
            editingPolyline = null;

            viewer.selectedEntity = undefined;
            viewer.trackedEntity = undefined;

            // 💡 다음 작도나 기존 폴리라인 편집 선택이 가능하도록 이벤트 리스너 대기 상태 재정렬
            bindEvents();
            
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }

    function clearUIElements() {
        if (floatingPoint) { viewer.entities.remove(floatingPoint); floatingPoint = null; }
        if (activeShape) { viewer.entities.remove(activeShape); activeShape = null; }
        markerEntities.forEach(m => viewer.entities.remove(m));
        markerEntities = [];
    }

    function deactivate() {
        if (handler) {
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        }
    }

    // 모듈 초기화 및 캔버스 클리어 전체 청소
    function reset() {
        deactivate();
        clearUIElements();

        drawnPolylines.forEach(p => viewer.entities.remove(p));
        drawnPolylines = [];
        
        activeShapePoints = [];
        activeShape = null;
        isEditing = false;
        editingPolyline = null;

        viewer.selectedEntity = undefined;
        viewer.trackedEntity = undefined;
        
        bindEvents();
    }

    return {
        activate,
        reset
    };
})();

