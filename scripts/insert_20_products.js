import supabase from '../api/src/db/config.js';

const novosProdutos = [
  // Categoria 1: Camisetas
  {
    nome: "Camiseta Boxy Manga Curta Marrom Earth",
    descricao: "Camiseta boxy fit com gola grossa de 3,5cm, malha encorpada 240g/m² em tom terroso vintage.",
    preco: 139.90,
    quantidade: 25,
    imagem_url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80",
    id_categorias: 1,
    id_lojas: 1
  },
  {
    nome: "Camiseta Graphic Cyberpunk Tokyo",
    descricao: "Estampa futurista em serigrafia de alta resolução, modelagem oversized unissex em algodão puro.",
    preco: 149.90,
    quantidade: 30,
    imagem_url: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80",
    id_categorias: 1,
    id_lojas: 1
  },
  {
    nome: "Camiseta Raglan Vintage Skate 90s",
    descricao: "Design retrô com mangas bicolores contrastantes, toque peletizado macio e costuras reforçadas.",
    preco: 129.90,
    quantidade: 20,
    imagem_url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
    id_categorias: 1,
    id_lojas: 1
  },
  {
    nome: "Regata Streetwear Canelada Heavy Off-White",
    descricao: "Regata masculina canelada com caimento reto estruturado, gola redonda e cavas fechadas.",
    preco: 99.90,
    quantidade: 35,
    imagem_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    id_categorias: 1,
    id_lojas: 1
  },

  // Categoria 2: Calças
  {
    nome: "Calça Parachute Streetwear Baggy Khaki",
    descricao: "Calça parachute em nylon leve ripstop, reguladores elásticos nos tornozelos e cintura com elástico.",
    preco: 249.90,
    quantidade: 18,
    imagem_url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
    id_categorias: 2,
    id_lojas: 1
  },
  {
    nome: "Calça Jeans Wide Leg Skate Lavagem Clara",
    descricao: "Jeans 100% algodão corte amplo baggy anos 90, barra desfeita e passantes largos para cinto.",
    preco: 269.90,
    quantidade: 22,
    imagem_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80",
    id_categorias: 2,
    id_lojas: 1
  },
  {
    nome: "Calça Jogger Moletom Heavy Mescla",
    descricao: "Moletom pesado peluciado com punho canelado, bolsos embutidos e cordão com ponta metálica.",
    preco: 199.90,
    quantidade: 28,
    imagem_url: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80",
    id_categorias: 2,
    id_lojas: 1
  },
  {
    nome: "Bermuda Cargo Sarja Oversized Chumbo",
    descricao: "Bermuda cargo com bolsos laterais fole, comprimento abaixo do joelho e tecido sarjado peletizado.",
    preco: 169.90,
    quantidade: 24,
    imagem_url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop&q=80",
    id_categorias: 2,
    id_lojas: 1
  },

  // Categoria 3: Tênis
  {
    nome: "Tênis Chunky Platform Runner Branco",
    descricao: "Solado robusto em EVA expandido para amortecimento superior, cabedal em mesh respirável e couro sintético.",
    preco: 399.90,
    quantidade: 14,
    imagem_url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
    id_categorias: 3,
    id_lojas: 1
  },
  {
    nome: "Tênis High-Top Vintage Leather Preto/Branco",
    descricao: "Cano alto clássico inspirado no basquete anos 80, cano acolchoado e sola de borracha antiderrapante.",
    preco: 449.90,
    quantidade: 10,
    imagem_url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80",
    id_categorias: 3,
    id_lojas: 1
  },
  {
    nome: "Tênis Skate Suede Low All Black",
    descricao: "Total black em camurça premium com palmilha anti-impacto, costura dupla e vira de borracha reforçada.",
    preco: 329.90,
    quantidade: 16,
    imagem_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80",
    id_categorias: 3,
    id_lojas: 1
  },
  {
    nome: "Tênis Urban Retro Runner Bege/Verde",
    descricao: "Estética dad shoe retrô com combinações de tons terrosos, detalhes refletivos e tração multidirecional.",
    preco: 379.90,
    quantidade: 12,
    imagem_url: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80",
    id_categorias: 3,
    id_lojas: 1
  },

  // Categoria 4: Casacos & Moletons
  {
    nome: "Moletom Crewneck Gola Careca Cinza Mescla",
    descricao: "Moletom gola redonda clássico 3 cabos, sem felpa, caimento relaxado e punhos em ribana canelada.",
    preco: 239.90,
    quantidade: 20,
    imagem_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
    id_categorias: 4,
    id_lojas: 1
  },
  {
    nome: "Jaqueta Puffer Streetwear Térmica Preta",
    descricao: "Isolamento térmico volumoso em fibra sintética, gola alta corta-vento e bolsos frontais com fleece.",
    preco: 489.90,
    quantidade: 15,
    imagem_url: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80",
    id_categorias: 4,
    id_lojas: 1
  },
  {
    nome: "Jaqueta Bomber College Bordada Verde Escuro",
    descricao: "Estilo universitário com mangas em contraste, fechamento por botões de pressão e forro acolchoado.",
    preco: 359.90,
    quantidade: 18,
    imagem_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80",
    id_categorias: 4,
    id_lojas: 1
  },
  {
    nome: "Moletom Half-Zip Anorak Street Marrom",
    descricao: "Moletom com meio zíper frontal no peito, bolso embutido e ajuste com tanca elástica na cintura.",
    preco: 279.90,
    quantidade: 22,
    imagem_url: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80",
    id_categorias: 4,
    id_lojas: 1
  },

  // Categoria 5: Acessórios
  {
    nome: "Bucket Hat Streetwear Dupla Face Preto/Branco",
    descricao: "Chapéu bucket confeccionado em sarja pesada 100% algodão, aba estruturada e uso dupla face.",
    preco: 99.90,
    quantidade: 40,
    imagem_url: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&auto=format&fit=crop&q=80",
    id_categorias: 5,
    id_lojas: 1
  },
  {
    nome: "Touca Beanie Dobrável Acrílico Canelado Caramelo",
    descricao: "Gorro estilo fisherman curto com dobra, malha canelada quente com alta elasticidade e conforto.",
    preco: 69.90,
    quantidade: 50,
    imagem_url: "https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=800&auto=format&fit=crop&q=80",
    id_categorias: 5,
    id_lojas: 1
  },
  {
    nome: "Bolsa Crossbody Mini Bag Impermeável",
    descricao: "Bolsa transversal compacta com tecido resistente à água, fivelas de liberação rápida e zíperes YKK.",
    preco: 129.90,
    quantidade: 35,
    imagem_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    id_categorias: 5,
    id_lojas: 1
  },
  {
    nome: "Cinto Tático Têxtil com Fivela de Engate Rápido",
    descricao: "Fita de nylon balístico ultra resistente de 38mm de largura com fivela militar em liga de zinco.",
    preco: 79.90,
    quantidade: 45,
    imagem_url: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&auto=format&fit=crop&q=80",
    id_categorias: 5,
    id_lojas: 1
  }
];

async function seed() {
  console.log(`Inserindo ${novosProdutos.length} produtos no Supabase...`);
  const { data, error } = await supabase.from('produtos').insert(novosProdutos).select();
  if (error) {
    console.error('Erro na inserção:', error);
    process.exit(1);
  }
  console.log(`Sucesso! ${data.length} produtos inseridos com IDs:`, data.map(p => p.id));
  process.exit(0);
}

seed();
