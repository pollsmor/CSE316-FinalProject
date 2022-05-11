import { useState } from 'react';
import { Container, Pagination, ListGroup } from 'react-bootstrap';

import Answer from './answer.js';

export default function AnswersTable(props) {
  const [activePage, setActivePage] = useState(1); 

  // Set up pagination
  let items = [];
  let pages = Math.ceil(props.answers.length / 5);
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

  // Only get the answers needed for a specific page
  let startAnswerIdx = 5 * (activePage - 1);
  let endAnswerIdx = 5 * activePage;
  let pageAnswers = props.answers.slice(startAnswerIdx, endAnswerIdx);

  return (
    <Container fluid className='border-bottom'>
      <h5 className='text-center my-2'>A N S W E R S</h5>
      <ListGroup>
        { pageAnswers.map(a => {
            return (
              <ListGroup.Item key={a._id}>
                <Answer answer={a} uid={props.user._id} loggedIn={props.loggedIn} />
              </ListGroup.Item>
            );
          })
        }
      </ListGroup>
      <Pagination className='justify-content-center my-2'>
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
    </Container>
  );
}