defmodule Zlang.Compiler.BeamEmitter do
  alias Zlang.AST.{Program, ClassDecl, MethodDecl, CallExpr, Literal}

  def compile_to_beam(%Program{classes: classes}) do
    Enum.each(classes, &compile_class/1)
  end

  defp compile_class(%ClassDecl{name: name, methods: methods}) do
    module_atom = String.to_atom(name)
    
    forms = [
      {:attribute, 1, :module, module_atom},
      {:attribute, 2, :export, extract_exports(methods)}
    ] ++ Enum.map(methods, &compile_method/1)

    case :compile.forms(forms, [:verbose, :report]) do
      {:ok, ^module_atom, binary} ->
        :code.load_binary(module_atom, ~c"#{name}.z", binary)
        {:ok, module_atom}

      error ->
        {:error, error}
    end
  end

  defp extract_exports(methods) do
    Enum.map(methods, fn %MethodDecl{name: m_name, params: params} ->
      {String.to_atom(m_name), length(params)}
    end)
  end

  defp compile_method(%MethodDecl{name: name, params: params, body: body}) do
    method_atom = String.to_atom(name)
    param_vars = Enum.map(params, fn p -> {:var, 1, String.to_atom(p.name)} end)
    body_forms = Enum.map(body, &compile_stmt/1)

    {:function, 1, method_atom, length(params), [
      {:clause, 1, param_vars, [], body_forms}
    ]}
  end

  defp compile_stmt(%CallExpr{callee: "print", args: [%Literal{value: val}]}) do
    {:call, 1,
      {:remote, 1, {:atom, 1, :io}, {:atom, 1, :fwrite}},
      [{:string, 1, ~c"~s~n"}, {:cons, 1, {:string, 1, String.to_charlist(val)}, {nil, 1}}]}
  end
  defp compile_stmt(_), do: {:atom, 1, :ok}
end
