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
        }

        // 计算衍生数据
        record.cash = (record.alipayTotal - record.alipayFund) +
            (record.bankTotal - record.bankFund) +
            (record.securityTotal - record.securityFund - record.sfExpress) +
            record.agricultureBank;
        record.funds = record.alipayFund + record.bankFund + record.eggFund + record.securityFund;
        record.stocks = record.sfExpress;
        record.total = record.alipayTotal + record.bankTotal + record.eggFund +
            record.securityTotal + record.agricultureBank;

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

// 应用启动
let tracker;
document.addEventListener('DOMContentLoaded', () => {
    tracker = new FinanceTracker();
});