// Array para almacenar productos
let inventario = JSON.parse(localStorage.getItem('almacen')) || [];

const productForm = document.getElementById('productForm');
const inventoryTable = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];

// Función para inicializar la vista
function init() {
    renderTable();
    actualizarResumen();
}

productForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const codigo = document.getElementById('codigo').value;
    const nombre = document.getElementById('nombre').value;
    const stock = parseFloat(document.getElementById('stock').value);
    const costoUnit = parseFloat(document.getElementById('costo').value);

    // Cálculos iniciales solicitados
    const costoTotal = stock * costoUnit;
    const costoPromedio = costoUnit; // Al inicio el unitario es el promedio

    const nuevoProducto = {
        codigo,
        nombre,
        stock,
        costoUnit,
        costoTotal,
        costoPromedio
    };

    // Agregar al array y guardar
    inventario.push(nuevoProducto);
    localStorage.setItem('almacen', JSON.stringify(inventario));

    // Resetear form y actualizar UI
    productForm.reset();
    renderTable();
    actualizarResumen();
});

function renderTable() {
    inventoryTable.innerHTML = '';
    
    inventario.forEach(prod => {
        let row = inventoryTable.insertRow();
        row.innerHTML = `
            <td><strong>${prod.codigo}</strong></td>
            <td>${prod.nombre}</td>
            <td>${prod.stock}</td>
            <td>S/ ${prod.costoPromedio.toFixed(2)}</td>
            <td>S/ ${prod.costoTotal.toFixed(2)}</td>
        `;
    });
}

function actualizarResumen() {
    const totalItems = inventario.length;
    const valorTotal = inventario.reduce((acc, prod) => acc + prod.costoTotal, 0);

    document.getElementById('totalItems').innerText = totalItems;
    document.getElementById('valorTotal').innerText = `S/ ${valorTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
}

init();