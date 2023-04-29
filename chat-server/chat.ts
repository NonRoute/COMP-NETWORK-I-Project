require('dotenv').config()
import { User } from '@okta/okta-sdk-nodejs'
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

const users = new Map<any, [string, string]>() // { socket : [userId , nickname ] }
const groups = new Map<string, Group>()
const allUsers = new Map<string, string>() // {userId : nickname}

const defaultUser = ['Anonymous', 'Anonymous']

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
			const userId = user.id
			if (!allUsers.has(userId)) {
				const nickname = [user.profile.firstName, user.profile.lastName].filter(Boolean).join(' ')
				allUsers.set(userId, nickname)
			}
			users.set(socket, [userId, allUsers.get(userId)])
			// console.log(userId, allUsers.get(userId))
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
	const usernamesObject = Object.fromEntries(allUsers)
	const data = JSON.stringify(usernamesObject, null, 1)
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
		const usersObject = JSON.parse(data)
		for (const username in usersObject) {
			allUsers.set(username, usersObject[username])
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
		const [myUserId, nickname] = users.get(socket) ?? defaultUser
		console.log(`User ${myUserId} ${nickname} connected`)

		// ------------------------ HANDLE USERNAMES ----------------------
		socket.on('getMyId', () => {
			socket.emit('getMyId', myUserId)
		})

		function sendOtherUser(userId, nickname) {
			socket.emit('otherUser', [userId, nickname])
		}

		socket.on('getAllUser', () => {
			allUsers.forEach((nickname, userId) => {
				sendOtherUser(userId, nickname)
			})
		})

		// ------------------------ HANDLE NICKNAME ----------------------
		socket.on('setNickname', (newNickname) => {
			users.set(socket, [myUserId, newNickname])
			allUsers.set(myUserId, newNickname)
		})

		// ------------------------ HANDLE GROUPCHAT ----------------------
		function sendNewGroup(groupName: string, group: Group) {
			socket.emit('newGroup', { name: groupName, ...group })
		}

		socket.on('getAllGroups', () => {
			groups.forEach((group, groupName) => sendNewGroup(groupName, group))
		})

		function createGroup(groupName: string) {
			if (!groups.has(groupName)) {
				groups.set(groupName, { usersId: [], messages: [] })
				const group = groups.get(groupName)!
				sendNewGroup(groupName, group)
				console.log(`Group "${groupName}" created`)
			}
		}
		socket.on('createGroup', createGroup)

		function joinGroup(groupName: string) {
			const group = groups.get(groupName)!
			if (!group.usersId.includes(myUserId)) {
				group.usersId.push(myUserId)
				socket.join(groupName)
				console.log(`${myUserId} joined group "${groupName}"`)
			}
		}
		socket.on('joinGroup', joinGroup)

		socket.on('leaveGroup', (groupName) => {
			if (groups.has(groupName)) {
				const group = groups.get(groupName)!
				group.usersId = group.usersId.filter((user) => user !== myUserId)
				socket.leave(groupName)
				console.log(`${myUserId} left group "${groupName}"`)
			}
		})

		// ------------------------ HANDLE MESSAGE ----------------------
		socket.on('groupMessage', ({ groupName, value }) => {
			if (groups.has(groupName)) {
				const group = groups.get(groupName)!
				const newMessage: Message = {
					id: uuidv4(),
					userId: myUserId,
					value: value,
					time: Date.now(),
				}
				group.messages.push(newMessage)
				io.to(groupName).emit('newGroupMessage', newMessage)
				console.log(`Sent "${value} to ${groupName}`)
			}
		})

		socket.on('getGroupMessages', (groupName) => {
			if (groups.has(groupName)) {
				const group = groups.get(groupName)!
				group.messages.forEach((message) => socket.emit('newGroupMessage', message))
				console.log(`Sent ${group.messages.length} messages from "${groupName} to ${myUserId}`)
			}
		})

		socket.on('deleteMessage', ({ groupName, messageId }) => {
			groups.get(groupName).messages = groups
				.get(groupName)
				.messages.filter((message) => message.id === messageId)

			io.to(groupName).emit('deleteMessage', { messageId })
		})

		// Also create if not exist
		socket.on('getDMGroupName', (otherUserId: string) => {
			let groupName: string
			if (groups.has(`${myUserId}-${otherUserId}`)) {
				groupName = `${myUserId}-${otherUserId}`
			} else if (groups.has(`${otherUserId}-${myUserId}`)) {
				groupName = `${otherUserId}-${myUserId}`
			} else {
				groupName = `${myUserId}-${otherUserId}`
				createGroup(groupName)
			}
			socket.emit('DMGroupName', groupName)
		})

		socket.on('disconnect', () => {
			// activeUsernames.delete(myUser)
			users.delete(socket)
			console.log(`User "${myUserId}" disconnected`)
		})
	})
}

export default chat
