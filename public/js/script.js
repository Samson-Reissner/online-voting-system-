document.addEventListener("DOMContentLoaded", () => {
  const contentArea = document.getElementById("card-details");
  const backBtn = document.getElementById("back-btn");

  // Define apiRoutes at the top level of the DOMContentLoaded callback
  const apiRoutes = {
    'voters': '/api/voters',
    'registeredvoters': '/api/registeredvoters',
    'nonregisteredvoters': '/api/nonregisteredvoters',
    'observers': '/api/observers',
    'accreditation': '/api/accreditation',
    'parties': '/api/parties',
    'constituencies': '/api/constituencies',
    'pollingcenters': '/api/pollingcenters',
    'candidates': '/api/candidates',
    'registeredcandidates': '/api/registeredcandidates',
    'nonregisteredcandidates': '/api/nonregisteredcandidates',
    'elections': '/api/elections',
    'reports': '/api/reports',
    'results': '/api/results',
    'auditlogs': '/api/auditlogs',
    'wards': '/api/wards',
    'positions': '/api/positions',
    'ballots': '/api/ballots',
    'alliances': '/api/alliances',
    'transport': '/api/transport',
    'complaints': '/api/complaints',
    'feedback': '/api/feedback',
    'winners': '/api/winners',
    'votes': '/api/votes',
    'votecount': '/api/votecount',
    'mediahouses': '/api/mediahouses',
    // Add the new complaint routes
    'pendingcomplaints': '/api/pendingcomplaints',
    'reviewcomplaints': '/api/reviewcomplaints',
    'resolvedcomplaints': '/api/resolvedcomplaints',
    'rejectedcomplaints': '/api/rejectedcomplaints',
    'complaintstats': '/api/complaintstats',
    // Add the new feedback routes
    'positivefeedback': '/api/positivefeedback',
    'negativefeedback': '/api/negativefeedback',
    'suggestions': '/api/suggestions',
    'feedbackanalytics': '/api/feedbackanalytics',
    'feedbackresponse': '/api/feedbackresponse'
  };

  // Event delegation for card clicks
  document.body.addEventListener("click", function(e) {
    // Check if a dashboard card was clicked
    if (e.target.closest('.dashboard-card[data-card]')) {
      const card = e.target.closest('.dashboard-card[data-card]');
      const cardType = card.getAttribute('data-card');
      
      // Hide current section and show card content
      document.querySelectorAll(".category-section").forEach(section => section.classList.add("d-none"));
      document.getElementById("category-cards").classList.add("d-none");
      document.getElementById("card-content").classList.remove("d-none");
      
      // Load the appropriate data based on card type
      loadCardData(cardType);
    }
  });

  // Back button functionality
  backBtn.addEventListener("click", () => {
    document.getElementById("card-content").classList.add("d-none");
    document.getElementById("category-cards").classList.remove("d-none");
  });

  function loadCardData(cardType) {
    contentArea.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div><p>Loading data...</p></div>';

    const apiUrl = apiRoutes[cardType];
    
    if (!apiUrl) {
      contentArea.innerHTML = `<h4>${capitalizeFirstLetter(cardType)}</h4><p>No API endpoint defined for ${cardType}</p>`;
      return;
    }

    fetch(apiUrl)
      .then(res => {
        if (res.status === 401) {
          // Redirect to login if unauthorized
          window.location.href = '/';
          return;
        }
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Handle both array format and success/error format
        let displayData = data;
        if (data && data.success !== undefined) {
          displayData = data.data || [];
        }
        
        if (!displayData || displayData.length === 0) {
          contentArea.innerHTML = `<h4>${capitalizeFirstLetter(cardType)}</h4><p>No records found.</p>`;
          return;
        }

        displayDataAsTable(cardType, displayData);
      })
      .catch(err => {
        console.error(`Error fetching data for ${cardType}:`, err);
        contentArea.innerHTML = `<h4>${capitalizeFirstLetter(cardType)}</h4><p style="color:red">Failed to load data: ${err.message}</p>`;
      });
  }

  function displayDataAsTable(cardType, data) {
    // Check if data is an array and has items
    if (!Array.isArray(data) || data.length === 0) {
      contentArea.innerHTML = `<h4>${capitalizeFirstLetter(cardType)}</h4><p>No data available.</p>`;
      return;
    }

    const headers = Object.keys(data[0]);
    const tableHtml = `
      <h4 class="mb-4">${capitalizeFirstLetter(cardType)} Management</h4>
      <div class="table-responsive">
        <table class="table table-striped table-bordered table-hover">
          <thead class="table-dark">
            <tr>${headers.map(h => `<th>${formatHeader(h)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${data.map(row => 
              `<tr>${headers.map(h => `<td>${formatCellValue(row[h])}</td>`).join("")}</tr>`
            ).join("")}
          </tbody>
        </table>
        <p class="text-muted">Total records: ${data.length}</p>
      </div>
    `;
    contentArea.innerHTML = tableHtml;
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function formatHeader(header) {
    return header.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  function formatCellValue(value) {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return value.toString();
  }
});

// Function to handle report creation from dashboard
function handleCreateReport() {
  // Redirect to create report page
  window.location.href = '/create-report';
}

// Update the reports section to include create button
function generateReportsContent() {
  return `
    <div class="content-header">
      <h4><i class="fas fa-file-alt me-2"></i>Reports Management</h4>
      <p class="text-muted">Create and manage election reports</p>
    </div>
    
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="stats-card" style="background: linear-gradient(135deg, var(--mec-blue), var(--mec-light-blue)); color: white; padding: 20px; border-radius: 10px; width: auto;">
        <i class="fas fa-file-alt me-2"></i>
        <span id="total-reports">0</span> Total Reports
      </div>
      <button class="btn btn-mec" onclick="handleCreateReport()">
        <i class="fas fa-plus me-2"></i>Create New Report
      </button>
    </div>
    
    <!-- Recent Reports Table -->
    <div class="data-table">
      <div class="card">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Recent Reports</h5>
          <button class="btn btn-sm btn-light" onclick="refreshReports()">
            <i class="fas fa-sync-alt me-1"></i>Refresh
          </button>
        </div>
        <div class="card-body">
          <div id="reports-table-container">
            <div class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading reports...</span>
              </div>
              <p class="mt-2 text-muted">Loading reports...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Function to load and display reports in dashboard
async function loadDashboardReports() {
  try {
    const response = await fetch('/api/reports');
    const result = await response.json();
    
    const container = document.getElementById('reports-table-container');
    const totalReports = document.getElementById('total-reports');
    
    if (response.ok && result.success) {
      const reports = result.data;
      totalReports.textContent = reports.length;
      
      if (reports.length === 0) {
        container.innerHTML = `
          <div class="text-center py-5">
            <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">No Reports Found</h5>
            <p class="text-muted">Create your first report to get started</p>
            <button class="btn btn-mec" onclick="handleCreateReport()">
              <i class="fas fa-plus me-2"></i>Create Report
            </button>
          </div>
        `;
        return;
      }
      
      container.innerHTML = `
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Title</th>
                <th>Election</th>
                <th>Created By</th>
                <th>Date Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${reports.slice(0, 5).map(report => `
                <tr>
                  <td>
                    <strong class="text-primary">${report.title}</strong>
                    ${report.body && report.body.length > 50 ? 
                      `<br><small class="text-muted">${report.body.substring(0, 50)}...</small>` : ''}
                  </td>
                  <td>${report.election_name || 'N/A'}</td>
                  <td>${report.created_by_name || 'Unknown'}</td>
                  <td>${new Date(report.created_at).toLocaleDateString()}</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-primary" onclick="viewReport(${report.report_id})" title="View">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn btn-outline-success" onclick="downloadReport(${report.report_id})" title="Download">
                        <i class="fas fa-download"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ${reports.length > 5 ? `
          <div class="text-center mt-3">
            <a href="/reports" class="btn btn-outline-primary">View All Reports</a>
          </div>
        ` : ''}
      `;
    } else {
      throw new Error(result.message || 'Failed to load reports');
    }
  } catch (error) {
    console.error('Error loading reports:', error);
    document.getElementById('reports-table-container').innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        Error loading reports: ${error.message}
      </div>
    `;
  }
}

// Refresh reports function
function refreshReports() {
  loadDashboardReports();
}

// Call this when reports section is shown
function showReportsSection() {
  setTimeout(loadDashboardReports, 100);
}

// Add missing functions that are referenced but not defined
function viewReport(reportId) {
  // Implement view report functionality
  console.log('View report:', reportId);
  alert(`View report ${reportId} - functionality to be implemented`);
}

function downloadReport(reportId) {
  // Implement download report functionality
  console.log('Download report:', reportId);
  alert(`Download report ${reportId} - functionality to be implemented`);
}