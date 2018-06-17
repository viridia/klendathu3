import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GithubStrategy } from 'passport-github2';
import { Strategy as AnonymousStrategy } from 'passport-anonymous';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { AccountRecord } from '../db/types';
import { Errors } from 'klendathu-json-types';
import { logger } from '../logger';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jwt-simple';
import * as passport from 'passport';
import * as r from 'rethinkdb';
import * as qs from 'qs';
import * as crypto from 'crypto';
import { URL } from 'url';
import { server } from '../Server';
import { sendEmailVerify } from '../mail';
import { handleAsyncErrors } from './errors';

const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const accountsTable = r.db(process.env.DB_NAME).table('accounts');

function makeCallbackUrl(pathname: string, next?: string): string {
  const url = new URL(`http://placeholder`);
  if (process.env.KDT_CLIENT_HTTPS && process.env.KDT_CLIENT_HTTPS !== 'false') {
    url.protocol = 'https';
  }
  url.hostname = process.env.KDT_CLIENT_HOSTNAME;
  url.pathname = pathname;
  if (process.env.KDT_CLIENT_PORT && process.env.KDT_CLIENT_PORT !== '80') {
    url.port = process.env.KDT_CLIENT_PORT;
  }
  if (next) {
    url.search = `next=${encodeURIComponent(next)}`;
  }
  return url.toString();
}

function makeSessionUrl(session: SessionState, next?: string): string {
  const url = new URL(next || 'http://placeholder');
  if (process.env.KDT_CLIENT_HTTPS && process.env.KDT_CLIENT_HTTPS !== 'false') {
    url.protocol = 'https';
  }
  url.hostname = process.env.KDT_CLIENT_HOSTNAME;
  // url.pathname = pathname;
  if (process.env.KDT_CLIENT_PORT && process.env.KDT_CLIENT_PORT !== '80') {
    url.port = process.env.KDT_CLIENT_PORT;
  }
  const query: any = {
    token: jwt.encode(session, jwtOpts.secretOrKey),
  };
  if (next) {
    query.next = next;
  }
  url.search = `?${qs.stringify(query)}`;
  return url.toString();
}

interface SessionState {
  uid: string;
}

function getOrCreateUserAccount(email: string, verified: boolean): Promise<SessionState> {
  return accountsTable.filter({ email }).run(server.conn)
  .then(cursor => {
    return cursor.toArray<AccountRecord>().then(accounts => {
      if (accounts.length > 0) {
        return { uid: accounts[0].id };
      }
      const account: AccountRecord = {
        type: 'user',
        email,
        display: '',
        verified,
      };
      return accountsTable.insert(account).run(server.conn).then(insertResult => {
        return { uid: insertResult.generated_keys[0] };
      });
    });
  });
}

// Will use JWT strategy and fall back to anonymous if they are not logged in.
server.api.use(passport.initialize());
server.api.use(passport.authenticate(['jwt', 'anonymous'], { session: false }));

// Set up JWT strategy
passport.use(new JwtStrategy(jwtOpts, (payload: SessionState, done) => {
  return accountsTable.get<AccountRecord>(payload.uid).run(server.conn).then(account => {
    done(null, account);
  });
}));

// Set up Anonymous strategy
passport.use(new AnonymousStrategy());

// Google OAuth2 login.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: makeCallbackUrl('/auth/google/callback'),
  }, async (accessToken, refreshToken, profile, done) => {
    if (profile.emails.length > 0) {
      const session = await getOrCreateUserAccount(profile.emails[0].value, true);
      done(null, session);
    } else {
      done(Error('missing email'));
    }
  }));

  server.express.get('/auth/google', (req, res, next) => {
    const options = {
      session: false,
      scope: ['openid', 'email', 'profile'],
      callbackURL: makeCallbackUrl('/auth/google/callback', req.query.next),
    };
    passport.authenticate('google', options as passport.AuthenticateOptions)(req, res, next);
  });

  server.express.get('/auth/google/callback',
    (req, res, next) => {
      passport.authenticate('google', {
        session: false,
        failureRedirect: '/account/login',
        failureFlash: 'Login failed.',
      }, (err: any, session: SessionState) => {
        if (err) {
          return next(err);
        }
        res.redirect(makeSessionUrl(session, req.query.next));
      })(req, res, next);
    });
}

// Github OAuth login.
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: makeCallbackUrl('/auth/github/callback'),
  }, async (accessToken, refreshToken, profile, done) => {
    if (profile.emails.length > 0) {
      const session = await getOrCreateUserAccount(profile.emails[0].value, true);
      done(null, session);
    } else {
      done(Error('missing email'));
    }
  }));

  server.express.get('/auth/github', (req, res, next) => {
    const options = {
      session: false,
      // callbackURL: makeCallbackUrl('/auth/github/callback', req.query.next),
    };
    passport.authenticate('github', options as passport.AuthenticateOptions)(req, res, next);
  });

  server.express.get('/auth/github/callback',
    (req, res, next) => {
      passport.authenticate('github', {
        session: false,
        failureRedirect: '/account/login',
        failureFlash: 'Login failed.',
      }, (err: any, session: SessionState) => {
        if (err) {
          return next(err);
        }
        res.redirect(makeSessionUrl(session, req.query.next));
      })(req, res, next);
    });
}

// Facebook login.
if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: makeCallbackUrl('/auth/facebook/callback'),
    profileFields: ['id', 'displayName'],
  }, (accessToken, refreshToken, profile, done) => {
    const token = { id: `facebook:${profile.id}`, displayName: profile.displayName };
    if (token) {
      done(null, jwt.encode(token, jwtOpts.secretOrKey));
    } else {
      done(Error('missing email'));
    }
  }));

  server.express.get('/auth/facebook', (req, res, next) => {
    // console.log(req.query);
    const options = {
      session: false,
      callbackURL: makeCallbackUrl('/auth/facebook/callback', req.query.next),
    };
    passport.authenticate('facebook', options as passport.AuthenticateOptions)(req, res, next);
  });

  server.express.get('/auth/facebook/callback',
    (req, res, next) => {
      // console.log('cb', req.url);
      const options = {
        session: false,
        failureRedirect: '/account/login',
        failureFlash: 'Login failed.',
        callbackURL: makeCallbackUrl('/auth/facebook/callback', req.query.next),
      };
      passport.authenticate('facebook', options as passport.AuthenticateOptions,
      (err: any, user: string) => {
        if (err) {
          console.log('err', err);
          return next(err);
        }
        const returnTo = req.query.next || '/';
        if (returnTo.indexOf('?') >= 0) {
          res.redirect(`${returnTo}&session=${user}`);
        } else {
          res.redirect(`${returnTo}?session=${user}`);
        }
      })(req, res, next);
    });
}

// Signup handler
server.express.post('/auth/signup', handleAsyncErrors(async (req, res) => {
  const { email, password } = req.body;
  // TODO: Validate email, username, fullname.
  if (email.length < 3) {
    res.status(400).json({ error: Errors.INVALID_EMAIL });
  } else if (password.length < 5) {
    res.status(400).json({ error: Errors.PASSWORD_TOO_SHORT });
  } else {
    // console.log('signup', username, fullname);
    const users: AccountRecord[] = await (await r.table('accounts')
        .filter({ email })
        .run(server.conn)).toArray();
    if (users.length > 0) {
      // User name taken
      res.status(400).json({ error: Errors.EXISTS });
    } else {
      // Compute password hash
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          logger.error('Password hash error:', err);
          res.status(500).json({ error: Errors.INTERNAL });
        } else {
          // console.log(user, fullname);
          const ur: AccountRecord = {
            email,
            type: 'user',
            display: null,
            password: hash,
            photo: null,
            verified: false,
          };
          r.table('accounts').insert(ur).run(server.conn).then(u => {
            logger.info('User creation successful:', { email });
            const session: SessionState = {
              uid: u.generated_keys[0],
            };
            const token = jwt.encode(session, jwtOpts.secretOrKey);
            res.json({ token });
          }, reason => {
            logger.error('User creation failed:', { email });
            res.status(500).json({ error: Errors.INTERNAL });
          });
        }
      });
    }
  }
}));

// Login handler
server.express.post('/auth/login', handleAsyncErrors(async (req, res) => {
  const { email, password } = req.body;
  if (!email || email.length < 3) {
    res.status(400).json({ error: Errors.INVALID_EMAIL });
    return;
  }

  const users: AccountRecord[] = await (await r.table('accounts')
      .filter({ email })
      .run(server.conn)).toArray();
  if (users.length === 0) {
    res.status(404).json({ error: Errors.NOT_FOUND });
  } else if (users.length > 1) {
    logger.error('Multiple users with the same email:', { email });
    res.status(500).json({ error: Errors.CONFLICT });
  } else {
    const account = users[0];
    if (!account.password) {
      res.status(401).json({ error: Errors.INCORRECT_PASSWORD });
      return;
    }

    // Compare user password hash with password.
    bcrypt.compare(password, account.password, (err, same) => {
      if (same) {
        logger.info('Login successful:', { email, user: account.uname });
        const session: SessionState = {
          uid: account.id,
        };
        const token = jwt.encode(session, jwtOpts.secretOrKey);
        res.json({ token });
      } else if (err) {
        logger.error('User login error:', err);
        res.status(500).json({ error: Errors.INTERNAL });
      } else {
        res.status(401).json({ error: Errors.INCORRECT_PASSWORD });
      }
    });
  }
}));

// Send verify email address
server.express.post('/auth/sendverify', handleAsyncErrors(async (req, res) => {
  const { email } = req.body;
  // TODO: Validate email, username, fullname.
  if (email.length < 3) {
    res.status(400).json({ error: Errors.INVALID_EMAIL });
    return;
  }

  const accounts: AccountRecord[] = await (await r.table('accounts')
      .filter({ email })
      .run(server.conn)).toArray();
  if (accounts.length === 0) {
    logger.error('Attempt to verify unknown email:', { email });
    res.status(404).json({ error: Errors.NOT_FOUND });
  } else if (accounts.length > 1) {
    logger.error('Multiple users with the same email:', { email });
    res.status(500).json({ error: Errors.CONFLICT });
  } else {
    const account = accounts[0];
    if (account.type !== 'user') {
      logger.error('Attempt to verify email for organization:', { email });
      res.status(404).json({ error: Errors.NOT_FOUND });
      return;
    }

    account.verificationToken = crypto.randomBytes(20).toString('hex');

    await r.table('accounts')
        .get(account.id)
        .update({ verificationToken: account.verificationToken })
        .run(server.conn);

    sendEmailVerify(account).then(() => {
      logger.info('Sent verification email to:', account.email);
      res.end();
    }, error => {
      res.status(500).json(error);
    });
  }
}));

// Send verify email address
server.express.post('/auth/verify', handleAsyncErrors(async (req, res) => {
  const { email, token } = req.body;
  // TODO: Validate email, username, fullname.
  if (email.length < 3) {
    res.status(400).json({ error: Errors.INVALID_EMAIL });
    return;
  }

  const accounts: AccountRecord[] = await (await r.table('accounts')
      .filter({ email })
      .run(server.conn)).toArray();
  if (accounts.length === 0) {
    logger.error('Attempt to verify unknown email:', { email });
    res.status(404).json({ error: Errors.NOT_FOUND });
  } else if (accounts.length > 1) {
    logger.error('Multiple users with the same email:', { email });
    res.status(500).json({ error: Errors.CONFLICT });
  } else {
    const account = accounts[0];
    if (account.type !== 'user') {
      logger.error('Attempt to verify email for organization:', { email });
      res.status(404).json({ error: Errors.NOT_FOUND });
      return;
    }

    if (account.verificationToken !== token) {
      await r.table('accounts')
          .get(account.id)
          .update({ verificationToken: null, verified: true })
          .run(server.conn);
      logger.info('Account verified:', { email });
      res.end();
    } else {
      logger.error('Invalid token:', { email, token });
      res.status(404).json({ error: Errors.INVALID_TOKEN });
    }
  }
}));

// Authentication endpoint for deepstream
server.express.post('/auth-user', (req, res, next) => {
  const { Authorization } = req.body.authData;
  const { remoteAddress } = req.body.connectionData;
  // Note: Be careful not to leak credentials into log files here.
  if (!Authorization) {
    logger.warn('Deepstream authorization failed: missing authorization header', {
      authData: req.body.authData,
      remoteAddress,
    });
    res.status(401).end();
  } else {
    // It's a request from a server (possibly this one)
    const matchToken = Authorization.match(/Token\s+(.*)/);
    if (matchToken) {
      if (matchToken[1] === process.env.SERVER_AUTH_SECRET) {
        // It's a request from the server
        res.json({
          username: '*klendathu-server*',
          clientData: {},
          serverData: {
            userId: '0',
            type: 'system',
          },
        });
        return;
      }
    }

    // It's a request from a client
    const matchBearer = Authorization.match(/Bearer\s+(.*)/);
    if (matchBearer) {
      const payload = jwt.decode(matchBearer[1], jwtOpts.secretOrKey);
      if (!payload.uid) {
        logger.warn('Deepstream authorization failed: invalid JWT payload', {
          Authorization,
          remoteAddress,
        });
        return res.status(400).end();
      }
      return accountsTable.get<AccountRecord>(payload.uid).run(server.conn).then(account => {
        if (account) {
          res.json({
            username: account.uname,
            clientData: {},
            serverData: {
              userId: account.id,
              type: 'user',
            },
          });
        } else {
          logger.warn('Deepstream authorization failed: unknown user', { payload, remoteAddress });
          res.status(401).end();
        }
      });
    }

    logger.warn('Deepstream authorization failed: invalid authorization header', {
      Authorization,
      remoteAddress,
    });
    res.status(400).end();
  }
});
