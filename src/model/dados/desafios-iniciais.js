// Os desafios gravados no banco na primeira vez que a plataforma roda (DesafioRepositorio.criarDesafiosIniciais).
// O banco escolhe os ids na ordem: 1, 2 e 3. Cada solução de referência é testada em testes/verificador.test.js.
module.exports = [
    {
        titulo: 'Somar 3 e 7',
        enunciado: 'Some 3 e 7 e deixe o resultado no registrador V2.',
        conceito: 'Registradores',
        dificuldade: 'Fácil',
        limiteDeInstrucoes: 1000,
        condicoes: [
            { tipo: 'REGISTRADOR', alvo: 'V2', valorEsperado: 0x0A }
        ],
        situacao: 'PUBLICADO',
        solucaoDeReferencia: '6003 6107 8200 8214 1208'
    },
    {
        titulo: 'Guardar 5 na memória',
        enunciado: 'Guarde o valor 5 no endereço 0x300 da memória.',
        conceito: 'Memória',
        dificuldade: 'Fácil',
        limiteDeInstrucoes: 1000,
        condicoes: [
            { tipo: 'MEMORIA', alvo: '0x300', valorEsperado: 0x05 }
        ],
        situacao: 'PUBLICADO',
        solucaoDeReferencia: '6005 A300 F055 1206'
    },
    {
        titulo: 'Somar de 1 a 5',
        enunciado: 'Some 1 + 2 + 3 + 4 + 5 e deixe o resultado no registrador V0. Use um laço.',
        conceito: 'Laços',
        dificuldade: 'Médio',
        limiteDeInstrucoes: 1000,
        condicoes: [
            { tipo: 'REGISTRADOR', alvo: 'V0', valorEsperado: 0x0F }
        ],
        situacao: 'PUBLICADO',
        solucaoDeReferencia: '6000 6101 8014 7101 3106 1204 120C'
    }
];
