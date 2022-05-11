import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

import Banner from '../banner.js';

axios.defaults.withCredentials = true;

export default function PostQuestionPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [text, setText] = useState('');
  const [emptyFieldsError, setEmptyFieldsError] = useState(false);
  const { qstnId } = useParams();
  
  useEffect(() => {
    async function fetchData() {
      let loginData = await axios.post('http://localhost:8000/login');
      if (loginData.data.status === 'SESSION') {
        setUsername(loginData.data.user.username);
      }

      let questionData = await axios.get(`http://localhost:8000/question/${qstnId}`);
      setTitle(questionData.data.title);
      setSummary(questionData.data.summary);
      setText(questionData.data.text);
    }

    fetchData();
  }, [qstnId]);

  async function editQuestion(e) {
    e.preventDefault();
    setEmptyFieldsError(false);

    // Prevent posting if title is empty
    if (title.length === 0) {
      setEmptyFieldsError(true);
    } else {
      // Use regex to replace all whitespace with a single space
      let res = await axios.post(`http://localhost:8000/question/${qstnId}/editquestion`, {
        title: title.replace(/\s+/g, ' ').trim(),
        summary: summary.trim(),
        text: text.trim()
      });

      if (res.data.status === 'SUCCESS') {
        navigate('/profile');
      }
    }
  }

  return (
    <>
      <Banner loggedIn={username != null} username={username} />
      <br />
      <Container fluid>
      { emptyFieldsError ?
        <Alert variant='warning' onClose={() => setEmptyFieldsError(false)} dismissible>
          <p>The title cannot be empty!</p>
        </Alert> : null }
      { username != null ? (
        <Form onSubmit={editQuestion}>
          <Form.Group className='mb-3'>
            <Form.Label>Title</Form.Label>
            <Form.Control 
              as='textarea'
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={50}
              rows={1}
            />
            <Form.Text className='text-muted'>
              50 characters max.
            </Form.Text>
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>Summary</Form.Label>
            <Form.Control 
              as='textarea'
              value={summary}
              onChange={e => setSummary(e.target.value)}
              maxLength={140}
              rows={2}
            />
            <Form.Text className='text-muted'>
              140 characters max.
            </Form.Text>
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>Text</Form.Label>
            <Form.Control 
              as='textarea'
              value={text}
              onChange={e => setText(e.target.value)}
              rows={7}
            />
          </Form.Group>
          <Button type='submit'>Edit Question</Button>
        </Form>
      ) : <p>You must be logged in to post questions.</p> }
      </Container>
    </>
  );
}