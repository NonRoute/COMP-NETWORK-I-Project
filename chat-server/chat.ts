require('dotenv').config()
import { Group, Message } from './types'
import { Server } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
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

			users.set(socket, [user.profile.firstName, user.profile.lastName].filter(Boolean).join(' '))
		} catch (error) {
			console.log(error)
		}
	}

	next()
}

function chat(io: Server) {
	io.use(authHandler)
	io.on('connection', (socket) => {
		const myUser = users.get(socket) ?? defaultUser
		console.log(`User "${myUser}" connected`)

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
			console.log(`User "${myUser}" disconnected`)
		})
	})
}

export default chat
