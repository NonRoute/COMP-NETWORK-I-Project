export type Group = {
	messages: Message[]
	users: string[]
}

export type Message = {
	id: string
	user: string
	value: string
	time: number
}
