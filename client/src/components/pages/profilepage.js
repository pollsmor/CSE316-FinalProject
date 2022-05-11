import { useState, useEffect } from 'react';
import { Container, Alert, Tab, Row, Col, ListGroup } from 'react-bootstrap';
import axios from 'axios';

import EditableTagsTable from '../profilepage/editabletagstable.js';
import EditableAnswersTable from '../profilepage/editableanswerstable.js';
import EditableQuestionsTable from '../profilepage/editablequestionstable.js';
import { parseTime, timeDiff } from '../helpers.js';
import Banner from '../banner.js';

export default function SearchPage() {
  const [user, setUser] = useState({});

  useEffect(() => {
    async function fetchData() {
      let loginData = await axios.post('http://localhost:8000/login');
      if (loginData.data.status === 'SESSION')
        setUser(loginData.data.user);
    }

    fetchData();
  }, []);

  let loggedIn = Object.keys(user).length > 0;
  let parsedTime = parseTime(user.createdAt);
  let timeCreated = new Date(user.createdAt);
  if (!loggedIn) {
    return <>
      <Banner pageRoute='/profile' loggedIn={loggedIn} username={user.username} />
      <p>You must be logged in to view this page.</p>
    </>
  } else return (
    <>
      <Banner pageRoute='/profile' loggedIn={loggedIn} username={user.username} />
      <Container fluid className='py-2'>
        <h6>Been a user since: { parsedTime[0] + ' (' + timeDiff(timeCreated, new Date()) + ')'} </h6>
        <h6>Reputation: {user.reputation}</h6>
        <hr />
        <Tab.Container defaultActiveKey='#questions'>
          <Row>
            <Col xs={3}>
              <ListGroup>
                <ListGroup.Item action href='#questions'>Questions</ListGroup.Item>
                <ListGroup.Item action href='#answers'>Answers</ListGroup.Item>
                <ListGroup.Item action href='#tags'>Tags</ListGroup.Item>
              </ListGroup>
            </Col>
            <Col xs={8}>
              <Tab.Content>
                <Tab.Pane eventKey='#questions'>
                  { user.qstnIds.length > 0 ? (
                    <EditableQuestionsTable qstnIds={user.qstnIds} />
                  ) : <Alert variant='warning'>You have no questions.</Alert>
                  }
                </Tab.Pane>
                <Tab.Pane eventKey='#answers'>
                  { user.ansIds.length > 0 ? (
                    <EditableAnswersTable ansIds={user.ansIds} />
                  ) : <Alert variant='warning'>You have no answers.</Alert>
                  }
                </Tab.Pane>
                <Tab.Pane eventKey='#tags'>
                  { user.tagIds.length > 0 ? (
                    <EditableTagsTable tagIds={user.tagIds} />
                  ) : <Alert variant='warning'>You have no tags.</Alert>
                  }
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Container>
    </>
  );
}