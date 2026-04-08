import { mockRequest } from '../../../shared/api/request.js'
import { progressByCategory, progressSummary } from '../model/progressMock.js'

export function getProgressSummary() {
  return mockRequest(() => progressSummary)
}

export function getProgressByCategory() {
  return mockRequest(() => progressByCategory)
}

