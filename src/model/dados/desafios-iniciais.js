// Os desafios gravados no banco na primeira vez que a plataforma roda (DesafioRepositorio.criarDesafiosIniciais).
// O banco escolhe os ids na ordem, de 1 a 10. Cada solução de referência é testada em testes/verificador.test.js.
// Os desafios só são gravados num banco vazio: quem já tem um banco precisa apagar a pasta banco-de-dados
// para receber os que forem acrescentados aqui.
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
    },
    {
        titulo: 'Trocar dois registradores',
        enunciado: 'Coloque 3 em V0 e 8 em V1. Depois troque os valores: V0 precisa terminar com 8 e V1 com 3. ' +
                   'Dica: use um terceiro registrador para não perder um dos valores.',
        conceito: 'Registradores',
        dificuldade: 'Fácil',
        limiteDeInstrucoes: 1000,
        condicoes: [
            { tipo: 'REGISTRADOR', alvo: 'V0', valorEsperado: 0x08 },
            { tipo: 'REGISTRADOR', alvo: 'V1', valorEsperado: 0x03 }
        ],
        situacao: 'PUBLICADO',
        solucaoDeReferencia: '6003 6108 8200 8010 8120 120A'
    },
    {
        titulo: 'Subtrair e conferir o VF',
        enunciado: 'Calcule 10 − 4 com a instrução de subtração (8XY5) e deixe o resultado em V0. Repare no VF: ' +
                   'ele fica 1 quando a subtração não precisou "pedir emprestado".',
        conceito: 'Flags',
        dificuldade: 'Fácil',
        limiteDeInstrucoes: 1000,
        condicoes: [
            { tipo: 'REGISTRADOR', alvo: 'V0', valorEsperado: 0x06 },
            { tipo: 'REGISTRADOR', alvo: 'VF', valorEsperado: 0x01 }
        ],
        situacao: 'PUBLICADO',
        solucaoDeReferencia: '600A 6104 8015 1206'
    },
    {
        titulo: 'O vai-um',
        enunciado: 'Some 200 e 100 com a instrução 8XY4 e deixe a soma em V0. Um registrador só guarda até 255, ' +
                   'então o resultado não cabe: V0 fica com o que sobra, e o VF guarda o vai-um.',
        conceito: 'Flags',
        dificuldade: 'Médio',
        limiteDeInstrucoes: 1000,
        condicoes: [
            { tipo: 'REGISTRADOR', alvo: 'V0', valorEsperado: 0x2C },
            { tipo: 'REGISTRADOR', alvo: 'VF', valorEsperado: 0x01 }
        ],
        situacao: 'PUBLICADO',
        solucaoDeReferencia: '60C8 6164 8014 1206'
    },
    {
        titulo: 'Guardar três números',
        enunciado: 'Grave 1 no endereço 0x300, 2 no 0x301 e 3 no 0x302. Dica: coloque os valores em V0, V1 e V2, ' +
                   'aponte o I para 0x300 e use a instrução FX55, que grava de V0 até VX de uma vez.',
        conceito: 'Memória',
        dificuldade: 'Médio',
        limiteDeInstrucoes: 1000,
        condicoes: [
            { tipo: 'MEMORIA', alvo: '0x300', valorEsperado: 0x01 },
            { tipo: 'MEMORIA', alvo: '0x301', valorEsperado: 0x02 },
            { tipo: 'MEMORIA', alvo: '0x302', valorEsperado: 0x03 }
        ],
        situacao: 'PUBLICADO',
        solucaoDeReferencia: '6001 6102 6203 A300 F255 120A'
    },
    {
        titulo: 'O maior de dois',
        enunciado: 'Coloque 7 em V0 e 9 em V1 e deixe em V2 o maior dos dois. Faça o programa decidir com um teste, ' +
                   'como se os números pudessem ser outros. Dica: a subtração (8XY5) deixa VF = 1 quando o primeiro ' +
                   'número é maior ou igual ao segundo, e 3XNN pula a próxima instrução.',
        conceito: 'Desvios',
        dificuldade: 'Médio',
        limiteDeInstrucoes: 1000,
        condicoes: [
            { tipo: 'REGISTRADOR', alvo: 'V2', valorEsperado: 0x09 }
        ],
        situacao: 'PUBLICADO',
        solucaoDeReferencia: '6007 6109 8200 8300 8315 3F01 8210 120E'
    },
    {
        titulo: 'Multiplicar com somas',
        enunciado: 'O CHIP-8 não tem instrução de multiplicação. Calcule 6 × 4 somando 6 quatro vezes, num laço, ' +
                   'e deixe o resultado em V2.',
        conceito: 'Laços',
        dificuldade: 'Médio',
        limiteDeInstrucoes: 1000,
        condicoes: [
            { tipo: 'REGISTRADOR', alvo: 'V2', valorEsperado: 0x18 }
        ],
        situacao: 'PUBLICADO',
        solucaoDeReferencia: '6200 6304 7206 73FF 3300 1204 120C'
    },
    {
        titulo: 'A sub-rotina',
        enunciado: 'Escreva uma sub-rotina que soma 5 em V0 e termina com 00EE (voltar). Começando com V0 = 0, ' +
                   'chame a sub-rotina três vezes com 2NNN. Dica: coloque a sub-rotina depois do salto de fim do ' +
                   'programa.',
        conceito: 'Sub-rotinas',
        dificuldade: 'Difícil',
        limiteDeInstrucoes: 1000,
        condicoes: [
            { tipo: 'REGISTRADOR', alvo: 'V0', valorEsperado: 0x0F }
        ],
        situacao: 'PUBLICADO',
        solucaoDeReferencia: '6000 220A 220A 220A 1208 7005 00EE'
    }
];
