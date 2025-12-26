const { pool } = require('./config/database');
require('dotenv').config();

const addDepartmentToMembers = async () => {
  try {
    console.log('Checking if department column exists in proposal_members...');
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME = 'proposal_members' 
      AND COLUMN_NAME = 'department'
    `);

    if (columns.length > 0) {
      console.log('Department column already exists in proposal_members.');
    } else {
      console.log('Adding department column to proposal_members...');
      await pool.query(`
        ALTER TABLE proposal_members 
        ADD COLUMN department VARCHAR(100) DEFAULT NULL AFTER phone_number
      `);
      console.log('Department column added successfully.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding department column:', error);
    process.exit(1);
  }
};

addDepartmentToMembers();
