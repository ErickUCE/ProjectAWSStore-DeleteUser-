const fs = require('fs');
const path = require('path');
const { ApolloServer } = require('apollo-server');
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const resolvers = require('./graphql/resolvers');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(bodyParser.json());
app.use(userRoutes);

// ✅ Verificar que `schema.graphql` existe antes de cargarlo
const schemaPath = path.join(__dirname, 'graphql', 'schema.graphql');

if (!fs.existsSync(schemaPath)) {
    console.error('❌ ERROR: El archivo schema.graphql no existe en', schemaPath);
    process.exit(1);
}

const typeDefs = fs.readFileSync(schemaPath, 'utf-8');

console.log("📌 Cargando schema.graphql:", typeDefs.length > 0 ? "OK" : "VACÍO");

// ✅ Configurar Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers
});

sequelize.sync().then(() => {
    console.log('✅ Database synced successfully!');

    server.listen({ port: 4008 }).then(({ url }) => {
        console.log(`🚀 GraphQL server ready at ${url}`);
    });

    app.listen(5008, () => {
        console.log(`✅ REST server listening on port 5008`);
    });
}).catch(err => {
    console.error('❌ Error syncing database:', err);
});

