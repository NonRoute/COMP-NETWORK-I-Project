import React, { useEffect, useState } from 'react'
// import './Messages.css'

function Messages({ socket }) {
	const [messages, setMessages] = useState({})

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
		<div className="max-w-md w-full">
			{[...Object.values(messages)]
				.sort((a, b) => a.time - b.time)
				.map((message) => (
					<div
						key={message.id}
						className="flex flex-row p-2 border-b border-gray-300"
						title={`Sent at ${new Date(message.time).toLocaleTimeString()}`}
					>
						<span className="min-w-[120px] text-xs text-gray-500">{message.user.name}:</span>
						<span className="flex-grow">{message.value}</span>
						<span className="text-xs text-gray-500">{new Date(message.time).toLocaleTimeString()}</span>
					</div>
				))}
		</div>
	)
}

export default Messages
