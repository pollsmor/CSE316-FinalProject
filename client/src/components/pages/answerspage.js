import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, ToggleButton, Alert } from 'react-bootstrap';
import axios from 'axios';

import Banner from '../banner.js';
import CommentsTable from '../commentstable.js';
import AnswersTable from '../answerstable.js';
import { parseTime } from '../helpers.js';

let voteCounter = 0;

export default function AnswersPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [question, setQuestion] = useState(null);
  const [reputationError, setReputationError] = useState(false);
  const [voteStatus, setVoteStatus] = useState('');
  
  const { qstnId } = useParams();

  useEffect(() => {
    async function fetchData() {
      let questionData = await axios.get(`http://localhost:8000/question/${qstnId}`);
      if (questionData.data.status !== 'FAIL') {
        questionData.data.views += 1; // Updates on server end but not in time for client end
        setQuestion(questionData.data);

        let loginData = await axios.post('http://localhost:8000/login');
        if (loginData.data.status === 'SESSION') {
          setUser(loginData.data.user);
          let uid = loginData.data.user._id;
          if (questionData.data.upvote_uids.includes(uid))
            setVoteStatus('upvote');
          else if (questionData.data.downvote_uids.includes(uid))
            setVoteStatus('downvote');
        }
      }
    }

    // Don't allow spamming votes
    setInterval(() => {
      voteCounter -=1;
    }, 1000);
    fetchData();
  }, [qstnId]);

  function upvote_q() {
    if (voteCounter > 0) return;
    voteCounter = 1;
    setReputationError(false);

    axios.post(`http://localhost:8000/question/${qstnId}/vote`, {
      op: 'upvote',
      switch: voteStatus === 'downvote',
      uid: user._id
    }).then(res => {
      if (res.data.status === 'SUCCESS') {
        if (voteStatus === 'upvote') { // Remove upvote
          setVoteStatus('');
          question.upvote_uids = question.upvote_uids.filter(e => e !== user._id);
        } else {
          if (voteStatus === 'downvote') // Switching votes
            question.downvote_uids = question.downvote_uids.filter(e => e !== user._id);

          setVoteStatus('upvote');
          question.upvote_uids.push(user._id);
        }

        setQuestion(question);
      } else setReputationError(true);
    });
  }

  function downvote_q() {
    if (voteCounter > 0) return;
    voteCounter = 1;
    setReputationError(false);

    axios.post(`http://localhost:8000/question/${qstnId}/vote`, {
      op: 'downvote',
      switch: voteStatus === 'upvote',
      uid: user._id
    }).then(res => {
      if (res.data.status === 'SUCCESS') {
        if (voteStatus === 'downvote') { // Remove downvote
          setVoteStatus('');
          question.downvote_uids = question.downvote_uids.filter(e => e !== user._id);
        } else {
          if (voteStatus === 'upvote') // Switching votes
            question.upvote_uids = question.upvote_uids.filter(e => e !== user._id);

          setVoteStatus('downvote');
          question.downvote_uids.push(user._id);
        }

        setQuestion(question);
      } else setReputationError(true);
    });
  }

  if (question == null) // Before question is loaded in or bad question ID
    return <Banner loggedIn={user != null} username={user.username} />;

  let parsedTime = parseTime(question.createdAt);
  let votes = question.upvote_uids.length - question.downvote_uids.length;
  let loggedIn = Object.keys(user).length > 0;
  return (
    <>
      <Banner loggedIn={loggedIn} username={user.username} />
      <Container fluid className='text-center'>
        { reputationError ?
        <Alert variant='warning' onClose={() => setReputationError(false)} dismissible>
          Your reputation must be 100 or higher to vote!
        </Alert> : null }
        <Row className='h6 py-1 align-items-center'>
          <Col>{ question.answers.length + (question.answers.length === 1 ? ' Answer' : ' Answers') }</Col>
          <Col>{ question.title} </Col>
          <Col>{ question.views + (question.views === 1 ? ' View' : ' Views') }</Col>
        </Row>
        <Container className='pb-2'>
          { question.tags.map((t, idx) => {
            return (
              <Button key={ idx } size='sm' disabled className='mx-1 my-1'>
                { t }
              </Button>
            );
          }) }
        </Container>
        <Row className='border px-2 align-items-center'>
          <Col className='h6'>
            <Row className='my-1'>Vote(s): { votes }</Row>
            { user != null ? (
              <Row>
                <ToggleButton 
                  type='radio'
                  checked={voteStatus === 'upvote'}
                  value='upvote'
                  size='sm' 
                  className='my-1' 
                  variant='outline-success'
                  onClick={upvote_q}
                  style={{ width: '100px' }}
                >
                  Upvote
                </ToggleButton><br />
                <ToggleButton 
                  type='radio'
                  checked={voteStatus === 'downvote'}
                  value='downvote'
                  size='sm' 
                  className='mt-1' 
                  variant='outline-danger'
                  onClick={downvote_q}
                  style={{ width: '100px' }}
                >
                  Downvote
                </ToggleButton>
              </Row>
            ) : null }
          </Col>
          <Col className='p text-start' xs='7'>{ question.text }</Col>
          <Col className='text-end'>
            <h6>{ question.asked_by }</h6>
            <h6>{ parsedTime[0] }</h6>
            <h6>{ parsedTime[1] }</h6>
          </Col>
        </Row>
      </Container>
      <CommentsTable comments={question.comments} qstnId={question._id} loggedIn={loggedIn} />
      <br /><br /><br />
      <AnswersTable answers={question.answers} qstnId={question._id} loggedIn={loggedIn} user={user} />
      <Container className='text-center my-2'>
        { loggedIn?
          <Button onClick={() => navigate(`/postanswer/${qstnId}`)}>
            Post Answer
          </Button> : null
        }
      </Container>
    </>
  );
}