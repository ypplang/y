defmodule Zlang.AST do
  defmodule Program, do: defstruct [:classes]
  
  defmodule ClassDecl do
    defstruct [:name, :is_pub, :methods, :fields]
  end

  defmodule MethodDecl do
    defstruct [:name, :is_pub, :is_static, :return_type, :params, :body]
  end

  defmodule VarDecl do
    defstruct [:name, :var_type, :value]
  end

  defmodule CallExpr do
    defstruct [:callee, :args]
  end

  defmodule Literal do
    defstruct [:value_type, :value]
  end

  defmodule Identifier do
    defstruct [:name]
  end
end
