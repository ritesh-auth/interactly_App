const {Pool} = require('pg')

const pool = new Pool({

    
    host: '34.44.247.77',
    user:'admin',
    database:'postgres',
    password:'admin@123',
    port: 5432 
  })

 connection =  pool.connect((err, client, release)=> {

      if(err) {

        return console.error("Failed to Connect to database", err.stack)
      }
      console.log(`Connected to database: ${pool.options.host}`)
 });

 
  
  module.exports = pool;