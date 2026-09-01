# Exercícios 9 e 10 — Express + TypeScript

Continuação da API dos exercícios anteriores. Agora ela tem um tipo de erro
próprio (`AppError`), um middleware global que transforma erro em resposta, e um
CRUD de produtos com as regras de nome e preço.

Branches:

- `main` — API do exercício 5
- `exercicios-7-e-8` — middleware de log e `UserService`
- `exercicios-9-e-10` — entrega desta atividade

## Como executar

```
npm install
npm run typecheck
npm run dev
```

Servidor em `http://localhost:3000`.

## Estrutura

```
src/
├── errors/
│   └── app-error.ts
├── middlewares/
│   ├── error-handler.middleware.ts
│   └── logger.middleware.ts
├── models/
│   ├── product.ts
│   └── user.ts
├── services/
│   ├── product.service.ts
│   └── user.service.ts
└── server.ts
```

## Rotas de produtos

| Método | Rota          | Respostas                                      |
| ------ | ------------- | ---------------------------------------------- |
| GET    | /products     | 200 com a lista                                |
| GET    | /products/:id | 200 com o produto, 400 id inválido, 404        |
| POST   | /products     | 201 com o criado, 400 se quebrar alguma regra  |
| PUT    | /products/:id | 200 com o atualizado, 400, 404                 |
| DELETE | /products/:id | 204 sem corpo, 400, 404                        |

As rotas de usuários continuam iguais às dos exercícios anteriores.

`IProduct` é a mesma interface do exercício 3: `id`, `name`, `price`, `inStock` e
`categories: string[]`.

## Regras de produto

- `name` precisa ser texto e ter pelo menos 3 caracteres depois do `trim`, então
  um nome com três espaços é recusado.
- `price` precisa ser número finito. `typeof NaN` também é `number`, por isso a
  checagem usa `Number.isFinite` em vez de comparar só o tipo.
- Preço zero passa: o enunciado proíbe apenas negativo, e produto de brinde com
  preço zero é uma situação real.
- `inStock` booleano e `categories` uma lista de textos.
- O id nunca vem do cliente, é o serviço que gera o próximo.

A validação está em um método privado do `ProductService`, usado pelo POST e pelo
PUT. No PUT eu junto o corpo recebido com o produto atual e valido o resultado
inteiro: assim dá para mandar só o campo que mudou e, mesmo assim, o produto
guardado sempre respeita todas as regras.

## Escolhas de status

- 400 para dado inválido e para regra de negócio quebrada. Cogitei 422, mas 400
  já é "requisição que não dá para processar do jeito que veio", é o que a maioria
  dos clientes HTTP entende sem consultar documentação, e o resto da API já usava
  400. O importante era não usar dois status diferentes para o mesmo tipo de falha.
- 404 quando o id não existe.
- 500 apenas para erro que a aplicação não previu.
- DELETE de produto responde 204 sem corpo. Em usuários ele continua devolvendo
  200 com o usuário removido, porque essa resposta veio do exercício 5 e eu não
  quis mudar um contrato que já estava entregue.
- Id não numérico na URL agora responde 400 em vez de 404. É a única resposta que
  mudou em relação aos exercícios anteriores: antes `/users/abc` virava `NaN`,
  não achava ninguém e caía no 404, o que escondia um erro de quem chamou.

## AppError e o middleware

`AppError` estende `Error`, chama `super(message)` para a mensagem e a pilha
serem montadas pelo próprio `Error`, define `name` como `'AppError'` e guarda o
`statusCode` como `public readonly` — o status é decidido no momento em que o erro
nasce e não faz sentido alguém alterar depois.

`errorHandler` é um `ErrorRequestHandler` com os quatro parâmetros, registrado
depois de todas as rotas (antes delas ele nunca receberia os erros). Se o erro é
um `AppError`, ele usa o status e a mensagem que vieram junto; qualquer outra
coisa vira 500 com mensagem genérica, e o erro completo sai por `console.error` só
no terminal do servidor.

O `next` do middleware é usado quando a resposta já começou a ser enviada
(`res.headersSent`): nesse caso não dá para trocar o status, então o erro é
repassado para o handler padrão do Express fechar a conexão.

Nas rotas, os erros são pegos com `catch (error: unknown)` e mandados para o
middleware com `next(error)`. `unknown` obriga a descobrir o que foi capturado
antes de acessar qualquer propriedade — em JavaScript dá para lançar qualquer
coisa, inclusive uma string, então `error.message` com `any` quebraria em runtime.
O `instanceof AppError` do middleware é exatamente essa checagem.

`ProductService` lança `AppError` porque as regras de negócio moram nele.
`UserService` continua devolvendo `undefined` quando não encontra, como ficou
decidido no exercício 8, e quem transforma isso em `AppError` é a rota.

## Testes

Em [docs/testes-9-e-10.md](docs/testes-9-e-10.md), com status e corpo de cada
cenário, incluindo os dois erros forçados. Os testes dos exercícios anteriores
estão em [docs/testes.md](docs/testes.md).

## Respondendo as perguntas da entrega

**Por que centralizar erros melhora a API?** Porque o formato da resposta de erro
passa a ser decidido em um lugar só. Antes cada rota montava seu próprio
`res.status(...).json(...)`, e bastava eu esquecer um campo em uma delas para a
API responder de um jeito em `/users` e de outro em `/products` — quem consome
precisaria tratar cada caso. Com o middleware global, a rota só lança o erro e
segue; o formato, o log e a decisão de esconder detalhe interno ficam num arquivo
só. Também some a repetição: dez rotas deixaram de ter o mesmo bloco de resposta
de erro copiado.

**Diferença entre validação de tipo e regra de negócio.** Validação de tipo
pergunta "esse dado é do formato que eu espero?" — `price` é um número, `name` é
uma string. É o que o TypeScript garante entre o meu próprio código, mas não no
que chega pela rede, porque o JSON do cliente só existe em tempo de execução;
por isso a checagem com `typeof` continua necessária mesmo com tudo tipado.
Regra de negócio pergunta outra coisa: "esse dado, mesmo bem formado, faz sentido
para esse sistema?" — `-1` é um número perfeitamente válido, mas não é um preço
possível, e `"ab"` é uma string legítima que não serve como nome de produto. A
primeira protege o código de quebrar; a segunda protege o negócio de aceitar algo
incoerente. Na prática as duas moram juntas na validação do serviço, mas quando
mudam mudam por motivos diferentes: o tipo muda quando a interface muda, a regra
muda quando alguém do negócio decide que agora pode.
