import { mockRequest } from '../../../shared/api/request.js'
import { profileStats, userProfile } from '../model/profileMock.js'

export function getMyProfile() {
  return mockRequest(() => userProfile)
}

export function getMyProfileStats() {
  return mockRequest(() => profileStats)
}

