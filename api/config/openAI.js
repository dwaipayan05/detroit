const Configuration = require('openai');

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORGANIZATION,
})

module.exports = config;