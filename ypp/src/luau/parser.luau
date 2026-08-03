local Lexer = require("./lexer")

local Parser = {}
Parser.__index = Parser

function Parser.new(lexer)
	local self = setmetatable({}, Parser)
	self.lexer = lexer
	self.currentToken = lexer:nextToken()
	return self
end

function Parser.eat(self, expectedType: string)
	if self.currentToken.type == expectedType then
		local token = self.currentToken
		self.currentToken = self.lexer:nextToken()
		return token
	else
		error(string.format("Parser Error: Expected %s, got %s ('%s')", 
			expectedType, self.currentToken.type, self.currentToken.value))
	end
end

function Parser.parsePrimary(self)
	local token = self.currentToken

	if token.type == "NUMBER" then
		self:eat("NUMBER")
		return { type = "NumberLiteral", value = tonumber(token.value) }
	elseif token.type == "STRING" then
		self:eat("STRING")
		return { type = "StringLiteral", value = token.value }
	elseif token.type == "IDENTIFIER" then
		self:eat("IDENTIFIER")
		return { type = "Identifier", name = token.value }
	elseif token.type == "OPERATOR" and token.value == "(" then
		self:eat("OPERATOR")
		local expr = self:parseExpression()
		if self.currentToken.type == "OPERATOR" and self.currentToken.value == ")" then
			self:eat("OPERATOR")
		end
		return expr
	end

	error(string.format("Unexpected token in expression: %s ('%s')", token.type, token.value))
end

function Parser.parseMultiplicative(self)
	local left = self:parsePrimary()

	while self.currentToken.type == "OPERATOR" and (self.currentToken.value == "*" or self.currentToken.value == "/") do
		local op = self.currentToken.value
		self:eat("OPERATOR")
		local right = self:parsePrimary()
		left = {
			type = "BinaryExpression",
			operator = op,
			left = left,
			right = right
		}
	end

	return left
end

function Parser.parseAdditive(self)
	local left = self:parseMultiplicative()

	while self.currentToken.type == "OPERATOR" and (self.currentToken.value == "+" or self.currentToken.value == "-") do
		local op = self.currentToken.value
		self:eat("OPERATOR")
		local right = self:parseMultiplicative()
		left = {
			type = "BinaryExpression",
			operator = op,
			left = left,
			right = right
		}
	end

	return left
end

function Parser.parseExpression(self)
	return self:parseAdditive()
end

function Parser.parseStatement(self)
	if self.currentToken.type == "LET" then
		self:eat("LET")
		local varName = self.currentToken.value
		self:eat("IDENTIFIER")
		
		local initializer = nil
		if self.currentToken.type == "OPERATOR" and self.currentToken.value == "=" then
			self:eat("OPERATOR")
			initializer = self:parseExpression()
		end

		if self.currentToken.type == "OPERATOR" and self.currentToken.value == ";" then
			self:eat("OPERATOR")
		end

		return {
			type = "VariableDeclaration",
			identifier = varName,
			initializer = initializer
		}
	end

	if self.currentToken.type == "IF" then
		self:eat("IF")
		
		self:eat("OPERATOR")
		local condition = self:parseExpression()
		self:eat("OPERATOR")

		local consequent = self:parseBlock()

		local alternate = nil
		if self.currentToken.type == "ELSE" then
			self:eat("ELSE")
			if self.currentToken.type == "IF" then
				alternate = self:parseStatement()
			else
				alternate = self:parseBlock()
			end
		end

		return {
			type = "IfStatement",
			condition = condition,
			consequent = consequent,
			alternate = alternate
		}
	end

	local expr = self:parseExpression()
	if self.currentToken.type == "OPERATOR" and self.currentToken.value == ";" then
		self:eat("OPERATOR")
	end
	return { type = "ExpressionStatement", expression = expr }
end

function Parser.parse(self)
	local statements = {}

	while self.currentToken.type ~= "EOF" do
		table.insert(statements, self:parseStatement())
	end

	return { type = "Program", body = statements }
end

function Parser.parseArgs(self)
	local args = {}
	self:eat("OPERATOR")

	if not (self.currentToken.type == "OPERATOR" and self.currentToken.value == ")") then
		table.insert(args, self:parseExpression())
		while self.currentToken.type == "OPERATOR" and self.currentToken.value == "," do
			self:eat("OPERATOR")
			table.insert(args, self:parseExpression())
		end
	end

	self:eat("OPERATOR")
	return args
end

function Parser.parsePrimary(self)
	local token = self.currentToken

	if token.type == "NUMBER" then
		self:eat("NUMBER")
		return { type = "NumberLiteral", value = tonumber(token.value) }
	elseif token.type == "STRING" then
		self:eat("STRING")
		return { type = "StringLiteral", value = token.value }
	elseif token.type == "IDENTIFIER" then
		local name = token.value
		self:eat("IDENTIFIER")

		if self.currentToken.type == "OPERATOR" and self.currentToken.value == "(" then
			local args = self:parseArgs()
			return {
				type = "CallExpression",
				callee = name,
				arguments = args
			}
		end

		return { type = "Identifier", name = name }
	elseif token.type == "OPERATOR" and token.value == "(" then
		self:eat("OPERATOR")
		local expr = self:parseExpression()
		if self.currentToken.type == "OPERATOR" and self.currentToken.value == ")" then
			self:eat("OPERATOR")
		end
		return expr
	end

function Parser.parseBlock(self)
	self:eat("OPERATOR")
	local statements = {}

	while self.currentToken.type ~= "EOF" and not (self.currentToken.type == "OPERATOR" and self.currentToken.value == "}") do
		table.insert(statements, self:parseStatement())
	end

	self:eat("OPERATOR")
	return { type = "BlockStatement", body = statements }
end

function Parser.parseComparison(self)
	local left = self:parseAdditive()

	local op = self.currentToken.value
	if self.currentToken.type == "OPERATOR" and (op == "==" or op == "!=" or op == "<" or op == ">" or op == "<=" or op == ">=") then
		self:eat("OPERATOR")
		local right = self:parseAdditive()
		return {
			type = "BinaryExpression",
			operator = op,
			left = left,
			right = right
		}
	end

	return left
end

function Parser.parseExpression(self)
	return self:parseComparison()
end

	error(string.format("Unexpected token in expression: %s ('%s')", token.type, token.value))
end

return Parser