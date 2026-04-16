/** 客户端密码规则：至少 8 位，且同时包含字母与数字。 */
export const PASSWORD_MIN_LENGTH = 8

export function isPasswordStrongEnough(password) {
  if (typeof password !== 'string') return false
  if (password.length < PASSWORD_MIN_LENGTH) return false
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasDigit = /\d/.test(password)
  return hasLetter && hasDigit
}

export function passwordStrengthHint(password) {
  if (!password) return '至少 8 位，且同时包含字母与数字。'
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `还需至少 ${PASSWORD_MIN_LENGTH - password.length} 位（当前要求不少于 ${PASSWORD_MIN_LENGTH} 位）。`
  }
  if (!/[a-zA-Z]/.test(password)) return '请加入至少一个英文字母。'
  if (!/\d/.test(password)) return '请加入至少一个数字。'
  return '密码强度已满足要求。'
}
