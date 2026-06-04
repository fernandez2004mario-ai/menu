document.addEventListener('DOMContentLoaded', () => {
    inicializarMenu();
});

let cartaCompleta = [];
let categoriaActiva = null;
let subcategoriaActiva = null;

async function inicializarMenu() {
    const contenedorCategorias = document.getElementById('main-categories');
    const contenedorSubcategorias = document.getElementById('subcategories-nav');
    const contenedorMenu = document.getElementById('menu-container');

    try {
        const respuesta = await fetch('menu.json');

        if (!respuesta.ok) {
            throw new Error('No se pudo cargar el archivo menu.json');
        }

        const datos = await respuesta.json();

        if (!datos.categories || !Array.isArray(datos.categories)) {
            throw new Error('El archivo menu.json no tiene una estructura válida');
        }

        cartaCompleta = datos.categories;

        if (!contenedorCategorias || !contenedorSubcategorias || !contenedorMenu) {
            throw new Error('Faltan contenedores en el HTML');
        }

        renderizarCategoriasPrincipales();

        // Cargar automáticamente la primera categoría al iniciar
        if (cartaCompleta.length > 0) {
            seleccionarCategoria(cartaCompleta[0].id);
        }

    } catch (error) {
        console.error('Error al cargar el menú:', error);

        if (contenedorCategorias) {
            contenedorCategorias.innerHTML = `
                <div class="error-mensaje">
                    Error al cargar la carta. Revisa el archivo menu.json o usa Live Server.
                </div>
            `;
        }

        if (contenedorMenu) {
            contenedorMenu.innerHTML = '';
        }
    }
}

/* ============================================================
   RENDERIZAR CATEGORÍAS PRINCIPALES
   ============================================================ */

function renderizarCategoriasPrincipales() {
    const contenedorCategorias = document.getElementById('main-categories');
    contenedorCategorias.innerHTML = '';

    cartaCompleta.forEach((categoria) => {
        const tarjetaCategoria = document.createElement('article');
        tarjetaCategoria.classList.add('main-category-card');
        tarjetaCategoria.dataset.id = categoria.id;

        // Imagen de fondo opcional
        if (categoria.imagen && categoria.imagen.trim() !== '') {
            tarjetaCategoria.style.setProperty('--category-image', `url('${categoria.imagen}')`);
        }

        tarjetaCategoria.innerHTML = `
            <div class="main-category-content">
                <div class="main-category-icon">
                    <i class="${categoria.icono || 'fa-solid fa-utensils'}"></i>
                </div>
                <div class="main-category-name">
                    ${categoria.nombre}
                </div>
            </div>
        `;

        tarjetaCategoria.addEventListener('click', () => {
            seleccionarCategoria(categoria.id);
        });

        contenedorCategorias.appendChild(tarjetaCategoria);
    });
}

/* ============================================================
   SELECCIONAR CATEGORÍA PRINCIPAL
   ============================================================ */

function seleccionarCategoria(idCategoria) {
    const categoria = cartaCompleta.find(cat => cat.id === idCategoria);

    if (!categoria) {
        return;
    }

    categoriaActiva = categoria;

    // Marcar tarjeta principal activa
    document.querySelectorAll('.main-category-card').forEach(card => {
        card.classList.remove('active');
    });

    const tarjetaActiva = document.querySelector(`.main-category-card[data-id="${idCategoria}"]`);
    if (tarjetaActiva) {
        tarjetaActiva.classList.add('active');
    }

    // Cambiar título e información de la sección seleccionada
    actualizarEncabezadoSeleccionado(categoria);

    // Renderizar subcategorías
    renderizarSubcategorias(categoria);

    // Cargar automáticamente la primera subcategoría
    if (categoria.subcategorias && categoria.subcategorias.length > 0) {
        seleccionarSubcategoria(categoria.subcategorias[0].id);
    } else {
        renderizarProductos([]);
    }
}

/* ============================================================
   ACTUALIZAR ENCABEZADO DE LA CATEGORÍA
   ============================================================ */

function actualizarEncabezadoSeleccionado(categoria) {
    const icono = document.getElementById('selected-icon');
    const titulo = document.getElementById('selected-title');
    const descripcion = document.getElementById('selected-description');

    if (icono) {
        icono.innerHTML = `<i class="${categoria.icono || 'fa-solid fa-utensils'}"></i>`;
    }

    if (titulo) {
        titulo.textContent = categoria.nombre;
    }

    if (descripcion) {
        descripcion.textContent = categoria.descripcion || 'Selecciona una subcategoría para ver los productos disponibles.';
    }
}

/* ============================================================
   RENDERIZAR SUBCATEGORÍAS
   ============================================================ */

function renderizarSubcategorias(categoria) {
    const contenedorSubcategorias = document.getElementById('subcategories-nav');
    contenedorSubcategorias.innerHTML = '';

    if (!categoria.subcategorias || categoria.subcategorias.length === 0) {
        contenedorSubcategorias.innerHTML = '';
        return;
    }

    categoria.subcategorias.forEach((subcategoria) => {
        const boton = document.createElement('button');
        boton.classList.add('subcategory-btn');
        boton.dataset.id = subcategoria.id;
        boton.textContent = subcategoria.nombre;

        boton.addEventListener('click', () => {
            seleccionarSubcategoria(subcategoria.id);
        });

        contenedorSubcategorias.appendChild(boton);
    });
}

/* ============================================================
   SELECCIONAR SUBCATEGORÍA
   ============================================================ */

function seleccionarSubcategoria(idSubcategoria) {
    if (!categoriaActiva || !categoriaActiva.subcategorias) {
        return;
    }

    const subcategoria = categoriaActiva.subcategorias.find(sub => sub.id === idSubcategoria);

    if (!subcategoria) {
        return;
    }

    subcategoriaActiva = subcategoria;

    // Marcar botón activo
    document.querySelectorAll('.subcategory-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const botonActivo = document.querySelector(`.subcategory-btn[data-id="${idSubcategoria}"]`);
    if (botonActivo) {
        botonActivo.classList.add('active');
    }

    renderizarProductos(subcategoria.items || [], subcategoria);
}

/* ============================================================
   RENDERIZAR PRODUCTOS
   ============================================================ */

function renderizarProductos(items, subcategoria = null) {
    const contenedorMenu = document.getElementById('menu-container');
    contenedorMenu.innerHTML = '';

    if (!items || items.length === 0) {
        contenedorMenu.innerHTML = `
            <div class="empty-state">
                No hay productos disponibles en esta sección.
            </div>
        `;
        return;
    }

    const tituloSeccion = document.createElement('div');
    tituloSeccion.classList.add('menu-section-title');

    tituloSeccion.innerHTML = `
        <h3>${subcategoria ? subcategoria.nombre : 'Productos disponibles'}</h3>
        <p>${subcategoria && subcategoria.descripcion ? subcategoria.descripcion : 'Selecciona un producto para ver más detalles.'}</p>
    `;

    const grillaProductos = document.createElement('div');
    grillaProductos.classList.add('products-grid');

    items.forEach((item, index) => {
        const tarjetaProducto = document.createElement('article');
        tarjetaProducto.classList.add('product-card');

        // Cada tercer producto puede ocupar más espacio en pantallas grandes
        if (index % 5 === 2) {
            tarjetaProducto.classList.add('featured');
        }

        const precioFormateado = formatearPrecio(item.precio);

        const imagenHtml = item.imagen && item.imagen.trim() !== ''
            ? `
                <div class="product-image-wrap">
                    <img src="${item.imagen}" alt="${item.nombre}" class="product-image">
                </div>
            `
            : '';

        const descripcionHtml = item.descripcion && item.descripcion.trim() !== ''
            ? `<p class="product-description">${item.descripcion}</p>`
            : '';

        const tagsHtml = item.tags && item.tags.length > 0
            ? `
                <div class="product-tags">
                    ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            `
            : '';

        tarjetaProducto.innerHTML = `
            <div class="product-card-inner">
                <div class="product-info">
                    <h4 class="product-name">${item.nombre}</h4>
                    ${descripcionHtml}
                </div>

                ${imagenHtml}
            </div>

            <div class="product-footer">
                <div>
                    ${tagsHtml}
                    <div class="product-price">${precioFormateado}</div>
                </div>

                <div class="add-btn">
                    <i class="fa-solid fa-plus"></i>
                </div>
            </div>
        `;

        tarjetaProducto.addEventListener('click', () => {
            tarjetaProducto.classList.toggle('open');
        });

        grillaProductos.appendChild(tarjetaProducto);
    });

    contenedorMenu.appendChild(tituloSeccion);
    contenedorMenu.appendChild(grillaProductos);
}

/* ============================================================
   FORMATEAR PRECIO
   ============================================================ */

function formatearPrecio(precio) {
    if (precio === null || precio === undefined || precio === '') {
        return 'Consultar';
    }

    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(precio);
}
