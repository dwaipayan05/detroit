const mongoose = require('mongoose');

// TODO: Brainstorm more possible Statuses
const REPO_STATUS = {
    PENDING: 'pending',
    AVAILABLE: 'available',
}

const repositorySchema = new mongoose.Schema({
  url:         { type: String, required: true, unique: true },
  status:     { type: String, default: 'pending' }, // pending, processing, completed, failed
  dateCreated: { type: Date,   default: Date.now }
});

module.exports = mongoose.model('RepoMetadata', repositorySchema);
