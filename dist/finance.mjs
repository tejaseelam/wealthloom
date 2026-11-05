export const clamp=(x,min=0,max=100)=>Math.min(max,Math.max(min,x));
export const weights=[.3,.3,.3,.1];
export function monthly(row,month){
 const start=month+'-01',end=new Date(Date.UTC(+month.slice(0,4),+month.slice(5,7),0)).toISOString().slice(0,10);
 if(!row.start_date||row.start_date>end||(row.end_date&&row.end_date<start))return 0;
 const amount=row.net_amount??row.amount;
 if(!Number.isFinite(amount))return NaN;
 if(row.frequency==='One-time')return row.start_date>=start&&row.start_date<=end?amount:0;
 return amount*({Monthly:1,Weekly:52/12,Biweekly:26/12,Annual:1/12}[row.frequency]??NaN);
}
export function calculate(data,id,month='2026-11'){
 const r=data.records, household=r.household.find(h=>h.household_id===id);
 const rows=key=>r[key].filter(a=>a.household_id===id);
 const accounts=rows('balances'),income=rows('income'),expenses=rows('budget'),goal=rows('savings_goals').find(g=>g.primary_goal),prefs=rows('health_preferences')[0];
 const total=xs=>xs.reduce((a,b)=>a+b,0);
 const inc=total(income.map(x=>monthly(x,month))),spend=total(expenses.map(x=>monthly(x,month))),essential=total(expenses.filter(x=>x.essential_or_flexible==='Essential'&&x.frequency!=='One-time').map(x=>monthly(x,month)));
 const end=month+'-31';
 const cash=total(accounts.filter(a=>a.available_for_runway==='Yes'&&(!a.available_from||a.available_from<=end)).map(a=>a.balance));
 const liquid=total(accounts.filter(a=>a.available_for_runway==='Yes').map(a=>a.balance));
 const groups={};let withdrawals=0;
 for(const row of income){const value=monthly(row,month);if(row.income_kind==='asset_withdrawal'){withdrawals+=value;continue;} if(value>0)groups[row.source_group_id]=(groups[row.source_group_id]??0)+value;}
 const external=total(Object.values(groups)),shares=Object.values(groups).map(v=>v/external);
 const cashKnown=accounts.filter(a=>a.available_for_runway==='Yes').every(a=>Number.isFinite(a.balance));
 const essentialKnown=expenses.filter(e=>monthly(e,month)>0).every(e=>['Essential','Flexible'].includes(e.essential_or_flexible));
 const components=[goal?.target_amount>0&&Number.isFinite(goal.allocated_amount)?clamp(goal.allocated_amount/goal.target_amount*100):null,cashKnown&&essentialKnown&&essential>0&&prefs?.target_buffer_months>0?clamp(cash/(essential*prefs.target_buffer_months)*100):null,inc>0?clamp((inc-spend)/inc/.2*100):inc===0&&spend>0?0:null,external>0?clamp(2*(1-total(shares.map(s=>s*s)))*100):0];
 const score=components.every(Number.isFinite)&&Number.isFinite(inc)&&Number.isFinite(spend)?Math.round(total(components.map((v,i)=>v*weights[i]))):null;
 const left=Math.max(0,cash-(household.protected_reserve??0)),burn=spend-inc;
 return {household,accounts,income,expenses,goal,prefs,inc,spend,essential,cash,liquid,components,score,margin:inc-spend,groups,external,withdrawals,largest:shares.length?Math.max(...shares):null,coverage:essential>0?cash/essential:null,runway:burn>0?left/burn:null,oneTime:total(expenses.filter(e=>e.frequency==='One-time').map(e=>monthly(e,month))),hasUncertain:income.some(i=>i.independence_status?.includes('unknown'))};
}
