  window.addEventListener('resize',()=>{clearTimeout(window.chartTimer);window.chartTimer=setTimeout(drawCharts,100)});
  CoreValleyModules.register('Dashboard',()=>{renderAccounts();renderRsuDashboard();requestAnimationFrame(drawCharts)});
  CoreValleyModules.register('Bank Accounts',()=>{state.accountView='bank';renderAccounts()});
  CoreValleyModules.register('Credit Cards',()=>{state.accountView='cards';renderAccounts()});
  CoreValleyModules.register('Loans',()=>renderInventoriesV2());
  setPage(state.activePage);lucide.createIcons();
