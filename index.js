window.onload = () => {
    const params = new URLSearchParams(window.location.search);
    
    const keywordParam = params.get('keyword');
    const imgUrlParam = params.get('imgUrl');
    
    const amzTitle = params.get('amzTitle');
    const amzAsin = params.get('amzAsin');
    const action = params.get('action');

    if (keywordParam) {
        document.getElementById('keyword').value = decodeURIComponent(keywordParam);
        document.getElementById('compare-keyword').value = decodeURIComponent(keywordParam);
    }
    if (amzAsin) {
        document.getElementById('compare-asin').value = decodeURIComponent(amzAsin);
    }
    if (imgUrlParam) {
        document.getElementById('imgUrl').value = decodeURIComponent(imgUrlParam);
        showPreview(decodeURIComponent(imgUrlParam));
    }

    // Routing
    if (action === 'wishlist' || action === 'alts_list' || action === 'alts') {
        const targetTab = action === 'wishlist' ? 'wishlist' : 'alts';
        switchTab(targetTab);
        let encodedData = params.get('data');
        if (encodedData) {
            try {
                encodedData = encodedData.replace(/ /g, '+');
                const jsonStr = decodeURIComponent(atob(encodedData));
                const items = JSON.parse(jsonStr);
                renderShowcase(items, targetTab);
            } catch(e) {
                console.error(`Failed to parse ${targetTab} data`, e);
                document.getElementById(`${targetTab}-empty`).classList.remove('hidden');
            }
        } else {
            document.getElementById(`${targetTab}-empty`).classList.remove('hidden');
        }
    }
    else if (action === 'setup') {
        switchTab('setup');
        let encodedData = params.get('data');
        if (encodedData) {
            try {
                encodedData = encodedData.replace(/ /g, '+');
                const jsonStr = decodeURIComponent(atob(encodedData));
                const items = JSON.parse(jsonStr);
                renderSetupShowcase(items);
            } catch(e) {
                console.error('Failed to parse Setup data', e);
                document.getElementById('setup-empty').classList.remove('hidden');
            }
        } else {
            document.getElementById('setup-empty').classList.remove('hidden');
        }
    }
    else if (action === 'download') {
        switchTab('download');
    }
    else if (action === 'products') {
        switchTab('products');
        let encodedData = params.get('data');
        if (encodedData) {
            try {
                encodedData = encodedData.replace(/ /g, '+');
                const jsonStr = decodeURIComponent(atob(encodedData));
                const items = JSON.parse(jsonStr);
                window.currentProductsData = items;
                document.getElementById('products-count').innerText = `Total: ${items.length}`;
                renderProductsTable(items);
            } catch(e) {
                console.error('Failed to parse Products data', e);
            }
        } else {
            loadProducts();
        }
    }
    else if (amzTitle || amzAsin || action === 'dupe') {
        switchTab('bridge');
        renderBridgePage({
            title: amzTitle ? decodeURIComponent(amzTitle) : '',
            price: params.get('amzPrice') ? decodeURIComponent(params.get('amzPrice')) : '',
            imgUrl: params.get('amzImgUrl') ? decodeURIComponent(params.get('amzImgUrl')) : '',
            asin: amzAsin || ''
        });
    } else {
        switchTab('source');
    }
};

function switchTab(tabId) {
    ['source', 'bridge', 'setup', 'compare', 'wishlist', 'alts', 'download', 'about', 'contact', 'privacy', 'disclaimer', 'products'].forEach(t => {
        const tab = document.getElementById('tab-' + t);
        const btn = document.getElementById('btn-tab-' + t);
        if (tab) {
            if (t === tabId) {
                tab.classList.remove('hidden');
            } else {
                tab.classList.add('hidden');
            }
        }
        if (btn) {
            if (t === tabId) {
                btn.classList.add('bg-blue-600', 'text-white');
                btn.classList.remove('text-gray-600', 'bg-transparent');
            } else {
                btn.classList.remove('bg-blue-600', 'text-white');
                btn.classList.add('text-gray-600', 'bg-transparent');
            }
        }
    });

    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    if (tabId === 'compare') {
        closeCompareTool(); 
    }
    if (tabId === 'products') {
        loadProducts();
    }
}

function openCompareTool(toolId, titleHtml, inputType) {
    document.getElementById('compare-main-header').classList.add('hidden');
    document.getElementById('compare-menu').classList.add('hidden');
    
    document.getElementById('compare-tool-view').classList.remove('hidden');
    document.getElementById('compare-tool-title').innerHTML = titleHtml;
    
    // Hide all inputs first
    document.getElementById('compare-input-keyword').classList.add('hidden');
    document.getElementById('compare-input-asin').classList.add('hidden');
    document.getElementById('compare-input-brand').classList.add('hidden');
    
    // Show related input
    if (inputType) {
        document.getElementById('compare-input-' + inputType).classList.remove('hidden');
    }
    
    // Hide all actions first
    const actionDivs = document.querySelectorAll('[id^="compare-actions-"]');
    actionDivs.forEach(div => div.classList.add('hidden'));

    // Show specific action
    document.getElementById('compare-actions-' + toolId).classList.remove('hidden');
}

function closeCompareTool() {
    const mainHeader = document.getElementById('compare-main-header');
    if (mainHeader) mainHeader.classList.remove('hidden');
    
    const menu = document.getElementById('compare-menu');
    if (menu) menu.classList.remove('hidden');
    
    const toolView = document.getElementById('compare-tool-view');
    if (toolView) toolView.classList.add('hidden');
}

// ============================
// Module 3: Setup Showcase Geek Recommended Items
// ============================
function renderSetupShowcase(items) {
    const container = document.getElementById('setup-masonry');
    const myAffiliateTag = "yourtag-20"; // This is the tag to earn passive commission!
    
    container.innerHTML = '';
    if(!items || items.length === 0) {
        document.getElementById('setup-empty').classList.remove('hidden');
        return;
    }

    items.forEach((item, index) => {
        const affiliateLink = `https://www.amazon.com/dp/${item.a}?tag=${myAffiliateTag}`;
        const title = item.t || `Amazon Premium Item (ASIN: ${item.a})`;
        const price = item.p ? `$${item.p}` : 'Check on Amazon';
        const img = item.i || `https://dummyimage.com/400x400/fff/ccc&text=No+Image`;

        // Extract short title for card display (remove redundant messy parameters)
        const shortTitle = title.split(/[|,-]/)[0].trim().substring(0, 70);

        const cardHTML = `
        <div class="masonry-item">
            <a href="${affiliateLink}" target="_blank" class="block bg-white rounded-2xl overflow-hidden border border-gray-100 card-pop group relative">
                <!-- 顶角推荐标识 -->
                ${index < 3 ? '<div class="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg z-10 shadow-sm uppercase tracking-wider">Top Pick</div>' : ''}
                
                <div class="w-full bg-gray-50 flex items-center justify-center p-6 aspect-square relative overflow-hidden">
                    <img src="${img}" alt="Setup Item" class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300">
                </div>
                <div class="p-5">
                    <h3 class="text-[15px] font-bold text-gray-800 leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">${shortTitle}</h3>
                    <div class="flex justify-between items-center mt-4">
                        <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm font-bold">${price}</span>
                        <span class="text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-full text-xs font-bold transition">Buy at Amazon ↗</span>
                    </div>
                </div>
            </a>
        </div>
        `;
        container.innerHTML += cardHTML;
    });
}

function renderShowcase(items, type) {
    const container = document.getElementById(`${type}-masonry`);
    const affiliateTag = "yourtag-20"; 
    
    container.innerHTML = '';
    if(!items || items.length === 0) {
        document.getElementById(`${type}-empty`).classList.remove('hidden');
        return;
    }

    items.forEach((item) => {
        const affiliateLink = `https://www.amazon.com/dp/${item.a}?tag=${affiliateTag}`;
        const title = item.t || `Amazon Item (ASIN: ${item.a})`;
        const price = item.p ? `$${item.p}` : 'Check on Amazon';
        const img = item.i || `https://dummyimage.com/400x400/fff/ccc&text=No+Image`;
        const asin = item.a;
        
        // Extract short title for card display
        const shortTitle = title.split(/[|,-]/)[0].trim().substring(0, 100) || title;

        const cardHTML = `
        <div class="masonry-item">
            <a href="${affiliateLink}" target="_blank" class="flex bg-white rounded-xl overflow-hidden border border-gray-100 card-pop group relative p-3 gap-3 items-center">
                <div class="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-50 flex items-center justify-center rounded-lg overflow-hidden relative">
                    <img src="${img}" alt="Item" class="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300">
                </div>
                <div class="flex-1 flex flex-col justify-between py-1 min-w-0">
                    <div>
                        <h3 class="text-[14px] font-bold text-gray-800 leading-snug line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors" title="${title}">${shortTitle}</h3>
                        <div class="text-[11px] text-gray-400 mb-2 truncate">ASIN: <span class="font-mono text-gray-500">${asin}</span></div>
                    </div>
                    <div class="flex justify-between items-center mt-1">
                        <span class="text-[#ff5000] text-lg font-bold leading-none">${price}</span>
                        <span class="text-white bg-gradient-to-r from-[#ff7a00] to-[#ff5000] hover:from-[#ff5000] hover:to-[#ff3000] px-3 py-1 rounded-full text-xs font-bold transition shadow-sm whitespace-nowrap">Check it out</span>
                    </div>
                </div>
            </a>
        </div>
        `;
        container.innerHTML += cardHTML;
    });
}

function copyShareUrl() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const textElements = document.querySelectorAll('[id^="copy-btn-text"]');
        textElements.forEach(t => {
            const originalText = t.innerText;
            if (!originalText.includes('✅')) {
                t.innerText = '✅ Link copied!';
                setTimeout(() => t.innerText = originalText, 3000);
            }
        });
    });
}

// ============================
// Module 2: Dupes Alternative function (Fallback simulation)
// ============================
function extractCoreKeyword(title) {
    if (!title) return "";
    const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, ' ');
    const words = cleanTitle.split(/\s+/).filter(w => w.length > 0);
    return words.length > 3 ? words.slice(1, 4).join(" ") : title;
}

function extractBrandKeyword(title) {
    if (!title) return "";
    const cleanTitle = title.replace(/[^a-zA-Z0-9\s-]/g, ' ').trim();
    return cleanTitle.split(/\s+/)[0] || "";
}

async function renderBridgePage(info) {
    if (info.title) document.getElementById('orig-title').textContent = info.title;
    if (info.price) document.getElementById('orig-price').textContent = '$' + info.price;
    if (info.imgUrl) document.getElementById('orig-placeholder').innerHTML = `<img src="${info.imgUrl}" class="w-full h-full object-contain bg-white rounded">`;
    if (info.asin) {
        const l = document.getElementById('orig-link'); l.href = `https://www.amazon.com/dp/${info.asin}`; l.classList.remove('hidden');
    }

    const dupeListDiv = document.getElementById('dupe-list');
    const fallbackKeyword = extractCoreKeyword(info.title) || "Trending Product";
    const brandKeyword = extractBrandKeyword(info.title) || "";
    document.getElementById('compare-keyword').value = fallbackKeyword;
    if (brandKeyword) document.getElementById('compare-brand').value = brandKeyword;
    if (info.asin) document.getElementById('compare-asin').value = info.asin;
    
    // Use a static fallback array to simulate remote JSON
    const realDeals = [
        { title: `[Pro Altern] ${fallbackKeyword} - Top Value Bundle`, price: "$12.99", originalPrice: "$29.99", imgUrl: "https://dummyimage.com/400x400/fafafa/333&text=Dupe+1" },
        { title: `Minimalist ${fallbackKeyword} Equivalent`, price: "$8.99", originalPrice: "$15.99", imgUrl: "https://dummyimage.com/400x400/fafafa/333&text=Dupe+2" },
        { title: `Upgraded ${fallbackKeyword} + Accessories`, price: "$18.50", originalPrice: "$39.00", imgUrl: "https://dummyimage.com/400x400/fafafa/333&text=Dupe+3" }
    ];

    dupeListDiv.innerHTML = '';
    realDeals.forEach(deal => {
        const affiliateLink = `https://www.amazon.com/s?k=${encodeURIComponent(deal.title)}&tag=yourtag-20`;
        dupeListDiv.innerHTML += `
            <div class="flex gap-4 p-4 border border-gray-100 rounded-2xl bg-white hover:border-blue-200 hover:shadow-lg transition-all group cursor-pointer" onclick="window.open('${affiliateLink}', '_blank')">
                <div class="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden p-2">
                    <img src="${deal.imgUrl}" class="w-full h-full object-contain group-hover:scale-105 transition-transform">
                </div>
                <div class="flex-1 flex flex-col justify-between py-1">
                    <div>
                        <div class="text-[10px] text-green-600 font-bold tracking-wider uppercase mb-1.5 bg-green-50 w-max px-2 py-0.5 rounded">Highly Recommended Match</div>
                        <h4 class="font-bold text-[15px] text-gray-800 line-clamp-2 group-hover:text-blue-600 leading-snug">${deal.title}</h4>
                    </div>
                    <div class="flex justify-between items-end mt-3">
                        <div>
                            <span class="text-red-500 font-bold text-xl leading-none">${deal.price}</span>
                            <span class="text-gray-400 text-xs line-through ml-1.5">${deal.originalPrice}</span>
                        </div>
                        <button class="bg-[#ffd814] border border-[#fcd200] hover:bg-[#f7ca00] text-[#0f1111] text-xs font-bold py-2 px-5 rounded-full shadow-sm transition">
                            Check Deal on Amazon
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

// ============================
// Module 1: Source Search by image
// ============================
document.getElementById('imgUrl').addEventListener('input', (e) => showPreview(e.target.value));

function showPreview(url) {
    const c = document.getElementById('imagePreviewContainer');
    const i = document.getElementById('imagePreview');
    if(url.trim() && (url.startsWith('http') || url.startsWith('data:image'))) {
        i.src = url.trim();
        c.classList.remove('hidden');
    } else c.classList.add('hidden');
}

function clearPreview() {
    document.getElementById('imgUrl').value = '';
    document.getElementById('imagePreviewContainer').classList.add('hidden');
}

function handleLocalUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) alert('It is recommended to upload images smaller than 2MB to avoid overly long URLs and broken links');
    const reader = new FileReader();
    reader.onload = e => {
        document.getElementById('imgUrl').value = e.target.result;
        showPreview(e.target.result);
    };
    reader.readAsDataURL(file);
}

function searchPlatform(platform) {
    const kw = document.getElementById('keyword').value.trim();
    const img = document.getElementById('imgUrl').value.trim();
    if (!kw && !img) return alert('How to find without image or keywords? Please fill in one!');

    let url = '';
    if (platform === '1688') url = img ? `https://s.1688.com/youyuan/index.htm?tab=imageSearch&imageAddress=${encodeURIComponent(img)}` : `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(kw)}`;
    else if (platform === 'taobao') url = `https://s.taobao.com/search?q=${encodeURIComponent(kw)}${img ? '&imgurl='+encodeURIComponent(img) : ''}`;
    else if (platform === 'aliexpress') url = `https://www.aliexpress.com/w/wholesale-${encodeURIComponent(kw||'product')}.html?SearchText=${encodeURIComponent(kw||'product')}${img ? '&imageUrl='+encodeURIComponent(img) : ''}`;
    else if (platform === 'alibaba') url = `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(kw||'product')}&IndexArea=product_en${img ? '&imageUrl='+encodeURIComponent(img) : ''}`;
    
    if (url) window.open(url, '_blank');
}

// ============================
// Module 4: Compare Cross-platform price comparison & Deal hunting
// ============================
function searchCompare(platform) {
    const kw = document.getElementById('compare-keyword').value.trim();
    if (!kw) return alert('Please enter product keywords and try again!');

    const encodeKw = encodeURIComponent(kw);
    let url = '';

    switch (platform) {
        case 'walmart':
            url = `https://www.walmart.com/search?q=${encodeKw}`;
            break;
        case 'target':
            url = `https://www.target.com/s?searchTerm=${encodeKw}`;
            break;
        case 'bestbuy':
            url = `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeKw}`;
            break;
        case 'ebay':
            url = `https://www.ebay.com/sch/i.html?_nkw=${encodeKw}`;
            break;
        case 'amazon-warehouse':
            url = `https://www.amazon.com/s?k=${encodeKw}&i=warehouse-deals`;
            break;
        case 'amazon-outlet':
            // Amazon special clearance node
            url = `https://www.amazon.com/s?k=${encodeKw}&rh=n%3A16225007011`;
            break;
        case 'woot':
            url = `https://www.google.com/search?q=site%3Awoot.com+${encodeKw}`;
            break;
        case 'amazon-sold-by':
            url = `https://www.amazon.com/s?k=${encodeKw}&rh=p_6%3AATVPDKIKX0DER`;
            break;
        case 'slickdeals':
            url = `https://slickdeals.net/newsearch.php?q=${encodeKw}`;
            break;
    }

    if (url) window.open(url, '_blank');
}

function searchReview(platform) {
    const kw = document.getElementById('compare-keyword').value.trim();
    if (!kw) return alert('Please enter product keywords and try again!');

    const encodeKw = encodeURIComponent(kw + ' review');
    let url = '';

    switch (platform) {
        case 'tiktok':
            url = `https://www.tiktok.com/search?q=${encodeKw}`;
            break;
        case 'youtube':
            url = `https://www.youtube.com/results?search_query=${encodeKw}`;
            break;
        case 'reddit':
            url = `https://www.reddit.com/search/?q=${encodeKw}`;
            break;
    }

    if (url) window.open(url, '_blank');
}

function searchAsin(platform) {
    const asin = document.getElementById('compare-asin').value.trim();
    if (!asin) return alert('Please enter product ASIN and try again!');

    const encodeAsin = encodeURIComponent(asin);
    let url = '';

    switch (platform) {
        case 'camel':
            url = `https://camelcamelcamel.com/product/${encodeAsin}`;
            break;
        case 'keepa':
            url = `https://keepa.com/#!product/1-${encodeAsin}`;
            break;
        case 'fakespot':
            url = `https://www.fakespot.com/analyze?url=https://www.amazon.com/dp/${encodeAsin}`;
            break;
        case 'reviewmeta':
            url = `https://reviewmeta.com/search?q=${encodeAsin}`;
            break;
    }

    if (url) window.open(url, '_blank');
}

function searchPromoCode(platform) {
    const brand = document.getElementById('compare-brand').value.trim();
    if (!brand) return alert('Please enter brand name and try again!');

    const encodeBrand = encodeURIComponent(brand);
    let url = '';

    switch (platform) {
        case 'google':
            url = `https://www.google.com/search?q=${encodeBrand}+promo+code`;
            break;
        case 'retailmenot':
            url = `https://www.retailmenot.com/view/${encodeBrand}.com`;
            break;
    }

    if (url) window.open(url, '_blank');
}

// ============================
// Module 5: Products Data Table
// ============================
function loadProducts() {
    if (window.currentProductsData) {
        document.getElementById('products-count').innerText = `Total: ${window.currentProductsData.length}`;
        renderProductsTable(window.currentProductsData);
        return;
    }
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['amazon_scraped_products'], function(result) {
            const products = result['amazon_scraped_products'] || [];
            document.getElementById('products-count').innerText = `Total: ${products.length}`;
            renderProductsTable(products);
        });
    }
}

function renderProductsTable(products) {
    const tableHeader = document.getElementById('products-table-header');
    const tableBody = document.getElementById('products-table-body');
    
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';
    
    if (!products || products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="100%" class="py-4 text-center text-gray-500">No products scraped yet.</td></tr>';
        return;
    }

    const headers = Object.keys(products[0]);
    
    // Render headers
    headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.className = 'py-3 px-6 text-left whitespace-nowrap cursor-pointer hover:bg-red-50 hover:text-red-600 transition group';
        th.title = 'Click to delete column';
        th.onclick = () => removeColumn(index);
        th.innerHTML = `${header} <span class="hidden group-hover:inline ml-1 text-red-500 text-xs">✖</span>`;
        tableHeader.appendChild(th);
    });
    
    const thAction = document.createElement('th');
    thAction.className = 'py-3 px-6 text-center';
    thAction.innerText = 'Action';
    tableHeader.appendChild(thAction);

    // Render rows
    products.forEach((product, rowIndex) => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-200 hover:bg-gray-50 transition';
        
        headers.forEach(header => {
            const td = document.createElement('td');
            td.className = 'py-3 px-6 text-left whitespace-nowrap';
            
            if (header === 'image' || header.toLowerCase().includes('img')) {
                td.innerHTML = `<img src="${product[header]}" class="h-10 w-10 object-contain rounded border bg-white" alt="img">`;
            } else if (header === 'asin') {
                td.innerHTML = `<a href="https://www.amazon.com/dp/${product[header]}" target="_blank" class="text-blue-500 hover:underline font-mono">${product[header]}</a>`;
            } else {
                td.innerText = product[header] || '-';
            }
            tr.appendChild(td);
        });
        
        const tdAction = document.createElement('td');
        tdAction.className = 'py-3 px-6 text-center';
        tdAction.innerHTML = `<button onclick="removeRow(${rowIndex})" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition" title="Delete Row"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>`;
        tr.appendChild(tdAction);
        
        tableBody.appendChild(tr);
    });
}

function removeRow(rowIndex) {
    if (window.currentProductsData) {
        let products = window.currentProductsData;
        if (rowIndex >= 0 && rowIndex < products.length) {
            products.splice(rowIndex, 1);
            loadProducts();
        }
        return;
    }
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['amazon_scraped_products'], function(result) {
            let products = result['amazon_scraped_products'] || [];
            if (rowIndex >= 0 && rowIndex < products.length) {
                products.splice(rowIndex, 1);
                chrome.storage.local.set({ 'amazon_scraped_products': products }, function() {
                    loadProducts();
                });
            }
        });
    }
}

function removeColumn(colIndex) {
    if (!confirm('Are you sure you want to delete this column?')) return;
    
    if (window.currentProductsData) {
        let products = window.currentProductsData;
        if (products.length === 0) return;
        const headers = Object.keys(products[0]);
        if (colIndex >= 0 && colIndex < headers.length) {
            const keyToRemove = headers[colIndex];
            window.currentProductsData = products.map(product => {
                const newProduct = { ...product };
                delete newProduct[keyToRemove];
                return newProduct;
            });
            loadProducts();
        }
        return;
    }

    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['amazon_scraped_products'], function(result) {
            let products = result['amazon_scraped_products'] || [];
            if (products.length === 0) return;
            
            const headers = Object.keys(products[0]);
            if (colIndex >= 0 && colIndex < headers.length) {
                const keyToRemove = headers[colIndex];
                products = products.map(product => {
                    const newProduct = { ...product };
                    delete newProduct[keyToRemove];
                    return newProduct;
                });
                chrome.storage.local.set({ 'amazon_scraped_products': products }, function() {
                    loadProducts();
                });
            }
        });
    }
}

function exportProductsCSV() {
    const doExport = (data) => {
        if (data.length === 0) return alert('No data to export');
        
        const headers = Object.keys(data[0]);
        const csvRows = [];
        
        csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));
        
        for (const row of data) {
            const values = headers.map(header => {
                const escaped = ('' + (row[header] || '')).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }
        
        const csvString = '\\uFEFF' + csvRows.join('\\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `amazon_products_${new Date().getTime()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (window.currentProductsData) {
        doExport(window.currentProductsData);
    } else if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['amazon_scraped_products'], function(result) {
            doExport(result['amazon_scraped_products'] || []);
        });
    }
}

function exportProductsXLS() {
    const doExport = (data) => {
        if (data.length === 0) return alert('No data to export');
        
        let tableHTML = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"></head><body><table border="1">';
        
        const headers = Object.keys(data[0]);
        tableHTML += '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
        
        for (const row of data) {
            tableHTML += '<tr>' + headers.map(header => {
                let val = row[header] || '';
                if (header === 'image' || header.toLowerCase().includes('img')) {
                    return `<td><img src="${val}" width="50" height="50"></td>`;
                }
                return `<td>${val}</td>`;
            }).join('') + '</tr>';
        }
        
        tableHTML += '</table></body></html>';
        
        const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `amazon_products_${new Date().getTime()}.xls`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (window.currentProductsData) {
        doExport(window.currentProductsData);
    } else if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['amazon_scraped_products'], function(result) {
            doExport(result['amazon_scraped_products'] || []);
        });
    }
}
