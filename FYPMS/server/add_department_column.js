const { pool } = require('./config/database');

const addDepartmentColumn = async () => {
  try {
    console.log('Checking if department column exists...');
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'department'
    `);

    if (columns.length > 0) {
      console.log('Department column already exists.');
    } else {
      console.log('Adding department column...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN department VARCHAR(50) DEFAULT NULL AFTER role
      `);
      console.log('Department column added successfully.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding department column:', error);
    process.exit(1);
  }
};

addDepartmentColumn();
