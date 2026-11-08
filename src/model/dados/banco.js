// Abre o banco de dados (um arquivo SQLite) e cria as tabelas que ainda não existirem.
// O SQLite já vem no Node (node:sqlite), sem nada para instalar.
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const ARQUIVO_PADRAO = path.join(__dirname, '..', '..', '..', 'banco-de-dados', 'plataforma.db');

// Os testes usam ':memory:', um banco que existe só enquanto o teste roda
function abrirBanco(arquivo = ARQUIVO_PADRAO) {
    if (arquivo !== ':memory:') {
        fs.mkdirSync(path.dirname(arquivo), { recursive: true });
    }

    const banco = new DatabaseSync(arquivo);

    // O SQLite só confere as chaves estrangeiras (REFERENCES) quando isso é ligado
    banco.exec('PRAGMA foreign_keys = ON');

    banco.exec(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            nome       TEXT    NOT NULL,
            email      TEXT    NOT NULL UNIQUE,
            senha_hash TEXT    NOT NULL,
            papel      TEXT    NOT NULL,
            bloqueado  INTEGER NOT NULL DEFAULT 0
        )
    `);

    // A situação é PUBLICADO (os aprendizes veem) ou RASCUNHO (só os instrutores veem)
    banco.exec(`
        CREATE TABLE IF NOT EXISTS desafios (
            id                    INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo                TEXT    NOT NULL,
            enunciado             TEXT    NOT NULL,
            conceito              TEXT    NOT NULL,
            dificuldade           TEXT    NOT NULL,
            limite_de_instrucoes  INTEGER NOT NULL,
            solucao_de_referencia TEXT    NOT NULL,
            situacao              TEXT    NOT NULL
        )
    `);

    // As condições do resultado esperado: um desafio tem uma ou mais. Elas fazem parte do desafio,
    // então ON DELETE CASCADE apaga as condições junto quando o desafio é excluído.
    banco.exec(`
        CREATE TABLE IF NOT EXISTS condicoes (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            desafio_id     INTEGER NOT NULL REFERENCES desafios (id) ON DELETE CASCADE,
            tipo           TEXT    NOT NULL,
            alvo           TEXT    NOT NULL,
            valor_esperado INTEGER NOT NULL
        )
    `);

    // Uma linha por desafio resolvido. A chave é o par (usuário, desafio): cada um resolve um desafio uma vez só.
    // Aqui não há ON DELETE CASCADE: um desafio que alguém já resolveu não pode ser excluído.
    banco.exec(`
        CREATE TABLE IF NOT EXISTS desafios_resolvidos (
            usuario_id INTEGER NOT NULL REFERENCES usuarios (id),
            desafio_id INTEGER NOT NULL REFERENCES desafios (id),
            programa   TEXT    NOT NULL,
            data       TEXT    NOT NULL,
            PRIMARY KEY (usuario_id, desafio_id)
        )
    `);

    return banco;
}

module.exports = { abrirBanco };
