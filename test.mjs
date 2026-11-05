import fs from 'node:fs';import assert from 'node:assert/strict';import {calculate,monthly,weights} from './dist/finance.mjs';
const base=JSON.parse(fs.readFileSync(new URL('./dist/demo-data.json',import.meta.url)));
assert(Math.abs(weights.reduce((a,b)=>a+b,0)-1)<1e-12);
for(const id of ['H02','H03','H04','H05','H06']){const s=calculate(base,id);assert(s.score>=0&&s.score<=100);assert(s.components.every(x=>x>=0&&x<=100));assert(Number.isFinite(s.cash));}
const maya=calculate(base,'H02');assert.equal(maya.cash,6500);assert.equal(maya.inc,3400);assert.equal(maya.components[0],25);assert.equal(maya.components[3],0);
const changed=structuredClone(base);changed.records.budget.find(e=>e.household_id==='H02').amount+=3000;assert(calculate(changed,'H02').score<maya.score);assert.equal(calculate(changed,'H03').score,calculate(base,'H03').score);
const split=structuredClone(base);let i=split.records.income.find(i=>i.household_id==='H02');i.net_amount/=2;split.records.income.push({...i,income_id:'split'});assert.equal(calculate(split,'H02').components[3],0);
const robert=calculate(base,'H06');assert.equal(robert.withdrawals,1000);assert.equal(robert.external,2600);assert.equal(robert.components[3],0);assert.equal(calculate(base,'H06','2027-02').oneTime,7500);assert.equal(calculate(base,'H06','2026-11').oneTime,0);
assert.equal(calculate(base,'H06','2027-02').essential,robert.essential);
assert.equal(monthly({net_amount:100,frequency:'Monthly',start_date:'2027-01-01'},'2026-11'),0);
const missing=structuredClone(base);missing.records.savings_goals[0].target_amount=null;assert.equal(calculate(missing,'H02').score,null);
const missingCash=structuredClone(base);missingCash.records.balances[0].balance=null;assert.equal(calculate(missingCash,'H02').score,null);
const unknownExpense=structuredClone(base);unknownExpense.records.budget[0].essential_or_flexible='Unknown';assert.equal(calculate(unknownExpense,'H02').score,null);
const full=structuredClone(base);full.records.savings_goals[0].allocated_amount=20000;assert.equal(calculate(full,'H02').components[0],100);
assert(base.records.household.every(h=>h.data_kind==='synthetic'));assert(base.records.people.every(p=>!p.person_id.startsWith('P01')));console.log('Passed: five persona scores, isolation, edits, source grouping, withdrawals, one-time dates, missing inputs, caps, synthetic-only data.');
