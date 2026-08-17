defmodule Zlang.Pipeline do
  alias Zlang.Compiler.{ParallelLexer, BeamEmitter}
  alias Zlang.Parser

  def compile_and_run(file_paths) do
    file_paths
    |> ParallelLexer.tokenize_files()
    |> Enum.map(fn {path, tokens} -> {path, Parser.parse(tokens)} end)
    |> Enum.each(fn {_path, ast} ->
      {:ok, _module} = BeamEmitter.compile_to_beam(ast)
    end)

    apply(:main, :main, [])
  end
end
