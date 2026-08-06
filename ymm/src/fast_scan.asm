global skip_whitespace_asm
section .text

; Signature (x86_64 System V ABI):
; skip_whitespace_asm(source_ptr: rdi, length: rsi, offset: rdx) -> rax

skip_whitespace_asm:
    mov rax, rdx

.loop:
    cmp rax, rsi
    jge .done

    mov cl, [rdi + rax]

    cmp cl, 32
    je .next
    cmp cl, 9
    je .next
    cmp cl, 10
    je .next
    cmp cl, 13
    je .next

    jmp .done

.next:
    inc rax
    jmp .loop

.done:
    ret