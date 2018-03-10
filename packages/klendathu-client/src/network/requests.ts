import { Errors, Issue, IssueInput, Label, LabelInput } from 'klendathu-json-types';
import { session, request } from '../models/Session';
import { AxiosError } from 'axios';
import { RequestError } from './RequestError';

export function handleAxiosError(error: AxiosError) {
  if (error.response) {
    if (error.response.data.code) {
      throw new RequestError(error.response.data.code, error.response.data.details);
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

export function createIssue(account: string, project: string, label: IssueInput): Promise<Issue> {
  return request.post(`/api/issues/${account}/${project}`, label).then(resp => {
    return resp.data;
  }, handleAxiosError);
}

export function updateIssue(issueId: string, issue: IssueInput): Promise<Issue> {
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
      { account, project, token },
      (error: string, resp: Issue[]) => {
    if (resp && !error) {
      callback(resp);
    }
  });
}
