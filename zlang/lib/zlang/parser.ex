defmodule Zlang.Parser do
  alias Zlang.AST.{Program, ClassDecl, MethodDecl, VarDecl, CallExpr, Literal, Identifier}

  def parse(tokens) do
    {classes, _rest} = parse_classes(tokens, [])
    %Program{classes: classes}
  end

  defp parse_classes([{:eof, _}], acc), do: {Enum.reverse(acc), []}
  defp parse_classes([{:keyword, "pub"}, {:keyword, "class"}, {:ident, name}, {:lbrace, _} | t], acc) do
    {methods, t_after_methods} = parse_methods(t, [])
    
    [{:rbrace, _}, {:semi, _} | t_final] = t_after_methods
    
    class_node = %ClassDecl{name: name, is_pub: true, methods: methods, fields: []}
    parse_classes(t_final, [class_node | acc])
  end

  defp parse_methods([{:rbrace, _} | _] = t, acc), do: {Enum.reverse(acc), t}
  defp parse_methods([{:keyword, "static"}, {:keyword, "void"}, {:ident, name}, {:lparen, _}, {:rparen, _}, {:lbrace, _} | t], acc) do
    {body, t_after_body} = parse_statements(t, [])
    
    [{:rbrace, _}, {:semi, _} | t_final] = t_after_body
    
    method_node = %MethodDecl{name: name, is_pub: false, is_static: true, return_type: "void", params: [], body: body}
    parse_methods(t_final, [method_node | acc])
  end

  defp parse_statements([{:rbrace, _} | _] = t, acc), do: {Enum.reverse(acc), t}
  defp parse_statements([{:ident, callee}, {:lparen, _}, {:string, val}, {:rparen, _}, {:semi, _} | t], acc) do
    arg = %Literal{value_type: "String", value: val}
    call_node = %CallExpr{callee: callee, args: [arg]}
    parse_statements(t, [call_node | acc])
  end
  defp parse_statements([_ | t], acc), do: parse_statements(t, acc) 
end
