import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Accordion, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

axios.defaults.withCredentials = true;

export default function WelcomePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [badPasswordError, setBadPasswordError] = useState(false);
  const [dupeEmailError, setDupeEmailError] = useState(false);
  const [failedLoginError, setFailedLoginError] = useState(false);

  function redirectToHome() { navigate('/home') }

  // Check if session exists and go to home if so
  useEffect(() => {
    axios.post('http://localhost:8000/login')
      .then(res => {
        if (res.data.status === 'SESSION')
          redirectToHome();
      }); // eslint-disable-next-line
  }, []);

  function onLogin(e) {
    e.preventDefault();
    // Prevent login if any fields are empty (email is checked via form)
    if (password.length === 0)
      return;

    // Get rid of previous error fields if they exist
    setFailedLoginError(false);

    axios.post('http://localhost:8000/login', {
      email: email,
      password: password
    }).then(res => {
      if (res.data.status === 'FAIL') setFailedLoginError(true);
      else redirectToHome();
    });
  }

  function onSignUp(e) {
    e.preventDefault();
    if (username.length === 0 || password.length === 0)
      return;

    setBadPasswordError(false);
    setDupeEmailError(false);

    // Check that email ID and username are not present in the password
    let emailID = email.slice(0, email.indexOf('@'));
    if (password.includes(username) || password.includes(emailID)) {
      setBadPasswordError(true);
      return;
    }

    axios.post('http://localhost:8000/signup', {
      username: username,
      email: email,
      password: password
    }).then(res => {
      // Email exists
      if (res.data.status === 'FAIL') setDupeEmailError(true);
      else window.location.reload(); // Refresh page to show login form
    });
  }

  return (
    <Container>
      <h1 className='my-2'>Welcome to Fake Stack Overflow!</h1>

      <Accordion defaultActiveKey='0'>
        <Accordion.Item eventKey='0'>
          <Accordion.Header>Login as an existing user</Accordion.Header>
          <Accordion.Body>
            { failedLoginError ?
                <Alert variant='danger' onClose={() => setFailedLoginError(false)} dismissible>
                  <p>Account doesn't exist or incorrect password.</p>
                </Alert> : null
            }
            <Form onSubmit={onLogin}>
                <Form.Group className='mb-3'>
                  <Form.Label>Email</Form.Label>
                  <Form.Control 
                    type='email' 
                    placeholder='Enter email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Label>Password</Form.Label>
                  <Form.Control 
                    type='password' 
                    placeholder='Password' 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                  />
                </Form.Group>
                <Button type='submit'>Log in</Button>
              </Form>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey='1'>
          <Accordion.Header>Register as a new user</Accordion.Header>
          <Accordion.Body>
            { badPasswordError ?
                <Alert variant='warning' onClose={() => setBadPasswordError(false)} dismissible>
                  <p>Your password may not contain your username or email ID.</p>
                </Alert> : null
            }
            { dupeEmailError ?
                <Alert variant='warning' onClose={() => setDupeEmailError(false)} dismissible>
                  <p>This email is already tied to another account.</p>
                </Alert> : null
            }
            <Form onSubmit={onSignUp}>
              <Form.Group className='mb-3'>
                <Form.Label>Username</Form.Label>
                <Form.Control 
                    placeholder='Choose a username' 
                    value={username} 
                    onChange={e => setUsername(e.target.value)}
                  />
              </Form.Group>
              <Form.Group className='mb-3'>
                <Form.Label>Email</Form.Label>
                <Form.Control 
                    type='email' 
                    placeholder='Enter email' 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                  />
              </Form.Group>
              <Form.Group className='mb-3'>
                <Form.Label>Password</Form.Label>
                <Form.Control 
                    type='password' 
                    placeholder='Password' 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                  />
              </Form.Group>
              <Button type='submit'>Sign up</Button>
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Button variant='secondary' className='my-4' onClick={redirectToHome}>
        Continue as a guest user
      </Button>
    </Container>
  );
}