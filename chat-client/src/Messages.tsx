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
		return users.find((user) => user[0] === userId)[1]
	}

	useEffect(() => {
		socket.on('newGroupMessage', (message: Message) => {
			setMessages((prevMessages) => {
				const newMessages = [...prevMessages, message]
				return newMessages
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
							</span>
							<div className="clear-both pt-1 mt-0.5 pb-3 block">{message.value}</div>
						</li>
					</div>
				))}
		</div>
	)
}

export default Messages
