import React, { useEffect, useState } from 'react'
import { Message } from './types'
import { Socket } from 'socket.io-client'
import { DateTimeFormatOptions } from 'intl'

function Messages({ socket, groupName }: { socket: Socket; groupName: string }) {
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

	useEffect(() => {
		socket.on('newGroupMessage', (message: Message) => {
			setMessages((prevMessages) => {
				const newMessages = [...prevMessages, message]
				return newMessages
			})
		})

		socket.emit('getGroupMessages', groupName)

		return () => {
			socket.off('newGroupMessage')
		}
	}, [socket])

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
									<b>{message.user}</b>
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
