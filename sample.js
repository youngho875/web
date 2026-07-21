



fetch("sample.html").then(res=>res.text()).then(data=>{
    document.getElementById("sample").innerHTML = data;

const shapeSelect = document.getElementById('shape');
const boxFields = document.getElementById('boxFields');

shapeSelect.addEventListener('change', () => {
  if (shapeSelect.value === 'box') {
    boxFields.style.display = 'block'; // 박스 선택 시 표시
  } else {
    boxFields.style.display = 'none';  // 다른 객체 선택 시 숨김
  }
});


 document.getElementById('addBtn').addEventListener('click', () => {
  const lng = parseFloat(document.getElementById('lng').value);
  const lat = parseFloat(document.getElementById('lat').value);
  const userText = document.getElementById("nameLabel").value;
  const shape = shapeSelect.value;
  const viewer = window.CesiumViewer;

  if (shape === 'box') {
    const w = parseFloat(document.getElementById('boxWidth').value);
    const d = parseFloat(document.getElementById('boxDepth').value);
    const h = parseFloat(document.getElementById('boxHeight').value);
    

    const entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lng, lat),
      name: userText,
      
      box: {
        dimensions: new Cesium.Cartesian3(w, d, h),
        material: Cesium.Color.GREEN.withAlpha(0.6),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    });
    const positions = [Cesium.Cartographic.fromDegrees(lng, lat)];
Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, positions).then(updated => {
  const groundHeight = updated[0].height.toFixed(2);
  groundHeightText = `${groundHeight} m`;
});

// description은 저장된 값을 사용
entity.description = new Cesium.CallbackProperty(() => {
  const carto = Cesium.Cartographic.fromCartesian(
    entity.position.getValue(viewer.clock.currentTime)
  );
  const lon = Cesium.Math.toDegrees(carto.longitude).toFixed(5);
  const lat = Cesium.Math.toDegrees(carto.latitude).toFixed(5);

  return `
    <p><b>좌표:</b> ${lon}, ${lat}</p>
    <p><b>지면 고도:</b> ${groundHeightText}</p>
  `;
}, false);
    
  } else if (shape.includes( 'sphere')) {
     const entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lng, lat),
      name: userText,
      ellipsoid: {
        radii: new Cesium.Cartesian3(1, 1, 1),
        material: shape == 'sphere1'? Cesium.Color.RED.withAlpha(0.6)  :shape == 'sphere2'? Cesium.Color.BLUE.withAlpha(0.6) :Cesium.Color.YELLOW.withAlpha(0.6) ,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      },
      billboard: {
        image: shape == 'sphere1'? 
        "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGJhc2VQcm9maWxlPSJmdWxsIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHdpZHRoPSIxMjQiIGhlaWdodD0iMTI0IiB2aWV3Qm94PSIwIDAgMjQ4MCAyNDgwIj48bWV0YWRhdGE+PHJkZjpSREY+PHJkZjpEZXNjcmlwdGlvbj48ZGM6ZGVzY3JpcHRpb24+TVNTL01pbFgtRXhwb3J0IHRvIFNWRzwvZGM6ZGVzY3JpcHRpb24+PGRjOnB1Ymxpc2hlcj5ncy1zb2Z0IEFHPC9kYzpwdWJsaXNoZXI+PC9yZGY6RGVzY3JpcHRpb24+PC9yZGY6UkRGPjwvbWV0YWRhdGE+PGRlZnM+PHN0eWxlIHR5cGU9InRleHQvY3NzIj4uc3MwIHtmaWxsOnJnYigyNTUsMTI4LDEyOCk7c3Ryb2tlOmJsYWNrO3N0cm9rZS13aWR0aDo0MTt9PC9zdHlsZT48L2RlZnM+PGcgdHJhbnNmb3JtPSJtYXRyaXgoMS42MjM0NCAwIDAgMS42MjQ1OSA2Ni4xMzMzIDY2LjEzMzMpIj48cG9seWdvbiBwb2ludHM9IjAsNzA3IDcwNywwIDE0MTQsNzA3IDcwNywxNDE0IiBjbGFzcz0ic3MwIi8+PC9nPjwvc3ZnPg=="
        :shape == 'sphere2'? "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGJhc2VQcm9maWxlPSJmdWxsIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHdpZHRoPSIxODEiIGhlaWdodD0iMTI0IiB2aWV3Qm94PSIwIDAgMzYyMCAyNDgwIj48bWV0YWRhdGE+PHJkZjpSREY+PHJkZjpEZXNjcmlwdGlvbj48ZGM6ZGVzY3JpcHRpb24+TVNTL01pbFgtRXhwb3J0IHRvIFNWRzwvZGM6ZGVzY3JpcHRpb24+PGRjOnB1Ymxpc2hlcj5ncy1zb2Z0IEFHPC9kYzpwdWJsaXNoZXI+PC9yZGY6RGVzY3JpcHRpb24+PC9yZGY6UkRGPjwvbWV0YWRhdGE+PGRlZnM+PHN0eWxlIHR5cGU9InRleHQvY3NzIj4uc3MwIHtmaWxsOnJnYigxMjgsMjI0LDI1NSk7c3Ryb2tlOmJsYWNrO3N0cm9rZS13aWR0aDo0MTt9PC9zdHlsZT48L2RlZnM+PGcgdHJhbnNmb3JtPSJtYXRyaXgoMi4yNDk5NSAwIDAgMi4yNTYzOCA5MS42NDU2IDkxLjg1MTkpIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTUwMCIgaGVpZ2h0PSIxMDAwIiBjbGFzcz0ic3MwIi8+PC9nPjwvc3ZnPg=="
        :"data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGJhc2VQcm9maWxlPSJmdWxsIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHdpZHRoPSIxMjQiIGhlaWdodD0iMTI0IiB2aWV3Qm94PSIwIDAgMjQ4MCAyNDgwIj48bWV0YWRhdGE+PHJkZjpSREY+PHJkZjpEZXNjcmlwdGlvbj48ZGM6ZGVzY3JpcHRpb24+TVNTL01pbFgtRXhwb3J0IHRvIFNWRzwvZGM6ZGVzY3JpcHRpb24+PGRjOnB1Ymxpc2hlcj5ncy1zb2Z0IEFHPC9kYzpwdWJsaXNoZXI+PC9yZGY6RGVzY3JpcHRpb24+PC9yZGY6UkRGPjwvbWV0YWRhdGE+PGRlZnM+PHN0eWxlIHR5cGU9InRleHQvY3NzIj4uc3MwIHtmaWxsOnJnYigxNzAsMjU1LDE3MCk7c3Ryb2tlOmJsYWNrO3N0cm9rZS13aWR0aDo0MTt9PC9zdHlsZT48L2RlZnM+PGcgdHJhbnNmb3JtPSJtYXRyaXgoMi4wNjM1NSAwIDAgMi4wNjU0MyA4NC4wNjc4IDg0LjA2NzgpIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTEwMCIgaGVpZ2h0PSIxMTAwIiBjbGFzcz0ic3MwIi8+PC9nPjwvc3ZnPg==",
        scale: 0.2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
      
    });
 const positions = [Cesium.Cartographic.fromDegrees(lng, lat)];
Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, positions).then(updated => {
  const groundHeight = updated[0].height.toFixed(2);
  groundHeightText = `${groundHeight} m`;
});

// description은 저장된 값을 사용
entity.description = new Cesium.CallbackProperty(() => {
  const carto = Cesium.Cartographic.fromCartesian(
    entity.position.getValue(viewer.clock.currentTime)
  );
  const lon = Cesium.Math.toDegrees(carto.longitude).toFixed(5);
  const lat = Cesium.Math.toDegrees(carto.latitude).toFixed(5);

  return `
    <p><b>좌표:</b> ${lon}, ${lat}</p>
    <p><b>지면 고도:</b> ${groundHeightText}</p>
  `;
}, false);

  } else  if (shape === "billboard3"){
const entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lng, lat),
      name: userText,
      
      billboard: {
        
        image: "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGJhc2VQcm9maWxlPSJmdWxsIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHdpZHRoPSIxMTgiIGhlaWdodD0iMTIxIiB2aWV3Qm94PSIwIDAgMjM2MCAyNDIwIj48bWV0YWRhdGE+PHJkZjpSREY+PHJkZjpEZXNjcmlwdGlvbj48ZGM6ZGVzY3JpcHRpb24+TVNTL01pbFgtRXhwb3J0IHRvIFNWRzwvZGM6ZGVzY3JpcHRpb24+PGRjOnB1Ymxpc2hlcj5ncy1zb2Z0IEFHPC9kYzpwdWJsaXNoZXI+PC9yZGY6RGVzY3JpcHRpb24+PC9yZGY6UkRGPjwvbWV0YWRhdGE+PGRlZnM+PHN0eWxlIHR5cGU9InRleHQvY3NzIj4uc3MwIHtmaWxsOnJnYigxMjgsMjI0LDI1NSk7c3Ryb2tlOmJsYWNrO3N0cm9rZS13aWR0aDo0MDt9LnRzMCB7Zm9udC1mYW1pbHk6QXJpYWw7Zm9udC1zaXplOjI1MTdweDtmb250LXdlaWdodDpib2xkO2ZpbGw6YmxhY2s7dGV4dC1hbmNob3I6bWlkZGxlO308L3N0eWxlPjwvZGVmcz48ZyB0cmFuc2Zvcm09Im1hdHJpeCgxLjUxMDc5IDAgMCAxLjUxMTg5IDQwIDg0NS40KSI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjE1MDAiIGhlaWdodD0iMTAwMCIgY2xhc3M9InNzMCIvPjwvZz48ZyB0cmFuc2Zvcm09Im1hdHJpeCgwLjIgMCAwIDAuMiA0MCA0MCkiPjx0ZXh0IHg9IjU2NzMiIHk9IjM1MTQiIGNsYXNzPSJ0czAiPkkgSTwvdGV4dD48L2c+PC9zdmc+",
        scale: 0.5,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    });

     const positions = [Cesium.Cartographic.fromDegrees(lng, lat)];
Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, positions).then(updated => {
  const groundHeight = updated[0].height.toFixed(2);
  groundHeightText = `${groundHeight} m`;
});

// description은 저장된 값을 사용
entity.description = new Cesium.CallbackProperty(() => {
  const carto = Cesium.Cartographic.fromCartesian(
    entity.position.getValue(viewer.clock.currentTime)
  );
  const lon = Cesium.Math.toDegrees(carto.longitude).toFixed(5);
  const lat = Cesium.Math.toDegrees(carto.latitude).toFixed(5);

  return `
    <p><b>좌표:</b> ${lon}, ${lat}</p>
    <p><b>지면 고도:</b> ${groundHeightText}</p>
  `;
}, false);
  }
  else{
     const entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lng, lat),
      name: userText,
      ellipsoid: {
        radii: new Cesium.Cartesian3(3, 3, 3),
        material: shape == 'billboard1'? Cesium.Color.RED.withAlpha(0.6)  : Cesium.Color.BLUE.withAlpha(0.6) ,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      },
      billboard: {
        
        image: shape == 'billboard1'? "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGJhc2VQcm9maWxlPSJmdWxsIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHdpZHRoPSIxMjQiIGhlaWdodD0iMTI0IiB2aWV3Qm94PSIwIDAgMjQ4MCAyNDgwIj48bWV0YWRhdGE+PHJkZjpSREY+PHJkZjpEZXNjcmlwdGlvbj48ZGM6ZGVzY3JpcHRpb24+TVNTL01pbFgtRXhwb3J0IHRvIFNWRzwvZGM6ZGVzY3JpcHRpb24+PGRjOnB1Ymxpc2hlcj5ncy1zb2Z0IEFHPC9kYzpwdWJsaXNoZXI+PC9yZGY6RGVzY3JpcHRpb24+PC9yZGY6UkRGPjwvbWV0YWRhdGE+PGRlZnM+PG1hc2sgaWQ9ImNyMCIgbWFza1VuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjI0ODAiIGhlaWdodD0iMjQ4MCIgZmlsbC1ydWxlPSJub256ZXJvIj48dXNlIHhsaW5rOmhyZWY9IiNjcDAiIGZpbGw9IndoaXRlIi8+PC9tYXNrPjxwb2x5Z29uIGlkPSJjcDAiIHBvaW50cz0iNjYsMTIyMyAxMjIzLDY2IDIzNDgsMTIyMyAxMjIzLDIzNDgiIHNoYXBlLXJlbmRlcmluZz0iY3Jpc3BFZGdlcyIvPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+LnNzMCB7ZmlsbDpyZ2IoMjU1LDEyOCwxMjgpO3N0cm9rZTpibGFjaztzdHJva2Utd2lkdGg6NDE7fS5iczAge2ZpbGw6YmxhY2s7c3Ryb2tlOm5vbmU7fTwvc3R5bGU+PC9kZWZzPjxnIHRyYW5zZm9ybT0ibWF0cml4KDEuNjIzNDQgMCAwIDEuNjI0NTkgNjYuMTMzMyA2Ni4xMzMzKSI+PHBvbHlnb24gcG9pbnRzPSIwLDcwNyA3MDcsMCAxNDE0LDcwNyA3MDcsMTQxNCIgY2xhc3M9InNzMCIvPjwvZz48ZyBtYXNrPSJ1cmwoI2NyMCkiPjxnIHRyYW5zZm9ybT0ibWF0cml4KDEuNjIzNDQgMCAwIDEuNjI0NTkgNjYuMTMzMyA2Ni4xMzMzKSI+PHBvbHlnb24gcG9pbnRzPSI0MzMsNDI3IDcwNyw1NzUgOTgxLDQyNyA5ODEsNTQ2IDcwNyw2OTQgNDMzLDU0NiIgY2xhc3M9ImJzMCIvPjwvZz48L2c+PC9zdmc+"
        : "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGJhc2VQcm9maWxlPSJmdWxsIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHdpZHRoPSIxODEiIGhlaWdodD0iMTI0IiB2aWV3Qm94PSIwIDAgMzYyMCAyNDgwIj48bWV0YWRhdGE+PHJkZjpSREY+PHJkZjpEZXNjcmlwdGlvbj48ZGM6ZGVzY3JpcHRpb24+TVNTL01pbFgtRXhwb3J0IHRvIFNWRzwvZGM6ZGVzY3JpcHRpb24+PGRjOnB1Ymxpc2hlcj5ncy1zb2Z0IEFHPC9kYzpwdWJsaXNoZXI+PC9yZGY6RGVzY3JpcHRpb24+PC9yZGY6UkRGPjwvbWV0YWRhdGE+PGRlZnM+PG1hc2sgaWQ9ImNyMCIgbWFza1VuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjM2MjAiIGhlaWdodD0iMjQ4MCIgZmlsbC1ydWxlPSJub256ZXJvIj48dXNlIHhsaW5rOmhyZWY9IiNjcDAiIGZpbGw9IndoaXRlIi8+PC9tYXNrPjxwb2x5Z29uIGlkPSJjcDAiIHBvaW50cz0iOTIsOTIgMzQ4Myw5MiAzNDgzLDIzNDIgOTIsMjM0MiIgc2hhcGUtcmVuZGVyaW5nPSJjcmlzcEVkZ2VzIi8+PHN0eWxlIHR5cGU9InRleHQvY3NzIj4uc3MwIHtmaWxsOnJnYigxMjgsMjI0LDI1NSk7c3Ryb2tlOmJsYWNrO3N0cm9rZS13aWR0aDo0MTt9LmJzMCB7ZmlsbDpibGFjaztzdHJva2U6bm9uZTt9PC9zdHlsZT48L2RlZnM+PGcgdHJhbnNmb3JtPSJtYXRyaXgoMi4yNDk5NSAwIDAgMi4yNTYzOCA5MS42NDU2IDkxLjg1MTkpIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTUwMCIgaGVpZ2h0PSIxMDAwIiBjbGFzcz0ic3MwIi8+PC9nPjxnIG1hc2s9InVybCgjY3IwKSI+PGcgdHJhbnNmb3JtPSJtYXRyaXgoMi4yNDk5NSAwIDAgMi4yNTYzOCA5MS42NDU2IDkxLjg1MTkpIj48cG9seWdvbiBwb2ludHM9IjQ3NiwyMjAgNzUwLDM2OCAxMDI0LDIyMCAxMDI0LDMzOSA3NTAsNDg3IDQ3NiwzMzkiIGNsYXNzPSJiczAiLz48L2c+PC9nPjwvc3ZnPg==",
        scale: 0.2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    });

     const positions = [Cesium.Cartographic.fromDegrees(lng, lat)];
Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, positions).then(updated => {
  const groundHeight = updated[0].height.toFixed(2);
  groundHeightText = `${groundHeight} m`;
});

// description은 저장된 값을 사용
entity.description = new Cesium.CallbackProperty(() => {
  const carto = Cesium.Cartographic.fromCartesian(
    entity.position.getValue(viewer.clock.currentTime)
  );
  const lon = Cesium.Math.toDegrees(carto.longitude).toFixed(5);
  const lat = Cesium.Math.toDegrees(carto.latitude).toFixed(5);

  return `
    <p><b>좌표:</b> ${lon}, ${lat}</p>
    <p><b>지면 고도:</b> ${groundHeightText}</p>
  `;
}, false);
  }

  // 카메라 이동
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lng, lat,  500),
  });
});

// // 저장된 엔티티 데이터 보관용
// let savedEntities = [];

// // 저장 버튼
// document.getElementById("saveBtn").addEventListener("click", () => {
//   savedEntities = viewer.entities.values.map(entity => {
//     return {
//       name: entity.name,
//       position: Cesium.Cartographic.fromCartesian(
//         entity.position.getValue(viewer.clock.currentTime)
//       ),
//       box: entity.box ? {
//         dimensions: entity.box.dimensions,
//         material: entity.box.material.color.getValue(viewer.clock.currentTime).toCssColorString()
//       } : null
//     };
//   });
//   console.log("저장 완료:", savedEntities);
// });

// // 불러오기 버튼
// document.getElementById("loadBtn").addEventListener("click", () => {
//   viewer.entities.removeAll();
//   savedEntities.forEach(data => {
//     viewer.entities.add({
//       name: data.name,
//       position: Cesium.Cartesian3.fromRadians(
//         data.position.longitude,
//         data.position.latitude,
//         data.position.height
//       ),
//       box: data.box ? {
//         dimensions: data.box.dimensions,
//         material: Cesium.Color.fromCssColorString(data.box.material)
//       } : undefined
//     });
//   });
//   console.log("불러오기 완료");
// });

// 특정 엔티티 삭제 버튼 (현재 선택된 엔티티 삭제)
document.getElementById("deleteBtn").addEventListener("click", () => {
  if (viewer.selectedEntity) {
    viewer.entities.remove(viewer.selectedEntity);
    console.log("선택된 엔티티 삭제 완료");
  } else {
    console.log("삭제할 엔티티가 선택되지 않았습니다.");
  }
});

// 전체 엔티티 삭제 버튼
document.getElementById("deleteAllBtn").addEventListener("click", () => {
  viewer.entities.removeAll();
  console.log("전체 엔티티 삭제 완료");
});



function serializeEntities() {
  return viewer.entities.values.map(entity => {
    const carto = Cesium.Cartographic.fromCartesian(
      entity.position?.getValue(viewer.clock.currentTime) || Cesium.Cartesian3.ZERO
    );

    const data = {
      name: entity.name || "",
      longitude: Cesium.Math.toDegrees(carto.longitude),
      latitude: Cesium.Math.toDegrees(carto.latitude),
      height: carto.height
    };

    // Box
    if (entity.box) {
        const dims = entity.box.dimensions.getValue(viewer.clock.currentTime);
      data.box = {
        dimensions: {
          x: dims.x,
          y: dims.y,
          z: dims.z
        },
        color: entity.box.material.color.getValue(viewer.clock.currentTime).toCssColorString()
      };
    }

    // Ellipsoid (Sphere 포함)
    if (entity.ellipsoid) {
      const radii = entity.ellipsoid.radii.getValue(viewer.clock.currentTime);
      data.ellipsoid = {
        radii: { x: radii.x, y: radii.y, z: radii.z },
        color: entity.ellipsoid.material.color.getValue(viewer.clock.currentTime).toCssColorString()
      };
    }

    // Billboard
    if (entity.billboard) {
      data.billboard = {
        image: entity.billboard.image.getValue(viewer.clock.currentTime),
        scale: entity.billboard.scale.getValue(viewer.clock.currentTime)
      };
    }

    // Label
    if (entity.label) {
      data.label = {
        text: entity.label.text.getValue(viewer.clock.currentTime),
        font: entity.label.font.getValue(viewer.clock.currentTime),
        fillColor: entity.label.fillColor.getValue(viewer.clock.currentTime).toCssColorString()
      };
    }

    return data;
  });
}

// 파일 저장
document.getElementById("saveFileBtn").addEventListener("click", () => {
  const dataStr = JSON.stringify(serializeEntities(), null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "entities.json";
  a.click();

  URL.revokeObjectURL(url);
});



document.getElementById("loadFileBtn").addEventListener("click", () => {
  document.getElementById("fileInput").click();
});

document.getElementById("fileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const entitiesData = JSON.parse(e.target.result);
    viewer.entities.removeAll();

    entitiesData.forEach(data => {
      const options = {
        name: data.name,
        position: Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude, data.height)
      };

      if (data.box) {
        options.box = {
          dimensions: new Cesium.Cartesian3(
            data.box.dimensions.x,
            data.box.dimensions.y,
            data.box.dimensions.z
          ),
          material: Cesium.Color.fromCssColorString(data.box.color),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        };
      }

      if (data.ellipsoid) {
        options.ellipsoid = {
          radii: new Cesium.Cartesian3(
            data.ellipsoid.radii.x,
            data.ellipsoid.radii.y,
            data.ellipsoid.radii.z
          ),
          material: Cesium.Color.fromCssColorString(data.ellipsoid.color),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        };
      }

      if (data.billboard) {
        options.billboard = {
          image: data.billboard.image,
          scale: data.billboard.scale,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        };
      }

      if (data.label) {
        options.label = {
          text: data.label.text,
          font: data.label.font,
          fillColor: Cesium.Color.fromCssColorString(data.label.fillColor)
        };
      }

      const entity = viewer.entities.add(options);

       const positions = [Cesium.Cartographic.fromDegrees(data.longitude, data.latitude)];
Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, positions).then(updated => {
  const groundHeight = updated[0].height.toFixed(2);
  groundHeightText = `${groundHeight} m`;
});

// description은 저장된 값을 사용
entity.description = new Cesium.CallbackProperty(() => {
  const carto = Cesium.Cartographic.fromCartesian(
    entity.position.getValue(viewer.clock.currentTime)
  );
  const lon = Cesium.Math.toDegrees(carto.longitude).toFixed(5);
  const lat = Cesium.Math.toDegrees(carto.latitude).toFixed(5);

  return `
    <p><b>좌표:</b> ${lon}, ${lat}</p>
    <p><b>지면 고도:</b> ${groundHeightText}</p>
  `;
}, false);



    });
  };
  reader.readAsText(file);
});

///////////////////////////////////////////////////////////////////////////////////여기서부터

// 유틸: 현재 실제 시각을 JulianDate로
function nowJulian() {
  return Cesium.JulianDate.fromDate(new Date());
}

// 안전한 CallbackProperty 생성: timeline에서 값이 없을 때 폴백 제공
function createSafeCallbackPosition(entity, timeline) {
  return new Cesium.CallbackProperty(function(time) {
    try {
      if (timeline && typeof timeline.getValue === 'function') {
        const v = timeline.getValue(time);
        if (Cesium.defined(v)) return v;
      }
      const lt = lastSampleTime.get(entity);
      if (Cesium.defined(lt) && timeline && typeof timeline.getValue === 'function') {
        const fallback = timeline.getValue(lt);
        if (Cesium.defined(fallback)) return fallback;
      }
      // 기존 position이 Cartesian3이면 반환
      if (entity.position && entity.position.x !== undefined) return entity.position;
    } catch (e) {
      console.warn('createSafeCallbackPosition error:', e);
    }
    // 안전한 기본값(지구 표면 근처)
    return Cesium.Cartesian3.fromDegrees(0, 0, 0);
  }, false);
}

// 선택된 엔티티에 웨이포인트를 큐에 추가 (지형 고도 샘플링 포함, 안전 처리)
async function queueWaypointForSelectedEntity(lon, lat, durationSec) {
  if (typeof viewer === 'undefined' || !viewer) {
    alert('Cesium viewer가 준비되지 않았습니다.');
    return;
  }
  const entity = viewer.selectedEntity;
  if (!entity) { alert('먼저 객체를 선택하세요.'); return; }
  const dur = Math.max(0.1, Number(durationSec) || 5);

  let q = waypointsByEntity.get(entity);
  if (!q) { q = []; waypointsByEntity.set(entity, q); }

  // 지형 고도 샘플링 (안전하게)
  let height = 0;
  try {
    const carto = Cesium.Cartographic.fromDegrees(lon, lat);
    const updated = await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [carto]);
    if (updated && updated[0] && Number.isFinite(updated[0].height)) {
      height = updated[0].height;
    } else {
      height = 0;
    }
  } catch (e) {
    console.warn('terrain 샘플링 실패:', e);
    height = 0;
  }

  q.push({ lon: Number(lon), lat: Number(lat), dur: Number(dur), height: Number(height) });

  // 입력 시점에는 애니메이션을 자동으로 켜지지 않음
  viewer.clock.shouldAnimate = false;

  console.log(`웨이포인트 추가: 엔티티='${entity.name || 'unnamed'}' lon=${lon} lat=${lat} dur=${dur} h=${height}`);
}

// 동시 이동 바인딩 및 시작 (모든 엔티티를 동일한 execNow 기준으로 이동)
function bindQueuedWaypointsAndStart() {
  if (typeof viewer === 'undefined' || !viewer) {
    console.error('viewer가 정의되어 있지 않습니다.');
    return;
  }

  const execNow = nowJulian();
  let globalStop = execNow.clone();

  // 안전 초기화: clock을 execNow로 맞춤 (애니메이션은 마지막에 켬)
  viewer.clock.startTime = execNow.clone();
  viewer.clock.currentTime = execNow.clone();
  viewer.clock.stopTime = execNow.clone();

  for (const [entity, q] of waypointsByEntity.entries()) {
    try {
      if (!q || q.length === 0) continue;
      if (!Cesium.defined(entity)) {
        console.warn('바인딩 대상 엔티티가 정의되지 않음, 스킵');
        waypointsByEntity.set(entity, []);
        continue;
      }

      let timeline = boundTimelines.get(entity);
      let cursor;

      if (timeline && typeof timeline.addSample === 'function') {
        // 이미 바인딩된 타임라인이 있으면 마지막 샘플 시간부터 이어붙임
        cursor = lastSampleTime.get(entity) || execNow.clone();
      } else {
        // 새 타임라인 생성
        timeline = new Cesium.SampledPositionProperty();
        boundTimelines.set(entity, timeline);

        // 시작 샘플: 가능한 경우 현재 위치를 사용, 없으면 첫 웨이포인트 좌표
        let startCartesian = undefined;
        try {
          if (entity.position && typeof entity.position.getValue === 'function') {
            const v = entity.position.getValue(execNow);
            if (Cesium.defined(v)) startCartesian = v;
          } else if (entity.position && entity.position.x !== undefined) {
            startCartesian = entity.position;
          }
        } catch (e) {
          console.warn('startCartesian 읽기 실패:', e);
        }
        if (!startCartesian) {
          const first = q[0];
          startCartesian = Cesium.Cartesian3.fromDegrees(first.lon, first.lat, first.height || 0);
        }

        // execNow에 시작 샘플 추가 (방어적으로)
        try {
          timeline.addSample(execNow, startCartesian);
        } catch (e) {
          console.error('timeline.addSample(execNow) 실패:', e);
        }
        cursor = execNow.clone();

        // 안전한 position 바인딩 (CallbackProperty 사용)
        entity.position = createSafeCallbackPosition(entity, timeline);
      }

      // 각 웨이포인트를 cursor 기준으로 추가 (방어적으로)
      for (const wp of q) {
        try {
          cursor = Cesium.JulianDate.addSeconds(cursor, wp.dur, new Cesium.JulianDate());
          timeline.addSample(cursor, Cesium.Cartesian3.fromDegrees(wp.lon, wp.lat, wp.height || 0));
        } catch (e) {
          console.error('웨이포인트 추가 중 오류:', e, wp);
        }
      }

      // 마지막 샘플 시간 저장
      lastSampleTime.set(entity, cursor.clone());

      // orientation 설정 (샘플 2개 이상)
      try {
        const sampleCount = (q.length + 1); // 초기 샘플 포함
        if (sampleCount >= 2) {
          entity.orientation = new Cesium.VelocityOrientationProperty(timeline);
        }
      } catch (e) {
        console.warn('orientation 설정 실패:', e);
      }

      // boundTimelines 갱신
      boundTimelines.set(entity, timeline);

      // globalStop 갱신
      if (Cesium.JulianDate.greaterThan(cursor, globalStop)) {
        globalStop = cursor.clone();
      }

      // 엔티티가 보이지 않게 되는 문제 방지
      try {
        entity.show = true;
      } catch (e) {
        // 무시
      }

      // 큐 비우기
      waypointsByEntity.set(entity, []);
    } catch (e) {
      console.error('엔티티 바인딩 루프에서 예외:', e);
    }
  }

  // viewer.clock.stopTime은 startTime보다 작을 수 없음
  if (Cesium.JulianDate.lessThan(globalStop, viewer.clock.startTime)) {
    globalStop = Cesium.JulianDate.addSeconds(viewer.clock.startTime, 1, new Cesium.JulianDate());
  }
  viewer.clock.stopTime = globalStop.clone();
  viewer.clock.currentTime = viewer.clock.startTime.clone();

  // 각 엔티티 availability 업데이트 (방어적으로)
  for (const [entity, timeline] of boundTimelines.entries()) {
    try {
      const last = lastSampleTime.get(entity) || viewer.clock.stopTime;
      entity.availability = new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
        start: viewer.clock.startTime,
        stop: last
      })]);
    } catch (e) {
      console.warn('availability 설정 실패:', e);
    }
  }

  // 애니메이션 시작
  viewer.clock.shouldAnimate = true;
  console.log('동시 이동 시작: start=', viewer.clock.startTime, ' stop=', viewer.clock.stopTime);
}

// 버튼 바인딩 (중복 바인딩 방지)
(function bindButtonsSafely() {
  const addWpBtn = document.getElementById("addWaypointBtn");
  if (addWpBtn && !addWpBtn._bound) {
    addWpBtn.addEventListener("click", async () => {
      const lon = parseFloat(document.getElementById("lonInput").value);
      const lat = parseFloat(document.getElementById("latInput").value);
      const dur = parseFloat(document.getElementById("durationInput").value);
      if (isNaN(lon) || isNaN(lat)) { alert("위도/경도를 올바르게 입력하세요."); return; }
      await queueWaypointForSelectedEntity(lon, lat, isNaN(dur) ? 5 : dur);
    });
    addWpBtn._bound = true;
  }

  const startBtn = document.getElementById("startMoveBtn");
  if (startBtn && !startBtn._bound) {
    startBtn.addEventListener("click", () => {
      try {
        bindQueuedWaypointsAndStart();
      } catch (e) {
        console.error('이동 실행 중 오류:', e);
        alert('이동 실행 중 오류가 발생했습니다. 콘솔을 확인하세요.');
      }
    });
    startBtn._bound = true;
  }
})();



/////////////////////////////////////////////////////////여기까지
});



function openSample() {
        // window.open("symbol", "symbolPopup", "width=300,height=400");
        var sym = document.getElementById("sample")
        if(sym.style.display == "block")
        {
            sym.style.display = "none";
        }
        else
        {
            sym.style.display = "block";
        }
}
const viewer = window.CesiumViewer;
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction((click) => {
  const picked = viewer.scene.pick(click.position);
  if (Cesium.defined(picked) && Cesium.defined(picked.id)) {
    viewer.selectedEntity = picked.id; // InfoBox에 연결
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);










// 전역 상태: fetch 콜백 내부와 외부에서 모두 사용
const waypointsByEntity = new Map();   // Map<Entity, Array<{lon,lat,dur,height}>>
const boundTimelines = new Map();      // Map<Entity, SampledPositionProperty>
const lastSampleTime = new Map();      // Map<Entity, JulianDate>

// 선택된 엔티티에 웨이포인트를 큐에 추가
async function queueWaypointForSelectedEntity(lon, lat, durationSec) {
  // viewer와 waypointsByEntity는 전역에서 정의되어 있어야 합니다.
  if (typeof viewer === 'undefined' || !viewer) {
    console.error('viewer가 정의되어 있지 않습니다.');
    alert('Cesium viewer가 준비되지 않았습니다.');
    return;
  }

  const entity = viewer.selectedEntity;
  if (!entity) {
    alert('먼저 이동시킬 엔티티를 선택하세요 (맵에서 클릭).');
    return;
  }

  const dur = Math.max(0.1, Number(durationSec) || 5);

  // 엔티티별 큐 가져오기 또는 생성
  let q = waypointsByEntity.get(entity);
  if (!q) {
    q = [];
    waypointsByEntity.set(entity, q);
  }

  // 지형 고도 샘플링 (선택적, 실패 시 0)
  let height = 0;
  try {
    const carto = Cesium.Cartographic.fromDegrees(lon, lat);
    const updated = await Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [carto]);
    const h = updated && updated[0] && updated[0].height;
    height = Number.isFinite(h) ? h : 0;
  } catch (e) {
    console.warn('terrain 샘플링 실패:', e);
    height = 0;
  }

  // 큐에 추가
  q.push({ lon: Number(lon), lat: Number(lat), dur: Number(dur), height: Number(height) });

  // 입력 시점에는 애니메이션을 자동으로 켜지지 않음
  viewer.clock.shouldAnimate = false;

  console.log(`웨이포인트 추가: 엔티티='${entity.name || 'unnamed'}' lon=${lon} lat=${lat} dur=${dur} height=${height}`);
}


