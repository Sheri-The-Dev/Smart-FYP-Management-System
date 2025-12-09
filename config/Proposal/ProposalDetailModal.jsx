                )}

                {/* Feedback Section */}
                {proposal.feedback && (
                {(proposal.supervisor_feedback || proposal.feedback) && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-[#193869] font-semibold mb-3">
                      <MessageSquare className="w-5 h-5 text-[#d29538]" />
                      <h3>Supervisor Feedback</h3>
                    </div>
                    <FeedbackPanel
                      feedback={proposal.feedback}
                      feedback={proposal.supervisor_feedback || proposal.feedback}
                      supervisorName={proposal.supervisor_name}
                      responseDate={proposal.response_date}
                      status={proposal.status}