// Grava e consulta os desafios que cada usuário já resolveu.
class ResolvidoRepositorio {
    constructor(banco) {
        this.banco = banco;
    }

    // Guarda a solução aprovada. Se o usuário já tinha resolvido o desafio, nada muda:
    // OR IGNORE faz o banco ignorar a linha repetida, e fica a primeira solução.
    registrar(usuarioId, desafioId, programa) {
        this.banco
            .prepare('INSERT OR IGNORE INTO desafios_resolvidos (usuario_id, desafio_id, programa, data) VALUES (?, ?, ?, ?)')
            .run(usuarioId, desafioId, programa, new Date().toISOString());
    }

    // Os ids dos desafios que o usuário já resolveu, como [1, 3]
    desafiosResolvidos(usuarioId) {
        const linhas = this.banco.prepare('SELECT desafio_id FROM desafios_resolvidos WHERE usuario_id = ?').all(usuarioId);
        return linhas.map((linha) => linha.desafio_id);
    }

    // Os desafios que o usuário resolveu e quando, como [{ desafioId: 1, data: '2026-11-10T23:40:00.000Z' }]
    resolvidosComData(usuarioId) {
        const linhas = this.banco
            .prepare('SELECT desafio_id, data FROM desafios_resolvidos WHERE usuario_id = ?')
            .all(usuarioId);
        return linhas.map((linha) => ({ desafioId: linha.desafio_id, data: linha.data }));
    }

    // Quantas pessoas já resolveram um desafio (para o instrutor)
    quantosResolveram(desafioId) {
        return this.banco.prepare('SELECT COUNT(*) AS total FROM desafios_resolvidos WHERE desafio_id = ?').get(desafioId).total;
    }
}

module.exports = ResolvidoRepositorio;
