const { MongoClient } = require("mongodb");

const uri = "mongodb://127.0.0.1:27017"; // Adresse locale du serveur MongoDB
const client = new MongoClient(uri);

async function connectToDB() {
    try {
        await client.connect();
        console.log("Connecté à MongoDB !");
        const db = client.db("jeuDesLikes"); // Nom de la base
        return db;
    } catch (error) {
        console.error("Erreur de connexion :", error);
        process.exit(1);
    }
}

module.exports = connectToDB;
