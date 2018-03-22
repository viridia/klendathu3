import * as fs from 'fs';
import * as multer from 'multer';
import * as r from 'rethinkdb';
import * as http from 'http';
import * as qs from 'qs';
import { URL } from 'url';
import { getProjectAndRole } from '../db/userRole';
import { Role, Errors } from 'klendathu-json-types';
import { AccountRecord } from '../db/types';
import { handleAsyncErrors } from './errors';
import { logger } from '../logger';
import { server } from '../Server';

function shouldCreateThumbnail(type: string) {
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

const upload = multer({ dest: process.env.UPLOADS_DIR });

// Upload attachments.
server.api.post('/file/:account/:project',
    upload.single('attachment'),
    handleAsyncErrors(async (req, res) => {
  if (!req.user) {
    return res.status(401).end();
  }
  const user = req.user as AccountRecord;
  const { account, project }: { account: string, project: string } = req.params;
  const { projectRecord, role } = await getProjectAndRole(account, project, user);
  const details = { user: user.uname, account, project };
  const file: Express.Multer.File = req.file;

  if (!projectRecord || (!projectRecord.isPublic && role < Role.VIEWER)) {
    if (project) {
      logger.error(`upload file: project ${project} not visible.`, details);
    } else {
      logger.error(`upload file: project ${project} not found.`, details);
    }
    res.status(404).json({ error: Errors.NOT_FOUND });
    return;
  }

  if (role < Role.REPORTER) {
    logger.error(`upload file: user has insufficient privileges.`, details);
    res.status(403).json({ error: Errors.FORBIDDEN });
    return;
  }

  logger.info('Uploading:', file.originalname, file.mimetype, details);

  r.uuid().run(server.conn).then(id => {
    if (shouldCreateThumbnail(file.mimetype)) {
      // Create two images: a full-sized one and a thumbnail.
      // const transformer = sharp().resize(70, 70).max().withoutEnlargement();
      const url = new URL(process.env.IMGPROC_URL);
      const thumbReq = http.request({
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: `/thumbnail?${qs.stringify({ width: 70, height: 70 })}`,
        method: 'POST',
        headers: {
          'Content-Type': file.mimetype,
          'Content-Length': file.size,
        }
      }, thumbRes => {
        // Open a write stream to ReGrid
        // logger.info('creating write stream for thumbnail');
        const wsThumb = server.bucket.createWriteStream({
          filename: `${id}-thumb`,
          metadata: {
            filename: file.originalname,
            contentType: file.mimetype,
            account,
            project,
            mark: true, // For garbage collection.
          },
        });
        thumbRes.pipe(wsThumb, { end: true });
      });

      // Pipe the image to the image processing service.
      fs.createReadStream(file.path).pipe(thumbReq, { end: true });

      thumbReq.on('error', (e: any) => {
        logger.error(e);
        fs.unlink(file.path, () => {
          res.status(500).json({ err: 'upload' });
        });
      });
      thumbReq.on('finish', async () => {
        // const thumbInfo = await server.bucket.getFilename(`${id}-thumb`);
        logger.info('creating write stream for full image');
        const wsFull = server.bucket.createWriteStream({
          filename: id,
          metadata: {
            filename: file.originalname,
            thumb: `${id}-thumb`,
            contentType: file.mimetype,
            account,
            project,
            mark: true, // For garbage collection.
          },
        });
        fs.createReadStream(file.path).pipe(wsFull);
        wsFull.on('error', (e: any) => {
          logger.error(e);
          fs.unlink(file.path, () => {
            res.status(500).json({ err: 'upload' });
          });
        });
        wsFull.on('finish', async () => {
          logger.info('File upload successful:', file.originalname, file.mimetype, details);
          // const fileInfo = await server.bucket.getFilename(id);
          // Delete the temp file.
          fs.unlink(file.path, () => {
            res.json({
              name: file.originalname,
              id,
              url: `/api/file/${id}`,
              thumb: `/api/file/${id}-thumb`,
            });
          });
        });
      });
    } else {
      // For non-image attachments.
      logger.info('creating write stream for non-image');
      const ws = server.bucket.createWriteStream({
        filename: id,
        metadata: {
          filename: file.originalname,
          contentType: file.mimetype,
          account,
          project,
          mark: true, // For garbage collection.
        },
      });
      fs.createReadStream(file.path).pipe(ws);
      ws.on('error', (e: any) => {
        logger.error(e);
        fs.unlink(file.path, () => {
          res.status(500).json({ err: 'upload' });
        });
      });
      ws.on('finish', async () => {
        // Delete the temp file.
        logger.info('File upload successful:', file.originalname, file.mimetype, details);
        // const fileInfo = await server.bucket.getFilename(`${id}`);
        fs.unlink(file.path, () => {
          res.json({
            name: file.originalname,
            id,
            url: `/api/file/${id}`,
          });
        });
      });
    }
  });
}));

server.api.get('/file/:id', handleAsyncErrors(async (req, res) => {
  const { id }: { id: string } = req.params;
  const record = await server.bucket.getFile({ filename: id });

  // TODO: This doesn't work because image urls don't have credentials.
  // const user = req.user as AccountRecord;
  // console.log({ id, user });
  // const { account, project }: { account: string, project: string } = record.metadata;
  // const { role } = await getProjectAndRole(account, project, user);
  // const details = { user: user ? user.uname : null, account, project, id };
  // console.log(user, record);

  // if (role < Role.VIEWER) {
  //   logger.error(`download file: project ${project} not found.`, details);
  //   res.status(404).json({ error: Errors.NOT_FOUND });
  //   return;
  // }

  // if (record.metadata.account !== account || record.metadata.project !== project) {
  //   logger.error(`download file: no permission to access uploaded file.`, details);
  //   res.status(403).json({ error: Errors.FORBIDDEN });
  //   return;
  // }

  const rs = server.bucket.createReadStream({ id });
  res.set('Content-Type', record.metadata.contentType);
  res.set('Content-Disposition', `attachment; filename="${record.metadata.filename}"`);
  rs.pipe(res);
}));
