// Perfis de quirks: as variantes do CHIP-8 executam algumas instruções de jeitos diferentes.
// A plataforma usa o perfil original em todo lugar (laboratório e, depois, verificador).
// O perfil moderno existe só para rodar jogos feitos para o SUPER-CHIP.

// CHIP-8 original, do computador COSMAC VIP
function usarPerfilOriginal(chip) {
    chip.Set_Vy_Shift(true);         // 8XY6 e 8XYE deslocam VY, e não VX
    chip.Set_Legacy_Indexing(true);  // FX55 e FX65 avançam o I
    chip.Set_Logic_Resets_VF(true);  // 8XY1, 8XY2 e 8XY3 zeram VF
    chip.Set_Vx_Jump(false);         // BNNN salta para NNN + V0
    chip.Set_FX1E_Sets_OV(false);    // FX1E não mexe em VF
}

// SUPER-CHIP, usado pela maioria dos jogos mais novos
function usarPerfilModerno(chip) {
    chip.Set_Vy_Shift(false);
    chip.Set_Legacy_Indexing(false);
    chip.Set_Logic_Resets_VF(false);
    chip.Set_Vx_Jump(true);
    chip.Set_FX1E_Sets_OV(false);
}

if (typeof module !== 'undefined') {
    module.exports = { usarPerfilOriginal, usarPerfilModerno };
}
