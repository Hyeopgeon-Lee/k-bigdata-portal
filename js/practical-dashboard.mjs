import {createLearningDashboard} from "./learning-dashboard.mjs?v=20261128-performance-1";
import {learningRecords} from "./learning-dashboard-core.mjs?v=20261128-performance-1";
export const practicalRecords=(bank,attempts,aliases={})=>learningRecords(bank,attempts,aliases,"practical");
export const createPracticalDashboard=options=>createLearningDashboard({...options,bankType:"practical"});
