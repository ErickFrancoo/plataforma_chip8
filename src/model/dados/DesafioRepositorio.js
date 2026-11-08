// Grava e busca os desafios no banco de dados. Cada desafio fica em duas tabelas: desafios e condicoes.
const { Desafio, SITUACAO_PUBLICADO } = require('../dominio/Desafio');
const DESAFIOS_INICIAIS = require('./desafios-iniciais');

class DesafioRepositorio {
    constructor(banco) {
        this.banco = banco;
    }

    // Na primeira vez que a plataforma roda, a tabela está vazia: grava os desafios iniciais
    criarDesafiosIniciais() {
        const { total } = this.banco.prepare('SELECT COUNT(*) AS total FROM desafios').get();

        if (total === 0) {
            for (const dados of DESAFIOS_INICIAIS) {
                this.salvar(new Desafio(dados));
            }
        }
    }

    // Os desafios que os aprendizes veem
    listarPublicados() {
        const linhas = this.banco.prepare('SELECT * FROM desafios WHERE situacao = ? ORDER BY id').all(SITUACAO_PUBLICADO);
        return linhas.map((linha) => this.criarDesafio(linha));
    }

    // Todos, inclusive os rascunhos (para os instrutores)
    listarTodos() {
        const linhas = this.banco.prepare('SELECT * FROM desafios ORDER BY id').all();
        return linhas.map((linha) => this.criarDesafio(linha));
    }

    // Devolve undefined se não existir um desafio com esse id
    buscar(id) {
        const linha = this.banco.prepare('SELECT * FROM desafios WHERE id = ?').get(id);
        return linha === undefined ? undefined : this.criarDesafio(linha);
    }

    // Grava um desafio novo (sem id) ou as alterações de um que já existe. Num desafio alterado, as
    // condições antigas são apagadas e as novas gravadas no lugar.
    // A transação (BEGIN ... COMMIT) garante que ou tudo é gravado, ou nada: se der erro no meio,
    // o ROLLBACK desfaz o que já tinha sido feito, e o desafio não fica sem condições.
    salvar(desafio) {
        this.banco.exec('BEGIN');

        try {
            if (desafio.id === undefined) {
                const resultado = this.banco
                    .prepare('INSERT INTO desafios (titulo, enunciado, conceito, dificuldade, limite_de_instrucoes, ' +
                             'solucao_de_referencia, situacao) VALUES (?, ?, ?, ?, ?, ?, ?)')
                    .run(desafio.titulo, desafio.enunciado, desafio.conceito, desafio.dificuldade,
                         desafio.limiteDeInstrucoes, desafio.solucaoDeReferencia, desafio.situacao);

                desafio.id = Number(resultado.lastInsertRowid);
            } else {
                this.banco
                    .prepare('UPDATE desafios SET titulo = ?, enunciado = ?, conceito = ?, dificuldade = ?, ' +
                             'limite_de_instrucoes = ?, solucao_de_referencia = ?, situacao = ? WHERE id = ?')
                    .run(desafio.titulo, desafio.enunciado, desafio.conceito, desafio.dificuldade,
                         desafio.limiteDeInstrucoes, desafio.solucaoDeReferencia, desafio.situacao, desafio.id);

                this.banco.prepare('DELETE FROM condicoes WHERE desafio_id = ?').run(desafio.id);
            }

            for (const condicao of desafio.condicoes) {
                this.banco
                    .prepare('INSERT INTO condicoes (desafio_id, tipo, alvo, valor_esperado) VALUES (?, ?, ?, ?)')
                    .run(desafio.id, condicao.tipo, condicao.alvo, condicao.valorEsperado);
            }

            this.banco.exec('COMMIT');
        } catch (erro) {
            this.banco.exec('ROLLBACK');
            throw erro;
        }

        return desafio;
    }

    // Apaga o desafio e as condições dele. O banco recusa (lança um erro) se alguém já resolveu o desafio.
    excluir(id) {
        this.banco.prepare('DELETE FROM desafios WHERE id = ?').run(id);
    }

    // Transforma uma linha da tabela desafios, junto com as condições dela, num objeto Desafio
    criarDesafio(linha) {
        const condicoes = this.banco.prepare('SELECT * FROM condicoes WHERE desafio_id = ? ORDER BY id').all(linha.id);

        return new Desafio({
            id: linha.id,
            titulo: linha.titulo,
            enunciado: linha.enunciado,
            conceito: linha.conceito,
            dificuldade: linha.dificuldade,
            limiteDeInstrucoes: linha.limite_de_instrucoes,
            solucaoDeReferencia: linha.solucao_de_referencia,
            situacao: linha.situacao,
            condicoes: condicoes.map((c) => ({ tipo: c.tipo, alvo: c.alvo, valorEsperado: c.valor_esperado }))
        });
    }
}

module.exports = DesafioRepositorio;
