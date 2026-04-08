import { mockRequest } from '../../../shared/api/request.js'
import {
  homeCourses,
  homeHotQuestions,
  homeMentors,
  homeStats,
} from '../model/homeMock.js'

export function getHomeStats() {
  return mockRequest(() => homeStats)
}

export function getHomeMentors() {
  return mockRequest(() => homeMentors)
}

export function getHomeCourses() {
  return mockRequest(() => homeCourses)
}

export function getHomeHotQuestions() {
  return mockRequest(() => homeHotQuestions)
}

