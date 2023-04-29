// Users.tsx
import React from 'react'

function Users({
	onClickUser,
	otherUsers,
}: {
	onClickUser: (groupName: string) => void
	otherUsers: [string, string][]
}) {
	return (
		<div className="max-w-xl w-full">
			<h3 className="font-bold mb-2">Other Users:</h3>
			<div className="flex gap-2 flex-wrap">
				{otherUsers.map(([userId, nickname]) => {
					return (
						<button
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
							onClick={() => onClickUser(userId)}
							key={userId}
						>
							{nickname}
						</button>
					)
				})}
			</div>
		</div>
	)
}

export default Users
