import React, { useEffect, useState } from 'react'
import { Message } from './types'
import { DateTimeFormatOptions } from 'intl'

function Messages({ socket, groupName, users }: { socket: any; groupName: string; users: [string, string][] }) {
	const [messages, setMessages] = useState<Message[]>([])
	const timeOptions: DateTimeFormatOptions = {
		timeZone: 'Asia/Bangkok',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		hour12: true,
	}

	function getNickname(userId: string) {
		try {
			return users.find((user) => user[0] === userId)[1]
		} catch {
			return 'Anonymous'
		}
	}

	function handleDeleteMessage(messageId) {
		socket.emit('deleteMessage', { groupName, messageId })
	}

	useEffect(() => {
		socket.on('newGroupMessage', (message: Message) => {
			console.log(message)
			setMessages((prevMessages) => {
				const newMessages = [...prevMessages, message]
				return newMessages
			})
		})

		socket.on('deleteMessage', (messageId) => {
			console.log(messageId)
			console.log(messages)
			setMessages((prevMessages) => {
				return prevMessages.filter((message) => message.id !== messageId)
			})
		})

		return () => {
			socket.off('newGroupMessage')
		}
	}, [socket])

	useEffect(() => {
		setMessages([])
		socket.emit('getGroupMessages', groupName)
		socket.emit('joinGroup', groupName)

		return () => {
			socket.emit('leaveGroup', groupName)
		}
	}, [groupName])

	return (
		<div className="max-w-xl w-full">
			{messages
				.sort((a, b) => a.time - b.time)
				.map((message) => (
					<div
						key={message.id}
						className="flex flex-row p-2 border-b border-gray-300"
						title={`Sent at ${new Date(message.time).toLocaleTimeString()}`}
					>
						<li className="list-none">
							<span className="flex items-center">
								<button className="text-blue-600 hover:underline focus:outline-none">
									<b>{getNickname(message.userId)}</b>
								</button>
								<i className="ml-2 text-gray-600 opacity-80">
									{new Date(message.time).toLocaleTimeString('en-US', timeOptions)}
								</i>
								<button
									className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
									onClick={() => handleDeleteMessage(message.id)}
								>
									Delete
								</button>
							</span>
							<div className="clear-both pt-1 mt-0.5 pb-3 block">{message.value}</div>
						</li>
					</div>
				))}
		</div>
	)
}

export default Messages
