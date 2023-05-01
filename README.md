# COMP-NETWORK-I-Project
2110471 COMP NETWORK I (2022/2) Project - Socket Programming

## Requirement
1. (1.5) The system must have at least 2 computers for implementing the chat application,
one for the server and client and others for the client.
2. (1.0) The client can set a nickname.
3. (1.0) Each client can see a list of all clients.
4. (1.0) Each client can see a list of all created chat groups.
5. (1.0) Each client can create a chat group(s) and join the chat group(s).
6. (1.0) The chat room must have a chat box and a chat window.
7. (1.0) Each client can send a direct message to other clients in the list.
8. (1.0) In a group chat room, each client must see all the text messages from other clients
in that chat group.

## Special points
1. Register Login Logout
2. JSON databases
3. Delete chat message
4. Music

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
