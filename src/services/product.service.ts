import { AppError } from '../errors/app-error';
import { IProduct } from '../models/product';

type ProductInput = Omit<IProduct, 'id'>;

export class ProductService {
  private products: IProduct[] = [
    {
      id: 1,
      name: 'Teclado mecânico',
      price: 349.9,
      inStock: true,
      categories: ['periféricos', 'informática'],
    },
    {
      id: 2,
      name: 'Monitor 24 polegadas',
      price: 899,
      inStock: false,
      categories: ['periféricos', 'vídeo'],
    },
  ];

  getAll(): IProduct[] {
    return [...this.products];
  }

  getById(id: number): IProduct {
    return this.products[this.indexOf(id)];
  }

  create(data: unknown): IProduct {
    const input = this.validate(data);
    const nextId =
      this.products.length > 0 ? Math.max(...this.products.map((product) => product.id)) + 1 : 1;
    const product: IProduct = { id: nextId, ...input };

    this.products.push(product);

    return product;
  }

  update(id: number, data: unknown): IProduct {
    const index = this.indexOf(id);
    const current = this.products[index];
    const input = this.validate({ ...current, ...this.asObject(data) });
    const updated: IProduct = { id: current.id, ...input };

    this.products[index] = updated;

    return updated;
  }

  delete(id: number): void {
    this.products.splice(this.indexOf(id), 1);
  }

  private indexOf(id: number): number {
    const index = this.products.findIndex((product) => product.id === id);

    if (index === -1) {
      throw new AppError('Produto não encontrado', 404);
    }

    return index;
  }

  private asObject(data: unknown): Record<string, unknown> {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      throw new AppError('O corpo da requisição precisa ser um objeto JSON', 400);
    }

    return data as Record<string, unknown>;
  }

  private validate(data: unknown): ProductInput {
    const { name, price, inStock, categories } = this.asObject(data);

    if (typeof name !== 'string') {
      throw new AppError('O campo name precisa ser um texto', 400);
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 3) {
      throw new AppError('O campo name precisa ter pelo menos 3 caracteres', 400);
    }

    if (typeof price !== 'number' || !Number.isFinite(price)) {
      throw new AppError('O campo price precisa ser um número válido', 400);
    }

    if (price < 0) {
      throw new AppError('O campo price não pode ser negativo', 400);
    }

    if (typeof inStock !== 'boolean') {
      throw new AppError('O campo inStock precisa ser true ou false', 400);
    }

    if (!Array.isArray(categories) || categories.some((item) => typeof item !== 'string')) {
      throw new AppError('O campo categories precisa ser uma lista de textos', 400);
    }

    return { name: trimmedName, price, inStock, categories: [...categories] };
  }
}
