"use strict";
const { Client } = require('pg');  // Import PostgreSQL client
const express = require('express');  // Import Express for handling HTTP requests
const app = express();
app.use(express.json());

// Set up the port for your server (port 8000 here)
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// PostgreSQL connection configuration
const clientConfig = {
  user: 'postgres',  // DB username
  host: 'my-pace-postgresql.cxeq4co262e5.us-east-2.rds.amazonaws.com',  
  database: 'postgres',  // database name
  password: 'mypacepostgresql',  
  port: 5432,  
  ssl: {
    rejectUnauthorized: false,  
  }
};

// Route to get Pokemon card details by ID
app.get('/pokemon', async function (req, res) {
  const cardId = req.query['id'];  
  const client = new Client(clientConfig); 
  try {
    await client.connect();

    const result = await client.query(
      "SELECT name, hp, set_name, image_url, caption FROM pokemon_cards WHERE id=$1",
      [cardId]
    );

    if (result.rowCount < 1) {
      res.status(404).send("No Pokemon card found with the provided ID");
    } else {
      res.set("Content-Type", "application/json");
      res.send(result.rows[0]);  // Send the result as a JSON response
    }
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).send("Internal Server Error");
  } finally {
    await client.end();
  }
});

// 2. Endpoint to POST data to the database (Insert new Pokémon card)
app.post('/pokemon', async (req, res) => {
    const { id, name, hp, set_name, image_url, caption } = req.body;
    const client = new Client(clientConfig);
  
    try {
      await client.connect();
  
      const result = await client.query(
        "INSERT INTO pokemon_cards (id, name, hp, set_name, image_url, caption) VALUES ($1, $2, $3, $4, $5, $6)",
        [id, name, hp, set_name, image_url, caption]
      );
  
      res.status(201).send("New Pokémon card added successfully");
    } catch (err) {
      console.error("Error inserting data", err);
      res.status(500).send("Internal Server Error");
    } finally {
      await client.end();  
    }
});
  
// 3. Endpoint to PUT data (Update Pokémon card)
app.put('/pokemon', async function (req, res) {
    const { name, hp, set_name, image_url, caption } = req.body;  
    const cardId = req.query.id;  
    const client = new Client(clientConfig);
  
    if (!cardId || !name || !hp || !set_name || !image_url || !caption) {
      return res.status(400).send("Missing required fields.");
    }
  
    try {
        await client.connect();
  
        const result = await client.query(
            "UPDATE pokemon_cards SET name=$1, hp=$2, set_name=$3, image_url=$4, caption=$5 WHERE id=$6",
            [name, hp, set_name, image_url, caption, cardId]    
        );
  
        if (result.rowCount < 1) {
            res.status(404).send("Pokemon card with the provided ID not found.");
        } else {
            res.status(200).send("Pokemon card updated successfully.");
        }
    } catch (err) {
        console.error("Error executing query", err);
        res.status(500).send("Internal Server Error");
    } finally {
        await client.end();
    }
});

// 4. Endpoint to DELETE data (Delete Pokémon card)
app.delete('/pokemon', async (req, res) => {
    const cardId = req.query.id;
    const client = new Client(clientConfig);
  
    try {
      await client.connect();
  
      const result = await client.query(
        "DELETE FROM pokemon_cards WHERE id=$1",
        [cardId]
      );
  
      if (result.rowCount === 0) {
        res.status(404).send("No Pokémon card found with the provided ID");
      } else {
        res.send("Pokémon card deleted successfully");
      }
    } catch (err) {
      console.error("Error deleting data", err);
      res.status(500).send("Internal Server Error");
    } finally {
      await client.end(); 
    }
});