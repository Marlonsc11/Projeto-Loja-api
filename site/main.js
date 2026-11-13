/**
 * ============================================================================
 * MAIN.JS - STREETWEAR STORE
 * Integração dinâmica completa com API Express (/api) mapeada do projeto
 * ============================================================================
 */

// Configuração Base da API e Loja
const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? (window.location.port === "3000" ? "/api" : "http://localhost:3000/api")
  : "/api";

// Obtém o ID da loja da URL (ex: ?loja=2) ou do localStorage, com padrão 1
function getCurrentStoreId() {
  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get("loja");
  if (paramId) {
    return Number(paramId);
  }
  const stored = localStorage.getItem("store_selected_id");
  return stored ? Number(stored) : 1;
}

const STORE_ID = getCurrentStoreId();
const WHATSAPP_PHONE = "5527992929034";

// Estado Global da Aplicação
const state = {
  products: [],
  categories: [],
  filters: {
    texto: "",
    categoria: "",
    precoMIN: "",
    precoMAX: ""
  },
  cart: [],
  currentModalProduct: null
};

// Helper para garantir correspondência temática da imagem com título e descrição
function getFallbackImageByContext(product) {
  const text = `${product.nome || ''} ${product.descricao || ''} ${product.nome_categoria || ''}`.toLowerCase();
  
  if (text.includes("flamengo") || text.includes("time") || text.includes("camisa de time") || text.includes("futebol")) {
    return "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80";
  }
  if (text.includes("polo") || text.includes("adidas")) {
    return "https://images.unsplash.com/photo-1625910513413-7fc256a5b67a?w=800&auto=format&fit=crop&q=80";
  }
  if (text.includes("calça") || text.includes("calca") || text.includes("pant") || text.includes("jogger")) {
    return "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80";
  }
  if (text.includes("tenis") || text.includes("tênis") || text.includes("sneaker") || text.includes("puma") || text.includes("sapato")) {
    return "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80";
  }
  if (text.includes("boné") || text.includes("bone") || text.includes("cap") || text.includes("chapeu")) {
    return "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80";
  }
  if (text.includes("oversized") || text.includes("camisa") || text.includes("camiseta") || text.includes("tee")) {
    return "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80";
  }
  
  return "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=80";
}

function getProductImage(product, index = 0) {
  if (product && product.imagem_url && typeof product.imagem_url === "string" && product.imagem_url.trim().startsWith("http")) {
    return product.imagem_url.trim();
  }
  return getFallbackImageByContext(product || {});
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  initCart();
  setupEventListeners();
  loadCategories();
  loadProducts();
});

// ============================================================================
// CARREGAR CATEGORIAS PARA OS FILTROS (API: GET /api/categorias)
// ============================================================================
async function loadCategories() {
  const categorySelect = document.getElementById("filterCategory");
  try {
    const res = await fetch(`${API_BASE}/categorias`);
    if (!res.ok) throw new Error("Erro ao consultar categorias");
    
    const data = await res.json();
    const cats = data.categorias || [];
    state.categories = cats;

    // Remove duplicatas de nomes se existirem
    const uniqueNames = [...new Set(cats.map(c => c.nome).filter(Boolean))];

    // Preserva a primeira opção padrão
    categorySelect.innerHTML = '<option value="">Todas as categorias</option>';
    uniqueNames.forEach(nome => {
      const opt = document.createElement("option");
      opt.value = nome;
      opt.textContent = nome;
      categorySelect.appendChild(opt);
    });
  } catch (error) {
    console.warn("Aviso ao carregar categorias dinâmicas:", error);
  }
}

// ============================================================================
// CARREGAR PRODUTOS SERVER-SIDE (API: GET /api/produtos/loja/:id)
// ============================================================================
let debounceTimer = null;

async function loadProducts() {
  const catalogEl = document.getElementById("catalog");
  catalogEl.innerHTML = `
    <div class="catalog-loading">
      <div class="spinner"></div>
      <p>Buscando peças autênticas no estoque...</p>
    </div>
  `;

  try {
    // Monta os query params aceitos pelo controller da API:
    // texto, categoria, precoMIN, precoMAX
    const params = new URLSearchParams();
    if (state.filters.texto) params.append("texto", state.filters.texto);
    if (state.filters.categoria) params.append("categoria", state.filters.categoria);
    if (state.filters.precoMIN) params.append("precoMIN", state.filters.precoMIN);
    if (state.filters.precoMAX) params.append("precoMAX", state.filters.precoMAX);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${API_BASE}/produtos/loja/${STORE_ID}${queryString}`);

    if (!res.ok) {
      throw new Error(`Falha na requisição da API (HTTP ${res.status})`);
    }

    const data = await res.json();
    const produtos = data.produtos || [];
    state.products = produtos;

    renderCatalog(produtos);
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    catalogEl.innerHTML = `
      <div class="no-products-msg">
        <i class="fa-solid fa-triangle-exclamation" style="font-size:2rem;color:var(--color-primary);margin-bottom:1rem;display:block;"></i>
        <h3>Não foi possível conectar com o servidor da loja</h3>
        <p style="margin-top:0.5rem;font-size:0.9rem;">Certifique-se de que a API está rodando em <code>http://localhost:3000</code>.</p>
        <button onclick="loadProducts()" class="btn-hero" style="margin-top:1.5rem;cursor:pointer;">
          <i class="fa-solid fa-rotate"></i> Tentar Novamente
        </button>
      </div>
    `;
  }
}

// ============================================================================
// RENDERIZAR CATÁLOGO (AGRUPADO POR CATEGORIA COM SCROLL HORIZONTAL)
// ============================================================================
function renderCatalog(produtos) {
  const catalogEl = document.getElementById("catalog");
  catalogEl.innerHTML = "";

  if (!produtos || produtos.length === 0) {
    catalogEl.innerHTML = `
      <div class="no-products-msg">
        <i class="fa-solid fa-box-open" style="font-size: 2.5rem; margin-bottom: 0.8rem; display:block;"></i>
        <h3>Nenhum produto streetwear encontrado</h3>
        <p>Tente alterar os termos da busca ou ajustar a faixa de preços.</p>
      </div>
    `;
    return;
  }

  // Agrupamento por Categoria conforme especificação
  const grouped = {};
  produtos.forEach((prod, index) => {
    const catName = prod.nome_categoria || "Streetwear Geral";
    if (!grouped[catName]) {
      grouped[catName] = [];
    }
    grouped[catName].push({ ...prod, imgIndex: index });
  });

  // Renderizar cada seção de categoria
  Object.keys(grouped).forEach(categoryName => {
    const items = grouped[categoryName];
    const section = document.createElement("section");
    section.className = "category-section";

    // Header da Categoria com Setas de Scroll Suave
    const headerBar = document.createElement("div");
    headerBar.className = "category-header-bar";
    headerBar.innerHTML = `
      <h3 class="category-title">${escapeHTML(categoryName)}</h3>
      <div class="category-nav-controls">
        <button class="scroll-btn prev" aria-label="Rolar para esquerda">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <button class="scroll-btn next" aria-label="Rolar para direita">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    `;

    // Slider Horizontal
    const slider = document.createElement("div");
    slider.className = "product-slider";

    items.forEach(product => {
      const card = createProductCard(product);
      slider.appendChild(card);
    });

    // Ações das setas de scroll suave
    const btnPrev = headerBar.querySelector(".scroll-btn.prev");
    const btnNext = headerBar.querySelector(".scroll-btn.next");

    btnPrev.addEventListener("click", () => {
      slider.scrollBy({ left: -320, behavior: "smooth" });
    });

    btnNext.addEventListener("click", () => {
      slider.scrollBy({ left: 320, behavior: "smooth" });
    });

    section.appendChild(headerBar);
    section.appendChild(slider);
    catalogEl.appendChild(section);
  });
}

// Criação do Card de Produto individual
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  const imgUrl = getProductImage(product, product.imgIndex);
  const formattedPrice = Number(product.preco || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  card.innerHTML = `
    <div class="card-img-wrapper">
      <img src="${imgUrl}" alt="${escapeHTML(product.nome)}" loading="lazy" />
      <span class="card-tag">${escapeHTML(product.nome_categoria || 'Drop')}</span>
    </div>
    <div class="card-body">
      <h4 class="card-title">${escapeHTML(product.nome)}</h4>
      <p class="card-desc" title="${escapeHTML(product.descricao || '')}">${escapeHTML(product.descricao || 'Peça streetwear exclusiva de alta costura urbana.')}</p>
      <div class="card-footer">
        <span class="card-price">R$ ${formattedPrice}</span>
        <button class="card-btn-view" aria-label="Ver Detalhes">
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  `;

  // Clique no card abre o Modal de Detalhes
  card.addEventListener("click", () => {
    openProductModal(product, imgUrl);
  });

  return card;
}

// ============================================================================
// MODAL DE DETALHES DO PRODUTO (2 COLUNAS)
// ============================================================================
function openProductModal(product, imgUrl) {
  state.currentModalProduct = product;

  document.getElementById("modalImg").src = imgUrl;
  document.getElementById("modalCategoryBadge").textContent = product.nome_categoria || "Streetwear";
  document.getElementById("modalTitle").textContent = product.nome;
  document.getElementById("modalDesc").textContent = product.descricao || "Acabamento de alto nível, modelagem autêntica e caimento impecável para compor o visual urbano ideal.";
  
  const formattedPrice = Number(product.preco || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById("modalPrice").textContent = formattedPrice;

  // Quantidade em Estoque
  const stockEl = document.getElementById("modalStockQty");
  if (product.quantidade !== undefined && product.quantidade !== null) {
    stockEl.textContent = `(${product.quantidade} disponíveis)`;
  } else {
    stockEl.textContent = "";
  }

  // Reset seletor de quantidade
  document.getElementById("modalQty").value = 1;

  // Exibir Modal
  const modal = document.getElementById("productModal");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  const modal = document.getElementById("productModal");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// ============================================================================
// GESTÃO DO CARRINHO & CHECKOUT WHATSAPP (LOCALSTORAGE)
// ============================================================================
function initCart() {
  try {
    const saved = localStorage.getItem("streetwear_cart");
    if (saved) {
      state.cart = JSON.parse(saved);
    }
  } catch (e) {
    state.cart = [];
  }
  updateCartUI();
}

function saveCart() {
  localStorage.setItem("streetwear_cart", JSON.stringify(state.cart));
  updateCartUI();
}

function addToCart(product, quantity = 1) {
  const qtyToAdd = Math.max(1, parseInt(quantity) || 1);
  const existingIndex = state.cart.findIndex(item => item.id === product.id);

  if (existingIndex > -1) {
    state.cart[existingIndex].qty += qtyToAdd;
  } else {
    state.cart.push({
      id: product.id,
      nome: product.nome,
      preco: Number(product.preco || 0),
      imagem_url: getProductImage(product),
      categoria: product.nome_categoria || "Geral",
      qty: qtyToAdd
    });
  }

  saveCart();
  showToast(`"${product.nome}" adicionado à sacola!`);
  closeProductModal();
  openCartDrawer();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(item => item.id !== productId);
  saveCart();
}

function changeItemQty(productId, delta) {
  const item = state.cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
  } else {
    saveCart();
  }
}

function clearCart() {
  if (state.cart.length === 0) return;
  if (confirm("Deseja realmente esvaziar todos os itens da sua sacola?")) {
    state.cart = [];
    saveCart();
  }
}

function updateCartUI() {
  const cartCountEl = document.getElementById("cartCount");
  const cartItemsList = document.getElementById("cartItems");
  const cartEmptyMessage = document.getElementById("cartEmptyMessage");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const cartTotal = document.getElementById("cartTotal");
  const waCheckoutBtn = document.getElementById("whatsappCheckout");

  const totalItemsCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = state.cart.reduce((sum, item) => sum + (item.preco * item.qty), 0);
  const formattedTotal = totalPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  cartCountEl.textContent = totalItemsCount;
  cartSubtotal.textContent = formattedTotal;
  cartTotal.textContent = formattedTotal;

  cartItemsList.innerHTML = "";

  if (state.cart.length === 0) {
    cartEmptyMessage.style.display = "block";
    waCheckoutBtn.style.opacity = "0.5";
    waCheckoutBtn.style.pointerEvents = "none";
    waCheckoutBtn.href = "#";
  } else {
    cartEmptyMessage.style.display = "none";
    waCheckoutBtn.style.opacity = "1";
    waCheckoutBtn.style.pointerEvents = "auto";

    state.cart.forEach(item => {
      const li = document.createElement("li");
      li.className = "cart-item-card";
      const itemSubtotal = (item.preco * item.qty).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

      li.innerHTML = `
        <img src="${item.imagem_url}" alt="${escapeHTML(item.nome)}" class="cart-item-img" />
        <div class="cart-item-info">
          <div>
            <h4 class="cart-item-name">${escapeHTML(item.nome)}</h4>
            <span class="cart-item-price">${itemSubtotal}</span>
          </div>
          <div class="cart-item-controls">
            <button class="btn-cart-qty minus" data-id="${item.id}">-</button>
            <span class="cart-item-qty-display">${item.qty}</span>
            <button class="btn-cart-qty plus" data-id="${item.id}">+</button>
          </div>
        </div>
        <button class="btn-remove-item" data-id="${item.id}" title="Remover item">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      `;

      li.querySelector(".btn-cart-qty.minus").addEventListener("click", () => changeItemQty(item.id, -1));
      li.querySelector(".btn-cart-qty.plus").addEventListener("click", () => changeItemQty(item.id, 1));
      li.querySelector(".btn-remove-item").addEventListener("click", () => removeFromCart(item.id));

      cartItemsList.appendChild(li);
    });

    // Formatação da Mensagem do Checkout no WhatsApp
    // Requisito 3.A.5: link wa.me com dados formatados
    let message = `*NOVO PEDIDO STREETWEAR STORE*\n`;
    message += `------------------------------------\n`;
    state.cart.forEach((i, idx) => {
      const sub = (i.preco * i.qty).toFixed(2).replace(".", ",");
      message += `${idx + 1}. *${i.nome}* | Qtd: ${i.qty} un | Sub: R$ ${sub}\n`;
    });
    message += `------------------------------------\n`;
    message += `*TOTAL DO PEDIDO:* ${formattedTotal}\n`;
    message += `Olá! Gostaria de finalizar a compra desses itens pelo WhatsApp. Como combinamos o pagamento e entrega?`;

    waCheckoutBtn.href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
    waCheckoutBtn.target = "_blank";
  }
}

function openCartDrawer() {
  document.getElementById("cartOverlay").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCartDrawer() {
  document.getElementById("cartOverlay").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// Toast Notifier
function showToast(msg) {
  const toast = document.getElementById("toastNotification");
  const toastMsg = document.getElementById("toastMessage");
  toastMsg.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ============================================================================
// EVENT LISTENERS & FILTROS SERVER-SIDE
// ============================================================================
function setupEventListeners() {
  // Filtros
  const searchInput = document.getElementById("filterSearch");
  const categorySelect = document.getElementById("filterCategory");
  const minPriceInput = document.getElementById("filterPriceMin");
  const maxPriceInput = document.getElementById("filterPriceMax");
  const btnClearFilters = document.getElementById("btnClearFilters");

  function handleFilterChange() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      state.filters.texto = searchInput.value.trim();
      state.filters.categoria = categorySelect.value;
      state.filters.precoMIN = minPriceInput.value;
      state.filters.precoMAX = maxPriceInput.value;
      loadProducts();
    }, 350);
  }

  searchInput.addEventListener("input", handleFilterChange);
  categorySelect.addEventListener("change", handleFilterChange);
  minPriceInput.addEventListener("input", handleFilterChange);
  maxPriceInput.addEventListener("input", handleFilterChange);

  btnClearFilters.addEventListener("click", () => {
    searchInput.value = "";
    categorySelect.value = "";
    minPriceInput.value = "";
    maxPriceInput.value = "";
    state.filters = { texto: "", categoria: "", precoMIN: "", precoMAX: "" };
    loadProducts();
  });

  // Modal de Detalhes
  document.getElementById("modalClose").addEventListener("click", closeProductModal);
  document.getElementById("modalBackdrop").addEventListener("click", closeProductModal);

  document.getElementById("btnQtyMinus").addEventListener("click", () => {
    const input = document.getElementById("modalQty");
    let val = parseInt(input.value) || 1;
    if (val > 1) input.value = val - 1;
  });

  document.getElementById("btnQtyPlus").addEventListener("click", () => {
    const input = document.getElementById("modalQty");
    let val = parseInt(input.value) || 1;
    input.value = val + 1;
  });

  document.getElementById("addToCartBtn").addEventListener("click", () => {
    if (state.currentModalProduct) {
      const qty = parseInt(document.getElementById("modalQty").value) || 1;
      addToCart(state.currentModalProduct, qty);
    }
  });

  // Carrinho
  document.getElementById("cartBtn").addEventListener("click", openCartDrawer);
  document.getElementById("cartClose").addEventListener("click", closeCartDrawer);
  document.getElementById("cartBackdrop").addEventListener("click", closeCartDrawer);
  document.getElementById("btnClearCart").addEventListener("click", clearCart);

  // Fechamento de modais via Tecla ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeProductModal();
      closeCartDrawer();
    }
  });
}

// Utilitário para sanitização básica de HTML
function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
