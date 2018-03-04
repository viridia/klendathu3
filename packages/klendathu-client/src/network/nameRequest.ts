import { Account as AccountData } from 'klendathu-json-types';
import { request } from '../models/Session';

export function lookupName(name: string): Promise<AccountData> {
  if (!name) {
    return Promise.resolve({} as any as AccountData);
  }
  return request.get(`/api/names/${name}`).then(resp => {
    return resp.data as AccountData;
  });
}
