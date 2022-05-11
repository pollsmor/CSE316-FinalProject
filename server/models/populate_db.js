const Question = require('./Question');
const Tag = require('./Tag');
const Answer = require('./Answer');
const Comment = require('./Comment');
const User = require('./User');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/fake_so', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open', () => {});

// First question
let ansCom = new Comment({ text: 'Dango Dango Dango Dango Dango Dango Daikazoku', commented_by: 'Kevin Li' });

let ans = new Answer({
  text: 'React Router is mostly a wrapper around the history library. history handles interaction with the browser\'s window.history for you with its browser and hash histories. It also provides a memory history which is useful for environments that don\'t have a global history. This is particularly useful in mobile app development (react-native) and unit testing with Node.',
  ans_by: 'hamkalo',
  comments: [ansCom]
});
ans.save();

let qstnCom = new Comment({ text: 'I like turtles', commented_by: 'Some kid' });

let tag = new Tag({ name: 'react' });
tag.save();
let tag2 = new Tag({ name: 'javascript' });
tag2.save();

let qstn = new Question({
  title: 'Programmatically navigate using React router',
  summary: 'Summary',
  text: 'the alert shows the proper index for the li clicked, and when I alert the variable within the last function I\'m calling, moveToNextImage(stepClicked), the same value shows but the animation isn\'t happening. This works many other ways, but I\'m trying to pass the index value of the list item clicked to use for the math to calculate.',
  asked_by: 'pollsmor',
  comments: [qstnCom]
});
qstn.save(results => {
  console.log('Data successfully inserted.');
  process.exit(0);
});