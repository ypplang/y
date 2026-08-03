#include "chunk.h"

void initVM();
void runVM(Chunk* chunk);

int main() {
    initVM();
    Chunk chunk;
    initChunk(&chunk);

    int c10 = addConstant(&chunk, 10.0);
    writeChunk(&chunk, OP_CONSTANT);
    writeChunk(&chunk, c10);
    writeChunk(&chunk, OP_DEFINE_GLOBAL);
    writeChunk(&chunk, 0);

    writeChunk(&chunk, OP_GET_GLOBAL);
    writeChunk(&chunk, 0);
    int c5 = addConstant(&chunk, 5.0);
    writeChunk(&chunk, OP_CONSTANT);
    writeChunk(&chunk, c5);
    writeChunk(&chunk, OP_GREATER);

    writeChunk(&chunk, OP_JUMP_IF_FALSE);
    writeChunk(&chunk, 0x00);
    writeChunk(&chunk, 0x06);

    int c100 = addConstant(&chunk, 100.0);
    writeChunk(&chunk, OP_CONSTANT);
    writeChunk(&chunk, c100);
    writeChunk(&chunk, OP_PRINT);

    writeChunk(&chunk, OP_JUMP);
    writeChunk(&chunk, 0x00);
    writeChunk(&chunk, 0x04);

    int c0 = addConstant(&chunk, 0.0);
    writeChunk(&chunk, OP_CONSTANT);
    writeChunk(&chunk, c0);
    writeChunk(&chunk, OP_PRINT);

    writeChunk(&chunk, OP_RETURN);

    runVM(&chunk);
    freeChunk(&chunk);
    return 0;
}