// @ts-nocheck
import { NavLink } from 'react-router-dom';

// react-bootstrap
import { Card, Row, Col, Button, InputGroup, Form } from 'react-bootstrap';

// third party
import FeatherIcon from 'feather-icons-react';

// -----------------------|| SignUp 1 ||-----------------------//

export default function SignUp1() {
  return (
    <div className="auth-wrapper">
      <div className="auth-content text-center">
        <Card className="borderless">
          <Row className="align-items-center text-center">
            <Col>
              <Card.Body className="card-body">
                <div className="autokosova-auth-brand mx-auto mb-4">
                  <span className="autokosova-auth-brand__icon">AK</span>
                  <span className="autokosova-auth-brand__text">AutoKosova</span>
                </div>
                <h4 className="mb-3 f-w-400">Sign up</h4>
                <InputGroup className="mb-3">
                  <InputGroup.Text>
                    <FeatherIcon icon="user" />
                  </InputGroup.Text>
                  <Form.Control type="text" placeholder="Username" />
                </InputGroup>
                <InputGroup className="mb-3">
                  <InputGroup.Text>
                    <FeatherIcon icon="mail" />
                  </InputGroup.Text>
                  <Form.Control type="email" placeholder="Email address" />
                </InputGroup>
                <InputGroup className="mb-4">
                  <InputGroup.Text>
                    <FeatherIcon icon="lock" />
                  </InputGroup.Text>
                  <Form.Control type="password" placeholder="Password" />
                </InputGroup>
                <Form.Check type="checkbox" className="text-left mb-4 mt-2" label="Send me the Newsletter weekly." defaultChecked />
                <Button className="btn-block mb-4">Sign up</Button>
                <p className="mb-2">
                  Already have an account?{' '}
                  <NavLink to="/login" className="f-w-400">
                    Signin
                  </NavLink>
                </p>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}
