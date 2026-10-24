// Separate synthetic behaviour population: no change to the logistic preference fit.
const randomFor = seed => () => {
  let t=seed+=0x6D2B79F5; t=Math.imul(t^(t>>>15),t|1);
  t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296;
};
const sum = a => a.reduce((s,x)=>s+x,0);
const clip = (x,a,b) => Math.max(a,Math.min(b,x));
const probabilities = scores => {const m=Math.max(...scores),p=scores.map(x=>Math.exp(x-m)),z=sum(p);return p.map(x=>x/z);};
const distance = (a,b) => sum(a.map((v,j)=>(v-b[j])**2));
const entropy = p => -sum(p.map(x=>x>0?x*Math.log(x):0));
export function createSegmentClassifier(catalogue) {
  const items=[...catalogue].sort((a,b)=>a.id.localeCompare(b.id)),byId=new Map(items.map((p,i)=>[p.id,i]));
  const categories=[...new Set(items.map(p=>p.category))].sort(),K=6,seed=20261026;
  const band=p=>p.price<5000?0:p.price<20000?1:2;
  const pick=(weights,random)=>{let t=random()*sum(weights);for(let i=0;i<weights.length;i++){t-=weights[i];if(t<0)return i;}return weights.length-1;};
  // Generator archetypes are hidden from clustering and likelihood estimation.
  const archetypes=[
    {categories:{snacks:14,drinks:1.2},bands:[3,1,.25],loyalty:.55,repeat:.35},
    {categories:{home:8,kitchen:5,toothpaste:2,toothbrush:1,mosquito:1,bedding:1},bands:[2,1,.4],loyalty:.65,repeat:.4},
    {categories:{beauty:10,haircare:6,toothpaste:1},bands:[.2,1,3],loyalty:.4,repeat:.2},
    {categories:{baby:12,bedding:2,home:1,mosquito:.8},bands:[.6,1.5,1.5],loyalty:.7,repeat:.4},
    {categories:{drinks:14,kitchen:1,snacks:1},bands:[2,1,.4],loyalty:.6,repeat:.4},
    {categories:Object.fromEntries(categories.map(c=>[c,1])),bands:[1,1,1],loyalty:.05,repeat:.02}
  ];
  const random=randomFor(seed),mix=[.24,.2,.16,.14,.16,.1];
  function vector(orders) {
    const counts=categories.map(c=>orders.filter(i=>items[i].category===c).length/orders.length);
    const bands=[0,1,2].map(b=>orders.filter(i=>band(items[i])===b).length/orders.length);
    const repeatedBrands=orders.slice(1).filter((i,j)=>items[i].brand===items[orders[j]].brand).length/(orders.length-1);
    const repeatRate=1-new Set(orders).size/orders.length;
    return [...counts.map(x=>1.5*x),...bands.map(x=>.5*x),.25*repeatedBrands,.25*repeatRate,.3*entropy(counts)/Math.log(categories.length)];
  }
  function generateUser(u) {
    const archetype=pick(mix,random),a=archetypes[archetype];
    const catWeights=categories.map(c=>(a.categories[c]??.12)*Math.exp((random()-.5)*.6));
    const bands=a.bands.map(v=>v*Math.exp((random()-.5)*.4));
    const favouriteCat=categories[catWeights.indexOf(Math.max(...catWeights))];
    const brands=[...new Set(items.filter(p=>p.category===favouriteCat).map(p=>p.brand))];
    const favouriteBrand=brands[Math.floor(random()*brands.length)];
    // Divide by catalogue category size so catalogue expansion does not define a user's taste.
    const weights=items.map(p=>catWeights[categories.indexOf(p.category)]/items.filter(q=>q.category===p.category).length*bands[band(p)]*(p.brand===favouriteBrand?1+a.loyalty*3:1));
    const orders=[];
    for(let n=0;n<60;n++)orders.push(orders.length&&random()<a.repeat?orders[Math.floor(random()*orders.length)]:pick(weights,random));
    const events=[];
    for(let n=0;n<80;n++) {
      const i=Math.floor(random()*items.length),p=items[i];
      const affinity=catWeights[categories.indexOf(p.category)]/Math.max(...catWeights);
      const price=bands[band(p)]/Math.max(...bands);
      const want=clip(.07+(archetype===5?.38:.82)*affinity*(.55+.45*price)+(p.brand===favouriteBrand?.05:0),.04,.95);
      events.push({item_id:p.id,label:Number(random()<want)});
    }
    return {user:u,archetype,orders,events,vector:vector(orders)};
  }
  const users=Array.from({length:2000},(_,u)=>generateUser(u)),train=users.slice(0,1600),test=users.slice(1600);
  // Multiple seeded k-means++ starts; neither labels nor held-out users select the fit.
  let best;
  for(let start=0;start<6;start++) {
    const r=randomFor(seed+100+start),centres=[train[Math.floor(r()*train.length)].vector.slice()];
    while(centres.length<K) {
      const weights=train.map(u=>Math.min(...centres.map(c=>distance(u.vector,c))));
      centres.push(train[pick(weights,r)].vector.slice());
    }
    let assignments=[];
    for(let iteration=0;iteration<60;iteration++) {
      const next=train.map(u=>{const d=centres.map(c=>distance(u.vector,c));return d.indexOf(Math.min(...d));});
      if(next.every((c,i)=>c===assignments[i]))break;
      assignments=next;
      for(let k=0;k<K;k++) {
        const members=train.filter((_,i)=>assignments[i]===k);
        if(members.length)centres[k]=centres[k].map((_,j)=>sum(members.map(u=>u.vector[j]))/members.length);
      }
    }
    const error=sum(train.map((u,i)=>distance(u.vector,centres[assignments[i]])));
    if(!best||error<best.error)best={centres,assignments,error};
  }
  function describe(c) {
    const shares=c.slice(0,categories.length).map(x=>x/1.5),rank=categories.map((category,i)=>({category,p:shares[i]})).sort((a,b)=>b.p-a.p);
    const b=c.slice(categories.length,categories.length+3).map(x=>x/.5),dominant=rank[0].category;
    let id,name;
    if(Math.max(...shares)<.3){id='explorer';name='Explorer';}
    else if(dominant==='snacks'){id='snack-bargain';name='Snack-first bargain hunter';}
    else if(dominant==='drinks'){id='coffee-drinks';name='Coffee & drinks regular';}
    else if(dominant==='baby'){id='new-parent';name='New-parent essentials';}
    else if(['beauty','haircare'].includes(dominant)){id='premium-care';name=b[2]>.3?'Premium self-care':'Self-care regular';}
    else {id='household';name='Household restocker';}
    const price=['Under ₩5,000','₩5,000–19,999','₩20,000 and over'][b.indexOf(Math.max(...b))];
    return {id,name,top_traits:[id==='explorer'?`Orders across ${shares.filter(p=>p>.03).length} categories`:`${rank[0].category}: ${Math.round(rank[0].p*100)}% of orders`,`${price}: ${Math.round(Math.max(...b)*100)}% of orders`,`${Math.round(c[categories.length+4]/.25*100)}% repeat-item orders`]};
  }
  const clusters=best.centres.map((centre,k)=>({centre,...describe(centre),size_users:best.assignments.filter(a=>a===k).length}));
  // Stable, unique IDs even for an unusual/reduced catalogue that splits one category twice.
  for(let k=0;k<K;k++)if(clusters.slice(0,k).some(c=>c.id===clusters[k].id))clusters[k].id+='-'+k;
  const priors=clusters.map(c=>c.size_users/train.length);
  const exposures=Array.from({length:K},()=>items.map(()=>({n:0,yes:0})));
  const orders=Array.from({length:K},()=>items.map(()=>0));
  train.forEach((u,i)=>{const k=best.assignments[i];for(const e of u.events){const c=exposures[k][byId.get(e.item_id)];c.n++;c.yes+=e.label;}for(const p of u.orders)orders[k][p]++;});
  // Beta smoothing of item rates toward the segment's category/price-band rate.
  const rates=exposures.map(rows=>rows.map((row,i)=>{
    const related=rows.filter((_,j)=>items[j].category===items[i].category&&band(items[j])===band(items[i]));
    const mean=(sum(related.map(x=>x.yes))+1)/(sum(related.map(x=>x.n))+2);
    return clip((row.yes+8*mean)/(row.n+8),.03,.97);
  }));
  const orderRates=orders.map(row=>row.map(n=>(n+1)/(sum(row)+items.length)));
  const update=(scores,ll,weight)=>{
    // Preserve relative likelihoods; cap one observation at 0.6 log odds.
    const centre=sum(ll)/K,scale=Math.min(1,1.5/(Math.max(...ll)-Math.min(...ll)||1));
    for(let k=0;k<K;k++)scores[k]+=weight*(ll[k]-centre)*scale;
  };
  const rows=p=>clusters.map((c,k)=>({id:c.id,name:c.name,p:p[k]})).sort((a,b)=>b.p-a.p||a.id.localeCompare(b.id));
  function begin(history=[]) {
    const scores=priors.map(p=>Math.log(Math.max(p,1e-12)));let historyCount=0;
    for(const o of history)if(byId.has(o.item_id)) {const i=byId.get(o.item_id);update(scores,orderRates.map(r=>Math.log(r[i])),.35);historyCount++;}
    return {scores,before:rows(probabilities(scores)),historyCount,evidence:[],count:0};
  }
  function observe(state,event,seq) {
    const before=probabilities(state.scores);let ll=null,label,productId=event.item_id??null;
    const logWant=(id,y)=>rates.map(r=>Math.log(y?r[byId.get(id)]:1-r[byId.get(id)]));
    if(event.game==='bracket') {
      const {winner,loser}=event.pair;productId=winner;label=`Picked ${items[byId.get(winner)].name} over ${items[byId.get(loser)].name}`;
      ll=rates.map(r=>{const a=r[byId.get(winner)],b=r[byId.get(loser)];return Math.log(a*(1-b)/(a*(1-b)+b*(1-a)));});
    } else if(event.game==='budget') {
      const selected=[...event.selected_ids].sort();productId=selected[0];label=`Basket · ${event.selected_ids.length} selected items`;
      ll=clusters.map((_,k)=>sum(selected.map(id=>logWant(id,1)[k]))/selected.length);
    } else {
      const name=items[byId.get(productId)]?.name||productId;
      if(event.game==='price'&&event.stage==='guess')label=`Price guess · ${name} (no segment evidence)`;
      else if(event.label===0||event.label===1){label=`${event.label?'Want':'Nope'} · ${name}`;ll=logWant(productId,event.label);}
      else label=`Skipped · ${name} (no segment evidence)`;
    }
    if(ll){update(state.scores,ll,.4);state.count++;}
    const after=probabilities(state.scores);
    const shift=Object.fromEntries(clusters.map((c,k)=>[c.id,after[k]-before[k]]));
    const toward=Object.entries(shift).sort((a,b)=>b[1]-a[1])[0];
    state.evidence.push({event_id:event.event_id,seq,label,product_id:productId,shift,informative:!!ll,toward:ll?{segment_id:toward[0],delta_p:toward[1]}:null});
  }
  function snapshot(state) {
    const p=probabilities(state.scores),after=rows(p),normalizedEntropy=entropy(p)/Math.log(K),score=clip(1-normalizedEntropy,0,1);
    const evidenceCount=state.count+state.historyCount;
    const confidence=state.count<6||score<.2?'low':state.count<16||score<.6?'medium':'high';
    return {before:state.before.map(r=>({...r})),after,top:after[0],confidence,confidence_score:score,evidence_count:evidenceCount,game_evidence_count:state.count,history_count:state.historyCount,normalized_entropy:normalizedEntropy,evidence:state.evidence.map(e=>({...e,shift:{...e.shift},toward:e.toward&&{...e.toward}}))};
  }
  // Train-only one-to-one matching of anonymous cluster IDs to generator truth.
  const truthCounts=Array.from({length:K},()=>Array(K).fill(0));
  train.forEach((u,i)=>truthCounts[best.assignments[i]][u.archetype]++);
  let mapping,matched=-1;
  function match(prefix=[],remaining=[0,1,2,3,4,5]) {
    if(!remaining.length){const score=sum(prefix.map((a,k)=>truthCounts[k][a]));if(score>matched){matched=score;mapping=prefix;}return;}
    for(const a of remaining)match([...prefix,a],remaining.filter(x=>x!==a));
  }
  match();
  const trainingTruth=archetypes.map((_,a)=>train.filter(u=>u.archetype===a).length),majority=trainingTruth.indexOf(Math.max(...trainingTruth));
  const perArchetype=archetypes.map((_,a)=>({archetype:a,users:0,correct:0}));let correct=0,baselineCorrect=0;
  for(const u of test) {
    const s=begin();u.events.slice(0,10).forEach((e,i)=>observe(s,{...e,event_id:'heldout-'+i,game:'rapid'},i+1));
    const p=probabilities(s.scores),prediction=mapping[p.indexOf(Math.max(...p))];
    correct+=Number(prediction===u.archetype);baselineCorrect+=Number(u.archetype===majority);
    perArchetype[u.archetype].users++;perArchetype[u.archetype].correct+=Number(prediction===u.archetype);
  }
  const population={segments:clusters.map((c,k)=>({id:c.id,name:c.name,share:priors[k],top_traits:c.top_traits,size_users:c.size_users})),
    method:'Seeded k-means (k=6) on order-category/price shares, brand repeats, item repeats and category diversity; tempered Bayes updates from learned event likelihoods.',
    heldout:{accuracy:correct/test.length,baseline:baselineCorrect/test.length,events_per_user:10,users:test.length,correct,baseline_correct:baselineCorrect,target:'generator archetype',baseline_method:'training-majority archetype evaluated on held-out users',mapping:'one-to-one cluster/archetype match learned on training users only',history_used:false,per_archetype:perArchetype},
    synthetic:true,seed,population_users:train.length,generated_users:users.length,train_users:train.length,test_users:test.length,orders_per_training_user:60,training_events_per_user:80,share_basis:'training-user cluster assignments',event_temperature:.4,max_event_log_odds: .6,history_temperature:.35};
  return {begin,observe,snapshot,population:()=>structuredClone(population)};
}
