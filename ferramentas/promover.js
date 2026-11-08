// Muda o papel de uma conta. Enquanto não existe a página do administrador (UC17), é assim que se cria
// um instrutor. A conta precisa já existir (cadastrada pela página Entrar).
// Uso: npm.cmd run promover -- ana@exemplo.com INSTRUTOR
const { abrirBanco } = require('../src/model/dados/banco');
const UsuarioRepositorio = require('../src/model/dados/UsuarioRepositorio');
const { Usuario, PAPEL_APRENDIZ, PAPEL_INSTRUTOR, PAPEL_ADMINISTRADOR } = require('../src/model/dominio/Usuario');

const PAPEIS = [PAPEL_APRENDIZ, PAPEL_INSTRUTOR, PAPEL_ADMINISTRADOR];

function promover(email, papel) {
    if (!email || !PAPEIS.includes(papel)) {
        console.log('Uso: npm.cmd run promover -- email PAPEL');
        console.log('O PAPEL é ' + PAPEIS.join(', ') + '.');
        process.exitCode = 1;
        return;
    }

    const usuarios = new UsuarioRepositorio(abrirBanco());
    const usuario = usuarios.buscarPorEmail(Usuario.normalizarEmail(email));

    if (usuario === undefined) {
        console.log('Não existe uma conta com o e-mail ' + email + '.');
        process.exitCode = 1;
        return;
    }

    usuarios.alterarPapel(usuario.id, papel);
    console.log(usuario.nome + ' agora é ' + papel + '.');
}

// process.argv tem o node, o caminho deste arquivo e depois o que foi digitado no comando
promover(process.argv[2], (process.argv[3] || '').toUpperCase());
