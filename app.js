const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.json());

// app.get('/', (req, res) => {
//     res.status(200).json({ message: 'Hello from the server side' , app: 'Natours'});
// });

// app.post('/', (req, res) => {
//     res.send('You can post here');
// })

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours: tours
        }
    })
});

// we can add a parameter to the url like :id and we can make it optional by adding a question mark :id?. We can access to req.params to see the url parameters
app.get('/api/v1/tours/:id', (req, res) => {
    const tour = tours.find(el => el.id == req.params.id);

    if(!tour) {
        return res.status(404).json({
            status: 'fail',
            message: 'ID not found'
        })
    }
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})

app.post('/api/v1/tours', (req, res) => {
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({id: newId}, req.body);
    tours.push(newTour);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour, 
            }
        });

    });
})

const port = 3001;
app.listen(port, () => {
    console.log(`Running on port: ${port}`);
});

