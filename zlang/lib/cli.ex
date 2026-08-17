defmodule Zlang.CLI do
  def main(args) do
    case args do
      [file_path | _] -> run_file(file_path)
      _ -> IO.puts("Usage: zlang <file.z>")
    end
  end

  defp run_file(path) do
    source = File.read!(path)
    
    source
    |> Zlang.Lexer.tokenize()
    |> Zlang.Parser.parse()
    |> Zlang.Engine.execute()
  end
end