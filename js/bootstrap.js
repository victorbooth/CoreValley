  window.addEventListener('resize',()=>{clearTimeout(window.chartTimer);window.chartTimer=setTimeout(drawCharts,100)});
  setPage(state.activePage); renderAccounts(); lucide.createIcons(); drawCharts();
