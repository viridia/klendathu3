import * as deepstream from 'deepstream.io-client-js';
import { toast } from 'react-toastify';

let connection: deepstreamIO.Client;

export function connect(authToken: string): Promise<deepstreamIO.Client> {
  const location = window.location;
  const secure = location.protocol === 'https:';
  const protocol = secure ? 'wss' : 'ws';
  connection = deepstream(`${protocol}://${location.host}`, { subscriptionTimeout: 4000 });
  connection.on('connectionStateChanged', connectionState => {
    if (connectionState === 'OPEN') {
      console.debug('Deepstream connection open.');
    }
    // console.info('Deepstream connection state:', connectionState);
  });
  connection.on('error', (error, event, topic) => {
    console.error('Deepstream connection error:', error, event, topic);
  });

  return new Promise((resolve, reject) => {
    connection.login({ Authorization: `Bearer ${authToken}` }, (success: boolean, data) => {
      if (success) {
        resolve(connection);
      } else {
        console.error('Deepstream login failed:', data);
        toast.error('Unable to connect to the real-time messaging service.');
        reject(new Error('deepstream failed to connect'));
      }
    });
  });
}
