import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Pagination, ListGroup, Row, Col, Button } from 'react-bootstrap';
import axios from 'axios';

import { parseTime } from '../helpers.js';

axios.defaults.withCredentials = true;

export default function EditableAnswersTable(props) {
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [answers, setAnswers] = useState([]);
  
  useEffect(() => {
    setRefresh(false);
    axios.get('http://localhost:8000/answers')
      .then(res => {
        let ownedAnswers = res.data.filter(ans => props.ansIds.includes(ans._id));
        ownedAnswers.sort((a, b) => -a.createdAt.localeCompare(b.createdAt));
        setAnswers(ownedAnswers);
      });
  }, [refresh]);

  function editAns(ansId, e) {
    e.preventDefault();
    navigate(`/editanswerpage/${ansId}`);
  }

  function deleteAns(ansId, e) {
    e.preventDefault();
    axios.post(`http://localhost:8000/answer/${ansId}/deleteanswer`)
      .then(res => {
        if (res.data.status === 'SUCCESS') {      
          let filteredAnswers = answers.filter(ans => ans._id !== ansId);
          setAnswers(filteredAnswers);
          setRefresh(true);
        }
      });
  }

  // Set up pagination
  let items = [];
  let pages = Math.ceil(answers.length / 5);
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
  let pageAnswers = answers.slice(startAnswerIdx, endAnswerIdx);

  return (
    <Container fluid className='border-bottom'>
      <h5 className='text-center my-2'>A N S W E R S</h5>
      <ListGroup>
        { pageAnswers.map(a => {
            let parsedTime = parseTime(a.createdAt);

            return (
              <ListGroup.Item key={a._id}>
                <Row>
                  <Col className='p text-start' xs='7'>{ a.text }</Col>
                  <Col className='text-end'>
                    <h6>{ a.ans_by }</h6>
                    <h6>{ parsedTime[0] }</h6>
                    <h6>{ parsedTime[1] }</h6>
                  </Col>
                </Row>
                <Button 
                  className='me-2'
                  size='sm'
                  onClick={(e) => editAns(a._id, e)}
                >Edit</Button>
                <Button 
                  variant='danger' 
                  className='me-2'
                  size='sm'
                  onClick={(e) => deleteAns(a._id, e)}
                >Delete</Button>
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