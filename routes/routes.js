import express from 'express';
import { validationResult } from 'express-validator';
import { Country } from '../modules/modules.js';

const router = express.Router();

router.get('/countries', async (req, res) => {
    try {
        let countries;

        if(req.query.sort === 'true') {
            countries = await Country.find().sort({ name: 1})
        } else {
            countries = await Country.find()
        }

        res.json(countries);
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.post('/countries', async (req, res) => {
    // Validation
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ erros: errors.array() })
    }

    // Existed country data
    const { alpha2Code, alpha3Code } = req.body;
    const existingCountry = await Country.findOne({
        $or: [
            { alpha2Code: alpha2Code.toUpperCase() },
            { alpha3Code: alpha3Code.toUpperCase() }
        ]
    });

    if(existingCountry) {
        return res.status(400).json({ message: 'Country is already existed!'})
    }

    // Create a new country

    const country = new Country({
        name: req.body.name,
        alpha2Code: alpha2Code.toUpperCase(),
        alpha3Code: alpha3Code.toUpperCase(),
        visited: false
    });
    try {
        const newCountry = await country.save()
        res.status(201).json(newCountry)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

router.get('/countries/:id', async (req, res) => {
    try {
        const country = await Country.findById(req.params.id);
        if (!country) {
            return res.status(404).json({ message: 'Country not found' });
        }
        
        res.json(country);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

router.put('/countries/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const updatedCountry = await Country.findOneAndUpdate(
            { _id: id },
            req.body,
            { new: true }
        );
        if (!updatedCountry) {
            return res.status(404).json({ message: 'Country not found' });
        }
        
        res.json(updatedCountry);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

router.delete('/countries/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const deletedCountry = await Country.findOneAndDelete({ _id: id });
        
        if (!deletedCountry) {
            return res.status(404).json({ message: 'Country not found' });
         }

         res.json({ message: 'Country deleted successfully' });

     } catch (err) {

         // If an error occurs during deletion
         res.status(500).json({ message: err.message });

     }

})

export default router;