import * as React from 'react';
import { Form } from 'react-bootstrap';

export class UserAccountForm extends React.Component<undefined> {
  public render() {
    return (
      <section className="card settings">
        <Form className="user-account-form">
          Account
        </Form>
      </section>
    );
  }
}
