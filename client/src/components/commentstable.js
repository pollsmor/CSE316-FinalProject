import { useState } from 'react';
import { Container, Table, Pagination, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

axios.defaults.withCredentials = true;

export default function CommentsTable(props) {
  const [activePage, setActivePage] = useState(1); 
  const [comment, setComment] = useState('');
  const [reputationError, setReputationError] = useState(false);

  function sendComment(e) {
    e.preventDefault();
    if (comment.length === 0) return;
    setReputationError(false);
    
    if ('qstnId' in props) {
      axios.post(`http://localhost:8000/question/${props.qstnId}/postcomment`, {
        comment: comment
      }).then(res => {
        if (res.data.status === 'SUCCESS') {
          setComment('');
          props.comments.unshift(res.data.comment);
        } else setReputationError(true);
      });
    } else {
      axios.post(`http://localhost:8000/answer/${props.ansId}/postcomment`, {
        comment: comment,
      }).then(res => {
        if (res.data.status === 'SUCCESS') {
          setComment('');
          props.comments.unshift(res.data.comment);
        } else setReputationError(true);
      });
    }
  }

  // Set up pagination
  let items = [];
  let pages = Math.ceil(props.comments.length / 3);
  for (let page = 1; page <= pages; page++) {
    items.push(
      <Pagination.Item 
        key={page} 
        active={page === activePage}
        onClick={() => setActivePage(page)}
      >
        {page}
      </Pagination.Item>
    );
  }

  // Only get the comments needed for a specific page
  let startCommentIdx = 3 * (activePage - 1);
  let endCommentIdx = 3 * activePage;
  let pageComments = props.comments.slice(startCommentIdx, endCommentIdx);

  return (
    <Container fluid className='py-2 px-2'>
      { reputationError ?
        <Alert variant='warning' onClose={() => setReputationError(false)} dismissible>
          <p>Your reputation must be 100 or higher to comment!</p>
        </Alert> : null }
      <h6 className='text-center'>Comments</h6>
      <Table striped bordered hover size='sm'>
      <tbody>
        { pageComments.map((c, idx) => {
          return (
            <tr key={ idx } className='align-middle'>
              <td>
                { c.text }
              </td>
              <td className='text-end' style={{ width: '22%' }}>
                <h6>{ c.commented_by }</h6>
              </td>
            </tr>
          );
        }) }
      </tbody>
      </Table>
      <Pagination size='sm' className='justify-content-center'>
        <Pagination.Prev 
          disabled={ activePage <= 1 }
          onClick={() => setActivePage(activePage - 1)}
        >
          prev
        </Pagination.Prev>
        { items }
        <Pagination.Next 
          disabled={ activePage >= pages }
          onClick={() => setActivePage(activePage + 1)}
        >
          next
        </Pagination.Next>
      </Pagination>
      { props.loggedIn ? (
        <Form onSubmit={sendComment}>
          <Form.Group>
            <Form.Control 
              placeholder='Comment must be 140 characters or less...'
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </Form.Group>
        </Form>
      ) : null }
    </Container>
  );
}