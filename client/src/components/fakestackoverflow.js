import { Routes, Route } from 'react-router-dom';

import WelcomePage from './pages/welcomepage.js';
import HomePage from './pages/homepage.js';
import TagsPage from './pages/tagspage.js';
import SearchPage from './pages/searchpage.js';
import ProfilePage from './pages/profilepage.js';
import AnswersPage from './pages/answerspage.js';
import PostQuestionPage from './pages/postquestionpage.js';
import SpecificTagPage from './pages/specifictagpage.js';
import PostAnswerPage from './pages/postanswerpage.js';
import EditQuestionPage from './profilepage/editquestionpage.js';
import EditAnswerPage from './profilepage/editanswerpage.js';

export default function FakeStackOverflow() {
  return (
    <Routes>
      <Route index element={<WelcomePage />} />
      <Route path='/home' element={<HomePage />} />
      <Route path='/tags' element={<TagsPage />} />
      <Route path='/search/:query' element={<SearchPage />} />
      <Route path='/profile' element={<ProfilePage />} />
      <Route path='/answers/:qstnId' element={<AnswersPage />} />
      <Route path='/postquestion' element={<PostQuestionPage />} />
      <Route path='/tag/:tagName' element={<SpecificTagPage />} />
      <Route path='/postanswer/:qstnId' element={<PostAnswerPage />} />
      <Route path='/editquestionpage/:qstnId' element={<EditQuestionPage />} />
      <Route path='/editanswerpage/:ansId' element={<EditAnswerPage />} />
      <Route path='*' element={'Page not found.'} />
    </Routes>
  );
}