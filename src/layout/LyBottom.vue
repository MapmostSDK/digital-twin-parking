<script setup>
import { onMounted } from "vue";
var isClicked = false;
function toggleActive(buttonId) {
  const allButtons = document.querySelectorAll(".btn_children");

  // 遍历所有按钮，移除 active 类，并恢复默认图片
  allButtons.forEach((btn) => {
    btn.classList.remove("active");
    switch (btn.id) {
      case "park":
        btn.src = "../assets/images/swtc-n.png";
        break;
      case "search":
        btn.src = "../assets/images/znzc-n.png";
        break;
      case "charge":
        btn.src = "../assets/images/zncd-n.png";
        break;
      case "money":
        btn.src = "../assets/images/cksf-n.png";
        break;
      case "moniter":
        btn.src = "../assets/images/jkgl-n.png";
        break;
      default:
        break;
    }
  });

  // 给当前点击的按钮添加 active 类并设置选中状态
  const clickedButton = document.getElementById(buttonId);
  clickedButton.classList.add("active");
  switch (buttonId) {
    case "park":
      clickedButton.src = "../assets/images/swtc-s.png";
      break;
    case "search":
      clickedButton.src = "../assets/images/znzc-s.png";
      break;

    case "charge":
      clickedButton.src = "../assets/images/zncd-s.png";
      break;
    case "money":
      clickedButton.src = "../assets/images/cksf-s.png";
      break;
    case "moniter":
      clickedButton.src = "../assets/images/jkgl-s.png";
      break;
    default:
      break;
  }
}
// 主按钮
function showBtn(id) {
  let dom1 = document.getElementById("childBtnOne");
  let dom2 = document.getElementById("childBtnTwo");
  let dom3 = document.getElementById("childBtnThree");

  let p_dom1 = document.getElementById("btn_one");
  let p_dom2 = document.getElementById("btn_two");
  let p_dom3 = document.getElementById("btn_three");

  p_dom1.className = "btn btn_one";
  p_dom2.className = "btn btn_two";
  p_dom3.className = "btn btn_three";

  switch (id) {
    case "childBtnOne":
      p_dom1.className = "btn btn_one btn_one_active";
      dom1.style.display = "block";
      dom2.style.display = "none";
      dom3.style.display = "none";
      clearRecording();

      break;
    case "childBtnTwo":
      p_dom2.className = "btn btn_two btn_two_active";
      dom1.style.display = "none";
      dom2.style.display = "block";
      dom3.style.display = "none";
      clearRecording();

      break;
    case "childBtnThree":
      p_dom3.className = "btn btn_three btn_three_active";
      dom1.style.display = "none";
      dom2.style.display = "none";
      dom3.style.display = "block";
      clearRecording();

      break;

    default:
      break;
  }
}

// 子按钮
function bindFunc(id) {
  switch (id) {
    case "park":
      {
        clearRecording();
        let locations = [
          {
            bearing: 31.05472222222238,
            center: [120.7333971215503, 31.286459405096522],
            pitch: 61.99999999999992,
            zoom: 17.813212528962215,
            speed: 0.5,
            curve: 1,
          },
        ];
        window.mapApi.changeViewers(locations);
        setTimeout(() => {
          window.mapApi.outdoorParking();
        }, 1000);

        window.mapApi.parkingDirections();
      }
      break;
    case "search":
      {
        clearRecording();
        let locations = [
          {
            "center": [
              120.7296600140188,
              31.286298167692465
            ],
            "zoom": 18.925705886549792,
            "bearing": -31.471469444961713,
            "pitch": 57.9283244535305,
            speed: 0.5,
            curve: 1,
          },
        ];
        window.mapApi.changeViewers(locations);
        window.mapApi.smartCarFinding();
        window.mapApi.carFencing();
      }
      break;
    case "charge":
      {
        clearRecording();
        let locations = [
          {
            "center": [
              120.72691050138911,
              31.289666857816016
            ],
            "zoom": 18.897144398678268,
            "bearing": 33.701569951304464,
            "pitch": 71.49030503217328,
            speed: 1,
            curve: 1,
          },
        ];
        window.mapApi.changeViewers(locations);
        window.mapApi.smartCharging();
      }
      break;
    case "money":
      {
        clearRecording();
        let locations = [
          {
            bearing: 62.2547222222222,
            center: [120.73341858479779, 31.286512865583546],
            pitch: 60.99999999999989,
            zoom: 17.894864688542754,
            speed: 1,
            curve: 1,
          },
        ];
        window.mapApi.changeViewers(locations);
        setTimeout(() => {
          window.mapApi.smartOperations();
        }, 1000);
      }
      break;
    case "moniter":
      {
        clearRecording();
        let locations = [
          {
            bearing: 0,
            center: [120.72994157869391, 31.287135180194184],
            pitch: 47.99999999999981,
            zoom: 16.428556967979404,
            speed: 1,
            curve: 1,
          },
        ];
        window.mapApi.changeViewers(locations);
        window.mapApi.addMonitorMarker();
      }
      break;
    case "btn_two":
      {
        clearRecording();
        window.mapApi.overView(true);
      }
      break;
    default:
      break;
  }
}

function clearRecording() {
  window.mapApi.stopRotation();
  window.mapApi.clearOutdoorParking();
  window.mapApi.removeMarker();
  window.mapApi.removeDisplay();
  window.mapApi.removeSecurityWarning();
}

// 选中状态
function activeItem(id, className) {
  if (id === "home") {
    const preSelectEle = document.querySelector("." + className);
    if (preSelectEle) {
      preSelectEle.classList.remove(className);
    }
  } else {
    isClicked = false;
    var gradient = document.getElementById("gradient");
    gradient.children[0].setAttribute("stop-color", "#ffffff");
    gradient.children[1].setAttribute("stop-color", "#ffffff");

    const preSelectEle = document.querySelector("." + className);
    if (preSelectEle) {
      preSelectEle.classList.remove(className);
    }

    const selectEle = document.getElementById(id);
    if (selectEle) {
      selectEle.classList.add(className);
    }
  }
}
</script>

<template>
  <div class="ly-bottom">
    <div class="nav">
      <div class="btn_group">
        <img class="btn btn_one" id="btn_one" @click="showBtn('childBtnOne')" src="../assets/images/btna2.png"
          style="width: 96px; height: 26px" tabindex="0" />
        <img class="btn btn_two" id="btn_two" @click="
          showBtn('childBtnTwo');
        bindFunc('btn_two');
        " src="../assets/images/btna1.png" style="width: 47px; height: 24px" tabindex="0" />

        <img class="btn btn_three" id="btn_three" @click="showBtn('childBtnThree')" src="../assets/images/btna3.png"
          style="width: 96px; height: 26px" tabindex="0" />
      </div>
    </div>
  </div>
  <div id="childBtnOne" class="btn_children_wrapper" style="display: none">
    <div class="btn_children_list">
      <img class="btn_children" id="park" @click="
        bindFunc('park');
      toggleActive('park');
      " src="../assets/images/swtc-n.png" style="width: 203.33; height: 34.16px" tabindex="0" />

      <img class="btn_children" id="search" @click="
        bindFunc('search');
      toggleActive('search');
      " src="../assets/images/znzc-n.png" style="width: 203.33; height: 34.16px" tabindex="0" />
    </div>
  </div>

  <div id="childBtnTwo" class="btn_children_wrapper" style="display: none">
    <div class="btn_children_list"></div>
  </div>

  <div id="childBtnThree" class="btn_children_wrapper" style="display: none">
    <div class="btn_children_list">
      <img class="btn_children" id="charge" @click="
        bindFunc('charge');
      toggleActive('charge');
      " src="../assets/images/zncd-n.png" style="width: 203.33; height: 34.16px" tabindex="0" />
      <img class="btn_children" id="money" @click="
        bindFunc('money');
      toggleActive('money');
      " src="../assets/images/cksf-n.png" style="width: 203.33; height: 34.16px" tabindex="0" />
      <img class="btn_children" id="moniter" @click="
        bindFunc('moniter');
      toggleActive('moniter');
      " src="../assets/images/jkgl-n.png" style="width: 203.33; height: 34.16px" tabindex="0" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
#btn_one:hover,
#btn_one:active,
#btn_one:focus,
.btn_one.btn_one_active {
  content: url("../assets/images/btn2.png");
}

#btn_two:hover,
#btn_two:active,
#btn_two:focus,
.btn_two.btn_two_active {
  content: url("../assets/images/btn1.png");
}

#btn_three:hover,
#btn_three:active,
#btn_three:focus,
.btn_three.btn_three_active {
  content: url("../assets/images/btn3.png");
}

#park:hover,
#park:active,
#park:focus {
  content: url("../assets/images/swtc-s.png");
}

#search:hover,
#search:active,
#search:focus {
  content: url("../assets/images/znzc-s.png");
}

#charge:hover,
#charge:active,
#charge:focus {
  content: url("../assets/images/zncd-s.png");
}

#money:hover,
#money:active,
#money:focus {
  content: url("../assets/images/cksf-s.png");
}

#moniter:hover,
#moniter:active,
#moniter:focus {
  content: url("../assets/images/jkgl-s.png");
}

/* 默认状态 */
#park {
  content: url("../assets/images/swtc-n.png");
}

#search {
  content: url("../assets/images/znzc-n.png");
}

#charge {
  content: url("../assets/images/zncd-n.png");
}

#money {
  content: url("../assets/images/cksf-n.png");
}

#moniter {
  content: url("../assets/images/jkgl-n.png");
}

/* 选中状态 */
#park.active {
  content: url("../assets/images/swtc-s.png");
}

#search.active {
  content: url("../assets/images/znzc-s.png");
}

#charge.active {
  content: url("../assets/images/zncd-s.png");
}

#money.active {
  content: url("../assets/images/cksf-s.png");
}

#moniter.active {
  content: url("../assets/images/jkgl-s.png");
}

.ly-bottom {
  position: absolute;
  bottom: 0;
  width: 100%;
  pointer-events: all;
  z-index: 999;
}

.nav {
  width: 100%;
  height: 5vw;
  /* background: url(../assets/images/button_bg@2x.png) no-repeat; */
  background-size: 100%;
}

.btn_group {
  position: relative;
  display: flex;
  width: 100%;
  bottom: 0vh;
  justify-content: center;
  align-items: center;
}

.svg-icon {
  position: relative;
  bottom: 0.7vh;
  width: 2.3vw;
}

.btn {
  margin: 0 1.2vw;
  font-size: 2.1vh;
  font-weight: 500;
  cursor: pointer;
}

.btn:hover {
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  background-image: linear-gradient(to top, rgb(240, 160, 10) 45%, #fff 80%);
}

.home {
  cursor: pointer;
}

.listActive {
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  background-image: linear-gradient(to top, rgb(240, 160, 10) 45%, #fff 80%);
}

.btn_children_wrapper {
  position: absolute;
  top: 4vw;
  left: 51.5%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  font-size: 1.2rem;
  font-weight: 500;
  margin-top: 1rem;
}

.btn_children_list {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  // span{
  //   position: relative;
  //   left: 50%;
  // }
}

.btn_children {
  cursor: pointer;
  pointer-events: all;
  position: relative;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  color: #f8eac0;
  margin-right: 4rem;
}

.btn_children:hover {
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  background-image: linear-gradient(to top, rgb(240, 160, 10) 25%, #fff 80%);
}

.btn_children_active {
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  background-image: linear-gradient(to top, rgb(240, 160, 10) 25%, #fff 80%);
}

.btn_children_active::after {
  width: 4.9rem;
}
</style>
