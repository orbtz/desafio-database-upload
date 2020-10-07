import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {

  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const incomeValue = transactions.reduce((total, item) => {
      // Podemos separar total e item em tipos (total: Balance) para melhor manutenção de código
      if (item.type === 'income') {
        return total + item.value;
      }
      return total;
    }, 0); // É possível passar um Objecto em vez de um valor único

    const outcomeValue = transactions.reduce((total, item) => {
      if (item.type === 'outcome') {
        return total + item.value;
      }
      return total;
    }, 0);

    const totalValue = incomeValue - outcomeValue;

    const balanceValue = {
      income: incomeValue,
      outcome: outcomeValue,
      total: totalValue,
    };

    return balanceValue;
  }
}

export default TransactionsRepository;
