/* ── STATE ─────────────────────────────────── */
const S = { prods:{}, movs:[], nid:1, tipo:'ingreso' };

/* ── UTILS ─────────────────────────────────── */
const fmt = n => 'S/. ' + (+n).toFixed(2);
const fmtN = n => (+n).toFixed(2);

setInterval(() => {
  document.getElementById('clock').textContent =
    new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}, 1000);

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<div class="t-dot"></div>${msg}`;
  document.getElementById('tc').appendChild(el);
  setTimeout(() => {
    el.style.cssText = 'opacity:0;transform:translateX(20px);transition:all .3s';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

/* ── NAV ───────────────────────────────────── */
const TITLES = {
  dashboard: ['Dashboard', 'Resumen general del almacén'],
  productos: ['Productos', 'Gestionar catálogo de productos'],
  movimientos: ['Movimientos', 'Registrar ingreso o salida'],
  historial: ['Historial', 'Registro completo de operaciones'],
};

function goTab(name, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sid-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  if (btn) btn.classList.add('active');
  const [t, s] = TITLES[name] || ['', ''];
  document.getElementById('tb-title').textContent = t;
  document.getElementById('tb-sub').textContent = s;
  if (name === 'movimientos') fillProdSel();
  if (name === 'historial') { fillFiltros(); renderHist(); }
  if (name === 'dashboard') renderDash();
}

/* ── REFRESH ───────────────────────────────── */
function refresh() {
  const np = Object.keys(S.prods).length, nm = S.movs.length;
  document.getElementById('sk-prods').textContent = np;
  document.getElementById('sk-movs').textContent = nm;
  document.getElementById('tb-badge').textContent = `${np} producto${np !== 1 ? 's' : ''}`;
  document.getElementById('cat-sub').textContent = `${np} producto${np !== 1 ? 's' : ''} registrado${np !== 1 ? 's' : ''}`;
  renderCatalog();
  renderDash();
}

/* ── DASHBOARD ─────────────────────────────── */
function renderDash() {
  const pp = Object.values(S.prods);
  const valor = pp.reduce((a, p) => a + p.ct, 0);
  const ing = S.movs.filter(m => m.t === 'ingreso').length;
  const sal = S.movs.filter(m => m.t === 'salida').length;
  document.getElementById('d-prods').textContent = pp.length;
  document.getElementById('d-valor').textContent = fmt(valor);
  document.getElementById('d-ing').textContent = ing;
  document.getElementById('d-sal').textContent = sal;

  const c = document.getElementById('dash-inv');
  if (!pp.length) {
    c.innerHTML = `<div class="empty"><div class="empty-ico">🏭</div><div class="empty-title">Sin productos aún</div><div class="empty-sub">Registra tu primer producto para comenzar</div></div>`;
    return;
  }
  c.innerHTML = `<div class="tbl-wrap"><table>
    <thead><tr><th>Código</th><th>Producto</th><th>Stock</th><th>C. Promedio</th><th>Costo Total</th><th>Movs.</th></tr></thead>
    <tbody>${pp.map(p => {
      const nm = S.movs.filter(m => m.cod === p.cod).length;
      const sc = p.stk <= 0 ? 'zero' : p.stk < 5 ? 'low' : 'ok';
      return `<tr>
        <td><span class="td-code">${p.cod}</span></td>
        <td><strong>${p.nom}</strong></td>
        <td><span class="pc-stk ${sc}">${p.stk}</span></td>
        <td class="td-mono">${fmt(p.cp)}</td>
        <td class="td-mono"><strong>${fmt(p.ct)}</strong></td>
        <td class="td-muted">${nm}</td>
      </tr>`;
    }).join('')}</tbody>
  </table></div>`;
}

/* ── PRODUCTOS ─────────────────────────────── */
function prevProd() {
  const s = parseFloat(document.getElementById('p-stk').value) || 0;
  const c = parseFloat(document.getElementById('p-cu').value) || 0;
  const b = document.getElementById('pprod');
  if (s > 0 || c > 0) {
    b.classList.add('show');
    document.getElementById('pp-tot').textContent = fmt(s * c);
    document.getElementById('pp-prom').textContent = fmt(c);
  } else b.classList.remove('show');
}

/* Additional functions omitted for brevity */
