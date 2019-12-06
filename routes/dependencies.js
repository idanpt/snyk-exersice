import express from 'express';
import Fetcher from '../src/Dependencies/Fetcher';

const router = express.Router();

/* GET users listing. */
router.get('/', async (req, res, next) => {
    if (!req.query.packageName || typeof req.query.packageName === 'undefined') {
        return res.status(400).send({
            success: false,
            message: 'packageName is required'
        });
    }

    const fetcher = new Fetcher(req.query.packageName);

    try {
        let results = await fetcher.fetch(req.query.packageName);

        res.send({
            success: true,
            message: '',
            dependencyTree: results
        });
    } catch (e) {
        console.error(e);

        res.status(500).send({
            success: false,
            message: 'Whoops! Something went wrong',
        });
    }
});

module.exports = router;