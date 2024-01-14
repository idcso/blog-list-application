const mongoose = require('mongoose')
const supertest = require('supertest')
const app= require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

const initialBlogs = [
	{
		title: "Hello title",
		author: "idcso",
		url: "random url",
		likes: 888888
	},
	{
		title: "Refactor step2",
		author: "idcso",
		url: "random url",
		likes: 55555,
	}
]

beforeEach(async () => {
	await Blog.deleteMany({})

	for (let blog of initialBlogs) {
		let blogObject = new Blog(blog)
		await blogObject.save()
	}
})

test('correct amount of blogs returned as json', async () => {
	await api
		.get('/api/blogs')
		.expect(200)
		.expect('Content-type', /application\/json/)

	const response = await api.get('/api/blogs')
	expect(response.body).toHaveLength(initialBlogs.length)
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
		.send(newBlog)
		.expect(201)
		.expect('Content-type', /application\/json/)

	const blogsAtEnd = (await Blog.find({})).map(blog => blog.toJSON())
	expect(blogsAtEnd).toHaveLength(initialBlogs.length + 1)
	expect(blogsAtEnd[blogsAtEnd.length - 1]).toEqual({
		...newBlog,
		id: blogsAtEnd[blogsAtEnd.length - 1].id
	})
})

test('if the likes property is missing from the request, it will be 0', async () => {
	const newBlog = {
		title: "Jest test",
		author: "idcso",
		url: "random url"
	}

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)
		.expect('Content-type', /application\/json/)

	const blogsAtEnd = (await Blog.find({})).map(blog => blog.toJSON())
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
		.send(newBlogWithoutTitle)
		.expect(400)

	await api
		.post('/api/blogs')
		.send(newBlogWithoutUrl)
		.expect(400)
})

test('blog can be deleted', async () => {
	const blogsAtStart = (await Blog.find({})).map(blog => blog.toJSON())
	const blogToDelete = blogsAtStart[0]

	await api
		.delete(`/api/blogs/${blogToDelete.id}`)
		.expect(204)

	const blogsAtEnd = (await Blog.find({})).map(blog => blog.toJSON())

	expect(blogsAtEnd).toHaveLength(initialBlogs.length - 1)
})

test('blog can be updated', async () => {
	const updatedBlog = {
		title: "Hello title 2",
		author: "idcso",
		url: "random url 2",
		likes: 12345678
	}

	const blogsAtStart = (await Blog.find({})).map(blog => blog.toJSON())
	const blogToUpdate = blogsAtStart[0]

	await api
		.put(`/api/blogs/${blogToUpdate.id}`)
		.send(updatedBlog)
		.expect(200)
		.expect('Content-type', /application\/json/)

	const blogsAtEnd = (await Blog.find({})).map(blog => blog.toJSON())

	expect(blogsAtEnd[0]).toEqual({
		...updatedBlog,
		id: blogToUpdate.id
	})
})

afterAll(async () => {
	await mongoose.connection.close()
})