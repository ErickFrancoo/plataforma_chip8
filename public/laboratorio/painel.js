// Mostra o estado da máquina: registradores, I, PC, SP, timers e a próxima instrução.
// No passo a passo, destaca o que mudou na última instrução.

class Painel {
    constructor() {
        this.anterior = null; // estado antes da última instrução, usado só no passo a passo
    }

    lerEstado(chip) {
        const estado = {};

        for (let i = 0; i < 16; i++) {
            estado['V' + i.toString(16).toUpperCase()] = chip.Get_Register(i);
        }

        estado.I = chip.Get_Index();
        estado.PC = chip.Get_PC();
        estado.SP = chip.Get_SP();
        estado.DT = chip.Get_Delay_Timer();
        estado.ST = chip.Get_Sound_Timer();
        return estado;
    }

    guardarEstado(chip) {
        this.anterior = this.lerEstado(chip);
    }

    esquecerEstado() {
        this.anterior = null;
    }

    atualizar(chip) {
        const estado = this.lerEstado(chip);

        for (const nome in estado) {
            const digitos = (nome === 'I' || nome === 'PC') ? 3 : 2;
            const elemento = document.getElementById('reg-' + nome);
            elemento.textContent = estado[nome].toString(16).toUpperCase().padStart(digitos, '0');

            const mudou = this.anterior !== null && this.anterior[nome] !== estado[nome];
            elemento.parentElement.classList.toggle('mudou', mudou);
        }

        const pc = estado.PC;
        const instrucao = hex2(chip.Get_Memory(pc)) + hex2(chip.Get_Memory(pc + 1));
        document.getElementById('instrucao').textContent =
            instrucao + ' no endereço 0x' + pc.toString(16).toUpperCase().padStart(3, '0');
    }
}
