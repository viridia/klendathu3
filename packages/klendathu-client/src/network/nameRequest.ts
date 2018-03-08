import { Account } from 'klendathu-json-types';
import { request } from '../models';

export function lookupName(name: string): Promise<Account> {
  if (!name) {
    return Promise.resolve({} as any as Account);
  }
  return request.get(`/api/names/${name}`).then(resp => {
    return resp.data as Account;
  });
}
