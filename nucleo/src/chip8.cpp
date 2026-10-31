#include "chip8.hpp"
#include <iomanip>
#include <fstream>

chip8::chip8(void) //constructor
: rnd_generator(std::random_device{}()),
  rnd_byte_dist(0, 255)
{
    Reset();
}

void chip8::Reset(void)
{
    uint8_t font[FONT_SIZE] = 
    {
        0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
        0x20, 0x60, 0x20, 0x20, 0x70, // 1
        0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
        0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
        0x90, 0x90, 0xF0, 0x10, 0x10, // 4
        0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
        0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
        0xF0, 0x10, 0x20, 0x40, 0x40, // 7
        0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
        0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
        0xF0, 0x90, 0xF0, 0x90, 0x90, // A
        0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
        0xF0, 0x80, 0x80, 0x80, 0xF0, // C
        0xE0, 0x90, 0x90, 0x90, 0xE0, // D
        0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
        0xF0, 0x80, 0xF0, 0x80, 0x80  // F
    };
            
    for(int i = 0; i < MEMORY_SIZE; i++)
        memory[i] = 0;

    for(int i = 0; i < FONT_SIZE; i++)
        memory[FONT_START_ADDRESS + i] = font[i];

    for(int i = 0; i < VIDEO_HEIGHT * VIDEO_WIDTH; i++)
        video[i] = 0;

    for(int i = 0; i < 16; i++)
    {
        registers[i] = 0;
        keypad[i] = 0;
        stack[i] = 0;
    }

    pc = ROM_START_ADDRESS;
    index = 0;
    opcode = 0;
    sp = 0;
    delay_timer = 0;
    sound_timer = 0;
    waiting_key_release = false;
    waiting_key = 0;
    timer_counter = 0;
    last_error = RUNNING;
}

bool chip8::Load_ROM(const char* filename) 
{
    std::fstream rom(filename, std::ios::binary | std::ios::in | std::ios::ate);

    if(!rom)
        return false;

    std::streampos file_pos = rom.tellg();

    if(file_pos <= 0)
        return false;
    
    const std::streamsize ROM_SIZE = static_cast<std::streamsize>(file_pos);
    const std::streamsize AVAILABLE_MEMORY = static_cast<std::streamsize>(MEMORY_SIZE - ROM_START_ADDRESS);

    if(ROM_SIZE > AVAILABLE_MEMORY)
        return false;

    rom.seekg(0, std::ios::beg);

    if(!rom.read(reinterpret_cast<char*>(&memory[ROM_START_ADDRESS]), ROM_SIZE))
        return false;

    return true;
}

bool chip8::Load_ROM(const uint8_t* data, const size_t size)
{
    const size_t AVAILABLE_MEMORY = MEMORY_SIZE - ROM_START_ADDRESS;

    if(data == nullptr || size == 0 || size > AVAILABLE_MEMORY)
        return false;

    for(size_t i = 0; i < size; i++)
        memory[ROM_START_ADDRESS + i] = data[i];

    return true;
}

bool chip8::Fetch(void)
{
    if(pc >= MEMORY_SIZE - 1)
    {
        Warning(PC_OUT_OF_MEMORY);
        return false;
    }

    opcode = static_cast<uint16_t>(memory[pc]) << 8 | static_cast<uint16_t>(memory[pc + 1]);
    pc += 2;

    return true;
}

void chip8::Execute(void)
{
    switch(opcode & 0xF000) //decoder
    {
        case 0x0000:
            if(opcode == 0x00E0)
                OP_00E0();
            else if(opcode == 0x00EE)
                OP_00EE();
            else
                Warning(UNKNOWN_INSTRUCTION);
            break;

        case 0x1000:
            OP_1NNN();
            break;

        case 0x2000:
            OP_2NNN();
            break;

        case 0x3000:
            OP_3XNN();
            break;

        case 0x4000:
            OP_4XNN();
            break;

        case 0x5000:
            if((opcode & 0x000F) == 0)
                OP_5XY0();
            else
                Warning(UNKNOWN_INSTRUCTION);
            break;

        case 0x6000:
            OP_6XNN();
            break;

        case 0x7000:
            OP_7XNN();
            break;
        
        case 0x8000:
            switch(opcode & 0x000F)
            {
                case 0x0000:
                    OP_8XY0();
                    break;
                case 0x0001:
                    OP_8XY1();
                    break;
                case 0x0002:
                    OP_8XY2();
                    break;
                case 0x0003:
                    OP_8XY3();
                    break;
                case 0x0004:
                    OP_8XY4();
                    break;
                case 0x0005:
                    OP_8XY5();
                    break;
                case 0x0006:
                    OP_8XY6();
                    break;
                case 0x0007:
                    OP_8XY7();
                    break;
                case 0x000E:
                    OP_8XYE();
                    break;
                default:
                    Warning(UNKNOWN_INSTRUCTION);
            }
            break;

        case 0x9000:
            if((opcode & 0x000F) == 0)
                OP_9XY0();
            else
                Warning(UNKNOWN_INSTRUCTION);
            break;

        case 0xA000:
            OP_ANNN();
            break;

        case 0xB000:
            OP_BNNN();
            break;

        case 0xC000:
            OP_CXNN();
            break;
        
        case 0xD000:
            OP_DXYN();
            break;

        case 0xF000:
            switch (opcode & 0x00FF)
            {
                case 0x0007:
                    OP_FX07();
                    break;
            
                case 0x0015:
                    OP_FX15();
                    break;
                
                case 0x0018:
                    OP_FX18();
                    break;

                case 0x000A:
                    OP_FX0A();
                    break;

                case 0x001E:
                    OP_FX1E();
                    break;

                case 0x0029:
                    OP_FX29();
                    break;

                case 0x0033:
                    OP_FX33();
                    break;

                case 0x0055:
                    OP_FX55();
                    break;

                case 0x0065:
                    OP_FX65();
                    break;

                default:
                    Warning(UNKNOWN_INSTRUCTION);
                    break;
            }
            break;

        case 0xE000:
            if((opcode & 0x00FF) == 0x009E)
                OP_EX9E();
            else if((opcode & 0x00FF) == 0x00A1)
                OP_EXA1();
            else
                Warning(UNKNOWN_INSTRUCTION);
            break;

        default:
            Warning(UNKNOWN_INSTRUCTION);
            break;
    }
}

bool chip8::Cycle(void)
{
    if(last_error != RUNNING)
        return false;

    if(!Fetch())
        return false;
    
    Execute();

    if(last_error != RUNNING)
        return false;
    
    return true;
}

bool chip8::Run(const int max_instructions)
{
    for(int i = 0; i < max_instructions; i++)
    {
        if(!Cycle())
            return false;

        timer_counter++;

        if(timer_counter == INSTRUCTIONS_PER_TIMER_TICK)
        {
            Update_Timers();
            timer_counter = 0;
        }
    }

    return true;
}

void chip8::Update_Timers(void)
{
    if(delay_timer > 0)
        delay_timer--;
    if(sound_timer > 0)
        sound_timer--;
}

void chip8::Print_Registers(void) //prints all registers, pc and index
{
    if(!debug_mode)
        return;

    for(int i = 0; i < 16; i++)
        std::cout << "register v" << i << ": " << std::hex << static_cast<int>(registers[i]) << std::endl;

    std::cout << "index: " << static_cast<int>(index) <<
    std::endl << "pc: " << static_cast<int>(pc) << 
    std::endl << "delay timer: " << static_cast<int>(delay_timer) <<
    std::endl << "sound timer: " << static_cast<int>(sound_timer) << std::endl;
}

void chip8::Print_Memory(const int start, const int end) //prints memory from start address to end adress
{
    if(!debug_mode)
        return;
    
    if(start < 0 || start >= MEMORY_SIZE || end <= start || end > MEMORY_SIZE)
    {
        std::cout << "\n\nINVALID START OR END POINTS FOR MEMORY PRINT\n\n";
        return;
    }

    for(int i = start; i < end; i++)
    {
        if((i - start) % 16 == 0)
            std::cout << std::endl << "0x" << std::hex << std::setw(3) << std::setfill('0') << i << ": "; 

        std::cout << std::setw(2) << std::setfill('0') << static_cast<int>(memory[i]) << ' ';
    }
    std::cout << std::endl;
}

void chip8::Warning(const int error_type) //prints error message and stops execution
{
    switch (error_type)
    {
        case UNKNOWN_INSTRUCTION:
            std::cout << "\n\nUNKNOWN INSTRUCTION: 0x" << std::hex << std::setw(4) << std::setfill('0') << static_cast<int>(opcode) << "\n\n";
            break;
        case STACK_ERROR:
            std::cout << "\n\nSTACK ERROR\n\n";
            break;
        case INVALID_JUMP:
            std::cout << "\n\nINVALID JUMP INSTRUCTION\n\n";
            break;
        case INVALID_INDEX:
            std::cout << "\n\nINVALID INDEX\n\n";
            break;
        case PC_OUT_OF_MEMORY:
            std::cout << "\n\nPC OUT OF MEMORY\n\n";
            break;
    }

    last_error = error_type;
}

void chip8::Set_Vy_Shift(bool set)
{
    vy_shift = set;
}

void chip8::Set_Vx_Jump(bool set)
{
    vx_jump = set;
}

void chip8::Set_Legacy_Indexing(bool set)
{
    legacy_indexing = set;
}

void chip8::Set_FX1E_Sets_OV(bool set)
{
    fx1e_sets_ov = set;
}

void chip8::Set_Logic_Resets_VF(bool set)
{
    logic_resets_vf = set;
}

void chip8::Set_KeyPad(const int key, bool state)
{
    if(key >= 0 && key < 16)
        keypad[key] = state;
}

void chip8::Set_Seed(const uint32_t seed)
{
    rnd_generator.seed(seed);
}

bool chip8::Is_Sound_Active(void) const
{
    return sound_timer > 0;
}

bool chip8::Get_Video(const int key) const
{
    return video[key];
}

uint8_t chip8::Get_Register(const int id) const
{
    if(id < 0 || id >= 16)
        return 0;

    return registers[id];
}

uint16_t chip8::Get_Index(void) const
{
    return index;
}

uint16_t chip8::Get_PC(void) const
{
    return pc;
}

uint8_t chip8::Get_SP(void) const
{
    return sp;
}

uint16_t chip8::Get_Stack(const int level) const
{
    if(level < 0 || level >= 16)
        return 0;

    return stack[level];
}

uint8_t chip8::Get_Delay_Timer(void) const
{
    return delay_timer;
}

uint8_t chip8::Get_Sound_Timer(void) const
{
    return sound_timer;
}

uint8_t chip8::Get_Memory(const int address) const
{
    if(address < 0 || address >= MEMORY_SIZE)
        return 0;

    return memory[address];
}

int chip8::Get_Last_Error(void) const
{
    return last_error;
}