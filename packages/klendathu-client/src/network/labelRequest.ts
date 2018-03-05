import { Label, LabelInput } from 'klendathu-json-types';
import { request } from '../models/Session';

export function createLabel(owner: string, project: string, label: LabelInput): Promise<Label> {
  return request.post(`/api/labels/${owner}/${project}`, label).then(resp => {
    return resp.data;
  });
}

export function updateLabel(labelId: string, label: LabelInput): Promise<Label> {
  return request.patch(`/api/labels/${labelId}`, label).then(resp => {
    return resp.data;
  });
}

export function deleteLabel(labelId: string): Promise<any> {
  return request.delete(`/api/labels/${labelId}`).then(resp => {
    return resp.data;
  });
}
