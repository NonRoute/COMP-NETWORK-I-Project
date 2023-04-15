# COMP-NETWORK-I-Project
2110471 COMP NETWORK I (2022/2) Project - Socket Programming

## How to run the app
1. Download or clone the repository
2. Create a `.env` file in the `/chat-server` and `/chat-client` directory by copying the `.env.example` file and filling in the appropriate values
3. Start server side
```
cd chat-server
npm install
npm start
```
4. Update `REACT_APP_SERVER_URL` in the `.env` file inside `/chat-client` to match with the ngrok URL in the console after starting the server.
5. Start client side
```
cd chat-client
npm install
npm start
```
