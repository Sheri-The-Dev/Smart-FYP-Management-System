const { pool } = require('../config/database');
const { logProposalActivity, sendProposalNotification } = require('../utils/proposalNotifications');
const fs = require('fs');
const path = require('path');

// ============================================
// PROPOSAL CONTROLLER - STUDENT & SUPERVISOR METHODS
// ============================================

// ============================================
// STUDENT: CREATE PROPOSAL (DRAFT)
// ============================================
exports.createProposal = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const {
      project_title,
      project_description,
      supervisor_id,
      members
    } = req.body;

    const studentId = req.user.id;

    await connection.beginTransaction();

    // Create proposal
    const [proposalResult] = await connection.execute(
      `INSERT INTO proposals 
       (student_id, supervisor_id, project_title, project_description, status) 
       VALUES (?, ?, ?, ?, 'draft')`,
      [studentId, supervisor_id || null, project_title, project_description]
    );

    const proposalId = proposalResult.insertId;

    // Insert group members
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      await connection.execute(
        `INSERT INTO proposal_members 
         (proposal_id, sap_id, email, phone_number, display_order) 
         VALUES (?, ?, ?, ?, ?)`,
        [proposalId, member.sap_id, member.email, member.phone_number || null, i]
      );
    }

    // Log activity
    await logProposalActivity(connection, {
      proposalId,
      userId: studentId,
      userRole: req.user.role,
      action: 'PROPOSAL_CREATED',
      newValue: { project_title, status: 'draft' },
      ipAddress: req.ip
    });

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Proposal draft created successfully',
      data: { id: proposalId }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create proposal'
    });
  } finally {
    connection.release();
  }
};

// ============================================
// STUDENT: GET MY PROPOSALS
// ============================================
exports.getMyProposals = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const studentId = req.user.id;

    const [proposals] = await connection.execute(
      `SELECT 
        p.*,
        u.username as supervisor_name,
        COUNT(pm.id) as member_count
       FROM proposals p
       LEFT JOIN users u ON p.supervisor_id = u.id
       LEFT JOIN proposal_members pm ON p.id = pm.proposal_id
       WHERE p.student_id = ?
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [studentId]
    );

    res.status(200).json({
      success: true,
      data: proposals
    });

  } catch (error) {
    console.error('Get my proposals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve proposals'
    });
  } finally {
    connection.release();
  }
};

// ============================================
// STUDENT: GET PROPOSAL DETAILS
// ============================================
exports.getProposalDetails = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Get proposal with supervisor info
    const [proposals] = await connection.execute(
      `SELECT 
        p.*,
        u.username as supervisor_name,
        u.email as supervisor_email,
        student.username as student_name,
        student.email as student_email
       FROM proposals p
       LEFT JOIN users u ON p.supervisor_id = u.id
       LEFT JOIN users student ON p.student_id = student.id
       WHERE p.id = ?`,
      [id]
    );

    if (proposals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    const proposal = proposals[0];

    // Check access permissions
    const hasAccess = 
      userRole === 'Administrator' ||
      proposal.student_id === userId ||
      proposal.supervisor_id === userId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get group members
    const [members] = await connection.execute(
      `SELECT sap_id, email, phone_number, display_order
       FROM proposal_members
       WHERE proposal_id = ?
       ORDER BY display_order`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...proposal,
        members
      }
    });

  } catch (error) {
    console.error('Get proposal details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve proposal details'
    });
  } finally {
    connection.release();
  }
};

// ============================================
// STUDENT: UPDATE PROPOSAL
// ============================================
exports.updateProposal = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const studentId = req.user.id;
    const {
      project_title,
      project_description,
      supervisor_id,
      members
    } = req.body;

    await connection.beginTransaction();

    // Get current proposal
    const [currentProposal] = await connection.execute(
      'SELECT * FROM proposals WHERE id = ?',
      [id]
    );

    if (currentProposal.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    const proposal = currentProposal[0];

    // Verify ownership
    if (proposal.student_id !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if proposal can be edited
    if (proposal.status !== 'draft' && proposal.status !== 'revision_requested') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit submitted proposals'
      });
    }

    // Update proposal
    const updateFields = [];
    const updateValues = [];

    if (project_title !== undefined) {
      updateFields.push('project_title = ?');
      updateValues.push(project_title);
    }
    if (project_description !== undefined) {
      updateFields.push('project_description = ?');
      updateValues.push(project_description);
    }
    if (supervisor_id !== undefined) {
      updateFields.push('supervisor_id = ?');
      updateValues.push(supervisor_id || null);
    }

    if (updateFields.length > 0) {
      updateValues.push(id);
      await connection.execute(
        `UPDATE proposals SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    // Update members if provided
    if (members && Array.isArray(members)) {
      // Delete existing members
      await connection.execute(
        'DELETE FROM proposal_members WHERE proposal_id = ?',
        [id]
      );

      // Insert new members
      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        await connection.execute(
          `INSERT INTO proposal_members 
           (proposal_id, sap_id, email, phone_number, display_order) 
           VALUES (?, ?, ?, ?, ?)`,
          [id, member.sap_id, member.email, member.phone_number || null, i]
        );
      }
    }

    // Log activity
    await logProposalActivity(connection, {
      proposalId: id,
      userId: studentId,
      userRole: req.user.role,
      action: 'PROPOSAL_UPDATED',
      oldValue: proposal,
      newValue: req.body,
      ipAddress: req.ip
    });

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Proposal updated successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Update proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update proposal'
    });
  } finally {
    connection.release();
  }
};

// ============================================
// STUDENT: UPLOAD PROPOSAL PDF
// ============================================
exports.uploadProposalPDF = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    // Verify ownership
    const [proposal] = await connection.execute(
      'SELECT student_id, status, proposal_pdf FROM proposals WHERE id = ?',
      [id]
    );

    if (proposal.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    if (proposal[0].student_id !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (proposal[0].status !== 'draft' && proposal[0].status !== 'revision_requested') {
      return res.status(400).json({
        success: false,
        message: 'Cannot upload PDF for submitted proposals'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = `/uploads/proposals/${req.file.filename}`;

    // Delete old PDF if exists
    if (proposal[0].proposal_pdf) {
      const oldFilePath = path.join(__dirname, '../../', proposal[0].proposal_pdf);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Update proposal with PDF path
    await connection.execute(
      'UPDATE proposals SET proposal_pdf = ? WHERE id = ?',
      [filePath, id]
    );

    // Log activity
    await logProposalActivity(connection, {
      proposalId: id,
      userId: studentId,
      userRole: req.user.role,
      action: 'PDF_UPLOADED',
      newValue: { file_path: filePath },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'PDF uploaded successfully',
      data: { file_path: filePath }
    });

  } catch (error) {
    console.error('Upload PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload PDF'
    });
  } finally {
    connection.release();
  }
};

// ============================================
// STUDENT: SUBMIT PROPOSAL
// ============================================
exports.submitProposal = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    await connection.beginTransaction();

    // Get proposal details
    const [proposal] = await connection.execute(
      `SELECT p.*, u.email as supervisor_email, u.username as supervisor_name
       FROM proposals p
       LEFT JOIN users u ON p.supervisor_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (proposal.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    const proposalData = proposal[0];

    // Verify ownership
    if (proposalData.student_id !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Verify status
    if (proposalData.status !== 'draft' && proposalData.status !== 'revision_requested') {
      return res.status(400).json({
        success: false,
        message: 'Proposal has already been submitted'
      });
    }

    // Verify PDF uploaded
    if (!proposalData.proposal_pdf) {
      return res.status(400).json({
        success: false,
        message: 'Please upload proposal PDF before submitting'
      });
    }

    // Verify supervisor selected
    if (!proposalData.supervisor_id) {
      return res.status(400).json({
        success: false,
        message: 'Please select a supervisor'
      });
    }

    // Update proposal status
    await connection.execute(
      `UPDATE proposals 
       SET status = 'submitted', submission_date = NOW() 
       WHERE id = ?`,
      [id]
    );

    // Increment supervisor workload
    await connection.execute(
      'UPDATE users SET current_supervisees = current_supervisees + 1 WHERE id = ?',
      [proposalData.supervisor_id]
    );

    // Log activity
    await logProposalActivity(connection, {
      proposalId: id,
      userId: studentId,
      userRole: req.user.role,
      action: 'PROPOSAL_SUBMITTED',
      oldValue: { status: proposalData.status },
      newValue: { status: 'submitted' },
      ipAddress: req.ip
    });

    await connection.commit();

    // Send email notification to supervisor (async)
    sendProposalNotification({
      type: 'PROPOSAL_SUBMITTED',
      to: proposalData.supervisor_email,
      supervisorName: proposalData.supervisor_name,
      studentName: req.user.username,
      projectTitle: proposalData.project_title,
      proposalId: id
    }).catch(err => console.error('Email notification error:', err));

    res.status(200).json({
      success: true,
      message: 'Proposal submitted successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Submit proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit proposal'
    });
  } finally {
    connection.release();
  }
};

// ============================================
// STUDENT: DELETE PROPOSAL
// ============================================
exports.deleteProposal = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    await connection.beginTransaction();

    // Get proposal
    const [proposal] = await connection.execute(
      'SELECT * FROM proposals WHERE id = ?',
      [id]
    );

    if (proposal.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    const proposalData = proposal[0];

    // Verify ownership
    if (proposalData.student_id !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Can only delete drafts
    if (proposalData.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Can only delete draft proposals'
      });
    }

    // Delete PDF file if exists
    if (proposalData.proposal_pdf) {
      const filePath = path.join(__dirname, '../../', proposalData.proposal_pdf);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete proposal (cascade will delete members and logs)
    await connection.execute(
      'DELETE FROM proposals WHERE id = ?',
      [id]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Proposal deleted successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Delete proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete proposal'
    });
  } finally {
    connection.release();
  }
};

// ============================================
// SUPERVISOR: GET ASSIGNED PROPOSALS
// ============================================
exports.getSupervisorProposals = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const supervisorId = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT 
        p.*,
        u.username as student_name,
        u.email as student_email,
        COUNT(pm.id) as member_count
      FROM proposals p
      LEFT JOIN users u ON p.student_id = u.id
      LEFT JOIN proposal_members pm ON p.id = pm.proposal_id
      WHERE p.supervisor_id = ?
    `;

    const params = [supervisorId];

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    query += ' GROUP BY p.id ORDER BY p.submission_date DESC';

    const [proposals] = await connection.execute(query, params);

    res.status(200).json({
      success: true,
      data: proposals
    });

  } catch (error) {
    console.error('Get supervisor proposals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve proposals'
    });
  } finally {
    connection.release();
  }
};

// ============================================
// SUPERVISOR: APPROVE PROPOSAL
// ============================================
exports.approveProposal = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const supervisorId = req.user.id;

    await connection.beginTransaction();

    // Get proposal
    const [proposal] = await connection.execute(
      `SELECT p.*, u.email as student_email, u.username as student_name
       FROM proposals p
       LEFT JOIN users u ON p.student_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (proposal.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    const proposalData = proposal[0];

    // Verify supervisor
    if (proposalData.supervisor_id !== supervisorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check status
    if (proposalData.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Can only approve submitted proposals'
      });
    }

    // Update status
    await connection.execute(
      `UPDATE proposals 
       SET status = 'approved', response_date = NOW() 
       WHERE id = ?`,
      [id]
    );

    // Log activity
    await logProposalActivity(connection, {
      proposalId: id,
      userId: supervisorId,
      userRole: req.user.role,
      action: 'PROPOSAL_APPROVED',
      oldValue: { status: 'submitted' },
      newValue: { status: 'approved' },
      ipAddress: req.ip
    });

    await connection.commit();

    // Send email notification to student
    sendProposalNotification({
      type: 'PROPOSAL_APPROVED',
      to: proposalData.student_email,
      studentName: proposalData.student_name,
      supervisorName: req.user.username,
      projectTitle: proposalData.project_title,
      proposalId: id
    }).catch(err => console.error('Email notification error:', err));

    res.status(200).json({
      success: true,
      message: 'Proposal approved successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Approve proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve proposal'
    });
  } finally {
    connection.release();
  }
};

// ============================================
// SUPERVISOR: REJECT PROPOSAL
// ============================================
exports.rejectProposal = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const supervisorId = req.user.id;

    await connection.beginTransaction();

    // Get proposal
    const [proposal] = await connection.execute(
      `SELECT p.*, u.email as student_email, u.username as student_name
       FROM proposals p
       LEFT JOIN users u ON p.student_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (proposal.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    const proposalData = proposal[0];

    // Verify supervisor
    if (proposalData.supervisor_id !== supervisorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check status
    if (proposalData.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Can only reject submitted proposals'
      });
    }

    // Update status and add feedback
    await connection.execute(
      `UPDATE proposals 
       SET status = 'rejected', 
           supervisor_feedback = ?, 
           response_date = NOW() 
       WHERE id = ?`,
      [feedback, id]
    );

    // Decrement supervisor workload
    await connection.execute(
      'UPDATE users SET current_supervisees = GREATEST(current_supervisees - 1, 0) WHERE id = ?',
      [supervisorId]
    );

    // Log activity
    await logProposalActivity(connection, {
      proposalId: id,
      userId: supervisorId,
      userRole: req.user.role,
      action: 'PROPOSAL_REJECTED',
      oldValue: { status: 'submitted' },
      newValue: { status: 'rejected', feedback },
      ipAddress: req.ip
    });

    await connection.commit();

    // Send email notification to student
    sendProposalNotification({
      type: 'PROPOSAL_REJECTED',
      to: proposalData.student_email,
      studentName: proposalData.student_name,
      supervisorName: req.user.username,
      projectTitle: proposalData.project_title,
      proposalId: id,
      feedback: feedback
    }).catch(err => console.error('Email notification error:', err));

    res.status(200).json({
      success: true,
      message: 'Proposal rejected'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Reject proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject proposal'
    });
  } finally {
    connection.release();
  }
};

// ============================================
// SUPERVISOR: REQUEST REVISION
// ============================================
exports.requestRevision = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    const supervisorId = req.user.id;

    await connection.beginTransaction();

    // Get proposal
    const [proposal] = await connection.execute(
      `SELECT p.*, u.email as student_email, u.username as student_name
       FROM proposals p
       LEFT JOIN users u ON p.student_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (proposal.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    const proposalData = proposal[0];

    // Verify supervisor
    if (proposalData.supervisor_id !== supervisorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check status
    if (proposalData.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Can only request revision for submitted proposals'
      });
    }

    // Update status and add feedback
    await connection.execute(
      `UPDATE proposals 
       SET status = 'revision_requested', 
           supervisor_feedback = ?, 
           response_date = NOW() 
       WHERE id = ?`,
      [feedback, id]
    );

    // Log activity
    await logProposalActivity(connection, {
      proposalId: id,
      userId: supervisorId,
      userRole: req.user.role,
      action: 'REVISION_REQUESTED',
      oldValue: { status: 'submitted' },
      newValue: { status: 'revision_requested', feedback },
      ipAddress: req.ip
    });

    await connection.commit();

    // Send email notification to student
    sendProposalNotification({
      type: 'REVISION_REQUESTED',
      to: proposalData.student_email,
      studentName: proposalData.student_name,
      supervisorName: req.user.username,
      projectTitle: proposalData.project_title,
      proposalId: id,
      feedback: feedback
    }).catch(err => console.error('Email notification error:', err));

    res.status(200).json({
      success: true,
      message: 'Revision requested successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Request revision error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request revision'
    });
  } finally {
    connection.release();
  }
};

// ============================================
// COMMON: GET AVAILABLE SUPERVISORS
// ============================================
exports.getAvailableSupervisors = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [supervisors] = await connection.execute(
      `SELECT 
        id,
        username,
        email,
        max_supervisees,
        current_supervisees,
        is_accepting_proposals,
        (max_supervisees - current_supervisees) as available_slots
       FROM users
       WHERE role = 'Teacher' 
       AND is_active = 1
       ORDER BY username`
    );

    res.status(200).json({
      success: true,
      data: supervisors
    });

  } catch (error) {
    console.error('Get available supervisors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve supervisors'
    });
  } finally {
    connection.release();
  }
};

exports.downloadTemplate = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Get active template
    const [templates] = await connection.execute(
      'SELECT * FROM proposal_templates WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1'
    );

    if (templates.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No template available'
      });
    }

    const template = templates[0];
    const filePath = path.join(__dirname, '../../', template.file_path);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('Template file not found at path:', filePath);
      return res.status(404).json({
        success: false,
        message: 'Template file not found'
      });
    }

    // Set proper headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${template.template_name}.pdf"`);
    
    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: 'Failed to download template'
        });
      }
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('Download template error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to download template'
      });
    }
  } finally {
    connection.release();
  }
};

exports.getCurrentTemplate = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Get active template (without file content, just metadata)
    const [templates] = await connection.execute(
      `SELECT 
        id,
        template_name,
        file_path,
        uploaded_by,
        created_at,
        is_active
       FROM proposal_templates 
       WHERE is_active = 1 
       ORDER BY created_at DESC 
       LIMIT 1`
    );

    if (templates.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No template available'
      });
    }

    res.status(200).json({
      success: true,
      data: templates[0]
    });

  } catch (error) {
    console.error('Get current template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve template'
    });
  } finally {
    connection.release();
  }
};

// ============================================
// ADMIN: UPLOAD TEMPLATE
// ============================================
exports.uploadTemplate = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const adminId = req.user.id;
    const { template_name } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    await connection.beginTransaction();

    const filePath = `/uploads/proposals/${req.file.filename}`;
    const displayName = template_name || 'Proposal Template';

    // Deactivate old templates
    await connection.execute(
      'UPDATE proposal_templates SET is_active = 0'
    );

    // Insert new template
    const [result] = await connection.execute(
      `INSERT INTO proposal_templates 
       (template_name, file_path, uploaded_by, is_active) 
       VALUES (?, ?, ?, 1)`,
      [displayName, filePath, adminId]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Template uploaded successfully',
      data: {
        id: result.insertId,
        template_name: displayName,
        file_path: filePath
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Upload template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload template'
    });
  } finally {
    connection.release();
  }
};

// ============================================
// ADMIN: DELETE TEMPLATE
// ============================================
exports.deleteTemplate = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;

    // Get template
    const [templates] = await connection.execute(
      'SELECT * FROM proposal_templates WHERE id = ?',
      [id]
    );

    if (templates.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    const template = templates[0];

    // Delete file from disk
    const filePath = path.join(__dirname, '../../', template.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await connection.execute(
      'DELETE FROM proposal_templates WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete template'
    });
  } finally {
    connection.release();
  }
};

// ============================================
// ADMIN: GET ALL PROPOSALS
// ============================================
exports.getAllProposals = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { status, supervisor_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        p.*,
        student.username as student_name,
        student.email as student_email,
        supervisor.username as supervisor_name,
        supervisor.email as supervisor_email,
        COUNT(pm.id) as member_count
      FROM proposals p
      LEFT JOIN users student ON p.student_id = student.id
      LEFT JOIN users supervisor ON p.supervisor_id = supervisor.id
      LEFT JOIN proposal_members pm ON p.id = pm.proposal_id
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (supervisor_id) {
      query += ' AND p.supervisor_id = ?';
      params.push(supervisor_id);
    }

    query += ' GROUP BY p.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [proposals] = await connection.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM proposals WHERE 1=1';
    const countParams = [];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (supervisor_id) {
      countQuery += ' AND supervisor_id = ?';
      countParams.push(supervisor_id);
    }

    const [countResult] = await connection.execute(countQuery, countParams);

    res.status(200).json({
      success: true,
      data: proposals,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Get all proposals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve proposals'
    });
  } finally {
    connection.release();
  }
};

// ============================================
// ADMIN: GET PROPOSAL ANALYTICS
// ============================================
exports.getProposalAnalytics = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    // Total proposals
    const [totalResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM proposals'
    );

    // Proposals by status
    const [byStatus] = await connection.execute(
      `SELECT status, COUNT(*) as count 
       FROM proposals 
       GROUP BY status`
    );

    // Proposals by supervisor
    const [bySupervisor] = await connection.execute(
      `SELECT 
        u.username as supervisor_name,
        u.id as supervisor_id,
        COUNT(p.id) as proposal_count,
        SUM(CASE WHEN p.status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN p.status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        SUM(CASE WHEN p.status = 'submitted' THEN 1 ELSE 0 END) as pending_count
       FROM users u
       LEFT JOIN proposals p ON u.id = p.supervisor_id
       WHERE u.role = 'Teacher'
       GROUP BY u.id, u.username
       ORDER BY proposal_count DESC`
    );

    // Recent submissions (last 30 days)
    const [recentSubmissions] = await connection.execute(
      `SELECT 
        DATE(submission_date) as date,
        COUNT(*) as count
       FROM proposals
       WHERE submission_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(submission_date)
       ORDER BY date DESC`
    );

    // Average response time (in days)
    const [avgResponseTime] = await connection.execute(
      `SELECT 
        AVG(DATEDIFF(response_date, submission_date)) as avg_days
       FROM proposals
       WHERE response_date IS NOT NULL 
       AND submission_date IS NOT NULL`
    );

    // Supervisor workload
    const [supervisorWorkload] = await connection.execute(
      `SELECT 
        username,
        current_supervisees,
        max_supervisees,
        is_accepting_proposals,
        (max_supervisees - current_supervisees) as available_slots
       FROM users
       WHERE role = 'Teacher'
       ORDER BY current_supervisees DESC`
    );

    res.status(200).json({
      success: true,
      data: {
        total: totalResult[0].total,
        byStatus,
        bySupervisor,
        recentSubmissions,
        avgResponseTime: Math.round(avgResponseTime[0].avg_days || 0),
        supervisorWorkload
      }
    });

  } catch (error) {
    console.error('Get proposal analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics'
    });
  } finally {
    connection.release();
  }
};

// ============================================
// ADMIN: GET PROPOSAL ACTIVITY LOGS
// ============================================
exports.getProposalActivityLogs = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { proposalId } = req.params;

    // Verify proposal exists
    const [proposal] = await connection.execute(
      'SELECT id, project_title FROM proposals WHERE id = ?',
      [proposalId]
    );

    if (proposal.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found'
      });
    }

    // Get activity logs
    const [logs] = await connection.execute(
      `SELECT 
        pal.*,
        u.username,
        u.email
       FROM proposal_activity_logs pal
       LEFT JOIN users u ON pal.user_id = u.id
       WHERE pal.proposal_id = ?
       ORDER BY pal.created_at DESC`,
      [proposalId]
    );

    res.status(200).json({
      success: true,
      data: {
        proposal: proposal[0],
        logs
      }
    });

  } catch (error) {
    console.error('Get proposal activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity logs'
    });
  } finally {
    connection.release();
  }
};

module.exports = exports;
