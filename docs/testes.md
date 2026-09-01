# Registro dos testes

Servidor rodando com `npm run dev` e chamadas feitas pelo terminal (as mesmas
foram repetidas no Insomnia). Cada bloco mostra o corpo da resposta e o status.

```
$ curl http://localhost:3000/users
[{"id":1,"name":"John Doe","email":"john.doe@example.com","isActive":true},{"id":2,"name":"Jane Smith","email":"jane.smith@example.com","isActive":false}]
HTTP 200

$ curl http://localhost:3000/users/1
{"id":1,"name":"John Doe","email":"john.doe@example.com","isActive":true}
HTTP 200

$ curl http://localhost:3000/users/99
{"message":"Usuário não encontrado"}
HTTP 404

$ curl -X POST http://localhost:3000/users -H 'Content-Type: application/json' \
    -d '{"name":"Alice","email":"alice@example.com","isActive":true}'
{"id":3,"name":"Alice","email":"alice@example.com","isActive":true}
HTTP 201

$ curl -X POST http://localhost:3000/users -H 'Content-Type: application/json' \
    -d '{"name":"Sem email"}'
{"message":"Dados inválidos. Envie: { name: string, email: string, isActive: boolean }"}
HTTP 400

$ curl -X PUT http://localhost:3000/users/1 -H 'Content-Type: application/json' \
    -d '{"name":"John Atualizado"}'
{"id":1,"name":"John Atualizado","email":"john.doe@example.com","isActive":true}
HTTP 200

$ curl -X PUT http://localhost:3000/users/1 -H 'Content-Type: application/json' \
    -d '{"isActive":"sim"}'
{"message":"Dados inválidos. Envie ao menos um campo entre name (string), email (string) e isActive (boolean)"}
HTTP 400

$ curl -X PUT http://localhost:3000/users/99 -H 'Content-Type: application/json' \
    -d '{"name":"Fantasma"}'
{"message":"Usuário não encontrado"}
HTTP 404

$ curl -X DELETE http://localhost:3000/users/2
{"id":2,"name":"Jane Smith","email":"jane.smith@example.com","isActive":false}
HTTP 200

$ curl -X DELETE http://localhost:3000/users/2
{"message":"Usuário não encontrado"}
HTTP 404

$ curl http://localhost:3000/users
[{"id":1,"name":"John Atualizado","email":"john.doe@example.com","isActive":true},{"id":3,"name":"Alice","email":"alice@example.com","isActive":true}]
HTTP 200

$ curl http://localhost:3000/rota-inexistente
Cannot GET /rota-inexistente
HTTP 404
```

## Saída do logger no terminal

Todas as chamadas acima, na ordem, incluindo a rota que não existe:

```
Servidor rodando em http://localhost:3000
[2026-09-01T00:07:10.550Z] GET /users
[2026-09-01T00:07:10.720Z] GET /users/1
[2026-09-01T00:07:10.891Z] GET /users/99
[2026-09-01T00:07:11.065Z] POST /users
[2026-09-01T00:07:11.258Z] POST /users
[2026-09-01T00:07:11.402Z] PUT /users/1
[2026-09-01T00:07:11.530Z] PUT /users/1
[2026-09-01T00:07:11.687Z] PUT /users/99
[2026-09-01T00:07:11.845Z] DELETE /users/2
[2026-09-01T00:07:11.989Z] DELETE /users/2
[2026-09-01T00:07:12.126Z] GET /users
[2026-09-01T00:07:12.270Z] GET /rota-inexistente
```

O log sai só no terminal; nenhuma resposta ganhou campo novo por causa dele.

## Verificação de tipos

```
$ npx tsc --noEmit
(sem saída)
```
