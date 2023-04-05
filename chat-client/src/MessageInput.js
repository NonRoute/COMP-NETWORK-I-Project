import React, { useState } from 'react'
// import './MessageInput.css'

const NewMessage = ({ socket }) => {
	const [value, setValue] = useState('')
	const submitForm = (e) => {
		e.preventDefault()
		socket.emit('message', value)
		setValue('')
	}

	return (
		<form class="max-w-md w-full mx-auto" onSubmit={submitForm}>
			<input
				class="w-full px-2 py-1"
				autoFocus
				value={value}
				placeholder="Type your message"
				onChange={(e) => {
					setValue(e.currentTarget.value)
				}}
			/>
		</form>
	)
}

export default NewMessage
