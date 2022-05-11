require('dotenv').config();
const mongoUri = 'mongodb://localhost:27017/fake_so';

// Application server
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const bcrypt = require('bcrypt');

// Mongoose models
const User = require('./models/User');
const Question = require('./models/Question');
const Tag = require('./models/Tag');
const Answer = require('./models/Answer');
const Comment = require('./models/Comment');

const app = express();
const saltRounds = 10;

// Session handling
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open', () => {});
const store = new MongoDBStore({ uri: mongoUri});

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: store,
  resave: false,
  saveUninitialized: false,
  cookie: { sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

app.listen(8000, () => {
  console.log('Fake Stack Overflow is now running.');
});

// Close Mongoose connection when Node receives Ctrl + C
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Server closed. Database instance disconnected');
    process.exit(0);
  });
});

// Routes ===================================================
app.post('/login', async function (req, res) {
  // Check if logged in via session
  if (req.session.username) {
    let user = await User.findOne({ username: req.session.username }).lean();
    res.json({ status: 'SESSION', user: user });
  } else {
    // Try to log in with provided credentials
    let user = await User.findOne({ email: req.body.email });
    if (user == null) return res.json({ status: 'FAIL' });
    bcrypt.compare(req.body.password, user.password, (err, result) => {
      if (err || !result) res.json({ status: 'FAIL' });
      else {
        req.session.username = user.username;
        res.json({ status: 'SUCCESS', username: user.username });
      }
    });
  }
});

app.post('/signup', async function (req, res) {
  let email = req.body.email;
  let emailExists = await User.exists({ email: email });
  if (emailExists) {
    res.json({ status: 'FAIL' });
  } else {
    // Create user
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
      if (err) return res.json({ status: 'FAIL' });
      let user = new User({
        username: req.body.username,
        email: email,
        password: hash
      });
  
      user.save();
      res.json({ status: 'SUCCESS' })
    });
  }
});

app.post('/logout', function (req, res) {
  if (req.session.username) {
    req.session.destroy();
    res.json({ status: 'SUCCESS' });
  } else res.json({ status: 'FAIL' });
});

// Data routes ===========================================
app.get('/questions', async function (req, res) {
  let questions = await Question.find().lean();
  let tags = await Tag.find().lean();
  let answers = await Answer.find().lean();
  
  let tagMap = {}, ansMap = {}; // Avoid looping through them over and over
  for (let tag of tags) tagMap[tag._id.toString()] = tag.name;
  for (let ans of answers) ansMap[ans._id.toString()] = ans;

  questions.forEach(q => { // Map tags and answers to question via tag/ans IDs
    q.tags = q.tagIds.map(tagId => tagMap[tagId]);
    q.answers = q.ansIds.map(ansId => ansMap[ansId]);
  });

  res.json(questions);
});

app.get('/question/:qstnId', function (req, res) {
  Question.findByIdAndUpdate(req.params.qstnId, {
    $inc: { views: 1 }
  }, async (err, result) => {
    if (err) return res.json({ status: 'FAIL' });
    result = result.toJSON();

    // Tie tags and answers to question
    let tags = await Tag.find().lean();
    let answers = await Answer.find().lean();
    let tagMap = {}, ansMap = {}; // Avoid looping through them over and over
    for (let tag of tags) tagMap[tag._id.toString()] = tag.name;
    for (let ans of answers) ansMap[ans._id.toString()] = ans;

    result.tags = result.tagIds.map(tagId => tagMap[tagId]);
    result.answers = result.ansIds.map(ansId => ansMap[ansId]);
    res.json(result);
  });
});

app.get('/answers', async function (req, res) {
  let answers = await Answer.find().lean();
  res.json(answers);
});

app.post('/postquestion', async function (req, res) {
  if (req.session.username) {
    let user = await User.findOne({ username: req.session.username });
    if (user.reputation >= 100) {
      let questionData = {
        title: req.body.title,
        summary: req.body.summary,
        text: req.body.text,
        tagIds: [],
        asked_by: req.session.username
      };

      // Tie tag names to tag IDs (other way around from /questions route)
      if (req.body.tags[0] !== '') {
        let tags = await Tag.find().lean();
        let tagMap = {};
        for (let tag of tags) tagMap[tag.name] = tag._id.toString();

        for (let tagName of req.body.tags) {
          let tag_in_db = await Tag.findOne({ name: tagName });
          if (tag_in_db == null) { // Create tag, tie to user
            tag_in_db = new Tag({ name: tagName });
            await tag_in_db.save();
            user.tagIds.push(tag_in_db._id.toString());
          }

          questionData.tagIds.push(tag_in_db._id.toString());
        }
      }

      // Save question to database and tie to user that created it
      let question = new Question(questionData);
      await question.save();
      user.qstnIds.unshift(question._id.toString());
      user.save();
      res.json({ status: 'SUCCESS' });
    } else res.json({ status: 'LOW-REPUTATION' });
  } else res.json({ status: 'NO-SESSION' });
});

app.post('/question/:qstnId/vote', async function (req, res) {
  if (req.session.username) {
    let qstnId = req.params.qstnId;
    let uid = req.body.uid; // Person who is voting
    Question.findById(qstnId, async (err, result) => {
      if (err) return res.json({ status: 'FAIL' });

      let user = await User.findOne({ username: req.session.username });
      if (user.reputation >= 100) {
        // Find user who posted the question
        let userWhoPosted = await User.findOne({ qstnIds: qstnId });

        // Handle upvotes
        if (req.body.op === 'upvote') {
          // Switching from up to downvote and vice versa
          if (req.body.switch) {
            userWhoPosted.reputation += 10;
            result.downvote_uids = result.downvote_uids.filter(e => e !== uid);
          }

          if (result.upvote_uids.indexOf(uid) === -1) {
            userWhoPosted.reputation += 5;
            result.upvote_uids.push(uid);
          } else { // If already upvoted, remove upvote
            userWhoPosted.reputation -= 5;
            result.upvote_uids = result.upvote_uids.filter(e => e !== uid);
          }
        } 
        
        else if (req.body.op === 'downvote') {
          if (req.body.switch) {
            userWhoPosted.reputation -= 5;
            result.upvote_uids = result.upvote_uids.filter(e => e !== uid);
          }

          if (result.downvote_uids.indexOf(uid) === -1) {
            userWhoPosted.reputation -= 10;
            result.downvote_uids.push(uid);
          } else { // If already downvoted, remove downvote
            userWhoPosted.reputation += 10;
            result.downvote_uids = result.downvote_uids.filter(e => e !== uid);
          }
        } 
        
        else return res.json({ status: 'FAIL' });

        await userWhoPosted.save();
        await result.save();
        res.json({ status: 'SUCCESS' });
      } else res.json({ status: 'LOW-REPUTATION' });
    });
  } else res.json({ status: 'FAIL' });
});

app.post('/question/:qstnId/postcomment', function (req, res) {
  if (req.session.username) {
    Question.findById(req.params.qstnId, async (err, result) => {
      if (err) return res.json({ status: 'FAIL' });

      let user = await User.findOne({ username: req.session.username });
      if (user.reputation >= 100) {
        let comment = new Comment({
          text: req.body.comment,
          commented_by: req.session.username
        });

        result.comments.unshift(comment);
        result.save();
        res.json({ status: 'SUCCESS', comment: comment });
      } else res.json({ status: 'LOW-REPUTATION' });
    });
  } else res.json({ status: 'FAIL' });
});

app.post('/answer/:ansId/postcomment', function (req, res) {
  if (req.session.username) {
    Answer.findById(req.params.ansId, async (err, answer) => {
      if (err) return res.json({ status: 'FAIL' });

      let user = await User.findOne({ username: req.session.username });
      if (user.reputation >= 100) {
        let comment = new Comment({
          text: req.body.comment,
          commented_by: req.session.username
        });

        answer.comments.unshift(comment);
        answer.save();

        res.json({ status: 'SUCCESS', comment: comment });
      } else res.json({ status: 'LOW-REPUTATION' });
    });
  } else res.json({ status: 'FAIL' });
});

app.post('/question/:qstnId/postanswer', function (req, res) {
  if (req.session.username) {
    // Save answer to database and tie to user that created it
    Question.findById(req.params.qstnId, async (err, question) => {
      if (err) return res.json({ status: 'FAIL' });

      let user = await User.findOne({ username: req.session.username });
      let answer = new Answer({ text: req.body.text, ans_by: user.username });
      await answer.save();
      user.ansIds.unshift(answer._id.toString());
      user.save();
      question.ansIds.unshift(answer._id.toString());
      question.save();

      res.json({ status: 'SUCCESS' });
    });
  } else res.json({ status: 'FAIL' });
});

app.post('/answer/:ansId/vote', async function (req, res) {
  if (req.session.username) {
    let ansId = req.params.ansId;
    let uid = req.body.uid; // Person who is voting
    Answer.findById(ansId, async (err, result) => {
      if (err) return res.json({ status: 'FAIL' });

      let user = await User.findOne({ username: req.session.username });
      if (user.reputation >= 100) {
        // Find user who posted the answer
        let userWhoPosted = await User.findOne({ ansIds: ansId });

        // Handle upvotes
        if (req.body.op === 'upvote') {
          // Switching from up to downvote and vice versa
          if (req.body.switch) {
            userWhoPosted.reputation += 10;
            result.downvote_uids = result.downvote_uids.filter(e => e !== uid);
          }

          if (result.upvote_uids.indexOf(uid) === -1) {
            userWhoPosted.reputation += 5;
            result.upvote_uids.push(uid);
          } else { // If already upvoted, remove upvote
            userWhoPosted.reputation -= 5;
            result.upvote_uids = result.upvote_uids.filter(e => e !== uid);
          }
        } 
        
        else if (req.body.op === 'downvote') {
          if (req.body.switch) {
            userWhoPosted.reputation -= 5;
            result.upvote_uids = result.upvote_uids.filter(e => e !== uid);
          }

          if (result.downvote_uids.indexOf(uid) === -1) {
            userWhoPosted.reputation -= 10;
            result.downvote_uids.push(uid);
          } else { // If already downvoted, remove downvote
            userWhoPosted.reputation += 10;
            result.downvote_uids = result.downvote_uids.filter(e => e !== uid);
          }
        } 
        
        else return res.json({ status: 'FAIL' });

        await userWhoPosted.save();
        await result.save();
        res.json({ status: 'SUCCESS' });
      } else res.json({ status: 'LOW-REPUTATION' });
    });
  } else res.json({ status: 'FAIL' });
});

// Routes for editing content ===============================
app.post('/question/:qstnId/editquestion', async function (req, res) {
  if (req.session.username) {
    let question = await Question.findOne({ __id: req.params.qstnId });
    question.title = req.body.title;
    question.summary = req.body.summary;
    question.text = req.body.text;
    question.save();

    res.json({ status: 'SUCCESS' });
  } else res.json({ status: 'FAIL' });
});

app.post('/answer/:ansId/editanswer', function (req, res) {
  if (req.session.username) {
    Answer.findById(req.params.ansId, (err, answer) => {
      if (err) return res.json({ status: 'FAIL' });
      answer.text = req.body.text;
      answer.save();
      res.json({ status: 'SUCCESS' });
    });
  } else res.json({ status: 'FAIL' });
});

app.post('/edittag', async function (req, res) {
  if (req.session.username) {
    let tag = await Tag.findOne({ name: req.body.name });
    if (tag == null) return res.json({ status: 'FAIL' });

    // Check if tag name already exists
    let tagsWithName = await Tag.find({ name: req.body.text }).lean();
    if (tagsWithName.length > 0) return res.json({ status: 'FAIL' });

    tag.name = req.body.text;
    tag.save();
    res.json({ status: 'SUCCESS ' });
  } else res.json({ status: 'FAIL' });
});

app.post('/question/:qstnId/deletequestion', async function (req, res) {
  if (req.session.username) {
    let qstnId = req.params.qstnId;

    // Delete ansIds linked to question
    let question = await Question.findOne({ _id: qstnId });
    await Answer.deleteMany({ _id: { $in: question.ansIds }});
    
    // Delete question itself
    await Question.deleteOne({ _id: qstnId });

    // Delete qstnId from user that posted question
    let userThatPosted = await User.findOne({ qstnIds: qstnId });
    userThatPosted.qstnIds = userThatPosted.qstnIds.filter(user_qstnId => user_qstnId !== qstnId);
    userThatPosted.save();
    res.json({ status: 'SUCCESS' });
  } else res.json({ status: 'FAIL' });
});

app.post('/answer/:ansId/deleteanswer', async function (req, res) {
  if (req.session.username) {
    let ansId = req.params.ansId;
    await Answer.deleteOne({ _id: ansId });

    // Delete ansId from user that posted answer
    let userThatPosted = await User.findOne({ ansIds: ansId });
    userThatPosted.ansIds = userThatPosted.ansIds.filter(user_ansId => user_ansId !== ansId);
    userThatPosted.save();

    // Delete ansId from question tied to answer
    let question = await Question.findOne({ ansIds: ansId });
    question.ansIds = question.ansIds.filter(qstn_ansId => qstn_ansId !== ansId);
    question.save();
    res.json({ status: 'SUCCESS' });
  } else res.json({ status: 'FAIL '});
});

app.post('/deletetag', async function (req, res) {
  if (req.session.username) {
    let tag = await Tag.findOne({ name: req.body.name });
    if (tag == null) return res.json({ status: 'FAIL' });
    let tagId = tag._id.toString();

    // Delete tag itself
    await Tag.deleteOne({ name: req.body.name });

    // Remove tag ID from users
    let users = await User.find({ tagIds: tagId });
    users.forEach(user => {
      user.tagIds = user.tagIds.filter(userTagId => userTagId !== tagId);
      user.save();
    });

    // Remove tag ID from questions
    let questions = await Question.find({ tagIds: tagId });
    questions.forEach(question => {
      question.tagIds = question.tagIds.filter(questionTagId => questionTagId !== tagId);
      question.save();
    });

    res.json({ status: 'SUCCESS', tagId: tagId });
  } else res.json({ status: 'FAIL' });
});