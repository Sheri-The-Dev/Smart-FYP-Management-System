proposalController.downloadTemplate
);

// Get current active template (NEW - for checking if template exists)
router.get(
  '/templates/current',
  authenticate,
  proposalController.getCurrentTemplate
);

