// 初始化应用
class FinanceTracker {
    constructor() {
        this.data = [];
        this.loadData();
        this.initEventListeners();
        this.renderTable();
        this.updateCharts();
    }

    // 从 LocalStorage 加载数据
    loadData() {
        const saved = localStorage.getItem('financeData');
        this.data = saved ? JSON.parse(saved) : [];
    }

    // 保存数据到 LocalStorage
    saveData() {
        localStorage.setItem('financeData', JSON.stringify(this.data));
    }

    // 初始化事件监听
    initEventListeners() {
        document.getElementById('addBtn').addEventListener('click', () => this.addRecord());
    }

    // 添加新记录
    addRecord() {
        const date = document.getElementById('dateInput').value;
        if (!date) {
            alert('请选择日期');
            return;
        }

        const record = {
            date: date,
            pingAn_bank_total: parseFloat(document.getElementById('pingAn_bank_total').value) || 0,
            pingAn_security_total: parseFloat(document.getElementById('pingAn_security_total').value) || 0,
            alipay_total: parseFloat(document.getElementById('alipay_total').value) || 0,
            agriculture_bank_total: parseFloat(document.getElementById('agriculture_bank_total').value) || 0,
            pingAn_bank_fund: parseFloat(document.getElementById('pingAn_bank_fund').value) || 0,
            pingAn_security_fund: parseFloat(document.getElementById('pingAn_security_fund').value) || 0,
            alipay_fund: parseFloat(document.getElementById('alipay_fund').value) || 0,
            xueqiu_fund: parseFloat(document.getElementById('xueqiu_fund').value) || 0,
            sf_stock: parseFloat(document.getElementById('sf_stock').value) || 0,
        }

        // 计算衍生数据
        // 现金流 = 账户总值 - 基金投资
        record.cash = (record.pingAn_bank_total - record.pingAn_bank_fund) +
            (record.pingAn_security_total - record.pingAn_security_fund) +
            (record.alipay_total - record.alipay_fund) +
            record.agriculture_bank_total;

        // 基金资产 = 所有基金市值
        record.funds = record.pingAn_bank_fund + record.pingAn_security_fund + record.alipay_fund + record.xueqiu_fund;

        // 股票资产 = 顺丰控股市值
        record.stocks = record.sf_stock;

        // 总资产 = 所有账户总值 + 所有基金 + 股票
        record.total = record.pingAn_bank_total + record.pingAn_security_total +
            record.alipay_total + record.agriculture_bank_total +
            record.xueqiu_fund + record.sf_stock;

        // 检查是否已存在相同日期的记录
        const existingIndex = this.data.findIndex(r => r.date === date);
        if (existingIndex !== -1) {
            this.data[existingIndex] = record;
            alert('该月份记录已更新');
        } else {
            this.data.push(record);
            alert('记录添加成功');
        }

        this.data.sort((a, b) => new Date(a.date) - new Date(b.date));
        this.saveData();
        this.clearForm();
        this.renderTable();
        this.updateCharts();
    }

    // 清空表单
    clearForm() {
        document.getElementById('dateInput').value = '';
        document.getElementById('pingAn_bank_total').value = '';
        document.getElementById('pingAn_security_total').value = '';
        document.getElementById('alipay_total').value = '';
        document.getElementById('agriculture_bank_total').value = '';
        document.getElementById('pingAn_bank_fund').value = '';
        document.getElementById('pingAn_security_fund').value = '';
        document.getElementById('alipay_fund').value = '';
        document.getElementById('xueqiu_fund').value = '';
        document.getElementById('sf_stock').value = '';
    }

    // 删除记录
    deleteRecord(index) {
        if (confirm('确认要删除这条记录吗？')) {
            this.data.splice(index, 1);
            this.saveData();
            this.renderTable();
            this.updateCharts();
        }
    }

    // 渲染表格
renderTable() {
    this.renderAccountsTable();
    this.renderFundsTable();
    this.renderDerivedTable();
}

// 渲染账户总值表格
renderAccountsTable() {
    const tbody = document.getElementById('accountsTableBody');
    tbody.innerHTML = '';

    this.data.forEach((record, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${record.date}</td>
            <td>¥ ${record.pingAn_bank_total.toFixed(2)}</td>
            <td>¥ ${record.pingAn_security_total.toFixed(2)}</td>
            <td>¥ ${record.alipay_total.toFixed(2)}</td>
            <td>¥ ${record.agriculture_bank_total.toFixed(2)}</td>
            <td><button class="btn-delete" onclick="tracker.deleteRecord(${index})">删除</button></td>
        `;
    });
}

// 渲染基金市值表格
renderFundsTable() {
    const tbody = document.getElementById('fundsTableBody');
    tbody.innerHTML = '';

    this.data.forEach((record, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${record.date}</td>
            <td>¥ ${record.pingAn_bank_fund.toFixed(2)}</td>
            <td>¥ ${record.pingAn_security_fund.toFixed(2)}</td>
            <td>¥ ${record.alipay_fund.toFixed(2)}</td>
            <td>¥ ${record.xueqiu_fund.toFixed(2)}</td>
            <td><button class="btn-delete" onclick="tracker.deleteRecord(${index})">删除</button></td>
        `;
    });
}

// 渲染衍生数据表格
renderDerivedTable() {
    const tbody = document.getElementById('derivedTableBody');
    tbody.innerHTML = '';

    this.data.forEach((record, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${record.date}</td>
            <td>¥ ${record.sf_stock.toFixed(2)}</td>
            <td>¥ ${record.cash.toFixed(2)}</td>
            <td>¥ ${record.funds.toFixed(2)}</td>
            <td>¥ ${record.stocks.toFixed(2)}</td>
            <td><strong>¥ ${record.total.toFixed(2)}</strong></td>
            <td><button class="btn-delete" onclick="tracker.deleteRecord(${index})">删除</button></td>
        `;
    });
}

    // 更新图表
    updateCharts() {
        this.updateCashChart();
        this.updateTotalChart();
        this.updatePieChart();
    }

    // 现金流趋势图表
    updateCashChart() {
        const chartDom = document.getElementById('cashChart');
        const myChart = echarts.init(chartDom);

        if (this.data.length === 0) {
            myChart.setOption({
                xAxis: { type: 'category', data: [] },
                yAxis: { type: 'value' },
                series: [{ data: [], type: 'line' }]
            });
            return;
        }

        const option = {
            color: ['#2E8B57'],
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(44, 62, 80, 0.9)',
                borderColor: 'transparent',
                textStyle: { color: '#FFFFFF' },
                borderRadius: 8,
                padding: [12, 16]
            },
            grid: { left: '10%', right: '4%', bottom: '12%', top: '4%', containLabel: true },
            xAxis: {
                type: 'category',
                data: this.data.map(d => d.date),
                boundaryGap: false,
                axisLine: { lineStyle: { color: '#ECF0F1' } },
                axisLabel: { color: '#95A5A6', fontSize: 12 }
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#ECF0F1' } },
                axisLabel: { color: '#95A5A6', fontSize: 12 },
                splitLine: { lineStyle: { color: '#F5F7FA', type: 'dashed' } }
            },
            series: [{
                name: '现金流',
                type: 'line',
                data: this.data.map(d => d.cash),
                smooth: 0.3,
                itemStyle: { color: '#2E8B57' },
                areaStyle: { color: 'rgba(46, 139, 87, 0.08)' },
                lineStyle: { width: 2.5, color: '#2E8B57' },
                symbolSize: 6
            }]
        };

        myChart.setOption(option);
    }

    // 总资产增长图表
    updateTotalChart() {
        const chartDom = document.getElementById('totalChart');
        const myChart = echarts.init(chartDom);

        if (this.data.length === 0) {
            myChart.setOption({
                xAxis: { type: 'category', data: [] },
                yAxis: { type: 'value' },
                series: [{ data: [], type: 'line' }]
            });
            return;
        }

        const option = {
            color: ['#7C4DFF'],
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(44, 62, 80, 0.9)',
                borderColor: 'transparent',
                textStyle: { color: '#FFFFFF' },
                borderRadius: 8,
                padding: [12, 16]
            },
            grid: { left: '10%', right: '4%', bottom: '12%', top: '4%', containLabel: true },
            xAxis: {
                type: 'category',
                data: this.data.map(d => d.date),
                boundaryGap: false,
                axisLine: { lineStyle: { color: '#ECF0F1' } },
                axisLabel: { color: '#95A5A6', fontSize: 12 }
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#ECF0F1' } },
                axisLabel: { color: '#95A5A6', fontSize: 12 },
                splitLine: { lineStyle: { color: '#F5F7FA', type: 'dashed' } }
            },
            series: [{
                name: '总资产',
                type: 'line',
                data: this.data.map(d => d.total),
                smooth: 0.3,
                itemStyle: { color: '#7C4DFF' },
                areaStyle: { color: 'rgba(124, 77, 255, 0.08)' },
                lineStyle: { width: 2.5, color: '#7C4DFF' },
                symbolSize: 6
            }]
        };

        myChart.setOption(option);
    }

    // 资产配置图表
    updatePieChart() {
        const chartDom = document.getElementById('pieChart');
        const myChart = echarts.init(chartDom);

        if (this.data.length === 0) {
            myChart.setOption({
                series: [{ data: [], type: 'pie' }]
            });
            return;
        }

        const latest = this.data[this.data.length - 1];

        const option = {
            color: ['#2E8B57', '#FFB347', '#1E88E5'],
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(44, 62, 80, 0.9)',
                borderColor: 'transparent',
                textStyle: { color: '#FFFFFF' },
                borderRadius: 8,
                padding: [12, 16],
                formatter: function (params) {
                    return '<div style="font-weight: 500;">' + params.name + '</div>' +
                        '金额: ¥' + params.value.toFixed(2) + '<br/>' +
                        '占比: ' + params.percent + '%';
                }
            },
            series: [{
                name: '资产配置',
                type: 'pie',
                radius: ['35%', '75%'],
                data: [
                    { value: latest.cash, name: '现金流' },
                    { value: latest.funds, name: '基金资产' },
                    { value: latest.stocks, name: '股票资产' }
                ],
                label: {
                    show: false
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 20,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.2)'
                    }
                }
            }]
        };

        myChart.setOption(option);
    }
}

// ==================== 头像管理 ====================

class AvatarManager {
    constructor() {
        this.avatarCircle = document.getElementById('avatarCircle');
        this.avatarInput = document.getElementById('avatarInput');
        this.avatarImage = document.getElementById('avatarImage');
        this.avatarPlaceholder = document.getElementById('avatarPlaceholder');

        this.init();
    }

    init() {
        // 从 LocalStorage 加载头像
        this.loadAvatar();

        // 点击圆形打开文件选择器
        this.avatarCircle.addEventListener('click', () => {
            this.avatarInput.click();
        });

        // 文件选择后处理
        this.avatarInput.addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });
    }

    // 处理文件选择
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }

        // 检查文件大小（限制为 2MB）
        if (file.size > 2 * 1024 * 1024) {
            alert('图片文件过大，请选择小于 2MB 的图片');
            return;
        }

        // 使用 FileReader 读取图片
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            this.setAvatar(imageData);
        };
        reader.readAsDataURL(file);
    }

    // 设置头像
    setAvatar(imageData) {
        this.avatarImage.src = imageData;
        this.avatarImage.classList.add('show');
        this.avatarPlaceholder.classList.add('hide');

        // 保存到 LocalStorage
        this.saveAvatar(imageData);
    }

    // 保存头像到 LocalStorage
    saveAvatar(imageData) {
        localStorage.setItem('userAvatar', imageData);
    }

    // 从 LocalStorage 加载头像
    loadAvatar() {
        const savedAvatar = localStorage.getItem('userAvatar');
        if (savedAvatar) {
            this.avatarImage.src = savedAvatar;
            this.avatarImage.classList.add('show');
            this.avatarPlaceholder.classList.add('hide');
        }
    }

    // 删除头像
    removeAvatar() {
        this.avatarImage.src = '';
        this.avatarImage.classList.remove('show');
        this.avatarPlaceholder.classList.remove('hide');
        localStorage.removeItem('userAvatar');
        this.avatarInput.value = '';
    }
}

// ==================== Tab 切换功能 ====================

class TabManager {
    constructor() {
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.table-tab-content');
        
        this.init();
    }

    init() {
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn));
        });
    }

    switchTab(btn) {
        const tabName = btn.getAttribute('data-tab');

        // 移除所有 active 类
        this.tabBtns.forEach(b => b.classList.remove('active'));
        this.tabContents.forEach(c => c.classList.remove('active'));

        // 添加 active 类到当前 Tab
        btn.classList.add('active');
        document.getElementById(`${tabName}Table`).classList.add('active');
    }
}

// ==================== 应用启动 ====================

let tracker;
let avatarManager;
let tabManager;

document.addEventListener('DOMContentLoaded', () => {
    avatarManager = new AvatarManager();
    tracker = new FinanceTracker();
    tabManager = new TabManager();  // 新增
});