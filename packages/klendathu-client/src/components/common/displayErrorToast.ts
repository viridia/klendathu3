import { toast } from 'react-toastify';
import { RequestError } from '../../network/RequestError';
import { Errors } from 'klendathu-json-types';

export function displayErrorToast(error: RequestError) {
  switch (error.code) {
    case Errors.FORBIDDEN:
      toast.error('Operation not permitted.');
      break;
    case Errors.NOT_FOUND:
      toast.error('Error: resource not found.');
      break;
    case Errors.INTERNAL:
      toast.error('Internal server error.');
      break;
    case Errors.SCHEMA:
      toast.error('JSON Schema validation failure.');
      break;
    case Errors.UNAUTHORIZED:
      toast.error('Unauthorized.');
      break;
    case Errors.EXISTS:
      toast.error('Resource already exists.');
      break;
    case Errors.CONFLICT:
      toast.error('Conflict with existing resources.');
      break;
    case Errors.INVALID_TOKEN:
      toast.error('Invalid or expired security token.');
      break;
    default:
      toast.error(error.message);
      break;
  }
}
