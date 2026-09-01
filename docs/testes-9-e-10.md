# Registro dos testes — exercícios 9 e 10

Servidor rodando com `npm run dev`, chamadas repetidas no Insomnia e no terminal.
Cada bloco mostra o corpo da resposta e o status.

## CRUD de produtos

```
$ curl http://localhost:3000/products
[{"id":1,"name":"Teclado mecânico","price":349.9,"inStock":true,"categories":["periféricos","informática"]},{"id":2,"name":"Monitor 24 polegadas","price":899,"inStock":false,"categories":["periféricos","vídeo"]}]
HTTP 200

$ curl http://localhost:3000/products/1
{"id":1,"name":"Teclado mecânico","price":349.9,"inStock":true,"categories":["periféricos","informática"]}
HTTP 200

$ curl http://localhost:3000/products/99
{"message":"Produto não encontrado"}
HTTP 404

$ curl http://localhost:3000/products/abc
{"message":"O id informado na URL precisa ser um número inteiro"}
HTTP 400

$ curl -X POST http://localhost:3000/products -H 'Content-Type: application/json' \
    -d '{"name":"Mouse sem fio","price":129.9,"inStock":true,"categories":["perifericos"]}'
{"id":3,"name":"Mouse sem fio","price":129.9,"inStock":true,"categories":["perifericos"]}
HTTP 201
```

## Regras de negócio no POST

```
$ curl -X POST http://localhost:3000/products -H 'Content-Type: application/json' \
    -d '{"name":"TV","price":10,"inStock":true,"categories":[]}'
{"message":"O campo name precisa ter pelo menos 3 caracteres"}
HTTP 400

$ curl -X POST http://localhost:3000/products -H 'Content-Type: application/json' \
    -d '{"name":"   ","price":10,"inStock":true,"categories":[]}'
{"message":"O campo name precisa ter pelo menos 3 caracteres"}
HTTP 400

$ curl -X POST http://localhost:3000/products -H 'Content-Type: application/json' \
    -d '{"name":"Cadeira gamer","price":-1,"inStock":true,"categories":["moveis"]}'
{"message":"O campo price não pode ser negativo"}
HTTP 400

$ curl -X POST http://localhost:3000/products -H 'Content-Type: application/json' \
    -d '{"name":"Brinde de evento","price":0,"inStock":true,"categories":["brindes"]}'
{"id":4,"name":"Brinde de evento","price":0,"inStock":true,"categories":["brindes"]}
HTTP 201

$ curl -X POST http://localhost:3000/products -H 'Content-Type: application/json' \
    -d '{"name":"Preco em texto","price":"120","inStock":true,"categories":[]}'
{"message":"O campo price precisa ser um número válido"}
HTTP 400

$ curl -X POST http://localhost:3000/products -H 'Content-Type: application/json' \
    -d '{"name":"Sem estoque informado","price":10,"categories":[]}'
{"message":"O campo inStock precisa ser true ou false"}
HTTP 400
```

Nome com três espaços é recusado porque o tamanho é conferido depois do `trim`.
Preço zero é aceito: a regra proíbe apenas negativo.

## As mesmas regras no PUT

```
$ curl -X PUT http://localhost:3000/products/1 -H 'Content-Type: application/json' \
    -d '{"name":"Teclado mecanico RGB","price":429.9}'
{"id":1,"name":"Teclado mecanico RGB","price":429.9,"inStock":true,"categories":["periféricos","informática"]}
HTTP 200

$ curl -X PUT http://localhost:3000/products/1 -H 'Content-Type: application/json' -d '{"price":-5}'
{"message":"O campo price não pode ser negativo"}
HTTP 400

$ curl -X PUT http://localhost:3000/products/1 -H 'Content-Type: application/json' -d '{"name":"ab"}'
{"message":"O campo name precisa ter pelo menos 3 caracteres"}
HTTP 400

$ curl -X PUT http://localhost:3000/products/99 -H 'Content-Type: application/json' -d '{"price":10}'
{"message":"Produto não encontrado"}
HTTP 404
```

## Exclusão

```
$ curl -X DELETE http://localhost:3000/products/2
(sem corpo)
HTTP 204

$ curl -X DELETE http://localhost:3000/products/2
{"message":"Produto não encontrado"}
HTTP 404

$ curl http://localhost:3000/products
[{"id":1,"name":"Teclado mecanico RGB","price":429.9,"inStock":true,"categories":["periféricos","informática"]},{"id":3,"name":"Mouse sem fio","price":129.9,"inStock":true,"categories":["perifericos"]},{"id":4,"name":"Brinde de evento","price":0,"inStock":true,"categories":["brindes"]}]
HTTP 200
```

O produto 2 não aparece mais na listagem.

## Middleware de erro

Para esses dois cenários usei rotas temporárias, removidas antes da entrega:

```ts
app.get('/erro-esperado', (_req: Request, _res: Response, next: NextFunction) => {
  try {
    throw new AppError('Erro esperado de teste', 418);
  } catch (error: unknown) {
    next(error);
  }
});

app.get('/erro-inesperado', (_req: Request, _res: Response, next: NextFunction) => {
  try {
    const valor = JSON.parse('{ isso nao e json }');

    next(valor);
  } catch (error: unknown) {
    next(error);
  }
});
```

```
$ curl http://localhost:3000/erro-esperado
{"message":"Erro esperado de teste"}
HTTP 418

$ curl http://localhost:3000/erro-inesperado
{"message":"Erro interno do servidor"}
HTTP 500
```

O 418 saiu do próprio `AppError`, o que mostra que o status vem do erro e não de um
número fixo no middleware. No `SyntaxError` o cliente recebeu a mensagem genérica,
enquanto o detalhe ficou só no terminal do servidor:

```
Erro inesperado: SyntaxError: Expected property name or '}' in JSON at position 2 (line 1 column 3)
    at JSON.parse (<anonymous>)
    at C:\Users\carlo\exercicios-9-10-techskills\src\server.ts:186:24
    at Layer.handle [as handle_request] (...\express\lib\router\layer.js:95:5)
    at next (...\express\lib\router\route.js:149:13)
    ...
```

Depois dos dois erros o servidor continuou respondendo normalmente:

```
$ curl http://localhost:3000/products
HTTP 200

$ curl http://localhost:3000/users/99
{"message":"Usuário não encontrado"}
HTTP 404
```

## Rotas de usuários depois da refatoração

Continuam com os mesmos status e o mesmo formato `{ "message": ... }`, só que agora
a resposta é montada pelo middleware global.

## Verificação de tipos

```
$ npx tsc --noEmit
(sem saída)
```
