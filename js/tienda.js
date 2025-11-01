// ===== TIENDA - JAVASCRIPT COMPLETO CON CHECKOUT REALISTA =====

class TiendaManager {
    constructor() {
        this.carrito = JSON.parse(localStorage.getItem('tiendaCarrito')) || [];
        this.productos = [
            {
                id: 1,
                nombre: "Playera Tlatolli Studios",
                precio: 350,
                categoria: "ropa",
                descripcion: "Playera de algodón premium con diseño exclusivo inspirado en nuestra cultura mexicana. Disponible en tallas S, M, L, XL.",
                imagen: "../img/product1.jpg",
                stock: 10,
                detalles: {
                    material: "Algodón 100%",
                    tallas: ["S", "M", "L", "XL"],
                    colores: ["Negro", "Blanco", "Rojo Mexicano"],
                    cuidado: "Lavable a máquina"
                }
            },
            {
                id: 2,
                nombre: "Poster Arte Conceptual",
                precio: 200,
                categoria: "arte", 
                descripcion: "Poster de alta calidad 50x70 cm con arte exclusivo del juego Tonalli Ometeotl. Impresión premium en papel mate.",
                imagen: "../img/product2.jpg",
                stock: 15,
                detalles: {
                    tamaño: "50x70 cm",
                    material: "Papel mate premium",
                    tipo: "Impresión digital",
                    incluye: "Tube protector para envío"
                }
            },
            {
                id: 3,
                nombre: "Pack de Stickers",
                precio: 120,
                categoria: "accesorios",
                descripcion: "Set de 5 stickers exclusivos con diseños de nuestros personajes y símbolos culturales. Resistentes al agua y UV.",
                imagen: null,
                stock: 25,
                detalles: {
                    cantidad: "5 stickers",
                    material: "Vinilo premium",
                    tamaño: "5x5 cm cada uno",
                    caracteristicas: "Resistente al agua y UV"
                }
            },
            {
                id: 4,
                nombre: "Taza Cerámica Premium", 
                precio: 180,
                categoria: "accesorios",
                descripcion: "Taza de cerámica de alta calidad con logo grabado y diseño exclusivo de Tlatolli Studios. Capacidad 350ml.",
                imagen: null,
                stock: 8,
                detalles: {
                    capacidad: "350 ml",
                    material: "Cerámica de alta calidad",
                    caracteristicas: "Apta lavavajillas y microondas",
                    diseño: "Grabado permanente"
                }
            }
        ];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.actualizarCarritoUI();
        this.setupFiltros();
        this.setupImageLoading();
    }

    setupEventListeners() {
        // Carrito flotante
        document.getElementById('cartFloating').addEventListener('click', () => this.mostrarCarrito());
        document.getElementById('closeCart').addEventListener('click', () => this.ocultarCarrito());
        
        // Botones de agregar al carrito
        document.querySelectorAll('.tienda-add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('button').dataset.productId);
                this.agregarAlCarrito(productId);
            });
        });

        // Botones de vista rápida
        document.querySelectorAll('.tienda-quick-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('button').dataset.productId);
                this.mostrarVistaRapida(productId);
            });
        });

        // Cerrar vista rápida
        document.getElementById('closeQuickview').addEventListener('click', () => this.ocultarVistaRapida());

        // Checkout
        document.getElementById('checkoutBtn').addEventListener('click', () => this.mostrarCheckout());

        // Cerrar modales al hacer click fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tienda-cart-modal')) {
                this.ocultarCarrito();
            }
            if (e.target.classList.contains('tienda-quickview-modal')) {
                this.ocultarVistaRapida();
            }
            if (e.target.classList.contains('tienda-checkout-modal')) {
                this.ocultarCheckout();
            }
        });

        // Newsletter
        document.querySelector('.tienda-newsletter-btn').addEventListener('click', () => this.suscribirNewsletter());
    }

    setupFiltros() {
        document.querySelectorAll('.tienda-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filtro = e.target.dataset.filter;
                this.aplicarFiltro(filtro);
                
                document.querySelectorAll('.tienda-filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    setupImageLoading() {
        this.productos.forEach(producto => {
            if (producto.imagen) {
                const img = new Image();
                img.src = producto.imagen;
            }
        });

        document.querySelectorAll('.tienda-product-image img').forEach(img => {
            img.addEventListener('error', () => {
                img.style.display = 'none';
                const placeholder = img.parentElement.querySelector('.tienda-image-placeholder') || 
                                  this.crearPlaceholder(img.alt);
                if (!img.parentElement.querySelector('.tienda-image-placeholder')) {
                    img.parentElement.appendChild(placeholder);
                }
                img.parentElement.classList.remove('loading');
            });
        });
    }

    crearPlaceholder(altText) {
        const placeholder = document.createElement('div');
        placeholder.className = 'tienda-image-placeholder';
        
        let icon = 'fas fa-box';
        if (altText.toLowerCase().includes('playera')) icon = 'fas fa-tshirt';
        if (altText.toLowerCase().includes('poster')) icon = 'fas fa-image';
        if (altText.toLowerCase().includes('sticker')) icon = 'fas fa-sticky-note';
        if (altText.toLowerCase().includes('taza')) icon = 'fas fa-mug-hot';
        
        placeholder.innerHTML = `
            <i class="${icon}"></i>
            <span>${altText}</span>
        `;
        return placeholder;
    }

    aplicarFiltro(filtro) {
        const productos = document.querySelectorAll('.tienda-product-card');
        
        productos.forEach(producto => {
            if (filtro === 'all' || producto.dataset.category === filtro) {
                producto.style.display = 'block';
                producto.style.animation = 'fadeInUp 0.5s ease-out';
            } else {
                producto.style.display = 'none';
            }
        });
    }

    agregarAlCarrito(productId) {
        const producto = this.productos.find(p => p.id === productId);
        if (!producto) return;

        const itemExistente = this.carrito.find(item => item.id === productId);
        
        if (itemExistente) {
            if (itemExistente.cantidad < producto.stock) {
                itemExistente.cantidad++;
            } else {
                this.mostrarNotificacion(`❌ No hay suficiente stock de ${producto.nombre}`, 'error');
                return;
            }
        } else {
            this.carrito.push({
                ...producto,
                cantidad: 1
            });
        }

        this.guardarCarrito();
        this.actualizarCarritoUI();
        this.mostrarNotificacion(`✅ ${producto.nombre} agregado al carrito`);
        
        const btn = document.querySelector(`[data-product-id="${productId}"]`);
        btn.classList.add('added');
        setTimeout(() => btn.classList.remove('added'), 1000);
    }

    removerDelCarrito(productId) {
        this.carrito = this.carrito.filter(item => item.id !== productId);
        this.guardarCarrito();
        this.actualizarCarritoUI();
        this.mostrarNotificacion('🗑️ Producto removido del carrito');
    }

    actualizarCantidad(productId, nuevaCantidad) {
        const item = this.carrito.find(item => item.id === productId);
        if (item && nuevaCantidad > 0 && nuevaCantidad <= this.productos.find(p => p.id === productId).stock) {
            item.cantidad = nuevaCantidad;
            this.guardarCarrito();
            this.actualizarCarritoUI();
        }
    }

    guardarCarrito() {
        localStorage.setItem('tiendaCarrito', JSON.stringify(this.carrito));
    }

    actualizarCarritoUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const cartEmpty = document.getElementById('cartEmpty');

        const totalItems = this.carrito.reduce((sum, item) => sum + item.cantidad, 0);
        cartCount.textContent = totalItems;

        if (this.carrito.length === 0) {
            cartEmpty.style.display = 'block';
            cartItems.innerHTML = '';
            cartItems.appendChild(cartEmpty);
        } else {
            cartEmpty.style.display = 'none';
            cartItems.innerHTML = this.carrito.map(item => `
                <div class="tienda-cart-item">
                    <div class="tienda-cart-item-image">
                        ${item.imagen ? 
                            `<img src="${item.imagen}" alt="${item.nombre}" onerror="this.style.display='none'">` : 
                            `<div class="tienda-image-placeholder" style="width: 60px; height: 60px;">
                                <i class="fas fa-box"></i>
                            </div>`
                        }
                    </div>
                    <div class="tienda-cart-item-info">
                        <div class="tienda-cart-item-name">${item.nombre}</div>
                        <div class="tienda-cart-item-price">$${item.precio} MXN</div>
                    </div>
                    <div class="tienda-cart-item-quantity">
                        <button class="tienda-quantity-btn" onclick="tienda.actualizarCantidad(${item.id}, ${item.cantidad - 1})">-</button>
                        <span>${item.cantidad}</span>
                        <button class="tienda-quantity-btn" onclick="tienda.actualizarCantidad(${item.id}, ${item.cantidad + 1})">+</button>
                    </div>
                    <button class="tienda-cart-item-remove" onclick="tienda.removerDelCarrito(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }

        const total = this.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        cartTotal.textContent = `$${total} MXN`;
    }

    mostrarCarrito() {
        document.getElementById('cartModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    ocultarCarrito() {
        document.getElementById('cartModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    mostrarVistaRapida(productId) {
        const producto = this.productos.find(p => p.id === productId);
        if (!producto) return;

        const modalBody = document.getElementById('quickviewBody');
        modalBody.innerHTML = `
            <div class="tienda-quickview-product">
                <div class="tienda-quickview-image">
                    ${producto.imagen ? 
                        `<img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.style.display='none'">` : 
                        `<div class="tienda-image-placeholder" style="height: 300px;">
                            <i class="fas fa-box"></i>
                            <span>${producto.nombre}</span>
                        </div>`
                    }
                </div>
                <div class="tienda-quickview-info">
                    <h3>${producto.nombre}</h3>
                    <div class="tienda-quickview-price">$${producto.precio} MXN</div>
                    <p class="tienda-quickview-description">${producto.descripcion}</p>
                    
                    <div class="tienda-product-details">
                        <h4>Detalles del Producto:</h4>
                        <ul>
                            ${Object.entries(producto.detalles || {}).map(([key, value]) => `
                                <li><strong>${this.capitalize(key)}:</strong> ${Array.isArray(value) ? value.join(', ') : value}</li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="tienda-quickview-stock">
                        <i class="fas fa-box"></i>
                        ${producto.stock} disponibles
                    </div>
                    <button class="tienda-add-to-cart large" onclick="tienda.agregarAlCarrito(${producto.id}); tienda.ocultarVistaRapida()">
                        <i class="fas fa-cart-plus"></i>
                        Agregar al Carrito
                    </button>
                </div>
            </div>
        `;

        document.getElementById('quickviewModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    ocultarVistaRapida() {
        document.getElementById('quickviewModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // NUEVO: Sistema de Checkout Realista
    mostrarCheckout() {
        if (this.carrito.length === 0) {
            this.mostrarNotificacion('🛒 Tu carrito está vacío', 'error');
            return;
        }

        const total = this.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        const envio = total > 500 ? 0 : 50; // Envío gratis sobre $500
        const totalFinal = total + envio;

        const checkoutHTML = `
            <div class="tienda-checkout-content">
                <div class="tienda-checkout-header">
                    <h3>🎯 Finalizar Compra</h3>
                    <button class="tienda-checkout-close" onclick="tienda.ocultarCheckout()">&times;</button>
                </div>
                
                <div class="tienda-checkout-steps">
                    <div class="tienda-step active" data-step="1">
                        <span>1</span>
                        Información de Envío
                    </div>
                    <div class="tienda-step" data-step="2">
                        <span>2</span>
                        Método de Pago
                    </div>
                    <div class="tienda-step" data-step="3">
                        <span>3</span>
                        Confirmación
                    </div>
                </div>

                <div class="tienda-checkout-body">
                    <!-- Paso 1: Información de Envío -->
                    <div class="tienda-checkout-step" id="step1">
                        <h4>📦 Información de Envío</h4>
                        <form id="shippingForm" class="tienda-checkout-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Nombre completo *</label>
                                    <input type="text" name="nombre" required placeholder="Juan Pérez Hernández">
                                </div>
                                <div class="form-group">
                                    <label>Email *</label>
                                    <input type="email" name="email" required placeholder="juan@ejemplo.com">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Dirección *</label>
                                <input type="text" name="direccion" required placeholder="Calle Principal #123">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Ciudad *</label>
                                    <input type="text" name="ciudad" required placeholder="Ciudad de México">
                                </div>
                                <div class="form-group">
                                    <label>Código Postal *</label>
                                    <input type="text" name="cp" required placeholder="01000" pattern="[0-9]{5}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Teléfono *</label>
                                <input type="tel" name="telefono" required placeholder="55 1234 5678">
                            </div>
                            <div class="form-group">
                                <label>Instrucciones especiales (opcional)</label>
                                <textarea name="instrucciones" placeholder="Instrucciones para la entrega..."></textarea>
                            </div>
                        </form>
                    </div>

                    <!-- Paso 2: Método de Pago -->
                    <div class="tienda-checkout-step" id="step2" style="display: none;">
                        <h4>💳 Método de Pago</h4>
                        <div class="tienda-payment-methods">
                            <label class="tienda-payment-method">
                                <input type="radio" name="paymentMethod" value="tarjeta" checked>
                                <div class="tienda-payment-card">
                                    <i class="fas fa-credit-card"></i>
                                    <span>Tarjeta de Crédito/Débito</span>
                                </div>
                            </label>
                            <label class="tienda-payment-method">
                                <input type="radio" name="paymentMethod" value="paypal">
                                <div class="tienda-payment-card">
                                    <i class="fab fa-paypal"></i>
                                    <span>PayPal</span>
                                </div>
                            </label>
                            <label class="tienda-payment-method">
                                <input type="radio" name="paymentMethod" value="transferencia">
                                <div class="tienda-payment-card">
                                    <i class="fas fa-university"></i>
                                    <span>Transferencia Bancaria</span>
                                </div>
                            </label>
                        </div>

                        <div class="tienda-payment-details" id="paymentDetails">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Número de Tarjeta *</label>
                                    <input type="text" placeholder="1234 5678 9012 3456" pattern="[0-9\s]{13,19}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Fecha de Expiración *</label>
                                    <input type="text" placeholder="MM/AA" pattern="(0[1-9]|1[0-2])\/[0-9]{2}">
                                </div>
                                <div class="form-group">
                                    <label>CVV *</label>
                                    <input type="text" placeholder="123" pattern="[0-9]{3}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Nombre en la Tarjeta *</label>
                                <input type="text" placeholder="JUAN PEREZ">
                            </div>
                        </div>
                    </div>

                    <!-- Paso 3: Resumen -->
                    <div class="tienda-checkout-step" id="step3" style="display: none;">
                        <h4>✅ Resumen del Pedido</h4>
                        <div class="tienda-order-summary">
                            <div class="tienda-order-items">
                                ${this.carrito.map(item => `
                                    <div class="tienda-order-item">
                                        <span>${item.nombre} x${item.cantidad}</span>
                                        <span>$${item.precio * item.cantidad} MXN</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="tienda-order-totals">
                                <div class="tienda-order-line">
                                    <span>Subtotal:</span>
                                    <span>$${total} MXN</span>
                                </div>
                                <div class="tienda-order-line">
                                    <span>Envío:</span>
                                    <span>${envio === 0 ? 'GRATIS' : `$${envio} MXN`}</span>
                                </div>
                                <div class="tienda-order-line total">
                                    <span>Total:</span>
                                    <span>$${totalFinal} MXN</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tienda-shipping-info">
                            <h5>📬 Información de Envío:</h5>
                            <div id="shippingPreview"></div>
                        </div>

                        <div class="tienda-checkout-actions">
                            <button class="tienda-btn-secondary" onclick="tienda.regresarPaso(2)">
                                ← Regresar
                            </button>
                            <button class="tienda-btn-primary" onclick="tienda.procesarPago()">
                                <i class="fas fa-lock"></i>
                                Confirmar y Pagar
                            </button>
                        </div>
                    </div>
                </div>

                <div class="tienda-checkout-footer">
                    <div class="tienda-checkout-actions">
                        <button class="tienda-btn-secondary" id="prevStep" style="display: none;" onclick="tienda.regresarPaso()">
                            ← Anterior
                        </button>
                        <button class="tienda-btn-primary" id="nextStep" onclick="tienda.siguientePaso()">
                            Siguiente →
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Crear modal de checkout
        if (!document.getElementById('checkoutModal')) {
            const modal = document.createElement('div');
            modal.id = 'checkoutModal';
            modal.className = 'tienda-checkout-modal';
            modal.innerHTML = checkoutHTML;
            document.body.appendChild(modal);
        }

        document.getElementById('checkoutModal').style.display = 'block';
        document.body.style.overflow = 'hidden';
        this.pasoActual = 1;
        this.actualizarNavegacion();
    }

    ocultarCheckout() {
        if (document.getElementById('checkoutModal')) {
            document.getElementById('checkoutModal').style.display = 'none';
        }
        document.body.style.overflow = 'auto';
    }

    siguientePaso() {
        if (this.pasoActual === 1) {
            if (!this.validarPaso1()) return;
            this.guardarInfoEnvio();
        } else if (this.pasoActual === 2) {
            if (!this.validarPaso2()) return;
        }

        this.pasoActual++;
        this.actualizarNavegacion();
    }

    regresarPaso(pasoEspecifico = null) {
        this.pasoActual = pasoEspecifico || this.pasoActual - 1;
        this.actualizarNavegacion();
    }

    actualizarNavegacion() {
        // Ocultar todos los pasos
        document.querySelectorAll('.tienda-checkout-step').forEach(step => {
            step.style.display = 'none';
        });

        // Mostrar paso actual
        document.getElementById(`step${this.pasoActual}`).style.display = 'block';

        // Actualizar steps
        document.querySelectorAll('.tienda-step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 === this.pasoActual);
            step.classList.toggle('completed', index + 1 < this.pasoActual);
        });

        // Actualizar botones
        const prevBtn = document.getElementById('prevStep');
        const nextBtn = document.getElementById('nextStep');

        prevBtn.style.display = this.pasoActual > 1 ? 'block' : 'none';
        
        if (this.pasoActual === 3) {
            nextBtn.style.display = 'none';
            this.mostrarResumen();
        } else {
            nextBtn.style.display = 'block';
            nextBtn.textContent = this.pasoActual === 2 ? 'Revisar Pedido →' : 'Siguiente →';
        }
    }

    validarPaso1() {
        const form = document.getElementById('shippingForm');
        const required = form.querySelectorAll('[required]');
        let valido = true;

        required.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = '#ff6b6b';
                valido = false;
            } else {
                input.style.borderColor = '';
            }
        });

        if (!valido) {
            this.mostrarNotificacion('❌ Por favor completa todos los campos requeridos', 'error');
        }

        return valido;
    }

    validarPaso2() {
        const metodoPago = document.querySelector('input[name="paymentMethod"]:checked').value;
        
        if (metodoPago === 'tarjeta') {
            const inputs = document.querySelectorAll('#paymentDetails input[required]');
            let valido = true;

            inputs.forEach(input => {
                if (!input.value.trim() || !input.checkValidity()) {
                    input.style.borderColor = '#ff6b6b';
                    valido = false;
                } else {
                    input.style.borderColor = '';
                }
            });

            if (!valido) {
                this.mostrarNotificacion('❌ Por favor completa correctamente la información de pago', 'error');
                return false;
            }
        }

        return true;
    }

    guardarInfoEnvio() {
        const form = document.getElementById('shippingForm');
        this.infoEnvio = {
            nombre: form.nombre.value,
            email: form.email.value,
            direccion: form.direccion.value,
            ciudad: form.ciudad.value,
            cp: form.cp.value,
            telefono: form.telefono.value,
            instrucciones: form.instrucciones.value
        };
    }

    mostrarResumen() {
        const shippingPreview = document.getElementById('shippingPreview');
        shippingPreview.innerHTML = `
            <p><strong>${this.infoEnvio.nombre}</strong></p>
            <p>${this.infoEnvio.direccion}</p>
            <p>${this.infoEnvio.ciudad}, CP: ${this.infoEnvio.cp}</p>
            <p>📞 ${this.infoEnvio.telefono}</p>
            <p>📧 ${this.infoEnvio.email}</p>
            ${this.infoEnvio.instrucciones ? `<p><strong>Instrucciones:</strong> ${this.infoEnvio.instrucciones}</p>` : ''}
        `;
    }

    async procesarPago() {
        const metodoPago = document.querySelector('input[name="paymentMethod"]:checked').value;
        const total = this.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        const envio = total > 500 ? 0 : 50;
        const totalFinal = total + envio;

        // Mostrar loading
        const confirmBtn = document.querySelector('.tienda-btn-primary');
        const originalText = confirmBtn.innerHTML;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        confirmBtn.disabled = true;

        try {
            // Simular procesamiento de pago
            await this.simularProcesamientoPago(metodoPago);

            // Generar comprobante
            this.generarComprobante(totalFinal);

            // Limpiar carrito
            this.carrito = [];
            this.guardarCarrito();
            this.actualizarCarritoUI();

            // Mostrar mensaje de éxito
            this.mostrarNotificacion('🎉 ¡Pago procesado exitosamente! Revisa tu email para el comprobante.', 'success');

            // Cerrar modales
            this.ocultarCheckout();
            this.ocultarCarrito();

        } catch (error) {
            this.mostrarNotificacion('❌ Error al procesar el pago. Intenta nuevamente.', 'error');
        } finally {
            confirmBtn.innerHTML = originalText;
            confirmBtn.disabled = false;
        }
    }

    simularProcesamientoPago(metodo) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simular fallo aleatorio (10% de probabilidad)
                if (Math.random() < 0.1) {
                    reject(new Error('Error de procesamiento'));
                } else {
                    resolve();
                }
            }, 3000);
        });
    }

    generarComprobante(total) {
        const numeroPedido = 'TL' + Date.now().toString().slice(-6);
        const fecha = new Date().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const comprobanteHTML = `
            <div class="tienda-comprobante">
                <div class="tienda-comprobante-header">
                    <img src="../img/logo.png" alt="Tlatolli Studios" style="height: 50px;">
                    <h2>Comprobante de Compra</h2>
                    <div class="tienda-comprobante-numero">Pedido #${numeroPedido}</div>
                </div>
                
                <div class="tienda-comprobante-body">
                    <div class="tienda-comprobante-info">
                        <div>
                            <h4>Información del Cliente</h4>
                            <p><strong>Nombre:</strong> ${this.infoEnvio.nombre}</p>
                            <p><strong>Email:</strong> ${this.infoEnvio.email}</p>
                            <p><strong>Teléfono:</strong> ${this.infoEnvio.telefono}</p>
                        </div>
                        <div>
                            <h4>Dirección de Envío</h4>
                            <p>${this.infoEnvio.direccion}</p>
                            <p>${this.infoEnvio.ciudad}, CP: ${this.infoEnvio.cp}</p>
                            <p><strong>Fecha:</strong> ${fecha}</p>
                        </div>
                    </div>

                    <div class="tienda-comprobante-items">
                        <h4>Productos</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.carrito.map(item => `
                                    <tr>
                                        <td>${item.nombre}</td>
                                        <td>${item.cantidad}</td>
                                        <td>$${item.precio} MXN</td>
                                        <td>$${item.precio * item.cantidad} MXN</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="tienda-comprobante-total">
                        <div class="tienda-total-line">
                            <span>Subtotal:</span>
                            <span>$${this.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)} MXN</span>
                        </div>
                        <div class="tienda-total-line">
                            <span>Envío:</span>
                            <span>${total > 500 ? 'GRATIS' : '$50 MXN'}</span>
                        </div>
                        <div class="tienda-total-line final">
                            <span>Total:</span>
                            <span>$${total} MXN</span>
                        </div>
                    </div>

                    <div class="tienda-comprobante-footer">
                        <p><strong>¡Gracias por tu compra!</strong></p>
                        <p>Tu pedido será procesado y enviado en un plazo de 2-3 días hábiles.</p>
                        <p>Recibirás un correo con el número de seguimiento cuando tu pedido sea enviado.</p>
                    </div>
                </div>
            </div>
        `;

        // Crear ventana de comprobante
        const comprobanteWindow = window.open('', '_blank');
        comprobanteWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Comprobante de Compra - Tlatolli Studios</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    .tienda-comprobante { max-width: 800px; margin: 0 auto; border: 2px solid #73C2FB; border-radius: 10px; padding: 30px; }
                    .tienda-comprobante-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; }
                    .tienda-comprobante-numero { background: #69C777; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin-top: 10px; }
                    .tienda-comprobante-info { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background: #f8f9fa; }
                    .tienda-comprobante-total { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
                    .tienda-total-line { display: flex; justify-content: space-between; margin-bottom: 10px; }
                    .tienda-total-line.final { font-size: 1.2em; font-weight: bold; border-top: 2px solid #73C2FB; padding-top: 10px; }
                    .tienda-comprobante-footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0; }
                    @media print { body { margin: 0; } .tienda-comprobante { border: none; box-shadow: none; } }
                </style>
            </head>
            <body>
                ${comprobanteHTML}
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="window.print()" style="background: #73C2FB; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 10px;">
                        🖨️ Imprimir Comprobante
                    </button>
                    <button onclick="window.close()" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 10px;">
                        ❌ Cerrar
                    </button>
                </div>
            </body>
            </html>
        `);
        comprobanteWindow.document.close();
    }

    suscribirNewsletter() {
        const input = document.querySelector('.tienda-newsletter-input');
        const email = input.value.trim();
        
        if (!email || !this.validarEmail(email)) {
            this.mostrarNotificacion('📧 Por favor ingresa un email válido', 'error');
            return;
        }

        this.mostrarNotificacion('📩 ¡Te has suscrito exitosamente a nuestro newsletter!', 'success');
        input.value = '';
    }

    validarEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    mostrarNotificacion(mensaje, tipo = 'success') {
        const notificacion = document.createElement('div');
        notificacion.className = `tienda-notification ${tipo}`;
        notificacion.innerHTML = `
            <span>${mensaje}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        notificacion.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${tipo === 'error' ? '#ff6b6b' : tipo === 'info' ? '#4fc3f7' : '#69c777'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 3000;
            display: flex;
            align-items: center;
            gap: 15px;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notificacion);

        setTimeout(() => {
            if (notificacion.parentElement) {
                notificacion.remove();
            }
        }, 3000);
    }
}

// Inicializar tienda
document.addEventListener('DOMContentLoaded', () => {
    window.tienda = new TiendaManager();
});

// Agregar estilos CSS para el checkout
const checkoutStyles = document.createElement('style');
checkoutStyles.textContent = `
    .tienda-checkout-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 2000;
        backdrop-filter: blur(5px);
    }

    .tienda-checkout-content {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--white-color);
        border-radius: 20px;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .tienda-checkout-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 25px 30px;
        border-bottom: 2px solid #f0f0f0;
    }

    .tienda-checkout-header h3 {
        color: var(--primary-color);
        margin: 0;
        font-size: 1.5rem;
    }

    .tienda-checkout-close {
        background: none;
        border: none;
        font-size: 2rem;
        cursor: pointer;
        color: #666;
    }

    .tienda-checkout-steps {
        display: flex;
        justify-content: space-between;
        padding: 20px 30px;
        border-bottom: 1px solid #f0f0f0;
    }

    .tienda-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        color: #999;
        flex: 1;
        position: relative;
    }

    .tienda-step::before {
        content: '';
        position: absolute;
        top: 20px;
        left: 50%;
        right: -50%;
        height: 2px;
        background: #f0f0f0;
        z-index: 1;
    }

    .tienda-step:last-child::before {
        display: none;
    }

    .tienda-step span {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        position: relative;
        z-index: 2;
    }

    .tienda-step.active {
        color: var(--primary-color);
    }

    .tienda-step.active span {
        background: var(--primary-color);
        color: white;
    }

    .tienda-step.completed {
        color: var(--success-color);
    }

    .tienda-step.completed span {
        background: var(--success-color);
        color: white;
    }

    .tienda-checkout-body {
        padding: 30px;
    }

    .tienda-checkout-step h4 {
        color: var(--dark-color);
        margin-bottom: 20px;
        font-size: 1.3rem;
    }

    .tienda-checkout-form .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
    }

    .tienda-checkout-form .form-group {
        margin-bottom: 20px;
    }

    .tienda-checkout-form label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: var(--dark-color);
    }

    .tienda-checkout-form input,
    .tienda-checkout-form textarea {
        width: 100%;
        padding: 12px 15px;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
    }

    .tienda-checkout-form input:focus,
    .tienda-checkout-form textarea:focus {
        outline: none;
        border-color: var(--primary-color);
    }

    .tienda-payment-methods {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 25px;
    }

    .tienda-payment-method {
        cursor: pointer;
    }

    .tienda-payment-method input {
        display: none;
    }

    .tienda-payment-card {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px 20px;
        border: 2px solid #e9ecef;
        border-radius: 10px;
        transition: all 0.3s ease;
    }

    .tienda-payment-method input:checked + .tienda-payment-card {
        border-color: var(--primary-color);
        background: rgba(115, 194, 251, 0.1);
    }

    .tienda-payment-card i {
        font-size: 1.5rem;
        color: var(--primary-color);
    }

    .tienda-payment-card span {
        font-weight: 600;
    }

    .tienda-payment-details {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 10px;
        margin-top: 20px;
    }

    .tienda-order-summary {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 25px;
    }

    .tienda-order-item {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #e9ecef;
    }

    .tienda-order-totals {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 2px solid #e9ecef;
    }

    .tienda-order-line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
    }

    .tienda-order-line.total {
        font-weight: bold;
        font-size: 1.2rem;
        color: var(--primary-color);
    }

    .tienda-shipping-info {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 25px;
    }

    .tienda-checkout-actions {
        display: flex;
        gap: 15px;
        justify-content: space-between;
    }

    .tienda-btn-primary,
    .tienda-btn-secondary {
        padding: 15px 25px;
        border: none;
        border-radius: 50px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        flex: 1;
    }

    .tienda-btn-primary {
        background: linear-gradient(45deg, var(--success-color), var(--primary-color));
        color: white;
    }

    .tienda-btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(105, 199, 119, 0.3);
    }

    .tienda-btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .tienda-btn-secondary {
        background: #f8f9fa;
        color: var(--dark-color);
        border: 2px solid #e9ecef;
    }

    .tienda-btn-secondary:hover {
        background: #e9ecef;
    }

    .tienda-checkout-footer {
        padding: 20px 30px;
        border-top: 2px solid #f0f0f0;
    }

    .tienda-product-details {
        margin: 20px 0;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 10px;
    }

    .tienda-product-details h4 {
        margin-bottom: 10px;
        color: var(--dark-color);
    }

    .tienda-product-details ul {
        list-style: none;
        padding: 0;
    }

    .tienda-product-details li {
        padding: 5px 0;
        border-bottom: 1px solid #e9ecef;
    }

    .tienda-product-details li:last-child {
        border-bottom: none;
    }

    @media (max-width: 768px) {
        .tienda-checkout-content {
            width: 95%;
            height: 95vh;
        }

        .tienda-checkout-steps {
            padding: 15px 20px;
        }

        .tienda-step {
            font-size: 0.8rem;
        }

        .tienda-step span {
            width: 35px;
            height: 35px;
        }

        .tienda-checkout-body {
            padding: 20px;
        }

        .tienda-checkout-form .form-row {
            grid-template-columns: 1fr;
        }

        .tienda-checkout-actions {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(checkoutStyles);