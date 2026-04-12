import { getSupabase } from '../../../shared/lib/supabaseClient.js'

const PROFILE_ID = 'default'

export async function getMyProfile() {
  const sb = getSupabase()
  if (!sb) {
    return {
      id: 'local',
      name: '未连接数据库',
      major: '—',
      grade: '—',
      bio: '请在项目根目录 .env 中配置 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY，并执行 supabase/schema.sql。',
    }
  }
  const { data, error } = await sb.from('user_profile').select('*').eq('id', PROFILE_ID).maybeSingle()
  if (error) throw error
  if (!data) {
    return {
      id: PROFILE_ID,
      name: '同学',
      major: '',
      grade: '',
      bio: '在 Supabase 执行 schema.sql 后会自动插入 id=default 的资料行；也可在 Table Editor 中编辑。',
    }
  }
  return {
    id: data.id,
    name: data.display_name,
    major: data.major,
    grade: data.grade,
    bio: data.bio,
  }
}

export async function getMyProfileStats() {
  const sb = getSupabase()
  if (!sb) {
    return { myCourses: 0, myQuestions: 0, myAnswers: 0, completedPlans: 0 }
  }
  const { data, error } = await sb.from('user_profile').select('*').eq('id', PROFILE_ID).maybeSingle()
  if (error) throw error
  if (!data) {
    return { myCourses: 0, myQuestions: 0, myAnswers: 0, completedPlans: 0 }
  }
  return {
    myCourses: data.my_courses,
    myQuestions: data.my_questions,
    myAnswers: data.my_answers,
    completedPlans: data.completed_plans,
  }
}
