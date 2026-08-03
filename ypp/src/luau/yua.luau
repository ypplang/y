local Lexer = require("./lexer")
local Parser = require("./parser")
local Evaluator = require("./eval")

local Yua = {}
Yua.__index = Yua

function Yua.new()
	local self = setmetatable({}, Yua)
	self.evaluator = Evaluator.new()
	return self
end

function Yua.registerFunction(self, name: string, fn: (...any) -> any)
	self.evaluator.variables[name] = fn
end

function Yua.run(self, sourceCode: string)
	local lexer = Lexer.new(sourceCode)
	local parser = Parser.new(lexer)
	local ast = parser:parse()

	return self.evaluator:eval(ast)
end

return Yua