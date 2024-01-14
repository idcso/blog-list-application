const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  let blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  let blog = await Blog.findById(request.params.id)
  response.json(blog)
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    body,
    { new: true }
  )
  response.json(updatedBlog)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  body.likes = body.likes === undefined ? 0 : body.likes

  if (!body.title || !body.url) {
    response.status(400).end()
    return
  }

  const blog = new Blog(body)
  const savedBlog = await blog.save()

  response.status(201).json(savedBlog)
})

module.exports = blogsRouter