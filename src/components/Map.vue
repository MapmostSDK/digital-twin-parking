<script setup>
import { onMounted } from "vue";
import MapApi from "../api/MapApi";
import SceneApi from "../api/SceneApi";

const style_opacity = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "land",
      type: "background",
      paint: {
        "background-color": "rgba(190, 192, 197, 0.6)",
      },
    },
  ],
};

onMounted(() => {
  // 地图初始化
  let map = new mapmost.Map({
    container: "map-container",
    style: style_opacity,
    doubleClickZoom: false,
    center: [ 120.7298214801101, 31.286425440191394],
    zoom: 16.37586512074616,
    bearing: -48.16317736958848,
    pitch: 55.27710876023605,
    sky: "light",
    userId: "***", // 请输入您获取的授权码
    env3D: {
      defaultLights: false,
      exposure: 5,
    },
  });

  window.THREE = mapmost.THREE; 
  let modelLayer;
  map.on("load", function () {

    // 停车场模型
    let models_obj = [
      {
        type: "glb",
        url: "./assets/models/SM_Parking.mm",
        decryptWasm:
          "https://delivery.mapmost.com/cdn/b3dm_codec/0.0.2-alpha/sdk_b3dm_codec_wasm_bg_opt.wasm",
      },
      {
        type: "fbx",
        url: "./assets/models/SM_Daozha_1.FBX",
      },
      {
        type: "fbx",
        url: "./assets/models/SM_Daozha_2.FBX",
      },
    ];

    // 图层参数
    let options = {
      id: "model_id1",
      models: models_obj,
      outline: true, // 允许轮廓高亮
      type: "model",
      funcRender: function (gl, matrix) {
        if (modelLayer) {
          modelLayer.renderMarker(gl, matrix);
        }
      },
      center: [120.73014920373011, 31.287414975761724, 0.1],
      callback: function (group, layer) {
        layer.onAfterRender(group).then(function () {
          document.getElementById("loading").style.display = "none";
        });
        modelLayer = layer;
        group.traverse(function (child) {
          if (child.type == "Mesh") {
            if (child.material.map) {
              child.material.map.magFilter = THREE.LinearFilter;
              child.material.map.minFilter = THREE.LinearMipMapLinearFilter;
              child.castShadow = true; 
              child.receiveShadow = true; 
            }
          }
        });

        // 初始化场景
        new SceneApi(map, layer, group);

        // 获取MapApi接口
        window.mapApi = new MapApi(map, layer, group);
      },
    };
    // 添加模型
    map.addLayer(options);

    // 初始化颜色调整
    let pvBHD = mapmost.PostProcessStageLibrary.initColorAdjust(map, {
      saturation: 1,
      lightness: 1,
    });
    map.addPostProcess(pvBHD);
  });
  window.map = map;
});
</script>
<template>
  <div class="map-container" id="map-container"></div>
  <div class="loading" id="loading">加载中…</div>
</template>

<style lang="scss" scoped>
.map-container {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 36px;
  color: #fff;
  font-weight: bold;
}
</style>
