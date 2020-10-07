import {getRepository, getCustomRepository, In} from 'typeorm'
import fs from 'fs'
import csvParse from 'csv-parse'
import path from 'path';

import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

import uploadConfig from '../config/upload'
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

interface Request {
  importFilename: string
}

interface File {
  title: string,
  value: number,
  type: 'income' | 'outcome',
  category: string
}

class ImportTransactionsService {
  async execute({ importFilename }: Request): Promise<Transaction[]> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const importFilePath = path.join(
      uploadConfig.directory,
      importFilename
    );

    const imports = await fs.promises.stat(importFilePath);

    if (!imports) {
      throw new AppError("File upload failed.", 400);
    }

    //TENTAR RETORNAR OS DADOS
    //ESTÁ INSERINDO NO BD
    const transactions: File[] = [];
    const categories: string[] = [];

    const parser = csvParse(
      {
        columns: true,
        from_line: 1,
        ltrim: true,
        rtrim: true,
      }
    );

    const csvParser = fs.createReadStream(importFilePath).pipe(parser)

    csvParser.on('data', async (row) => {
        const { title, type, value, category } = row;

        categories.push(category);
        transactions.push({ title, type, value, category });
      })

    await new Promise(resolve => csvParser.on('end', resolve));

    const existingCategories = await categoriesRepository.find({
      where: {
        title: In(categories)
      },
    });

    const existentCategoriesTitles = existingCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({ title })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existingCategories];

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createdTransactions);


    await fs.promises.unlink(importFilePath);
    return (createdTransactions);
  }
}

export default ImportTransactionsService;
