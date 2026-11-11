// O progresso de um aprendiz (UC12): quantos desafios publicados ele já resolveu, no total e por conceito.
// Nesta versão, só os desafios resolvidos ficam gravados; as tentativas reprovadas não entram na conta.
class Progresso {
    // desafios: os desafios publicados. resolvidos: lista de { desafioId, data }, com a data em UTC.
    constructor(desafios, resolvidos) {
        const dataDe = new Map(resolvidos.map((r) => [r.desafioId, r.data]));

        this.total = desafios.length;
        this.resolvidos = [];  // { titulo, conceito, data }, do mais antigo para o mais recente
        this.porConceito = []; // { conceito, total, resolvidos }, na ordem em que os conceitos aparecem

        for (const desafio of desafios) {
            let grupo = this.porConceito.find((g) => g.conceito === desafio.conceito);

            if (grupo === undefined) {
                grupo = { conceito: desafio.conceito, total: 0, resolvidos: 0 };
                this.porConceito.push(grupo);
            }

            grupo.total++;

            if (dataDe.has(desafio.id)) {
                grupo.resolvidos++;
                this.resolvidos.push({ titulo: desafio.titulo, conceito: desafio.conceito, data: dataDe.get(desafio.id) });
            }
        }

        this.resolvidos.sort((a, b) => a.data.localeCompare(b.data));
    }

    // De 0 a 100, sem casas decimais
    porcentagem() {
        return this.total === 0 ? 0 : Math.round(100 * this.resolvidos.length / this.total);
    }

    // A data vem do banco em UTC, como "2026-11-10T23:40:00.000Z"; aqui vira o dia no horário de Brasília
    static formatarData(data) {
        return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    }
}

module.exports = Progresso;
