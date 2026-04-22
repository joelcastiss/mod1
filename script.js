/* ═══════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════ */
const S = {
  prods: {},       // { cod: { cod, nom, stk, cp, ct } }
  movs:  [],       // array de movimientos
  nid:   1,        // ID autoincremental
  tipo: 'ingreso'  // tipo de movimiento activo
};

/* ═══════════════════════════════════════════════
   UTILIDADES
═══════════════════════════════════════════════ */
const fmt  = n => 'S/. ' + (+n).toFixed(2);
const fmtN = n => (+n).toFixed(2);

// Reloj en tiempo real
setInterval(() => {
  document.getElementById('clock').textContent =
    new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}, 1000);

// Notificaciones toast
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

/* ═══════════════════════════════════════════════
   NAVEGACIÓN
═══════════════════════════════════════════════ */
const TITLES = {
  dashboard:   ['Dashboard',    'Resumen general del almacén'],
  productos:   ['Productos',    'Gestionar catálogo de productos'],
  movimientos: ['Movimientos',  'Registrar ingreso o salida'],
  historial:   ['Historial',    'Registro completo de operaciones'],
};

function goTab(name, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sid-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  if (btn) btn.classList.add('active');

  const [t, s] = TITLES[name] || ['', ''];
  document.getElementById('tb-title').textContent = t;
  document.getElementById('tb-sub').textContent   = s;

  if (name === 'movimientos') fillProdSel();
  if (name === 'historial')   { fillFiltros(); renderHist(); }
  if (name === 'dashboard')   renderDash();
}

/* ═══════════════════════════════════════════════
   REFRESH GLOBAL (actualiza contadores y renders)
═══════════════════════════════════════════════ */
function refresh() {
  const np = Object.keys(S.prods).length;
  const nm = S.movs.length;

  document.getElementById('sk-prods').textContent = np;
  document.getElementById('sk-movs').textContent  = nm;
  document.getElementById('tb-badge').textContent = `${np} producto${np !== 1 ? 's' : ''}`;
  document.getElementById('cat-sub').textContent  = `${np} producto${np !== 1 ? 's' : ''} registrado${np !== 1 ? 's' : ''}`;

  renderCatalog();
  renderDash();
}

/* ═══════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════ */
function renderDash() {
  const pp    = Object.values(S.prods);
  const valor = pp.reduce((a, p) => a + p.ct, 0);
  const ing   = S.movs.filter(m => m.t === 'ingreso').length;
  const sal   = S.movs.filter(m => m.t === 'salida').length;

  document.getElementById('d-prods').textContent = pp.length;
  document.getElementById('d-valor').textContent = fmt(valor);
  document.getElementById('d-ing').textContent   = ing;
  document.getElementById('d-sal').textContent   = sal;

  const c = document.getElementById('dash-inv');

  if (!pp.length) {
    c.innerHTML = `
      <div class="empty">
        <div class="empty-ico">🏭</div>
        <div class="empty-title">Sin productos aún</div>
        <div class="empty-sub">Registra tu primer producto para comenzar</div>
      </div>`;
    return;
  }

  c.innerHTML = `
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr>
            <th>Código</th><th>Producto</th><th>Stock</th>
            <th>C. Promedio</th><th>Costo Total</th><th>Movs.</th>
          </tr>
        </thead>
        <tbody>
          ${pp.map(p => {
            const nm = S.movs.filter(m => m.cod === p.cod).length;
            const sc = p.stk <= 0 ? 'zero' : p.stk < 5 ? 'low' : 'ok';
            return `
              <tr>
                <td><span class="td-code">${p.cod}</span></td>
                <td><strong>${p.nom}</strong></td>
                <td><span class="pc-stk ${sc}">${p.stk}</span></td>
                <td class="td-mono">${fmt(p.cp)}</td>
                <td class="td-mono"><strong>${fmt(p.ct)}</strong></td>
                <td class="td-muted">${nm}</td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ═══════════════════════════════════════════════
   MÓDULO 1 — PRODUCTOS
═══════════════════════════════════════════════ */

// Preview en tiempo real al escribir
function prevProd() {
  const s = parseFloat(document.getElementById('p-stk').value) || 0;
  const c = parseFloat(document.getElementById('p-cu').value)  || 0;
  const b = document.getElementById('pprod');

  if (s > 0 || c > 0) {
    b.classList.add('show');
    document.getElementById('pp-tot').textContent  = fmt(s * c);
    document.getElementById('pp-prom').textContent = fmt(c);
  } else {
    b.classList.remove('show');
  }
}

// Registrar nuevo producto
function regProd() {
  const cod = document.getElementById('p-cod').value.trim().toUpperCase();
  const nom = document.getElementById('p-nom').value.trim();
  const stk = parseFloat(document.getElementById('p-stk').value) || 0;
  const cu  = parseFloat(document.getElementById('p-cu').value)  || 0;

  if (!cod) return toast('El código es obligatorio', 'err');
  if (!nom) return toast('El nombre es obligatorio', 'err');
  if (S.prods[cod]) return toast(`El código "${cod}" ya existe`, 'err');

  S.prods[cod] = { cod, nom, stk, cp: cu, ct: stk * cu };

  limpProd();
  refresh();
  toast(`"${nom}" registrado ✓`, 'ok');
}

// Limpiar formulario de producto
function limpProd() {
  ['p-cod', 'p-nom', 'p-stk', 'p-cu'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('pprod').classList.remove('show');
}

// Renderizar catálogo de productos
function renderCatalog() {
  const pp = Object.values(S.prods);
  const g  = document.getElementById('catalogo');

  if (!pp.length) {
    g.innerHTML = `
      <div class="empty">
        <div class="empty-ico">📦</div>
        <div class="empty-title">Sin productos</div>
        <div class="empty-sub">Registra tu primer producto arriba</div>
      </div>`;
    return;
  }

  g.innerHTML = `
    <div class="prod-grid">
      ${pp.map(p => {
        const sc = p.stk <= 0 ? 'zero' : p.stk < 5 ? 'low' : 'ok';
        const sl = p.stk <= 0 ? 'Sin stock' : p.stk < 5 ? 'Stock bajo' : `${p.stk} uds.`;
        const nm = S.movs.filter(m => m.cod === p.cod).length;
        return `
          <div class="prod-card">
            <div class="pc-head">
              <span class="pc-code">${p.cod}</span>
              <span class="pc-stk ${sc}">${sl}</span>
            </div>
            <div class="pc-name">${p.nom}</div>
            <div class="pc-metrics">
              <div class="pc-m"><div class="pc-m-lbl">Stock</div><div class="pc-m-val bl">${p.stk}</div></div>
              <div class="pc-m"><div class="pc-m-lbl">C. Promedio</div><div class="pc-m-val">${fmt(p.cp)}</div></div>
              <div class="pc-m"><div class="pc-m-lbl">Costo Total</div><div class="pc-m-val">${fmt(p.ct)}</div></div>
              <div class="pc-m"><div class="pc-m-lbl">Movimientos</div><div class="pc-m-val">${nm}</div></div>
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

/* ═══════════════════════════════════════════════
   MÓDULO 2 — MOVIMIENTOS
═══════════════════════════════════════════════ */

// Cambiar tipo (Ingreso / Salida)
function setTipo(t) {
  S.tipo = t;
  document.getElementById('t-in').className  = 'tipo-opt' + (t === 'ingreso' ? ' in' : '');
  document.getElementById('t-out').className = 'tipo-opt' + (t === 'salida'  ? ' out' : '');
  document.getElementById('f-cu').style.display = t === 'salida' ? 'none' : 'flex';

  const b = document.getElementById('btn-mov');
  if (t === 'ingreso') {
    b.className   = 'btn btn-s';
    b.textContent = '📥 Registrar Ingreso';
  } else {
    b.className   = 'btn btn-d';
    b.textContent = '📤 Registrar Salida';
  }

  prevMov();
}

// Poblar select de productos
function fillProdSel() {
  const sel = document.getElementById('m-prod');
  const cur = sel.value;

  sel.innerHTML = '<option value="">— Selecciona un producto —</option>' +
    Object.values(S.prods)
      .map(p => `<option value="${p.cod}">${p.cod} — ${p.nom}</option>`)
      .join('');

  if (cur && S.prods[cur]) sel.value = cur;
  onProd();
}

// Al cambiar el producto seleccionado
function onProd() {
  const cod = document.getElementById('m-prod').value;
  const sib = document.getElementById('sib');

  if (!cod || !S.prods[cod]) { sib.classList.remove('show'); return; }

  const p = S.prods[cod];
  sib.classList.add('show');
  document.getElementById('sib-s').textContent = p.stk;
  document.getElementById('sib-p').textContent = fmt(p.cp);
  document.getElementById('sib-t').textContent = fmt(p.ct);

  prevMov();
}

// Preview del movimiento en tiempo real
function prevMov() {
  const cod = document.getElementById('m-prod').value;
  const qty = parseFloat(document.getElementById('m-qty').value) || 0;
  const cu  = parseFloat(document.getElementById('m-cu').value)  || 0;
  const b   = document.getElementById('pmov');

  if (!cod || !S.prods[cod] || qty <= 0) { b.classList.remove('show'); return; }

  const p = S.prods[cod];
  const t = S.tipo;
  let ns, np, nt;

  if (t === 'ingreso') {
    ns = p.stk + qty;
    nt = p.ct + (qty * cu);
    np = ns > 0 ? nt / ns : cu;
    b.className = 'prev-box show';
  } else {
    if (qty > p.stk) { b.classList.remove('show'); return; }
    ns = p.stk - qty;
    np = p.cp;
    nt = ns * np;
    b.className = 'prev-box r show';
  }

  const cl = t === 'ingreso' ? 'g' : 'r';
  ['pm-sl', 'pm-pl', 'pm-tl'].forEach(id => {
    document.getElementById(id).className = `prev-lbl ${cl}`;
  });

  document.getElementById('pm-s').textContent = ns;
  document.getElementById('pm-p').textContent = fmt(np);
  document.getElementById('pm-t').textContent = fmt(nt);
}

// Registrar movimiento
function regMov() {
  const cod = document.getElementById('m-prod').value;
  const t   = S.tipo;
  const qty = parseFloat(document.getElementById('m-qty').value);
  const cu  = parseFloat(document.getElementById('m-cu').value);
  const ref = document.getElementById('m-ref').value.trim();

  if (!cod || !S.prods[cod]) return toast('Selecciona un producto', 'err');
  if (isNaN(qty) || qty <= 0) return toast('Cantidad inválida', 'err');

  const p = S.prods[cod];

  if (t === 'ingreso') {
    if (isNaN(cu) || cu < 0) return toast('Costo unitario inválido', 'err');

    const ns = p.stk + qty;
    const nt = p.ct + (qty * cu);
    const np = ns > 0 ? nt / ns : cu;

    S.movs.push({
      id: S.nid++, cod, nom: p.nom, t: 'ingreso',
      qty, cu, cmt: qty * cu,
      sa: p.stk, pa: p.cp, sd: ns, pd: np, td: nt,
      ref, fecha: new Date().toLocaleString('es-PE')
    });

    S.prods[cod] = { ...p, stk: ns, ct: nt, cp: np };
    toast(`+${qty} uds. ingresadas a "${p.nom}" ✓`, 'ok');

  } else {
    if (qty > p.stk) return toast('Stock insuficiente', 'err');

    const ns = p.stk - qty;
    const nt = ns * p.cp;

    S.movs.push({
      id: S.nid++, cod, nom: p.nom, t: 'salida',
      qty, cu: p.cp, cmt: qty * p.cp,
      sa: p.stk, pa: p.cp, sd: ns, pd: p.cp, td: nt,
      ref, fecha: new Date().toLocaleString('es-PE')
    });

    S.prods[cod] = { ...p, stk: ns, ct: nt };
    toast(`-${qty} uds. despachadas de "${p.nom}" ✓`, 'ok');
  }

  limpMov();
  refresh();
  onProd();
}

// Limpiar formulario de movimiento
function limpMov() {
  ['m-qty', 'm-cu', 'm-ref'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('pmov').classList.remove('show');
}

/* ═══════════════════════════════════════════════
   MÓDULO 3 — HISTORIAL
═══════════════════════════════════════════════ */

// Poblar filtro de productos
function fillFiltros() {
  const sel = document.getElementById('f-prod');
  const cur = sel.value;

  sel.innerHTML = '<option value="">Todos los productos</option>' +
    Object.values(S.prods)
      .map(p => `<option value="${p.cod}">${p.cod} — ${p.nom}</option>`)
      .join('');

  if (cur) sel.value = cur;
}

// Renderizar tabla de historial
function renderHist() {
  const fp   = document.getElementById('f-prod').value;
  const ft   = document.getElementById('f-tipo').value;
  let lista  = [...S.movs].reverse();

  if (fp) lista = lista.filter(m => m.cod === fp);
  if (ft) lista = lista.filter(m => m.t   === ft);

  const w = document.getElementById('hist-wrap');

  if (!lista.length) {
    w.innerHTML = `
      <div class="empty">
        <div class="empty-ico">📋</div>
        <div class="empty-title">Sin movimientos</div>
        <div class="empty-sub">Aparecerán aquí cuando registres operaciones</div>
      </div>`;
    return;
  }

  w.innerHTML = `
    <div class="tbl-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Fecha</th><th>Producto</th><th>Tipo</th>
            <th>Cant.</th><th>C. Unit.</th><th>C. Mov.</th>
            <th>Stock</th><th>C. Promedio</th><th>Ref.</th>
          </tr>
        </thead>
        <tbody>
          ${lista.map(m => `
            <tr>
              <td class="td-mono td-muted">${String(m.id).padStart(4, '0')}</td>
              <td class="td-muted" style="font-size:11px;white-space:nowrap">${m.fecha}</td>
              <td>
                <span class="td-code">${m.cod}</span>
                <div style="font-size:12px;color:var(--c-muted);margin-top:2px">${m.nom}</div>
              </td>
              <td>
                <span class="badge badge-${m.t}">
                  ${m.t === 'ingreso' ? '▲ Ingreso' : '▼ Salida'}
                </span>
              </td>
              <td class="td-mono">
                <strong style="color:${m.t === 'ingreso' ? 'var(--c-green)' : 'var(--c-red)'}">
                  ${m.t === 'ingreso' ? '+' : '-'}${m.qty}
                </strong>
              </td>
              <td class="td-mono">${fmt(m.cu)}</td>
              <td class="td-mono"><strong>${fmt(m.cmt)}</strong></td>
              <td>
                <div class="arr">
                  <span class="arr-from">${m.sa}</span>
                  <span class="arr-ic">→</span>
                  <span class="arr-to">${m.sd}</span>
                </div>
              </td>
              <td>
                <div class="arr">
                  <span class="arr-from">${fmtN(m.pa)}</span>
                  <span class="arr-ic">→</span>
                  <span class="arr-to">${fmtN(m.pd)}</span>
                </div>
              </td>
              <td class="td-muted" style="font-size:11px">${m.ref || '—'}</td>
            </tr>`
          ).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ═══════════════════════════════════════════════
   EXPORTAR CSV
═══════════════════════════════════════════════ */
function exportCSV() {
  if (!S.movs.length) return toast('Sin movimientos para exportar', 'err');

  const rows = [
    ['ID', 'Fecha', 'Codigo', 'Producto', 'Tipo', 'Cantidad',
     'CostoUnit', 'CostoMov', 'StockAntes', 'StockDespues',
     'PromAntes', 'PromDespues', 'Referencia'],
    ...S.movs.map(m => [
      m.id, m.fecha, m.cod, m.nom, m.t, m.qty,
      fmtN(m.cu), fmtN(m.cmt), m.sa, m.sd,
      fmtN(m.pa), fmtN(m.pd), m.ref || ''
    ])
  ];

  const csv  = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a    = Object.assign(document.createElement('a'), {
    href:     URL.createObjectURL(blob),
    download: `almacen_${Date.now()}.csv`
  });
  a.click();
  toast('CSV exportado ✓', 'ok');
}

/* ═══════════════════════════════════════════════
   INICIALIZACIÓN
═══════════════════════════════════════════════ */
setTipo('ingreso');