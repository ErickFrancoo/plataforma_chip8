// Uma conta de usuário. A senha nunca é guardada: só um resumo dela (hash), feito com scrypt,
// que não permite descobrir a senha de volta.
const crypto = require('crypto');

const PAPEL_APRENDIZ = 'APRENDIZ';
const PAPEL_INSTRUTOR = 'INSTRUTOR';
const PAPEL_ADMINISTRADOR = 'ADMINISTRADOR';

// A cadeia de papéis do relatório de análise: cada papel tem as permissões dos anteriores
const PAPEIS = [PAPEL_APRENDIZ, PAPEL_INSTRUTOR, PAPEL_ADMINISTRADOR];

const TAMANHO_MINIMO_DA_SENHA = 6;

class Usuario {
    constructor(id, nome, email, senhaHash, papel, bloqueado) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senhaHash = senhaHash; // "sal:resumo", nunca a senha em si
        this.papel = papel;
        this.bloqueado = bloqueado;
    }

    // Cria o resumo de uma senha nova. O sal é um valor aleatório: com ele, duas pessoas com a
    // mesma senha ficam com resumos diferentes.
    static resumirSenha(senha) {
        const sal = crypto.randomBytes(16).toString('hex');
        const resumo = crypto.scryptSync(senha, sal, 64).toString('hex');
        return sal + ':' + resumo;
    }

    // E-mails são comparados sem espaços e em letras minúsculas
    static normalizarEmail(email) {
        return email.trim().toLowerCase();
    }

    // As regras do cadastro (UC07). Devolve a lista de erros; vazia quando está tudo certo.
    static validarCadastro(nome, email, senha) {
        const erros = [];

        if (nome.trim() === '') {
            erros.push('Informe o seu nome.');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            erros.push('Informe um e-mail válido.');
        }

        if (senha.length < TAMANHO_MINIMO_DA_SENHA) {
            erros.push(`A senha precisa ter pelo menos ${TAMANHO_MINIMO_DA_SENHA} caracteres.`);
        }

        return erros;
    }

    conferirSenha(senha) {
        const [sal, resumo] = this.senhaHash.split(':');
        const tentativa = crypto.scryptSync(senha, sal, 64);
        // timingSafeEqual compara sem revelar, pelo tempo da comparação, onde está a diferença
        return crypto.timingSafeEqual(tentativa, Buffer.from(resumo, 'hex'));
    }

    // Um administrador também tem as permissões de instrutor e de aprendiz
    temPapel(minimo) {
        return PAPEIS.indexOf(this.papel) >= PAPEIS.indexOf(minimo);
    }
}

module.exports = { Usuario, PAPEL_APRENDIZ, PAPEL_INSTRUTOR, PAPEL_ADMINISTRADOR };
