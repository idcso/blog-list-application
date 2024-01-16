const mongoose = require('mongoose')
const supertest = require('supertest')
const app= require('../app')
const api = supertest(app)
const User = require('../models/user')
const helper = require('./test_helper')

const initialUsers = [
	{
		username: "test1",
		name: "name1"
	},
	{
		username: "test2",
		name: "name2"
	}
]

beforeEach(async () => {
	await User.deleteMany({})

	for (let user of initialUsers) {
		let newUser = new User(user)
		await newUser.save()
	}
})

describe('new user is not created and suitable status code/error message is returned', () => {
	test('when username or password are missing', async () => {
		const invalidUsers = [
			{
				username: "test1",
				name: "name1"
			},
			{
				password: "password",
				name: "name2"
			}
		]
		const usersAtStart = await helper.usersInDb()
	
		const resultNoPassword = await api
			.post('/api/users')
			.send(invalidUsers[0])
			.expect(400)

		expect(resultNoPassword.body.error).toContain('required')

		const resultNoUserName = await api
			.post('/api/users')
			.send(invalidUsers[1])
			.expect(400)

		expect(resultNoUserName.body.error).toContain('is required')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toEqual(usersAtStart)
	})

	test('when username or password length is less than 3', async () => {
		const invalidUsers = [
			{
				username: "t",
				password: "password1",
				name: "name1"
			},
			{
				username: "test2",
				password: "p",
				name: "name2"
			}
		]
		const usersAtStart = await helper.usersInDb()
	
		const resultBadUserName = await api
			.post('/api/users')
			.send(invalidUsers[0])
			.expect(400)

		expect(resultBadUserName.body.error).toContain('minimum allowed length')

		const resultBadPassword = await api
			.post('/api/users')
			.send(invalidUsers[1])
			.expect(400)

		expect(resultBadPassword.body.error).toContain('minimum allowed length (3)')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toEqual(usersAtStart)
	})

	test('when username is not unique', async () => {
		const invalidUsers = {
			username: initialUsers[0].username,
			password: "password1",
			name: "name1"
		}

		const usersAtStart = await helper.usersInDb()
	
		const result = await api
			.post('/api/users')
			.send(invalidUsers)
			.expect(400)

		expect(result.body.error).toContain('expected `username` to be unique')

		const usersAtEnd = await helper.usersInDb()
		expect(usersAtEnd).toEqual(usersAtStart)
	})
})

afterAll(async () => {
	await mongoose.connection.close()
})