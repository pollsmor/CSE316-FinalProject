import { useState, useEffect } from 'react';
import axios from 'axios';

import Banner from '../banner.js';
import QuestionsTable from '../questionstable.js';

axios.defaults.withCredentials = true;

export default function WelcomePage() {
  const [username, setUsername] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  useEffect(() => {
    async function fetchData() {
      let loginData = await axios.post('http://localhost:8000/login');
      if (loginData.data.status === 'SESSION')
        setUsername(loginData.data.user.username);

      let questionsData = await axios.get('http://localhost:8000/questions');
      setQuestions(questionsData.data);
    }

    fetchData();
  }, []);

  return (
    <>
      <Banner pageRoute={'/home'} loggedIn={username != null} username={username} />
      <QuestionsTable questions={questions} />
    </>
  );
}