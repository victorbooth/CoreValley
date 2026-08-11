(()=>{
  const slugify=value=>value.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const explicitRoutes={
    'Dashboard':'dashboard','Bank Accounts':'bank-accounts','Credit Cards':'credit-cards','Loans':'loans',
    'Subscriptions':'subscriptions','Utilities':'utilities','Charitable Donations':'charitable-donations',
    'Debt Payoff Simulator':'debt-payoff','Investments':'investments','ESPP':'espp','Insurance':'insurance','Physical Assets':'physical-assets',
    'Funding Goals':'funding-goals','Calendar':'calendar','Contracts & Warranties':'contracts-warranties',
    'To-Do List':'to-do','Companies':'companies','Rolodex':'rolodex','History':'history','Settings':'settings','Alerts':'alerts'
  };
  const pageForSlug=new Map(Object.entries(explicitRoutes).map(([page,slug])=>[slug,page]));
  const alwaysRefresh=new Set(['Dashboard','Alerts','History','Calendar','Physical Assets','Rolodex']);
  const pageTargets={
    'Dashboard':'#dashboard','Bank Accounts':'#accountsPage','Credit Cards':'#accountsPage','Loans':'#loansPage',
    'Debt Payoff Simulator':'#payoffPage','Investments':'#investmentsPage','ESPP':'#esppPage','Insurance':'#insurancePage','Physical Assets':'#physicalAssetsPage',
    'Subscriptions':'#subscriptionsPage','Utilities':'#utilitiesPage','Charitable Donations':'#donationsPage',
    'Funding Goals':'#fundingGoalsPage','Calendar':'#calendarPage','Contracts & Warranties':'#documentsPage','To-Do List':'#tasksPage',
    'Companies':'#companiesPage','Rolodex':'#rolodexPage','History':'#historyPage','Settings':'#settingsPage','Alerts':'#alertsPage'
  };
  const pageTitles={'Dashboard':'Household overview','ESPP':'ESPP + Line of Credit','Companies':'Household Companies & Trusts','Alerts':'Household Alerts'};
  const routeInfo=()=>{const parts=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean),page=pageForSlug.get(parts[0])||null;return{page,parts,assetId:parts[0]==='physical-assets'&&parts[1]?decodeURIComponent(parts[1]):'',contactId:parts[0]==='rolodex'&&parts[1]==='contact'&&parts[2]?decodeURIComponent(parts[2]):''}};
  const pageFromHash=()=>routeInfo().page;
  const routeForPage=page=>explicitRoutes[page]||slugify(page);
  const activateShell=page=>{
    const selectors=[...new Set(Object.values(pageTargets))];
    selectors.forEach(selector=>{
      const element=$(selector);if(!element)return;
      if(selector==='#dashboard')element.classList.add('hidden');else element.classList.remove('active');
    });
    $('#placeholder')?.classList.remove('active');
    const selector=pageTargets[page],target=selector&&$(selector);
    if(target){if(selector==='#dashboard')target.classList.remove('hidden');else target.classList.add('active')}
    $$('#nav button[data-page]').forEach(button=>button.classList.toggle('active',button.dataset.page===page));
    $('#pageTitle').textContent=pageTitles[page]||page;
    document.body.classList.toggle('dashboard-active',page==='Dashboard');
    $('#sidebar').classList.remove('open');
    state.activePage=page;
  };
  const renderRoute=()=>{
    const renderStarted=Date.now();
    const info=routeInfo(),page=info.page||state.activePage||'Dashboard';
    if(page==='Physical Assets'){state.physicalAssetDetailId=info.assetId||'';if(info.assetId){const asset=state.assets.find(item=>item.id===info.assetId);if(asset)state.physicalAssetView=asset.categoryId||state.physicalAssetView}}
    if(page==='Rolodex'){state.rolodexRouteContactId=info.contactId||'';if(info.contactId)state.rolodexView='contacts';const search=$('#rolodexSearch'),contact=state.rolodexContacts?.find(item=>item.id===info.contactId);if(search)search.value=contact?[contact.firstName,contact.lastName].filter(Boolean).join(' '):''}
    const mounted=CoreValleyModules.mount(page);
    if(!mounted&&(alwaysRefresh.has(page)||info.assetId||info.contactId))CoreValleyModules.refresh(page);
    activateShell(page);
    enhanceDeepLinks();
    document.documentElement.dataset.route=routeForPage(page);
    document.documentElement.dataset.routeShellMs=String(Date.now()-renderStarted);
    document.documentElement.dataset.routeClickToShellMs=String(window.__coreValleyRouteClickAt?Date.now()-window.__coreValleyRouteClickAt:0);
  };
  const enhanceDeepLinks=()=>{
    $$('#rolodexBody .rolodex-contact-card').forEach(card=>{if(card.querySelector('[data-route-contact]'))return;const edit=card.querySelector('[data-edit-rolodex-contact]');if(!edit)return;const button=document.createElement('button');button.className='primary-btn';button.dataset.routeContact=edit.dataset.editRolodexContact;button.textContent='Open contact';edit.before(button)});
    $$('img:not([loading])').forEach(image=>{image.loading='lazy';image.decoding='async'});
  };
  let initialRoutePending=!!pageFromHash();
  window.setPage=page=>{
    if(initialRoutePending){initialRoutePending=false;renderRoute();return}
    const next='#/'+routeForPage(page);
    if(location.hash===next)renderRoute();
    else location.hash=next;
  };
  window.CoreValleyRouter={navigate:window.setPage,current:pageFromHash,routes:{...explicitRoutes},refresh(page=pageFromHash()){if(page)CoreValleyModules.refresh(page)}};
  addEventListener('hashchange',renderRoute);
  $('#nav').addEventListener('click',event=>{
    const button=event.target.closest('button[data-page]');
    if(!button)return;
    window.__coreValleyRouteClickAt=Date.now();
    event.preventDefault();
    event.stopImmediatePropagation();
    window.setPage(button.dataset.page);
  },true);
  document.addEventListener('click',event=>{
    const contact=event.target.closest('[data-route-contact]');if(contact){location.hash='#/rolodex/contact/'+encodeURIComponent(contact.dataset.routeContact);return}
    const asset=event.target.closest('[data-open-asset-detail],[data-search-open-asset]');if(asset){const id=asset.dataset.openAssetDetail||asset.dataset.searchOpenAsset;setTimeout(()=>location.hash='#/physical-assets/'+encodeURIComponent(id),0);return}
    if(event.target.closest('#assetDetailBack'))setTimeout(()=>location.hash='#/physical-assets',0);
  });
  const rolodexBody=$('#rolodexBody');if(rolodexBody)new MutationObserver(()=>requestAnimationFrame(enhanceDeepLinks)).observe(rolodexBody,{childList:true,subtree:false});
  if(!pageFromHash())history.replaceState(null,'','#/'+routeForPage(state.activePage||'Dashboard'));
})();
