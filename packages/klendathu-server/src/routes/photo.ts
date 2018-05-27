import * as fs from 'fs';
import * as r from 'rethinkdb';
import * as http from 'http';
import * as qs from 'qs';
import { URL } from 'url';
import { getAccountAndRole } from '../db/userRole';
import { Role, Errors } from 'klendathu-json-types';
import { AccountRecord } from '../db/types';
import { handleAsyncErrors } from './errors';
import { logger } from '../logger';
import { server } from '../Server';
import { upload } from './files';

function isImage(type: string) {
  if (!process.env.IMGPROC_URL) {
    return false;
  }
  switch (type) {
    case 'image/png':
    case 'image/gif':
    case 'image/jpeg':
      return true;
    default:
      return false;
  }
}

// Upload attachments.
server.api.post('/photo/:account',
    upload.single('attachment'),
    handleAsyncErrors(async (req, res) => {
  if (!req.user) {
    return res.status(401).end();
  }
  const user = req.user as AccountRecord;
  const { account }: { account: string } = req.params;
  const role = await getAccountAndRole(account, user);
  const details = { user: user.uname, account };
  const file: Express.Multer.File = req.file;

  if (role < Role.REPORTER) {
    logger.error(`upload file: user has insufficient privileges.`, details);
    res.status(403).json({ error: Errors.FORBIDDEN });
    return;
  }

  if (!isImage(file.mimetype)) {
    logger.error(`upload file: not a recognized image type.`, details);
    res.status(400).json({ error: Errors.INVALID_PHOTO });
    return;
  }

  logger.info('Uploading:', file.originalname, file.mimetype, details);

  r.uuid().run(server.conn).then(id => {
    const url = new URL(process.env.IMGPROC_URL);
    const photoReq = http.request({
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      path: `/thumbnail?${qs.stringify({ width: 128, height: 128 })}`,
      method: 'POST',
      headers: {
        'Content-Type': file.mimetype,
        'Content-Length': file.size,
      }
    }, photoRes => {
      // Open a write stream to ReGrid
      const wsPhoto = server.bucket.createWriteStream({
        filename: id,
        metadata: {
          filename: file.originalname,
          contentType: file.mimetype,
          account,
          mark: true, // For garbage collection.
        },
      });
      photoRes.pipe(wsPhoto, { end: true });
    });

    // Pipe the image to the image processing service.
    fs.createReadStream(file.path).pipe(photoReq, { end: true });

    photoReq.on('error', (e: any) => {
      logger.error(e);
      fs.unlink(file.path, () => {
        res.status(500).json({ err: 'upload' });
      });
    });
    photoReq.on('finish', async () => {
      logger.info('File upload successful:', file.originalname, file.mimetype, details);
      // Delete the temp file.
      fs.unlink(file.path, () => {
        res.json({
          name: file.originalname,
          id,
          url: `/api/photo/${id}`,
        });
      });
    });
  });
}));

server.api.get('/photo/:id', handleAsyncErrors(async (req, res) => {
  const { id }: { id: string } = req.params;
  const record = await server.bucket.getFile({ filename: id });

  const rs = server.bucket.createReadStream({ id });
  res.set('Content-Type', record.metadata.contentType);
  res.set('Content-Disposition', `attachment; filename="${record.metadata.filename}"`);
  rs.pipe(res);
}));
