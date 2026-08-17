defmodule Zlang.Lexer do
  @keywords ["pub", "class", "static", "void", "var", "return", "if", "else", "while"]

  def tokenize(source) do
    source
    |> String.graphemes()
    |> scan([])
  end

  defp scan([], acc), do: Enum.reverse([{:eof, nil} | acc])

  defp scan([" " | t], acc), do: scan(t, acc)
  defp scan(["\n" | t], acc), do: scan(t, acc)
  defp scan(["\t" | t], acc), do: scan(t, acc)
  defp scan(["\r" | t], acc), do: scan(t, acc)

  defp scan(["{" | t], acc), do: scan(t, [{:lbrace, "{"} | acc])
  defp scan(["}" | t], acc), do: scan(t, [{:rbrace, "}"} | acc])
  defp scan(["(" | t], acc), do: scan(t, [{:lparen, "("} | acc])
  defp scan([")" | t], acc), do: scan(t, [{:rparen, ")"} | acc])
  defp scan([";" | t], acc), do: scan(t, [{:semi, ";"} | acc])
  defp scan([":" | t], acc), do: scan(t, [{:colon, ":"} | acc])
  defp scan(["," | t], acc), do: scan(t, [{:comma, ","} | acc])
  defp scan(["=" | t], acc), do: scan(t, [{:assign, "="} | acc])
  defp scan(["+" | t], acc), do: scan(t, [{:plus, "+"} | acc])

  defp scan(["\"" | t], acc) do
    {str, rest} = Enum.split_while(t, fn c -> c != "\"" end)
    scan(tl(rest), [{:string, Enum.join(str)} | acc])
  end

  defp scan([char | _] = stream, acc) do
    cond do
      Regex.match?(~r/[a-zA-Z_]/, char) ->
        {id_chars, rest} = Enum.split_while(stream, &Regex.match?(~r/[a-zA-Z0-9_]/, &1))
        val = Enum.join(id_chars)
        
        token = if val in @keywords, do: {:keyword, val}, else: {:ident, val}
        scan(rest, [token | acc])

      Regex.match?(~r/[0-9]/, char) ->
        {num_chars, rest} = Enum.split_while(stream, &Regex.match?(~r/[0-9.]/, &1))
        scan(rest, [{:number, Enum.join(num_chars)} | acc])

      true ->
        scan(tl(stream), acc)
    end
  end
end
