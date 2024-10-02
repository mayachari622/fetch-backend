# fetch-backend

fetch backend internship assessment

## Requirements

1. **Node.js v16.x** (or newer)
   You can download and install Node.js here: (https://nodejs.org/en/download/).
2. **Dependencies**
   Install the project dependencies with `npm install`.

## Installation

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/mayachari622/fetch-backend.git
   cd fetch-backend

2. Install the required dependencies:

   ```bash
   npm install

## Running the Server

1. Start the server with the following command: node index.js
2. The server will start on http://localhost:8000

## API Endpoints

1. **Add Points (POST /add)**
   This endpoint allows you to add points to a user's account from a specific payer. Points can be added with a timestamp to keep track of when they were added.

   **Request Body Example:**

   ```json
        {
            "payer": "DANNON",
            "points": 500,
            "timestamp": "2023-01-01T10:00:00Z"
        }
    ```

    **Response:** 200 OK if the points were added successfully.

2. **Spend Points (POST /spend)**
   This endpoint allows the user to spend a specific number of points. Points are deducted from the oldest payer's balance first, based on the FIFO principle (first-in, first-out)

   **Request Body Example:**

   ```json
        {
            "points": 5000
        }
    ```

    **Response Example:** This response indicates how many points were deducted from each payer.

    ```json
        [
            { "payer": "DANNON", "points": -100 },
            { "payer": "UNILEVER", "points": -200 },
            { "payer": "MILLER COORS", "points": -4700 }
        ]
    ```

3. **Get Balance (GET /balance)**
   This endpoint returns the current balance of points for each payer.

   **Response Example:**

   ```json
        {
            "DANNON": 1000,
            "UNILEVER": 0,
            "MILLER COORS": 5300
        }
    ```

## Project Structure

1. **index.js**: This file contains the main server logic, including the /add, /spend, and /balance endpoints.
2. **package.json**: Defines the project dependencies and scripts.
