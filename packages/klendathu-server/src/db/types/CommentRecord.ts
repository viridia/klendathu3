import { Comment } from 'klendathu-json-types';

export interface CommentRecord extends Comment {
  project: string;
}
