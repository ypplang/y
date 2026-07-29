#include <stdio.h>
#include <stdbool.h>
#include "chunk.h"

#define STACK_MAX 256
#define GLOBALS_MAX 256

typedef struct {
    Chunk* chunk;
    uint8_t* ip;
    double stack[STACK_MAX];
    double* stackTop;
    double globals[GLOBALS_MAX];
} VM;

VM vm;

void resetStack() {
    vm.stackTop = vm.stack;
}

void initVM() {
    resetStack();
}

void push(double value) {
    *vm.stackTop = value;
    vm.stackTop++;
}

double pop() {
    vm.stackTop--;
    return *vm.stackTop;
}

void runVM(Chunk* chunk) {
    vm.chunk = chunk;
    vm.ip = vm.chunk->code;

    for (;;) {
        uint8_t instruction = *vm.ip++;

        switch (instruction) {
            case OP_CONSTANT: {
                uint8_t index = *vm.ip++;
                push(vm.chunk->constants[index]);
                break;
            }

            case OP_ADD:      { double b = pop(); double a = pop(); push(a + b); break; }
            case OP_SUBTRACT: { double b = pop(); double a = pop(); push(a - b); break; }
            case OP_MULTIPLY: { double b = pop(); double a = pop(); push(a * b); break; }
            case OP_DIVIDE:   { double b = pop(); double a = pop(); push(a / b); break; }

            case OP_EQUAL:   { double b = pop(); double a = pop(); push(a == b ? 1.0 : 0.0); break; }
            case OP_GREATER: { double b = pop(); double a = pop(); push(a > b  ? 1.0 : 0.0); break; }
            case OP_LESS:    { double b = pop(); double a = pop(); push(a < b  ? 1.0 : 0.0); break; }

            case OP_DEFINE_GLOBAL: {
                uint8_t globalSlot = *vm.ip++;
                vm.globals[globalSlot] = pop();
                break;
            }
            case OP_GET_GLOBAL: {
                uint8_t globalSlot = *vm.ip++;
                push(vm.globals[globalSlot]);
                break;
            }

            case OP_JUMP_IF_FALSE: {
                uint16_t offset = (uint16_t)(*vm.ip++ << 8);
                offset |= *vm.ip++;
                
                if (*(vm.stackTop - 1) == 0.0) {
                    vm.ip += offset;
                }
                break;
            }
            case OP_JUMP: {
                uint16_t offset = (uint16_t)(*vm.ip++ << 8);
                offset |= *vm.ip++;
                vm.ip += offset;
                break;
            }

            case OP_PRINT: {
                printf("Output: %g\n", pop());
                break;
            }

            case OP_RETURN: {
                return;
            }
        }
    }
}