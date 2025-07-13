// controllers/repositoryController.js
const { URL } = require('url');
const { Queue } = require('bullmq');
const redisClient = require('../config/redis').redisClient;
const RepoMetadata = require('../model/Repository');

const GITHUB_PARENT_REGEX = /^\/[^\/]+\/[^\/]+(?:\.git)?\/?$/;



/**
 * POST /repositories
 * Body: { name, url, description? }
 */
exports.addRepository = async (req, res) => {
  try {
    const { url } = req.body;

    // Basic payload check
    if (!url) {
      return res.status(400).json({ message: 'URL is required.' });
    }

    // Parse & validate GitHub parent URL
    let parsed;
    try {
      parsed = new URL(url);
    } catch (_) {
      return res.status(400).json({ message: 'Invalid URL format.' });
    }

    if (
      parsed.protocol !== 'https:' ||
      parsed.hostname.toLowerCase() !== 'github.com' ||
      !GITHUB_PARENT_REGEX.test(parsed.pathname)
    ) {
      return res.status(400).json({
        message: 'URL must be a top-level GitHub repo (e.g. https://github.com/owner/repo or …/repo.git).'
      });
    }

    // TODO: Add Validation about Status, Possible Validations
    // 1. Check if the repository actually exists on GitHub & Accessible by our Service
    // 2. Repo Size Limitations to Reject Large Repos of a Certain Limit

    const exists = await RepoMetadata.findOne({ url });
    if (exists) {
      return res.status(409).json({ message: 'Repository with this URL already exists.' });
    }

    const repo = new RepoMetadata({ url, status: 'pending' });
    await repo.save();

    // Add to processing queue
    await redisClient.rpush('repo:queue', url);

    return res.status(201).json({
      message: 'Repository added successfully.',
      repository: repo
    });

  } catch (err) {
    console.error('Error in addRepository:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
