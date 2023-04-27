require('dotenv').config()
import { Group, Message } from './types'
import { Server } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
const fs = require('fs')
const OktaJwtVerifier = require('@okta/jwt-verifier')
const okta = require('@okta/okta-sdk-nodejs')

const jwtVerifier = new OktaJwtVerifier({
	clientId: process.env.OKTA_CLIENT_ID,
	issuer: `${process.env.OKTA_ORG_URL}/oauth2/default`,
})

const oktaClient = new okta.Client({
	orgUrl: process.env.OKTA_ORG_URL,
	token: process.env.TOKEN,
})

const users = new Map<any, string>()
const groups = new Map<string, Group>()
const allUsers = new Set<string>()

const defaultUser = 'Anonymous'

async function authHandler(socket, next) {
	const { token = null } = socket.handshake.query || {}
	if (token) {
		try {
			const [authType, tokenValue] = token.trim().split(' ')
			if (authType !== 'Bearer') {
				throw new Error('Expected a Bearer token')
			}

			const {
				claims: { sub },
			} = await jwtVerifier.verifyAccessToken(tokenValue, 'api://default')
			const user = await oktaClient.getUser(sub)
			const name = [user.profile.firstName, user.profile.lastName].filter(Boolean).join(' ')
			users.set(socket, name)
		} catch (error) {
			console.log(error)
		}
	}

	next()
}

function saveChatMessagesToFile(filename) {
	const groupsObject = Object.fromEntries(groups)
	const data = JSON.stringify(groupsObject, null, 1)
	fs.writeFileSync(filename, data, 'utf-8')
}

function saveUsersToFile(filename) {
	const usernamesArray = Array.from(allUsers)
	const data = JSON.stringify(usernamesArray, null, 1)
	fs.writeFileSync(filename, data, 'utf-8')
}

function loadChatMessagesFromFile(filename) {
	try {
		const data = fs.readFileSync(filename, 'utf-8')
		const groupsObject = JSON.parse(data)
		for (const groupName in groupsObject) {
			groups.set(groupName, groupsObject[groupName])
		}
		console.log('Chat messages file has been downloaded to server.')
	} catch (error) {
		if (error.code === 'ENOENT') {
			console.log('Chat messages file not found. Starting with an empty chat history.')
		} else {
			console.error('Error loading chat messages:', error)
		}
	}
}

function loadUsernameFromFile(filename) {
	try {
		const data = fs.readFileSync(filename, 'utf-8')
		const usernames = JSON.parse(data)
		for (const username of usernames) {
			allUsers.add(username)
			// console.log(username)
		}
		console.log('Username list file has been downloaded to server.')
	} catch (error) {
		if (error.code === 'ENOENT') {
			console.log('Username list file not found. Starting with an empty chat history.')
		} else {
			console.error('Error loading Username list:', error)
		}
	}
}

const chatMessagesFile = 'chatMessages.json'
const usernameFile = 'usernameList.json'

loadChatMessagesFromFile(chatMessagesFile)
loadUsernameFromFile(usernameFile)

process.on('SIGINT', () => {
	console.log('\nSaving chat messages to file...')
	saveChatMessagesToFile(chatMessagesFile)
	saveUsersToFile(usernameFile)
	process.exit()
})

process.on('SIGTERM', () => {
	console.log('\nSaving chat messages to file...')
	saveChatMessagesToFile(chatMessagesFile)
	saveUsersToFile(usernameFile)
	process.exit()
})

function chat(io: Server) {
	io.use(authHandler)
	io.on('connection', (socket) => {
		const myUser = users.get(socket) ?? defaultUser
		console.log(`User "${myUser}" connected`)

		function sendOtherUser(username) {
			socket.emit('otherUser', username)
		}

		socket.on('getAllUser', () => {
			allUsers.forEach((username) => {
				if (username !== myUser) {
					sendOtherUser(username)
				}
			})
		})

		function sendNewGroup(groupName: string, group: Group) {
			socket.emit('newGroup', { name: groupName, ...group })
		}
		socket.on('joinGroup', (groupName) => {
			if (!groups.has(groupName)) {
				groups.set(groupName, { users: [], messages: [] })
				console.log(`Group "${groupName}" created`)
				const group = groups.get(groupName)!
				if (!group.users.includes(myUser)) {
					group.users.push(myUser)
					socket.join(groupName)
					socket.emit('joinedGroup', groups.get(groupName).messages)
					console.log(`${myUser} joined group "${groupName}"`)
				}
				sendNewGroup(groupName, group)
			} else {
				const group = groups.get(groupName)!
				if (!group.users.includes(myUser)) {
					group.users.push(myUser)
					socket.join(groupName)
					socket.emit('joinedGroup', groups.get(groupName).messages)
					console.log(`${myUser} joined group "${groupName}"`)
				}
			}
		})

		socket.on('getAllGroups', () => {
			groups.forEach((group, groupName) => sendNewGroup(groupName, group))
		})

		socket.on('leaveGroup', (groupName) => {
			if (groups.has(groupName)) {
				const group = groups.get(groupName)!
				group.users = group.users.filter((user) => user !== myUser)
				socket.leave(groupName)
				console.log(`${myUser} left group "${groupName}"`)
			}
		})

		function sendGroupMessage(groupName: string, message: Message) {
			io.to(groupName).emit('newGroupMessage', message)
		}
		socket.on('groupMessage', ({ groupName, value }) => {
			if (groups.has(groupName)) {
				const group = groups.get(groupName)!
				const newMessage = {
					id: uuidv4(),
					user: myUser,
					value: value,
					time: Date.now(),
				}
				group.messages.push(newMessage)
				sendGroupMessage(groupName, newMessage)
			}
		})

		socket.on('getGroupMessages', (groupName) => {
			if (groups.has(groupName)) {
				groups.get(groupName)!.messages.forEach((message) => sendGroupMessage(groupName, message))
			}
		})

		socket.on('disconnect', () => {
			// activeUsernames.delete(myUser)
			users.delete(socket)
			console.log(`User "${myUser}" disconnected`)
		})
	})
}

export default chat
