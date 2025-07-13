const User = require('../model/User');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, password } = req.body;
    if (await User.findOne({ firstName, lastName })) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ firstName, lastName, password: hash });
    await user.save();
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { firstName, lastName, password } = req.body;
    const user = await User.findOne({ firstName, lastName });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    req.session.userId = user._id;
    res.json({ message: 'Logged in' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
};
