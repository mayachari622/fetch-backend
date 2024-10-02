const express = require('express');
const Heap = require('heap-js').default;

const app = express();
const port = 8000;

app.use(express.json());

// create hashmaps to store this user's data
// transaction map -> (key, val) = (timestamp, (payer, points))
const transactionMap = new Map();
// payer points map -> (key, val) = (payer, points)
const payerPointsMap = new Map();

let totalPoints = 0;

// create a minheap for efficient timestamp retrival (oldest timestamps at the top)
const timeComparator = (a, b) => new Date(a) - new Date(b);
const minHeap = new Heap(timeComparator);

// description: keep track of each transaction when a new one is added
app.post('/add', async (req, res) => {

    const {payer, points, timestamp} = req.body;

    try {
        // define data strcuture for the transactions map
        let value = {
            payer: payer,
            points: points
        };
        transactionMap.set(timestamp, value);

        // add to payer points map
        if (payerPointsMap.has(payer)) {
            if (payerPointsMap.get(payer) + points < 0) {
                return res.status(500).send("Cannot make payer's total points negative");
            }
            payerPointsMap.set(payer, payerPointsMap.get(payer) + points);
        } else {
            if (points < 0) {
                return res.status(500).send("Cannot make payer's total points negative");
            }
            payerPointsMap.set(payer, points);
        }

        // add to min heap and keep track of total points
        minHeap.push(timestamp);
        totalPoints += points;

        return res.status(200).send("Successfully added.");
        
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send("Error adding points");

    }

});


// description: spend the user's points from oldest timestamp payer added to youngest
app.post('/spend', async (req, res) => {

    const {points} = req.body;

    if (points < 0) {
        return res.status(400).send("Must spend >= 0 points");
    }

    try {

        // check if user has enough points
        if (totalPoints < points) {
            return res.status(400).send("User does not have enough points.");
        }

        let curr = points;
        // map to keep track of all payers we are deducting from
        let payerDeductionMap = new Map();
        
        // while we still have more points to spend
        while (curr > 0) {

            if (minHeap.isEmpty()) {
                return res.status(500).send("No more payer transactions left");
            }

            // get oldest payer
            let time = minHeap.pop();
            let {payer, points: payerPoints} = transactionMap.get(time);
            
            let deduction;
            // if the payer's points are less than what we have left to spend
            if (payerPoints <= curr) {
                
                deduction = payerPoints;
                curr -= payerPoints;

                // update the two hashmaps and total once points have been spent
                transactionMap.delete(time);
                payerPointsMap.set(payer, payerPointsMap.get(payer) - payerPoints);
                totalPoints -= payerPoints;

            } else {
                // in this case, the payer has more points than we need to spend 
                deduction = curr;

                payerPointsMap.set(payer, payerPointsMap.get(payer) - curr);
                totalPoints -= curr;
                curr = 0;
            }

            // if this payer's points has already been spent, update hashmap accordingly
            if (payerDeductionMap.has(payer)) {
                payerDeductionMap.set(payer, payerDeductionMap.get(payer) - deduction);
            } else {
                payerDeductionMap.set(payer, -deduction);
            }

        }

        // convert deduction hashmap to list to be returned
        let resultList = [];
        for (const [payer, points] of payerDeductionMap.entries()) {
            resultList.push({ payer, points });
        }

        return res.status(200).json(resultList);

    } catch (err) {
        console.log(err);
        return res.status(500).send("Error spending points");
    }

});


// description: return points the user has in their account based on payer they
// were added through
app.get('/balance', async (req, res) => {
    try {
        // convert to correct format for json response
        const balance = Object.fromEntries(payerPointsMap);
        return res.status(200).json(balance);

    } catch (err) {
        return res.status(500).send("Error fetching points balance");
    }

});


// start the server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})
