import {getRepository, getCustomRepository} from 'typeorm'

import AppError from '../errors/AppError';

interface Request{
  title: string,
  value: number,
  type: 'income' | 'outcome',
  category: string
}

import Transaction from '../models/Transaction';
import Categories from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';
import app from '../app';

class CreateTransactionService {
  public async execute({title, value, type, category}: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const {total} = await transactionsRepository.getBalance()

    if (type === 'outcome' && value > total){
      throw new AppError('Not enough money avaliable.', 400);
    }

    const categoriesRepository = getRepository(Categories);

    let categoryReturn = await categoriesRepository.findOne({
      where: { title: category }
    });

    if (!categoryReturn){
      const newCategory = categoriesRepository.create({
        title: category
      });

      await categoriesRepository.save(newCategory);

      categoryReturn = newCategory;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: categoryReturn,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
