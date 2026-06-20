const db = require('./config/db');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
    try {
        const email = 'admin@company.com';
        const password = 'Password123!';

        
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            console.log('Admin user already exists!');
            process.exit(0);
        }

        
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        
        await db.query(
            'INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            ['Super', 'Admin', email, password_hash, 'Admin']
        );

        console.log('Success! Admin user created.');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();