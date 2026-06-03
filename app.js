// ==========================================================================
// LÓGICA PRINCIPAL - MUSA GASTROBAR
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    inicializarMenu();
});

/**
 * Función principal que carga los datos del archivo JSON y renderiza la interfaz
 */
async function inicializarMenu() {
    const containerMenu = document.getElementById('menu-container');
    const containerNav = document.getElementById('categories-nav');

    try {
        // 1. Simular la carga o leer el archivo local menu.json
        const respuesta = await fetch('menu.json');
        
        if (!respuesta.ok) {
            throw new Error('No se pudo cargar el archivo de menú');
        }

        const datos = await respuesta.json();
        
        // Limpiar el mensaje de "Cargando..."
        containerMenu.innerHTML = '';
        containerNav.innerHTML = '';

        // 2. Recorrer las categorías del JSON para pintar la barra de navegación y los platos/tragos
        datos.categories.forEach((categoria, index) => {
            
            // --- A. CREAR BOTÓN DE NAVEGACIÓN HORIZONTAL ---
            const botonNav = document.createElement('button');
            botonNav.classList.add('category-btn');
            if (index === 0) botonNav.classList.add('active'); // El primero inicia activo
            botonNav.textContent = categoria.nombre;
            
            // Evento al hacer clic en la categoría (Scroll automático)
            botonNav.addEventListener('click', (e) => {
                // Quitar clase activa a todos y ponérsela al presionado
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                botonNav.classList.add('active');

                // Hacer scroll suave hasta la sección correspondiente
                const seccionDestino = document.getElementById(`sec-${categoria.id}`);
                seccionDestino.scrollIntoView({ behavior: 'smooth' });
            });

            containerNav.appendChild(botonNav);


            // --- B. CREAR SECCIÓN DE CONTENIDO ---
            const seccionHtml = document.createElement('section');
            seccionHtml.id = `sec-${categoria.id}`;
            seccionHtml.classList.add('menu-section');

            // Título de la sección (ej. COCTELERÍA DE LA CASA)
            const tituloSeccion = document.createElement('h2');
            tituloSeccion.classList.add('section-title');
            tituloSeccion.textContent = categoria.nombre;
            seccionHtml.appendChild(tituloSeccion);

            // Recorrer los items (tragos/comidas) de esta categoría
            categoria.items.forEach(item => {
                const tarjetaItem = document.createElement('div');
                tarjetaItem.classList.add('menu-item');

                // Formatear el precio con puntos de miles estilo CLP (ej: $12.000)
                const precioFormateado = new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP',
                    minimumFractionDigits: 0
                }).format(item.precio);

                // Construir la estructura interna de la tarjeta
                let descripcionHtml = item.descripcion ? `<p class="item-description">${item.descripcion}</p>` : '';
                
                // Generar las etiquetas (tags) si existen
                let tagsHtml = '';
                if (item.tags && item.tags.length > 0) {
                    tagsHtml = `<div class="item-tags">`;
                    item.tags.forEach(tag => {
                        tagsHtml += `<span class="tag">${tag}</span>`;
                    });
                    tagsHtml += `</div>`;
                }

                tarjetaItem.innerHTML = `
                    <div class="item-header">
                        <span class="item-name">${item.nombre}</span>
                        <span class="item-price">${precioFormateado}</span>
                    </div>
                    ${descripcionHtml}
                    ${tagsHtml}
                `;
                // --- EVENTO DE CLIC PARA EL ACORDEÓN INTERACTIVO ---
                tarjetaItem.addEventListener('click', () => {
                    // Opcional: si quieres que se cierre la tarjeta anterior al abrir una nueva, descomenta la línea de abajo:
                    // document.querySelectorAll('.menu-item').forEach(item => { if(item !== tarjetaItem) item.classList.remove('open'); });
                    
                    tarjetaItem.classList.toggle('open');
                });

                seccionHtml.appendChild(tarjetaItem);
            });

            containerMenu.appendChild(seccionHtml);
        });

        // Lógica extra: Cambiar el botón activo de la barra superior según el usuario hace scroll manual
        configurarScrollSpy();

    } catch (error) {
        console.error('Error al inicializar la app:', error);
        containerMenu.innerHTML = `<div class="loading" style="color: #ff4d4d;">Error al cargar el menú. Por favor, reintenta más tarde.</div>`;
    }
}

/**
 * Detecta qué sección está viendo el cliente para iluminar el botón correcto arriba automáticamente
 */
function configurarScrollSpy() {
    const secciones = document.querySelectorAll('.menu-section');
    const botones = document.querySelectorAll('.category-btn');

    window.addEventListener('scroll', () => {
        let seccionActualId = "";
        
        secciones.forEach(seccion => {
            const seccionTop = seccion.offsetTop;
            // Se le resta 100 píxeles para detectar el cambio un poco antes de llegar al tope
            if (pageYOffset >= seccionTop - 120) {
                seccionActualId = seccion.getAttribute('id');
            }
        });

        botones.forEach(boton => {
            boton.classList.remove('active');
            // Si el botón está enlazado a la sección actual, se activa
            const idFormateado = `sec-${boton.textContent.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
            // Una forma más directa emparejando por el orden de los elementos:
        });
        
        // Emparejamiento simplificado por índice para evitar fallos de texto
        secciones.forEach((seccion, index) => {
            const rect = seccion.getBoundingClientRect();
            if (rect.top <= 150 && rect.bottom >= 150) {
                botones.forEach(btn => btn.classList.remove('active'));
                if(botones[index]) botones[index].classList.add('active');
            }
        });
    });
}