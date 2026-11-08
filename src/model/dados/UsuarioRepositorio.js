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

    // Usado pelo comando "promover", enquanto não existe a página do administrador (UC17)
    alterarPapel(id, papel) {
        this.banco.prepare('UPDATE usuarios SET papel = ? WHERE id = ?').run(papel, id);
    }

    // Transforma uma linha da tabela num objeto Usuario
    criarUsuario(linha) {
        return new Usuario(linha.id, linha.nome, linha.email, linha.senha_hash, linha.papel, linha.bloqueado === 1);
    }
}

module.exports = UsuarioRepositorio;
