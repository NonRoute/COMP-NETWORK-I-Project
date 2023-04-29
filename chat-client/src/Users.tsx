// Users.tsx
import React from 'react'

function Users({ onClickUser,  otherUsers }: { onClickUser: (groupName: string) => void; otherUsers: [string, string][] }) {
	return (
		<div className="max-w-xl w-full">
			<h3 className="font-bold mb-2">Other Users:</h3>
			{otherUsers.map(([userId, nickname]) => {
				return (
					<button
						className="mb-1 text-left w-full text-blue-600 hover:text-blue-800"
						onClick={() => onClickUser(userId)}
						key={userId}
					>
						{nickname}
					</button>
				)
			})}
		</div>
	)
}

export default Users