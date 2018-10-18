const restful = require('node-restful')
const mongoose = restful.mongoose

const formSchema = new mongoose.Schema({
  typeForm: { type: String, required: true },
  codForm: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, min: 6, max: 12, required: true },
  lastUpdate: { type: Date, required: true }
})

module.exports = restful.model('Forms', formSchema)
