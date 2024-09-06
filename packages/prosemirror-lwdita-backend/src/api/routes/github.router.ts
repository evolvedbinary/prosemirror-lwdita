import { Router } from 'express';
import { authenticateUserWithOctokit, getUserInformation } from '../controller/github.controller';

const router = Router();

// GET /api/github/
router.get('/', (req, res) => {
  //TODO: send API information
  res.send('API information');
});

// GET /api/github/token exchange user code for token
router.get('/token', authenticateUserWithOctokit);

// GET /api/github/user get user information
router.get('/user', getUserInformation);

export default router;