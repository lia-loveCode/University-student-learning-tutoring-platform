import { mockRequest } from '../../../shared/api/request.js'
import { courses } from '../model/coursesMock.js'

export function listCourses() {
  return mockRequest(() => courses)
}

export function getCourseById(id) {
  return mockRequest(() => courses.find((c) => c.id === id) ?? null)
}

