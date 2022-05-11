Read the Project Specfications [here](https://docs.google.com/document/d/1zZjNk9cbNLz0mp_-YtyZxhMzUph97fVgCkSE4u2k5EA/edit?usp=sharing).

Add design docs in *images/*

## Instructions to setup and run project
1. Make sure Node.js and an installation of MongoDB is up and running for your operating system. To install the latter, head to: https://www.mongodb.com/docs/manual/installation

2. Clone this repository.

3. Change into the server/ directory. 

4. Install the necessary npm dependencies with
``` npm install ```.

5. Run the server.js file with
``` node server.js ```.

6. Open up a new terminal, and change into the client/ directory in the repository.

7. Install the necessary npm dependencies with
``` npm install ```.

8. Run the React app with
``` npm start ```.

9. The React app will open on a new tab in your browser. Note that after registering, the page will refresh and allow you to log in with the credentials you provide.

## Design Patterns
**Observer pattern**: React in general relies on the observer pattern to change elements on screen. For example, I used useEffect in most of my React files in this assignment, then put variable(s) in the second argument, the dependency array. This tells React that as soon as these variables change (dependent variables), useEffect should be rerun, triggering a call to render again.

**Command pattern**: when posting the answer to a question, I pass the question ID as a parameter. That way, the application knows what question to navigate back to from the post anaswer page. 

## Miscellaneous
