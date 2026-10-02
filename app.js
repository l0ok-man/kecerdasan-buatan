/* ============================================
   FUZZY INFERENCE ENGINE — MAMDANI (Max-Min)
   Sistem Penilaian Risiko Peminjaman
   ============================================ */

// ──────────────────────────────────────────────
// 1. MEMBERSHIP FUNCTIONS
// ──────────────────────────────────────────────

/**
 * Trapezoid membership function.
 * Parameters [a, b, c, d]:
 *   a→b = rising slope, b→c = flat top (μ=1), c→d = falling slope
 */
function trapezoid(x, a, b, c, d) {
  if (x >= b && x <= c) return 1;
  if (x <= a || x >= d) return 0;
  if (x > a && x < b) return (x - a) / (b - a);
  if (x > c && x < d) return (d - x) / (d - c);
  return 0;
}

/**
 * Triangle membership function.
 * Parameters [a, b, c]:
 *   a→b = rising slope, b = peak (μ=1), b→c = falling slope
 */
function triangle(x, a, b, c) {
  if (x <= a || x >= c) return 0;
  if (x > a && x <= b) return (x - a) / (b - a);
  if (x > b && x < c) return (c - x) / (c - b);
  return 0;
}

// ──────────────────────────────────────────────
// 2. VARIABLE DEFINITIONS
// ──────────────────────────────────────────────

const VARS = {
  penghasilan: {
    min: 0, max: 10, unit: 'Juta',
    mfs: {
      rendah: (x) => trapezoid(x, 0, 0, 2, 5),
      sedang: (x) => triangle(x, 2, 5, 8),
      tinggi: (x) => trapezoid(x, 5, 8, 10, 10),
    },
    colors: { rendah: '#6BCB77', sedang: '#FFD93D', tinggi: '#FF6B6B' },
    labels: { rendah: 'Rendah', sedang: 'Sedang', tinggi: 'Tinggi' },
    params: {
      rendah: [0, 0, 2, 5],
      sedang: [2, 5, 8],
      tinggi: [5, 8, 10, 10],
    },
  },
  cicilan: {
    min: 0, max: 5, unit: 'Juta',
    mfs: {
      ringan: (y) => trapezoid(y, 0, 0, 0.5, 1.5),
      sedang: (y) => triangle(y, 0.5, 1.5, 2.5),
      berat:  (y) => trapezoid(y, 1.5, 2.5, 5, 5),
    },
    colors: { ringan: '#6BCB77', sedang: '#FFD93D', berat: '#FF6B6B' },
    labels: { ringan: 'Ringan', sedang: 'Sedang', berat: 'Berat' },
    params: {
      ringan: [0, 0, 0.5, 1.5],
      sedang: [0.5, 1.5, 2.5],
      berat:  [1.5, 2.5, 5, 5],
    },
  },
  risiko: {
    min: 0, max: 100, unit: 'Skor',
    mfs: {
      rendah: (z) => trapezoid(z, 0, 0, 20, 40),
      sedang: (z) => triangle(z, 30, 50, 70),
      tinggi: (z) => trapezoid(z, 60, 80, 100, 100),
    },
    colors: { rendah: '#6BCB77', sedang: '#FFD93D', tinggi: '#FF6B6B' },
    labels: { rendah: 'Rendah', sedang: 'Sedang', tinggi: 'Tinggi' },
  },
};

// ──────────────────────────────────────────────
// 3. FUZZY RULE BASE (9 Rules)
// ──────────────────────────────────────────────

const RULES = [
  { id: 'R1', penghasilan: 'rendah', cicilan: 'ringan', risiko: 'sedang' },
  { id: 'R2', penghasilan: 'rendah', cicilan: 'sedang', risiko: 'tinggi' },
  { id: 'R3', penghasilan: 'rendah', cicilan: 'berat',  risiko: 'tinggi' },
  { id: 'R4', penghasilan: 'sedang', cicilan: 'ringan', risiko: 'rendah' },
  { id: 'R5', penghasilan: 'sedang', cicilan: 'sedang', risiko: 'sedang' },
  { id: 'R6', penghasilan: 'sedang', cicilan: 'berat',  risiko: 'tinggi' },
  { id: 'R7', penghasilan: 'tinggi', cicilan: 'ringan', risiko: 'rendah' },
  { id: 'R8', penghasilan: 'tinggi', cicilan: 'sedang', risiko: 'rendah' },
  { id: 'R9', penghasilan: 'tinggi', cicilan: 'berat',  risiko: 'sedang' },
];

// Map rule IDs to matrix cell element IDs
const RULE_MATRIX_MAP = {
  R1: 'rm-r1', R2: 'rm-r2', R3: 'rm-r3',
  R4: 'rm-r4', R5: 'rm-r5', R6: 'rm-r6',
  R7: 'rm-r7', R8: 'rm-r8', R9: 'rm-r9',
};

// ──────────────────────────────────────────────
// 4. FUZZY INFERENCE ENGINE
// ──────────────────────────────────────────────

/**
 * Step 1: Fuzzification
 * Returns membership degrees for each fuzzy set of a variable.
 */
function fuzzify(variableKey, crispValue) {
  const variable = VARS[variableKey];
  const result = {};
  for (const [setName, mfFunc] of Object.entries(variable.mfs)) {
    result[setName] = mfFunc(crispValue);
  }
  return result;
}

/**
 * Step 2 & 3: Rule Evaluation (MIN) & Aggregation (MAX)
 * Returns rule evaluations and aggregated output for each output set.
 */
function evaluateRules(muPenghasilan, muCicilan) {
  const ruleResults = [];
  const aggregated = { rendah: 0, sedang: 0, tinggi: 0 };

  for (const rule of RULES) {
    const muP = muPenghasilan[rule.penghasilan];
    const muC = muCicilan[rule.cicilan];
    const alpha = Math.min(muP, muC); // AND = MIN

    ruleResults.push({
      ...rule,
      muP: muP,
      muC: muC,
      alpha: alpha,
    });

    // Aggregation: MAX for each output category
    aggregated[rule.risiko] = Math.max(aggregated[rule.risiko], alpha);
  }

  return { ruleResults, aggregated };
}

/**
 * Step 4: Defuzzification (Centroid / Center of Gravity)
 * Computes the centroid of the aggregated output area.
 */
function defuzzifyCentroid(aggregated) {
  const N = 1001; // number of sample points
  const zMin = VARS.risiko.min;
  const zMax = VARS.risiko.max;
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < N; i++) {
    const z = zMin + (i / (N - 1)) * (zMax - zMin);
    // Compute aggregated μ at point z
    const muAgg = computeAggregatedMu(z, aggregated);
    numerator += z * muAgg;
    denominator += muAgg;
  }

  if (denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Compute the aggregated membership value at a single output point z.
 * Uses clipping (MIN) per rule output, then MAX across all.
 */
function computeAggregatedMu(z, aggregated) {
  let maxMu = 0;
  for (const [setName, alphaMax] of Object.entries(aggregated)) {
    // Clip the output MF at the aggregated alpha level
    const mu = Math.min(alphaMax, VARS.risiko.mfs[setName](z));
    maxMu = Math.max(maxMu, mu);
  }
  return maxMu;
}

/**
 * Determine risk category from the crisp score.
 */
function getRiskCategory(score) {
  if (score < 35) return { key: 'low', label: 'Rendah', emoji: '✅', cssClass: 'low' };
  if (score <= 65) return { key: 'med', label: 'Sedang', emoji: '⚠️', cssClass: 'med' };
  return { key: 'high', label: 'Tinggi', emoji: '🔴', cssClass: 'high' };
}

function getRecommendation(category) {
  switch (category.key) {
    case 'low':  return 'Pengajuan pinjaman disetujui. Kapasitas finansial nasabah memadai dan risiko gagal bayar rendah.';
    case 'med':  return 'Pengajuan perlu ditinjau manual. Disarankan penyesuaian tenor atau penambahan jaminan.';
    case 'high': return 'Pengajuan pinjaman ditolak. Beban cicilan melebihi kapasitas penghasilan nasabah.';
  }
}

// ──────────────────────────────────────────────
// 5. FORMATTING HELPERS
// ──────────────────────────────────────────────

function formatRupiah(millions) {
  const rupiah = Math.round(millions * 1000000);
  const formatted = rupiah.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp ${formatted},-`;
}

// ──────────────────────────────────────────────
// 6. CANVAS DRAWING — Membership Function Graphs
// ──────────────────────────────────────────────

const CANVAS_COLORS = {
  bg: '#FFFFFF',
  axis: '#1a1a2e',
  grid: '#e0e0e0',
  marker: '#1a1a2e',
  centroid: '#FF6B6B',
};

/**
 * Draw membership functions for an input variable on a canvas.
 */
function drawInputMF(canvasId, variableKey, currentValue) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  // Set canvas resolution
  const rect = canvas.getBoundingClientRect();
  const displayWidth = rect.width || canvas.width;
  const displayHeight = rect.height || canvas.height;
  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  canvas.style.width = displayWidth + 'px';
  canvas.style.height = displayHeight + 'px';
  ctx.scale(dpr, dpr);

  const W = displayWidth;
  const H = displayHeight;
  const pad = { top: 16, right: 16, bottom: 32, left: 38 };
  const pW = W - pad.left - pad.right;
  const pH = H - pad.top - pad.bottom;

  const variable = VARS[variableKey];
  const { min, max, mfs, colors, labels } = variable;

  // Clear
  ctx.clearRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = CANVAS_COLORS.grid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (i / 4) * pH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + pW, y);
    ctx.stroke();
  }

  // Draw each MF
  for (const [setName, mfFunc] of Object.entries(mfs)) {
    const color = colors[setName];

    // Draw filled area
    ctx.beginPath();
    for (let px = 0; px <= pW; px++) {
      const x = min + (px / pW) * (max - min);
      const mu = mfFunc(x);
      const cx = pad.left + px;
      const cy = pad.top + pH * (1 - mu);
      if (px === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.lineTo(pad.left + pW, pad.top + pH);
    ctx.lineTo(pad.left, pad.top + pH);
    ctx.closePath();
    ctx.fillStyle = color + '25';
    ctx.fill();

    // Draw line
    ctx.beginPath();
    for (let px = 0; px <= pW; px++) {
      const x = min + (px / pW) * (max - min);
      const mu = mfFunc(x);
      const cx = pad.left + px;
      const cy = pad.top + pH * (1 - mu);
      if (px === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // Current value vertical line
  const valX = pad.left + ((currentValue - min) / (max - min)) * pW;
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = CANVAS_COLORS.marker;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(valX, pad.top);
  ctx.lineTo(valX, pad.top + pH);
  ctx.stroke();
  ctx.setLineDash([]);

  // Intersection dots
  for (const [setName, mfFunc] of Object.entries(mfs)) {
    const mu = mfFunc(currentValue);
    if (mu > 0.001) {
      const dotY = pad.top + pH * (1 - mu);
      // Horizontal dashed line to axis
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = colors[setName] + '80';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.left, dotY);
      ctx.lineTo(valX, dotY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dot
      ctx.beginPath();
      ctx.arc(valX, dotY, 5, 0, Math.PI * 2);
      ctx.fillStyle = colors[setName];
      ctx.fill();
      ctx.strokeStyle = CANVAS_COLORS.marker;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = CANVAS_COLORS.marker;
      ctx.font = 'bold 11px Space Grotesk, sans-serif';
      ctx.textAlign = 'left';
      const labelText = `${labels[setName]} ${mu.toFixed(2)}`;
      const labelX = valX + 8;
      const labelY = dotY + 4;
      // Background for readability
      const tm = ctx.measureText(labelText);
      ctx.fillStyle = '#ffffffcc';
      ctx.fillRect(labelX - 2, labelY - 11, tm.width + 4, 14);
      ctx.fillStyle = CANVAS_COLORS.marker;
      ctx.fillText(labelText, labelX, labelY);
    }
  }

  // Axes
  ctx.strokeStyle = CANVAS_COLORS.axis;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + pH);
  ctx.lineTo(pad.left + pW, pad.top + pH);
  ctx.stroke();

  // Y-axis labels
  ctx.fillStyle = CANVAS_COLORS.axis;
  ctx.font = '10px Space Grotesk, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('1.0', pad.left - 4, pad.top + 4);
  ctx.fillText('0.5', pad.left - 4, pad.top + pH / 2 + 4);
  ctx.fillText('0', pad.left - 4, pad.top + pH + 4);

  // X-axis labels
  ctx.textAlign = 'center';
  const ticks = variableKey === 'penghasilan' ? [0, 2, 5, 8, 10] : [0, 0.5, 1.5, 2.5, 5];
  for (const t of ticks) {
    const tx = pad.left + ((t - min) / (max - min)) * pW;
    ctx.fillText(t, tx, pad.top + pH + 16);
    // Tick mark
    ctx.beginPath();
    ctx.moveTo(tx, pad.top + pH);
    ctx.lineTo(tx, pad.top + pH + 4);
    ctx.stroke();
  }

  // Value label at top
  ctx.fillStyle = CANVAS_COLORS.marker;
  ctx.font = 'bold 11px Space Grotesk, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`x = ${currentValue.toFixed(1)}`, valX, pad.top - 4);

  // Axis title
  ctx.font = '10px Space Grotesk, sans-serif';
  ctx.fillText(`μ(x)`, pad.left - 4, pad.top - 4);
}

/**
 * Draw aggregated output with centroid on the output canvas.
 */
function drawOutputAggregation(aggregated, centroidValue) {
  const canvas = document.getElementById('output-canvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const rect = canvas.getBoundingClientRect();
  const displayWidth = rect.width || canvas.width;
  const displayHeight = rect.height || canvas.height;
  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  canvas.style.width = displayWidth + 'px';
  canvas.style.height = displayHeight + 'px';
  ctx.scale(dpr, dpr);

  const W = displayWidth;
  const H = displayHeight;
  const pad = { top: 20, right: 20, bottom: 36, left: 44 };
  const pW = W - pad.left - pad.right;
  const pH = H - pad.top - pad.bottom;

  const { mfs, colors, labels } = VARS.risiko;

  ctx.clearRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = CANVAS_COLORS.grid;
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (i / 4) * pH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + pW, y);
    ctx.stroke();
  }

  // Draw original output MFs as light outlines
  for (const [setName, mfFunc] of Object.entries(mfs)) {
    ctx.beginPath();
    for (let px = 0; px <= pW; px++) {
      const z = (px / pW) * 100;
      const mu = mfFunc(z);
      const cx = pad.left + px;
      const cy = pad.top + pH * (1 - mu);
      if (px === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.strokeStyle = colors[setName] + '50';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw aggregated area
  ctx.beginPath();
  for (let px = 0; px <= pW; px++) {
    const z = (px / pW) * 100;
    const mu = computeAggregatedMu(z, aggregated);
    const cx = pad.left + px;
    const cy = pad.top + pH * (1 - mu);
    if (px === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }
  ctx.lineTo(pad.left + pW, pad.top + pH);
  ctx.lineTo(pad.left, pad.top + pH);
  ctx.closePath();

  // Gradient fill for aggregated area
  const grad = ctx.createLinearGradient(pad.left, 0, pad.left + pW, 0);
  grad.addColorStop(0, '#6BCB7740');
  grad.addColorStop(0.4, '#FFD93D50');
  grad.addColorStop(0.7, '#FF6B6B50');
  grad.addColorStop(1, '#FF6B6B40');
  ctx.fillStyle = grad;
  ctx.fill();

  // Aggregated outline
  ctx.beginPath();
  for (let px = 0; px <= pW; px++) {
    const z = (px / pW) * 100;
    const mu = computeAggregatedMu(z, aggregated);
    const cx = pad.left + px;
    const cy = pad.top + pH * (1 - mu);
    if (px === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Draw clipping lines for each active aggregated output
  for (const [setName, alphaMax] of Object.entries(aggregated)) {
    if (alphaMax > 0.001) {
      const clipY = pad.top + pH * (1 - alphaMax);
      // Find range where this MF is active
      let firstPx = -1, lastPx = -1;
      for (let px = 0; px <= pW; px++) {
        const z = (px / pW) * 100;
        const mu = Math.min(alphaMax, mfs[setName](z));
        if (mu > 0.001) {
          if (firstPx < 0) firstPx = px;
          lastPx = px;
        }
      }
      if (firstPx >= 0) {
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = colors[setName] + 'AA';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad.left + firstPx, clipY);
        ctx.lineTo(pad.left + lastPx, clipY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        ctx.font = '10px Space Grotesk, sans-serif';
        ctx.fillStyle = colors[setName];
        ctx.textAlign = 'left';
        ctx.fillText(`${labels[setName]} α=${alphaMax.toFixed(2)}`, pad.left + lastPx + 4, clipY + 3);
      }
    }
  }

  // Centroid line
  if (centroidValue > 0) {
    const centX = pad.left + (centroidValue / 100) * pW;

    // Vertical line
    ctx.strokeStyle = CANVAS_COLORS.centroid;
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(centX, pad.top);
    ctx.lineTo(centX, pad.top + pH);
    ctx.stroke();

    // Triangle marker at bottom
    ctx.fillStyle = CANVAS_COLORS.centroid;
    ctx.beginPath();
    ctx.moveTo(centX, pad.top + pH + 2);
    ctx.lineTo(centX - 7, pad.top + pH + 12);
    ctx.lineTo(centX + 7, pad.top + pH + 12);
    ctx.closePath();
    ctx.fill();

    // Centroid label box
    const labelText = `z* = ${centroidValue.toFixed(2)}`;
    ctx.font = 'bold 12px Space Grotesk, sans-serif';
    const tm = ctx.measureText(labelText);
    const boxW = tm.width + 12;
    const boxH = 22;
    let boxX = centX - boxW / 2;
    // Clamp within canvas
    boxX = Math.max(pad.left, Math.min(boxX, pad.left + pW - boxW));
    const boxY = pad.top - 2;

    ctx.fillStyle = CANVAS_COLORS.centroid;
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    roundedRect(ctx, boxX, boxY - boxH, boxW, boxH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(labelText, boxX + boxW / 2, boxY - 6);
  }

  // Axes
  ctx.strokeStyle = CANVAS_COLORS.axis;
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + pH);
  ctx.lineTo(pad.left + pW, pad.top + pH);
  ctx.stroke();

  // Y-axis labels
  ctx.fillStyle = CANVAS_COLORS.axis;
  ctx.font = '10px Space Grotesk, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('1.0', pad.left - 4, pad.top + 4);
  ctx.fillText('0.5', pad.left - 4, pad.top + pH / 2 + 4);
  ctx.fillText('0', pad.left - 4, pad.top + pH + 4);

  // X-axis labels
  ctx.textAlign = 'center';
  const xTicks = [0, 20, 30, 40, 50, 60, 70, 80, 100];
  for (const t of xTicks) {
    const tx = pad.left + (t / 100) * pW;
    ctx.fillText(t, tx, pad.top + pH + 16);
    ctx.beginPath();
    ctx.moveTo(tx, pad.top + pH);
    ctx.lineTo(tx, pad.top + pH + 4);
    ctx.strokeStyle = CANVAS_COLORS.axis;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Label
  ctx.font = '10px Space Grotesk, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = CANVAS_COLORS.axis;
  ctx.fillText('μ(z)', pad.left - 4, pad.top - 6);
  ctx.textAlign = 'right';
  ctx.fillText('Skor Risiko (z)', pad.left + pW, pad.top + pH + 28);
}

/** Helper: draw rounded rectangle path */
function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ──────────────────────────────────────────────
// 7. UI UPDATE FUNCTIONS
// ──────────────────────────────────────────────

function updateAll() {
  const penghasilan = parseFloat(document.getElementById('penghasilan-slider').value);
  const cicilan = parseFloat(document.getElementById('cicilan-slider').value);

  // --- Update value displays ---
  document.getElementById('penghasilan-value').textContent = formatRupiah(penghasilan);
  document.getElementById('penghasilan-sub').textContent = `${penghasilan.toFixed(1)} Juta / bulan`;
  document.getElementById('cicilan-value').textContent = formatRupiah(cicilan);
  document.getElementById('cicilan-sub').textContent = `${cicilan.toFixed(1)} Juta / bulan`;

  // --- Step 1: Fuzzification ---
  const muP = fuzzify('penghasilan', penghasilan);
  const muC = fuzzify('cicilan', cicilan);

  // Update penghasilan membership bars
  updateBar('p-bar-rendah', 'p-val-rendah', muP.rendah);
  updateBar('p-bar-sedang', 'p-val-sedang', muP.sedang);
  updateBar('p-bar-tinggi', 'p-val-tinggi', muP.tinggi);

  // Update cicilan membership bars
  updateBar('c-bar-ringan', 'c-val-ringan', muC.ringan);
  updateBar('c-bar-sedang', 'c-val-sedang', muC.sedang);
  updateBar('c-bar-berat',  'c-val-berat',  muC.berat);

  // --- Step 2 & 3: Evaluate rules & aggregate ---
  const { ruleResults, aggregated } = evaluateRules(muP, muC);

  // --- Step 4: Defuzzification ---
  const score = defuzzifyCentroid(aggregated);
  const category = getRiskCategory(score);
  const recommendation = getRecommendation(category);

  // --- Update result display ---
  document.getElementById('risk-score').textContent = score.toFixed(2);
  const badge = document.getElementById('risk-badge');
  badge.textContent = `${category.emoji} Risiko ${category.label}`;
  badge.className = `category-badge ${category.cssClass}`;
  document.getElementById('risk-recommendation').textContent = recommendation;

  // Score number color
  const scoreEl = document.getElementById('risk-score');
  scoreEl.style.color = category.key === 'low' ? 'var(--risk-low)' :
                         category.key === 'med' ? '#c9a000' : 'var(--risk-high)';

  // Result card background
  const resultCard = document.getElementById('result-card');
  resultCard.style.background = category.key === 'low' ? 'var(--risk-low-bg)' :
                                category.key === 'med' ? 'var(--risk-med-bg)' : 'var(--risk-high-bg)';

  // --- Update detail items ---
  document.getElementById('detail-penghasilan').textContent = formatRupiah(penghasilan);
  document.getElementById('detail-cicilan').textContent = formatRupiah(cicilan);

  const dsr = penghasilan > 0 ? ((cicilan / penghasilan) * 100) : (cicilan > 0 ? 999 : 0);
  document.getElementById('detail-dsr').textContent = dsr > 999 ? '> 999%' : `${dsr.toFixed(1)}%`;

  const sisa = Math.max(0, penghasilan - cicilan);
  document.getElementById('detail-sisa').textContent = formatRupiah(sisa);

  const activeCount = ruleResults.filter(r => r.alpha > 0.001).length;
  document.getElementById('detail-active-rules').textContent = `${activeCount} / 9`;

  // --- Update aggregation table ---
  document.getElementById('agg-rendah').textContent = aggregated.rendah.toFixed(2);
  document.getElementById('agg-sedang').textContent = aggregated.sedang.toFixed(2);
  document.getElementById('agg-tinggi').textContent = aggregated.tinggi.toFixed(2);

  // --- Update rules table ---
  updateRulesTable(ruleResults);

  // --- Update rule matrix highlights ---
  updateRuleMatrix(ruleResults);

  // --- Draw canvases ---
  drawInputMF('penghasilan-canvas', 'penghasilan', penghasilan);
  drawInputMF('cicilan-canvas', 'cicilan', cicilan);
  drawOutputAggregation(aggregated, score);
}

function updateBar(barId, valId, mu) {
  document.getElementById(barId).style.width = `${mu * 100}%`;
  document.getElementById(valId).textContent = mu.toFixed(2);
}

function updateRulesTable(ruleResults) {
  const tbody = document.getElementById('rules-tbody');
  tbody.innerHTML = '';

  for (const r of ruleResults) {
    const tr = document.createElement('tr');
    const isActive = r.alpha > 0.001;
    tr.className = isActive ? 'active' : 'inactive';

    tr.innerHTML = `
      <td>${r.id}</td>
      <td>${VARS.penghasilan.labels[r.penghasilan]} (${r.muP.toFixed(2)})</td>
      <td>${VARS.cicilan.labels[r.cicilan]} (${r.muC.toFixed(2)})</td>
      <td>${VARS.risiko.labels[r.risiko]}</td>
      <td><span class="alpha-badge ${isActive ? 'has-value' : ''}">${r.alpha.toFixed(2)}</span></td>
    `;
    tbody.appendChild(tr);
  }
}

function updateRuleMatrix(ruleResults) {
  // Clear all active highlights
  for (const id of Object.values(RULE_MATRIX_MAP)) {
    const cell = document.getElementById(id);
    if (cell) cell.classList.remove('rule-active');
  }

  // Add active class to cells with α > 0
  for (const r of ruleResults) {
    if (r.alpha > 0.001) {
      const cell = document.getElementById(RULE_MATRIX_MAP[r.id]);
      if (cell) cell.classList.add('rule-active');
    }
  }
}

// ──────────────────────────────────────────────
// 8. EVENT LISTENERS & INITIALIZATION
// ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const pSlider = document.getElementById('penghasilan-slider');
  const cSlider = document.getElementById('cicilan-slider');

  // Throttled update for smooth slider dragging
  let rafId = null;
  function requestUpdate() {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      updateAll();
      rafId = null;
    });
  }

  pSlider.addEventListener('input', requestUpdate);
  cSlider.addEventListener('input', requestUpdate);

  // Handle window resize for canvas redrawing
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateAll, 150);
  });

  // Initial render
  updateAll();
});
