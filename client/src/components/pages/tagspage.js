import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';

import Banner from '../banner.js';

axios.defaults.withCredentials = true;

export default function TagsPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const [tagsMap, setTagsMap] = useState({});
  
  useEffect(() => {
    async function fetchData() {
      let loginData = await axios.post('http://localhost:8000/login');
      if (loginData.data.status === 'SESSION')
        setUsername(loginData.data.user.username);

      let questionsData = await axios.get('http://localhost:8000/questions');
      // Count amount of questions for each tag
      let countQuestions = {};
      for (let question of questionsData.data) {
        for (let tag of question.tags) {
          if (!(tag in countQuestions))
            countQuestions[tag] = 0;

          countQuestions[tag]++;
        }
      }

      setTagsMap(countQuestions);
    }

    fetchData();
  }, []); 

  return (
    <>
      <Banner pageRoute='/tags' loggedIn={username != null} username={username} />
      <Container>
        <br />
        <Row>
          { Object.keys(tagsMap).map((tag, idx) => {
            let questionCount = tagsMap[tag];
            return (
              <Col key={ idx } className='border py-2' xs='6' sm='5' md='4' lg='3'>
                <button className='textlink mx-1' onClick={() => navigate(`/tag/${tag}`)}>
                  { tag }
                </button>
                <h6 className='mx-1'>{questionCount + (questionCount === 1 ? ' question' : ' questions')}</h6>
              </Col>
            );
          }) }
        </Row>
      </Container>
    </>
  );
}