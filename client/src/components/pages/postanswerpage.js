import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';
import axios from 'axios';

import Banner from '../banner.js';

axios.defaults.withCredentials = true;

export default function PostAnswerPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const [text, setText] = useState('');
  const { qstnId } = useParams();

  useEffect(() => {
    async function fetchData() {
      let loginData = await axios.post('http://localhost:8000/login');
      if (loginData.data.status === 'SESSION') {
        setUsername(loginData.data.user.username);
      }
    }

    fetchData();
  }, []);

  function postAnswer(e) {
    e.preventDefault();
    if (text.trim().length === 0) return;

    axios.post(`http://localhost:8000/question/${qstnId}/postanswer`, {
      text: text.trim(),
    }).then(res => {
      if (res.data.status === 'SUCCESS')
        navigate(`/answers/${qstnId}`);
    });
  }

  let loggedIn = username != null;
  return (
    <>
      <Banner loggedIn={loggedIn} username={username} />
      <br />
      <Container fluid>
      { loggedIn ? (
        <Form onSubmit={postAnswer}>
          <Form.Group className='mb-3'>
            <Form.Label>Text</Form.Label>
            <Form.Control 
              as='textarea'
              value={text}
              onChange={e => setText(e.target.value)}
              rows={7}
            />
          </Form.Group>
          <Button type='submit'>Post Answer</Button>
        </Form>
      ) : <p>You must be logged in to post questions.</p> }
      </Container>
    </>
  );
}