// Mostra o programa como uma lista (endereço, código e comentário) e destaca a próxima instrução.
// O destaque acompanha o PC: no passo a passo, ele desliza de uma instrução para a seguinte.

class Listagem {
    constructor(lista, destaque, agora) {
        this.lista = lista;         // a caixa com as linhas
        this.destaque = destaque;   // a faixa colorida que marca a próxima instrução
        this.agora = agora;         // a caixa com a explicação da próxima instrução
        this.instrucoes = [];
        this.linhas = [];
        this.enderecoAtual = -1;
    }

    montar(instrucoes) {
        this.lista.querySelectorAll('.linha').forEach((linha) => linha.remove());
        this.instrucoes = instrucoes;
        this.linhas = [];
        this.enderecoAtual = -1;

        for (const instrucao of instrucoes) {
            const linha = document.createElement('div');
            linha.className = 'linha';
            linha.appendChild(criarTexto('endereco', hex2(instrucao.endereco >> 8) + hex2(instrucao.endereco & 0xFF)));
            linha.appendChild(criarTexto('codigo', instrucao.codigo));
            linha.appendChild(criarTexto('comentario', instrucao.comentario));
            this.lista.appendChild(linha);
            this.linhas.push(linha);
        }
    }

    // Chamada a cada quadro com o PC atual; só mexe na página quando o PC mudou
    atualizar(pc) {
        if (pc === this.enderecoAtual) {
            return;
        }

        this.enderecoAtual = pc;
        const indice = (pc - ENDERECO_INICIAL) / 2;
        const instrucao = this.instrucoes[indice];

        for (let i = 0; i < this.linhas.length; i++) {
            this.linhas[i].classList.toggle('feita', i < indice);
        }

        this.destaque.classList.toggle('oculto', instrucao === undefined);

        if (instrucao !== undefined) {
            this.destaque.style.top = this.linhas[indice].offsetTop + 'px';
            this.mostrarNaTela(this.linhas[indice]);
        }

        this.mostrarExplicacao(instrucao);
    }

    // Rola a lista só quando a instrução sai da parte visível
    mostrarNaTela(linha) {
        const topo = linha.offsetTop;
        const base = topo + linha.offsetHeight;

        if (topo < this.lista.scrollTop || base > this.lista.scrollTop + this.lista.clientHeight) {
            this.lista.scrollTop = topo - this.lista.clientHeight / 2;
        }
    }

    mostrarExplicacao(instrucao) {
        const titulo = this.agora.querySelector('.agora-instrucao');
        const comentario = this.agora.querySelector('.agora-comentario');

        if (instrucao === undefined) {
            titulo.textContent = 'Fim da listagem';
            comentario.textContent = '';
            return;
        }

        titulo.textContent = instrucao.codigo + ' no endereço 0x' + instrucao.endereco.toString(16).toUpperCase();
        comentario.textContent = instrucao.comentario !== ''
            ? instrucao.comentario
            : 'Dica: escreva um comentário depois de // para explicar esta instrução.';
    }
}

function criarTexto(classe, texto) {
    const elemento = document.createElement('span');
    elemento.className = classe;
    elemento.textContent = texto;
    return elemento;
}
