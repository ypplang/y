defmodule Zlang.Compiler.ParallelLexer do
  def tokenize_files(file_paths) do
    file_paths
    |> Task.async_stream(&tokenize_file/1, max_concurrency: System.schedulers_online())
    |> Enum.map(fn {:ok, result} -> result end)
  end

  def tokenize_file(path) do
    case File.read(path) do
      {:ok, content} -> {path, Zlang.Lexer.tokenize(content)}
      {:error, reason} -> {:error, path, reason}
    end
  end
end