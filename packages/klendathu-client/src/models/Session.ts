import { History, Location } from 'history';
import { Account } from 'klendathu-json-types';
import { observable } from 'mobx';
import { connect } from '../network/deepstream';
import axios from 'axios';
import * as qs from 'qs';

export class Session {
  @observable.ref public account: Account = null;
  public request = axios.create();
  public connection: deepstreamIO.Client = null;

  private token: string;

  constructor() {
    this.request.interceptors.request.use(config => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
        return config;
      }
      return config;
    });
  }

  get isLoggedIn() {
    return !!this.account;
  }

  public resume(location: Location, history: History) {
    this.token = localStorage.getItem('token');
    if (!this.token) {
      const query = qs.parse(location.search.slice(1));
      if (query.token) {
        this.token = query.token;
      } else {
        history.replace('/account/login');
        return;
      }
    }
    if (!this.account) {
      this.request.get('/api/accounts/me').then(resp => {
        return connect(this.token).then(connection => {
          this.connection = connection;
          this.account = resp.data;
        });
      }, error => {
        console.error(error.response);
        history.replace('/account/login');
      });
    }
  }

  public login(username: string, password: string): Promise<Account> {
    // this.token = token;
    localStorage.setItem('token', this.token);
    this.request.get('/api/accounts/me').then(resp => {
      return connect(this.token).then(connection => {
        this.connection = connection;
        this.account = resp.data;
      });
    });
    // axios.get(`/api/accounts)
    return null;
  }

  /** Reload the user's account info. Used when changing display name or other user props. */
  public reload() {
    this.request.get('/api/accounts/me').then(resp => {
      this.account = resp.data;
    });
  }

  public logout() {
    this.token = null;
    this.account = null;
    localStorage.removeItem('token');
  }
}

export const session = new Session();
export const request = session.request;
