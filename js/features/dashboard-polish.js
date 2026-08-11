  function installEngagingDashboard(){
    document.head.insertAdjacentHTML('beforeend',`<style>
      #dashboard{display:grid;gap:18px}#dashboard.hidden{display:none}#dashboard>.alert{display:none!important}
      .dashboard-section-label{display:flex;align-items:center;gap:10px;margin:4px 2px -6px;color:var(--brand);font:800 13px Manrope;letter-spacing:.02em}.dashboard-section-label:after{content:"";height:1px;flex:1;background:linear-gradient(90deg,var(--line),transparent)}
      #dashboard .card{border-color:color-mix(in srgb,var(--line) 84%,transparent);box-shadow:0 7px 24px rgba(24,48,39,.045)}
      #dashboard .card:hover{border-color:color-mix(in srgb,var(--brand-2) 28%,var(--line));box-shadow:0 10px 30px rgba(24,48,39,.07)}
      #dashboard .card-note,#dashboard .sub{font-size:12px;line-height:1.45}#dashboard .card-head{gap:16px}#dashboard .card-head h2{font-size:15px}
      #dashboard .kpis{grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}#dashboard .kpi{min-height:150px;padding:19px}#dashboard .kpi-value{font-size:clamp(24px,2vw,32px);margin-top:18px}
      #dashboard .cashflow-dashboard{margin:0;padding:20px 22px}#dashboard .cashflow-head{margin-bottom:17px}#dashboard .cashflow-kpis{gap:12px}#dashboard .cashflow-kpi{padding:14px;background:color-mix(in srgb,var(--wash) 78%,var(--surface))}#dashboard .cashflow-category-list{gap:12px}#dashboard .cashflow-stack{height:13px}
      #dashboard .charts{grid-template-columns:minmax(0,1.45fr) minmax(330px,.75fr);gap:14px}#dashboard .charts>.card{min-height:315px}
      #dashboard .actions{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:start}#dashboard .actions>.card{height:auto;min-height:0}
      #dashboardUpgrade{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:0;align-items:start}#dashboardUpgrade>.card{height:auto;min-height:0}
      #dashboardPaydayBanner{grid-column:auto;display:block;background:var(--surface);color:var(--ink);border:1px solid var(--line);padding:18px;order:1}#dashboardPaydayBanner .payday-icon{width:38px;height:38px;border-radius:12px;background:var(--mint);color:var(--brand-2);float:left;margin-right:11px}#dashboardPaydayBanner>div:nth-child(2)>strong{display:block;font:800 15px Manrope;padding-top:2px}#dashboardPaydayBanner .payday-list{clear:both;display:grid;gap:8px;margin-top:17px}#dashboardPaydayBanner .payday-chip{display:block;background:var(--wash);border:1px solid var(--line);border-radius:11px;padding:9px 10px;font-size:12px;color:var(--ink)}#dashboardPaydayBanner .payday-chip strong{color:var(--brand)}
      #dashboardCalendarPreview{order:2}#dashboardTaskPreview{order:3}#dashboardCreditHealth{order:4;grid-column:span 2}#dashboardRecentActivity{order:5}#dashboardCompanyCard{display:none!important}
      #dashboardCalendarPreview,#dashboardTaskPreview,#dashboardPaydayBanner{min-height:210px}#dashboardCalendarPreview .archive-row,#dashboardTaskPreview .archive-row{padding:9px 0}#dashboardCreditHealth .credit-metric-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}#dashboardCreditHealth .credit-metric{padding:11px}#dashboardCreditHealth .credit-metric span{font-size:12px}#dashboardCreditHealth .credit-metric strong{font-size:19px}
      #dashboardRecentActivity .activity-item{padding:10px 0}.dashboard-calm-intro{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 17px;border:1px solid var(--line);border-radius:15px;background:linear-gradient(115deg,color-mix(in srgb,var(--mint) 76%,var(--surface)),var(--surface))}.dashboard-calm-intro strong{font:800 14px Manrope}.dashboard-calm-intro span{color:var(--muted);font-size:12px}.dashboard-calm-intro button{white-space:nowrap}
      @media(max-width:1350px){#dashboard .kpis{grid-template-columns:repeat(2,minmax(0,1fr))}#dashboard .charts{grid-template-columns:1fr 1fr}#dashboardUpgrade{grid-template-columns:repeat(2,minmax(0,1fr))}#dashboardCreditHealth{grid-column:1/-1}#dashboardRecentActivity{grid-column:1/-1}}
      @media(max-width:860px){#dashboard .charts,#dashboard .actions,#dashboardUpgrade{grid-template-columns:1fr}#dashboardCreditHealth,#dashboardRecentActivity{grid-column:auto}#dashboard .cashflow-category{grid-template-columns:115px minmax(100px,1fr);gap:8px}#dashboard .cashflow-values{grid-column:2;text-align:left}.dashboard-calm-intro{align-items:flex-start;flex-direction:column}}
      @media(max-width:560px){#dashboard .kpis{grid-template-columns:1fr}#dashboard .kpi{min-height:0}#dashboard .cashflow-kpis{grid-template-columns:1fr}#dashboard .cashflow-head{align-items:flex-start;flex-direction:column}#dashboard .cashflow-head select{width:100%}}
    </style>`);
    const dashboard=$('#dashboard');
    const addSectionLabel=(before,id,label)=>{if(!before)return;let heading=$('#'+id);if(!heading){heading=document.createElement('div');heading.id=id;heading.className='dashboard-section-label';heading.textContent=label}if(heading.nextElementSibling!==before)before.before(heading)};
    const polishDashboard=()=>{
      dashboard.querySelector(':scope > .alert')?.remove();
      $('#dashboardCompanyCard')?.remove();
      let intro=$('#dashboardCalmIntro');
      if(!intro){intro=document.createElement('div');intro.id='dashboardCalmIntro';intro.className='dashboard-calm-intro';intro.innerHTML='<div><strong>Your household at a glance</strong><br><span>Alerts and items needing attention are collected under the notification bell.</span></div><button class="secondary-btn" id="dashboardOpenAlerts">Review alerts</button>';dashboard.prepend(intro)}
      $('#dashboardOpenAlerts').onclick=()=>setPage('Alerts');
      const kpis=dashboard.querySelector('.kpis'),cash=dashboard.querySelector('.cashflow-dashboard,.cash'),charts=dashboard.querySelector('.charts'),actions=dashboard.querySelector('.actions'),upgrade=$('#dashboardUpgrade'),payday=$('#dashboardPaydayBanner');
      addSectionLabel(kpis,'dashboardFinancialLabel','Financial picture');
      addSectionLabel(cash,'dashboardCashflowLabel','This month');
      addSectionLabel(charts,'dashboardTrendsLabel','Trends & outlook');
      addSectionLabel(actions,'dashboardPlanningLabel','Planning & progress');
      addSectionLabel(upgrade,'dashboardHouseholdLabel','Household at a glance');
      if(payday&&upgrade){payday.classList.remove('payday-banner');payday.classList.add('payday-tile');upgrade.prepend(payday);const title=payday.querySelector('div:nth-child(2)>strong');if(title)title.textContent='Next paydays'}
      if(upgrade){const desired=[$('#dashboardPaydayBanner'),$('#dashboardCalendarPreview'),$('#dashboardTaskPreview'),$('#dashboardCreditHealth'),$('#dashboardRecentActivity')].filter(Boolean);desired.forEach(card=>upgrade.append(card))}
      lucide.createIcons()
    };
    const observer=new MutationObserver(records=>{if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&node.id==='dashboardCompanyCard')))requestAnimationFrame(polishDashboard)});
    observer.observe(dashboard,{childList:true,subtree:true});
    const priorSetPage=setPage;
    setPage=function(page){priorSetPage(page);if(page==='Dashboard')requestAnimationFrame(polishDashboard)};
    $$('#nav button').forEach(button=>button.onclick=()=>setPage(button.dataset.page));
    polishDashboard();
  }
  installEngagingDashboard();
