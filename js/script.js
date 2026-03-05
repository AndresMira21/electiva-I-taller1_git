// Interacción simple al hacer click en cada producto
const productos = document.querySelectorAll('.producto-card');

productos.forEach(producto => {
  producto.addEventListener('click', () => {
    const nombre = producto.querySelector('h3').textContent;
    alert(`Producto seleccionado: ${nombre}`);
  });
});