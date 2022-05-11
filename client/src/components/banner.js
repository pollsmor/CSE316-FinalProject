import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar, Form, FormControl, Alert } from 'react-bootstrap';
import axios from 'axios';

axios.defaults.withCredentials = true;

export default function Banner(props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [logoutError, setLogoutError] = useState(false);

  function onSearch(e) {
    e.preventDefault();
    if (query === '') return;
    navigate(`/search/${query}`);
  }

  function logout() {
    setLogoutError(false);
    axios.post('http://localhost:8000/logout')
      .then(res => {
        if (res.data.status === 'SUCCESS') {
          navigate('/');
        } else setLogoutError(true);
      });
  }

  return (
    <>
      <Navbar className='' bg='dark' variant='dark' expand='sm'>
        <Container fluid>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav activeKey={props.pageRoute} className='m-auto'>
              <Navbar.Brand href='/home'>Fake Stack Overflow</Navbar.Brand>
              <Nav.Link href='/home'>Questions</Nav.Link>
              <Nav.Link href='/tags'>Tags</Nav.Link>
              <Form onSubmit={onSearch} className='mx-2' style={{ width: '10em' }}>
                <FormControl
                  type='search'
                  placeholder='Search...' 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </Form>
              { props.loggedIn ?
                <Nav.Link href='/postquestion'>Ask</Nav.Link> : null
              }
              { props.loggedIn ?
                <Nav.Link onClick={logout}>Logout</Nav.Link> :
                <Nav.Link href='/'>Login</Nav.Link>
              }
              { props.loggedIn ?
                <Nav.Link href='/profile'>{props.username}</Nav.Link> : null
              }
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      { logoutError ? 
        <Container className='my-3'>
          <Alert variant='warning'>
            <p>Failed to log out.</p>
          </Alert>
        </Container> : null
      }
    </>
  );
}