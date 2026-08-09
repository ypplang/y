#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

void run_holyy(const char *source) {
    const char *p = source;
    while (*p) {
        while (isspace(*p)) p++;
        if (!*p) break;

        if (strncmp(p, "Print(", 6) == 0) {
            p += 6;
            while (isspace(*p)) p++;
            if (*p == '"') {
                p++;
                while (*p && *p != '"') {
                    if (*p == '\\' && *(p + 1) == 'n') {
                        putchar('\n');
                        p += 2;
                    } else {
                        putchar(*p++);
                    }
                }
                if (*p == '"') p++;
            }
            while (*p && *p != ';') p++;
            if (*p == ';') p++;
        } else if (*p == '"') {
            p++;
            while (*p && *p != '"') {
                if (*p == '\\' && *(p + 1) == 'n') {
                    putchar('\n');
                    p += 2;
                } else {
                    putchar(*p++);
                }
            }
            if (*p == '"') p++;
            while (isspace(*p)) p++;
            if (*p == ';') p++;
        } else {
            p++;
        }
    }
}

int main(int argc, char **argv) {
    if (argc < 2) {
        printf("Usage: holyy <file.hy>\n");
        return 1;
    }

    FILE *f = fopen(argv[1], "rb");
    if (!f) return 1;

    fseek(f, 0, SEEK_END);
    long len = ftell(f);
    fseek(f, 0, SEEK_SET);

    char *buf = malloc(len + 1);
    fread(buf, 1, len, f);
    buf[len] = '\0';
    fclose(f);

    run_holyy(buf);
    free(buf);
    return 0;
}