  function installPropertyAndVehicleDetailPages(){
    const supportedCategories=new Set(['real-estate','vehicles']);
    const escDetail=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    const detailAsset=id=>state.assets.find(asset=>asset.id===id&&supportedCategories.has(asset.categoryId));
    const latestValue=asset=>Number((asset.valuationHistory||[]).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0]?.amount??asset.value??0);
    const linkedLoan=asset=>state.loans.find(loan=>loan.assetId===asset.id);
    const assetLabel=asset=>asset.categoryId==='real-estate'?(asset.details?.address||asset.name):[asset.details?.year,asset.details?.make,asset.details?.model].filter(Boolean).join(' ')||asset.name;
    state.physicalAssetDetailId=state.physicalAssetDetailId||'';

    const physicalPage=$('#physicalAssetsPage');
    const detailView=document.createElement('div');
    detailView.id='physicalAssetDetailView';
    detailView.className='asset-detail-view';
    $('#assetCategoryView').after(detailView);

    document.body.insertAdjacentHTML('beforeend',`<div class="modal-backdrop" id="taskAssetModal"><div class="modal modal-sm"><div class="modal-head"><div><h2>Attach Task to Property or Vehicle</h2><div class="card-note">Choose where this work needs to be completed. The task will appear on that asset's detail page.</div></div><button class="close-btn" type="button" data-close-task-asset>×</button></div><div class="asset-choice-list" id="taskAssetChoices"></div><div class="modal-foot"><button class="secondary-btn" type="button" id="clearTaskAsset">No linked asset</button><div class="modal-actions"><button class="secondary-btn" type="button" data-close-task-asset>Cancel</button><button class="primary-btn" type="button" id="saveTaskAsset">Attach selected asset</button></div></div></div></div>`);

    let pendingTaskAssetId='';
    let selectedTaskAssetId='';
    const taskAssetModal=$('#taskAssetModal');
    const updateTaskAssetSummary=()=>{const asset=detailAsset(selectedTaskAssetId),summary=$('#taskAssetSummary');if(summary)summary.innerHTML=asset?`<i data-lucide="${asset.categoryId==='real-estate'?'house':'car-front'}"></i><span><strong>${escDetail(assetLabel(asset))}</strong><small>${asset.categoryId==='real-estate'?'Property':'Vehicle'} selected</small></span>`:'<i data-lucide="unlink"></i><span><strong>No property or vehicle attached</strong><small>This task will remain a general household task.</small></span>';lucide.createIcons()};
    const openTaskAssetPicker=()=>{const assets=state.assets.filter(asset=>supportedCategories.has(asset.categoryId));$('#taskAssetChoices').innerHTML=assets.map(asset=>`<label class="asset-choice"><input type="radio" name="taskAssetChoice" value="${asset.id}" ${selectedTaskAssetId===asset.id?'checked':''}><span><strong>${escDetail(assetLabel(asset))}</strong><small>${asset.categoryId==='real-estate'?'Property':'Vehicle'} · ${escDetail(asset.owner||'Household')}</small></span></label>`).join('')||'<div class="sub">Add a property or vehicle in Physical Assets first.</div>';taskAssetModal.classList.add('open')};
    const closeTaskAssetPicker=()=>taskAssetModal.classList.remove('open');
    $$('[data-close-task-asset]').forEach(button=>button.onclick=closeTaskAssetPicker);
    $('#saveTaskAsset').onclick=()=>{selectedTaskAssetId=$('[name="taskAssetChoice"]:checked')?.value||'';$('#taskAssetSelection').value=selectedTaskAssetId;updateTaskAssetSummary();closeTaskAssetPicker()};
    $('#clearTaskAsset').onclick=()=>{selectedTaskAssetId='';$('#taskAssetSelection').value='';updateTaskAssetSummary();closeTaskAssetPicker()};
    taskAssetModal.onclick=event=>{if(event.target===taskAssetModal)closeTaskAssetPicker()};

    const priorOpenSimpleData=openSimpleData;
    openSimpleData=function(title,copy,fields,onSave){
      if(!/^(New|Edit) household task$/.test(title)){priorOpenSimpleData(title,copy,fields,onSave);return}
      const titleMatch=fields.match(/id="taskTitle" value="([^"]*)"/);
      const existingTask=title==='Edit household task'?state.householdTasks.find(task=>task.title===(titleMatch?.[1]||'')):null;
      selectedTaskAssetId=existingTask?.assetId||pendingTaskAssetId||'';
      pendingTaskAssetId='';
      const relationshipFields=`<div class="field full form-section-label">Related property or vehicle</div><div class="field full"><input id="taskAssetSelection" type="hidden" value="${escDetail(selectedTaskAssetId)}"><div class="task-asset-link" id="taskAssetSummary"></div></div><div class="field full"><button class="secondary-btn" type="button" id="attachTaskAssetBtn"><i data-lucide="link-2"></i> Attach Task to Property or Vehicle</button></div>`;
      const enhancedSave=()=>{const chosen=$('#taskAssetSelection')?.value||'',newTitle=$('#taskTitle')?.value.trim()||'';onSave();const saved=existingTask||state.householdTasks.slice().reverse().find(task=>task.title===newTitle);if(saved){saved.assetId=chosen;dataProvider.save(state)}if(state.physicalAssetDetailId)renderPhysicalAssets()};
      priorOpenSimpleData(title,copy,fields+relationshipFields,enhancedSave);
      setTimeout(()=>{$('#attachTaskAssetBtn').onclick=openTaskAssetPicker;updateTaskAssetSummary();lucide.createIcons()},0)
    };

    const addDocument=asset=>{$('#newHouseholdDocumentBtn').click();setTimeout(()=>{const select=$('#docAsset');if(select){select.value=asset.id;select.dispatchEvent(new Event('change',{bubbles:true}));$('#simpleDataCopy').textContent='This document will be attached to '+assetLabel(asset)+'. It may also be linked to a specific service record.'}},0)};
    const addTask=asset=>{pendingTaskAssetId=asset.id;$('#newHouseholdTaskBtn').click()};
    const openDocument=id=>{const source=$(`[data-view-household-doc="${id}"]`);if(source){source.click();return}setPage('Contracts & Warranties');setTimeout(()=>{const doc=state.householdDocuments.find(item=>item.id===id);if($('#documentSearch')&&doc){$('#documentSearch').value=doc.title;$('#documentSearch').dispatchEvent(new Event('input',{bubbles:true}))}},0)};
    const openTask=id=>{const task=state.householdTasks.find(item=>item.id===id);setPage('To-Do List');setTimeout(()=>{if(task?.status==='completed')$('[data-task-view="history"]')?.click();else $(`[data-edit-task="${id}"]`)?.click()},0)};

    const detailFacts=asset=>asset.categoryId==='real-estate'?[['Address',asset.details?.address],['Property details',asset.details?.propertyDetails],['Owner',asset.owner],['Location / reference',asset.location]]:[['Year',asset.details?.year],['Make',asset.details?.make],['Model',asset.details?.model],['Mileage',asset.details?.mileage?Number(String(asset.details.mileage).replace(/,/g,'')).toLocaleString()+' miles':''],['Owner',asset.owner],['Storage / location',asset.location]];
    const renderDetail=asset=>{
      const loan=linkedLoan(asset),value=latestValue(asset),equity=value-Number(loan?.balance||0),docs=(state.householdDocuments||[]).filter(doc=>doc.status!=='archived'&&doc.assetId===asset.id),tasks=(state.householdTasks||[]).filter(task=>task.assetId===asset.id).sort((a,b)=>(a.status==='completed')-(b.status==='completed')||String(a.dueDate||'').localeCompare(String(b.dueDate||''))),records=(asset.records||[]).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))),images=asset.imageUrls||[];
      $('#assetDashboardView').style.display='none';$('#assetCategoryView').style.display='none';detailView.classList.add('active');$('#assetBackBtn').style.display='none';$('#physicalAssetsHeading').textContent=assetLabel(asset);$('#physicalAssetsCopy').textContent=asset.categoryId==='real-estate'?'Property details, value, debt, documents, service records, and related household work.':'Vehicle details, value, financing, documents, service records, and related household work.';
      detailView.innerHTML=`<button class="category-back" id="assetDetailBack"><i data-lucide="arrow-left"></i>Back to ${asset.categoryId==='real-estate'?'Homes & Properties':'Vehicles'}</button><div class="asset-detail-hero"><article class="card"><div class="asset-detail-gallery">${images.length?images.slice(0,3).map((url,index)=>`<img src="${escDetail(url)}" alt="${escDetail(asset.name)} image ${index+1}">`).join(''):'<div class="asset-image-placeholder"><i data-lucide="image"></i></div>'}</div></article><article class="card asset-detail-summary"><div><span class="inventory-badge">${asset.categoryId==='real-estate'?'Property':'Vehicle'}</span><h2 class="asset-detail-heading">${escDetail(asset.name)}</h2><div class="card-note">${escDetail(asset.owner||'Household')} · valued ${escDetail((asset.valuationHistory||[]).at(-1)?.date||asset.valuationDate||'Date not recorded')}</div></div><div class="asset-detail-kpis"><div><span>Estimated value</span><strong>${money(value)}</strong></div><div><span>Secured debt</span><strong>${money(loan?.balance||0)}</strong></div><div><span>Estimated equity</span><strong>${money(equity)}</strong></div></div><div class="inventory-actions"><button class="primary-btn" data-detail-edit="${asset.id}">Edit asset</button><button class="secondary-btn" data-detail-document="${asset.id}">Add document</button><button class="secondary-btn" data-detail-task="${asset.id}">Add related task</button></div></article></div><div class="asset-detail-columns"><article class="card asset-detail-section"><div class="card-head"><div><h2>Asset information</h2><div class="card-note">Identity, location, and current details.</div></div></div>${detailFacts(asset).filter(([,value])=>value).map(([label,value])=>`<div class="equity-line"><span>${escDetail(label)}</span><strong>${escDetail(value)}</strong></div>`).join('')}${loan?`<div class="equity-line"><span>Linked loan</span><strong>${escDetail(loan.name)} · ${money(loan.balance)}</strong></div>`:''}${asset.serialNumber?`<div class="equity-line"><span>Serial number</span><strong>${escDetail(asset.serialNumber)}</strong></div>`:''}${asset.partNumber?`<div class="equity-line"><span>Part / model number</span><strong>${escDetail(asset.partNumber)}</strong></div>`:''}</article><article class="card asset-detail-section"><div class="card-head"><div><h2>Repairs, improvements & service</h2><div class="card-note">Work history owned by this asset.</div></div></div>${records.map(record=>`<div class="asset-linked-row"><div><strong>${escDetail(record.type||'Record')}</strong><p>${escDetail(record.details||'No description')} · ${escDetail(record.date||'Date not recorded')}</p></div><strong>${record.cost!==undefined?money(record.cost):''}</strong></div>`).join('')||'<div class="sub">No service or improvement records yet.</div>'}</article><article class="card asset-detail-section"><div class="card-head"><div><h2>Documents</h2><div class="card-note">Contracts, warranties, purchase records, and service attachments.</div></div><button class="link-btn" data-detail-document="${asset.id}">Add document</button></div>${docs.map(doc=>`<div class="asset-linked-row"><div><strong>${escDetail(doc.title)}</strong><p>${escDetail(doc.type)}${doc.serviceRecordId?' · linked to service record':' · linked to asset'}${doc.expirationDate?' · expires '+escDetail(doc.expirationDate):''}</p></div><button class="secondary-btn" data-detail-open-document="${doc.id}">View</button></div>`).join('')||'<div class="sub">No documents are attached yet.</div>'}</article><article class="card asset-detail-section"><div class="card-head"><div><h2>Related to-do tasks</h2><div class="card-note">Open and completed work attached to this ${asset.categoryId==='real-estate'?'property':'vehicle'}.</div></div><button class="link-btn" data-detail-task="${asset.id}">Add task</button></div>${tasks.map(task=>`<div class="asset-linked-row"><div><span class="asset-task-status ${task.status==='completed'?'completed':''}">${escDetail(task.status||'open')}</span><strong style="display:block;margin-top:6px">${escDetail(task.title)}</strong><p>${escDetail(task.category||'Task')} · ${task.status==='completed'?'completed '+escDetail(task.completedDate||''): 'due '+escDetail(task.dueDate||'not scheduled')} · ${escDetail(task.claimedBy||task.completedBy||'Unclaimed')}</p></div><button class="secondary-btn" data-detail-open-task="${task.id}">${task.status==='completed'?'View log':'Open'}</button></div>`).join('')||'<div class="sub">No to-do tasks are attached yet.</div>'}</article></div>`;
      $('#assetDetailBack').onclick=()=>{state.physicalAssetDetailId='';dataProvider.save(state);renderPhysicalAssets()};
      $$('[data-detail-edit]').forEach(button=>button.onclick=()=>{$(`[data-edit-physical="${button.dataset.detailEdit}"]`)?.click()});
      $$('[data-detail-document]').forEach(button=>button.onclick=()=>addDocument(detailAsset(button.dataset.detailDocument)));
      $$('[data-detail-task]').forEach(button=>button.onclick=()=>addTask(detailAsset(button.dataset.detailTask)));
      $$('[data-detail-open-document]').forEach(button=>button.onclick=()=>openDocument(button.dataset.detailOpenDocument));
      $$('[data-detail-open-task]').forEach(button=>button.onclick=()=>openTask(button.dataset.detailOpenTask));
      lucide.createIcons()
    };

    const baseRenderPhysicalDetail=renderPhysicalAssets;
    renderPhysicalAssets=function(){
      baseRenderPhysicalDetail();
      detailView.classList.remove('active');
      const selected=detailAsset(state.physicalAssetDetailId);
      if(selected){renderDetail(selected);return}
      if(supportedCategories.has(state.physicalAssetView)){
        $$('#physicalAssetRecords .physical-record').forEach(card=>{const asset=state.assets.find(item=>item.name===card.querySelector('h2')?.textContent);if(!asset)return;card.classList.add('asset-summary-only');const actions=card.querySelector('.inventory-actions');if(actions&&!actions.querySelector('[data-open-asset-detail]'))actions.insertAdjacentHTML('afterbegin',`<button class="primary-btn" data-open-asset-detail="${asset.id}">${asset.categoryId==='real-estate'?'Open property':'Open vehicle'}</button>`)});
        $$('[data-open-asset-detail]').forEach(button=>button.onclick=()=>{state.physicalAssetDetailId=button.dataset.openAssetDetail;dataProvider.save(state);renderPhysicalAssets()})
      }
      lucide.createIcons()
    };
    renderPhysicalAssets();
  }
  installPropertyAndVehicleDetailPages();
