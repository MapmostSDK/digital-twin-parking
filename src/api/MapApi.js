//该类主要用于地图和场景相关操作
import { animations, geoFencingCoordinates, MonitorMarkeDatas, PathData } from './data';
import { reverse } from "lodash-es";
class MapApi {
  constructor(map, layer, group) {
    this._map = map;
    this._layer = layer;
    this._group = group;
    this.selectedObj = undefined;
    this.polygonData = [];
    this.markerData = [];
    this.workerMarkers = [];
    this.coord = [];
    this.videoMarkers = []; //存放监控标签的数组
    this.shouldRotate = true;
    this.monitorMarker = [];
    this.displayMarkers = [];
  }

  get map() {
    return this._map;
  }

  //室外停车
  outdoorParking() {
    let self = this;
    this.rescue = true;
    let models_obj = ["./assets/models/SM_Car01.mm"].map(item => ({
      type: 'glb',
      url: item,
      decryptWasm: 'https://delivery.mapmost.com/cdn/b3dm_codec/0.0.2-alpha/sdk_b3dm_codec_wasm_bg_opt.wasm' // 模型解密
    }));

    let options = {
      id: "uniqueId2",
      type: 'model',
      models: models_obj,
      center: [120.73653811097958, 31.288603587532425, 9],
      callback: function (group, layer) {
        let index = 0;
        self._startNextAnimation(index, group);
      }
    };
    this._map.addLayer(options);
  }

  _startNextAnimation(index,group) {
    if (index < animations.length) {
      let anim = animations[index];
      let path = anim.path;
      let orignAngle = anim.startAngle;
      let nextAngle = anim.endAngle;
      let smoothPath = this._smoothPathInterpolation(path, 0.00003);
      let pathIndex = 0;
      
      this._moveModel(index,group,orignAngle,nextAngle,smoothPath,pathIndex);
    }
  }

  _moveModel(index,group,orignAngle,nextAngle,smoothPath,pathIndex) {
    if (pathIndex === smoothPath.length - 1) {
      setTimeout(() => {
        pathIndex = 0;
        index++;
        if (index === 1) {
          window.mapApi.addEnterParkingLotAnimation();
          setTimeout(() => {
            this._startNextAnimation(index,group);
          }, 2000);
        } else {
          this._startNextAnimation(index,group);
        }
      }, 1000);
    }

    if (pathIndex < smoothPath.length) {
      // 更新模型位置
      group.setCoords([smoothPath[pathIndex][0], smoothPath[pathIndex][1], 9]);
      // 更新角度
      orignAngle = nextAngle;
      if (pathIndex < smoothPath.length - 1) {
        nextAngle = this._calculateAngle(smoothPath[pathIndex], smoothPath[pathIndex + 1]);
      }
      // 更新模型旋转
      group.setRotation({ x: 0, y: 0, z: -(nextAngle - orignAngle) });
      // 延迟下一次更新
      setTimeout(() => {
        pathIndex++;
        this._moveModel(index,group,orignAngle,nextAngle,smoothPath,pathIndex);
      }, 100);
    }
  }

  // 计算转向角
  _calculateAngle(startPoint, endPoint) {
    let bearing;
    if (endPoint[0] === startPoint[0]) {
      bearing = endPoint[1] > startPoint[1] ? 0 : 180;
    } else {
      let k = (endPoint[1] - startPoint[1]) / (endPoint[0] - startPoint[0]);
      let radian = Math.atan(k);
      if (startPoint[0] < endPoint[0]) {
        bearing = -radian + Math.PI / 2;
      } else {
        bearing = -radian + Math.PI * 3 / 2;
      }
    }
    return bearing * 180 / Math.PI;
  }

  // 路径数据内插函数
  _smoothPathInterpolation(path, stepSize) {
    let newPath = [];
    for (let i = 0; i < path.length - 1; i++) {
      let start = path[i];
      let end = path[i + 1];
      // 将路径之间插入更多点
      newPath.push(start);
      let distance = this._getDistance(start, end);  // 计算两点之间的距离
      let numSteps = Math.floor(distance / stepSize); // 计算插入点的数量
      for (let j = 1; j < numSteps; j++) {
        let interpolatedPoint = this._interpolate(start, end, j / numSteps);
        newPath.push(interpolatedPoint);
      }
    }
    newPath.push(path[path.length - 1]); // 添加最后一个点
    return newPath;
  }

  // 计算两点之间的距离
  _getDistance(start, end) {
    let dx = end[0] - start[0];
    let dy = end[1] - start[1];
    return Math.sqrt(dx * dx + dy * dy); // 使用平面距离计算
  }

  // 根据比例计算插值点
  _interpolate(start, end, t) {
    let lat = start[0] + t * (end[0] - start[0]);
    let lon = start[1] + t * (end[1] - start[1]);
    let alt = start[2] + t * (end[2] - start[2]);
    return [lat, lon, alt];
  }

  // 智能充电
  smartCharging() {
    let self = this;
    let modelLayer = this._layer;
    let container = document.createElement('div');
    container.className = 'cd-container';
    let container1 = document.createElement('div');
    container1.className = 'dl-container';
    container1.textContent = '电量:';
    let container2 = document.createElement('div');
    container2.className = 'sz-container';
    container2.textContent = '85%'
    let closeIcon = document.createElement('div');
    closeIcon.className = 'jd-container';
    container.appendChild(closeIcon);
    container.appendChild(container1);
    container.appendChild(container2);
    let datas = [
      {
        id: 'charge_marker',
        element: container,
        position: [120.72654225820152, 31.28925166246349, 40],
      },
    ];

    let displayMarker = modelLayer.addMarker({
      id: 'display_pop',
      data: datas,
    });
    self.displayMarkers.push(displayMarker);
    let GeoFencing_fade = this._layer.addGeoFencing({
      type: "fade",
      color: "#87CEFA",
      speed: 3,
      opacity: 0.5,
      height: 20,
      data: { coordinate: geoFencingCoordinates[0] }
    });
    this.polygonData.push(GeoFencing_fade)
  }

  // 监控管理
  addMonitorMarker() {
    let self = this;
    let modelLayer = this._layer;
    let GeoFencing_fade = this._layer.addGeoFencing({
      type: "fade",
      color: "#0EFCFF",
      speed: 2,
      opacity: 0.5,
      height: 45,
      data: { coordinate: geoFencingCoordinates[1] }
    });
    this.polygonData.push(GeoFencing_fade)
    //  标签
    let datas = new Array(MonitorMarkeDatas.length);
    var i;
    for (i = 0; i < MonitorMarkeDatas.length; i++) {
      datas[i] = {
        id: 'monitor_' + i,
        element: self.createDeviceDom(
          'cameraInfo',
          './assets/images/camera4.png',
          '35px',
          '50px',
          'cameraClass'
        ),
        position: MonitorMarkeDatas[i],
      };
    }
    self.monitorMarker = modelLayer.addMarker({
      id: 'marker_monitor',
      data: datas,
    });

    self.markerData.push(self.monitorMarker);

    self.monitorMarker.element.children.forEach((dom, index) => {
      dom.element.addEventListener('click', (e) => {
        if (self.videoMarkers.length > 0) {
          self.videoMarkers.forEach((m) => {
            if (m.remove) m.remove();
            m = null;
          });
          self.videoMarkers = [];
        }

        let dom = document.createElement('div');
        dom.className = 'video-pop';
        let closeIcon = document.createElement('div');
        closeIcon.className = 'closeVideo2';
        const video = document.createElement('video');
        video.src = './assets/images/parking.mp4';
        video.controls = false;
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.height = 109;
        video.width = 150;
        video.className = 'video-style';
        video.style.position = 'absolute; top: 30px';

        dom.appendChild(video);
        dom.appendChild(closeIcon);
        video.style.opacity = 1.0;

        let cameraMarker = modelLayer.addMarker({
          id: 'marker_video',
          data: [
            {
              name: 'a',
              element: dom,
              position: datas[index].position,
            },
          ],
        });
        self.videoMarkers.push(cameraMarker);
        cameraMarker.element.children[0].element.addEventListener(
          'click',
          (e) => {
            let target = e.target; // 获取当前点击的目标子元素
            if (target.className == 'closeVideo2') {
              if (self.videoMarkers.length > 0) {
                self.videoMarkers.forEach((m) => {
                  if (m.remove) m.remove();
                  m = null;
                });
                self.videoMarkers = [];
              }
            }
          }
        );
      });
    });
  }

  //缴费信息
  paymentInformation() {
    let self = this;
    let modelLayer = this._layer;
    let container = document.createElement('div');
    container.className = 'device-container';
    let closeIcon = document.createElement('div');
    closeIcon.className = 'closeVideo2';
    container.appendChild(closeIcon);
    let datas = [
      {
        id: 'payment_marker',
        element: container,
        position: [120.73378290106236, 31.287464776861636, 20],
      },
    ];

    let displayMarker = modelLayer.addMarker({
      id: 'display_pop',
      data: datas,
    });
    self.displayMarkers.push(displayMarker);

    displayMarker.element.children[0].element.addEventListener(
      'click',
      (e) => {
        let target = e.target;
        if (target.className == 'device-container') {
          window.mapApi.addOutParkingLotAnimation();
          setTimeout(() => {
            if (self.onTriggerSecondAnimation) {
              self.onTriggerSecondAnimation();
            }
          }, 2000);

          if (self.displayMarkers.length > 0) {
            self.displayMarkers.forEach((m) => {
              if (m.remove) m.remove();
              m = null;
            });
            self.displayMarkers = [];
          }
        }
      }
    );
  }

  //智慧运维
  smartOperations() {
    let self = this;
    this.rescue = true;
    let models_obj = ["./assets/models/SM_Car02.mm"].map(item => ({
      type: 'glb',
      url: item,
      decryptWasm: 'https://delivery.mapmost.com/cdn/b3dm_codec/0.0.2-alpha/sdk_b3dm_codec_wasm_bg_opt.wasm' // 模型解密
    }));
    let options1 = {
      id: "uniqueId",
      type: 'model',
      models: models_obj,
      center: [120.73278993631533, 31.285836075097947, 11],
      callback: function (group, layer) {

        group.followPath({ path: PathData.path, duration: 8000 }, () => {
          window.mapApi.paymentInformation();

          // 挂载第二段动画触发逻辑
          self.onTriggerSecondAnimation = () => {
            group.followPath({ path: PathData.newPath, duration: 8000 }, () => {
            });
          };
        });
      }
    };
    self._map.addLayer(options1);
  }

  //车辆地理围栏
  carFencing() {
    let GeoFencing_fade2 = this._layer.addGeoFencing({
      type: "fade",
      color: "#ffffff",
      speed: 3,
      opacity: 0.5,
      height: 15,
      data: { coordinate: geoFencingCoordinates[2] }
    });
    this.polygonData.push(GeoFencing_fade2)
  }

  // 智能找车
  smartCarFinding() {
    let self = this;
    let modelLayer = this._layer;

    let marker = [{
      id: 'a',
      element: self.createDeviceDom(
        'd_marker',
        './assets/images/car.png',
        '60px',
        '70px'),
      position: [120.72957103321573, 31.28606944543456, 24.441638241987945],
    }];

    self.deviceMarkers = modelLayer.addMarker({
      id: 'marker_display',
      data: marker,
    });
    self.markerData.push(self.deviceMarkers);

    self.deviceMarkers.element.children.forEach((dom, index) => {
      dom.element.addEventListener('click', (e) => {
        if (self.displayMarkers.length > 0) {
          self.displayMarkers.forEach((m) => {
            if (m.remove) m.remove();
            m = null;
          });
          self.displayMarkers = [];
        }
        let container = document.createElement('div');
        container.className = 'cl-container';
        let closeIcon = document.createElement('div');
        closeIcon.className = 'closeVideo';
        container.appendChild(closeIcon);


        let datas = [
          {
            id: 'find_marker',
            element: container,
            position: [120.73003859303486, 31.28614604836671, 20],
          },
        ];

        let displayMarker = modelLayer.addMarker({
          id: 'display_pop',
          data: datas,
        });
        self.displayMarkers.push(displayMarker);

        displayMarker.element.children[0].element.addEventListener(
          'click',
          (e) => {
            let target = e.target; // 获取当前点击的目标子元素
            if (target.className == 'closeVideo') {
              if (self.displayMarkers.length > 0) {
                self.displayMarkers.forEach((m) => {
                  if (m.remove) m.remove();
                  m = null;
                });
                self.displayMarkers = [];
              }
            }
          }
        );
      });
    });
  }

  //停车指引
  parkingDirections() {
    let line_image = this._layer.addFlowLine({
      type: "image",
      color: '#00efdb',
      speed: 10,
      opacity: 1,
      width: 3,
      image: "./assets/images/arrow.png",
      textureFactor: 5,
      towards: "ground",
      data: { coordinate: geoFencingCoordinates[3] }
    });
    this.polygonData.push(line_image)
  }

  // 清除室外停车内容
  clearOutdoorParking() {
    let modelIds = ["uniqueId", "uniqueId2"];

    if (this._map) {
      modelIds.forEach((modelId) => {
        if (this._map.getLayer(modelId)) {
          this._map.removeLayer(modelId);
        }
      });
    }
  }

  // 进停车场道闸动画
  addEnterParkingLotAnimation() {
    let model = this._group.children[2]
    let animations = model.animations
    if (animations && animations.length) {
      let clock = new window.THREE.Clock()
      let mixer = new window.THREE.AnimationMixer(model)
      for (let i = 0; i < animations.length; i++) {
        const animation = animations[i]
        mixer.clipAction(animation).setLoop(window.THREE.LoopOnce)
        mixer.clipAction(animation).play()
      }

      const animate = function () {
        if (!mixer) {
          return
        }
        requestAnimationFrame(animate)
        mixer.update(clock.getDelta())
      }
      animate()
    }
  }

  // 出停车场道闸动画
  addOutParkingLotAnimation() {
    let model = this._group.children[1]
    let animations = model.animations
    if (animations && animations.length) {
      let clock = new window.THREE.Clock()
      let mixer = new window.THREE.AnimationMixer(model)
      for (let i = 0; i < animations.length; i++) {
        const animation = animations[i]
        mixer.clipAction(animation).setLoop(window.THREE.LoopOnce)
        mixer.clipAction(animation).play()
      }

      const animate = function () {
        if (!mixer) {
          return
        }
        requestAnimationFrame(animate)
        mixer.update(clock.getDelta())
      }
      animate()
    }
  }

  // 停车场总览
  overView(rotating) {
    let self = this;
    this.shouldRotate = rotating;

    let locations = [
      {
        center: [120.7300470218388, 31.286451730993853],
        zoom: 15.57430537493843,
        bearing: -133.07271910936976,
        pitch: 35.50000000000001,
        speed: 0.2,
        curve: 3,
      },
    ];
    this.changeViewers(locations);

    setTimeout(() => {
      rotateCamera(0);
      function rotateCamera(timestamp) {
        if (self.shouldRotate) {
          map.setBearing((timestamp / 360) % 360);
          requestAnimationFrame(rotateCamera);
        }
      }
    }, 2000);
  }
  
  // 停止旋转
  stopRotation() {
    this.shouldRotate = false;
  }

  // 清除
  removeSecurityWarning() {
    if (this.polygonData.length > 0) {
      for (let i = 0; i < this.polygonData.length; i++) {
        this._layer.removeModel(this.polygonData[i]);
      }
    }
  }
  
  //移除标签
  removeMarker() {
    for (let i = 0; i < this.markerData.length; i++) {
      this.markerData[i].remove();
    }
    this.markerData = [];
  }

  removeDisplay() {
    if (this.displayMarkers.length > 0) {
      this.displayMarkers.forEach(e => {
        e.remove();
      })
      this.displayMarkers = [];
    }
  }

  createDom(imageUrl) {
    const container = document.createElement('div');
    container.style.width = '200px';
    container.style.height = '200px';
    const element = document.createElement('div');
    element.style.width = '100%';
    element.style.height = '100%';
    element.style.backgroundImage = 'url(' + imageUrl + ')';
    element.style.backgroundRepeat = 'no-repeat';
    element.style.backgroundSize = '100% 100%';
    element.style.margin = '0px';
    element.style.backgroundPosition = 'center 0';
    element.style.zIndex = -999;
    container.appendChild(element);
    return container;
  }

  /**
   *
   * @param {*} text
   * @returns
   */
  createInfoDom(text) {
    let dom = document.createElement('div');
    dom.innerHTML = '';
    dom.className = 'videoDom';
    let infoDom = document.createElement('div');
    infoDom.className = 'infoDom';
    let infoText = document.createElement('div');
    infoText.fontSize = '10px';
    infoText.innerText = text;
    let closeIcon = document.createElement('div');
    closeIcon.className = 'closeVideo';
    infoDom.appendChild(infoText);
    infoDom.appendChild(closeIcon);
    dom.appendChild(infoDom);
    return dom;
  }

  /**
   *
   * @param {*} location
   */
  fly(location) {
    this._map.flyTo({
      ...location,
    });
  }

  createDeviceDom(
    id,
    imageUrl = './assets/images/device.png',
    w = '50px',
    h = '70px',
    name
  ) {
    let container = document.createElement('div');
    container.setAttribute('id', id);
    container.className = name || 'markerDevice';
    container.style.width = w;
    container.style.height = h;
    container.style.backgroundImage = 'url(' + imageUrl + ')';
    container.style.backgroundRepeat = 'no-repeat';
    container.style.backgroundSize = '100% 100%';
    container.style.margin = '0px';
    container.style.backgroundPosition = 'center 0';
    return container;
  }

  // 改变相机视角
  changeViewers(locations) {
    let count = 0;
    this.changeViewer(locations[count]);
    let that = this;
    let moveFunc = function () {
      if (count === locations.length - 1) {
        that._map.off('moveend', moveFunc);
        return;
      }
      that.changeViewer(locations[count++]);
    };
    if (count < locations.length - 1) {
      that._map.on('moveend', moveFunc);
    }
  }

  // 改变相机视角
  changeViewer(location) {
    this._map.flyTo({
      ...location,
    });
  }
}

export default MapApi;
