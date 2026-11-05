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

    // Uma linha por desafio resolvido. A chave é o par (usuário, desafio): cada um resolve um desafio uma vez só.
    // Os desafios ainda ficam num arquivo, por isso desafio_id não aponta para outra tabela.
    banco.exec(`
        CREATE TABLE IF NOT EXISTS desafios_resolvidos (
            usuario_id INTEGER NOT NULL REFERENCES usuarios (id),
            desafio_id INTEGER NOT NULL,
            programa   TEXT    NOT NULL,
            data       TEXT    NOT NULL,
            PRIMARY KEY (usuario_id, desafio_id)
        )
    `);

    return banco;
}

module.exports = { abrirBanco };
