import type { Request, Response } from 'express';
import { searchUsers } from '../repositories/user.repository.js';
export const searchUsersController = async (req: Request, res: Response) => {
  try {
    const { query } = req.query as { query: string };
    if (!query) {
      return res.json([]);
    }
    const users = await searchUsers(query);
    res.json(users);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
