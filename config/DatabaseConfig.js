const {Pool} = require('pg')

const pool = new Pool({

    
    host: 'HOST_IP',
    user:'HOST_NAME',
    database:'postgres',
    password:'PASSWORD',
    port: 5432 
  })

 connection =  pool.connect((err, client, release)=> {

      if(err) {

        return console.error("Failed to Connect to database", err.stack)
      }
      console.log(`Connected to database: ${pool.options.host}`)
 });

 
  
  module.exports = pool;
