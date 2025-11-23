接口列表


所有接口错误返回示例

{
    "code": 524,
    "status": false,
    "message": "笔记不存在",
    "data": null
}


1. 获取笔记列表
路径：GET /api/notes
描述：笔记列表
请求头：见“公共请求头”
请求体（multipart/form-data）：
vault (string, required)
示例：defaultVault
响应 200（application/json）结构：
code (integer)
status (boolean)
message (string)
data (array of objects)
item 对象字段：
id (integer)
action (string)
path (string)
pathHash (string)
ctime (integer)
mtime (integer)
updatedTimestamp (integer)
updatedAt (string)
createdAt (string)
示例（响应数据结构）：
{
"code": 0,
"status": true,
"message": "ok",
"data": [
{
"id": 1,
"action": "update",
"path": "note.md",
"pathHash": "1928885498",
"ctime": 1680000000,
"mtime": 1680001000,
"updatedTimestamp": 1680001000,
"updatedAt": "2023-xx-xxTxx:xx:xxZ",
"createdAt": "2023-xx-xxTxx:xx:xxZ"
}
]
}

2. 获取单条笔记
路径：GET /api/note
描述：获取单条笔记详情
请求头：见“公共请求头”
请求体（multipart/form-data）：
vault (string, required) 示例：defaultVault
path (string, required) 示例：未命名 1.md
pathHash (string, optional) 示例：1928885498
响应 200（application/json）结构：
code (integer)
status (boolean)
message (string)
data (object)
id (integer)
action (string)
path (string)
pathHash (string)
content (string)
contentHash (string)
ctime (integer)
mtime (integer)
updatedTimestamp (integer)
updatedAt (string)
createdAt (string)
示例（响应数据结构）：
{
"code": 0,
"status": true,
"message": "ok",
"data": {
"id": 1,
"action": "update",
"path": "未命名 1.md",
"pathHash": "1928885498",
"content": "笔记内容文本",
"contentHash": "-1312224063",
"ctime": 1680000000,
"mtime": 1680001000,
"updatedTimestamp": 1680001000,
"updatedAt": "2023-xx-xxTxx:xx:xxZ",
"createdAt": "2023-xx-xxTxx:xx:xxZ"
}
}

3. 删除笔记
路径：DELETE /api/note
描述：删除笔记
请求头：见“公共请求头”
请求体（multipart/form-data）：
vault (string, required) 示例：defaultVault
path (string, required) 示例：未命名 1.md
pathHash (string, optional) 示例：1928885498
响应 200（application/json）结构：
code (integer)
status (boolean)
message (string)
data (any) — 可能为 string/integer/boolean/array/object/number/null
details (array of string) — 可选，详细信息列表
示例（响应数据结构）：
{
"code": 0,
"status": true,
"message": "deleted",
"data": null,
"details": []
}

4. 新增 / 编辑笔记
路径：POST /api/note
描述：创建或编辑（保存）笔记
请求头：见“公共请求头”
请求体（multipart/form-data）：
vault (string, required) 示例：defaultVault
path (string, required) 示例：未命名7.md
content (string, required) 示例：哈哈哈
pathHash (string, optional) 在修改笔记地址时需要，示例：1928885498（描述：在修改笔记地址的时候需要）
srcPathHash (string, optional) 示例：1928885498
srcPath (string, optional) 示例：未命名6.md
contentHash (string, optional) 示例：-1312224063
响应 200（application/json）结构：
code (integer)
status (boolean)
message (string)
data (any) — 可能为 string/integer/boolean/array/object/number/null
details (array of string) — 可选
示例（响应数据结构）：
{
"code": 0,
"status": true,
"message": "saved",
"data": {
"id": 2
},
"details": []
}


