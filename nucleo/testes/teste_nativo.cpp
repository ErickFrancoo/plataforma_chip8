// Testador nativo: roda os casos de casos.txt e alguns testes extras no núcleo compilado com g++.
// Uso, na raiz do repositório: nucleo/build/teste_nativo.exe
#include "../src/chip8.hpp"
#include <fstream>
#include <sstream>
#include <string>
#include <vector>

constexpr int LIMITE_DE_INSTRUCOES = 1000;

// Mesma ordem dos códigos de parada em chip8.hpp
const std::vector<std::string> PARADAS = {"rodando", "fim", "instrucao_desconhecida", "pilha",
                                          "salto_invalido", "indice_invalido", "pc_fora_da_memoria"};

int total = 0;
int falhas = 0;

void Verificar(const std::string& nome, const bool passou, const std::string& detalhe = "")
{
    total++;

    if(passou)
    {
        std::cout << "ok      " << nome << std::endl;
    }
    else
    {
        falhas++;
        std::cout << "FALHOU  " << nome << detalhe << std::endl;
    }
}

std::string Hex(const int valor)
{
    std::stringstream texto;
    texto << std::uppercase << std::hex << valor;
    return texto.str();
}

// "6003 6107" vira {0x60, 0x03, 0x61, 0x07}
std::vector<uint8_t> Bytes_Do_Texto(const std::string& texto)
{
    std::vector<uint8_t> bytes;
    std::stringstream instrucoes(texto);
    std::string instrucao;

    while(instrucoes >> instrucao)
    {
        bytes.push_back(static_cast<uint8_t>(std::stoi(instrucao.substr(0, 2), nullptr, 16)));
        bytes.push_back(static_cast<uint8_t>(std::stoi(instrucao.substr(2, 2), nullptr, 16)));
    }

    return bytes;
}

// chave: V0 a VF, I, PC, SP, DT, ST ou parada
int Valor_Obtido(const chip8& chip, const std::string& chave)
{
    if(chave == "I")
        return chip.Get_Index();
    if(chave == "PC")
        return chip.Get_PC();
    if(chave == "SP")
        return chip.Get_SP();
    if(chave == "DT")
        return chip.Get_Delay_Timer();
    if(chave == "ST")
        return chip.Get_Sound_Timer();
    if(chave == "parada")
        return chip.Get_Last_Error();

    return chip.Get_Register(std::stoi(chave.substr(1), nullptr, 16));
}

// Os valores vêm em hexadecimal, exceto a parada, que vem pelo nome
int Valor_Esperado(const std::string& chave, const std::string& valor)
{
    if(chave == "parada")
    {
        for(size_t codigo = 0; codigo < PARADAS.size(); codigo++)
            if(PARADAS[codigo] == valor)
                return static_cast<int>(codigo);

        return -1;
    }

    return std::stoi(valor, nullptr, 16);
}

std::string Texto_Do_Valor(const std::string& chave, const int valor)
{
    if(chave == "parada")
        return PARADAS.at(valor);

    return Hex(valor);
}

// Linha no formato: nome; programa; estado esperado
void Rodar_Caso(const std::string& linha)
{
    std::stringstream partes(linha);
    std::string nome, programa, esperado;
    std::getline(partes, nome, ';');
    std::getline(partes, programa, ';');
    std::getline(partes, esperado);

    std::vector<uint8_t> bytes = Bytes_Do_Texto(programa);
    chip8 chip;
    chip.Load_ROM(bytes.data(), bytes.size());
    chip.Run(LIMITE_DE_INSTRUCOES);

    std::stringstream condicoes(esperado);
    std::string condicao;
    std::string diferencas;

    while(condicoes >> condicao) // cada condição tem a forma chave=valor, como V2=0A
    {
        size_t igual = condicao.find('=');
        std::string chave = condicao.substr(0, igual);
        std::string valor = condicao.substr(igual + 1);
        int obtido = Valor_Obtido(chip, chave);

        if(obtido != Valor_Esperado(chave, valor))
            diferencas += " | " + chave + " esperado " + valor + ", obtido " + Texto_Do_Valor(chave, obtido);
    }

    Verificar(nome, diferencas.empty(), diferencas);
}

void Testar_Load_ROM(void)
{
    chip8 chip;
    std::vector<uint8_t> vazio;
    std::vector<uint8_t> grande(3585, 0);
    std::vector<uint8_t> maximo(3584, 0);

    Verificar("Load_ROM recusa programa vazio", !chip.Load_ROM(vazio.data(), vazio.size()));
    Verificar("Load_ROM recusa programa com mais de 3584 bytes", !chip.Load_ROM(grande.data(), grande.size()));
    Verificar("Load_ROM aceita programa com 3584 bytes", chip.Load_ROM(maximo.data(), maximo.size()));
}

void Testar_Reset(void)
{
    std::vector<uint8_t> soma = Bytes_Do_Texto("6003 6107 8200 8214 1208");
    chip8 chip;
    chip.Load_ROM(soma.data(), soma.size());
    chip.Run(LIMITE_DE_INSTRUCOES);
    chip.Reset();

    Verificar("Reset limpa registradores, PC, memoria e parada",
              chip.Get_Register(2) == 0 && chip.Get_PC() == ROM_START_ADDRESS &&
              chip.Get_Memory(ROM_START_ADDRESS) == 0 && chip.Get_Last_Error() == RUNNING);
    Verificar("Reset mantem a fonte na memoria", chip.Get_Memory(FONT_START_ADDRESS) == 0xF0);
}

// Roda C0FF (V0 recebe um número sorteado) e devolve V0
int Sortear(chip8& chip, const uint32_t semente)
{
    std::vector<uint8_t> sorteio = Bytes_Do_Texto("C0FF 1202");
    chip.Reset();
    chip.Set_Seed(semente);
    chip.Load_ROM(sorteio.data(), sorteio.size());
    chip.Run(LIMITE_DE_INSTRUCOES);
    return chip.Get_Register(0);
}

void Testar_Semente(void)
{
    chip8 chip;
    int primeiro = Sortear(chip, 42);
    int segundo = Sortear(chip, 42);
    Verificar("mesma semente gera o mesmo sorteio", primeiro == segundo);
}

int main(int argc, char* argv[])
{
    std::string arquivo = "nucleo/testes/casos.txt";

    if(argc > 1)
        arquivo = argv[1];

    std::ifstream casos(arquivo);

    if(!casos)
    {
        std::cout << "Nao foi possivel abrir " << arquivo << std::endl;
        return 1;
    }

    std::string linha;

    while(std::getline(casos, linha))
    {
        if(linha.empty() || linha[0] == '#' || linha.find(';') == std::string::npos)
            continue;

        Rodar_Caso(linha);
    }

    Testar_Load_ROM();
    Testar_Reset();
    Testar_Semente();

    std::cout << std::endl << std::dec << total - falhas << " de " << total << " testes passaram" << std::endl;

    return falhas == 0 ? 0 : 1;
}
