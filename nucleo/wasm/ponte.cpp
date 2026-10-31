// Liga a classe chip8 ao JavaScript (embind). Usado só na compilação com o Emscripten.
#include <emscripten/bind.h>
#include <vector>
#include "../src/chip8.hpp"

using namespace emscripten;

// No JavaScript o programa chega como Uint8Array; aqui ele vira um vetor de bytes.
bool Load_ROM_JS(chip8& chip, const val& programa)
{
    std::vector<uint8_t> bytes = convertJSArrayToNumberVector<uint8_t>(programa);
    return chip.Load_ROM(bytes.data(), bytes.size());
}

EMSCRIPTEN_BINDINGS(nucleo_chip8)
{
    constant("RUNNING", RUNNING);
    constant("PROGRAM_END", PROGRAM_END);
    constant("UNKNOWN_INSTRUCTION", UNKNOWN_INSTRUCTION);
    constant("STACK_ERROR", STACK_ERROR);
    constant("INVALID_JUMP", INVALID_JUMP);
    constant("INVALID_INDEX", INVALID_INDEX);
    constant("PC_OUT_OF_MEMORY", PC_OUT_OF_MEMORY);

    class_<chip8>("Chip8")
        .constructor<>()
        .function("Reset", &chip8::Reset)
        .function("Load_ROM", &Load_ROM_JS)
        .function("Set_Seed", &chip8::Set_Seed)
        .function("Cycle", &chip8::Cycle)
        .function("Run", &chip8::Run)
        .function("Update_Timers", &chip8::Update_Timers)
        .function("Set_KeyPad", &chip8::Set_KeyPad)
        .function("Get_Video", &chip8::Get_Video)
        .function("Is_Sound_Active", &chip8::Is_Sound_Active)
        .function("Get_Register", &chip8::Get_Register)
        .function("Get_Index", &chip8::Get_Index)
        .function("Get_PC", &chip8::Get_PC)
        .function("Get_SP", &chip8::Get_SP)
        .function("Get_Stack", &chip8::Get_Stack)
        .function("Get_Delay_Timer", &chip8::Get_Delay_Timer)
        .function("Get_Sound_Timer", &chip8::Get_Sound_Timer)
        .function("Get_Memory", &chip8::Get_Memory)
        .function("Get_Last_Error", &chip8::Get_Last_Error)
        .function("Set_Vy_Shift", &chip8::Set_Vy_Shift)
        .function("Set_Vx_Jump", &chip8::Set_Vx_Jump)
        .function("Set_Legacy_Indexing", &chip8::Set_Legacy_Indexing)
        .function("Set_FX1E_Sets_OV", &chip8::Set_FX1E_Sets_OV)
        .function("Set_Logic_Resets_VF", &chip8::Set_Logic_Resets_VF);
}
