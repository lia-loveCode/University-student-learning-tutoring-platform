import { mockRequest } from '../../../shared/api/request.js'
import { initialQuestions } from '../model/qaMock.js'

let questions = [...initialQuestions]

export function listQuestions() {
  return mockRequest(() => questions)
}

export function createQuestion({ title, category, content, tags }) {
  return mockRequest(() => {
    const q = {
      id: `q_${Date.now()}`,
      title,
      category,
      author: '我',
      views: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      tags,
      content,
      answers: [],
    }
    questions = [q, ...questions]
    return q
  })
}

