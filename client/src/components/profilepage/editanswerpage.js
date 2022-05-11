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
  const { ansId } = useParams();

  useEffect(() => {
    async function fetchData() {
      let loginData = await axios.post('http://localhost:8000/login');
      if (loginData.data.status === 'SESSION')
        setUsername(loginData.data.user.username);

      let answersData = await axios.get('http://localhost:8000/answers');
      let answer = answersData.data.filter(ans => ans._id === ansId)[0];
      setText(answer.text);
    }

    fetchData();
  }, []);

  function editAnswer(e) {
    e.preventDefault();
    if (text.trim().length === 0) return;

    axios.post(`http://localhost:8000/answer/${ansId}/editanswer`, {
      text: text.trim(),
    }).then(res => {
      if (res.data.status === 'SUCCESS')
        navigate('/profile');
    });
  }

  return (
    <>
      <Banner loggedIn={username != null} username={username} />
      <br />
      <Container fluid>
        <Form onSubmit={editAnswer}>
          <Form.Group className='mb-3'>
            <Form.Label>Text</Form.Label>
            <Form.Control 
              as='textarea'
              value={text}
              onChange={e => setText(e.target.value)}
              rows={7}
            />
          </Form.Group>
          <Button type='submit'>Edit Answer</Button>
        </Form>
      </Container>
    </>
  );
}