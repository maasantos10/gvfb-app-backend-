const restful = require('node-restful')
const mongoose = restful.mongoose

/*
const debtSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, min: 0, required: [true, 'Informe o valor do débito!']},
  status: { type: String, required: false, uppercase: true,
    enum: ['PAGO', 'PENDENTE', 'AGENDADO'] }
})
*/

const departmentSchema = new mongoose.Schema({
  codDept: { type: Number, min: 0, required: true },
  departmentName: { type: String, required: true }
})

const lineFormSchema = new mongoose.Schema({
  dayLineGrid: { type: Number, min: 1, max: 31, required: [true, 'Please, fill the date!']},
  monthLineGrid: { type: Number, min: 1, max: 12, required: [true, 'Please, fill the month!']},
  startTime: { type: Number, min: 0, max: 24, required: [true, 'Please fill the start time!']},
  finishTime: { type: Number, min: 0, max: 24, required: [true, 'Please fill the finish time!']},
  totalTime: { type: Number, min: 0, max: 24, required: true}, // it needs to calculate the total and less the lunchTime
  lunchTime: { type: Number, min: 0, max: 24, required: [true, 'Please fill the lunch time!']},
  reg: { type: Number, min: 0, required: false, "default": 0}, // I need to check this information with bela
  overtime: { type: Number, min: 0, max: 24, required: false, "default": 0}, // I need to check this information with bela
  bank: { type: Number, min: 0, required: false, "default": 0}, // I need to check this information with bela
  absence: { type: String, required: false, uppercase: true,
    enum: ['VACATION', 'SICK'] }
})

const timeCardSchema = new mongoose.Schema({
  typeForm: { type: Number, required: false},
  employeeName: { type: String, required: true},
  email: { type: String, required: true},
  dayFrom: { type: Number, min: 1, max: 31, required: true },
  monthFrom: { type: Number, min: 1, max: 12, required: true },
  dayTo: { type: Number, min: 1, max: 31, required: true },
  monthTo: { type: Number, min: 1, max: 12, required: true },
  totalHours: { type: Number, required: true },
  signatureEmployee: { type: String, required: false},
  status: { type: String, required: true, uppercase: true,
    enum: ['OPEN', 'REVIEW', 'APPROVAL', 'APPROVED'] },
  //department: [departmentSchema],
  codDept: { type: Number, min: 0, required: true },
  departmentName: { type: String, required: true },
  gridLineInformation: [lineFormSchema],
  emailSupervisor: { type: String, required: false},
  signatureSupervisor: { type: String, required: false}
})

// when a status changes, the system needs to send a message to indicate
// to employee what is the current status.

module.exports = restful.model('TimeCard', timeCardSchema)
