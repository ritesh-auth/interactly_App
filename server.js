const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const database = require('./config/DatabaseConfig');
const { url, ApiKey, domain } = require('./config/apiConfig'); 

const port = 8080;
const app = express();

app.use(express.json());

app.post('/createContact', (req, res) => {
    const { first_name, last_name, email, mobile_number, data_store } = req.body;

   
    if (!first_name || !last_name || !email || !mobile_number) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (data_store === 'DATABASE') {
       
        const query = `INSERT INTO contacts (first_name, last_name, email, mobile_number) VALUES ($1, $2, $3, $4) RETURNING id`;

        database.query(query, [first_name, last_name, email, mobile_number], (err, result) => {
            if (err) {
                console.error("Error during insert:", err);
                return res.status(500).json({ error: err.message });
            }

            res.json({ message: 'Contact Created', contactId: result.rows[0].id });
        });

    } else if (data_store === 'CRM') {

        axios.post(url, {
            contact: {
                first_name,
                last_name,
                email,
                mobile_number
            }
        }, {
            headers: {
                Authorization: `Token token=${ApiKey}`
            }
        })
        .then(response => res.json(response.data))
        .catch(error => {
            console.error("Error with CRM API:", error);
            res.status(500).json({ error: error.message });
        });
    }
});

app.post('/getContact', (req, res) => {
    const { contact_id, data_store } = req.body;
  
    if (!contact_id || !data_store) {
      return res.status(400).json({ error: 'Please Enter the values as per the schema' });
    }
  
    if (data_store === 'DATABASE') {
      const query = 'SELECT * FROM contacts WHERE id = $1';

      database.query(query, [contact_id], (err, result) => {
        if (err) {
          console.error('Database query error:', err);
          return res.status(500).json({ error: 'Database error occurred' });
        }
        if (result.rows.length > 0) {

          return res.json(result.rows[0]);
        } else {
          return res.status(404).json({ message: 'No Contact Exists!' });
        }
      });

    } else if (data_store === 'CRM') {
         axios.get(`${url}/${contact_id}`, {
            headers: {
                Authorization: `Token token=${ApiKey}`
            }
      })
      .then(response => {
        return res.json(response.data);
      })
      .catch(error => {
        console.error('CRM API error:', error);
        return res.status(500).json({ error: 'CRM API error' });
      });
    } else {
      return res.status(400).json({ error: 'Invalid data_store. Must be either DATABASE or CRM' });
    }
  });
  
app.post('/updateContact', (req, res) => {
    const { contact_id, new_email, new_mobile_number, data_store } = req.body;

    if (data_store === 'DATABASE') {
        const query = 'UPDATE contacts SET email = $1, mobile_number = $2 WHERE id = $3';
        database.query(query, [new_email, new_mobile_number, contact_id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Successfully updated!' });
        });

    } else if (data_store === 'CRM') {
        axios.put(`${url}/${contact_id}`, {
            contact: {
                email: new_email,
                mobile_number: new_mobile_number
            }
        }, {
            headers: {
                Authorization: `Token token=${ApiKey}`
            }
        })
        .then(response => res.json(response.data))
        .catch(error => {
            res.status(500).json({ error: error.message });
        });
    }
});

app.post('/deleteContact', (req, res) => {
    const { contact_id, data_store } = req.body;

    if (data_store === 'DATABASE') {
        const query = 'DELETE FROM contacts WHERE id = $1';
        database.query(query, [contact_id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Contact Deleted!' });
        });

    } else if (data_store === 'CRM') {
        axios.delete(`${url}/${contact_id}`, {
            headers: {
                Authorization: `Token token=${ApiKey}`
            }
        })
        .then(() => res.json({ message: 'Contact Deleted!' }))
        .catch(error => {
            res.status(500).json({ error: error.message });
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
