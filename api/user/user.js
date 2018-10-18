const restful = require('node-restful')
const mongoose = restful.mongoose

const userEmployeeSchema = new mongoose.Schema({
  nameUser: { type: String, required: true },
  employee: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, min: 6, max: 12, required: true },
  departmentName: { type: String, required: true },
  codDept: { type: Number, min: 0, required: true },
  employeeType: { type: String, required: true },
})

module.exports = restful.model('User', userEmployeeSchema)
