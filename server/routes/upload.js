const fs = require('fs');
const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const supabase = require('../utils/supabase');

const router = express.Router();

// ── Multer config: store files in memory (no disk writes) ──
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
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

        // Build a unique file path
        const timestamp  = Date.now();
        const safeName   = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath   = folder
            ? `${folder}/${timestamp}_${safeName}`
            : `${timestamp}_${safeName}`;

        let uploadedUrl = '';
        let uploadedPath = filePath;

        // Try Supabase Storage first if configured
        try {
            if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_URL.includes('your-project')) {
                const { data, error } = await supabase.storage
                    .from(bucket)
                    .upload(filePath, req.file.buffer, {
                        contentType: req.file.mimetype,
                        upsert:      false,
                    });

                if (!error && data) {
                    const { data: urlData } = supabase.storage
                        .from(bucket)
                        .getPublicUrl(data.path);
                    if (urlData && urlData.publicUrl) {
                        uploadedUrl = urlData.publicUrl;
                        uploadedPath = data.path;
                    }
                }
            }
        } catch (supabaseErr) {
            console.warn('[Upload] Supabase storage unavailable, saving locally:', supabaseErr.message);
        }

        // If Supabase upload didn't succeed, store locally or return data URI
        if (!uploadedUrl) {
            if (process.env.VERCEL) {
                // In serverless without cloud storage, return Base64 data URI
                uploadedUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
                uploadedPath = safeName;
            } else {
                try {
                    const uploadsDir = path.resolve(__dirname, '../uploads');
                    if (!fs.existsSync(uploadsDir)) {
                        fs.mkdirSync(uploadsDir, { recursive: true });
                    }
                    const localFileName = `${timestamp}_${safeName}`;
                    const localFilePath = path.join(uploadsDir, localFileName);
                    fs.writeFileSync(localFilePath, req.file.buffer);

                    // Mirror to client assets for dev server / build
                    const clientUploadsDir = path.resolve(__dirname, '../client/src/assets/uploads');
                    if (fs.existsSync(clientUploadsDir)) {
                        try {
                            fs.writeFileSync(path.join(clientUploadsDir, localFileName), req.file.buffer);
                        } catch (e) {}
                    }

                    uploadedUrl = `${req.protocol}://${req.get('host')}/uploads/${localFileName}`;
                    uploadedPath = localFileName;
                } catch (fsErr) {
                    console.warn('[Upload] Local disk write failed, fallback to Data URL:', fsErr.message);
                    uploadedUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
                    uploadedPath = safeName;
                }
            }
        }

        res.json({
            url:    uploadedUrl,
            path:   uploadedPath,
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

        // Try deleting local file if exists
        const localFilePath = path.resolve(__dirname, '../uploads', path.basename(filePath));
        if (fs.existsSync(localFilePath)) {
            try { fs.unlinkSync(localFilePath); } catch (e) {}
        }

        // Try deleting from Supabase
        try {
            if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_URL.includes('your-project')) {
                await supabase.storage.from(bucket).remove([filePath]);
            }
        } catch (supabaseErr) {
            console.warn('[Upload Delete] Supabase remove skipped:', supabaseErr.message);
        }

        res.json({ message: 'File deleted successfully.' });
    } catch (err) {
        console.error('[Upload Delete] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
