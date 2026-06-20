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

    // 路由处理
    if (action === 'wishlist' || action === 'alts_list' || action === 'alts') {
        const targetTab = action === 'wishlist' ? 'wishlist' : 'alts';
        switchTab(targetTab);
        const encodedData = params.get('data');
        if (encodedData) {
            try {
                const jsonStr = decodeURIComponent(atob(encodedData));
                const items = JSON.parse(jsonStr);
                renderShowcase(items, targetTab);
            } catch(e) {
                console.error(`解析 ${targetTab} 数据失败`, e);
                document.getElementById(`${targetTab}-empty`).classList.remove('hidden');
            }
        } else {
            document.getElementById(`${targetTab}-empty`).classList.remove('hidden');
        }
    }
    else if (action === 'setup') {
        switchTab('setup');
        const encodedData = params.get('data');
        if (encodedData) {
            try {
                const jsonStr = decodeURIComponent(atob(encodedData));
                const items = JSON.parse(jsonStr);
                renderSetupShowcase(items);
            } catch(e) {
                console.error('解析 Setup 数据失败', e);
                document.getElementById('setup-empty').classList.remove('hidden');
            }
        } else {
            document.getElementById('setup-empty').classList.remove('hidden');
        }
    }
    else if (action === 'download') {
        switchTab('download');
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
    ['source', 'bridge', 'setup', 'compare', 'wishlist', 'alts', 'download'].forEach(t => {
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

    if (tabId === 'compare') {
        closeCompareTool(); 
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
// 模块 3: Setup Showcase 极客好物分享
// ============================
function renderSetupShowcase(items) {
    const container = document.getElementById('setup-masonry');
    const myAffiliateTag = "yourtag-20"; // 这是赚被动佣金的 tag！
    
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

        // 提取简单标题供卡片展示（去掉多余杂乱参数）
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
        
        // 提取简单标题供卡片展示
        const shortTitle = title.split(/[|,-]/)[0].trim().substring(0, 100) || title;

        const cardHTML = `
        <div class="masonry-item">
            <a href="${affiliateLink}" target="_blank" class="block bg-white rounded-2xl overflow-hidden border border-gray-100 card-pop group relative">
                <div class="w-full bg-gray-50 flex items-center justify-center p-6 aspect-square relative overflow-hidden">
                    <img src="${img}" alt="Item" class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300">
                </div>
                <div class="p-5">
                    <h3 class="text-[15px] font-bold text-gray-800 leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors" title="${title}">${shortTitle}</h3>
                    <div class="text-xs text-gray-500 mb-4 bg-gray-100 p-1.5 rounded inline-block">ASIN: <span class="font-mono text-gray-700">${asin}</span></div>
                    <div class="flex justify-between items-center mt-2">
                        <span class="text-red-600 text-lg font-bold">${price}</span>
                        <span class="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm font-bold transition">一键购买 ↗</span>
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
                t.innerText = '✅ 链接已复制！';
                setTimeout(() => t.innerText = originalText, 3000);
            }
        });
    });
}

// ============================
// 模块 2: Dupes 平替功能 (降级模拟)
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
    
    // 使用静态备用数组模拟远程 JSON
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
// 模块 1: Source 以图搜图
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
    if (file.size > 2 * 1024 * 1024) alert('建议上传小于 2MB 的图片以免 URL 过长断链');
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
    if (!kw && !img) return alert('缺图少词怎么找？填一个呗！');

    let url = '';
    if (platform === '1688') url = img ? `https://s.1688.com/youyuan/index.htm?tab=imageSearch&imageAddress=${encodeURIComponent(img)}` : `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(kw)}`;
    else if (platform === 'taobao') url = `https://s.taobao.com/search?q=${encodeURIComponent(kw)}${img ? '&imgurl='+encodeURIComponent(img) : ''}`;
    else if (platform === 'aliexpress') url = `https://www.aliexpress.com/w/wholesale-${encodeURIComponent(kw||'product')}.html?SearchText=${encodeURIComponent(kw||'product')}${img ? '&imageUrl='+encodeURIComponent(img) : ''}`;
    else if (platform === 'alibaba') url = `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(kw||'product')}&IndexArea=product_en${img ? '&imageUrl='+encodeURIComponent(img) : ''}`;
    
    if (url) window.open(url, '_blank');
}

// ============================
// 模块 4: Compare 跨平台比价 & 捡漏
// ============================
function searchCompare(platform) {
    const kw = document.getElementById('compare-keyword').value.trim();
    if (!kw) return alert('请输入商品关键词后再试！');

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
            // 亚马逊特价清仓节点
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
    if (!kw) return alert('请输入商品关键词后再试！');

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
    if (!asin) return alert('请输入商品 ASIN 后再试！');

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
    if (!brand) return alert('请输入品牌名称后再试！');

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
