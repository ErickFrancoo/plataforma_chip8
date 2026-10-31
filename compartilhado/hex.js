// Conversão entre o texto do editor e os bytes do programa.
// Usado pelo laboratório (navegador) e, na próxima etapa, pelo verificador (servidor),
// para que os dois leiam um programa exatamente do mesmo jeito.

const TAMANHO_MAXIMO = 3584; // espaço livre na memória, de 0x200 a 0xFFF

// Converte o texto do editor em bytes. Cada instrução tem 4 dígitos hexadecimais,
// e o que vem depois de // numa linha é comentário.
// Devolve { bytes, erros }: se a lista de erros não estiver vazia, o programa não deve ser executado.
function converterPrograma(texto) {
    const bytes = [];
    const erros = [];
    const linhas = texto.split('\n');

    for (let i = 0; i < linhas.length; i++) {
        const semComentario = linhas[i].split('//')[0];

        for (const palavra of semComentario.split(/\s+/)) {
            if (palavra === '') {
                continue;
            }

            if (!/^[0-9a-fA-F]{4}$/.test(palavra)) {
                erros.push(`linha ${i + 1}: "${palavra}" não é uma instrução de 4 dígitos hexadecimais`);
                continue;
            }

            bytes.push(parseInt(palavra.slice(0, 2), 16));
            bytes.push(parseInt(palavra.slice(2, 4), 16));
        }
    }

    if (bytes.length === 0 && erros.length === 0) {
        erros.push('o programa está vazio');
    }

    if (bytes.length > TAMANHO_MAXIMO) {
        erros.push(`o programa tem ${bytes.length} bytes, e o máximo é ${TAMANHO_MAXIMO}`);
    }

    return { bytes: new Uint8Array(bytes), erros: erros };
}

// Faz o caminho inverso: transforma os bytes de um arquivo .ch8 em texto para o editor,
// com 8 instruções por linha. Um último byte sozinho ganha um 00 para completar a instrução.
function textoDoPrograma(bytes) {
    const palavras = [];

    for (let i = 0; i < bytes.length; i += 2) {
        const alto = bytes[i];
        const baixo = i + 1 < bytes.length ? bytes[i + 1] : 0;
        palavras.push(hex2(alto) + hex2(baixo));
    }

    const linhas = [];

    for (let i = 0; i < palavras.length; i += 8) {
        linhas.push(palavras.slice(i, i + 8).join(' '));
    }

    return linhas.join('\n');
}

// Escreve um byte com 2 dígitos hexadecimais, como 0A
function hex2(valor) {
    return valor.toString(16).toUpperCase().padStart(2, '0');
}

// No Node (testes e servidor) as funções são exportadas; no navegador elas ficam disponíveis direto.
if (typeof module !== 'undefined') {
    module.exports = { converterPrograma, textoDoPrograma, TAMANHO_MAXIMO };
}
