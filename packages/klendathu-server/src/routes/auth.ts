import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GithubStrategy } from 'passport-github';
import { Strategy as AnonymousStrategy } from 'passport-anonymous';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { AccountRecord } from '../db/types';
import { logger } from '../logger';
import * as jwt from 'jwt-simple';
import * as passport from 'passport';
import * as r from 'rethinkdb';
import * as qs from 'qs';
import { URL } from 'url';

import { server } from '../Server';

const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const accountsTable = r.db(process.env.DB_NAME).table('accounts');

function makeCallbackUrl(pathname: string, next?: string): string {
  const url = new URL(`http://placeholder`);
  if (process.env.USE_HTTPS) {
    url.protocol = 'https';
  }
  url.hostname = process.env.CLIENT_HOSTNAME;
  url.pathname = pathname;
  if (process.env.CLIENT_PORT && process.env.CLIENT_PORT !== '80') {
    url.port = process.env.CLIENT_PORT;
  }
  if (next) {
    url.search = `next=${encodeURIComponent(next)}`;
  }
  return url.toString();
}

function makeSessionUrl(session: SessionState, next?: string): string {
  const url = new URL(next || 'http://placeholder');
  if (process.env.USE_HTTPS) {
    url.protocol = 'https';
  }
  url.hostname = process.env.CLIENT_HOSTNAME;
  // url.pathname = pathname;
  if (process.env.CLIENT_PORT && process.env.CLIENT_PORT !== '80') {
    url.port = process.env.CLIENT_PORT;
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

interface UserToken {
  id: string;
  displayName: string;
}

function createToken(emails: Array<{ value: string }>, displayName: string): UserToken {
  if (emails.length > 0) {
    const id = emails[0].value;
    return {
      id,
      displayName,
    };
  }
  return null;
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
// TODO: This doesn't work because google doesn't allow dynamic callback urls.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: makeCallbackUrl('/auth/google/callback'),
  }, (accessToken, refreshToken, profile, done) => {
    const token = createToken(profile.emails, profile.displayName);
    if (token) {
      done(null, jwt.encode(token, jwtOpts.secretOrKey));
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
      const returnTo = req.query.next || '/';
      const options = {
        session: false,
        scope: ['openid', 'email', 'profile'],
        callbackURL: makeCallbackUrl('/auth/google/callback', req.query.next),
        successRedirect: `${returnTo}?session=${req.user}`,
        failureRedirect: '/account/login',
        failureFlash: 'Login failed.',
      };
      passport.authenticate('google', options as passport.AuthenticateOptions)(req, res, next);
    },
    (req, res) => {
      res.redirect(`/?session=${req.user}`);
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

// Authentication endpoint for deepstream
server.express.post('/auth-user', (req, res, next) => {
  const { Authorization } = req.body.authData;
  const { remoteAddress } = req.body.connectionData;
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
