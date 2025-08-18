import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingDown, TrendingUp, BarChart3, PieChart, Download } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Transaction {
    id: number;
    amount: string;
    description: string;
    transaction_type: 'income' | 'expense';
    date: string;
    used_by?: string;
    category: {
        id: number;
        name: string;
        color: string;
    };
}

interface ReportsProps {
    transactions: Transaction[];
    categories: Array<{
        id: number;
        name: string;
        type: 'income' | 'expense';
        color: string;
    }>;
}

export default function Reports({ transactions, categories }: ReportsProps) {
    const [activeTab, setActiveTab] = useState('daily');
    const [selectedPeriod, setSelectedPeriod] = useState('7');
    const [exportStartDate, setExportStartDate] = useState('');
    const [exportEndDate, setExportEndDate] = useState('');

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(parseFloat(amount));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Calculate daily data
    const dailyData = useMemo(() => {
        const days = parseInt(selectedPeriod);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days + 1);

        const dailyStats = [];
        for (let i = 0; i < days; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];

            const dayTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date).toISOString().split('T')[0];
                return transactionDate === dateStr;
            });

            const income = dayTransactions
                .filter(t => t.transaction_type === 'income')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            const expenses = dayTransactions
                .filter(t => t.transaction_type === 'expense')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            dailyStats.push({
                date: dateStr,
                formattedDate: formatDate(dateStr),
                income,
                expenses,
                net: income - expenses,
                transactionCount: dayTransactions.length
            });
        }

        return dailyStats.filter(day => day.transactionCount > 0);
    }, [transactions, selectedPeriod]);

    // Calculate weekly data
    const weeklyData = useMemo(() => {
        const weeks = 4; // Last 4 weeks
        const weeklyStats = [];
        
        for (let i = 0; i < weeks; i++) {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() - (i * 7));
            const startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - 6);

            const weekTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= startDate && transactionDate <= endDate;
            });

            const income = weekTransactions
                .filter(t => t.transaction_type === 'income')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            const expenses = weekTransactions
                .filter(t => t.transaction_type === 'expense')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0);

            weeklyStats.unshift({
                weekLabel: `Week ${weeks - i}`,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                income,
                expenses,
                net: income - expenses,
                transactionCount: weekTransactions.length
            });
        }

        return weeklyStats.filter(week => week.transactionCount > 0);
    }, [transactions]);

    // Category breakdown
    const categoryBreakdown = useMemo(() => {
        const breakdown = categories.map(category => {
            const categoryTransactions = transactions.filter(t => 
                t.category.id === category.id
            );
            
            const total = categoryTransactions.reduce((sum, t) => 
                sum + parseFloat(t.amount), 0
            );

            return {
                ...category,
                total,
                transactionCount: categoryTransactions.length,
                percentage: 0 // Will be calculated after
            };
        }).filter(c => c.total > 0);

        const totalAmount = breakdown.reduce((sum, c) => sum + c.total, 0);
        
        return breakdown.map(c => ({
            ...c,
            percentage: totalAmount > 0 ? (c.total / totalAmount) * 100 : 0
        })).sort((a, b) => b.total - a.total);
    }, [transactions, categories]);

    const totalIncome = transactions
        .filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = transactions
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const SimpleBarChart = ({ data, type }: { data: any[], type: 'daily' | 'weekly' }) => {
        const maxValue = Math.max(...data.map(d => Math.max(d.income, d.expenses)));
        
        return (
            <div className="space-y-4">
                {data.map((item, index) => {
                    const label = type === 'daily' ? item.formattedDate : item.weekLabel;
                    return (
                        <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">{label}</span>
                                <span className="text-muted-foreground">
                                    Net: {formatCurrency(item.net.toString())}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <div className="w-16 text-xs text-green-600">Income</div>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-green-500 h-2 rounded-full" 
                                            style={{ width: `${maxValue > 0 ? (item.income / maxValue) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="w-20 text-xs text-right">
                                        {formatCurrency(item.income.toString())}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-16 text-xs text-red-600">Expenses</div>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-red-500 h-2 rounded-full" 
                                            style={{ width: `${maxValue > 0 ? (item.expenses / maxValue) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="w-20 text-xs text-right">
                                        {formatCurrency(item.expenses.toString())}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const CategoryPieChart = ({ data }: { data: typeof categoryBreakdown }) => {
        return (
            <div className="space-y-3">
                {data.slice(0, 8).map((category, index) => (
                    <div key={category.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-semibold">
                                {formatCurrency(category.total.toString())}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {category.percentage.toFixed(1)}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };



    const exportToPDF = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        
        const currentDate = new Date().toLocaleDateString();
        const reportType = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
        
        // Determine report period for title
        let reportPeriod = '';
        if (exportStartDate && exportEndDate) {
            const startDate = new Date(exportStartDate).toLocaleDateString();
            const endDate = new Date(exportEndDate).toLocaleDateString();
            reportPeriod = ` (${startDate} - ${endDate})`;
        } else {
            reportPeriod = ` (Last ${selectedPeriod} days)`;
        }
        
        let tableContent = '';
        let transactionsContent = '';
        
        // Filter transactions based on custom date range or default period
        let filteredTransactions = transactions;
        
        if (exportStartDate && exportEndDate) {
            // Use custom date range
            const startDate = new Date(exportStartDate);
            const endDate = new Date(exportEndDate);
            endDate.setHours(23, 59, 59, 999); // Include the entire end date
            
            filteredTransactions = transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= startDate && transactionDate <= endDate;
            });
        } else {
            // Use default period filtering
            if (activeTab === 'daily') {
                const days = parseInt(selectedPeriod);
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(endDate.getDate() - days + 1);
                
                filteredTransactions = transactions.filter(t => {
                    const transactionDate = new Date(t.date);
                    return transactionDate >= startDate && transactionDate <= endDate;
                });
            } else if (activeTab === 'weekly') {
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(endDate.getDate() - 27); // Last 4 weeks
                
                filteredTransactions = transactions.filter(t => {
                    const transactionDate = new Date(t.date);
                    return transactionDate >= startDate && transactionDate <= endDate;
                });
            }
        }
        
        // Sort transactions by date (newest first)
        filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        if (activeTab === 'daily' && dailyData.length > 0) {
            tableContent = `
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background-color: #f3f4f6;">
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Date</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Income</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Expenses</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Net</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Transactions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dailyData.map(day => `
                            <tr>
                                <td style="border: 1px solid #d1d5db; padding: 8px;">${day.formattedDate}</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right; color: #059669;">${formatCurrency(day.income.toString())}</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right; color: #dc2626;">${formatCurrency(day.expenses.toString())}</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right; color: ${day.net >= 0 ? '#059669' : '#dc2626'};">${formatCurrency(day.net.toString())}</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${day.transactionCount}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else if (activeTab === 'weekly' && weeklyData.length > 0) {
            tableContent = `
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background-color: #f3f4f6;">
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Week</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Period</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Income</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Expenses</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Net</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Transactions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${weeklyData.map(week => `
                            <tr>
                                <td style="border: 1px solid #d1d5db; padding: 8px;">${week.weekLabel}</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px;">${formatDate(week.startDate)} - ${formatDate(week.endDate)}</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right; color: #059669;">${formatCurrency(week.income.toString())}</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right; color: #dc2626;">${formatCurrency(week.expenses.toString())}</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right; color: ${week.net >= 0 ? '#059669' : '#dc2626'};">${formatCurrency(week.net.toString())}</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${week.transactionCount}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else if (activeTab === 'categories' && categoryBreakdown.length > 0) {
            tableContent = `
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background-color: #f3f4f6;">
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Category</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Type</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: right;">Total Amount</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Percentage</th>
                            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">Transactions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${categoryBreakdown.map(category => `
                            <tr>
                                <td style="border: 1px solid #d1d5db; padding: 8px;">
                                    <div style="display: flex; align-items: center;">
                                        <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${category.color}; margin-right: 8px;"></div>
                                        ${category.name}
                                    </div>
                                </td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center; text-transform: capitalize;">${category.type}</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: right; color: ${category.type === 'income' ? '#059669' : '#dc2626'};">${formatCurrency(category.total.toString())}</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${category.percentage.toFixed(1)}%</td>
                                <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${category.transactionCount}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
        
        // Add detailed transactions table
        if (filteredTransactions.length > 0) {
            transactionsContent = `
                <div style="page-break-before: auto; margin-top: 30px;">
                    <h3>Transaction Details</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px;">
                        <thead>
                            <tr style="background-color: #f3f4f6;">
                                 <th style="border: 1px solid #d1d5db; padding: 6px; text-align: left;">Date</th>
                                 <th style="border: 1px solid #d1d5db; padding: 6px; text-align: left;">Description</th>
                                 <th style="border: 1px solid #d1d5db; padding: 6px; text-align: left;">Category</th>
                                 <th style="border: 1px solid #d1d5db; padding: 6px; text-align: center;">Type</th>
                                 <th style="border: 1px solid #d1d5db; padding: 6px; text-align: left;">Used By</th>
                                 <th style="border: 1px solid #d1d5db; padding: 6px; text-align: right;">Amount</th>
                             </tr>
                        </thead>
                        <tbody>
                            ${filteredTransactions.map(transaction => `
                                 <tr>
                                     <td style="border: 1px solid #d1d5db; padding: 6px;">${formatDate(transaction.date)}</td>
                                     <td style="border: 1px solid #d1d5db; padding: 6px;">${transaction.description}</td>
                                     <td style="border: 1px solid #d1d5db; padding: 6px;">
                                         <div style="display: flex; align-items: center;">
                                             <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${transaction.category.color}; margin-right: 6px;"></div>
                                             ${transaction.category.name}
                                         </div>
                                     </td>
                                     <td style="border: 1px solid #d1d5db; padding: 6px; text-align: center; text-transform: capitalize;">${transaction.transaction_type}</td>
                                     <td style="border: 1px solid #d1d5db; padding: 6px;">${transaction.used_by || 'N/A'}</td>
                                     <td style="border: 1px solid #d1d5db; padding: 6px; text-align: right; color: ${transaction.transaction_type === 'income' ? '#059669' : '#dc2626'}; font-weight: bold;">${formatCurrency(transaction.amount)}</td>
                                 </tr>
                             `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Petty Cash Manager - ${reportType} Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .summary { background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
                    .summary-item { text-align: center; }
                    .summary-label { font-size: 14px; color: #6b7280; }
                    .summary-value { font-size: 18px; font-weight: bold; }
                    .income { color: #059669; }
                    .expense { color: #dc2626; }
                    .net { color: #2563eb; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>${reportType} Report${reportPeriod}</h2>
                    <p>Generated on: ${currentDate}</p>
                </div>
                
                <div class="summary">
                    <h3>Summary Statistics</h3>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <div class="summary-label">Total Income</div>
                            <div class="summary-value income">${formatCurrency(totalIncome.toString())}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Total Expenses</div>
                            <div class="summary-value expense">${formatCurrency(totalExpenses.toString())}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Net Balance</div>
                            <div class="summary-value ${totalIncome - totalExpenses >= 0 ? 'income' : 'expense'}">${formatCurrency((totalIncome - totalExpenses).toString())}</div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3>${reportType} Details</h3>
                    ${tableContent}
                </div>
                
                ${transactionsContent}
                
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <AppLayout>
            <Head title="Reports" />
            
            <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                        <p className="text-muted-foreground">
                            Analyze your financial data with detailed reports and visualizations
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="flex flex-col space-y-1">
                                <Label htmlFor="start-date" className="text-xs">Start Date</Label>
                                <Input
                                    id="start-date"
                                    type="date"
                                    value={exportStartDate}
                                    onChange={(e) => setExportStartDate(e.target.value)}
                                    className="w-36"
                                />
                            </div>
                            <div className="flex flex-col space-y-1">
                                <Label htmlFor="end-date" className="text-xs">End Date</Label>
                                <Input
                                    id="end-date"
                                    type="date"
                                    value={exportEndDate}
                                    onChange={(e) => setExportEndDate(e.target.value)}
                                    className="w-36"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <Label className="text-xs opacity-0">Action</Label>
                            <Button 
                                variant="outline" 
                                className="flex items-center space-x-2"
                                onClick={exportToPDF}
                            >
                                <Download className="h-4 w-4" />
                                <span>Export PDF</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(totalIncome.toString())}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {formatCurrency(totalExpenses.toString())}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                            <BarChart3 className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${
                                totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {formatCurrency((totalIncome - totalExpenses).toString())}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Reports Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="daily">Daily Reports</TabsTrigger>
                        <TabsTrigger value="weekly">Weekly Reports</TabsTrigger>
                        <TabsTrigger value="categories">Category Analysis</TabsTrigger>
                    </TabsList>

                    <TabsContent value="daily" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Daily Transaction Analysis</h2>
                            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">Last 7 days</SelectItem>
                                    <SelectItem value="14">Last 14 days</SelectItem>
                                    <SelectItem value="30">Last 30 days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <BarChart3 className="h-5 w-5" />
                                        <span>Daily Income vs Expenses</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Compare daily income and expenses over the selected period
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <SimpleBarChart data={dailyData} type="daily" />
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle>Daily Summary</CardTitle>
                                    <CardDescription>
                                        Key metrics for the selected period
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 bg-green-50 rounded-lg">
                                            <div className="text-sm text-green-600 font-medium">Avg Daily Income</div>
                                            <div className="text-lg font-bold text-green-700">
                                                {formatCurrency((dailyData.reduce((sum, d) => sum + d.income, 0) / dailyData.length || 0).toString())}
                                            </div>
                                        </div>
                                        <div className="text-center p-3 bg-red-50 rounded-lg">
                                            <div className="text-sm text-red-600 font-medium">Avg Daily Expenses</div>
                                            <div className="text-lg font-bold text-red-700">
                                                {formatCurrency((dailyData.reduce((sum, d) => sum + d.expenses, 0) / dailyData.length || 0).toString())}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <div className="text-sm text-blue-600 font-medium">Total Transactions</div>
                                        <div className="text-lg font-bold text-blue-700">
                                            {dailyData.reduce((sum, d) => sum + d.transactionCount, 0)}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="weekly" className="space-y-4">
                        <h2 className="text-xl font-semibold">Weekly Transaction Trends</h2>
                        
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <BarChart3 className="h-5 w-5" />
                                        <span>Weekly Income vs Expenses</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Weekly comparison over the last 4 weeks
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <SimpleBarChart data={weeklyData} type="weekly" />
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle>Weekly Trends</CardTitle>
                                    <CardDescription>
                                        Analysis of weekly patterns
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {weeklyData.map((week, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                                            <div>
                                                <div className="font-medium">{week.weekLabel}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatDate(week.startDate)} - {formatDate(week.endDate)}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-semibold ${
                                                    week.net >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {formatCurrency(week.net.toString())}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {week.transactionCount} transactions
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="categories" className="space-y-4">
                        <h2 className="text-xl font-semibold">Category Analysis</h2>
                        
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <PieChart className="h-5 w-5" />
                                        <span>Spending by Category</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Breakdown of expenses by category
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CategoryPieChart data={categoryBreakdown.filter(c => c.type === 'expense')} />
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <PieChart className="h-5 w-5" />
                                        <span>Income by Category</span>
                                    </CardTitle>
                                    <CardDescription>
                                        Breakdown of income by category
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CategoryPieChart data={categoryBreakdown.filter(c => c.type === 'income')} />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}