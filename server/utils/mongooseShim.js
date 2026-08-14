const crypto = require('crypto');
const supabase = require('./supabase');

// Map model names to their respective table names in PostgreSQL
function getTableName(modelName) {
    const mappings = {
        'User': 'users',
        'Professional': 'professionals',
        'Template': 'templates',
        'Estimate': 'estimates',
        'Inquiry': 'inquiries',
        'BhkDetails': 'bhk_details',
        'Quote': 'quotes',
        'Promotion': 'promotions',
        'InteriorEstimate': 'interior_estimates',
        'Vendor': 'vendors',
        'Company': 'companies',
        'PortfolioItem': 'portfolio_items',
        'AIResult': 'ai_results'
    };
    return mappings[modelName] || modelName.toLowerCase() + 's';
}

// Custom document class that mimics mongoose document instance
class SupabaseDocument {
    constructor(tableName, data, modelClass) {
        this._tableName = tableName;
        this._modelClass = modelClass;
        
        // Copy all fields from data to this instance
        Object.assign(this, data);

        // Map _id and id interchangeably
        if (data.id && !data._id) {
            this._id = data.id;
        }

        // If it has no _id, generate a new UUID and mark as new
        if (!this._id) {
            this._id = crypto.randomUUID();
            this.isNew = true;
        } else {
            this.isNew = false;
        }
    }

    // Helper to format/serialize document to row
    toRow() {
        const row = { ...this };
        
        // Remove internal properties starting with _ except _id
        for (const key of Object.keys(row)) {
            if (key.startsWith('_') && key !== '_id') {
                delete row[key];
            }
        }
        delete row.isNew;
        return row;
    }

    async save() {
        const row = this.toRow();
        
        if (this.isNew) {
            const { data, error } = await supabase
                .from(this._tableName)
                .insert([row])
                .select('*');
            
            if (error) {
                console.error(`[Supabase Save Insert Error] Table ${this._tableName}:`, error);
                throw new Error(`Supabase Insert Failed: ${error.message}. Please check if the tables are created by running schema.sql in Supabase SQL editor.`);
            }
            if (data && data[0]) {
                Object.assign(this, data[0]);
            }
            this.isNew = false;
        } else {
            const { data, error } = await supabase
                .from(this._tableName)
                .update(row)
                .eq('_id', this._id)
                .select('*');
            
            if (error) {
                console.error(`[Supabase Save Update Error] Table ${this._tableName}:`, error);
                throw new Error(`Supabase Update Failed: ${error.message}`);
            }
            if (data && data[0]) {
                Object.assign(this, data[0]);
            }
        }
        return this;
    }
}

// Thenable query builder for find queries to support .sort() and .limit()
class SupabaseQuery {
    constructor(tableName, filter, modelClass) {
        this.tableName = tableName;
        this.filter = filter || {};
        this.modelClass = modelClass;
        this.sortOption = null;
        this.limitOption = null;
    }

    sort(sortObj) {
        this.sortOption = sortObj;
        return this;
    }

    limit(n) {
        this.limitOption = n;
        return this;
    }

    async exec() {
        let query = supabase.from(this.tableName).select('*');

        // Apply filters
        for (const [key, val] of Object.entries(this.filter)) {
            let targetKey = key === 'id' ? '_id' : key;
            
            if (val && typeof val === 'object') {
                if (val.$regex) {
                    let pattern = val.$regex;
                    if (pattern instanceof RegExp) {
                        pattern = pattern.source;
                    }
                    // Strip start/end anchors for simple search
                    pattern = pattern.replace(/^\^/, '').replace(/\$$/, '');
                    query = query.ilike(targetKey, `%${pattern}%`);
                } else if (val.$exists !== undefined) {
                    if (val.$exists) {
                        query = query.not(targetKey, 'is', null);
                    } else {
                        query = query.is(targetKey, null);
                    }
                } else {
                    query = query.eq(targetKey, val);
                }
            } else {
                query = query.eq(targetKey, val);
            }
        }

        // Apply sort
        if (this.sortOption) {
            for (const [key, order] of Object.entries(this.sortOption)) {
                let targetKey = key === 'id' ? '_id' : key;
                const ascending = order === 1 || order === 'asc' || order === 'ascending';
                query = query.order(targetKey, { ascending });
            }
        }

        // Apply limit
        if (this.limitOption !== null) {
            query = query.limit(this.limitOption);
        }

        const { data, error } = await query;
        if (error) {
            console.error(`[Supabase Query Error] Table ${this.tableName}:`, error);
            throw new Error(`Supabase query failed: ${error.message}`);
        }

        return (data || []).map(row => {
            const doc = new this.modelClass(row);
            doc.isNew = false;
            return doc;
        });
    }

    then(onSuccess, onError) {
        return this.exec().then(onSuccess, onError);
    }
}

// Thenable query builder for findOne queries
class SupabaseFindOneQuery {
    constructor(tableName, filter, modelClass) {
        this.tableName = tableName;
        this.filter = filter || {};
        this.modelClass = modelClass;
    }

    async exec() {
        let query = supabase.from(this.tableName).select('*');

        // Apply filters
        for (const [key, val] of Object.entries(this.filter)) {
            let targetKey = key === 'id' ? '_id' : key;
            
            if (val && typeof val === 'object') {
                if (val.$regex) {
                    let pattern = val.$regex;
                    if (pattern instanceof RegExp) {
                        pattern = pattern.source;
                    }
                    pattern = pattern.replace(/^\^/, '').replace(/\$$/, '');
                    query = query.ilike(targetKey, `%${pattern}%`);
                } else if (val.$exists !== undefined) {
                    if (val.$exists) {
                        query = query.not(targetKey, 'is', null);
                    } else {
                        query = query.is(targetKey, null);
                    }
                } else {
                    query = query.eq(targetKey, val);
                }
            } else {
                query = query.eq(targetKey, val);
            }
        }

        query = query.limit(1);

        const { data, error } = await query;
        if (error) {
            console.error(`[Supabase FindOne Error] Table ${this.tableName}:`, error);
            throw new Error(`Supabase queryOne failed: ${error.message}`);
        }

        if (!data || data.length === 0) return null;

        const doc = new this.modelClass(data[0]);
        doc.isNew = false;
        return doc;
    }

    then(onSuccess, onError) {
        return this.exec().then(onSuccess, onError);
    }
}

// Helper to apply updates like $inc or raw properties to document
function applyMongooseUpdate(doc, update) {
    if (!update) return doc;
    for (const [key, val] of Object.entries(update)) {
        if (key === '$inc') {
            for (const [field, incVal] of Object.entries(val)) {
                doc[field] = (Number(doc[field]) || 0) + Number(incVal);
            }
        } else if (key === '$set') {
            for (const [field, setVal] of Object.entries(val)) {
                doc[field] = setVal;
            }
        } else if (key.startsWith('$')) {
            // Ignore other complex mongoose operators if any
        } else {
            doc[key] = val;
        }
    }
    return doc;
}

// Schema Mock
class Schema {
    constructor(definition) {
        this.definition = definition;
        this.methods = {};
    }
}

Schema.Types = {
    ObjectId: class MockObjectIdSchemaType {},
    Mixed: class MockMixedSchemaType {},
    String: String,
    Number: Number,
    Boolean: Boolean,
    Date: Date
};

const registeredModels = {};

// connection details
const connection = {
    readyState: 0,
    close: async () => {
        connection.readyState = 0;
        console.log('[Supabase Connection] Connection closed.');
    }
};

const mongooseShim = {
    Schema,
    connection,
    models: registeredModels,

    model(modelName, schema) {
        if (registeredModels[modelName]) {
            return registeredModels[modelName];
        }

        const tableName = getTableName(modelName);

        class ModelInstance extends SupabaseDocument {
            constructor(data) {
                super(tableName, data, ModelInstance);
            }
        }

        // Apply schema methods to prototype
        if (schema && schema.methods) {
            for (const [methodName, fn] of Object.entries(schema.methods)) {
                ModelInstance.prototype[methodName] = fn;
            }
        }

        // Factory / Constructor function returned
        const Model = function(data) {
            return new ModelInstance(data);
        };

        Model.tableName = tableName;

        // Attach static methods to factory function
        Model.find = function(filter) {
            return new SupabaseQuery(tableName, filter, ModelInstance);
        };

        Model.findOne = function(filter) {
            return new SupabaseFindOneQuery(tableName, filter, ModelInstance);
        };

        Model.findById = function(id) {
            return new SupabaseFindOneQuery(tableName, { _id: id }, ModelInstance);
        };

        Model.findByIdAndUpdate = async function(id, update, options) {
            const doc = await this.findById(id);
            if (!doc) return null;
            applyMongooseUpdate(doc, update);
            await doc.save();
            return doc;
        };

        Model.findByIdAndDelete = async function(id) {
            const doc = await this.findById(id);
            if (!doc) return null;
            const { error } = await supabase.from(tableName).delete().eq('_id', id);
            if (error) {
                console.error(`[Supabase Delete Error] Table ${tableName}:`, error);
                throw error;
            }
            return doc;
        };

        Model.create = async function(data) {
            const doc = new ModelInstance(data);
            await doc.save();
            return doc;
        };

        Model.countDocuments = async function(filter) {
            let query = supabase.from(tableName).select('*', { count: 'exact', head: true });
            if (filter) {
                for (const [key, val] of Object.entries(filter)) {
                    let targetKey = key === 'id' ? '_id' : key;
                    if (val && typeof val === 'object') {
                        if (val.$exists !== undefined) {
                            if (val.$exists) {
                                query = query.not(targetKey, 'is', null);
                            } else {
                                query = query.is(targetKey, null);
                            }
                        } else {
                            query = query.eq(targetKey, val);
                        }
                    } else {
                        query = query.eq(targetKey, val);
                    }
                }
            }
            const { count, error } = await query;
            if (error) {
                console.error(`[Supabase Count Error] Table ${tableName}:`, error);
                throw error;
            }
            return count || 0;
        };

        Model.deleteMany = async function(filter) {
            let query = supabase.from(tableName).delete();
            if (filter && Object.keys(filter).length > 0) {
                for (const [key, val] of Object.entries(filter)) {
                    let targetKey = key === 'id' ? '_id' : key;
                    query = query.eq(targetKey, val);
                }
            } else {
                // Delete everything. Postgrest delete requires a filter, so we use _id is not null
                query = query.neq('_id', '00000000-0000-0000-0000-000000000000');
            }
            const { error } = await query;
            if (error) {
                console.error(`[Supabase DeleteMany Error] Table ${tableName}:`, error);
                throw error;
            }
            return { deletedCount: 0 };
        };

        Model.insertMany = async function(array) {
            const rows = array.map(item => {
                const doc = { ...item };
                if (!doc._id) {
                    doc._id = crypto.randomUUID();
                }
                return doc;
            });
            const { data, error } = await supabase.from(tableName).insert(rows).select('*');
            if (error) {
                console.error(`[Supabase InsertMany Error] Table ${tableName}:`, error);
                throw error;
            }
            return (data || []).map(row => new ModelInstance(row));
        };

        registeredModels[modelName] = Model;
        return Model;
    },

    async connect(uri, options) {
        console.log('[Supabase Connection] Initializing...');
        
        // Test connection by fetching a single row from the 'users' table or similar
        try {
            const { data, error } = await supabase.from('users').select('*').limit(1);
            if (error && error.code !== 'PGRST116' && error.message !== 'relation "users" does not exist') {
                console.warn('[Supabase Connection] Warning during connection check:', error.message);
            }
            connection.readyState = 1;
            console.log('Supabase API client ready for database queries!');
        } catch (err) {
            console.error('Supabase connection check failed:', err.message);
            // Still set readyState = 1 so the app can attempt queries and show descriptive table errors
            connection.readyState = 1;
        }
    },

    Types: {
        ObjectId: class MockObjectId {
            constructor(id) {
                this.id = id || crypto.randomUUID();
            }
            toString() {
                return this.id;
            }
            static isValid(id) {
                if (typeof id !== 'string') return false;
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                const mongoIdRegex = /^[0-9a-f]{24}$/i;
                return mongoIdRegex.test(id) || uuidRegex.test(id);
            }
        }
    }
};

module.exports = mongooseShim;
