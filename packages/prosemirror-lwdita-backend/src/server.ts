import express from 'express';
import githubRouter from './api/routes/github.router';

const app = express();
app.use(express.json());

// add the github module to the http server
// this will forward all requests starting with /api/github to the githubRouter
app.use('/api/github', githubRouter);

app.get('/', (req, res) => {
  res.send('the server is running');
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});