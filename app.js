import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const SCALE = 0.05;

const defaults = {
  wristCirc: 220,
  metacarpalHeight: 28,
  metacarpalWidth: 100,
  thumbWidth: 90,
  thumbHeight: 72,
  wristHeight: 52,
  wristWidth: 65,
  foreWristLength: 100,
  wristMetaLength: 80,
  thick: 3,
  metaToThumbLength: 34,
  velcroThickness: 4,
  support: "balanced",
  vents: 3,
  thumbRelief: true,
  hand: "left",
  camera: "iso"
};

const state = { ...defaults };

const inputs = {
  wristCirc: document.querySelector("#wristCirc"),
  metacarpalHeight: document.querySelector("#metacarpalHeight"),
  metacarpalWidth: document.querySelector("#metacarpalWidth"),
  thumbWidth: document.querySelector("#thumbWidth"),
  thumbHeight: document.querySelector("#thumbHeight"),
  wristHeight: document.querySelector("#wristHeight"),
  wristWidth: document.querySelector("#wristWidth"),
  foreWristLength: document.querySelector("#foreWristLength"),
  wristMetaLength: document.querySelector("#wristMetaLength"),
  thick: document.querySelector("#thick"),
  metaToThumbLength: document.querySelector("#metaToThumbLength"),
  velcroThickness: document.querySelector("#velcroThickness"),
  support: null,
  vents: null,
  thumbRelief: null
};

const output = {
  printTime: document.querySelector("#printTime"),
  printVolume: document.querySelector("#printVolume"),
  filamentUse: document.querySelector("#filamentUse"),
  ventLabel: null,
  shellLength: document.querySelector("#shellLength"),
  wristOpening: document.querySelector("#wristOpening"),
  palmOpening: document.querySelector("#palmOpening"),
  thickness: document.querySelector("#thickness"),
  straps: document.querySelector("#straps"),
  notes: document.querySelector("#notes"),
  viewport: document.querySelector("#braceViewport"),
  exportStl: document.querySelector("#exportStl")
};

const slicer = {
  layerHeight: 0.2,
  lineWidth: 0.45,
  printSpeed: 45,
  travelOverhead: 1.35,
  layerChangeSeconds: 2.2,
  filamentDensity: 1.24
};

const supportProfiles = {
  flex: { strapBias: 0, note: "Flexible support keeps the walls light and uses larger strap spacing." },
  balanced: { strapBias: 1, note: "Balanced support uses the CAD wall thickness with reinforced Velcro slots." },
  rigid: { strapBias: 1, note: "Rigid support keeps the same sleeve shape and adds tighter strap spacing." }
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8faf9);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 160);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
output.viewport.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 16;
controls.maxDistance = 52;

const modelGroup = new THREE.Group();
scene.add(modelGroup);

scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa9a6, 2.1));

const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
keyLight.position.set(8, -12, 18);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xd9f0ec, 1.1);
fillLight.position.set(-11, 7, 12);
scene.add(fillLight);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(44, 44),
  new THREE.MeshStandardMaterial({ color: 0xeef3f2, roughness: 0.9 })
);
ground.position.z = -2.35;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(44, 44, 0xcfd9d7, 0xdfe7e5);
grid.rotation.x = Math.PI / 2;
grid.position.z = -2.32;
scene.add(grid);

const materials = {
  shell: new THREE.MeshPhysicalMaterial({
    color: 0x0f7f72,
    roughness: 0.48,
    metalness: 0.02,
    clearcoat: 0.28,
    side: THREE.DoubleSide
  }),
  rim: new THREE.MeshStandardMaterial({ color: 0x08584f, roughness: 0.55 }),
  strap: new THREE.MeshStandardMaterial({ color: 0x384f7c, roughness: 0.72 }),
  buckle: new THREE.MeshStandardMaterial({ color: 0xf8faf9, roughness: 0.45, metalness: 0.04 }),
  skin: new THREE.MeshStandardMaterial({ color: 0xf0c5a5, roughness: 0.72, transparent: true, opacity: 0.35 }),
  marker: new THREE.MeshStandardMaterial({ color: 0xb64f2d, roughness: 0.55 })
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function angleDistance(a, b) {
  const tau = Math.PI * 2;
  return Math.abs((((a - b + Math.PI) % tau) + tau) % tau - Math.PI);
}

function readState() {
  state.wristCirc = clamp(Number(inputs.wristCirc.value) || defaults.wristCirc, 130, 260);
  state.metacarpalHeight = clamp(Number(inputs.metacarpalHeight.value) || defaults.metacarpalHeight, 18, 50);
  state.metacarpalWidth = clamp(Number(inputs.metacarpalWidth.value) || defaults.metacarpalWidth, 65, 120);
  state.thumbWidth = clamp(Number(inputs.thumbWidth.value) || defaults.thumbWidth, 20, 100);
  state.thumbHeight = clamp(Number(inputs.thumbHeight.value) || defaults.thumbHeight, 35, 100);
  state.wristHeight = clamp(Number(inputs.wristHeight.value) || defaults.wristHeight, 30, 75);
  state.wristWidth = clamp(Number(inputs.wristWidth.value) || defaults.wristWidth, 40, 90);
  state.foreWristLength = clamp(Number(inputs.foreWristLength.value) || defaults.foreWristLength, 70, 160);
  state.wristMetaLength = clamp(Number(inputs.wristMetaLength.value) || defaults.wristMetaLength, 55, 110);
  state.thick = clamp(Number(inputs.thick.value) || defaults.thick, 1.5, 6);
  state.metaToThumbLength = clamp(Number(inputs.metaToThumbLength.value) || defaults.metaToThumbLength, 20, 65);
  state.velcroThickness = clamp(Number(inputs.velcroThickness.value) || defaults.velcroThickness, 2, 8);
  state.support = defaults.support;
  state.vents = defaults.vents;
  state.thumbRelief = true;
}

function spec() {
  const profile = supportProfiles[state.support];
  const shellLength = state.foreWristLength + state.wristMetaLength;
  const topOpening = Math.round(Math.PI * Math.sqrt((state.metacarpalWidth ** 2 + state.metacarpalHeight ** 2) / 2));
  const area = Math.round((shellLength * (state.wristCirc + topOpening) * 0.5 * 0.82) / 100);
  const straps = clamp(3 + profile.strapBias, 3, 4);
  const printTime = ((area * state.thick) / 78).toFixed(1);
  const fitSize = state.wristCirc < 180 ? "Small" : state.wristCirc > 250 ? "Large" : "Medium";

  return { profile, shellLength, topOpening, area, straps, printTime, fitSize };
}

function clearModel() {
  while (modelGroup.children.length) {
    const child = modelGroup.children.pop();
    child.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
    });
  }
}

function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function sectionAt(yMm, insetMm = 0) {
  const wristT = smoothstep(-state.foreWristLength, 0, yMm);
  const metaT = smoothstep(0, state.wristMetaLength, yMm);
  const forearmRatio = clamp(state.wristHeight / Math.max(state.wristWidth, 1), 0.55, 1.1);
  const forearmWidth = state.wristCirc / (2.2 + 1.65 * forearmRatio);
  const forearmHeight = forearmWidth * forearmRatio;
  const bottomWidth = Math.max(42, forearmWidth);
  const bottomHeight = Math.max(32, forearmHeight);
  const wristWidth = state.wristWidth;
  const wristHeight = state.wristHeight;
  const metaWidth = state.metacarpalWidth;
  const metaHeight = state.metacarpalHeight;

  const lowWidth = bottomWidth + (wristWidth - bottomWidth) * wristT;
  const lowHeight = bottomHeight + (wristHeight - bottomHeight) * wristT;
  const width = yMm < 0 ? lowWidth : wristWidth + (metaWidth - wristWidth) * metaT;
  const height = yMm < 0 ? lowHeight : wristHeight + (metaHeight - wristHeight) * metaT;

  return {
    rx: Math.max(4, width / 2 - insetMm) * SCALE,
    rz: Math.max(4, height / 2 - insetMm) * SCALE
  };
}

function pointOnBrace(theta, yMm, insetMm = 0) {
  const section = sectionAt(yMm, insetMm);
  return new THREE.Vector3(
    Math.sin(theta) * section.rx,
    yMm * SCALE,
    Math.cos(theta) * section.rz
  );
}

function thumbReliefProfile() {
  const splitHalf = splitThetaHalf();
  const side = state.hand === "left" ? -1 : 1;
  const sideSplit = side * (Math.PI / 2 - splitHalf);
  const thumbY = state.wristMetaLength - state.metaToThumbLength;
  const halfHeight = state.thumbHeight * 0.5;
  const topClearance = Math.max(24, state.velcroThickness * 2 + 16);
  const topY = clamp(thumbY + halfHeight, -state.foreWristLength + 16, state.wristMetaLength - topClearance);
  const bottomY = clamp(thumbY - halfHeight, -state.foreWristLength + 14, state.wristMetaLength - 24);
  const palmarStart = -side * clamp((state.thumbWidth / state.metacarpalWidth - 0.48) * 0.46, 0.08, 0.24);

  return { side, sideSplit, topY, bottomY, palmarStart };
}

function isThumbReliefCutout(theta, yMm) {
  if (!state.thumbRelief) {
    return false;
  }

  const { sideSplit, topY, bottomY, palmarStart } = thumbReliefProfile();
  const t = clamp((topY - yMm) / Math.max(topY - bottomY, 1), 0, 1);
  const curveEase = smoothstep(0.0, 0.86, t);
  const curveTheta = sideSplit + (palmarStart - sideSplit) * curveEase;
  const onThumbSide = theta >= Math.min(sideSplit, curveTheta) && theta <= Math.max(sideSplit, curveTheta);
  const inVerticalSpan = yMm <= topY && yMm >= bottomY;

  return inVerticalSpan && onThumbSide;
}

function isStrapSlot(theta, yMm) {
  const { side, topY } = thumbReliefProfile();
  const yMax = state.wristMetaLength;
  const topYRegular = state.wristMetaLength - 18;
  const middleY = -state.foreWristLength * 0.38;
  const lowerY = -state.foreWristLength * 0.78;
  const thumbTheta = side * 0.72;
  const nonThumbTheta = -side * 0.72;
  const palmarThetas = [-0.72, 0.72];
  const nonPalmarThetas = [-2.48, 2.48];
  const allSlotThetas = [...palmarThetas, ...nonPalmarThetas];
  const slitThetaHalf = 0.055 + state.velcroThickness * 0.004;
  const regularHalfHeight = 13 + state.velcroThickness * 0.8;
  const regularTopHalfHeight = regularHalfHeight * 0.72;
  const thumbTopClearance = 5;
  const thumbTopAvailable = yMax - topY - thumbTopClearance;
  const thumbTopHalfHeight = clamp((thumbTopAvailable - 4) * 0.5, 5, regularTopHalfHeight);
  const thumbSideTopY = topY + thumbTopClearance + thumbTopHalfHeight;

  const inSlot = (slotTheta, slotY, halfHeight) =>
    angleDistance(theta, slotTheta) < slitThetaHalf &&
    Math.abs(yMm - slotY) < halfHeight;

  if (thumbTopAvailable >= 14 && inSlot(thumbTheta, thumbSideTopY, thumbTopHalfHeight)) {
    return true;
  }

  if (inSlot(nonThumbTheta, topYRegular, regularTopHalfHeight)) {
    return true;
  }

  for (const slotTheta of nonPalmarThetas) {
    if (inSlot(slotTheta, topYRegular, regularTopHalfHeight)) {
      return true;
    }
  }

  for (const slotTheta of allSlotThetas) {
    for (const slotY of [middleY, lowerY]) {
      if (inSlot(slotTheta, slotY, regularHalfHeight)) return true;
    }
  }

  return false;
}

function isCutout(theta, yMm) {
  if (isStrapSlot(theta, yMm)) {
    return true;
  }

  if (isThumbReliefCutout(theta, yMm)) {
    return true;
  }

  return false;
}

function isThumbSplitClearance(theta, yMm) {
  if (!state.thumbRelief) {
    return false;
  }

  const { side, sideSplit, topY, bottomY } = thumbReliefProfile();
  const thetaTolerance = 0.055;
  return Math.abs(theta - sideSplit) < thetaTolerance &&
    yMm <= topY + state.thick * 1.5 &&
    yMm >= bottomY - state.thick * 1.5;
}

function splitThetaHalf() {
  const splitGapMm = clamp(state.metacarpalWidth * 0.18, 16, 28);
  const splitRadius = (sectionAt((state.wristMetaLength - state.foreWristLength) / 2, 0).rx + sectionAt((state.wristMetaLength - state.foreWristLength) / 2, 0).rz) / (2 * SCALE);
  return clamp(splitGapMm / Math.max(splitRadius, 1), 0.18, 0.34);
}

function buildBraceMesh(thetaMin, thetaMax) {
  const thetaSegments = 120;
  const ySegments = 220;
  const yMin = -state.foreWristLength;
  const yMax = state.wristMetaLength;
  const positions = [];
  const normals = [];
  const indices = [];
  const outerIndex = [];
  const innerIndex = [];

  for (let iy = 0; iy <= ySegments; iy += 1) {
    const yMm = yMin + (iy / ySegments) * (yMax - yMin);
    outerIndex[iy] = [];
    innerIndex[iy] = [];

    for (let it = 0; it <= thetaSegments; it += 1) {
      const theta = thetaMin + (it / thetaSegments) * (thetaMax - thetaMin);
      const outer = pointOnBrace(theta, yMm, 0);
      const inner = pointOnBrace(theta, yMm, state.thick);
      const normal = new THREE.Vector3(Math.sin(theta), 0, Math.cos(theta)).normalize();

      outerIndex[iy][it] = positions.length / 3;
      positions.push(outer.x, outer.y, outer.z);
      normals.push(normal.x, normal.y, normal.z);

      innerIndex[iy][it] = positions.length / 3;
      positions.push(inner.x, inner.y, inner.z);
      normals.push(-normal.x, -normal.y, -normal.z);
    }
  }

  for (let iy = 0; iy < ySegments; iy += 1) {
    const yA = yMin + (iy / ySegments) * (yMax - yMin);
    const yB = yMin + ((iy + 1) / ySegments) * (yMax - yMin);
    const yMid = (yA + yB) / 2;

    for (let it = 0; it < thetaSegments; it += 1) {
      const thetaA = thetaMin + (it / thetaSegments) * (thetaMax - thetaMin);
      const thetaB = thetaMin + ((it + 1) / thetaSegments) * (thetaMax - thetaMin);
      const thetaMid = (thetaA + thetaB) / 2;

      if (!isCutout(thetaMid, yMid)) {
        const a = outerIndex[iy][it];
        const b = outerIndex[iy][it + 1];
        const c = outerIndex[iy + 1][it + 1];
        const d = outerIndex[iy + 1][it];
        const ai = innerIndex[iy][it];
        const bi = innerIndex[iy][it + 1];
        const ci = innerIndex[iy + 1][it + 1];
        const di = innerIndex[iy + 1][it];
        indices.push(a, d, b, b, d, c);
        indices.push(ai, bi, di, bi, ci, di);
      }

      const leftOpen = isCutout(thetaMid, yMid) && !isCutout(thetaA - 0.03, yMid);
      const rightOpen = isCutout(thetaMid, yMid) && !isCutout(thetaB + 0.03, yMid);
      if (leftOpen || rightOpen) {
        const itEdge = leftOpen ? it : it + 1;
        const thetaEdge = thetaMin + (itEdge / thetaSegments) * (thetaMax - thetaMin);
        if (isThumbReliefCutout(thetaMid, yMid) && angleDistance(thetaEdge, thumbReliefProfile().sideSplit) < 0.08) {
          continue;
        }
        const o1 = outerIndex[iy][itEdge];
        const o2 = outerIndex[iy + 1][itEdge];
        const i1 = innerIndex[iy][itEdge];
        const i2 = innerIndex[iy + 1][itEdge];
        indices.push(o1, i1, o2, i1, i2, o2);
      }

      if (isCutout(thetaMid, yMid)) {
        const bottomOpen = !isCutout(thetaMid, yA - 0.03);
        const topOpen = !isCutout(thetaMid, yB + 0.03);
        const addCutoutYCap = (iyEdge) => {
          const o1 = outerIndex[iyEdge][it];
          const o2 = outerIndex[iyEdge][it + 1];
          const i1 = innerIndex[iyEdge][it];
          const i2 = innerIndex[iyEdge][it + 1];
          indices.push(o1, o2, i1, o2, i2, i1);
        };

        if (bottomOpen) {
          addCutoutYCap(iy);
        }
        if (topOpen) {
          addCutoutYCap(iy + 1);
        }
      }
    }
  }

  for (let it = 0; it < thetaSegments; it += 1) {
    const addCap = (iy) => {
      const a = outerIndex[iy][it];
      const b = outerIndex[iy][it + 1];
      const c = innerIndex[iy][it + 1];
      const d = innerIndex[iy][it];
      indices.push(a, b, d, b, c, d);
    };
    addCap(0);
    addCap(ySegments);
  }

  for (let iy = 0; iy < ySegments; iy += 1) {
    const yA = yMin + (iy / ySegments) * (yMax - yMin);
    const yB = yMin + ((iy + 1) / ySegments) * (yMax - yMin);
    const yMid = (yA + yB) / 2;
    const addSeam = (it) => {
      const theta = thetaMin + (it / thetaSegments) * (thetaMax - thetaMin);
      if (isCutout(theta, yMid)) {
        return;
      }
      if (isThumbSplitClearance(theta, yMid)) {
        return;
      }
      const a = outerIndex[iy][it];
      const b = outerIndex[iy + 1][it];
      const c = innerIndex[iy + 1][it];
      const d = innerIndex[iy][it];
      indices.push(a, b, d, b, c, d);
    };
    addSeam(0);
    addSeam(thetaSegments);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function addCapsule(group, radius, length, position, rotation, material) {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 16, 32), material);
  mesh.position.set(position.x, position.y, position.z);
  mesh.rotation.set(rotation.x, rotation.y, rotation.z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function addBox(group, width, height, depth, position, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(position.x, position.y, position.z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function signedTriangleVolume(a, b, c) {
  return a.dot(b.cross(c)) / 6;
}

function meshVolumeMm3(mesh) {
  const geometry = mesh.geometry;
  const position = geometry.attributes.position;
  const index = geometry.index;
  const matrix = mesh.matrixWorld;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  let volume = 0;

  const readVertex = (vertexIndex, target) => {
    target.fromBufferAttribute(position, vertexIndex).applyMatrix4(matrix);
  };

  if (index) {
    for (let i = 0; i < index.count; i += 3) {
      readVertex(index.getX(i), a);
      readVertex(index.getX(i + 1), b);
      readVertex(index.getX(i + 2), c);
      volume += signedTriangleVolume(a, b, c);
    }
  } else {
    for (let i = 0; i < position.count; i += 3) {
      readVertex(i, a);
      readVertex(i + 1, b);
      readVertex(i + 2, c);
      volume += signedTriangleVolume(a, b, c);
    }
  }

  return Math.abs(volume) / (SCALE ** 3);
}

function estimatePrint() {
  modelGroup.updateMatrixWorld(true);
  let volumeMm3 = 0;

  modelGroup.traverse((object) => {
    if (object.isMesh && object.material === materials.shell) {
      volumeMm3 += meshVolumeMm3(object);
    }
  });

  const shellLength = state.foreWristLength + state.wristMetaLength;
  const layerCount = Math.ceil(shellLength / slicer.layerHeight);
  const extrusionLength = volumeMm3 / (slicer.lineWidth * slicer.layerHeight);
  const extrusionSeconds = extrusionLength / slicer.printSpeed;
  const layerSeconds = layerCount * slicer.layerChangeSeconds;
  const totalSeconds = (extrusionSeconds + layerSeconds) * slicer.travelOverhead;
  const grams = (volumeMm3 / 1000) * slicer.filamentDensity;

  return {
    volumeMm3,
    grams,
    hours: totalSeconds / 3600
  };
}

function addRims(values) {
  const splitHalf = splitThetaHalf();
  const rimRanges = [
    [-Math.PI / 2 + splitHalf, Math.PI / 2 - splitHalf],
    [Math.PI / 2 + splitHalf, Math.PI * 1.5 - splitHalf]
  ];

  const addTube = (points, radius = 0.09) => {
    const curve = new THREE.CatmullRomCurve3(points);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(16, points.length * 2), radius, 10, false), materials.rim);
    tube.castShadow = true;
    tube.receiveShadow = true;
    modelGroup.add(tube);
  };

  rimRanges.forEach(([start, end]) => {
    const topCurve = [];
    const bottomCurve = [];
    for (let i = 0; i <= 50; i += 1) {
      const theta = start + (i / 50) * (end - start);
      topCurve.push(pointOnBrace(theta, state.wristMetaLength, -0.8));
      bottomCurve.push(pointOnBrace(theta, -state.foreWristLength, -0.8));
    }
    addTube(topCurve);
    addTube(bottomCurve);
  });

  const yStart = -state.foreWristLength + 10;
  const yEnd = state.wristMetaLength - 10;
  [-Math.PI / 2 - splitHalf, -Math.PI / 2 + splitHalf, Math.PI / 2 - splitHalf, Math.PI / 2 + splitHalf].forEach((theta) => {
    const { side, sideSplit, topY, bottomY } = thumbReliefProfile();
    const isThumbSideSplit = state.thumbRelief && side * theta > 0 && Math.abs(theta - sideSplit) < 0.02;
    const points = [];
    const flushSegment = () => {
      if (points.length > 1) {
        addTube([...points], 0.055);
      }
      points.length = 0;
    };

    for (let i = 0; i <= 80; i += 1) {
      const y = yStart + (i / 80) * (yEnd - yStart);
      if (isThumbSideSplit && y >= bottomY) {
        flushSegment();
        continue;
      }
      points.push(pointOnBrace(theta, y, -0.7));
    }
    flushSegment();
  });

  if (state.thumbRelief) {
    const { sideSplit, topY, bottomY, palmarStart } = thumbReliefProfile();
    const cutoutEdge = [];
    const lowerEdge = [];

    for (let i = 0; i <= 48; i += 1) {
      const y = topY + ((bottomY - topY) * i) / 48;
      const t = clamp((topY - y) / Math.max(topY - bottomY, 1), 0, 1);
      const curveEase = smoothstep(0.0, 0.86, t);
      const theta = sideSplit + (palmarStart - sideSplit) * curveEase;
      cutoutEdge.push(pointOnBrace(theta, y, -0.95));
    }

    for (let i = 0; i <= 28; i += 1) {
      const t = i / 28;
      const theta = palmarStart + (sideSplit - palmarStart) * t;
      lowerEdge.push(pointOnBrace(theta, bottomY, -0.95));
    }

    addTube(cutoutEdge, 0.065);
    addTube(lowerEdge, 0.055);
  }

}

function addHandGhost() {
  const wristY = -state.foreWristLength * SCALE * 0.25;
  const palmY = state.wristMetaLength * SCALE * 0.48;
  addCapsule(modelGroup, state.wristWidth * SCALE * 0.22, state.foreWristLength * SCALE * 1.0, { x: 0, y: wristY, z: -0.25 }, { x: 0, y: 0, z: 0 }, materials.skin);
  addCapsule(modelGroup, state.metacarpalWidth * SCALE * 0.22, 1.0, { x: 0, y: palmY, z: -0.18 }, { x: Math.PI / 2, y: 0, z: 0 }, materials.skin);
}

function buildModel(values) {
  clearModel();
  const splitHalf = splitThetaHalf();
  const panels = [
    [-Math.PI / 2 + splitHalf, Math.PI / 2 - splitHalf],
    [Math.PI / 2 + splitHalf, Math.PI * 1.5 - splitHalf]
  ];

  panels.forEach(([thetaMin, thetaMax]) => {
    const shell = new THREE.Mesh(buildBraceMesh(thetaMin, thetaMax), materials.shell);
    shell.castShadow = true;
    shell.receiveShadow = true;
    modelGroup.add(shell);
  });

}

function formatHours(hours) {
  const totalMinutes = Math.max(1, Math.round(hours * 60));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h} hr ${m.toString().padStart(2, "0")} min` : `${m} min`;
}

async function exportStl() {
  const exportGroup = new THREE.Group();

  modelGroup.updateMatrixWorld(true);
  modelGroup.traverse((object) => {
    if (object.isMesh && object.material === materials.shell) {
      const mesh = new THREE.Mesh(object.geometry.clone(), object.material);
      mesh.matrix.copy(object.matrixWorld);
      mesh.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
      mesh.position.multiplyScalar(1 / SCALE);
      mesh.scale.multiplyScalar(1 / SCALE);
      exportGroup.add(mesh);
    }
  });

  exportGroup.updateMatrixWorld(true);
  const { STLExporter } = await import("three/addons/exporters/STLExporter.js");
  const exporter = new STLExporter();
  const stl = exporter.parse(exportGroup, { binary: false });
  const blob = new Blob([stl], { type: "model/stl" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `brace-${state.hand}-thumb-${Math.round(state.thumbWidth)}mm.stl`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderSpecs(values) {
  output.printTime.textContent = `${values.printTime} hr`;
  if (output.printVolume) {
    output.printVolume.textContent = "--";
  }
  if (output.filamentUse) {
    output.filamentUse.textContent = "--";
  }
  if (output.ventLabel) {
    output.ventLabel.textContent = state.vents;
  }
  output.shellLength.textContent = `${values.shellLength.toFixed(0)} mm`;
  output.wristOpening.textContent = `${state.wristCirc.toFixed(0)} mm`;
  output.palmOpening.textContent = `${values.topOpening.toFixed(0)} mm`;
  output.thickness.textContent = `${state.thick.toFixed(1)} mm`;
  output.straps.textContent = values.straps;
  output.notes.textContent = values.profile.note;
}

function setCamera(mode = state.camera) {
  state.camera = mode;
  const targetY = (state.wristMetaLength - state.foreWristLength) * SCALE * 0.5;
  if (mode === "top") {
    camera.position.set(0, targetY, 23);
  } else if (mode === "side") {
    camera.position.set(15, -12, 8);
  } else {
    camera.position.set(10, -17, 12);
  }
  controls.target.set(0, targetY, 0);
  controls.update();
}

function resizeRenderer() {
  const rect = output.viewport.getBoundingClientRect();
  renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)), false);
  camera.aspect = rect.width / Math.max(1, rect.height);
  camera.updateProjectionMatrix();
}

function render() {
  readState();
  const values = spec();
  buildModel(values);
  renderSpecs(values);
}

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

Object.values(inputs).filter(Boolean).forEach((input) => {
  input.addEventListener("input", render);
  input.addEventListener("change", render);
});

document.querySelectorAll("[data-hand]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-hand]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.hand = button.dataset.hand;
    render();
  });
});

document.querySelectorAll("[data-camera]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-camera]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    setCamera(button.dataset.camera);
  });
});

const resetButton = document.querySelector("#reset");
if (resetButton) {
  resetButton.addEventListener("click", () => {
  Object.assign(state, defaults);
  Object.entries(inputs).filter(([, input]) => Boolean(input)).forEach(([key, input]) => {
    if (input.type === "checkbox") {
      input.checked = defaults[key];
    } else {
      input.value = defaults[key];
    }
  });
  document.querySelectorAll("[data-hand]").forEach((item) => item.classList.toggle("active", item.dataset.hand === defaults.hand));
  document.querySelectorAll("[data-camera]").forEach((item) => item.classList.toggle("active", item.dataset.camera === defaults.camera));
  render();
  setCamera(defaults.camera);
  });
}

if (output.exportStl) {
  output.exportStl.addEventListener("click", exportStl);
}

window.addEventListener("resize", resizeRenderer);

resizeRenderer();
try {
  render();
} catch (error) {
  console.error("Initial render failed", error);
}
setCamera(defaults.camera);
animate();
