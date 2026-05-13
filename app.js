const defaults = {
  wrist: 17.2,
  palm: 8.6,
  length: 18.4,
  thumb: 5.2,
  support: "balanced",
  vents: 3,
  thumbRelief: true,
  hand: "left",
  view: "top"
};

const state = { ...defaults };

const inputs = {
  wrist: document.querySelector("#wrist"),
  palm: document.querySelector("#palm"),
  length: document.querySelector("#length"),
  thumb: document.querySelector("#thumb"),
  support: document.querySelector("#support"),
  vents: document.querySelector("#vents"),
  thumbRelief: document.querySelector("#thumbRelief")
};

const output = {
  fitSize: document.querySelector("#fitSize"),
  materialUse: document.querySelector("#materialUse"),
  printTime: document.querySelector("#printTime"),
  ventLabel: document.querySelector("#ventLabel"),
  shellLength: document.querySelector("#shellLength"),
  wristOpening: document.querySelector("#wristOpening"),
  palmOpening: document.querySelector("#palmOpening"),
  thickness: document.querySelector("#thickness"),
  straps: document.querySelector("#straps"),
  notes: document.querySelector("#notes"),
  modelLayer: document.querySelector("#modelLayer")
};

const supportProfiles = {
  flex: { thickness: 2.2, extension: 1.8, strapBias: 0, note: "Flexible support keeps the shell thin and increases vent spacing for everyday mobility." },
  balanced: { thickness: 3.0, extension: 2.8, strapBias: 1, note: "Balanced support uses a reinforced wrist channel and moderate vent spacing." },
  rigid: { thickness: 4.0, extension: 4.2, strapBias: 1, note: "Rigid support extends farther down the wrist and adds tighter strap spacing for immobilization." }
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function readState() {
  state.wrist = clamp(Number(inputs.wrist.value) || defaults.wrist, 10, 28);
  state.palm = clamp(Number(inputs.palm.value) || defaults.palm, 5, 13);
  state.length = clamp(Number(inputs.length.value) || defaults.length, 12, 25);
  state.thumb = clamp(Number(inputs.thumb.value) || defaults.thumb, 2, 9);
  state.support = inputs.support.value;
  state.vents = Number(inputs.vents.value);
  state.thumbRelief = inputs.thumbRelief.checked;
}

function spec() {
  const profile = supportProfiles[state.support];
  const shellLength = state.length + profile.extension;
  const wristOpening = state.wrist + 0.8;
  const palmOpening = state.palm + 0.9;
  const area = Math.round((shellLength * (state.palm + state.wrist / 3)) * (0.78 + profile.thickness / 14));
  const straps = clamp(Math.round(shellLength / 7) + profile.strapBias, 2, 4);
  const printTime = (area * profile.thickness / 125).toFixed(1);
  const fitSize = state.palm < 7.4 ? "Small" : state.palm > 9.7 || state.wrist > 20.5 ? "Large" : "Medium";

  return { profile, shellLength, wristOpening, palmOpening, area, straps, printTime, fitSize };
}

function pathFromPoints(points) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point[0].toFixed(1)} ${point[1].toFixed(1)}`).join(" ") + " Z";
}

function renderTopView(values) {
  const centerX = 380;
  const topY = 78;
  const scale = 16;
  const length = values.shellLength * scale;
  const palmHalf = state.palm * scale * 0.56;
  const wristHalf = state.wrist * scale * 0.16;
  const cuffHalf = wristHalf + values.profile.thickness * 4.5;
  const bottomY = topY + length;
  const thumbY = topY + clamp(state.thumb * scale, 86, length - 105);
  const side = state.hand === "left" ? -1 : 1;
  const thumbX = centerX + side * (palmHalf + 38);
  const edgePad = 18 + values.profile.thickness * 3;
  const leftPalm = centerX - palmHalf - edgePad;
  const rightPalm = centerX + palmHalf + edgePad;
  const leftCuff = centerX - cuffHalf - 16;
  const rightCuff = centerX + cuffHalf + 16;
  const topShell = topY + 86;
  const shellBottom = bottomY - 14;
  const notchOuter = centerX + side * (palmHalf + 20);
  const notchInner = centerX + side * (palmHalf - 20);
  const thumbRelief = state.thumbRelief
    ? `${side < 0
        ? `C ${leftPalm - 10} ${thumbY - 36}, ${notchOuter} ${thumbY - 26}, ${notchOuter} ${thumbY + 6}
           C ${notchOuter} ${thumbY + 48}, ${notchInner} ${thumbY + 58}, ${leftPalm + 8} ${thumbY + 82}`
        : `C ${rightPalm + 10} ${thumbY - 36}, ${notchOuter} ${thumbY - 26}, ${notchOuter} ${thumbY + 6}
           C ${notchOuter} ${thumbY + 48}, ${notchInner} ${thumbY + 58}, ${rightPalm - 8} ${thumbY + 82}`}`
    : "";

  const shellPath = side < 0
    ? `M ${centerX - palmHalf * 0.68} ${topShell}
       C ${leftPalm + 18} ${topShell + 22}, ${leftPalm - 4} ${thumbY - 70}, ${leftPalm} ${thumbY - 38}
       ${thumbRelief}
       C ${leftCuff - 16} ${bottomY - 52}, ${leftCuff} ${shellBottom}, ${centerX - wristHalf} ${shellBottom + 8}
       L ${centerX + wristHalf} ${shellBottom + 8}
       C ${rightCuff} ${shellBottom}, ${rightCuff + 16} ${bottomY - 54}, ${rightPalm - 5} ${topShell + 34}
       C ${rightPalm - 30} ${topShell + 12}, ${centerX + palmHalf * 0.55} ${topShell - 6}, ${centerX - palmHalf * 0.68} ${topShell} Z`
    : `M ${centerX + palmHalf * 0.68} ${topShell}
       C ${rightPalm - 18} ${topShell + 22}, ${rightPalm + 4} ${thumbY - 70}, ${rightPalm} ${thumbY - 38}
       ${thumbRelief}
       C ${rightCuff + 16} ${bottomY - 52}, ${rightCuff} ${shellBottom}, ${centerX + wristHalf} ${shellBottom + 8}
       L ${centerX - wristHalf} ${shellBottom + 8}
       C ${leftCuff} ${shellBottom}, ${leftCuff - 16} ${bottomY - 54}, ${leftPalm + 5} ${topShell + 34}
       C ${leftPalm + 30} ${topShell + 12}, ${centerX - palmHalf * 0.55} ${topShell - 6}, ${centerX + palmHalf * 0.68} ${topShell} Z`;

  const vents = Array.from({ length: state.vents }, (_, index) => {
    const y = topY + 185 + index * ((length - 265) / Math.max(state.vents - 1, 1));
    return `<ellipse cx="${centerX}" cy="${y}" rx="${16 + state.palm * 1.1}" ry="8" fill="#eef6f4" stroke="#83aaa5" stroke-width="3"/>`;
  }).join("");

  const straps = Array.from({ length: values.straps }, (_, index) => {
    const y = topY + 170 + index * ((length - 225) / Math.max(values.straps - 1, 1));
    const strapWidth = palmHalf * 1.7 - index * 8;
    return `<rect x="${centerX - strapWidth / 2}" y="${y}" width="${strapWidth}" height="20" rx="7" fill="#384f7c" opacity="0.88"/>
      <rect x="${centerX + strapWidth / 2 - 16}" y="${y - 6}" width="30" height="32" rx="6" fill="#f8faf9" stroke="#24395f" stroke-width="4"/>`;
  }).join("");

  const fingers = [-42, -14, 14, 42].map((offset, index) => {
    const width = index === 0 || index === 3 ? 23 : 26;
    const height = index === 1 || index === 2 ? 104 : 88;
    return `<rect x="${centerX + offset - width / 2}" y="${topY + 8}" width="${width}" height="${height}" rx="13" fill="#f0c5a5" opacity="0.58"/>`;
  }).join("");

  return `
    <g opacity="0.82">
      ${fingers}
      <ellipse cx="${centerX}" cy="${topY + 132}" rx="${palmHalf * 0.72}" ry="76" fill="#f0c5a5" opacity="0.58"/>
      <ellipse cx="${thumbX}" cy="${thumbY + 5}" rx="26" ry="58" transform="rotate(${side * -31} ${thumbX} ${thumbY + 5})" fill="#f0c5a5" opacity="0.56"/>
      <rect x="${centerX - wristHalf * 0.72}" y="${bottomY - 88}" width="${wristHalf * 1.44}" height="116" rx="28" fill="#f0c5a5" opacity="0.5"/>
    </g>
    <path d="${shellPath}" fill="url(#braceGradient)" fill-opacity="0.82" stroke="#0f3e3a" stroke-width="5"/>
    ${vents}
    ${straps}
    <line x1="${centerX - palmHalf}" y1="${topY + 128}" x2="${centerX + palmHalf}" y2="${topY + 128}" stroke="#b64f2d" stroke-width="4"/>
    <text x="${centerX}" y="${topY + 118}" text-anchor="middle" fill="#182322" font-size="18" font-weight="800">${state.palm.toFixed(1)} cm palm</text>
    <line x1="${rightPalm + 70}" y1="${topShell}" x2="${rightPalm + 70}" y2="${shellBottom}" stroke="#0e766d" stroke-width="4"/>
    <text x="${rightPalm + 90}" y="${topY + length / 2}" fill="#182322" font-size="18" font-weight="800">${values.shellLength.toFixed(1)} cm</text>
  `;
}

function renderSideView(values) {
  const shellWidth = 420;
  const shellHeight = 86 + values.profile.thickness * 8;
  const x = 170;
  const y = 245;
  const arc = 36 + state.palm * 2;
  const vents = Array.from({ length: state.vents }, (_, index) => {
    const cx = x + 110 + index * ((shellWidth - 220) / Math.max(state.vents - 1, 1));
    return `<circle cx="${cx}" cy="${y + shellHeight / 2}" r="10" fill="#eef6f4" stroke="#83aaa5" stroke-width="3"/>`;
  }).join("");

  return `
    <path d="M ${x} ${y + arc} C ${x + 82} ${y - 34}, ${x + shellWidth - 82} ${y - 34}, ${x + shellWidth} ${y + arc} L ${x + shellWidth - 32} ${y + shellHeight} C ${x + shellWidth - 130} ${y + shellHeight + 34}, ${x + 130} ${y + shellHeight + 34}, ${x + 32} ${y + shellHeight} Z" fill="url(#braceGradient)" stroke="#0f3e3a" stroke-width="5"/>
    ${vents}
    <path d="M ${x + 48} ${y + shellHeight - 4} C ${x + 145} ${y + shellHeight + 48}, ${x + 275} ${y + shellHeight + 48}, ${x + 372} ${y + shellHeight - 4}" fill="none" stroke="#384f7c" stroke-width="18" stroke-linecap="round"/>
    <line x1="${x + 40}" y1="${y - 42}" x2="${x + shellWidth - 40}" y2="${y - 42}" stroke="#b64f2d" stroke-width="4"/>
    <text x="${x + shellWidth / 2}" y="${y - 58}" text-anchor="middle" fill="#182322" font-size="18" font-weight="800">${values.profile.thickness.toFixed(1)} mm shell profile</text>
  `;
}

function render() {
  readState();
  const values = spec();
  output.fitSize.textContent = values.fitSize;
  output.materialUse.textContent = `${values.area} cm2`;
  output.printTime.textContent = `${values.printTime} hr`;
  output.ventLabel.textContent = state.vents;
  output.shellLength.textContent = `${values.shellLength.toFixed(1)} cm`;
  output.wristOpening.textContent = `${values.wristOpening.toFixed(1)} cm`;
  output.palmOpening.textContent = `${values.palmOpening.toFixed(1)} cm`;
  output.thickness.textContent = `${values.profile.thickness.toFixed(1)} mm`;
  output.straps.textContent = values.straps;
  output.notes.textContent = values.profile.note;
  output.modelLayer.innerHTML = state.view === "top" ? renderTopView(values) : renderSideView(values);
}

Object.values(inputs).forEach((input) => {
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

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-view]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.view = button.dataset.view;
    render();
  });
});

document.querySelector("#reset").addEventListener("click", () => {
  Object.assign(state, defaults);
  Object.entries(inputs).forEach(([key, input]) => {
    if (input.type === "checkbox") {
      input.checked = defaults[key];
    } else {
      input.value = defaults[key];
    }
  });
  document.querySelectorAll("[data-hand]").forEach((item) => item.classList.toggle("active", item.dataset.hand === defaults.hand));
  document.querySelectorAll("[data-view]").forEach((item) => item.classList.toggle("active", item.dataset.view === defaults.view));
  render();
});

render();
