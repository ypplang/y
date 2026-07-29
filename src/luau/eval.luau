local Evaluator = {}
Evaluator.__index = Evaluator

function Evaluator.new()
	local self = setmetatable({}, Evaluator)
	self.variables = {}
	return self
end

function Evaluator.eval(self, node)
	if not node then return nil end

	if node.type == "Program" then
		local lastResult = nil
		for _, stmt in ipairs(node.body) do
			lastResult = self:eval(stmt)
		end
		return lastResult
	end

	if node.type == "VariableDeclaration" then
		local value = nil
		if node.initializer then
			value = self:eval(node.initializer)
		end
		self.variables[node.identifier] = value
		return value
	end

	if node.type == "ExpressionStatement" then
		return self:eval(node.expression)
	end

	if node.type == "NumberLiteral" or node.type == "StringLiteral" then
		return node.value
	end

	if node.type == "Identifier" then
		local val = self.variables[node.name]
		if val == nil then
			error("Runtime Error: Undefined variable '" .. node.name .. "'")
		end
		return val
	end

	if node.type == "BinaryExpression" then
		local left = self:eval(node.left)
		local right = self:eval(node.right)

		if node.operator == "+" then return left + right end
		if node.operator == "-" then return left - right end
		if node.operator == "*" then return left * right end
		if node.operator == "/" then return left / right end
	end

	if node.type == "CallExpression" then
		if node.callee == "println" then
			local evaluatedArgs = {}
			for _, argNode in ipairs(node.arguments) do
				table.insert(evaluatedArgs, self:eval(argNode))
			end
			print(unpack(evaluatedArgs))
			return nil
		else
			error("Runtime error: Unknown function '" .. node.callee .. "'")
		end
	end

	if node.type == "BlockStatement" then
		local lastResult = nil
		for _, stmt in ipairs(node.body) do
			lastResult = self:eval(stmt)
		end
		return lastResult
	end

	if node.type == "IfStatement" then
		local conditionValue = self:eval(node.condition)
		if conditionValue then
			return self:eval(node.consequent)
		elseif node.alternate then
			return self:eval(node.alternate)
		end
		return nil
	end

	if node.type == "BinaryExpression" then
		local left = self:eval(node.left)
		local right = self:eval(node.right)

		if node.operator == "+" then return left + right end
		if node.operator == "-" then return left - right end
		if node.operator == "*" then return left * right end
		if node.operator == "/" then return left / right end

		if node.operator == "==" then return left == right end
		if node.operator == "!=" then return left ~= right end
		if node.operator == "<" then return left < right end
		if node.operator == ">" then return left > right end
		if node.operator == "<=" then return left <= right end
		if node.operator == ">=" then return left >= right end
	end

    if node.type == "CallExpression" then
        local callee = self:eval({ type = "Identifier", name = node.callee })
        
        if type(callee) == "function" then
            local evaluatedArgs = {}
            for _, argNode in ipairs(node.arguments) do
                table.insert(evaluatedArgs, self:eval(argNode))
            end
            return callee(unpack(evaluatedArgs))
        else
            error("Runtime Error: '" .. tostring(node.callee) .. "' is not a function")
        end
    end

	error("Unknown AST node type: " .. tostring(node.type))
end

return Evaluator