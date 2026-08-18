import handler from '../api/planner.js'

function createRes() {
  const res = {
    statusCode: 200,
    headers: {},
    status(code) {
      this.statusCode = code
      return this
    },
    setHeader(key, value) {
      this.headers[key] = value
    },
    json(body) {
      this.body = body
      return this
    },
    end() {
      return this
    },
  }
  return res
}

const req = {
  method: 'POST',
  headers: { origin: 'http://localhost:5173' },
  body: {
    jobTitle: '产品经理',
    jobDescription: '负责用户研究、需求分析、产品设计和数据分析。',
    resume: '参与校园失物招领管理系统项目，负责需求分析和产品设计。',
    difficulty: 'comprehensive',
  },
}

const res = createRes()
await handler(req, res)

if (res.statusCode === 200 && res.body?.success) {
  console.log('handler ok:', res.body.data.firstQuestion?.question?.slice(0, 60))
  process.exit(0)
}

console.error('handler failed:', res.statusCode, res.body)
process.exit(1)
