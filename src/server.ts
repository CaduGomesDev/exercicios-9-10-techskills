import express, { NextFunction, Request, Response } from 'express';
import { AppError } from './errors/app-error';
import { errorHandler } from './middlewares/error-handler.middleware';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { IProduct } from './models/product';
import { IUser } from './models/user';
import { ProductService } from './services/product.service';
import { UserService } from './services/user.service';

interface IParams {
  id: string;
}

const app = express();
const PORT = 3000;
const userService = new UserService();
const productService = new ProductService();

app.use(loggerMiddleware);
app.use(express.json());

function parseId(value: string): number {
  const id = Number(value);

  if (!Number.isInteger(id)) {
    throw new AppError('O id informado na URL precisa ser um número inteiro', 400);
  }

  return id;
}

function isValidUser(body: unknown): body is Omit<IUser, 'id'> {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const data = body as Partial<IUser>;

  return (
    typeof data.name === 'string' &&
    typeof data.email === 'string' &&
    typeof data.isActive === 'boolean'
  );
}

function isValidUserUpdate(body: unknown): body is Partial<IUser> {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const data = body as Partial<IUser>;

  if (data.name !== undefined && typeof data.name !== 'string') {
    return false;
  }

  if (data.email !== undefined && typeof data.email !== 'string') {
    return false;
  }

  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    return false;
  }

  return data.name !== undefined || data.email !== undefined || data.isActive !== undefined;
}

app.get('/users', (_req: Request, res: Response<IUser[]>) => {
  res.json(userService.getAll());
});

app.get('/users/:id', (req: Request<IParams>, res: Response<IUser>, next: NextFunction) => {
  try {
    const user = userService.getById(parseId(req.params.id));

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    res.json(user);
  } catch (error: unknown) {
    next(error);
  }
});

app.post('/users', (req: Request<object, IUser, unknown>, res: Response<IUser>, next: NextFunction) => {
  try {
    if (!isValidUser(req.body)) {
      throw new AppError(
        'Dados inválidos. Envie: { name: string, email: string, isActive: boolean }',
        400,
      );
    }

    res.status(201).json(userService.create(req.body));
  } catch (error: unknown) {
    next(error);
  }
});

app.put('/users/:id', (req: Request<IParams, IUser, unknown>, res: Response<IUser>, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);

    if (!isValidUserUpdate(req.body)) {
      throw new AppError(
        'Dados inválidos. Envie ao menos um campo entre name (string), email (string) e isActive (boolean)',
        400,
      );
    }

    const user = userService.update(id, req.body);

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    res.json(user);
  } catch (error: unknown) {
    next(error);
  }
});

app.delete('/users/:id', (req: Request<IParams>, res: Response<IUser>, next: NextFunction) => {
  try {
    const removed = userService.delete(parseId(req.params.id));

    if (!removed) {
      throw new AppError('Usuário não encontrado', 404);
    }

    res.json(removed);
  } catch (error: unknown) {
    next(error);
  }
});

app.get('/products', (_req: Request, res: Response<IProduct[]>) => {
  res.json(productService.getAll());
});

app.get('/products/:id', (req: Request<IParams>, res: Response<IProduct>, next: NextFunction) => {
  try {
    res.json(productService.getById(parseId(req.params.id)));
  } catch (error: unknown) {
    next(error);
  }
});

app.post('/products', (req: Request<object, IProduct, unknown>, res: Response<IProduct>, next: NextFunction) => {
  try {
    res.status(201).json(productService.create(req.body));
  } catch (error: unknown) {
    next(error);
  }
});

app.put('/products/:id', (req: Request<IParams, IProduct, unknown>, res: Response<IProduct>, next: NextFunction) => {
  try {
    res.json(productService.update(parseId(req.params.id), req.body));
  } catch (error: unknown) {
    next(error);
  }
});

app.delete('/products/:id', (req: Request<IParams>, res: Response, next: NextFunction) => {
  try {
    productService.delete(parseId(req.params.id));

    res.sendStatus(204);
  } catch (error: unknown) {
    next(error);
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
