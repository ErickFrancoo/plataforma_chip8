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
}

module.exports = ResolvidoRepositorio;
