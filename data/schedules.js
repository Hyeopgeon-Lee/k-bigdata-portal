// Public, read-only schedule data for the initial page.
// Do not store Google credentials, private calendar events, editor emails or access tokens here.
// Replace this source with the published Google Sheets / Apps Script read endpoint in the next phase.
//
// Future public event schema (YYYY-MM-DD dates in Asia/Seoul):
// { id:"unique-id", title:"일정명", category:"academic|exam|project|employment|certificate|event",
//   startDate:"2026-11-01", endDate:"2026-11-01", startTime:"09:00",
//   place:"", description:"", url:"https://...", important:false, published:true }
// Nothing is published until a designated administrator supplies verified events.
export const schedules = [];
