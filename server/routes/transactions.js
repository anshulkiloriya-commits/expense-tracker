const router = require('express').Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');

router.use(auth);

router.get('/', async (req, res) => {
  const list = await Transaction.find({ user: req.userId }).sort({ date: -1 });
  res.json(list);
});

router.post('/', async (req, res) => {
  try {
    const t = await Transaction.create({ ...req.body, user: req.userId });
    res.json(t);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  await Transaction.findOneAndDelete({ _id: req.params.id, user: req.userId });
  res.json({ msg: 'Deleted' });
});

module.exports = router;