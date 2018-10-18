const mongoose = require('mongoose')

module.exports = mongoose.connect('mongodb://localhost:27017/db_gfbv_form', { useNewUrlParser: true })

mongoose.Error.messages.general.required = "O atributo '{PATH}' é obrigatório"
mongoose.Error.messages.Number.min = "O '{VALUE}' informado é menor que o limite mínimo de '{MIN}'."
mongoose.Error.messages.Number.max = "O '{VALUE}' informado é menor que o limite máximo de '{MAX}'."
mongoose.Error.messages.String.enum = "'{VALUE}' não é válido para o atributo '{PATH}'."

/*
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true });
const conn = mongoose.connection;
const Schema = mongoose.Schema;

const schema = new Schema({
  name: String
});

const Test = mongoose.model('test', schema);

const test = new Test({ name: 'one' });

async function run() {
  console.log(`Mongoose: ${mongoose.version}`);
  await conn.dropDatabase();
  await test.save();
  let found = await Test.findOne();
  console.log(found);
  return conn.close();
}

run();
*/
