import express from 'express';
import cors from 'cors';
import { execFile } from 'child_process';
import path from 'path';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const ENGINE_PATH = path.join(__dirname, 'engine.exe');

app.post('/route/shortest', (req, res) => {
    const { source, destination } = req.body;
    
    if (!source || !destination) {
        return res.status(400).json({ error: 'Source and destination required' });
    }

    execFile(ENGINE_PATH, ['shortest_path', source, destination], { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
            console.error(stderr);
            return res.status(500).json({ error: 'Engine error' });
        }
        try {
            const data = JSON.parse(stdout);
            res.json(data);
        } catch (e) {
            res.status(500).json({ error: 'Failed to parse engine output' });
        }
    });
});

app.get('/route/mst', (req, res) => {
    execFile(ENGINE_PATH, ['mst'], { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
            console.error(stderr);
            return res.status(500).json({ error: 'Engine error' });
        }
        try {
            const data = JSON.parse(stdout);
            res.json(data);
        } catch (e) {
            res.status(500).json({ error: 'Failed to parse engine output' });
        }
    });
});

app.get('/cities', (req, res) => {
    // Hardcoded for now, ideally fetched from DB
    res.json([
        { id: 1, name: 'Delhi', lat: 28.7041, lng: 77.1025 },
        { id: 2, name: 'Baghpat', lat: 28.9428, lng: 77.2274 },
        { id: 3, name: 'Shamli', lat: 29.4478, lng: 77.3061 },
        { id: 4, name: 'Saharanpur', lat: 29.9640, lng: 77.5460 },
        { id: 5, name: 'Dehradun', lat: 30.3165, lng: 78.0322 }
    ]);
});

app.get('/roads', (req, res) => {
    res.json([
        { source: 'Delhi', dest: 'Baghpat', distance: 47 },
        { source: 'Baghpat', dest: 'Shamli', distance: 30 },
        { source: 'Shamli', dest: 'Saharanpur', distance: 45 },
        { source: 'Saharanpur', dest: 'Dehradun', distance: 70 },
        { source: 'Delhi', dest: 'Saharanpur', distance: 170 }
    ]);
});

app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});
