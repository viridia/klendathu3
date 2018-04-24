import {
  Account,
  Attachment,
  Errors,
  Issue,
  IssueInput,
  Label,
  LabelInput,
  Role,
  ProjectPrefsInput,
} from 'klendathu-json-types';
import { session, request } from '../models/Session';
import { AxiosError } from 'axios';
import { RequestError } from './RequestError';

export interface LoginResponse {
  token: string;
}

export function handleAxiosError(error: AxiosError) {
  if (error.response) {
    if (error.response.data.error) {
      throw new RequestError(error.response.data.error, error.response.data.details);
    } else if (error.response.status) {
      switch (error.response.status) {
        case 401: throw new RequestError(Errors.UNAUTHORIZED);
        case 403: throw new RequestError(Errors.FORBIDDEN);
        case 404: throw new RequestError(Errors.NOT_FOUND);
        case 409: throw new RequestError(Errors.CONFLICT);
        default:
        throw new RequestError(Errors.UNKNOWN, {
          status: error.response.status,
          message: error.message,
        });
      }
    }
  }

  throw new RequestError(Errors.UNKNOWN, { message: error.message });
}

export function createLabel(account: string, project: string, label: LabelInput): Promise<Label> {
  return request.post(`/api/labels/${account}/${project}`, label).then(resp => {
    return resp.data;
  }, handleAxiosError);
}

export function updateLabel(labelId: string, label: LabelInput): Promise<Label> {
  return request.patch(`/api/labels/${labelId}`, label).then(resp => {
    return resp.data;
  }, handleAxiosError);
}

export function deleteLabel(labelId: string): Promise<any> {
  return request.delete(`/api/labels/${labelId}`).then(resp => {
    return resp.data;
  }, handleAxiosError);
}

export function searchLabels(
    account: string, project: string, token: string, callback: (labels: Label[]) => void): void {
  session.connection.rpc.make(
      `labels.search`,
      { account, project, token },
      (error: string, resp: Label[]) => {
    if (resp && !error) {
      callback(resp);
    }
  });
}

export function addPrefsLabel(account: string, project: string, label: string): Promise<Label> {
  return request.put(`/api/project-prefs/${account}/${project}/label/${label}`).then(resp => {
    return resp.data;
  }, handleAxiosError);
}

export function removePrefsLabel(account: string, project: string, label: string): Promise<Label> {
  return request.delete(`/api/project-prefs/${account}/${project}/label/${label}`).then(resp => {
    return resp.data;
  }, handleAxiosError);
}

export function updateProjectPrefs(account: string, project: string, input: ProjectPrefsInput):
    Promise<Label> {
  return request.patch(`/api/project-prefs/${account}/${project}`, input).then(resp => {
    return resp.data;
  }, handleAxiosError);
}

export function createIssue(account: string, project: string, label: IssueInput): Promise<Issue> {
  return request.post(`/api/issues/${account}/${project}`, label).then(resp => {
    return resp.data;
  }, handleAxiosError);
}

export function updateIssue(issueId: string, issue: Partial<IssueInput>): Promise<Issue> {
  return request.patch(`/api/issues/${issueId}`, issue).then(resp => {
    return resp.data;
  }, handleAxiosError);
}

export function deleteIssue(issue: string): Promise<any> {
  return request.delete(`/api/issues/${issue}`).then(resp => {
    return resp.data;
  }, handleAxiosError);
}

export function searchIssues(
    account: string, project: string, token: string, callback: (issues: Issue[]) => void): void {
  session.connection.rpc.make(
      `issues.search`,
      { account, project, token, limit: 10 },
      (error: string, resp: Issue[]) => {
    if (resp && !error) {
      callback(resp);
    }
  });
}

export function searchAccounts(
    token: string,
    options: { project?: string; type?: string, limit?: number },
    callback: (account: Account[]) => void): void {
  session.connection.rpc.make(
      `accounts.search`,
      { token, ...options },
      (error: string, resp: Account[]) => {
    if (resp && !error) {
      callback(resp);
    }
  });
}

export function createUserAccount(email: string, password: string): Promise<LoginResponse> {
  return request.post(`/auth/signup`, { email, password })
  .then(resp => resp.data, handleAxiosError);
}

export function sendVerifyEmail(email: string): Promise<LoginResponse> {
  return request.post(`/auth/sendverify`, { email }).then(resp => resp.data, handleAxiosError);
}

export function verifyEmail(email: string, token: string): Promise<LoginResponse> {
  return request.post(`/auth/verify`, { email, token }).then(resp => resp.data, handleAxiosError);
}

export function changeAccountInfo(uname: string, display: string): Promise<undefined> {
  return request.patch(`/api/accounts/me`, { uname, display })
  .then(resp => resp.data, handleAxiosError);
}

export function setProjectRole(
    accountId: string, project: string, userId: string, role: Role): Promise<undefined> {
  return request.post(`/api/projects/${accountId}/${project}/members/${userId}`, { role })
  .then(resp => {
    return resp.data;
  }, handleAxiosError);
}

export function removeProjectRole(
    accountId: string, project: string, userId: string): Promise<undefined> {
  return request.delete(`/api/projects/${accountId}/${project}/members/${userId}`)
  .then(resp => {
    return resp.data;
  }, handleAxiosError);
}

export function setOrganizationRole(
    accountId: string, userId: string, role: Role): Promise<undefined> {
  return request.post(`/api/organizations/${accountId}/members/${userId}`, { role })
  .then(resp => {
    return resp.data;
  }, handleAxiosError);
}

export function removeOrganizationRole(
    accountId: string, project: string, userId: string): Promise<undefined> {
  return request.delete(`/api/organizations/${accountId}/members/${userId}`)
  .then(resp => {
    return resp.data;
  }, handleAxiosError);
}

export function getFileInfo(id: string, callback: (attachment: Attachment) => void): void {
  session.connection.rpc.make(`file.info`, { id }, (error: string, resp: Attachment) => {
    if (resp && !error) {
      callback(resp);
    }
  });
}

export function getFileInfoList(
    idList: string[], callback: (attachments: Attachment[]) => void): void {
  session.connection.rpc.make(`file.info.list`, idList, (error: string, resp: Attachment[]) => {
    if (resp && !error) {
      callback(resp);
    }
  });
}
