import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import fs from 'fs';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);


app.engine('handlebars', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'view/layout'),
    partialsDir: path.join(__dirname, 'view/partial'),
    helpers: {
        eq: (a, b) => a === b
    }
}));
/*===============Segundo paso Seteamos=================== */
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'view'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Servidor express escuchando en HTTP://localhost:${PORT}`);
});