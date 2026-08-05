alias print = system_out

struct Point {
    var x
    var y
}

func create_buffer(bytes) {
    var block = alloc(bytes)
    return block
}

var rawMemory = create_buffer(1024)
var ptr p = cast(ptr, rawMemory)

if (p != 0) {
    alias write = rawMemory
    print("Buffer allocated successfully at memory address: {p}")
}

free(rawMemory)