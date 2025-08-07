const STORAGE_KEY = "anexosFornecedor";  // chave no sessionStorage
let anexos = [];                         // array com os anexos

// quando a página carregar, pega os anexos do sessionStorage e mostra
window.addEventListener('load', () => {
  const dados = sessionStorage.getItem(STORAGE_KEY);
  if (dados) {
    anexos = JSON.parse(dados);
    atualizarListaAnexos();
  }
});

// botão “incluir anexo” abre seletor de arquivos escondido
document.getElementById('btnIncluirAnexo').addEventListener('click', () => {
  document.getElementById('inputAnexoFile').click();
});

// quando escolher arquivo, converte e salva no sessionStorage
document.getElementById('inputAnexoFile').addEventListener('change', async function () {
  const arquivos = Array.from(this.files);
  if (!arquivos.length) return;

  for (let arquivo of arquivos) {
    const base64 = await converterBase64(arquivo);
    anexos.push({
      nome: arquivo.name,
      tipo: arquivo.type,
      tamanho: arquivo.size,
      base64
    });
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(anexos));
  atualizarListaAnexos();
  this.value = "";  // limpa input pra poder adicionar de novo
});

// transforma arquivo em base64
function converterBase64(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = reject;
    leitor.readAsDataURL(arquivo);
  });
}

// mostra a lista de anexos na tela
function atualizarListaAnexos() {
  const lista = document.getElementById('listaAnexos');
  lista.innerHTML = "";

  if (!anexos.length) {
    lista.innerHTML = "<div>Nenhum anexo incluído.</div>";
    return;
  }
   anexos.forEach((anexo, i) => {
  const item = document.createElement('div');
  const count = i + 1; // contador começando em 1
  item.innerHTML = `
    <button onclick="excluirAnexo(${i})" title="Excluir">🗑️</button>
    <button onclick="visualizarAnexo(${i})" title="Visualizar">👁️</button>
    <span>Documento anexo ${count}</span>
  `;
  lista.appendChild(item);
});
}

// exclui anexo da lista e do sessionStorage
function excluirAnexo(i) {
  anexos.splice(i, 1);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(anexos));
  atualizarListaAnexos();
}

// baixa ou abre o arquivo anexo
function visualizarAnexo(i) {
  const anexo = anexos[i];
  const link = document.createElement('a');
  link.href = anexo.base64;
  link.download = anexo.nome;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// busca endereço pelo CEP via API
async function BuscarCEP(cep) {
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const dados = await resposta.json();

    if (dados.erro) {
      alert("CEP não encontrado");
      return;
    }

    document.getElementById('Endereco').value = dados.logradouro;
    document.getElementById('Bairro').value = dados.bairro;
    document.getElementById('Municipio').value = dados.localidade;
    document.getElementById('Estado').value = dados.uf;

  } catch (erro) {
    console.error("Erro ao buscar CEP:", erro);
  }
}

// calcula valor total (qtd x unitário)
function calculoVal() {
  const qtd = document.getElementById("QTD").value;
  const unit = document.getElementById("Unitário").value;
  const total = document.getElementById("valor");

  if (qtd && unit) {
    total.value = (parseFloat(qtd) * parseFloat(unit)).toFixed(2);
  }
}


// Adiciona produto na lista com os dados do formulário
function adicionarProduto() {
  const produto = {
    nomeProduto : document.getElementById("nomeProduto").value,
    medida : document.getElementById("medida").value,
    qtd : document.getElementById("QTD").value,
    unitario : document.getElementById("Unitário").value,
    total : document.getElementById("valor").value,
  };

  const container = document.getElementById("produtos-container");
  const count = container.children.length + 1;

  const novoProduto = document.createElement("div");
  novoProduto.className = "position-relative mb-3";
  for (let chave in produto) {
    if (!produto[chave]) {
      alert("Preencha todos os campos do produto antes de adicionar.");
      return;
    }
  }
 novoProduto.innerHTML = `
  <div class="d-flex align-items-start mb-3" style="gap: 10px;">

    <!-- Botão Excluir Fora do Card -->
    <div style="flex-shrink: 0;">
      <button class="btn btn-danger" style="width: 50px; height: 50px; margin-top:20px" onclick="deletarItem(this)" title="Excluir">
        🗑️
      </button>
    </div>

    <!-- Card do Produto -->
    <div class="border rounded p-3 w-100">
      <div class="d-flex align-items-center mb-3" style="gap: 15px;">
        <!-- Ícone da Caixa dentro do Card -->
        <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #bfb9ff; font-size: 32px; display: flex; align-items: center; justify-content: center;">
          📦
        </div>
        <h6 class="m-0">Produto - ${count}</h6>
      </div>

      <div class="row">
        <div class="col-md-12 mb-2">
          <label class="form-label">Produto</label>
          <input type="text" class="form-control" value="${produto.nomeProduto}" >
        </div>
        <div class="col-md-3">
          <label class="form-label">UND. Medida</label>
          <input type="text" class="form-control" value="${produto.medida}" >
        </div>
        <div class="col-md-3">
          <label class="form-label">QTD. em Estoque</label>
          <input type="number" class="form-control" value="${produto.qtd}">
        </div>
        <div class="col-md-3">
          <label class="form-label">Valor Unitário</label>
          <input type="number" class="form-control" value="${produto.unitario}" >
        </div>
        <div class="col-md-3">
          <label class="form-label">Valor Total</label>
          <input type="text" class="form-control" value="${produto.total}" readonly>
        </div>
      </div>
    </div>

  </div>
`;

  container.prepend(novoProduto);}
  


// remove produto da lista
function deletarItem(botao) {
  const card = botao.closest(".position-relative");
  if (card) card.remove();
}

// quando enviar o formulário, valida, busca CEP e mostra o JSON no console
async function Formulario(event) {
  event.preventDefault();

  const cep = document.getElementById('CEP').value.trim();

  if (cep) {
    await BuscarCEP(cep);

    // Espera mínima para garantir que os campos foram atualizados no DOM
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Só monta o objeto depois que o CEP atualiza os campos
  const fornecedor = {
    razaoSocial: document.getElementById('RazaoSocial').value,
    nomeFantasia: document.getElementById('NomeFantasia').value,
    nomeContato: document.getElementById('NPC').value,
    telefoneContato: document.getElementById('Telefone').value,
    emailContato: document.getElementById('email').value,
    cep,
    endereco: document.getElementById('Endereco').value,
    bairro: document.getElementById('Bairro').value,
    municipio: document.getElementById('Municipio').value.trim,
    estado: document.getElementById('Estado').value,
    numero: document.getElementById('Numero').value,
    complemento: document.getElementById('Complemento').value
  };

 


 
  for (const campo in fornecedor) {
    if (fornecedor[campo] === '') {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
  }

  // Verifica se tem pelo menos um produto
  const produtosContainer = document.getElementById('produtos-container');
  if (produtosContainer.children.length === 0) {
    alert('Inclua pelo menos 1 produto.');
    return;
  }

  // Verifica se tem anexo
  if (anexos.length === 0) {
    alert('Inclua pelo menos 1 anexo.');
    return;
  }

  $('#modalLoading').modal('show');

  const fornecedoOpcional = {
    inscricaoEstadual: document.getElementById('InscricaoEstadual').value,
    inscricaoMunicipal: document.getElementById('InscricaoMunicipal').value
  };

  // Captura os produtos
  const itens = document.querySelectorAll("#produtos-container .container-fluid");
  const produtos = [];

  itens.forEach((div, index) => {
    const inputs = div.querySelectorAll('input');
    produtos.push({
      indice: index + 1,
      descricaoProduto: inputs[0]?.value || "",
      unidadeMedida: inputs[1]?.value || "",
      qtdeEstoque: inputs[2]?.value || "",
      valorUnitario: inputs[3]?.value || "",
      valorTotal: inputs[4]?.value || ""
    });
  });

  const total = { ...fornecedoOpcional, ...fornecedor };
  const resultado = {
    ...total,
    produtos,
    anexos: anexos.map((a, i) => ({
      indice: i + 1,
      nomeArquivo: a.nome
    }))
  };

  console.log(JSON.stringify(resultado, null, 2));

  $('#modalLoading').modal('hide');
}
