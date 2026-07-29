local Lexer = {}
Lexer.__index = Lexer

export type Token = {
	type: string,
	value: string,
}

function Lexer.new(source: string)
	local self = setmetatable({}, Lexer)
	self.source = source
	self.cursor = 1
	return self
end

local KEYWORDS = {
	["let"] = "LET",
	["fn"] = "FUNCTION",
	["class"] = "CLASS",
	["pub"] = "PUB",
	["static"] = "STATIC",
	["if"] = "IF",
	["else"] = "ELSE",
	["while"] = "WHILE",
	["return"] = "RETURN",
	["import"] = "IMPORT",
	["new"] = "NEW",
	["this"] = "THIS",
}

function Lexer.nextToken(self): Token
	while self.cursor <= #self.source and string.match(string.sub(self.source, self.cursor, self.cursor), "%s") do
		self.cursor += 1
	end

	if self.cursor > #self.source then
		return { type = "EOF", value = "" }
	end

	local char = string.sub(self.source, self.cursor, self.cursor)
	local nextChar = string.sub(self.source, self.cursor + 1, self.cursor + 1)

	if char == "/" and nextChar == "/" then
		while self.cursor <= #self.source and string.sub(self.source, self.cursor, self.cursor) ~= "\n" do
			self.cursor += 1
		end
		return self:nextToken()
	end

	if char == "-" and nextChar == ">" then
		self.cursor += 2
		return { type = "POINTER", value = "->" }
	end

	if string.match(char, "[%+%-%*/=<>!%{-------}%(%);%,%.%*]") then
		self.cursor += 1
		return { type = "OPERATOR", value = char }
	end

	if char == '"' then
		self.cursor += 1
		local startPos = self.cursor
		while self.cursor <= #self.source and string.sub(self.source, self.cursor, self.cursor) ~= '"' do
			self.cursor += 1
		end
		local strVal = string.sub(self.source, startPos, self.cursor - 1)
		self.cursor += 1
		return { type = "STRING", value = strVal }
	end

	if string.match(char, "%d") then
		local startPos = self.cursor
		while self.cursor <= #self.source and string.match(string.sub(self.source, self.cursor, self.cursor), "%d") do
			self.cursor += 1
		end
		return { type = "NUMBER", value = string.sub(self.source, startPos, self.cursor - 1) }
	end

	if string.match(char, "[%a_]") then
		local startPos = self.cursor
		while self.cursor <= #self.source and string.match(string.sub(self.source, self.cursor, self.cursor), "[%w_]") do
			self.cursor += 1
		end
		local ident = string.sub(self.source, startPos, self.cursor - 1)
		local kwType = KEYWORDS[ident]
		
		if kwType then
			return { type = kwType, value = ident }
		end
		return { type = "IDENTIFIER", value = ident }
	end

	self.cursor += 1
	return { type = "UNKNOWN", value = char }
end

return Lexer