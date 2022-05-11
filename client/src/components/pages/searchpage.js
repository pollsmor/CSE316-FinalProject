import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import Banner from '../banner.js';
import QuestionsTable from '../questionstable.js';
import { filterQuestions } from '../helpers.js';

export default function SearchPage() {
  const [username, setUsername] = useState(null);
  const [questions, setQuestions] = useState([]);
  const { query } = useParams();

  useEffect(() => {
    async function fetchData() {
      let loginData = await axios.post('http://localhost:8000/login');
      if (loginData.data.status === 'SESSION')
        setUsername(loginData.data.user.username);

      let questionData = await axios.get('http://localhost:8000/questions');
      let questions = questionData.data;
      let queryArr = query.split(' ').map(e => e.toLowerCase());

      let queryTags = [];
      let queryStrings = [];
      for (let word of queryArr) {
        let firstChar = word.charAt(0);
        let lastChar = word.charAt(word.length - 1);

        // [?] <-- Tag must be at least 3 long
        if (word.length >= 3 && firstChar === '[' && lastChar === ']')
          queryTags.push(word.substring(1, word.length - 1));
        else 
          queryStrings.push(word); // Regular search string
      }

      let filteredQuestions = filterQuestions(questions, queryTags, queryStrings);
      setQuestions(filteredQuestions);
    }

    fetchData();
  }, [query]);

  return (
    <>
      <Banner loggedIn={username != null} username={username} />
      { questions.length !== 0 ? 
        <QuestionsTable questions={questions} /> :
        <h5 className='text-center my-2'>No results found.</h5>
      }
    </>
  );
}