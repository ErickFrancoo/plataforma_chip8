#pragma once

#include <iostream>
#include <cstdint>
#include <cstddef>
#include <array>
#include <random>

constexpr uint8_t VIDEO_HEIGHT = 32;
constexpr uint8_t VIDEO_WIDTH = 64;
constexpr uint8_t FONT_SIZE = 80;
constexpr uint8_t FONT_START_ADDRESS = 0x050;
constexpr uint16_t MEMORY_SIZE = 4096;
constexpr uint16_t ROM_START_ADDRESS = 0x200;
constexpr int INSTRUCTIONS_PER_TIMER_TICK = 10; //Run updates the timers by counting instructions, not by real time,
                                                //so a program always gives the same result
inline bool debug_mode = false;

//stop codes returned by Get_Last_Error
constexpr int RUNNING = 0;
constexpr int PROGRAM_END = 1;
constexpr int UNKNOWN_INSTRUCTION = 2;
constexpr int STACK_ERROR = 3;
constexpr int INVALID_JUMP = 4;
constexpr int INVALID_INDEX = 5;
constexpr int PC_OUT_OF_MEMORY = 6;

class chip8
{
    public:
        
        chip8(void);
        void Reset(void); //puts the machine back in its initial state. quirk flags and the random generator don't change
        bool Load_ROM(const char*);
        bool Load_ROM(const uint8_t*, const size_t); //loads a program from a buffer, like the bytes sent by the web platform
        bool Cycle(void);
        bool Run(const int); //runs up to N instructions and updates the timers. returns false if the machine stopped
        void Update_Timers(void);
        void Print_Memory(const int, const int);
        void Print_Registers(void);
        void Set_Vy_Shift(bool);
        void Set_Vx_Jump(bool);
        void Set_Legacy_Indexing(bool);
        void Set_FX1E_Sets_OV(bool);
        void Set_Logic_Resets_VF(bool);
        void Set_KeyPad(const int, bool);
        void Set_Seed(const uint32_t); //seed of the random numbers used by CXNN
        bool Get_Video(const int) const;
        bool Is_Sound_Active(void) const;
        uint8_t Get_Register(const int) const;
        uint16_t Get_Index(void) const;
        uint16_t Get_PC(void) const;
        uint8_t Get_SP(void) const;
        uint16_t Get_Stack(const int) const;
        uint8_t Get_Delay_Timer(void) const;
        uint8_t Get_Sound_Timer(void) const;
        uint8_t Get_Memory(const int) const;
        int Get_Last_Error(void) const; //returns one of the stop codes
        
    private:
        bool video[VIDEO_HEIGHT * VIDEO_WIDTH] = {};
        uint16_t pc = 0;
        uint8_t delay_timer = 0;
        uint8_t sound_timer = 0;
        uint8_t keypad[16] = {};
        uint8_t registers[16] = {};
        uint8_t memory[MEMORY_SIZE] = {};
        uint16_t index = 0;
        uint16_t opcode = 0;
        uint8_t sp = 0;
        std::array<uint16_t, 16> stack = {};
        std::mt19937 rnd_generator;
        std::uniform_int_distribution<int> rnd_byte_dist;
        int last_error = RUNNING;
        bool vy_shift = false;
        bool vx_jump = false;
        bool legacy_indexing = false;
        bool fx1e_sets_ov = false;
        bool logic_resets_vf = false;
        bool waiting_key_release = false;
        uint8_t waiting_key = 0;
        int timer_counter = 0; //instructions since the last timer update
        
        bool Fetch(void);
        void Execute(void);
        void Warning(const int); //prints error message, saves the stop code and stops execution
        void OP_00E0(void); //clears screen
        void OP_1NNN(void); //jumps to NNN. a jump to itself ends the program
        void OP_2NNN(void); //calls subroutine at NNN
        void OP_00EE(void); //returns from subroutine
        void OP_3XNN(void); //skips one instruction if value in VX is equal to NN
        void OP_4XNN(void); //skips one instruction if value in VX is NOT equal to NN
        void OP_5XY0(void); //skips one instruction if value in VX is equal to value in VY
        void OP_9XY0(void); //skips one instruction if value in VX is NOT equal to value in VY
        void OP_6XNN(void); //sets register VX to value NN
        void OP_7XNN(void); //adds value NN to register VX
        void OP_8XY0(void); //VX is set to the value of VY
        void OP_8XY1(void); //VX is set to result of bitwise OR of VX and VY
        void OP_8XY2(void); //VX is set to result of bitwise AND of VX and VY
        void OP_8XY3(void); //VX is set to result of bitwise XOR of VX and VY
        void OP_8XY4(void); //VX is set to result of VX + VY. affects VF
        void OP_8XY5(void); //VX is set to result of VX - VY. affects VF
        void OP_8XY7(void); //VX is set to result of VY - VX. affects VF
        void OP_8XY6(void); //may set the value of VX to the value of VY (--vy_shift flag) before rest of the operation.
                            //shifts the value of VX one bit to the right. affects VF based on the bit that was shifted
        void OP_8XYE(void); //may set the value of VX to the value of VY (--vy_shift flag) before rest of the operation.
                            //shifts the value of VX one bit to the left. affects VF based on the bit that was shifted
        void OP_ANNN(void); //sets index to value NNN
        void OP_BNNN(void); //sets pc to address NNN + V0. if --vx_jump is enabled this instruction works more like BXNN,
                            //where pc is set to address XNN + VX.
        void OP_CXNN(void); //VX is set to bitwise AND between NN and a random number
        void OP_DXYN(void); //draws N pixels tall sprite from memory location in index, at the horizontal X coordinate
                            //represented by the value in VX and the Y coordinate in VY.
        void OP_FX07(void); //VX is set to value of the delay timer
        void OP_FX15(void); //delay timer is set to value of VX 
        void OP_FX18(void); //sound timer is set to value of VX
        void OP_EX9E(void); //skips one instruction if the key corresponding to value of VX is pressed
        void OP_EXA1(void); //skips one instruction if the key corresponding to value of VX is not pressed
        void OP_FX0A(void); //waits for keypad input and then sets VX to input value
        void OP_FX1E(void); //adds value of VX to index. sets VF to 1 if value overflows
        void OP_FX29(void); //sets index to address of hex character in VX
        void OP_FX33(void); //converts byte in VX to three decimal digits and stores them at index, index+1 and index+2
        void OP_FX55(void); //stores in successive memory addresses the values from V0 to VX
        void OP_FX65(void); //stores successive memory addresses in the registers V0 to VX
};