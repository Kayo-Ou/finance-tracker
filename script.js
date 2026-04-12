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
            alipayTotal: parseFloat(document.getElementById('alipayTotal').value) || 0,
            alipayFund: parseFloat(document.getElementById('alipayFund').value) || 0,
            bankTotal: parseFloat(document.getElementById('bankTotal').value) || 0,
            bankFund: parseFloat(document.getElementById('bankFund').value) || 0,
            eggFund: parseFloat(document.getElementById('eggFund').value) || 0,
            securityTotal: parseFloat(document.getElementById('securityTotal').value) || 0,
            securityFund: parseFloat(document.getElementById('securityFund').value) || 0,
            agricultureBank: parseFloat(document.getElementById('agricultureBank').value) || 0,
            sfExpress: parseFloat(document.getElementById('sfExpress').value) || 0,
        };

        // 计算衍生数据
        record.cash = record.alipayTotal + record.bankTotal + record.agricultureBank - 
                      record.alipayFund - record.bankFund;
        record.funds = record.alipayFund + record.bankFund + record.eggFund + record.securityFund;
        record.stocks = record.securityTotal - record.securityFund + record.sfExpress;
        record.total = record.alipayTotal + record.bankTotal + record.eggFund + 
                       record.securityTotal + record.agricultureBank + record.sfExpress;

        // 检查是否已存在相同日期的记录
        const existingIndex = this.data.findIndex(r => r.date === date);
        if (existingIndex !== -1) {
            this.data[existingIndex] = record;
            alert('该月份记录已更新！');
        } else {
            this.data.push(record);
            alert('记录添加成功！');
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
        document.getElementById('alipayTotal').value = '';
        document.getElementById('alipayFund').value = '';
        document.getElementById('bankTotal').value = '';
        document.getElementById('bankFund').value = '';
        document.getElementById('eggFund').value = '';
        document.getElementById('securityTotal').value = '';
        document.getElementById('securityFund').value = '';
        document.getElementById('agricultureBank').value = '';
        document.getElementById('sfExpress').value = '';
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
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        this.data.forEach((record, index) => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${record.date}</td>
                <td>¥ ${record.alipayTotal.toFixed(2)}</td>
                <td>¥ ${record.alipayFund.toFixed(2)}</td>
                <td>¥ ${record.bankTotal.toFixed(2)}</td>
                <td>¥ ${record.bankFund.toFixed(2)}</td>
                <td>¥ ${record.eggFund.toFixed(2)}</td>
                <td>¥ ${record.securityTotal.toFixed(2)}</td>
                <td>¥ ${record.securityFund.toFixed(2)}</td>
                <td>¥ ${record.agricultureBank.toFixed(2)}</td>
                <td>¥ ${record.sfExpress.toFixed(2)}</td>
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
        if (this.data.length === 0) {
            return;
        }

        this.updateCashChart();
        this.updatePieChart();
        this.updateTotalChart();
    }

    // 现金存款变化图表
    updateCashChart() {
        const chartDom = document.getElementById('cashChart');
        const myChart = echarts.init(chartDom);

        const dates = this.data.map(r => r.date);
        const cashValues = this.data.map(r => r.cash);

        const option = {
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: dates },
            yAxis: { type: 'value' },
            series: [{
                data: cashValues,
                type: 'line',
                smooth: true,
                itemStyle: { color: '#667eea' },
                areaStyle: { color: 'rgba(102, 126, 234, 0.2)' }
            }]
        };

        myChart.setOption(option);
    }

    // 资产占比图表
    updatePieChart() {
        const chartDom = document.getElementById('pieChart');
        const myChart = echarts.init(chartDom);

        if (this.data.length === 0) return;

        const latest = this.data[this.data.length - 1];

        const option = {
            tooltip: { trigger: 'item' },
            series: [{
                name: '资产占比',
                type: 'pie',
                radius: '50%',
                data: [
                    { value: latest.cash, name: '现金存款' },
                    { value: latest.funds, name: '投资基金' },
                    { value: latest.stocks, name: '持有股票' }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };

        myChart.setOption(option);
    }

    // 总资产变化图表
    updateTotalChart() {
        const chartDom = document.getElementById('totalChart');
        const myChart = echarts.init(chartDom);

        const dates = this.data.map(r => r.date);
        const totalValues = this.data.map(r => r.total);

        const option = {
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: dates },
            yAxis: { type: 'value' },
            series: [{
                data: totalValues,
                type: 'line',
                smooth: true,
                itemStyle: { color: '#764ba2' },
                areaStyle: { color: 'rgba(118, 75, 162, 0.2)' }
            }]
        };

        myChart.setOption(option);
    }
}

// 应用启动
let tracker;
document.addEventListener('DOMContentLoaded', () => {
    tracker = new FinanceTracker();
});
