defmodule Zlang.Engine do
  alias Zlang.AST.{Program, ClassDecl, MethodDecl, CallExpr, Literal}

  def execute(%Program{classes: classes}) do
    main_class = Enum.find(classes, fn c -> c.name == "main" end)
    main_method = Enum.find(main_class.methods, fn m -> m.name == "main" end)
    
    eval_block(main_method.body)
  end

  defp eval_block(statements) do
    Enum.each(statements, &eval_stmt/1)
  end

  defp eval_stmt(%CallExpr{callee: "print", args: [%Literal{value_type: "String", value: val}]}) do
    IO.puts(val)
  end
  defp eval_stmt(_), do: :ok
end