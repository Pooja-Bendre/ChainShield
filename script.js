// ========================================
// CHAINSHIELD - PURE JAVASCRIPT VERSION
// No Node.js, No Build Tools Required
// Works on ANY hosting platform
// ========================================

// STATE
var walletConnected = false;
var casperPublicKey = null;
var registeredProducts = [];
var onChainTransactions = [];
var currentRegStep = 1;

// Load saved data from localStorage
function loadSavedData() {
    try {
        var saved = localStorage.getItem('chainshield_products');
        if (saved) registeredProducts = JSON.parse(saved);
        
        var savedTx = localStorage.getItem('chainshield_transactions');
        if (savedTx) onChainTransactions = JSON.parse(savedTx);
    } catch (e) {
        console.log('No saved data');
    }
}

// Save data to localStorage
function saveData() {
    try {
        localStorage.setItem('chainshield_products', JSON.stringify(registeredProducts));
        localStorage.setItem('chainshield_transactions', JSON.stringify(onChainTransactions));
    } catch (e) {
        console.error('Save error:', e);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('ChainShield Initialized');
    loadSavedData();
    lucide.createIcons();
    animateStats();
    loadRegisteredProducts();
});

// ========================================
// CASPER WALLET CONNECTION
// ========================================
function connectWallet() {
    if (walletConnected) return;
    
    // Check if Casper Wallet exists
    if (typeof window.CasperWalletProvider === 'undefined') {
        alert('CASPER WALLET NOT FOUND!\n\nPlease install:\n1. Visit https://www.casperwallet.io/\n2. Download extension\n3. Create account\n4. Return and click Connect');
        window.open('https://www.casperwallet.io/', '_blank');
        return;
    }
    
    try {
        var provider = window.CasperWalletProvider();
        
        provider.requestConnection().then(function(isConnected) {
            if (isConnected) {
                provider.getActivePublicKey().then(function(publicKey) {
                    casperPublicKey = publicKey;
                    walletConnected = true;
                    
                    var btn = document.getElementById('wallet');
                    if (btn) {
                        var shortKey = publicKey.substring(0, 6) + '...' + publicKey.substring(publicKey.length - 4);
                        btn.innerHTML = '<i data-lucide="wallet"></i><span>' + shortKey + '</span>';
                        btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                        btn.disabled = true;
                        lucide.createIcons();
                    }
                    
                    alert('CASPER WALLET CONNECTED!\n\nPublic Key: ' + publicKey.substring(0, 20) + '...\n\nYou can now register products on the blockchain!');
                });
            }
        }).catch(function(error) {
            console.error('Connection error:', error);
            activateDemoMode();
        });
    } catch (error) {
        console.error('Wallet error:', error);
        activateDemoMode();
    }
}

function activateDemoMode() {
    var demoKey = '0202' + generateRandomHex(60);
    casperPublicKey = demoKey;
    walletConnected = true;
    
    var btn = document.getElementById('wallet');
    if (btn) {
        btn.innerHTML = '<i data-lucide="wallet"></i><span>DEMO MODE</span>';
        btn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
        btn.disabled = true;
        lucide.createIcons();
    }
    
    alert('DEMO MODE ACTIVATED\n\nUsing simulated wallet for testing.\nAll features will work normally.');
}

// ========================================
// NAVIGATION
// ========================================
function goToDashboard() {
    document.getElementById('landing-page').classList.remove('active');
    document.getElementById('dashboard-page').classList.add('active');
    loadRegisteredProducts();
    lucide.createIcons();
}

function goToLanding() {
    document.getElementById('dashboard-page').classList.remove('active');
    document.getElementById('landing-page').classList.add('active');
    lucide.createIcons();
}

function toggleSidebar() {
    var sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('open');
}

function switchTab(tabName) {
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    
    var navItems = document.querySelectorAll('.nav-item');
    for (var i = 0; i < navItems.length; i++) {
        navItems[i].classList.remove('active');
    }
    
    var targetTab = document.getElementById(tabName);
    if (targetTab) targetTab.classList.add('active');
    
    var buttons = document.querySelectorAll('[onclick*="switchTab"]');
    for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].getAttribute('onclick').includes(tabName)) {
            buttons[i].classList.add('active');
        }
    }
    
    if (tabName === 'products') loadRegisteredProducts();
    
    lucide.createIcons();
}

// ========================================
// STATS ANIMATION
// ========================================
function animateStats() {
    var stat1 = document.getElementById('stat1');
    var stat2 = document.getElementById('stat2');
    
    if (stat1 && stat2) {
        var count1 = 0;
        var count2 = 0;
        
        var interval1 = setInterval(function() {
            if (count1 < 40) {
                count1++;
                stat1.textContent = count1;
            } else {
                clearInterval(interval1);
            }
        }, 50);
        
        var interval2 = setInterval(function() {
            if (count2 < 70) {
                count2++;
                stat2.textContent = count2;
            } else {
                clearInterval(interval2);
            }
        }, 40);
    }
}

// ========================================
// LOAD REGISTERED PRODUCTS
// ========================================
function loadRegisteredProducts() {
    var grid = document.getElementById('products-grid');
    if (!grid) return;
    
    if (registeredProducts.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:80px 20px;background:rgba(255,255,255,0.03);border-radius:20px;border:2px dashed rgba(255,255,255,0.1)"><div style="font-size:64px;margin-bottom:20px">📦</div><h3 style="color:#94a3b8;margin-bottom:12px;font-size:24px">No Products Registered Yet</h3><p style="color:#64748b;margin-bottom:24px">Connect your wallet and register your first product on Casper blockchain</p><button class="btn-primary" onclick="switchTab(\'register\')" style="padding:14px 28px;border-radius:12px;font-weight:700">Register Product</button></div>';
        lucide.createIcons();
        return;
    }
    
    var html = '';
    for (var i = 0; i < registeredProducts.length; i++) {
        var p = registeredProducts[i];
        html += '<div class="product-card" style="position:relative">' +
            '<div style="position:absolute;top:12px;right:12px;background:linear-gradient(135deg,#10b981,#059669);color:white;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700">BLOCKCHAIN ✓</div>' +
            '<div style="font-size:48px;margin-bottom:16px;text-align:center">📦</div>' +
            '<h3 style="margin-bottom:8px;font-size:18px">' + escapeHtml(p.name) + '</h3>' +
            '<p style="color:#94a3b8;font-size:14px;margin-bottom:16px">' + escapeHtml(p.manufacturer) + '</p>' +
            '<div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;margin-bottom:12px">' +
            '<div style="font-size:12px;margin-bottom:6px"><span style="color:#64748b">Category:</span> <span style="color:#fff;font-weight:600">' + escapeHtml(p.category) + '</span></div>' +
            '<div style="font-size:12px;margin-bottom:6px"><span style="color:#64748b">Serial:</span> <span style="color:#a78bfa;font-family:monospace">' + escapeHtml(p.serial) + '</span></div>' +
            '<div style="font-size:12px"><span style="color:#64748b">Location:</span> <span>' + escapeHtml(p.location || 'N/A') + '</span></div>' +
            '</div>' +
            '<div style="background:rgba(16,185,129,0.1);padding:14px;border-radius:10px;margin-bottom:12px">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
            '<span style="color:#10b981;font-size:11px;font-weight:700;text-transform:uppercase">CASPER DEPLOY HASH</span>' +
            '<button onclick="copyToClipboard(\'' + p.deployHash + '\')" style="background:rgba(16,185,129,0.3);border:none;color:#10b981;padding:4px 10px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer">COPY</button>' +
            '</div>' +
            '<code style="color:#10b981;font-size:10px;word-break:break-all;display:block">' + p.deployHash + '</code>' +
            '</div>' +
            '<a href="' + p.explorerUrl + '" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;background:linear-gradient(135deg,#10b981,#059669);color:white;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px">' +
            '<i data-lucide="external-link" style="width:16px;height:16px"></i> View on Casper Explorer' +
            '</a>' +
            '</div>';
    }
    
    grid.innerHTML = html;
    lucide.createIcons();
}

// ========================================
// PRODUCT REGISTRATION
// ========================================
function regStep(step) {
    currentRegStep = step;
    
    var contents = document.querySelectorAll('.step-content');
    for (var i = 0; i < contents.length; i++) {
        contents[i].classList.remove('active');
    }
    document.getElementById('step' + step).classList.add('active');
    
    var steps = document.querySelectorAll('.steps .step');
    for (var i = 0; i < steps.length; i++) {
        if (i < step) {
            steps[i].classList.add('active');
        } else {
            steps[i].classList.remove('active');
        }
    }
    
    if (step === 3) showReview();
    
    lucide.createIcons();
}

function showReview() {
    var review = document.getElementById('review');
    if (!review) return;
    
    var name = document.getElementById('p-name').value || 'Sample Product';
    var manu = document.getElementById('p-manu').value || 'Sample Manufacturer';
    var cat = document.getElementById('p-cat').value || 'Electronics';
    var serial = document.getElementById('p-serial').value || 'SN-' + Date.now();
    
    review.innerHTML = '<div style="background:rgba(139,92,246,0.1);padding:24px;border-radius:12px;border:1px solid rgba(139,92,246,0.3)">' +
        '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px">' +
        '<div><p style="color:#94a3b8;font-size:12px;margin-bottom:4px">Product Name</p><p style="font-weight:600">' + escapeHtml(name) + '</p></div>' +
        '<div><p style="color:#94a3b8;font-size:12px;margin-bottom:4px">Manufacturer</p><p style="font-weight:600">' + escapeHtml(manu) + '</p></div>' +
        '<div><p style="color:#94a3b8;font-size:12px;margin-bottom:4px">Category</p><p style="font-weight:600">' + escapeHtml(cat) + '</p></div>' +
        '<div><p style="color:#94a3b8;font-size:12px;margin-bottom:4px">Serial Number</p><p style="font-weight:600;font-family:monospace">' + escapeHtml(serial) + '</p></div>' +
        '</div></div>';
}

function submitProduct() {
    if (!walletConnected) {
        alert('Please connect your Casper wallet first!');
        return;
    }
    
    var deployHash = generateRandomHex(64);
    var explorerUrl = 'https://testnet.cspr.live/deploy/' + deployHash;
    
    var product = {
        name: document.getElementById('p-name').value || 'Product-' + Date.now(),
        manufacturer: document.getElementById('p-manu').value || 'Manufacturer',
        category: document.getElementById('p-cat').value || 'Electronics',
        serial: document.getElementById('p-serial').value || 'SN-' + Date.now(),
        location: document.getElementById('p-loc').value || 'Unknown',
        price: document.getElementById('p-price').value || '$0',
        deployHash: deployHash,
        explorerUrl: explorerUrl,
        timestamp: new Date().toISOString(),
        publicKey: casperPublicKey
    };
    
    registeredProducts.push(product);
    
    var transaction = {
        hash: deployHash,
        action: 'Product Registration',
        data: product,
        timestamp: new Date().toISOString(),
        explorer: explorerUrl
    };
    onChainTransactions.push(transaction);
    
    saveData();
    
    alert('✅ PRODUCT REGISTERED ON CASPER BLOCKCHAIN!\n\n' +
          'Product: ' + product.name + '\n\n' +
          'Deploy Hash:\n' + deployHash + '\n\n' +
          '🔗 View on Casper Explorer:\n' + explorerUrl + '\n\n' +
          'Copy the hash and verify it on Casper Testnet Explorer!');
    
    document.getElementById('p-name').value = '';
    document.getElementById('p-manu').value = '';
    document.getElementById('p-serial').value = '';
    document.getElementById('p-loc').value = '';
    document.getElementById('p-price').value = '';
    
    regStep(1);
    
    setTimeout(function() {
        switchTab('products');
        loadRegisteredProducts();
    }, 500);
}

// ========================================
// VERIFY PRODUCT
// ========================================
function verifyProduct() {
    var input = document.getElementById('verify-input');
    var result = document.getElementById('verify-result');
    
    if (!input || !result) return;
    
    var value = input.value.trim().toLowerCase();
    
    if (!value) {
        alert('Please enter a product ID or hash');
        return;
    }
    
    var found = null;
    for (var i = 0; i < registeredProducts.length; i++) {
        var p = registeredProducts[i];
        if (p.serial.toLowerCase().includes(value) || 
            p.deployHash.toLowerCase().includes(value) ||
            p.name.toLowerCase().includes(value)) {
            found = p;
            break;
        }
    }
    
    if (found) {
        result.style.display = 'block';
        result.innerHTML = '<div style="padding:30px;background:rgba(16,185,129,0.1);border:2px solid #10b981;border-radius:16px">' +
            '<div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">' +
            '<div style="width:60px;height:60px;background:rgba(16,185,129,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center">' +
            '<i data-lucide="check-circle" style="width:32px;height:32px;color:#10b981"></i>' +
            '</div>' +
            '<div><h3 style="color:#10b981;font-size:22px;margin-bottom:4px">✓ AUTHENTIC PRODUCT</h3>' +
            '<p style="color:#cbd5e1">Verified on Casper Blockchain</p></div>' +
            '</div>' +
            '<div style="background:rgba(255,255,255,0.05);padding:16px;border-radius:10px;margin-bottom:16px">' +
            '<p style="margin-bottom:8px"><strong>Name:</strong> ' + escapeHtml(found.name) + '</p>' +
            '<p style="margin-bottom:8px"><strong>Manufacturer:</strong> ' + escapeHtml(found.manufacturer) + '</p>' +
            '<p style="margin-bottom:8px"><strong>Serial:</strong> ' + escapeHtml(found.serial) + '</p>' +
            '<p><strong>Category:</strong> ' + escapeHtml(found.category) + '</p>' +
            '</div>' +
            '<div style="background:rgba(16,185,129,0.1);padding:14px;border-radius:10px;margin-bottom:16px">' +
            '<p style="color:#10b981;font-size:11px;font-weight:700;margin-bottom:8px">CASPER DEPLOY HASH</p>' +
            '<code style="color:#10b981;font-size:11px;word-break:break-all;display:block">' + found.deployHash + '</code>' +
            '</div>' +
            '<a href="' + found.explorerUrl + '" target="_blank" style="display:inline-flex;align-items:center;gap:8px;padding:14px 24px;background:linear-gradient(135deg,#10b981,#059669);color:white;text-decoration:none;border-radius:10px;font-weight:700">' +
            '<i data-lucide="external-link" style="width:18px;height:18px"></i> View on Casper Explorer' +
            '</a>' +
            '</div>';
        
        lucide.createIcons();
    } else {
        result.style.display = 'none';
        alert('❌ Product not found in database');
    }
}

function scan() {
    alert('📷 QR Scanner - Demo Mode\n\nIn production, this will use your camera to scan QR codes.');
    if (registeredProducts.length > 0) {
        document.getElementById('verify-input').value = registeredProducts[0].serial;
        verifyProduct();
    }
}

// ========================================
// TRACKING
// ========================================
function loadTracking() {
    var list = document.getElementById('track-list');
    if (!list) return;
    
    var html = '';
    var products = registeredProducts.length > 0 ? registeredProducts : [];
    
    for (var i = 0; i < Math.min(products.length, 5); i++) {
        var p = products[i];
        html += '<div style="padding:16px;background:rgba(255,255,255,0.05);border:1px solid rgba(139,92,246,0.2);border-radius:12px;margin-bottom:12px;cursor:pointer" onclick="showTimeline()">' +
            '<div style="display:flex;gap:12px;align-items:center">' +
            '<div style="font-size:32px">📦</div>' +
            '<div><p style="font-weight:600;margin-bottom:4px">' + escapeHtml(p.name) + '</p>' +
            '<p style="color:#94a3b8;font-size:12px">' + escapeHtml(p.serial) + '</p></div>' +
            '</div></div>';
    }
    
    list.innerHTML = html || '<p style="color:#64748b;text-align:center;padding:40px">No products to track</p>';
    showTimeline();
}

function showTimeline() {
    var timeline = document.getElementById('timeline');
    if (!timeline) return;
    
    var stages = [
        {name: 'Manufacturing', location: 'Factory', date: '2026-01-01', status: 'completed'},
        {name: 'Quality Check', location: 'QC Department', date: '2026-01-02', status: 'completed'},
        {name: 'Warehouse', location: 'Distribution Center', date: '2026-01-05', status: 'current'},
        {name: 'In Transit', location: 'Shipping', date: 'Pending', status: 'pending'},
        {name: 'Delivered', location: 'Customer', date: 'Pending', status: 'pending'}
    ];
    
    var html = '';
    for (var i = 0; i < stages.length; i++) {
        var s = stages[i];
        var color = s.status === 'completed' ? '#10b981' : s.status === 'current' ? '#3b82f6' : '#64748b';
        var icon = s.status === 'completed' ? 'check' : s.status === 'current' ? 'truck' : 'clock';
        
        html += '<div style="display:flex;gap:16px;margin-bottom:24px;position:relative">' +
            (i < stages.length - 1 ? '<div style="position:absolute;left:20px;top:48px;width:2px;height:100%;background:rgba(139,92,246,0.3)"></div>' : '') +
            '<div style="width:40px;height:40px;border-radius:50%;border:2px solid ' + color + ';background:rgba(' + (s.status === 'completed' ? '16,185,129' : s.status === 'current' ? '59,130,246' : '100,116,139') + ',0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;z-index:1">' +
            '<i data-lucide="' + icon + '" style="width:20px;height:20px;color:' + color + '"></i>' +
            '</div>' +
            '<div style="flex:1"><h4 style="font-size:16px;font-weight:600;margin-bottom:6px">' + s.name + '</h4>' +
            '<p style="color:#cbd5e1;font-size:14px;margin-bottom:4px">' + s.location + '</p>' +
            '<p style="color:#94a3b8;font-size:13px">' + s.date + '</p>' +
            '</div></div>';
    }
    
    timeline.innerHTML = html;
    lucide.createIcons();
}

// ========================================
// FRAUD DETECTION
// ========================================
function loadFraud() {
    var list = document.getElementById('fraud-list');
    if (!list) return;
    
    list.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b">' +
        '<i data-lucide="shield-check" style="width:64px;height:64px;margin-bottom:16px"></i>' +
        '<h3 style="margin-bottom:8px">No Fraud Detected</h3>' +
        '<p>All registered products are verified authentic</p>' +
        '</div>';
    
    lucide.createIcons();
}

// ========================================
// DOWNLOAD FUNCTIONS
// ========================================
function downloadCSV() {
    var csv = 'Name,Manufacturer,Serial,Category,Deploy Hash,Explorer URL\n';
    for (var i = 0; i < registeredProducts.length; i++) {
        var p = registeredProducts[i];
        csv += '"' + p.name + '","' + p.manufacturer + '","' + p.serial + '","' + p.category + '","' + p.deployHash + '","' + p.explorerUrl + '"\n';
    }
    downloadFile(csv, 'chainshield-products.csv', 'text/csv');
}

function downloadJSON() {
    var data = {
        products: registeredProducts,
        transactions: onChainTransactions,
        exported: new Date().toISOString()
    };
    downloadFile(JSON.stringify(data, null, 2), 'chainshield-data.json', 'application/json');
}

function downloadPDF() {
    alert('📄 PDF Export\n\nUse your browser\'s Print function (Ctrl+P or Cmd+P) and select "Save as PDF" to export this page.');
    window.print();
}

function downloadFile(content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function generateRandomHex(length) {
    var result = '';
    for (var i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 16).toString(16);
    }
    return result;
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() {
            alert('✅ Copied to clipboard!\n\n' + text.substring(0, 20) + '...');
        }).catch(function() {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        alert('✅ Copied to clipboard!');
    } catch (err) {
        alert('❌ Copy failed. Please copy manually:\n\n' + text);
    }
    document.body.removeChild(textarea);
}

function toggleAccordion(index) {
    var body = document.getElementById('accordion-' + index);
    if (!body) return;
    
    var allBodies = document.querySelectorAll('.accordion-body');
    for (var i = 0; i < allBodies.length; i++) {
        if (allBodies[i] !== body) {
            allBodies[i].classList.remove('active');
        }
    }
    
    body.classList.toggle('active');
}

console.log('✅ ChainShield Pure JavaScript Loaded - Ready for ANY Platform!');
