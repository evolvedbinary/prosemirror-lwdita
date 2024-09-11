import { Router } from 'express';
import { authenticateUserWithOctokit, commitChangesAndCreatePR, getUserInformation } from '../controller/github.controller';

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

// POST /api/github/integration commit changes and create PR
router.post('/integration', commitChangesAndCreatePR)

export default router;