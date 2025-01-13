# chatgpt-api
Use ChatGPT API in a local web app
* backend is Node.js with Express
* frontend is Next.js

**Before starting, you need to top-up your OpenAI account and create an API key.**

## Setup Instructions

Create a `.env` file in the root of your ```backend``` folder and put your API key there: `OPENAI_API_KEY=your-api-key`

1. in the ```backend``` folder execute `npm i`
2. In the ```frontend``` folder execute `npm i` 
3. In the root folder execute `npm i`

## To run your local ChatGPT web app

In root folder execute `npm start`

## NOTES

* Pay attention to the model you use since OpenAI API token prices vary significantly.
* The app has a counter for money spent but keep in mind that prices are hardcoded - keep it updated.
* Official OpenAI prices page: [*https://openai.com/api/pricing/*](https://openai.com/api/pricing/)
