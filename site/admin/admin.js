/**
 * ============================================================================
 * ADMIN.JS - PAINEL ADMINISTRATIVO AUTÔNOMO
 * Módulos descobertos no mapeamento: Produtos, Categorias, Lojas
 * Multi-loja exclusivo por Usuário Administrador
 * ============================================================================
 */

const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ? (window.location.port === "3000" ? "/api" : "http://localhost:3000/api")
  : "/api";

function getActiveStoreId() {
  const stored = localStorage.getItem("admin_active_store_id");
  return stored ? Number(stored) : 1;
}

function setActiveStoreId(id) {
  localStorage.setItem("admin_active_store_id", id);
}

// Definição dos Módulos mapeados a partir de routes, controllers e SQL
const MODULES = {
  lojas: {
    id: "lojas",
    name: "Minhas Lojas",
    icon: "fa-solid fa-store",
    description: "Lojas cadastradas e pertencentes exclusivamente à sua conta de administrador.",
    columns: ["id", "nome", "imagem_url", "descricao"],
    fields: [
      { name: "nome", label: "Nome da Loja", type: "text", required: true },
      { name: "descricao", label: "Descrição da Loja", type: "textarea", required: false },
      { name: "imagem_url", label: "URL do Logotipo/Banner", type: "text", required: false, placeholder: "https://..." }
    ],
    fetchItems: async () => {
      const user = getLoggedInUser();
      const userId = user ? user.id : 1;
      const res = await fetch(`${API_BASE}/lojas/usuarios/${userId}`);
      const data = await res.json();
      return data.lojas || [];
    },
    createItem: async (payload) => {
      const user = getLoggedInUser();
      payload.id_usuarios = user ? user.id : 1;
      const res = await fetch(`${API_BASE}/lojas/criar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensagem || "Erro ao cadastrar loja");
      // Atualiza o seletor de lojas ativas
      await refreshStoreSelector();
      return data;
    },
    updateItem: async (id, payload) => {
      const user = getLoggedInUser();
      payload.id_usuarios = user ? user.id : 1;
      const res = await fetch(`${API_BASE}/lojas/atualizar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensagem || "Erro ao atualizar loja");
      await refreshStoreSelector();
      return data;
    },
    deleteItem: async (id) => {
      const user = getLoggedInUser();
      const userId = user ? user.id : 1;
      const res = await fetch(`${API_BASE}/lojas/excluir/${id}?id_usuarios=${userId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensagem || "Erro ao excluir loja");
      
      // Se a loja excluída era a ativa, reseta
      if (getActiveStoreId() === Number(id)) {
        localStorage.removeItem("admin_active_store_id");
      }
      await refreshStoreSelector();
      return data;
    }
  },
  produtos: {
    id: "produtos",
    name: "Produtos da Loja Ativa",
    icon: "fa-solid fa-shirt",
    description: "Catálogo de peças, preços, quantidades e categorias da loja selecionada.",
    columns: ["id", "nome", "imagem_url", "descricao", "preco", "quantidade", "nome_categoria"],
    fields: [
      { name: "nome", label: "Nome da Peça", type: "text", required: true },
      { name: "imagem_url", label: "URL da Imagem", type: "text", required: false, placeholder: "https://..." },
      { name: "descricao", label: "Descrição", type: "textarea", required: false },
      { name: "preco", label: "Preço (R$)", type: "number", step: "0.01", required: true },
      { name: "quantidade", label: "Quantidade em Estoque", type: "number", required: true },
      { name: "id_categorias", label: "Categoria", type: "select", optionsUrl: "/categorias", optionValueKey: "id", optionLabelKey: "nome", required: true }
    ],
    fetchItems: async () => {
      const storeId = getActiveStoreId();
      const res = await fetch(`${API_BASE}/produtos/loja/${storeId}`);
      const data = await res.json();
      return data.produtos || [];
    },
    createItem: async (payload) => {
      payload.id_lojas = getActiveStoreId();
      const res = await fetch(`${API_BASE}/produtos/criar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensagem || "Erro ao criar produto");
      return data;
    },
    updateItem: async (id, payload) => {
      const res = await fetch(`${API_BASE}/produtos/atualizar/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensagem || "Erro ao atualizar produto");
      return data;
    },
    deleteItem: async (id) => {
      const res = await fetch(`${API_BASE}/produtos/excluir/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensagem || "Erro ao excluir produto");
      return data;
    }
  },
  categorias: {
    id: "categorias",
    name: "Categorias",
    icon: "fa-solid fa-tags",
    description: "Departamentos e categorias de vestuário.",
    columns: ["id", "nome"],
    fields: [
      { name: "nome", label: "Nome da Categoria", type: "text", required: true }
    ],
    fetchItems: async () => {
      const res = await fetch(`${API_BASE}/categorias`);
      const data = await res.json();
      return data.categorias || [];
    },
    createItem: async (payload) => {
      const res = await fetch(`${API_BASE}/categorias/criar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensagem || "Erro ao criar categoria");
      return data;
    },
    updateItem: async (id, payload) => {
      const res = await fetch(`${API_BASE}/categorias/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensagem || "Erro ao atualizar categoria");
      return data;
    },
    deleteItem: async (id) => {
      const res = await fetch(`${API_BASE}/categorias/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensagem || "Erro ao excluir categoria");
      return data;
    }
  }
};

// ============================================================================
// AUXILIARES DE SESSÃO
// ============================================================================
function getLoggedInUser() {
  try {
    const raw = sessionStorage.getItem("admin_user") || localStorage.getItem("admin_user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setLoggedInUser(user) {
  sessionStorage.setItem("admin_user", JSON.stringify(user));
  localStorage.setItem("admin_user", JSON.stringify(user));
}

function clearSession() {
  sessionStorage.removeItem("admin_user");
  localStorage.removeItem("admin_user");
  localStorage.removeItem("admin_active_store_id");
}

// ============================================================================
// PÁGINA DE LOGIN
// ============================================================================
if (document.getElementById("adminLoginForm")) {
  const loginForm = document.getElementById("adminLoginForm");
  const feedbackEl = document.getElementById("loginFeedback");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    feedbackEl.style.display = "none";

    const email = document.getElementById("adminEmail").value.trim();
    const senha = document.getElementById("adminPassword").value.trim();

    try {
      const res = await fetch(`${API_BASE}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensagem || "Credenciais inválidas");
      }

      setLoggedInUser(data.usuarios);
      feedbackEl.style.display = "block";
      feedbackEl.style.background = "rgba(37, 211, 102, 0.15)";
      feedbackEl.style.color = "var(--color-whatsapp)";
      feedbackEl.style.border = "1px solid var(--color-whatsapp)";
      feedbackEl.innerHTML = `<i class="fa-solid fa-check"></i> Login efetuado com sucesso! Redirecionando...`;

      setTimeout(() => {
        // Redireciona para o dashboard com caminho absoluto relativo ao site
        if (window.location.pathname.includes("/login/adm")) {
          window.location.href = "../../admin/dashboard.html";
        } else {
          window.location.href = "dashboard.html";
        }
      }, 800);
    } catch (err) {
      feedbackEl.style.display = "block";
      feedbackEl.style.background = "rgba(255, 51, 102, 0.15)";
      feedbackEl.style.color = "var(--color-primary)";
      feedbackEl.style.border = "1px solid var(--color-primary)";
      feedbackEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${err.message}`;
    }
  });
}

// ============================================================================
// PÁGINA DO DASHBOARD
// ============================================================================
let activeModuleKey = "lojas";
let currentEditingId = null;

if (document.querySelector(".dashboard-layout")) {
  const user = getLoggedInUser();

  if (!user) {
    // Redireciona para o login secreto em /login/adm
    window.location.href = "../login/adm/index.html";
  } else {
    initDashboard(user);
  }
}

async function initDashboard(user) {
  document.getElementById("userName").textContent = user.nome || "Admin";
  document.getElementById("userEmail").textContent = user.email || "";
  document.getElementById("userAvatar").textContent = (user.nome ? user.nome.charAt(0) : "A").toUpperCase();

  document.getElementById("btnLogout").addEventListener("click", () => {
    clearSession();
    window.location.href = "../login/adm/index.html";
  });

  // Carrega seletor de lojas do usuário
  await refreshStoreSelector();

  // Renderiza Sidebar
  renderModuleNav();

  // Carrega módulo inicial
  loadModuleView(activeModuleKey);

  // Setup eventos do Modal de CRUD
  setupCrudModalEvents();
}

// Carregar e atualizar as lojas do usuário logado no seletor da sidebar
async function refreshStoreSelector() {
  const storeSelect = document.getElementById("activeStoreSelect");
  if (!storeSelect) return;

  const user = getLoggedInUser();
  const userId = user ? user.id : 1;

  try {
    const res = await fetch(`${API_BASE}/lojas/usuarios/${userId}`);
    const data = await res.json();
    const lojas = data.lojas || [];

    storeSelect.innerHTML = "";

    if (lojas.length === 0) {
      storeSelect.innerHTML = `<option value="">Nenhuma loja cadastrada</option>`;
      return;
    }

    let activeId = getActiveStoreId();
    let storeExists = lojas.some(l => l.id === activeId);

    if (!storeExists) {
      activeId = lojas[0].id;
      setActiveStoreId(activeId);
    }

    lojas.forEach(loja => {
      const opt = document.createElement("option");
      opt.value = loja.id;
      opt.textContent = `[ID: ${loja.id}] ${loja.nome}`;
      if (loja.id === activeId) opt.selected = true;
      storeSelect.appendChild(opt);
    });

    storeSelect.onchange = () => {
      const selectedId = Number(storeSelect.value);
      setActiveStoreId(selectedId);
      showAdminAlert(`Loja ativa alterada para ID ${selectedId}. Produtos agora correspondem a esta loja!`, "success");
      if (activeModuleKey === "produtos") {
        loadModuleView("produtos");
      }
    };
  } catch (err) {
    console.error("Erro ao carregar lojas do usuário:", err);
  }
}

function renderModuleNav() {
  const navEl = document.getElementById("moduleNav");
  navEl.innerHTML = "";

  Object.keys(MODULES).forEach(key => {
    const mod = MODULES[key];
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = `module-btn ${key === activeModuleKey ? "active" : ""}`;
    btn.innerHTML = `<i class="${mod.icon}"></i> ${mod.name}`;

    btn.addEventListener("click", () => {
      document.querySelectorAll(".module-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeModuleKey = key;
      loadModuleView(key);
    });

    li.appendChild(btn);
    navEl.appendChild(li);
  });
}

async function loadModuleView(moduleKey) {
  const mod = MODULES[moduleKey];
  document.getElementById("currentModuleTitle").textContent = `Gestão de ${mod.name}`;
  document.getElementById("currentModuleDesc").textContent = mod.description;
  document.getElementById("moduleBadge").innerHTML = `<i class="${mod.icon}"></i> ${mod.name.toUpperCase()}`;

  const btnCreate = document.getElementById("btnOpenCreateModal");
  btnCreate.style.display = "inline-flex";

  const thead = document.getElementById("tableHeaders");
  const tbody = document.getElementById("tableRows");
  const emptyState = document.getElementById("tableEmptyState");

  thead.innerHTML = "";
  tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:2rem;"><div class="spinner"></div></td></tr>`;

  try {
    const items = await mod.fetchItems();
    tbody.innerHTML = "";

    if (!items || items.length === 0) {
      emptyState.style.display = "block";
      return;
    }
    emptyState.style.display = "none";

    // Headers
    mod.columns.forEach(col => {
      const th = document.createElement("th");
      th.textContent = col.replace("_", " ").toUpperCase();
      thead.appendChild(th);
    });

    const thAction = document.createElement("th");
    thAction.textContent = "AÇÕES";
    thAction.style.textAlign = "right";
    thead.appendChild(thAction);

    // Linhas
    items.forEach(item => {
      const tr = document.createElement("tr");

      mod.columns.forEach(col => {
        const td = document.createElement("td");
        td.className = `col-${col} col-truncate`;
        let val = item[col];
        if (col === "preco") {
          val = `R$ ${Number(val || 0).toFixed(2)}`;
          td.textContent = val;
          td.title = val;
        } else if (col === "imagem_url") {
          td.className = `col-thumb`;
          if (val && typeof val === "string" && val.startsWith("http")) {
            td.innerHTML = `<img src="${val}" alt="thumb" style="width:38px;height:38px;object-fit:cover;border-radius:4px;border:1px solid var(--color-border);vertical-align:middle;" />`;
            td.title = val;
          } else {
            td.textContent = "-";
          }
        } else {
          const textVal = val !== null && val !== undefined ? String(val) : "-";
          td.textContent = textVal;
          td.title = textVal; // Permite ver o texto completo ao passar o mouse por cima
        }
        tr.appendChild(td);
      });

      const tdActions = document.createElement("td");
      tdActions.style.textAlign = "right";

      const btnEdit = document.createElement("button");
      btnEdit.className = "action-btn";
      btnEdit.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;
      btnEdit.title = "Editar registro";
      btnEdit.addEventListener("click", () => openEditModal(moduleKey, item));

      const btnDel = document.createElement("button");
      btnDel.className = "action-btn btn-delete";
      btnDel.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
      btnDel.title = "Remover registro";
      btnDel.addEventListener("click", () => handleDeleteItem(moduleKey, item.id));

      tdActions.appendChild(btnEdit);
      tdActions.appendChild(btnDel);
      tr.appendChild(tdActions);

      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="10" style="color:var(--color-primary);text-align:center;padding:2rem;">Erro ao carregar dados: ${err.message}</td></tr>`;
  }
}

// ============================================================================
// CRUD DINÂMICO (Criação, Edição, Deleção)
// ============================================================================
async function openCreateModal(moduleKey) {
  currentEditingId = null;
  const mod = MODULES[moduleKey];
  document.getElementById("modalCrudTitle").textContent = `Criar Novo em ${mod.name}`;
  await buildDynamicForm(mod.fields, {});
  document.getElementById("adminCrudModal").setAttribute("aria-hidden", "false");
}

async function openEditModal(moduleKey, item) {
  currentEditingId = item.id;
  const mod = MODULES[moduleKey];
  document.getElementById("modalCrudTitle").textContent = `Editar ${mod.name} #${item.id}`;
  await buildDynamicForm(mod.fields, item);
  document.getElementById("adminCrudModal").setAttribute("aria-hidden", "false");
}

async function buildDynamicForm(fields, initialData = {}) {
  const container = document.getElementById("dynamicFormFields");
  container.innerHTML = "";

  for (const field of fields) {
    const group = document.createElement("div");
    group.className = "admin-form-group";

    const label = document.createElement("label");
    label.textContent = field.label;
    label.setAttribute("for", `crud_${field.name}`);
    group.appendChild(label);

    let inputEl;

    if (field.type === "textarea") {
      inputEl = document.createElement("textarea");
      inputEl.rows = 3;
    } else if (field.type === "select") {
      inputEl = document.createElement("select");
      inputEl.innerHTML = `<option value="">Selecione uma opção...</option>`;
      try {
        const res = await fetch(`${API_BASE}${field.optionsUrl}`);
        const data = await res.json();
        const optionsList = data.categorias || [];
        optionsList.forEach(opt => {
          const optEl = document.createElement("option");
          optEl.value = opt[field.optionValueKey];
          optEl.textContent = opt[field.optionLabelKey];
          inputEl.appendChild(optEl);
        });
      } catch (e) {
        console.error("Erro ao carregar options:", e);
      }
    } else {
      inputEl = document.createElement("input");
      inputEl.type = field.type;
      if (field.step) inputEl.step = field.step;
      if (field.placeholder) inputEl.placeholder = field.placeholder;
    }

    inputEl.id = `crud_${field.name}`;
    inputEl.name = field.name;
    if (field.required) inputEl.required = true;
    if (field.readonly) inputEl.disabled = true;

    // Valor inicial em caso de edição
    if (initialData[field.name] !== undefined) {
      inputEl.value = initialData[field.name];
    } else if (field.name === "id_categorias" && initialData.id_categoria) {
      inputEl.value = initialData.id_categoria;
    }

    group.appendChild(inputEl);
    container.appendChild(group);
  }
}

function setupCrudModalEvents() {
  const modal = document.getElementById("adminCrudModal");
  const btnOpen = document.getElementById("btnOpenCreateModal");
  const btnClose = document.getElementById("modalCrudClose");
  const btnCancel = document.getElementById("btnCancelCrud");
  const backdrop = modal.querySelector(".modal-backdrop");
  const form = document.getElementById("dynamicCrudForm");

  btnOpen.addEventListener("click", () => openCreateModal(activeModuleKey));
  btnClose.addEventListener("click", () => modal.setAttribute("aria-hidden", "true"));
  btnCancel.addEventListener("click", () => modal.setAttribute("aria-hidden", "true"));
  backdrop.addEventListener("click", () => modal.setAttribute("aria-hidden", "true"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const mod = MODULES[activeModuleKey];
    const formData = new FormData(form);
    const payload = {};

    formData.forEach((value, key) => {
      payload[key] = value;
    });

    try {
      let result;
      if (currentEditingId) {
        result = await mod.updateItem(currentEditingId, payload);
      } else {
        result = await mod.createItem(payload);
      }

      showAdminAlert(result.mensagem || "Operação realizada com sucesso!", "success");
      modal.setAttribute("aria-hidden", "true");
      loadModuleView(activeModuleKey);
    } catch (err) {
      showAdminAlert(`Erro: ${err.message}`, "error");
    }
  });
}

async function handleDeleteItem(moduleKey, id) {
  if (!confirm(`Tem certeza que deseja remover este registro (#${id})? Esta ação é irreversível!`)) return;

  const mod = MODULES[moduleKey];
  try {
    const res = await mod.deleteItem(id);
    showAdminAlert(res.mensagem || "Registro removido com sucesso!", "success");
    loadModuleView(moduleKey);
  } catch (err) {
    showAdminAlert(`Falha ao remover registro: ${err.message}`, "error");
  }
}

function showAdminAlert(message, type = "success") {
  const alertEl = document.getElementById("adminAlert");
  alertEl.style.display = "block";
  if (type === "success") {
    alertEl.style.background = "rgba(37, 211, 102, 0.15)";
    alertEl.style.color = "var(--color-whatsapp)";
    alertEl.style.border = "1px solid var(--color-whatsapp)";
  } else {
    alertEl.style.background = "rgba(255, 51, 102, 0.15)";
    alertEl.style.color = "var(--color-primary)";
    alertEl.style.border = "1px solid var(--color-primary)";
  }
  alertEl.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'check' : 'triangle-exclamation'}"></i> ${message}`;
  setTimeout(() => {
    alertEl.style.display = "none";
  }, 4000);
}
