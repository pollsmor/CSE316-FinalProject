import { useState, useEffect } from 'react';
import { Col, Button, Form } from 'react-bootstrap';
import axios from 'axios';

export default function EditableTag(props) {
  const [text, setText] = useState('');

  useEffect(() => {
    setText(props.tag);
  }, [props.tag]);

  function editTag(e) {
    e.preventDefault();
    if (text.length === 0 || props.tag === text) return;

    axios.post('http://localhost:8000/edittag', {
      name: props.tag,
      text: text
    }).then(res => {
      props.setRefresh(true);
    });
  }

  function deleteTag() {
    axios.post('http://localhost:8000/deletetag', {
      name: props.tag
    }).then(res => {
      props.setRefresh(true);
    });
  }

  return (
    <Col className='border py-2 align-items-stretch' xs='6' sm='5' md='4' lg='3'>
      <Form onSubmit={editTag}>
        <Form.Group className='mb-3'>
          <Form.Label>Edit tag</Form.Label>
          <Form.Control 
            value={text}
            onChange={e => setText(e.target.value)}
            rows={7}
          />
        </Form.Group>
      </Form>
      <h6 className='mx-1'>{props.questionCount + (props.questionCount === 1 ? ' question' : ' questions')}</h6>
      <Button 
        variant='danger' 
        size='sm'
        onClick={deleteTag}
      >Delete</Button>
    </Col>
  );
}