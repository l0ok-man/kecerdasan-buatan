// State
let weights = {
  harga: 0.3,
  ram: 0.3,
  baterai: 0.2,
  berat: 0.2
};

let laptops = [
  { id: 1, name: "Lenovo ThinkPad X1", skor: { harga: 60, ram: 90, baterai: 85, berat: 80 } },
  { id: 2, name: "MacBook Air M2", skor: { harga: 50, ram: 85, baterai: 95, berat: 90 } },
  { id: 3, name: "Asus VivoBook", skor: { harga: 85, ram: 75, baterai: 70, berat: 60 } }
];

let nextId = 4;

// DOM Elements
const weightInputs = {
  harga: document.getElementById('weight-harga'),
  ram: document.getElementById('weight-ram'),
  baterai: document.getElementById('weight-baterai'),
  berat: document.getElementById('weight-berat')
};
const totalWeightDisplay = document.getElementById('total-weight-display');
const weightAlert = document.getElementById('weight-alert');
const tableBody = document.getElementById('table-body');
const formLaptop = document.getElementById('form-laptop');

// Initialize
function init() {
  attachEventListeners();
  calculateAndRender();
}

function attachEventListeners() {
  // Listen to weight changes
  Object.keys(weightInputs).forEach(key => {
    weightInputs[key].addEventListener('input', handleWeightChange);
  });

  // Listen to form submit
  formLaptop.addEventListener('submit', (e) => {
    e.preventDefault();
    addLaptop();
  });
}

function handleWeightChange() {
  let total = 0;
  let valid = true;
  
  // Read values
  const newWeights = {};
  for (let key in weightInputs) {
    let val = parseFloat(weightInputs[key].value);
    if (isNaN(val)) {
      valid = false;
      break;
    }
    newWeights[key] = val;
    total += val;
  }

  // Update Display
  totalWeightDisplay.textContent = total.toFixed(2);

  if (!valid) return;

  // Validate Total = 1.0
  // Tolerate tiny floating point errors
  if (Math.abs(total - 1.0) > 0.001) {
    weightAlert.textContent = `Peringatan: Total bobot saat ini adalah ${total.toFixed(2)}. Total bobot harus tepat 1.0!`;
    weightAlert.className = 'alert error';
  } else {
    weightAlert.style.display = 'none';
    weightAlert.className = 'alert';
    // Update state and re-calculate
    weights = newWeights;
    calculateAndRender();
  }
}

function showFormError(message) {
  const errEl = document.getElementById('form-error');
  errEl.textContent = message;
  errEl.style.display = 'block';
  // Auto-hide after 3 seconds
  clearTimeout(errEl._timeout);
  errEl._timeout = setTimeout(() => {
    errEl.style.display = 'none';
  }, 3000);
}

function addLaptop() {
  const name = document.getElementById('input-nama').value.trim();
  const harga = parseInt(document.getElementById('input-harga').value);
  const ram = parseInt(document.getElementById('input-ram').value);
  const baterai = parseInt(document.getElementById('input-baterai').value);
  const berat = parseInt(document.getElementById('input-berat').value);

  // Custom validation
  if (!name) {
    showFormError('Isi data terlebih dahulu! Nama laptop tidak boleh kosong.');
    document.getElementById('input-nama').focus();
    return;
  }
  if (isNaN(harga) || isNaN(ram) || isNaN(baterai) || isNaN(berat)) {
    showFormError('Isi data terlebih dahulu! Semua kolom skor wajib diisi.');
    return;
  }

  // Hide error if validation passes
  document.getElementById('form-error').style.display = 'none';

  laptops.push({
    id: nextId++,
    name: name,
    skor: { harga, ram, baterai, berat }
  });

  formLaptop.reset();
  calculateAndRender();
}

function deleteLaptop(id) {
  laptops = laptops.filter(l => l.id !== id);
  calculateAndRender();
}

function calculateAndRender() {
  // 1. Calculate Total Score for each laptop
  let evaluated = laptops.map(laptop => {
    let evalHarga = laptop.skor.harga * weights.harga;
    let evalRam = laptop.skor.ram * weights.ram;
    let evalBaterai = laptop.skor.baterai * weights.baterai;
    let evalBerat = laptop.skor.berat * weights.berat;
    let totalScore = evalHarga + evalRam + evalBaterai + evalBerat;
    
    return {
      ...laptop,
      eval: { harga: evalHarga, ram: evalRam, baterai: evalBaterai, berat: evalBerat },
      totalScore: totalScore
    };
  });

  // 2. Sort by Total Score (Highest first)
  evaluated.sort((a, b) => b.totalScore - a.totalScore);

  // 3. Render Table
  tableBody.innerHTML = '';
  if (evaluated.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center;">Belum ada data laptop.</td></tr>`;
    document.getElementById('best-laptop-container').style.display = 'none';
    return;
  }

  evaluated.forEach((l, index) => {
    const isRank1 = index === 0;
    const tr = document.createElement('tr');
    if (isRank1) tr.className = 'rank-1';
    
    tr.innerHTML = `
      <td>#${index + 1}</td>
      <td>${l.name}</td>
      <td>${l.skor.harga} <small class="text-muted">(${l.eval.harga.toFixed(2)})</small></td>
      <td>${l.skor.ram} <small class="text-muted">(${l.eval.ram.toFixed(2)})</small></td>
      <td>${l.skor.baterai} <small class="text-muted">(${l.eval.baterai.toFixed(2)})</small></td>
      <td>${l.skor.berat} <small class="text-muted">(${l.eval.berat.toFixed(2)})</small></td>
      <td style="font-weight: 700; font-size: 1.1rem;">${l.totalScore.toFixed(2)}</td>
      <td><button class="btn btn-danger" style="padding: 6px 12px; font-size: 0.8rem;" onclick="deleteLaptop(${l.id})">Hapus</button></td>
    `;
    tableBody.appendChild(tr);
  });

  // 4. Render Best Laptop Breakdown
  renderBestLaptop(evaluated[0]);
}

function renderBestLaptop(best) {
  document.getElementById('best-laptop-container').style.display = 'block';
  document.getElementById('best-name').textContent = best.name;
  
  const bd = document.getElementById('best-breakdown');
  bd.innerHTML = `
    <div class="breakdown-item">
      <span>Harga (${best.skor.harga} × ${weights.harga})</span>
      <span>${best.eval.harga.toFixed(2)}</span>
    </div>
    <div class="breakdown-item">
      <span>RAM (${best.skor.ram} × ${weights.ram})</span>
      <span>${best.eval.ram.toFixed(2)}</span>
    </div>
    <div class="breakdown-item">
      <span>Baterai (${best.skor.baterai} × ${weights.baterai})</span>
      <span>${best.eval.baterai.toFixed(2)}</span>
    </div>
    <div class="breakdown-item">
      <span>Berat (${best.skor.berat} × ${weights.berat})</span>
      <span>${best.eval.berat.toFixed(2)}</span>
    </div>
    <div class="breakdown-total">
      TOTAL: ${best.totalScore.toFixed(2)}
    </div>
  `;
}

// Start
init();
