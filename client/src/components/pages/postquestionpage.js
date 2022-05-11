import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [tags, setTags] = useState('');
  const [emptyFieldsError, setEmptyFieldsError] = useState(false);
  const [reputationError, setReputationError] = useState(false);
  
  useEffect(() => {
    async function fetchData() {
      let loginData = await axios.post('http://localhost:8000/login');
      if (loginData.data.status === 'SESSION') {
        setUsername(loginData.data.user.username);
      }
    }

    fetchData();
  }, []);

  async function postQuestion(e) {
    e.preventDefault();
    setEmptyFieldsError(false);
    setReputationError(false);

    // Prevent posting if title is empty
    if (title.length === 0) {
      setEmptyFieldsError(true);
    } else {
      // Use regex to replace all whitespace with a single space
      let res = await axios.post('http://localhost:8000/postquestion', {
        title: title.replace(/\s+/g, ' ').trim(),
        summary: summary.trim(),
        text: text.trim(),
        tags: [...new Set(tags.trim().replace(/\s+/g, ' ').split(' '))]
      });

      if (res.data.status === 'LOW-REPUTATION') {
        setReputationError(true);
      } else if (res.data.status === 'SUCCESS') {
        navigate('/home');
      }
    }
  }

  return (
    <>
      <Banner pageRoute={'/postquestion'} loggedIn={username != null} username={username} />
      <br />
      <Container fluid>
      { emptyFieldsError ?
        <Alert variant='warning' onClose={() => setEmptyFieldsError(false)} dismissible>
          <p>The title cannot be empty!</p>
        </Alert> : null }
      { reputationError ?
      <Alert variant='warning' onClose={() => setReputationError(false)} dismissible>
        <p>Your reputation must be 100 or higher to post!</p>
      </Alert> : null }
      { username != null ? (
        <Form onSubmit={postQuestion}>
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
          <Form.Group className='mb-3'>
            <Form.Label>Tags</Form.Label>
            <Form.Control 
              as='textarea'
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
             <Form.Text className='text-muted'>
              Separate by whitespace.
            </Form.Text>
          </Form.Group>
          <Button type='submit'>Post Question</Button>
        </Form>
      ) : <p>You must be logged in to post questions.</p> }
      </Container>
    </>
  );
}