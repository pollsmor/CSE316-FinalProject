import * as ReactDOMClient from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import FakeStackOverflow from './components/fakestackoverflow.js';
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOMClient.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <FakeStackOverflow />
  </BrowserRouter>,
);
