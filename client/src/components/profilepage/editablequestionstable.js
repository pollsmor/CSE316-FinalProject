import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Table, Button, Pagination } from 'react-bootstrap';
import axios from 'axios';

import { parseTime } from '../helpers.js';

axios.defaults.withCredentials = true;

export default function EditableQuestionsTable(props) {
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [activePage, setActivePage] = useState(1); 

  useEffect(() => {
    async function fetchData() {
      let questionsData = await axios.get('http://localhost:8000/questions');
      let user_questions = questionsData.data.filter(q => props.qstnIds.includes(q._id));
      user_questions.sort((a, b) => -a.createdAt.localeCompare(b.createdAt));
      setQuestions(user_questions);
    }

    setRefresh(false);
    fetchData();
  }, [props.qstnIds, refresh]);

  function goToAnswersPage(qstnId) {
    navigate(`/answers/${qstnId}`);
  }

  function editQstn(qstnId, e) {
    e.preventDefault();
    navigate(`/editquestionpage/${qstnId}`);
  }

  function deleteQstn(qstnId, e) {
    e.preventDefault();
    axios.post(`http://localhost:8000/question/${qstnId}/deletequestion`)
      .then(res => {
        if (res.data.status === 'SUCCESS') {      
          let filteredQuestions = questions.filter(qstn => qstn._id !== qstnId);
          setQuestions(filteredQuestions);
          setRefresh(true);
        }
      });
  }

  // Set up pagination
  let items = [];
  let pages = Math.ceil(questions.length / 5);
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

  // Only get the questions needed for a specific page
  let startQuestionIdx = 5 * (activePage - 1);
  let endQuestionIdx = 5 * activePage;
  let pageQuestions = questions.slice(startQuestionIdx, endQuestionIdx);

  return (
    <Container fluid className='px-0'>
      <Table striped bordered hover>
      <tbody>
        { pageQuestions.map(q => {
          let parsedTime = parseTime(q.createdAt);
          let votes = q.upvote_uids.length - q.downvote_uids.length;

          return (
            <tr key={ q._id } className='align-middle'>
              <td style={{ width: '22%' }}>
                <h6>{ q.views } { q.views === 1 ? 'View' : 'Views' }</h6>
                <h6>{ q.answers.length } { q.answers.length === 1 ? 'Answers' : 'Answers' }</h6>
                <h6>{ votes } { votes === 1 ? 'Votes' : 'Votes' }</h6>
              </td>
              <td>
                <button className='textlink mx-1' onClick={() => goToAnswersPage(q._id)}>
                  { q.title }
                </button>
                <h6 className='mx-1'>{ q.summary }</h6>
                { q.tags.map((t, idx) => {
                  return (
                    <Button key={ idx } size='sm' disabled className='mx-1 my-1'>
                      { t }
                    </Button>
                  );
                }) }
              </td>
              <td className='text-end' style={{ width: '22%' }}>
                <h6>{ q.asked_by }</h6>
                <h6>{ parsedTime[0] }</h6>
                <h6>{ parsedTime[1] }</h6>
              </td>
              <td>
              <Button 
                  style={{ width: '75px' }}
                  className='me-2 mb-2'
                  size='sm'
                  onClick={(e) => editQstn(q._id, e)}
                >Edit</Button>
                <Button 
                  style={{ width: '75px' }}
                  variant='danger' 
                  className='me-2 mb-2'
                  size='sm'
                  onClick={(e) => deleteQstn(q._id, e)}
                >Delete</Button>
              </td>
            </tr>
          );
        }) }
      </tbody>
      </Table>
      <Pagination className='justify-content-center'>
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