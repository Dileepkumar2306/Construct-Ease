const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const supabase = require('../utils/supabase');

const router = express.Router();

// ── Multer config: store files in memory (no disk writes) ──
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|pdf|mp4|mov|avi/;
        const ext  = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) {
            cb(null, true);
        } else {
            cb(new Error('Only images, PDFs, and videos are allowed.'));
        }
    }
});

// ── Allowed buckets (must match names created in Supabase dashboard) ──
const ALLOWED_BUCKETS = [
    'company-assets',
    'portfolio',
    'promotions',
    'profiles',
    'ai-uploads',
];

/**
 * POST /api/upload
 * Body: multipart/form-data
 *   - file:   the binary file
 *   - bucket: one of the ALLOWED_BUCKETS (default: 'portfolio')
 *   - folder: optional subfolder path (e.g. 'architect/2026')
 *
 * Returns: { url: "https://..." }
 */
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided.' });
        }

        const bucket = req.body.bucket || 'portfolio';
        const folder = req.body.folder || '';

        if (!ALLOWED_BUCKETS.includes(bucket)) {
            return res.status(400).json({ error: `Invalid bucket. Allowed: ${ALLOWED_BUCKETS.join(', ')}` });
        }

        // Build a unique file path
        const timestamp  = Date.now();
        const ext        = path.extname(req.file.originalname);
        const safeName   = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath   = folder
            ? `${folder}/${timestamp}_${safeName}`
            : `${timestamp}_${safeName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert:      false,
            });

        if (error) {
            console.error('[Upload] Supabase storage error:', error);
            return res.status(500).json({ error: error.message });
        }

        // Get the public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        res.json({
            url:    urlData.publicUrl,
            path:   data.path,
            bucket: bucket,
        });

    } catch (err) {
        console.error('[Upload] Unexpected error:', err);
        res.status(500).json({ error: err.message || 'Upload failed.' });
    }
});

/**
 * DELETE /api/upload
 * Body: { bucket, path }
 * Deletes a file from Supabase Storage
 */
router.delete('/', async (req, res) => {
    try {
        const { bucket, filePath } = req.body;

        if (!bucket || !filePath) {
            return res.status(400).json({ error: 'bucket and filePath are required.' });
        }
        if (!ALLOWED_BUCKETS.includes(bucket)) {
            return res.status(400).json({ error: 'Invalid bucket.' });
        }

        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({ message: 'File deleted successfully.' });
    } catch (err) {
        console.error('[Upload Delete] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
