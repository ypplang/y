const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const exe = b.addExecutable(.{
        .name = "ymmc",
        .root_source_file = b.path("src/main.zig"),
        .target = target,
        .optimize = optimize,
    });

    const nasm_cmd = b.addSystemCommand(&.{
        "nasm",
        "-f",
        if (target.result.os.tag == .macos) "macho64" else if (target.result.os.tag == .windows) "win64" else "elf64",
        "src/fast_scan.asm",
        "-o",
    });
    
    const obj_file = nasm_cmd.addOutputFileArg("fast_scan.o");
    exe.addObjectFile(obj_file);

    b.installArtifact(exe);

    const run_cmd = b.addRunArtifact(exe);
    run_cmd.step.dependOn(b.getInstallStep());

    if (b.args) |args| {
        run_cmd.addArgs(args);
    }

    const run_step = b.step("run", "Run the Y-- compiler");
    run_step.dependOn(&run_cmd.step);
}