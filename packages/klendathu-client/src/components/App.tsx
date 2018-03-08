import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AccountPage } from './account/AccountPage';
import { hot } from 'react-hot-loader';
import { MainPage } from './main/MainPage';

import '../styles/bootstrap.scss';
import '../styles/card.scss';
import '../styles/form.scss';
import '../styles/layout.scss';
import '../styles/scrollbars.scss';
import '../styles/table.scss';
import './App.scss';

class App extends React.Component<undefined> {
  public render() {
    return (
      <Router>
        <Switch>
          <Route path="/account" component={AccountPage} />
          <Route path="/" component={MainPage} />
        </Switch>
      </Router>
    );
  }
}

export default hot(module)(App);
