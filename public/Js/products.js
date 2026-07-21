const socket = io();

// 1. Manejo del formulario para crear productos (POST /api/products)
const createForm = document.getElementById("create-product-form");

if (createForm) {
  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newProduct = {
      title: document.getElementById("title").value,
      description: document.getElementById("description").value,
      code: document.getElementById("code").value,
      price: Number(document.getElementById("price").value),
      stock: Number(document.getElementById("stock").value),
      category: document.getElementById("category").value,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        createForm.reset();
      } else {
        const errorData = await res.json();
        alert(`Error al crear el producto: ${errorData.message || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error al enviar la petición:", error);
      alert("Error de conexión con el servidor.");
    }
  });
}

// 2. Función global para eliminar un producto (DELETE /api/products/:id)
async function deleteProduct(id) {
  if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

  try {
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorData = await res.json();
      alert(`Error al eliminar: ${errorData.message || "No se pudo eliminar el producto"}`);
    }
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    alert("Error de conexión al intentar eliminar.");
  }
}

// 3. WebSockets: Escuchar cambios emitidos por el servidor
socket.on("products-changed", () => {
  console.log("Evento 'products-changed' recibido. Recargando la vista...");
  window.location.reload();
});