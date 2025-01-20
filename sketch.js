// =============================================================================
// 프로그램 : 05-jdkart-RectanglePackinginaPerlinFlowField-v1
// Created : 
// 작가 :                     Original : Copyright by Steve's Makerspace / Video: https://youtu.be/v0Br1dd3uHw
// Github : https://github.com/jdkjeong0815/05-jdkart-RectanglePackinginaPerlinFlowField-v1
// Web : https://jdkjeong0815.github.io/05-jdkart-RectanglePackinginaPerlinFlowField-v1/
// 작품 설명 : 
// 라이브러리 기능 : jdklib.js
// 주기적인 리로드 : 매  ??초
// Last Update : 
// 2025-Jan-19 요약
//  - 1) 표준화 작업
//  - 2) 
// 2024-Dec-24 :
//   1) 입력 없이 자동으로 지정된 시간에 따라 주기적으로 업데이트 되게 로직을 수정함
//      randomizeInputs()
//   2) 화면을 윈도우 화면 크기에 따라 결정
//   3) colors.json - 컬러 수를 늘림 
// =============================================================================

let saveFileName = "05-jdkart-RectanglePackinginaPerlinFlowField-v1";
let tries; //attempts to place rectangles
let skip = 10; //pixels to skip when checking available space
let pixVary = 20; //for grain process
let gap = 0; //between rectangles
let minScale = 0.2; //smallest rectangle
let windowedCanvas = true;  // jdk: 화면 크기에 따라 감
let canvW = 1040;  // jdk 1500
let canvH = 1040;  // jdk 2000
let randomize = true; // jdk false
let layers = true;
let addTree = true;
let addCircles = true;
let limited = false;
let packType = 0; // 0 regular; 1 overlap; 2 none
let shapeType = 1; // 0 rects; 1 pedals; 2 combo
let sclSelect = 1; // 1 small; 2 medium; 3 large; 4 random (mostly medium);
let alph;
let col,
  col3,
  firstCol,
  n2,
  scl,
  colE,
  palette1,
  palette2,
  palettesArray,
  treePlace,
  treeNum,
  midLeaf,
  timeLapse, treeFirst, center2,center3,center4,center5,center6,cN2,cN3,cN4,cN5,cN6,strokeType, rotPerc2,rotPerc3,rotPerc4,rotPerc5,rotPerc6;
let img = [];
let noiseTime = 0;

function preload() {
  // 컬러 팔레트
  palettes = loadJSON("colors.json");

  // 나무 이미지
  // tree assets: https://www.onlygfx.com/17-dead-tree-silhouette-png-transparent/
  for (i = 0; i < 39; i++) {
    img[i] = loadImage(`assets/dead-tree-silhouette-${i}.png`);  
  }
}

function touchStarted() {
  // 첫 번째 터치: 풀스크린 활성화
  let fs = fullscreen();
  fullscreen(!fs);
  
  // setTimeout(newArt, 2000); //전체화면 리로드 전환 위해 2초로 설정
  // return false; // 기본 터치 동작 방지
}


function setup() {
  noScroll(); // 스크롤 금지. 스크롤바 생기는 것 방지
  palettesArray = Object.values(palettes); //turning the JSON file into an array
  palettesLength = palettesArray.length;
  let cnv;
  // cnv를 윈도우 크기로 고정
  cnv = createCanvas(windowWidth, windowHeight);
  // if (windowedCanvas == true) {
  //   cnv = createCanvas(windowWidth, windowHeight);
  // } else {
  //   cnv = createCanvas(canvW, canvH);
  // }
  pixelDensity(1);
  cnv.position(0, 0); // jdk (0, 100) top에서 100px 아래에 위치
  // createUI();  // 입력 화면 삭제
  rectMode(CENTER);
  noLoop();
  randomizeInputs();  // jdk  변수 자동 설정 함수. createUI() 함수 대신 사용.
  newArt();
  setInterval(newArt, 60000); // generate new art every 60 seconds
}

function randomizeInputs() {
  // Randomize the UI inputs
  layers = random() < 0.5;
  addTree = random() < 1;  // jdk: 0< random() <1 작은 수를 만들므로 0.5 기준으로 비교해서 true, false 발생
  // console.log("tree: ", addTree, random());
  
  addCircles = random() < 0.5;
  limited = random() < 0.5;
  shapeType = Math.floor(random(3)); 
  sclSelect = Math.floor(random(1, 2));
  // packType = floor(random(3));  // jdk pack type을 0, regular로 고정
}

function newArt() {
  randomizeInputs();
  let timeLapse = millis();
  // draw();
  if (windowedCanvas == true) {
    resizeCanvas(windowWidth, windowHeight);
  } else {
    resizeCanvas(canvW, canvH);
  }
  clear();
  rez1 = random(0.0005, 0.0025); //resolution of angle noise resolution
  rez2 = random(0.0005, 0.004); //resolution of color noise
  rez3 = random(0.0009, 0.003); //resolution of go or no go - 0.0009, 0.003
  if (packType==2){tries=30000}
  else if (packType==1){tries=100000}
  else {tries=70000}
  //rectangle min & max sizes
  wLow = random(10, 30); //min width
  wHigh = random(30, 60); //max width
  hLow = random(30, 70); //min height
  hHigh = random(70, 130); //max height
  // sclStart is how big rects are at start
  let sclType = 4;
  if (sclSelect == 4) {
    sclType = random(3);
  }
  if (sclType < 0.5 || sclSelect == 1) {
    sclStart = random(0.5, 1.5);
  } //small
  else if (sclType < 2.7 || sclSelect == 2) {
    sclStart = random(1.6, 2.2); //medium
  } else if (sclType < 3 || sclSelect == 3) {
    sclStart = random(3.0, 7.5); //large
  }
  scl = (sclStart / 2000) * width;
  sclReduct = (sclStart / tries) * 1.3; //calculating how much to reduce the scale each try
  palette1 = Math.floor(random(palettesArray.length));
  palette2 = Math.floor(random(palettesArray.length));
  makeBackground();
  if (layers == true) {
    noStroke();
    push();
    translate(width / 2, height / 2);
    rotate(random(PI));
    if (random(2) < 1.5) {
      addLayer();
    }
    rotate(PI);
    if (random(2) < 1.5) {
      addLayer();
    }
    if (random(2) < 1.5) {
      rotate(random(PI * 2));
      addLayer();
    }
    pop();
  }
  if (packType==1){strokeType=0}
  else {strokeType = random(3)}
  if (strokeType < 0.5) {
    noStroke();
  } else if (strokeType < 2.5) {
    stroke(0);
  } else {
    stroke(255);
  }
  noiseTime += 10000;
  // location of centers of rotation and how much influence they have
  let x2 = random(0, (width / 7) * 3);
  let y2 = random(0, (height / 7) * 3);
  let x3 = random(0, (width / 7) * 3);
  let y3 = random((height / 7) * 3, height);
  let x4 = random((width / 7) * 3, width);
  let y4 = random(0, (height / 7) * 3);
  let x5 = random((width / 7) * 3, width);
  let y5 = random((height / 7) * 3, height);
  let x6 = random((width / 7) * 3, (width / 7) * 4);
  let y6 = random((height / 7) * 3, (height / 7) * 4);
  if (limited==false){
    //whether center of rotation will come into play
    center2 = random(10);
    center3 = random(10);
    center4 = random(10);
    center5 = random(10);
    center6 = random(10);
    //amount of influence of center of rotation
    rotPerc2 = random(0.5,1);
    rotPerc3 = random(0.5,1);
    rotPerc4 = random(0.5,1);
    rotPerc5 = random(0.5,1);
    rotPerc6 = random(0.5,1);
    
  }
  else { //limited flow make centers of rotation be in the high or low noise values
    cN2 = noise(x2 * rez3 + noiseTime + 20000, y2 * rez3 + noiseTime + 20000);
  if (cN2<0.3 || cN2>0.7){center2 = 0}
  else {center2 = 10}
  cN3 = noise(x3 * rez3 + noiseTime + 20000, y3 * rez3 + noiseTime + 20000);
  if (cN3<0.3 || cN3>0.7){center3 = 0}
  else {center3 = 10}
  cN4 = noise(x4 * rez3 + noiseTime + 20000, y4 * rez3 + noiseTime + 20000);
  if (cN4<0.3 || cN4>0.7){center4 = 0}
  else {center4 = 10}
  cN5 = noise(x5 * rez3 + noiseTime + 20000, y5 * rez3 + noiseTime + 20000);
  if (cN5<0.3 || cN5>0.7){center5 = 0}
  else {center5 = 10}
  cN6 = noise(x6 * rez3 + noiseTime + 20000, y6 * rez3 + noiseTime + 20000);
  if (cN6<0.3 || cN6>0.7){center6 = 0}
  else {center6 = 10}
  }
  if (addTree == true) {
    treeNum = Math.floor(random(38));
    // console.log("treenum: ", treeNum);
    treePlace = random(2);
    treeFirst = random(2);  
    img[treeNum].resize(0, (height / 3) * 2);
    if (treeFirst<1){  
      drawTree();
    }
  }
  
  if (addCircles == true) {
    if ((limited == false && random(2) < 1)||(limited==true && (random(2) < 0.5 || cN2<0.3 || cN2>0.7))) {
      getComboColor();
      colorMode(HSB, 360, 128, 100, 255);
      fill(huey, sat, brt);
      circle(x2, y2, random(width / 6, width / 3));
      colorMode(RGB);
    }
    if ((limited == false && random(2) < 1)||(limited==true && (random(2) < 0.5 || cN4<0.3 || cN4>0.7))) {
      getComboColor();
      colorMode(HSB, 360, 128, 100, 255);
      fill(huey, sat, brt);
      circle(x4, y4, random(width / 6, width / 3));
      colorMode(RGB);
    }
    // bottom circles but only without tree
    if (addTree == false) {
      if ((limited == false && random(2) < 1)||(limited==true && (random(2) < 0.5 || cN3<0.3 || cN3>0.7))) {
        getComboColor();
        colorMode(HSB, 360, 128, 100, 255);
        fill(huey, sat, brt);
        circle(x3, y3, random(width / 6, width / 3));
        colorMode(RGB);
      }
      if ((limited == false && random(2) < 1)||(limited==true && (random(2) < 0.5 || cN5<0.3 || cN5>0.7))) {
        getComboColor();
        colorMode(HSB, 360, 128, 100, 255);
        fill(huey, sat, brt);
        circle(x5, y5, random(width / 6, width / 3));
        colorMode(RGB);
      }
    }
    if ((limited == false && random(2) < 1)||(limited==true && (random(2) < 0.5 || cN6<0.3 || cN6>0.7))) {
      getComboColor();
      colorMode(HSB, 360, 128, 100, 255);
      fill(huey, sat, brt);
      circle(x6, y6, random(width / 6, width / 3));
      colorMode(RGB);
    }
  }
  
  midLeaf = random(-1.5, 1.5);
  if (addTree == true && treeFirst>=1){
    drawTree();
  }
  
  for (i = 0; i < tries; i++) {
    //start scale at 1 and gradually reduce to minimum size
    scl -= sclReduct;
    if (scl < minScale) {
      scl = minScale;
    }
    //where to attempt rectangle
    x1 = random(width);
    y1 = random(height);
    // n used for rotation; n2 used for color; n3 for whether to draw or not
    n3 = noise(x1 * rez3 + noiseTime + 20000, y1 * rez3 + noiseTime + 20000);
    if (limited == false || limited==true &&((n3>0.45 && n3 < 0.58) || random(100)<0.2 && scl < minScale*3)){
    n = noise(x1 * rez1 + noiseTime, y1 * rez1 + noiseTime);
    n2 = noise(x1 * rez2 + noiseTime + 10000, y1 * rez2 + noiseTime + 10000);
    //rec width & height
    w = random(wLow, wHigh) * scl;
    h = random(hLow, hHigh) * scl;
    ang1 = n * PI * 2;
    //calculate angles for centers of rotation and draw circles
    if (center2 < 5) {
      a2 = y1 - y2;
      b2 = x1 - x2;
      ang2 = atan(a2 / b2);
    } else {
      ang2 = 0;
    }
    if (center3 < 5) {
      a3 = y1 - y3;
      b3 = x1 - x3;
      ang3 = atan(a3 / b3);
    } else {
      ang3 = 0;
    }
    if (center4 < 5) {
      a4 = y1 - y4;
      b4 = x1 - x4;
      ang4 = atan(a4 / b4);
    } else {
      ang4 = 0;
    }
    if (center5 < 5) {
      a5 = y1 - y5;
      b5 = x1 - x5;
      ang5 = atan(a5 / b5);
    } else {
      ang5 = 0;
    }
    if (center6 < 5) {
      a6 = y1 - y6;
      b6 = x1 - x6;
      ang6 = atan(a6 / b6);
    } else {
      ang6 = 0;
    }
    ang = ang1 + ang2*rotPerc2 + ang3*rotPerc3 + ang4*rotPerc4 + ang5*rotPerc5 + ang6*rotPerc6;
    open = true; //is the space available?
    firstCol = null;
      if (packType==2){ // no packing - skip the check below
      }
      else{
    //check if space available for this rectangle; check small rec first
        if (packType==1){h=h/2;w=w/2}
    checkRect(x1, y1, h, w, ang);
    if (open == false) {
      continue;
    }
    // check larger rectangle
    h2 = h + gap * 2;
    w2 = w + gap * 2;
    checkRect(x1, y1, h2, w2, ang);
        if (packType==1){h=h*2;w=w*2}
      }
    if (open == true) {
      //if space available, then get a color and draw the rectangle
      push();
      translate(x1, y1);
      rotate(ang);
      getComboColor();
      let thisCol = get (0,0);
      convert(thisCol);
      if (packType==2){
      alph = 170;
      noStroke();
        w=w*2;
        h=h*2;
      }
      else if (packType==1){alph=210}
      else {alph = 255}
      // rectangle color can't be the same color as what's already there
      let attempts = 0;
      let attemptMax;
      if (packType==2){attemptMax=1}
      else(attemptMax=5)
      while (
        abs(huey - hsbCol[0]) < 15 &&
        abs(sat - hsbCol[1]) < 20 &&
        abs(brt - hsbCol[2]) < 20 && attempts < attemptMax
      ) {
        //if it's too close, get a new color
        getComboColor();
        attempts++
      }
      colorMode(HSB, 360, 128, 100, 255);
      // colors were appearing pastel & washed out, so I'm increasing saturation and decreasing brightness; also giving hue some random variation
      fill(
        huey + random(-10, 10),
        sat * random(1.1, 1.3),
        brt * random(0.7, 0.9),
        alph
      );
      if (shapeType < 1) {
        rect(0, 0, w, h);
      } else if (shapeType < 2) {
        beginShape();
        curveVertex(0, h / 2);
        curveVertex(0, h / 2);
        curveVertex(-w / 2, (h / 10) * midLeaf);
        curveVertex(0, -h / 2);
        curveVertex(w / 2, (h / 10) * midLeaf);
        curveVertex(0, h / 2);
        curveVertex(0, h / 2);
        endShape();
      } else {
        multipleShapes();
      }
      pop();
      colorMode(RGB);
    }
  }}
  if ((random(10) < 9 && addTree == true) || (addTree == true && treeFirst<1)) {
    drawTree();
  }
  print("seconds: " + round((millis() - timeLapse) / 100) / 10);
}

function addLayer() {
  colorBG();
  fill(colBG);
  hStart = height / 4;
  hVar = height / 4;
  beginShape();
  curveVertex(-width, height);
  curveVertex(-width, height);
  curveVertex(-width, hStart + random(-hVar, hVar));
  curveVertex(-width / 3, hStart + random(-hVar, hVar));
  curveVertex(width / 3, hStart + random(-hVar, hVar));
  curveVertex(width, hStart + random(-hVar, hVar));
  curveVertex(width, height);
  curveVertex(width, height);
  endShape();
  colorMode(RGB);
}

function drawTree() {
  if (treePlace < 1) {
    image(img[treeNum], width / 2, height / 3 + height * 0.02);
  } else {
    image(img[treeNum], 0, height / 3 + height * 0.02);
  }
}

function multipleShapes() {
  let shape = random(1);
  if (shape < 0.15) {
    if (w > h) {
      circle(0, 0, h);
    } else {
      circle(0, 0, w);
    }
  } else if (shape < 0.6) {
    rect(0, 0, w, h);
  } else {
    beginShape();
    curveVertex(0, h / 2);
    curveVertex(0, h / 2);
    curveVertex(-w / 2, (h / 10) * midLeaf);
    curveVertex(0, -h / 2);
    curveVertex(w / 2, (h / 10) * midLeaf);
    curveVertex(0, h / 2);
    curveVertex(0, h / 2);
    endShape();
  }
}

function checkRect(x1, y1, h, w, ang) {
  // check 3 corners, 2 sides and center first
  y7 = y1;
  x7 = x1;
  rotate_point(x7, y7, x1, y1, ang);
  if (open == false) {
    return;
  }
  y7 = y1 + h / 2;
  x7 = x1 - w / 2;
  rotate_point(x7, y7, x1, y1, ang);
  if (open == false) {
    return;
  }
  x7 = x1 + w / 2;
  rotate_point(x7, y7, x1, y1, ang);
  if (open == false) {
    return;
  }
  y7 = y1 - h / 2;
  rotate_point(x7, y7, x1, y1, ang);
  if (open == false) {
    return;
  }
  x7 = x1 + w / 2;
  y7 = y1;
  rotate_point(x7, y7, x1, y1, ang);
  if (open == false) {
    return;
  }
  x7 = x1 - w / 2;
  rotate_point(x7, y7, x1, y1, ang);
  if (open == false) {
    return;
  }

  // plot points for each side
  y7 = y1 - h / 2; //top side
  for (x7 = x1 - w / 2; x7 < x1 + w / 2 + skip; x7 += skip) {
    // x1 y1 is center of rec; x7 y7 is each edge point
    if (open == false) {
      return;
    }
    rotate_point(x7, y7, x1, y1, ang);
  }
  y7 = y1 + h / 2; //bottom side
  for (x7 = x1 - w / 2 + skip; x7 < x1 + w / 2 + skip; x7 += skip) {
    if (open == false) {
      return;
    }
    rotate_point(x7, y7, x1, y1, ang);
  }
  x7 = x1 - w / 2; //left side
  for (y7 = y1 - h / 2 + skip; y7 < y1 + h / 2 + skip; y7 += skip) {
    if (open == false) {
      return;
    }
    rotate_point(x7, y7, x1, y1, ang);
  }
  x7 = x1 + w / 2; //right side
  for (y7 = y1 - h / 2 + skip; y7 < y1 + h / 2 + skip; y7 += skip) {
    if (open == false) {
      return;
    }
    rotate_point(x7, y7, x1, y1, ang);
  }
}

function rotate_point(pointX, pointY, originX, originY, angle) {
  //find where x and y are when rectangle is rotated and check color on canvas
  //https://stackoverflow.com/questions/4465931/rotate-rectangle-around-a-point
  //pointX & Y is the side point, originX & Y is the center of rectangle
  let xDiff = pointX - originX;
  let yDiff = pointY - originY;
  x = cos(angle) * xDiff - sin(angle) * yDiff + originX;
  y = sin(angle) * xDiff + cos(angle) * yDiff + originY;
  // console.log("x, y", x, y);

  // 좌표 검증
  if (isNaN(x) || isNaN(y) || x < 0 || x >= width || y < 0 || y >= height) {
    open = false; // 좌표가 유효하지 않으면 공간이 비어있지 않은 것으로 처리
    return;
  }

  col = get(x, y); //canvas color
  if (firstCol == null) {
    firstCol = col;
  }
  // check if this point's color from the canvas is the same as the starting point's color
  if (
    abs(col[0] - firstCol[0]) < 5 &&
    abs(col[1] - firstCol[1]) < 5 &&
    abs(col[2] - firstCol[2]) < 5
  ) {
  } else {
    open = false;
  }
}

function addGrain() {
  timeLapse = millis();
  loadPixels();
  for (i = 0; i < width; i++) {
    for (j = 0; j < height; j++) {
      let pix = (i + j * width) * 4;
      pixels[pix] = pixels[pix] + random(-pixVary, pixVary);
      pixels[pix + 1] = pixels[pix + 1] + random(-pixVary, pixVary);
      pixels[pix + 2] = pixels[pix + 2] + random(-pixVary, pixVary);
    }
  }
  updatePixels();
  print("seconds: " + round((millis() - timeLapse) / 100) / 10);
}