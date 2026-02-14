import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const UPLOADS_DIR = path.join(__dirname, '../../public/uploads'); // Dev/Local path
const DIST_DIR = path.join(__dirname, '../../dist');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve Uploads
app.use('/uploads', express.static(UPLOADS_DIR));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, { family: 4 })
    .then(() => console.log('Connected to MongoDB Atlas (pms database)'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const pgSchema = new mongoose.Schema({
    name: String,
    slug: String,
    description: String,
    address: String,
    contact: String,
    photos: [String]
});

const floorSchema = new mongoose.Schema({
    pgId: String,
    name: String,
    slug: String,
    photos: [String]
});

const roomSchema = new mongoose.Schema({
    floorId: String,
    pgId: String,
    name: String,
    sharingType: String,
    acType: { type: String, enum: ['ac', 'non_ac'] },
    capacity: Number,
    rent: Number,
    photos: [String]
});

const residentSchema = new mongoose.Schema({
    customId: String,
    name: String,
    email: String,
    phone: String,
    occupation: String,
    aadharNumber: String,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    joinedDate: String,
    status: { type: String, enum: ['daily', 'monthly', 'notice_period'] },
    roomId: String,
    floorId: String,
    pgId: String,
    profileImage: String,
    exitDate: String
});

const paymentSchema = new mongoose.Schema({
    residentId: String,
    period: String,
    type: { type: String, enum: ['rent', 'advance', 'deposit', 'other'] },
    status: { type: String, enum: ['paid', 'partially_paid', 'unpaid'] },
    amount: Number,
    date: String
});

const grievanceSchema = new mongoose.Schema({
    residentId: String,
    residentName: String,
    description: String,
    photos: [String],
    roomName: String,
    floorName: String,
    pgId: String,
    status: { type: String, enum: ['pending', 'on_hold', 'in_progress', 'closed'] },
    reportedAt: String
});

const separationRequestSchema = new mongoose.Schema({
    residentId: String,
    residentName: String,
    requestDate: String,
    exitDate: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'] },
    roomName: String,
    floorName: String,
    pgId: String,
    initiatedBy: { type: String, enum: ['resident', 'admin'] }
});

const imageSchema = new mongoose.Schema({
    data: Buffer,
    contentType: String,
});

// Models
const PG = mongoose.model('PG', pgSchema);
const Floor = mongoose.model('Floor', floorSchema);
const Room = mongoose.model('Room', roomSchema);
const Resident = mongoose.model('Resident', residentSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Grievance = mongoose.model('Grievance', grievanceSchema);
const SeparationRequest = mongoose.model('SeparationRequest', separationRequestSchema);
const Image = mongoose.model('Image', imageSchema);

// Multer setup — memory storage (files saved to MongoDB, not disk)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// API Routes
app.get('/api/db', async (req, res) => {
    try {
        const [pgs, floors, rooms, residents, payments, grievances, separationRequests] = await Promise.all([
            PG.find().lean(), Floor.find().lean(), Room.find().lean(), Resident.find().lean(),
            Payment.find().lean(), Grievance.find().lean(), SeparationRequest.find().lean()
        ]);
        res.json({ pgs, floors, rooms, residents, payments, grievances, separationRequests });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/db', async (req, res) => {
    // This endpoint was used for bulk sync, but with MongoDB we should use individual routes for better consistency.
    // However, for migration/initial sync, we can keep it simple or implement specific logic.
    try {
        const { pgs, floors, rooms, residents, payments, grievances, separationRequests } = req.body;

        // Simple reset and seed logic for initial migration (optional)
        if (req.query.migrate === 'true') {
            await Promise.all([
                PG.deleteMany({}), Floor.deleteMany({}), Room.deleteMany({}), Resident.deleteMany({}),
                Payment.deleteMany({}), Grievance.deleteMany({}), SeparationRequest.deleteMany({})
            ]);
            // Filter out existing string IDs for MongoDB to generate its own if preferred, 
            // or keep them if they are unique. MongoDB allows custom string _id.
            await Promise.all([
                PG.insertMany(pgs), Floor.insertMany(floors), Room.insertMany(rooms), Resident.insertMany(residents),
                Payment.insertMany(payments), Grievance.insertMany(grievances), SeparationRequest.insertMany(separationRequests)
            ]);
            return res.json({ success: true, message: 'Migration complete' });
        }

        res.json({ success: true, message: 'Use specific CRUD endpoints for updates instead of bulk POST' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generic CRUD endpoints Helper (simplified for now)
const registerCRUDRoutes = (model, baseRoute) => {
    app.post(`/api/${baseRoute}`, async (req, res) => {
        try {
            const doc = new model(req.body);
            await doc.save();
            res.json(doc.toObject());
        } catch (e) { res.status(500).json({ error: e.message }); }
    });

    app.put(`/api/${baseRoute}/:id`, async (req, res) => {
        try {
            const doc = await model.findByIdAndUpdate(req.params.id, req.body, { new: true, lean: true });
            res.json(doc);
        } catch (e) { res.status(500).json({ error: e.message }); }
    });

    app.delete(`/api/${baseRoute}/:id`, async (req, res) => {
        try {
            await model.findByIdAndDelete(req.params.id);
            res.json({ success: true });
        } catch (e) { res.status(500).json({ error: e.message }); }
    });
};

registerCRUDRoutes(PG, 'pgs');
registerCRUDRoutes(Floor, 'floors');
registerCRUDRoutes(Room, 'rooms');
registerCRUDRoutes(Resident, 'residents');
registerCRUDRoutes(Payment, 'payments');
registerCRUDRoutes(Grievance, 'grievances');
registerCRUDRoutes(SeparationRequest, 'separations');

// Serve images from MongoDB
app.get('/api/images/:id', async (req, res) => {
    try {
        const img = await Image.findById(req.params.id);
        if (!img) return res.status(404).json({ error: 'Image not found' });
        res.set('Content-Type', img.contentType);
        res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        res.send(img.data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Upload single image → save to MongoDB
app.post('/api/upload', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    try {
        const img = new Image({ data: req.file.buffer, contentType: req.file.mimetype });
        await img.save();
        res.json({ imageUrl: `/api/images/${img._id}` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Upload multiple images → save all to MongoDB
app.post('/api/upload-multiple', upload.array('images', 10), async (req, res) => {
    try {
        const docs = await Promise.all(
            req.files.map(file => new Image({ data: file.buffer, contentType: file.mimetype }).save())
        );
        res.json({ imageUrls: docs.map(d => `/api/images/${d._id}`) });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Serve Static Frontend (Production)
if (fs.existsSync(DIST_DIR)) {
    app.use(express.static(DIST_DIR));
    // SPA Fallback: Any request not handled by API or Static files returns index.html
    app.get('/{*splat}', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(DIST_DIR, 'index.html'));
        }
    });
}

app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));
