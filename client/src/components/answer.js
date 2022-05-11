import { useState, useEffect } from 'react';
import { Container, Row, Col, ToggleButton, Alert } from 'react-bootstrap';
import axios from 'axios';

import CommentsTable from './commentstable.js';
import { parseTime } from './helpers.js';

axios.defaults.withCredentials = true;

let voteCounter = 0;

export default function Answer(props) {
  const [reputationError, setReputationError] = useState(false);
  const [voteStatus, setVoteStatus] = useState('');

  useEffect(() => {
    if (props.answer.upvote_uids.includes(props.uid))
      setVoteStatus('upvote');
    else if (props.answer.downvote_uids.includes(props.uid))
      setVoteStatus('downvote');

    // Don't allow spamming votes
    setInterval(() => {
      voteCounter -= 1;
    }, 1000); // eslint-disable-next-line
  }, [props.uid]);

  function upvote_a() {
    if (voteCounter > 0) return;
    voteCounter = 1; // Reset counter to disable spamming vote button
    setReputationError(false); // Clear any errors on screen

    let ansId = props.answer._id;
    axios.post(`http://localhost:8000/answer/${ansId}/vote`, {
      op: 'upvote',
      switch: voteStatus === 'downvote',
      uid: props.uid
    }).then(res => {
      if (res.data.status === 'SUCCESS') {
        if (voteStatus === 'upvote') { // Remove upvote
          setVoteStatus('');
          props.answer.upvote_uids = props.answer.upvote_uids.filter(e => e !== props.uid);
        } else {
          if (voteStatus === 'downvote') // Switching votes
            props.answer.downvote_uids = props.answer.downvote_uids.filter(e => e !== props.uid);

          setVoteStatus('upvote');
          props.answer.upvote_uids.push(props.uid);
        }
      } else setReputationError(true);
    });
  }

  function downvote_a() {
    if (voteCounter > 0) return;
    voteCounter = 1; // Reset counter to disable spamming vote button
    setReputationError(false); // Clear any errors on screen

    let ansId = props.answer._id;
    axios.post(`http://localhost:8000/answer/${ansId}/vote`, {
      op: 'downvote',
      switch: voteStatus === 'upvote',
      uid: props.uid
    }).then(res => {
      if (res.data.status === 'SUCCESS') {
        if (voteStatus === 'downvote') { // Remove downvote
          setVoteStatus('');
          props.answer.downvote_uids = props.answer.downvote_uids.filter(e => e !== props.uid);
        } else {
          if (voteStatus === 'upvote') // Switching votes
            props.answer.upvote_uids = props.answer.upvote_uids.filter(e => e !== props.uid);

          setVoteStatus('downvote');
          props.answer.downvote_uids.push(props.uid);
        }
      } else setReputationError(true);
    });
  }

  if (props.answer == null) return null;
  let parsedTime = parseTime(props.answer.createdAt);
  let votes = props.answer.upvote_uids.length - props.answer.downvote_uids.length;
  return (
    <Container fluid>
      <Row className='align-items-center'>
        { reputationError ? 
          <Alert variant='warning' onClose={() => setReputationError(false)} dismissible>
            Your reputation must be 100 or higher to vote!
          </Alert> : null 
        }
        
        <Col>
          <Row>Votes(s): {votes}</Row>
          { props.uid !== null ? (
            <Row>
              <ToggleButton 
                type='radio'
                checked={voteStatus === 'upvote'}
                value='upvote'
                size='sm' 
                className='my-1' 
                variant='outline-success'
                onClick={upvote_a}
                style={{ width: '100px' }}
              >
                Upvote
              </ToggleButton><br />
              <ToggleButton 
                type='radio'
                checked={voteStatus === 'downvote'}
                value='downvote'
                size='sm' 
                className='my-1' 
                variant='outline-danger'
                onClick={downvote_a}
                style={{ width: '100px' }}
              >
                Downvote
              </ToggleButton>
            </Row>
          ) : null}
        </Col>
        <Col className='p text-start' xs='7'>{ props.answer.text }</Col>
        <Col className='text-end'>
          <h6>{ props.answer.ans_by }</h6>
          <h6>{ parsedTime[0] }</h6>
          <h6>{ parsedTime[1] }</h6>
        </Col>
      </Row>
      <Row>
        <CommentsTable 
          comments={props.answer.comments}
          ansId={props.answer._id}
          loggedIn={props.loggedIn} 
        />
      </Row>
    </Container>
  );
}