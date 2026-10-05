import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildBank,bankStats,sourceLabels,gradeAnswer} from '../js/practical-core.js';
const read=p=>JSON.parse(readFileSync(new URL('../data/practical/'+p,import.meta.url),'utf8'));
const {questions,aliases}=read('normalized.json');
assert.equal(questions.length,184);assert.equal(Object.keys(aliases).length,516);
assert.equal(new Set(questions.map(q=>q.id)).size,184);
assert.equal(questions.filter(q=>q.sourceType==='normalized').length,142);
assert.equal(questions.filter(q=>q.sourceType==='transformed').length,42);
for(const q of questions){assert.ok(sourceLabels[q.sourceType]);assert.equal(q.confidence,null);assert.ok(q.answer&&q.hint&&q.steps.length>=3);assert.ok(q.code||q.inputData);assert.equal(gradeAnswer(q,q.answer),true);for(const id of q.importIds)assert.equal(aliases[id],q.id);if(q.originalQuestionId)assert.ok(questions.some(p=>p.id===q.originalQuestionId&&p.sourceType==='normalized'));}
for(const id of Object.values(aliases))assert.ok(questions.some(q=>q.id===id));
const bank=buildBank([...read('questions.json'),...questions],read('exam-history.json'));
assert.equal(bank.length,220);assert.equal(bankStats(bank).history,18);
assert.equal(bank.filter(q=>q.importIds).flatMap(q=>q.history).length,0);
console.log('PASS: 516 imported IDs → 184 unique learning problems; no invented exam history/confidence; 220 total preserved and imported questions.');
