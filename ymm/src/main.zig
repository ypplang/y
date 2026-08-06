const std = @import("std");
const lexer_mod = @import("lexer.zig");
const parser_mod = @import("parser.zig");
const codegen_mod = @import("codegen.zig");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    const args = try std.process.argsAlloc(allocator);
    defer std.process.argsFree(allocator, args);

    if (args.len < 2) {
        std.debug.print("Usage: ymmc <source.ymm>\n", .{});
        return;
    }

    const file = try std.fs.cwd().openFile(args[1], .{});
    defer file.close();

    const source = try file.readToEndAlloc(allocator, 1024 * 1024);
    defer allocator.free(source);

    var lexer = lexer_mod.Lexer.init(source);

    var parser = parser_mod.Parser.init(allocator, &lexer);
    const ast = try parser.parseProgram();

    var codegen = codegen_mod.CodeGen.init(allocator);
    defer codegen.deinit();

    const asm_code = try codegen.generate(ast);
    defer allocator.free(asm_code);

    std.debug.print("{s}", .{asm_code});
}