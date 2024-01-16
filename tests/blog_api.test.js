const mongoose = require('mongoose')
const supertest = require('supertest')
const app= require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const jwt = require('jsonwebtoken')

beforeEach(async () => {
	await Blog.deleteMany({})
	await User.deleteMany({})

	for (let blog of helper.initialBlogs) {
		let blogObject = new Blog(blog)
		await blogObject.save()
	}

	const user = new User(helper.initialUser)
	await user.save()
	const userForToken = {
		username: user.username,
		id: user._id
	}
	helper.userId = user._id
	helper.token = jwt.sign(userForToken, process.env.SECRET)
})

test('correct amount of blogs returned as json', async () => {
	await api
		.get('/api/blogs')
		.expect(200)
		.expect('Content-type', /application\/json/)

	const response = await api.get('/api/blogs')
	expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('unique identifier property of the blog posts is named id', async () => {
	const response = await api.get('/api/blogs')
	
	response.body.forEach(blog => expect(blog.id).toBeDefined())
})

test('a new blog can be created', async () => {
	const newBlog = {
		title: "Jest test",
		author: "idcso",
		url: "random url",
		likes: 3333333,
	}

	await api
		.post('/api/blogs')
		.set({Authorization: `Bearer ${helper.token}`})
		.send(newBlog)
		.expect(201)
		.expect('Content-type', /application\/json/)

	const blogsAtEnd = await helper.blogsInDb()
	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
	expect(blogsAtEnd[blogsAtEnd.length - 1]).toEqual({
		...newBlog,
		id: blogsAtEnd[blogsAtEnd.length - 1].id,
		user: helper.userId
	})
})

test('adding new blog fails with 401 status code if a token is not provided', async () => {
	const newBlog = {
		title: "Jest test",
		author: "idcso",
		url: "random url",
		likes: 3333333,
	}

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(401)
})

test('if the likes property is missing from the request, it will be 0', async () => {
	const newBlog = {
		title: "Jest test",
		author: "idcso",
		url: "random url"
	}

	await api
		.post('/api/blogs')
		.set({Authorization: `Bearer ${helper.token}`})
		.send(newBlog)
		.expect(201)
		.expect('Content-type', /application\/json/)

	const blogsAtEnd = await helper.blogsInDb()
	expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toBe(0)
})

test('if the title or url properties are missing - response: 400 Bad Request', async () => {
	const newBlogWithoutTitle = {
		author: "idcso",
		url: "random url",
		likes: 3333333
	}
	const newBlogWithoutUrl = {
		title: "Jest test",
		author: "idcso",
		likes: 3333333
	}

	await api
		.post('/api/blogs')
		.set({Authorization: `Bearer ${helper.token}`})
		.send(newBlogWithoutTitle)
		.expect(400)

	await api
		.post('/api/blogs')
		.set({Authorization: `Bearer ${helper.token}`})
		.send(newBlogWithoutUrl)
		.expect(400)
})

test('blog can be deleted', async () => {
	const newBlog = {
		title: "Jest test",
		author: "idcso",
		url: "random url",
		likes: 3333333,
	}

	await api
		.post('/api/blogs')
		.set({Authorization: `Bearer ${helper.token}`})
		.send(newBlog)
		.expect(201)
		.expect('Content-type', /application\/json/)

	const blogsAtStart = await helper.blogsInDb()
	const blogToDelete = blogsAtStart[blogsAtStart.length - 1]

	await api
		.delete(`/api/blogs/${blogToDelete.id}`)
		.set({Authorization: `Bearer ${helper.token}`})
		.expect(204)

	const blogsAtEnd = await helper.blogsInDb()

	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('blog can be updated', async () => {
	const updatedBlog = {
		title: "Hello title 2",
		author: "idcso",
		url: "random url 2",
		likes: 12345678
	}

	const blogsAtStart = await helper.blogsInDb()
	const blogToUpdate = blogsAtStart[0]

	await api
		.put(`/api/blogs/${blogToUpdate.id}`)
		.send(updatedBlog)
		.expect(200)
		.expect('Content-type', /application\/json/)

	const blogsAtEnd = await helper.blogsInDb()

	expect(blogsAtEnd[0]).toEqual({
		...updatedBlog,
		id: blogToUpdate.id
	})
})

afterAll(async () => {
	await mongoose.connection.close()
})