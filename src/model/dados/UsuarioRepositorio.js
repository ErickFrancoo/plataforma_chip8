// Grava e busca usuários no banco de dados.
const { Usuario } = require('../dominio/Usuario');

class UsuarioRepositorio {
    constructor(banco) {
        this.banco = banco;
    }

    // Grava um usuário novo e preenche o id que o banco escolheu
    salvar(usuario) {
        const resultado = this.banco
            .prepare('INSERT INTO usuarios (nome, email, senha_hash, papel, bloqueado) VALUES (?, ?, ?, ?, ?)')
            .run(usuario.nome, usuario.email, usuario.senhaHash, usuario.papel, usuario.bloqueado ? 1 : 0);

        usuario.id = Number(resultado.lastInsertRowid);
        return usuario;
    }

    // Devolve undefined quando não encontra
    buscarPorId(id) {
        const linha = this.banco.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);
        return linha === undefined ? undefined : this.criarUsuario(linha);
    }

    buscarPorEmail(email) {
        const linha = this.banco.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
        return linha === undefined ? undefined : this.criarUsuario(linha);
    }

    emailEmUso(email) {
        return this.buscarPorEmail(email) !== undefined;
    }

    // Todas as contas, em ordem alfabética (para o administrador)
    listar() {
        const linhas = this.banco.prepare('SELECT * FROM usuarios ORDER BY nome').all();
        return linhas.map((linha) => this.criarUsuario(linha));
    }

    // Usado pela página do administrador (UC17) e pelo comando "promover"
    alterarPapel(id, papel) {
        this.banco.prepare('UPDATE usuarios SET papel = ? WHERE id = ?').run(papel, id);
    }

    alterarBloqueio(id, bloqueado) {
        this.banco.prepare('UPDATE usuarios SET bloqueado = ? WHERE id = ?').run(bloqueado ? 1 : 0, id);
    }

    // Transforma uma linha da tabela num objeto Usuario
    criarUsuario(linha) {
        return new Usuario(linha.id, linha.nome, linha.email, linha.senha_hash, linha.papel, linha.bloqueado === 1);
    }
}

module.exports = UsuarioRepositorio;
