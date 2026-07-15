
const express = require('express');
const path = require('path');

const app = express();
const port = 8090;

app.use('/scripts', express.static('public/scripts'));

// CesiumJS는 'node_modules' 안에 설치되며, 이를 정적 경로로 설정
app.use('/node_modules/cesium/Build/Cesium', express.static(path.join(__dirname, 'node_modules/cesium/Build/Cesium')));
app.use('/script', express.static(path.join(__dirname, 'script')));
app.use('/ThirdParty', express.static(path.join(__dirname, 'ThirdParty')));
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/object', express.static(path.join(__dirname, 'object')));
app.use('/jsonData', express.static(path.join(__dirname, 'jsonData')));
app.use('/node_modules/milsymbol/dist', express.static(path.join(__dirname, 'node_modules/milsymbol/dist')));


// 기본 페이지로 리디렉션
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'cop', 'index.html'));
});

app.get('/symbol', (req, res) => {
  res.sendFile(path.join(__dirname, 'cop', 'symbol.html'));
});

app.listen(port, () => {
  console.log(`Cesium development server running at http://localhost:${port}`);
});