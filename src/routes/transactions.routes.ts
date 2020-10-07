import multer, { memoryStorage } from 'multer';
import {getRepository, getCustomRepository, TransactionRepository} from 'typeorm'
import { Router } from 'express';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import Category from '../models/Category';

import uploadConfig from '../config/upload';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find();

  const balance = await transactionsRepository.getBalance();

  const transactionsBalance = {
    transactions,
    balance
  }

  response.json(transactionsBalance);
});

transactionsRouter.post('/', async (request, response) => {
  const createTransactionService = new CreateTransactionService();

  const { title, value, type, category } = request.body;

  // Arrumar o HARD-CODE no execute()
  // Criar Categoria se não existir, e usar o que estiver no BD
  const transactionReturn = await createTransactionService.execute({
    title,
    value,
    type,
    category
  });

  delete transactionReturn.category_id;
  // delete transactionReturn.id;
  delete transactionReturn.created_at;
  delete transactionReturn.updated_at;

  return response.json(transactionReturn);

});

transactionsRouter.delete('/:id', async (request, response) => {
  const deleteTransactionService = new DeleteTransactionService();

  const {id} = request.params;

  await deleteTransactionService.execute(id);

  return response.status(204).send();
});

transactionsRouter.post('/import', upload.single('file'), async (request, response) => {
  const importTransactionsService = new ImportTransactionsService();
  const imports = await importTransactionsService.execute({
    importFilename: request.file.filename
  });

  return response.json(imports);
});

export default transactionsRouter;
