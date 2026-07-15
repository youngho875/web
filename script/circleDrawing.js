window.circleDrawing = (function() {
    const viewer = window.CesiumViewer;
    
    let centerPosition = null;  // 중심점 좌표 (Cartesian3)
    let targetPosition = null;  // 외곽선 반지름 조절용 좌표 (Cartesian3)
    let currentRadius = 0;      // 현재 계산된 반지름(m)

    let activeCircle = null;    // 현재 그리고 있거나 편집 중인 원 엔티티
    let centerPointMarker = null; // 중심점 노란 마커
    let edgePointMarker = null;   // 외곽 조절용 노란 마커

    let trackedEntities = [];   // 확정된 원들을 담아두는 배열

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    // 📍 통일된 노란색 마커 원형 포인트 생성
    function createPoint(position) {
        const entity = viewer.entities.add({
            position: position,
            point: {
                pixelSize: 8,
                color: Cesium.Color.YELLOW,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        });
        return entity;
    }

    // 🎨 CallbackProperty를 활용한 동적 원 생성 함수
    function drawDynamicCircle() {
        return viewer.entities.add({
            position: new Cesium.CallbackProperty(() => centerPosition, false),
            ellipse: {
                semiMajorAxis: new Cesium.CallbackProperty(() => currentRadius, false),
                semiMinorAxis: new Cesium.CallbackProperty(() => currentRadius, false),
                material: Cesium.Color.BLUE.withAlpha(0.4),
                outline: true,
                outlineColor: Cesium.Color.BLUE,
                outlineWidth: 2,
                classificationType: Cesium.ClassificationType.BOTH // 지형 및 3D 건물 위 밀착
            }
        });
    }

    // 💾 고정된 값으로 정적 원 확정 보존 함수
    function drawStaticCircle(center, radius) {
        const entity = viewer.entities.add({
            position: center,
            ellipse: {
                semiMajorAxis: radius,
                semiMinorAxis: radius,
                material: Cesium.Color.BLUE.withAlpha(0.3),
                outline: true,
                outlineColor: Cesium.Color.BLUE,
                outlineWidth: 2,
                classificationType: Cesium.ClassificationType.BOTH
            }
        });
        // 원래 반지름과 중심 데이터를 커스텀 속성으로 바인딩 (클릭 편집용)
        entity.customData = { center: center, radius: radius };
        trackedEntities.push(entity);
        return entity;
    }

    function activate() {
        reset(); 
        bindEvents();
    }

    function bindEvents() {
        // 1. 마우스 단일 좌클릭 (그리기 시작 또는 기존 원 선택하여 편집 모드 진입)
        handler.setInputAction(function(click) {
            // 오브젝트 픽킹 테스트 (기존에 그려진 원이 있는지 확인)
            const pickedObject = viewer.scene.pick(click.position);
            
            // [A] 아무것도 안 그리고 있을 때 기존 원을 클릭한 경우 -> 편집 모드 재진입
            if (!centerPosition && Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.ellipse && pickedObject.id.customData) {
                const selectedCircle = pickedObject.id;
                
                // 기존 확정 목록에서 삭제하고 편집 대상으로 전환
                trackedEntities = trackedEntities.filter(e => e.id !== selectedCircle.id);
                viewer.entities.remove(selectedCircle);

                centerPosition = selectedCircle.customData.center;
                currentRadius = selectedCircle.customData.radius;
                
                // 현재 반지름 기준 외곽 조절점 위치 계산
                const heading = Cesium.Math.toRadians(0);
                const angle = Cesium.Matrix3.fromHeadingPitchRoll(new Cesium.HeadingPitchRoll(heading, 0, 0));
                const offset = Cesium.Matrix3.multiplyByVector(angle, new Cesium.Cartesian3(0, currentRadius, 0), new Cesium.Cartesian3());
                targetPosition = Cesium.Cartesian3.add(centerPosition, offset, new Cesium.Cartesian3());

                // 가이드 헬퍼 인터페이스 배치 및 동적 원 활성화
                centerPointMarker = createPoint(centerPosition);
                edgePointMarker = createPoint(targetPosition);
                activeCircle = drawDynamicCircle();
                return;
            }

            // [B] 첫 클릭 시: 그리기 시작 (중심점 지정)
            const earthPosition = viewer.scene.pickPosition(click.position);
            if (!Cesium.defined(earthPosition)) return;

            if (!centerPosition) {
                centerPosition = earthPosition;
                targetPosition = earthPosition;
                currentRadius = 0;

                centerPointMarker = createPoint(centerPosition);
                edgePointMarker = createPoint(targetPosition);
                activeCircle = drawDynamicCircle();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // 2. 마우스 이동 (실시간 반경 크기 업데이트 가이드)
        handler.setInputAction(function(movement) {
            if (!centerPosition || !activeCircle) return;

            const newPosition = viewer.scene.pickPosition(movement.endPosition);
            if (Cesium.defined(newPosition)) {
                targetPosition = newPosition;
                if (edgePointMarker) {
                    edgePointMarker.position.setValue(targetPosition);
                }
                // 중심점과 마우스 커서 사이의 거리를 구해 실시간 반지름 반영
                currentRadius = Cesium.Cartesian3.distance(centerPosition, targetPosition);
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // 3. 마우스 더블클릭 (원 그리기/편집 완료 및 고정 종료)
        handler.setInputAction(function(event) {
            if (!centerPosition) return;

            // 💡 Cesium 기본 카메라 더블클릭 화면 줌인 현상 차단
            if (viewer.screenSpaceEventHandler) {
                viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            }

            // 현재 가이드 반지름 스펙으로 정적 원 엔티티 확정 생성
            drawStaticCircle(centerPosition, currentRadius);

            // 가이드 인터페이스 UI 요소 청소
            if (centerPointMarker) { viewer.entities.remove(centerPointMarker); centerPointMarker = null; }
            if (edgePointMarker) { viewer.entities.remove(edgePointMarker); edgePointMarker = null; }
            if (activeCircle) { viewer.entities.remove(activeCircle); activeCircle = null; }

            // 변수 상태 리셋 (다시 단일 클릭으로 원을 선택할 수 있는 대기 상태)
            centerPosition = null;
            targetPosition = null;
            currentRadius = 0;

            // 💡 선택/트래킹 강제 취소
            viewer.selectedEntity = undefined;
            viewer.trackedEntity = undefined;

            // 더블클릭 리스너 재등록 처리를 위해 이벤트 핸들러 초기 결합 유지
            bindEvents(); 
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }

    function deactivate() {
        if (handler) {
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        }
    }

    // 완전히 화면을 리셋하여 청소할 때 호출
    function reset() {
        deactivate();

        if (centerPointMarker) { viewer.entities.remove(centerPointMarker); centerPointMarker = null; }
        if (edgePointMarker) { viewer.entities.remove(edgePointMarker); edgePointMarker = null; }
        if (activeCircle) { viewer.entities.remove(activeCircle); activeCircle = null; }

        trackedEntities.forEach(entity => {
            viewer.entities.remove(entity);
        });

        trackedEntities = [];
        centerPosition = null;
        targetPosition = null;
        currentRadius = 0;

        viewer.selectedEntity = undefined;
        viewer.trackedEntity = undefined;
    }

    return {
        activate,
        reset
    };
})();