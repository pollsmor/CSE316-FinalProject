import { useState, useEffect } from 'react';
import { Container, Row } from 'react-bootstrap';
import axios from 'axios';

import EditableTag from './editabletag.js';

export default function EditableTagsTable(props) {
  const [refresh, setRefresh] = useState(false);
  const [tagsMap, setTagsMap] = useState({});

  useEffect(() => {
    setRefresh(false);
    async function fetchData() {
      let questionsData = await axios.get('http://localhost:8000/questions');
      // Count amount of questions for each tag
      let countQuestions = {};
      for (let question of questionsData.data) {
        let tags = question.tags;
        let tagIds = question.tagIds;
        for (let i = 0; i < tagIds.length; i++) {
          if (props.tagIds.includes(tagIds[i])) {
            if (!(tags[i] in countQuestions))
            countQuestions[tags[i]] = 0;

            countQuestions[tags[i]]++;
          }
        }
      }

      setTagsMap(countQuestions);
    }

    fetchData(); // eslint-disable-next-line
  }, [refresh]); 

  return (
    <Container>
      <br />
      <Row>
        { Object.keys(tagsMap).map((tag, idx) => {
          let questionCount = tagsMap[tag];
          return (
            <EditableTag 
              key={idx} 
              tag={tag} 
              setRefresh={setRefresh} 
              questionCount={questionCount} 
            />
          );
        }) }
      </Row>
    </Container>
  );
}