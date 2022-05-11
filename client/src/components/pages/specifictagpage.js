import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import Banner from '../banner.js';
import QuestionsTable from '../questionstable.js';

export default function SpecificTagPage() {
  const [username, setUsername] = useState(null);
  const [questions, setQuestions] = useState([]);
  const { tagName } = useParams();

  useEffect(() => {
    async function fetchData() {
      let loginData = await axios.post('http://localhost:8000/login');
      if (loginData.data.status === 'SESSION')
        setUsername(loginData.data.user.username);

      // Tie questions to specific tag
      let questionData = await axios.get('http://localhost:8000/questions');
      let relevantQuestions = [];
      for (let q of questionData.data) {
        if (q.tags.includes(tagName))
          relevantQuestions.push(q);
      }

      setQuestions(relevantQuestions);
    }

    fetchData();
  }, [tagName]);

  return (
    <>
      <Banner loggedIn={username != null} username={username} />
      { questions.length !== 0 ? 
        <QuestionsTable questions={questions} /> : null
      }
    </>
  );
}