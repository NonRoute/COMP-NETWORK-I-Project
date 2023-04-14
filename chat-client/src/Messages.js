import React, { useEffect, useState } from 'react'

function Messages({ socket }) {
	const [messages, setMessages] = useState({})
	const timeOptions = {
		timeZone: 'Asia/Bangkok',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		hour12: true,
	}
	useEffect(() => {
		const messageListener = (message) => {
			setMessages((prevMessages) => {
				const newMessages = { ...prevMessages }
				newMessages[message.id] = message
				return newMessages
			})
		}

		const deleteMessageListener = (messageID) => {
			setMessages((prevMessages) => {
				const newMessages = { ...prevMessages }
				delete newMessages[messageID]
				return newMessages
			})
		}

		socket.on('message', messageListener)
		socket.on('deleteMessage', deleteMessageListener)
		socket.emit('getMessages')

		return () => {
			socket.off('message', messageListener)
			socket.off('deleteMessage', deleteMessageListener)
		}
	}, [socket])

	return (
		<div className="max-w-xl w-full">
			{[...Object.values(messages)]
				.sort((a, b) => a.time - b.time)
				.map((message) => (
					<div
						key={message.id}
						className="flex flex-row p-2 border-b border-gray-300"
						title={`Sent at ${new Date(message.time).toLocaleTimeString()}`}
					>
						<li class="list-none">
							<span class="flex items-center">
								<button class="text-blue-600 hover:underline focus:outline-none">
									<b>{message.user.name}</b>
								</button>
								<i class="ml-2 text-gray-600 opacity-80">
									{new Date(message.time).toLocaleTimeString('en-US', timeOptions)}
								</i>
							</span>
							<div class="clear-both pt-1 mt-0.5 pb-3 block">{message.value}</div>
						</li>
					</div>
				))}
		</div>
	)
}

export default Messages
