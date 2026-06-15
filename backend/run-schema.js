import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

try {
    console.log("⏳ Connecting to the cloud database and building tables...");
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true 
    });

   
    const sql = fs.readFileSync('./database/schema.sql', 'utf8');
    
    
    await connection.query(sql);
    console.log("✅ Success! All tables have been created in the cloud successfully! 🎉");
    await connection.end();
} catch (error) {
    console.error("❌ Error during schema execution:", error);
}