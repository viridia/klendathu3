import * as React from 'react';
import { Link, Route } from 'react-router-dom';
import * as classNames from 'classnames';
import * as qs from 'qs';

import './LeftNav.scss';

/** Link which renders in active state when all query parameters match. */
export function QueryLink({ to, query = {}, children }: {
  to: string,
  query?: { [key: string]: any },
  children: React.ReactNode,
}) {
  return (
    <Route
        path={to}
        children={({ match, history, location }) => {
          let active = !!match;
          if (match) {
            const q = qs.parse(location.search.slice(1));
            for (const key of Object.getOwnPropertyNames(query)) {
              if (q[key] !== query[key]) {
                active = false;
                break;
              }
            }
          }
          const search = qs.stringify(query);
          return (
            <Link
              className={classNames({ active })}
              to={{ pathname: to, search: search ? `?${search}` : '' }}
            >
              {children}
            </Link>
          );
        }}
    />);
}
