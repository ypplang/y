local Yua = require("./yua")

local engine = Yua.new()

engine:registerFunction("println", function(...)
	print("[Yua Output]:", ...)
end)

engine:registerFunction("get_server_status", function()
	return "Online (200 OK)"
end)

local yuaScript = [[
let status = get_server_status();
println("Status check:", status);

let score = 50 * 2;
if (score >= 100) {
    println("System ready");
}
]]

engine:run(yuaScript)