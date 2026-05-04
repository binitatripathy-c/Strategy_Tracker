import { useState, useEffect, useCallback } from "react";

const DEFAULT_PEOPLE = ["Person 1","Person 2","Person 3","Person 4","Person 5","Person 6"];
const DEFAULT_PROJECTS = ["Project A","Project B","Project C","Project D","Project E","Project F","Project G","Project H","Project I","Project J"];
const STAGES = ["MSA & Advance","Brief Doc","Briefing Call","3C","Strategy Deck","Strategy Presentation","Handover to Content","Content Strategy","Refinement","Presentation"];

const SEED = [
  {id:"s1",date:"23-Apr-25",name:"Person 1",project:"Project A",stage:"MSA & Advance",grade:5},
  {id:"s2",date:"24-Apr-25",name:"Person 2",project:"Project B",stage:"MSA & Advance",grade:3},
  {id:"s3",date:"24-Apr-25",name:"Person 3",project:"Project C",stage:"Brief Doc",grade:2},
  {id:"s4",date:"25-Apr-25",name:"Person 1",project:"Project A",stage:"Brief Doc",grade:4},
  {id:"s5",date:"25-Apr-25",name:"Person 2",project:"Project B",stage:"Briefing Call",grade:5},
  {id:"s6",date:"26-Apr-25",name:"Person 3",project:"Project C",stage:"Brief Doc",grade:5},
  {id:"s7",date:"26-Apr-25",name:"Person 1",project:"Project A",stage:"Briefing Call",grade:3},
  {id:"s8",date:"27-Apr-25",name:"Person 2",project:"Project B",stage:"3C",grade:2},
  {id:"s9",date:"27-Apr-25",name:"Person 3",project:"Project C",stage:"Briefing Call",grade:4},
  {id:"s10",date:"29-Apr-25",name:"Person 1",project:"Project A",stage:"3C",grade:1},
];

function fmtDate(d=new Date()){
  return d.getDate()+"-"+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]+"-"+String(d.getFullYear()).slice(2);
}
function gradeColor(g){
  if(g===5) return {bg:"#C0DD97",fg:"#27500A"};
  if(g>=3)  return {bg:"#EAF3DE",fg:"#3B6D11"};
  if(g>=1)  return {bg:"#FAEEDA",fg:"#854F0B"};
  return {bg:"#FCEBEB",fg:"#A32D2D"};
}
function statusBadge(avg){
  if(avg===null) return {label:"No data",bg:"#F1EFE8",fg:"#5F5E5A"};
  if(avg>=4.8)   return {label:"Done",bg:"#C0DD97",fg:"#27500A"};
  if(avg>=3)     return {label:"On Track",bg:"#EAF3DE",fg:"#3B6D11"};
  if(avg>=1)     return {label:"In Progress",bg:"#FAEEDA",fg:"#854F0B"};
  return {label:"Just Started",bg:"#FCEBEB",fg:"#A32D2D"};
}
function bwBadge(inProg){
  if(inProg===0)  return {label:"Available",bg:"#E6F1FB",fg:"#185FA5"};
  if(inProg<=2)   return {label:"Healthy",bg:"#EAF3DE",fg:"#3B6D11"};
  if(inProg===3)  return {label:"At Capacity",bg:"#FAEEDA",fg:"#854F0B"};
  return {label:"Overloaded",bg:"#FCEBEB",fg:"#A32D2D"};
}

function Badge({label,bg,fg}){
  return <span style={{background:bg,color:fg,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>;
}
function GradePill({grade}){
  const {bg,fg}=gradeColor(grade);
  return <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:26,height:26,borderRadius:"50%",background:bg,color:fg,fontWeight:700,fontSize:12}}>{grade}</span>;
}
function Avatar({name,people}){
  const initials=name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const cols=["#E6F1FB","#EAF3DE","#FAEEDA","#FCEBEB","#EEEDFE","#F1EFE8","#E1F5EE","#FBEAF0"];
  const fgs=["#0C447C","#27500A","#633806","#791F1F","#3C3489","#444441","#085041","#72243E"];
  const idx=Math.max(0,(people||DEFAULT_PEOPLE).indexOf(name))%cols.length;
  return <div style={{width:32,height:32,borderRadius:"50%",background:cols[idx],color:fgs[idx],display:"flex",alignItems:"center",justifyContent:"center",fontWeight:600,fontSize:12,flexShrink:0}}>{initials}</div>;
}
function ProgressBar({value}){
  const pct=Math.round((value/5)*100);
  const {bg}=gradeColor(Math.round(value));
  return(
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{flex:1,height:6,borderRadius:3,background:"#F1EFE8",overflow:"hidden"}}>
        <div style={{height:"100%",width:pct+"%",background:bg,borderRadius:3,transition:"width 0.4s"}}/>
      </div>
      <span style={{fontSize:11,fontWeight:600,color:"#5F5E5A",minWidth:30,textAlign:"right"}}>{pct}%</span>
    </div>
  );
}
function SLabel({children}){
  return <div style={{fontSize:11,fontWeight:600,color:"#8A94A6",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>{children}</div>;
}
function Dropdown({value,onChange,options,placeholder}){
  return(
    <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",height:40,borderRadius:8,border:"1px solid #E2E5EF",padding:"0 32px 0 12px",fontSize:13,color:value?"#1A1A2E":"#8A94A6",background:"#F5F6FA",appearance:"none",backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238A94A6' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center",outline:"none"}}>
      <option value="">{placeholder||"Select..."}</option>
      {options.map(o=><option key={o}>{o}</option>)}
    </select>
  );
}
function TagList({items,onRemove,bg,fg}){
  return(
    <div style={{display:"flex",flexWrap:"wrap",gap:6,minHeight:32}}>
      {items.map(item=>(
        <div key={item} style={{display:"flex",alignItems:"center",gap:4,background:bg,color:fg,borderRadius:6,padding:"4px 10px",fontSize:12,fontWeight:500}}>
          {item}
          <button onClick={()=>onRemove(item)} style={{background:"none",border:"none",cursor:"pointer",color:fg,fontSize:16,lineHeight:1,padding:"0 0 0 4px",opacity:0.5,marginTop:-1}}>&times;</button>
        </div>
      ))}
      {items.length===0&&<span style={{fontSize:12,color:"#B4B2A9",fontStyle:"italic"}}>None yet</span>}
    </div>
  );
}
function AddRow({placeholder,onAdd,label}){
  const [v,setV]=useState("");
  function go(){const t=v.trim();if(!t)return;onAdd(t);setV("");}
  return(
    <div style={{display:"flex",gap:8,marginTop:12}}>
      <input value={v} onChange={e=>setV(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder={placeholder} style={{flex:1,height:38,borderRadius:8,border:"1px solid #E2E5EF",padding:"0 12px",fontSize:13,background:"#F5F6FA",outline:"none",color:"#1A1A2E"}}/>
      <button onClick={go} style={{height:38,padding:"0 16px",borderRadius:8,border:"none",background:"#1B2A4A",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>{label||"Add"}</button>
    </div>
  );
}
function StageMatrix({entries,people}){
  const active=people.filter(p=>entries.find(e=>e.name===p));
  if(!active.length) return <div style={{color:"#8A94A6",fontSize:13,padding:"12px 0"}}>No data yet — entries will appear here once logged.</div>;
  return(
    <div style={{overflowX:"auto"}}>
      <table style={{borderCollapse:"collapse",fontSize:11,tableLayout:"fixed",minWidth:"100%"}}>
        <thead>
          <tr>
            <th style={{padding:"8px 10px",textAlign:"left",background:"#1B2A4A",color:"#fff",fontWeight:600,width:90,borderRadius:"8px 0 0 0"}}>Person</th>
            {STAGES.map(s=><th key={s} style={{padding:"8px 4px",textAlign:"center",background:"#1B2A4A",color:"#fff",fontWeight:500,fontSize:10,width:55}}>{s.slice(0,9)}</th>)}
          </tr>
        </thead>
        <tbody>
          {active.map((p,pi)=>{
            const pe=entries.filter(e=>e.name===p);
            return(
              <tr key={p} style={{background:pi%2===0?"#F5F6FA":"#fff"}}>
                <td style={{padding:"8px 10px",fontWeight:600,fontSize:12,color:"#1B2A4A",borderBottom:"0.5px solid #E2E5EF"}}>{p}</td>
                {STAGES.map(s=>{
                  const se=pe.filter(e=>e.stage===s);
                  const avg=se.length?se.reduce((a,e)=>a+e.grade,0)/se.length:null;
                  const {bg,fg}=avg!==null?gradeColor(Math.round(avg)):{bg:"#F1EFE8",fg:"#B4B2A9"};
                  return(
                    <td key={s} style={{padding:"5px",textAlign:"center",borderBottom:"0.5px solid #E2E5EF"}}>
                      {avg!==null
                        ?<span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:28,height:28,borderRadius:6,background:bg,color:fg,fontWeight:700,fontSize:12}}>{avg.toFixed(1)}</span>
                        :<span style={{color:"#D3D1C7",fontSize:12}}>—</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function App(){
  const [tab,setTab]=useState("log");
  const [entries,setEntries]=useState(SEED);
  const [people,setPeople]=useState(DEFAULT_PEOPLE);
  const [projects,setProjects]=useState(DEFAULT_PROJECTS);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [settingsSaved,setSettingsSaved]=useState(false);

  const [name,setName]=useState("");
  const [project,setProject]=useState("");
  const [stage,setStage]=useState("");
  const [grade,setGrade]=useState(null);
  const [filterPerson,setFilterPerson]=useState("All");
  const [filterProject,setFilterProject]=useState("All");

  const [editPeople,setEditPeople]=useState(DEFAULT_PEOPLE);
  const [editProjects,setEditProjects]=useState(DEFAULT_PROJECTS);

  useEffect(()=>{
    (async()=>{
      try{
        const [re,rp,rpr]=await Promise.allSettled([
          window.storage.get("trk_entries",true),
          window.storage.get("trk_people",true),
          window.storage.get("trk_projects",true),
        ]);
        if(re.status==="fulfilled"&&re.value?.value){const d=JSON.parse(re.value.value);if(d?.length)setEntries(d);}
        if(rp.status==="fulfilled"&&rp.value?.value){const d=JSON.parse(rp.value.value);if(d?.length){setPeople(d);setEditPeople(d);}}
        if(rpr.status==="fulfilled"&&rpr.value?.value){const d=JSON.parse(rpr.value.value);if(d?.length){setProjects(d);setEditProjects(d);}}
      }catch(e){}
      setLoading(false);
    })();
  },[]);

  const persist=useCallback(async(e,p,pr)=>{
    try{await Promise.all([
      window.storage.set("trk_entries",JSON.stringify(e),true),
      window.storage.set("trk_people",JSON.stringify(p),true),
      window.storage.set("trk_projects",JSON.stringify(pr),true),
    ]);}catch(err){}
  },[]);

  function submitLog(){
    if(!name||!project||!stage||grade===null)return;
    setSaving(true);
    const entry={id:"e"+Date.now(),date:fmtDate(),name,project,stage,grade};
    const next=[entry,...entries];
    setEntries(next);
    persist(next,people,projects).then(()=>{setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2500);});
    setName("");setProject("");setStage("");setGrade(null);
  }

  function saveSettings(){
    const p=editPeople.filter(Boolean);
    const pr=editProjects.filter(Boolean);
    setPeople(p);setProjects(pr);
    persist(entries,p,pr).then(()=>{setSettingsSaved(true);setTimeout(()=>setSettingsSaved(false),2500);});
  }

  const ready=name&&project&&stage&&grade!==null;
  const filteredLog=entries.filter(e=>(filterPerson==="All"||e.name===filterPerson)&&(filterProject==="All"||e.project===filterProject));
  const activeProjects=projects.filter(p=>entries.find(e=>e.project===p));
  const noDataProjects=projects.filter(p=>!entries.find(e=>e.project===p));
  const projectStats=activeProjects.map(p=>{
    const pe=entries.filter(e=>e.project===p);
    const avg=pe.reduce((a,e)=>a+e.grade,0)/pe.length;
    return{project:p,avg,lastDate:pe[0].date,lastStage:pe[0].stage,lastGrade:pe[0].grade,team:[...new Set(pe.map(e=>e.name))]};
  });
  const peopleStats=people.map(p=>{
    const pe=entries.filter(e=>e.name===p);
    const total=pe.length,inProg=pe.filter(e=>e.grade>0&&e.grade<5).length,done=pe.filter(e=>e.grade===5).length;
    const avg=total?pe.reduce((a,e)=>a+e.grade,0)/total:null;
    return{name:p,total,inProg,done,avg,prjs:[...new Set(pe.map(e=>e.project))]};
  });

  const TABS=[["log","Log"],["projects","Projects"],["people","People"],["settings","Settings"]];
  const statusMsg=saving?"Saving...":saved||settingsSaved?"Saved for everyone":null;

  return(
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",color:"#1A1A2E",minHeight:"100vh",background:"#F5F6FA"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>

      <div style={{background:"#1B2A4A",padding:"0 20px",display:"flex",alignItems:"center",height:52,gap:10}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:"#C0DD97",flexShrink:0}}/>
        <span style={{fontSize:15,fontWeight:600,color:"#fff"}}>Strategy Tracker</span>
        <span style={{fontSize:11,color:"rgba(255,255,255,0.35)"}}>shared workspace</span>
        {statusMsg&&<span style={{marginLeft:"auto",fontSize:11,color:saved||settingsSaved?"#C0DD97":"rgba(255,255,255,0.5)",fontWeight:500}}>{statusMsg}</span>}
      </div>

      <div style={{background:"#fff",borderBottom:"0.5px solid #E2E5EF",display:"flex",padding:"0 16px"}}>
        {TABS.map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"12px 16px",fontSize:13,fontWeight:500,cursor:"pointer",background:"none",border:"none",borderBottom:tab===t?"2px solid #0B6E6E":"2px solid transparent",color:tab===t?"#0B6E6E":"#8A94A6",transition:"color 0.15s"}}>
            {l}
          </button>
        ))}
      </div>

      <div style={{maxWidth:780,margin:"0 auto",padding:"20px 16px"}}>

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:10,marginBottom:20}}>
          {[["Total logs",entries.length],["People",people.length],["Projects",projects.length],["Stages done",entries.filter(e=>e.grade===5).length]].map(([l,v])=>(
            <div key={l} style={{background:"#fff",borderRadius:10,border:"0.5px solid #E2E5EF",padding:"12px 14px"}}>
              <div style={{fontSize:11,fontWeight:600,color:"#8A94A6",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>{l}</div>
              <div style={{fontSize:22,fontWeight:600,color:"#1B2A4A"}}>{v}</div>
            </div>
          ))}
        </div>

        {/* LOG */}
        {tab==="log"&&<>
          <div style={{background:"#fff",borderRadius:12,border:"0.5px solid #E2E5EF",padding:20,marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:600,color:"#1B2A4A",marginBottom:16}}>Today's update</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><SLabel>Your name</SLabel><Dropdown value={name} onChange={setName} options={people}/></div>
              <div><SLabel>Project</SLabel><Dropdown value={project} onChange={setProject} options={projects}/></div>
            </div>
            <div style={{marginBottom:14}}><SLabel>Stage</SLabel><Dropdown value={stage} onChange={setStage} options={STAGES}/></div>
            <div style={{marginBottom:16}}>
              <SLabel>Grade</SLabel>
              <div style={{display:"flex",gap:8}}>
                {[0,1,2,3,4,5].map(g=>{
                  const sel=grade===g;const{bg,fg}=gradeColor(g);
                  return <button key={g} onClick={()=>setGrade(g)} style={{width:42,height:42,borderRadius:8,border:sel?"2px solid "+fg:"1.5px solid #E2E5EF",background:sel?bg:"#F5F6FA",color:sel?fg:"#8A94A6",fontWeight:700,fontSize:14,cursor:"pointer",transition:"all 0.15s",flexShrink:0}}>{g}</button>;
                })}
              </div>
              <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
                {[["0","Not started"],["1","20%"],["2","40%"],["3","60%"],["4","80%"],["5","Done"]].map(([g,l])=>(
                  <span key={g} style={{fontSize:10,color:"#8A94A6",background:"#F5F6FA",borderRadius:4,padding:"2px 6px"}}>{g} = {l}</span>
                ))}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <button onClick={submitLog} disabled={!ready||saving} style={{height:40,padding:"0 24px",borderRadius:8,border:"none",background:ready?"#1B2A4A":"#D3D1C7",color:"#fff",fontSize:13,fontWeight:600,cursor:ready?"pointer":"not-allowed",transition:"background 0.15s"}}>
                {saving?"Saving...":"Log it"}
              </button>
              {saved&&<span style={{fontSize:12,color:"#0B6E6E",fontWeight:500}}>Saved — visible to everyone</span>}
            </div>
          </div>

          <div style={{background:"#fff",borderRadius:12,border:"0.5px solid #E2E5EF",padding:20}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}>
              <div style={{fontSize:13,fontWeight:600,color:"#1B2A4A"}}>Recent entries</div>
              <div style={{display:"flex",gap:8}}>
                <select value={filterPerson} onChange={e=>setFilterPerson(e.target.value)} style={{height:32,borderRadius:6,border:"0.5px solid #E2E5EF",padding:"0 8px",fontSize:12,background:"#F5F6FA",outline:"none",color:"#1A1A2E"}}>
                  <option>All</option>{people.map(p=><option key={p}>{p}</option>)}
                </select>
                <select value={filterProject} onChange={e=>setFilterProject(e.target.value)} style={{height:32,borderRadius:6,border:"0.5px solid #E2E5EF",padding:"0 8px",fontSize:12,background:"#F5F6FA",outline:"none",color:"#1A1A2E"}}>
                  <option>All</option>{projects.map(p=><option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            {loading?<div style={{textAlign:"center",padding:32,color:"#8A94A6"}}>Loading...</div>:filteredLog.length===0?<div style={{textAlign:"center",padding:32,color:"#8A94A6",fontSize:13}}>No entries yet</div>:(
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,tableLayout:"fixed"}}>
                  <thead>
                    <tr style={{background:"#0B6E6E"}}>
                      {[["Date",80],["Name",110],["Project",110],["Stage",160],["Grade",60]].map(([h,w])=>(
                        <th key={h} style={{padding:"8px 10px",textAlign:h==="Grade"?"center":"left",color:"#fff",fontWeight:600,fontSize:11,width:w}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLog.slice(0,30).map((e,i)=>(
                      <tr key={e.id} style={{background:i%2===0?"#F5F6FA":"#fff"}}>
                        <td style={{padding:"9px 10px",borderBottom:"0.5px solid #E2E5EF",color:"#8A94A6",fontSize:11}}>{e.date}</td>
                        <td style={{padding:"9px 10px",borderBottom:"0.5px solid #E2E5EF"}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}><Avatar name={e.name} people={people}/><span style={{fontSize:12,fontWeight:500}}>{e.name}</span></div>
                        </td>
                        <td style={{padding:"9px 10px",borderBottom:"0.5px solid #E2E5EF",fontWeight:500,fontSize:12}}>{e.project}</td>
                        <td style={{padding:"9px 10px",borderBottom:"0.5px solid #E2E5EF",color:"#8A94A6",fontSize:11}}>{e.stage}</td>
                        <td style={{padding:"9px 10px",borderBottom:"0.5px solid #E2E5EF",textAlign:"center"}}><GradePill grade={e.grade}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>}

        {/* PROJECTS */}
        {tab==="projects"&&<>
          {projectStats.map(p=>{
            const st=statusBadge(p.avg);
            return(
              <div key={p.project} style={{background:"#fff",borderRadius:12,border:"0.5px solid #E2E5EF",padding:16,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12,gap:8,flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:600,color:"#1B2A4A"}}>{p.project}</div>
                    <div style={{fontSize:11,color:"#8A94A6",marginTop:2}}>Last: {p.lastDate} · {p.lastStage}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><GradePill grade={p.lastGrade}/><Badge {...st}/></div>
                </div>
                <ProgressBar value={p.avg}/>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:10,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,color:"#8A94A6"}}>Team:</span>
                  {p.team.map(person=><Avatar key={person} name={person} people={people}/>)}
                  <span style={{fontSize:11,color:"#8A94A6",marginLeft:4}}>Avg: <strong style={{color:"#1B2A4A"}}>{p.avg.toFixed(1)}</strong></span>
                </div>
              </div>
            );
          })}
          {noDataProjects.map(p=>(
            <div key={p} style={{background:"#fff",borderRadius:12,border:"0.5px solid #E2E5EF",padding:16,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:14,fontWeight:600,color:"#1B2A4A"}}>{p}</span>
              <Badge label="No data yet" bg="#F1EFE8" fg="#5F5E5A"/>
            </div>
          ))}
        </>}

        {/* PEOPLE */}
        {tab==="people"&&<>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10,marginBottom:16}}>
            {peopleStats.map(p=>{
              const bw=bwBadge(p.inProg);
              return(
                <div key={p.name} style={{background:"#fff",borderRadius:12,border:"0.5px solid #E2E5EF",padding:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                    <Avatar name={p.name} people={people}/>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:"#1B2A4A"}}>{p.name}</div>
                      <div style={{fontSize:11,color:"#8A94A6"}}>{p.prjs.length} project{p.prjs.length!==1?"s":""}</div>
                    </div>
                    <div style={{marginLeft:"auto"}}><Badge {...bw}/></div>
                  </div>
                  {p.avg!==null&&<ProgressBar value={p.avg}/>}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:12}}>
                    {[["Logs",p.total,"#E6F1FB","#0C447C"],["In prog.",p.inProg,"#FAEEDA","#854F0B"],["Done",p.done,"#EAF3DE","#27500A"]].map(([l,v,bg,fg])=>(
                      <div key={l} style={{background:bg,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                        <div style={{fontSize:11,color:fg,fontWeight:500}}>{l}</div>
                        <div style={{fontSize:18,fontWeight:700,color:fg}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{background:"#fff",borderRadius:12,border:"0.5px solid #E2E5EF",padding:20}}>
            <div style={{fontSize:13,fontWeight:600,color:"#1B2A4A",marginBottom:12}}>Stage breakdown — avg grade per person</div>
            <StageMatrix entries={entries} people={people}/>
          </div>
        </>}

        {/* SETTINGS */}
        {tab==="settings"&&<div style={{display:"grid",gap:16}}>

          <div style={{background:"#fff",borderRadius:12,border:"0.5px solid #E2E5EF",padding:20}}>
            <div style={{fontSize:14,fontWeight:600,color:"#1B2A4A",marginBottom:2}}>Team members</div>
            <div style={{fontSize:12,color:"#8A94A6",marginBottom:14}}>Add or remove people. Updates the name dropdown for everyone instantly after saving.</div>
            <TagList items={editPeople} onRemove={p=>setEditPeople(ep=>ep.filter(x=>x!==p))} bg="#E6F1FB" fg="#0C447C"/>
            <AddRow placeholder="Full name, then press Enter..." onAdd={p=>{if(!editPeople.includes(p))setEditPeople(ep=>[...ep,p]);}} label="Add person"/>
          </div>

          <div style={{background:"#fff",borderRadius:12,border:"0.5px solid #E2E5EF",padding:20}}>
            <div style={{fontSize:14,fontWeight:600,color:"#1B2A4A",marginBottom:2}}>Projects</div>
            <div style={{fontSize:12,color:"#8A94A6",marginBottom:14}}>Add new projects as they come in. Remove completed ones to keep the list clean.</div>
            <TagList items={editProjects} onRemove={p=>setEditProjects(ep=>ep.filter(x=>x!==p))} bg="#EAF3DE" fg="#3B6D11"/>
            <AddRow placeholder="Project name, then press Enter..." onAdd={p=>{if(!editProjects.includes(p))setEditProjects(ep=>[...ep,p]);}} label="Add project"/>
          </div>

          <div style={{background:"#1B2A4A",borderRadius:12,padding:20,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"#fff"}}>Save changes</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.45)",marginTop:2}}>Updates dropdowns for all teammates immediately</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              {settingsSaved&&<span style={{fontSize:12,color:"#C0DD97",fontWeight:500}}>Saved for everyone</span>}
              <button onClick={saveSettings} style={{height:40,padding:"0 24px",borderRadius:8,border:"none",background:"#C0DD97",color:"#27500A",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                Save settings
              </button>
            </div>
          </div>

          <div style={{background:"#fff",borderRadius:12,border:"0.5px solid #E2E5EF",padding:20}}>
            <div style={{fontSize:14,fontWeight:600,color:"#1B2A4A",marginBottom:10}}>How to share with your team</div>
            <div style={{display:"grid",gap:10}}>
              {[["1","Click the share icon","Top right corner of this artifact panel in Claude"],["2","Copy the link","It looks like claude.ai/artifacts/..."],["3","Send it","Anyone with the link can log entries and see all data"],["4","Add projects anytime","Come to Settings, add the project, hit Save — it appears for everyone immediately"]].map(([n,title,desc])=>(
                <div key={n} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:"#1B2A4A",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0,marginTop:1}}>{n}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:"#1B2A4A"}}>{title}</div>
                    <div style={{fontSize:12,color:"#8A94A6",marginTop:1}}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>}

      </div>
    </div>
  );
}
