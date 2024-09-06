import { Router } from 'express';
import { authenticateUserWithOctokit } from '../controller/github.controller';

const router = Router();

// GET /api/github/
router.get('/', (req, res) => {
  //TODO: send API information
  res.send('API information');
});

// GET /api/github/token exchange user code for token
router.get('/token', authenticateUserWithOctokit);

export default router;