import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Banknote, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';

interface Category {
    id: number;
    name: string;
    type: 'income' | 'expense';
    color: string;
}

interface Transaction {
    id: number;
    amount: string;
    description: string;
    used_by?: string;
    transaction_type: 'income' | 'expense';
    date: string;
    category: Category;
    receipt_path?: string;
}

interface Summary {
    totalIncome: string;
    totalExpenses: string;
    balance: string;
}

interface DashboardProps {
    transactions: Transaction[];
    categories: Category[];
    summary: Summary;
    recentTransactions: Transaction[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Petty Cash Manager',
        href: '/dashboard',
    },
];

export default function Dashboard({ transactions, categories, summary, recentTransactions }: DashboardProps) {
    const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [showCategoryConfirmModal, setShowCategoryConfirmModal] = useState(false);
    const [showCategorySuccessModal, setShowCategorySuccessModal] = useState(false);
    const [pendingCategoryAction, setPendingCategoryAction] = useState<'add' | 'edit' | null>(null);
    const [showTransactionConfirmModal, setShowTransactionConfirmModal] = useState(false);
    const [showTransactionSuccessModal, setShowTransactionSuccessModal] = useState(false);
    const [pendingTransactionAction, setPendingTransactionAction] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
    
    const { data: transactionData, setData: setTransactionData, post: postTransaction, put: putTransaction, processing: transactionProcessing, errors: transactionErrors, reset: resetTransaction, clearErrors } = useForm({
        amount: '',
        description: '',
        used_by: '',
        category_id: '',
        transaction_type: 'expense' as 'income' | 'expense',
        date: new Date().toISOString().split('T')[0],
        receipt: null as File | null,
    });
    
    const { data: categoryData, setData: setCategoryData, post: postCategory, put: putCategory, processing: categoryProcessing, errors: categoryErrors, reset: resetCategory } = useForm({
        name: '',
        type: 'expense' as 'income' | 'expense',
        color: '#EF4444',
    });
    
    const handleAddTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        setPendingTransactionAction('add');
        setShowTransactionConfirmModal(true);
    };
    
    const handleEditTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        setPendingTransactionAction('edit');
        setShowTransactionConfirmModal(true);
    };
    
    const handleDeleteTransaction = (id: number) => {
        setTransactionToDelete(id);
        setPendingTransactionAction('delete');
        setShowTransactionConfirmModal(true);
    };
    
    const confirmTransactionAction = () => {
        if (pendingTransactionAction === 'add') {
            // Debug: Log the form data being sent
            console.log('Submitting transaction data:', transactionData);
            
            // Create FormData manually to ensure proper serialization
            const formData = new FormData();
            formData.append('amount', transactionData.amount);
            formData.append('description', transactionData.description);
            formData.append('used_by', transactionData.used_by);
            formData.append('category_id', transactionData.category_id);
            formData.append('transaction_type', transactionData.transaction_type);
            formData.append('date', transactionData.date);
            if (transactionData.receipt) {
                formData.append('receipt', transactionData.receipt);
            }
            
            router.post('/transactions', formData, {
                onSuccess: () => {
                    setShowTransactionConfirmModal(false);
                    setShowTransactionSuccessModal(true);
                    setPendingTransactionAction(null);
                },
                onError: (errors) => {
                    console.log('Validation errors:', errors);
                    setShowTransactionConfirmModal(false);
                },
            });
        } else if (pendingTransactionAction === 'edit' && editingTransaction) {
            // Debug: Log the form data being sent
            console.log('Updating transaction data:', transactionData);
            
            // Create FormData manually to ensure proper serialization
            const formData = new FormData();
            formData.append('amount', transactionData.amount);
            formData.append('description', transactionData.description);
            formData.append('used_by', transactionData.used_by);
            formData.append('category_id', transactionData.category_id);
            formData.append('transaction_type', transactionData.transaction_type);
            formData.append('date', transactionData.date);
            formData.append('_method', 'PUT');
            if (transactionData.receipt) {
                formData.append('receipt', transactionData.receipt);
            }
            
            router.post(`/transactions/${editingTransaction.id}`, formData, {
                onSuccess: () => {
                    setShowTransactionConfirmModal(false);
                    setShowTransactionSuccessModal(true);
                    setPendingTransactionAction(null);
                },
                onError: (errors) => {
                    console.log('Validation errors:', errors);
                    setShowTransactionConfirmModal(false);
                },
            });
        } else if (pendingTransactionAction === 'delete' && transactionToDelete) {
            router.delete(`/transactions/${transactionToDelete}`, {
                onSuccess: () => {
                    setShowTransactionConfirmModal(false);
                    setShowTransactionSuccessModal(true);
                    setPendingTransactionAction(null);
                    setTransactionToDelete(null);
                },
                onError: () => {
                    setShowTransactionConfirmModal(false);
                    setTransactionToDelete(null);
                },
            });
        }
    };
    
    const handleTransactionSuccess = () => {
        setShowTransactionSuccessModal(false);
        if (pendingTransactionAction === 'add') {
            setIsAddTransactionOpen(false);
            resetTransaction();
        } else if (pendingTransactionAction === 'edit') {
            setEditingTransaction(null);
            resetTransaction();
        }
        // Clean up receipt preview
        if (receiptPreview) {
            URL.revokeObjectURL(receiptPreview);
            setReceiptPreview(null);
        }
        setPendingTransactionAction(null);
    };
    
    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        setPendingCategoryAction('add');
        setShowCategoryConfirmModal(true);
    };
    
    const handleEditCategory = (e: React.FormEvent) => {
        e.preventDefault();
        setPendingCategoryAction('edit');
        setShowCategoryConfirmModal(true);
    };
    
    const confirmCategoryAction = () => {
        if (pendingCategoryAction === 'add') {
            postCategory('/categories', {
                onSuccess: () => {
                    setShowCategoryConfirmModal(false);
                    setShowCategorySuccessModal(true);
                    setPendingCategoryAction(null);
                },
            });
        } else if (pendingCategoryAction === 'edit' && editingCategory) {
            putCategory(`/categories/${editingCategory.id}`, {
                onSuccess: () => {
                    setShowCategoryConfirmModal(false);
                    setShowCategorySuccessModal(true);
                    setPendingCategoryAction(null);
                },
            });
        }
    };
    
    const handleCategorySuccess = () => {
        setShowCategorySuccessModal(false);
        setIsAddCategoryOpen(false);
        setEditingCategory(null);
        resetCategory();
    };
    
    const handleDeleteCategory = (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(`/categories/${id}`);
        }
    };
    
    const openEditCategory = (category: Category) => {
        setEditingCategory(category);
        setCategoryData({
            name: category.name,
            type: category.type,
            color: category.color,
        });
    };
    
    const openEditTransaction = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        clearErrors();
        setTransactionData({
            amount: transaction.amount,
            description: transaction.description,
            used_by: transaction.used_by || '',
            category_id: transaction.category.id.toString(),
            transaction_type: transaction.transaction_type,
            date: transaction.date,
            receipt: null,
        });
    };
    
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
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Petty Cash Manager" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${parseFloat(summary.balance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(summary.balance)}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(summary.totalIncome)}
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
                                {formatCurrency(summary.totalExpenses)}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {transactions.length}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-4">
                    <Dialog open={isAddTransactionOpen} onOpenChange={(open) => {
                        setIsAddTransactionOpen(open);
                        if (!open) {
                            // Clean up receipt preview when modal closes
                            if (receiptPreview) {
                                URL.revokeObjectURL(receiptPreview);
                                setReceiptPreview(null);
                            }
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Transaction
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogTitle>Add New Transaction</DialogTitle>
                            <DialogDescription>
                                Add a new income or expense transaction to your petty cash.
                            </DialogDescription>
                            <form onSubmit={handleAddTransaction} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="amount">Amount</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={transactionData.amount}
                                            onChange={(e) => setTransactionData('amount', e.target.value)}
                                            placeholder="0.00"
                                            required
                                        />
                                        {transactionErrors.amount && <p className="text-sm text-red-600">{transactionErrors.amount}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="date">Date</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={transactionData.date}
                                            onChange={(e) => setTransactionData('date', e.target.value)}
                                            required
                                        />
                                        {transactionErrors.date && <p className="text-sm text-red-600">{transactionErrors.date}</p>}
                                    </div>
                                </div>
                                
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={transactionData.description}
                                        onChange={(e) => setTransactionData('description', e.target.value)}
                                        placeholder="Enter transaction description"
                                        required
                                    />
                                    {transactionErrors.description && <p className="text-sm text-red-600">{transactionErrors.description}</p>}
                                </div>
                                
                                <div>
                                    <Label htmlFor="used_by">Used By</Label>
                                    <Input
                                        id="used_by"
                                        value={transactionData.used_by}
                                        onChange={(e) => setTransactionData('used_by', e.target.value)}
                                        placeholder="Enter who used this expense (optional)"
                                    />
                                    {transactionErrors.used_by && <p className="text-sm text-red-600">{transactionErrors.used_by}</p>}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="transaction_type">Type</Label>
                                        <Select value={transactionData.transaction_type} onValueChange={(value: 'income' | 'expense') => setTransactionData('transaction_type', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="income">Receive</SelectItem>
                                                <SelectItem value="expense">Expense</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {transactionErrors.transaction_type && <p className="text-sm text-red-600">{transactionErrors.transaction_type}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="category_id">Category</Label>
                                        <Select value={transactionData.category_id} onValueChange={(value) => setTransactionData('category_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories
                                                    .filter(cat => cat.type === transactionData.transaction_type)
                                                    .map((category) => (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                        {transactionErrors.category_id && <p className="text-sm text-red-600">{transactionErrors.category_id}</p>}
                                    </div>
                                </div>
                                
                                <div>
                                    <Label htmlFor="receipt">Receipt (Optional)</Label>
                                    <Input
                                        id="receipt"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            setTransactionData('receipt', file);
                                            
                                            // Create preview URL
                                            if (file) {
                                                const previewUrl = URL.createObjectURL(file);
                                                setReceiptPreview(previewUrl);
                                            } else {
                                                setReceiptPreview(null);
                                            }
                                        }}
                                        className="cursor-pointer"
                                    />
                                    {transactionErrors.receipt && <p className="text-sm text-red-600">{transactionErrors.receipt}</p>}
                                    <p className="text-xs text-gray-500 mt-1">Upload an image of your receipt (JPG, PNG, etc.)</p>
                                    
                                    {receiptPreview && (
                                        <div className="mt-3">
                                            <p className="text-sm font-medium mb-2">Receipt Preview:</p>
                                            <div className="relative inline-block">
                                                <img 
                                                    src={receiptPreview} 
                                                    alt="Receipt preview" 
                                                    className="max-w-full max-h-48 rounded-lg border shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => setFullscreenImage(receiptPreview)}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute top-2 right-2"
                                                    onClick={() => {
                                                        setReceiptPreview(null);
                                                        setTransactionData('receipt', null);
                                                        // Reset file input
                                                        const fileInput = document.getElementById('receipt') as HTMLInputElement;
                                                        if (fileInput) fileInput.value = '';
                                                    }}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsAddTransactionOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={transactionProcessing}>
                                        {transactionProcessing ? 'Adding...' : 'Add Transaction'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                    
                    <Dialog open={isAddCategoryOpen} onOpenChange={(open) => {
                        setIsAddCategoryOpen(open);
                        if (!open) {
                            setEditingCategory(null);
                            resetCategory();
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Plus className="mr-2 h-4 w-4" />
                                Manage Categories
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogTitle>{editingCategory ? 'Edit Category' : 'Manage Categories'}</DialogTitle>
                            <DialogDescription>
                                {editingCategory ? 'Update the category details.' : 'Add new categories or manage existing ones.'}
                            </DialogDescription>
                            
                            {!editingCategory && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Existing Categories</h3>
                                    <div className="grid gap-2 max-h-60 overflow-y-auto">
                                        {categories.map((category) => (
                                            <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <div 
                                                        className="w-4 h-4 rounded-full" 
                                                        style={{ backgroundColor: category.color }}
                                                    ></div>
                                                    <div>
                                                        <span className="font-medium">{category.name}</span>
                                                        <Badge variant={category.type === 'income' ? 'default' : 'secondary'} className="ml-2">
                                                            {category.type}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditCategory(category)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteCategory(category.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <form onSubmit={editingCategory ? handleEditCategory : handleAddCategory} className="space-y-4">
                                <h3 className="text-lg font-semibold">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                                <div>
                                    <Label htmlFor="category_name">Category Name</Label>
                                    <Input
                                        id="category_name"
                                        value={categoryData.name}
                                        onChange={(e) => setCategoryData('name', e.target.value)}
                                        placeholder="Enter category name"
                                        required
                                    />
                                    {categoryErrors.name && <p className="text-sm text-red-600">{categoryErrors.name}</p>}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="category_type">Type</Label>
                                        <Select value={categoryData.type} onValueChange={(value: 'income' | 'expense') => setCategoryData('type', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="income">Income</SelectItem>
                                                <SelectItem value="expense">Expense</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {categoryErrors.type && <p className="text-sm text-red-600">{categoryErrors.type}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="category_color">Color</Label>
                                        <Input
                                            id="category_color"
                                            type="color"
                                            value={categoryData.color}
                                            onChange={(e) => setCategoryData('color', e.target.value)}
                                            required
                                        />
                                        {categoryErrors.color && <p className="text-sm text-red-600">{categoryErrors.color}</p>}
                                    </div>
                                </div>
                                
                                <DialogFooter>
                                    {editingCategory && (
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => {
                                                setEditingCategory(null);
                                                resetCategory();
                                            }}
                                        >
                                            Back to List
                                        </Button>
                                    )}
                                    <Button type="button" variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={categoryProcessing}>
                                        {categoryProcessing ? (editingCategory ? 'Updating...' : 'Adding...') : (editingCategory ? 'Update Category' : 'Add Category')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                
                {/* Transactions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>
                            Your latest petty cash transactions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {transactions.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No transactions yet. Add your first transaction to get started!
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {transactions.map((transaction) => (
                                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                                            <div className="flex items-center space-x-4">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: transaction.category.color }}
                                                />
                                                <div>
                                                    <p className="font-medium">{transaction.description}</p>
                                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                        <Badge variant={transaction.transaction_type === 'income' ? 'default' : 'destructive'}>
                                                            {transaction.category.name}
                                                        </Badge>
                                                        <span>•</span>
                                                        <span>{formatDate(transaction.date)}</span>
                                                        {transaction.used_by && (
                                                            <>
                                                                <span>•</span>
                                                                <span>Used by: {transaction.used_by}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`font-semibold ${transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {transaction.transaction_type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditTransaction(transaction)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteTransaction(transaction.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                
                {/* Edit Transaction Dialog */}
                <Dialog open={!!editingTransaction} onOpenChange={(open) => {
                    if (!open) {
                        setEditingTransaction(null);
                        // Clean up receipt preview when modal closes
                        if (receiptPreview) {
                            URL.revokeObjectURL(receiptPreview);
                            setReceiptPreview(null);
                        }
                    }
                }}>
                    <DialogContent>
                        <DialogTitle>Edit Transaction</DialogTitle>
                        <DialogDescription>
                            Update the transaction details.
                        </DialogDescription>
                        <form onSubmit={handleEditTransaction} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit_amount">Amount</Label>
                                    <Input
                                        id="edit_amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={transactionData.amount}
                                        onChange={(e) => setTransactionData('amount', e.target.value)}
                                        placeholder="0.00"
                                        required
                                    />
                                    {transactionErrors.amount && <p className="text-sm text-red-600">{transactionErrors.amount}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="edit_date">Date</Label>
                                    <Input
                                        id="edit_date"
                                        type="date"
                                        value={transactionData.date}
                                        onChange={(e) => setTransactionData('date', e.target.value)}
                                        required
                                    />
                                    {transactionErrors.date && <p className="text-sm text-red-600">{transactionErrors.date}</p>}
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor="edit_description">Description</Label>
                                <Input
                                    id="edit_description"
                                    value={transactionData.description}
                                    onChange={(e) => setTransactionData('description', e.target.value)}
                                    placeholder="Enter transaction description"
                                    required
                                />
                                {transactionErrors.description && <p className="text-sm text-red-600">{transactionErrors.description}</p>}
                            </div>
                            
                            <div>
                                <Label htmlFor="edit_used_by">Used By</Label>
                                <Input
                                    id="edit_used_by"
                                    value={transactionData.used_by}
                                    onChange={(e) => setTransactionData('used_by', e.target.value)}
                                    placeholder="Enter who used this expense (optional)"
                                />
                                {transactionErrors.used_by && <p className="text-sm text-red-600">{transactionErrors.used_by}</p>}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit_transaction_type">Type</Label>
                                    <Select value={transactionData.transaction_type} onValueChange={(value: 'income' | 'expense') => setTransactionData('transaction_type', value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="income">Receive</SelectItem>
                                            <SelectItem value="expense">Expense</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {transactionErrors.transaction_type && <p className="text-sm text-red-600">{transactionErrors.transaction_type}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="edit_category_id">Category</Label>
                                    <Select value={transactionData.category_id} onValueChange={(value) => setTransactionData('category_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories
                                                .filter(cat => cat.type === transactionData.transaction_type)
                                                .map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                    {transactionErrors.category_id && <p className="text-sm text-red-600">{transactionErrors.category_id}</p>}
                                </div>
                            </div>
                            
                            <div>
                                 <Label htmlFor="edit_receipt">Receipt (Optional)</Label>
                                 <Input
                                     id="edit_receipt"
                                     type="file"
                                     accept="image/*"
                                     onChange={(e) => {
                                         const file = e.target.files?.[0] || null;
                                         setTransactionData('receipt', file);
                                         
                                         // Create preview URL
                                         if (file) {
                                             const previewUrl = URL.createObjectURL(file);
                                             setReceiptPreview(previewUrl);
                                         } else {
                                             setReceiptPreview(null);
                                         }
                                     }}
                                     className="cursor-pointer"
                                 />
                                 {transactionErrors.receipt && <p className="text-sm text-red-600">{transactionErrors.receipt}</p>}
                                 <p className="text-xs text-gray-500 mt-1">Upload an image of your receipt (JPG, PNG, etc.)</p>
                                 
                                 {/* Show current receipt if editing and no new preview */}
                                 {editingTransaction?.receipt_path && !receiptPreview && (
                                     <div className="mt-3">
                                         <p className="text-sm font-medium mb-2">Current Receipt:</p>
                                         <div className="relative inline-block">
                                             <img 
                                                 src={`/storage/${editingTransaction.receipt_path}`} 
                                                 alt="Current receipt" 
                                                 className="max-w-full max-h-48 rounded-lg border shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                                                 onClick={() => setFullscreenImage(`/storage/${editingTransaction.receipt_path}`)}
                                             />
                                         </div>
                                     </div>
                                 )}
                                 
                                 {/* Show new receipt preview */}
                                 {receiptPreview && (
                                     <div className="mt-3">
                                         <p className="text-sm font-medium mb-2">New Receipt Preview:</p>
                                         <div className="relative inline-block">
                                             <img 
                                                 src={receiptPreview} 
                                                 alt="Receipt preview" 
                                                 className="max-w-full max-h-48 rounded-lg border shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                                                 onClick={() => setFullscreenImage(receiptPreview)}
                                             />
                                             <Button
                                                 type="button"
                                                 variant="destructive"
                                                 size="sm"
                                                 className="absolute top-2 right-2"
                                                 onClick={() => {
                                                     setReceiptPreview(null);
                                                     setTransactionData('receipt', null);
                                                     // Reset file input
                                                     const fileInput = document.getElementById('edit_receipt') as HTMLInputElement;
                                                     if (fileInput) fileInput.value = '';
                                                 }}
                                             >
                                                 ×
                                             </Button>
                                         </div>
                                     </div>
                                 )}
                             </div>
                            
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditingTransaction(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={transactionProcessing}>
                                    {transactionProcessing ? 'Updating...' : 'Update Transaction'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Fullscreen Image Modal */}
                {fullscreenImage && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                        onClick={() => setFullscreenImage(null)}
                    >
                        <div className="relative max-w-full max-h-full p-4">
                            <img 
                                src={fullscreenImage} 
                                alt="Fullscreen receipt" 
                                className="max-w-full max-h-full object-contain"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <button 
                                className="absolute top-4 right-4 text-white text-2xl font-bold bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-75"
                                onClick={() => setFullscreenImage(null)}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Category Confirmation Modal */}
                <Dialog open={showCategoryConfirmModal} onOpenChange={setShowCategoryConfirmModal}>
                    <DialogContent>
                        <DialogTitle>Confirm Category Action</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {pendingCategoryAction === 'add' ? 'add' : 'update'} this category?
                        </DialogDescription>
                        <DialogFooter>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                    setShowCategoryConfirmModal(false);
                                    setPendingCategoryAction(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="button" 
                                onClick={confirmCategoryAction}
                                disabled={categoryProcessing}
                            >
                                {categoryProcessing ? 'Processing...' : 'Yes, Continue'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                
                {/* Category Success Modal */}
                <Dialog open={showCategorySuccessModal} onOpenChange={setShowCategorySuccessModal}>
                    <DialogContent>
                        <DialogTitle>Success!</DialogTitle>
                        <DialogDescription>
                            Category has been {pendingCategoryAction === 'add' ? 'added' : 'updated'} successfully.
                        </DialogDescription>
                        <DialogFooter>
                            <Button onClick={handleCategorySuccess}>
                                OK
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                
                {/* Transaction Confirmation Modal */}
                <Dialog open={showTransactionConfirmModal} onOpenChange={setShowTransactionConfirmModal}>
                    <DialogContent>
                        <DialogTitle>Confirm Transaction Action</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {pendingTransactionAction === 'add' ? 'add' : pendingTransactionAction === 'edit' ? 'update' : 'delete'} this transaction?
                        </DialogDescription>
                        <DialogFooter>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => {
                                    setShowTransactionConfirmModal(false);
                                    setPendingTransactionAction(null);
                                    setTransactionToDelete(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="button" 
                                onClick={confirmTransactionAction}
                                disabled={transactionProcessing}
                                variant={pendingTransactionAction === 'delete' ? 'destructive' : 'default'}
                            >
                                {transactionProcessing ? 'Processing...' : 'Yes, Continue'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                
                {/* Transaction Success Modal */}
                <Dialog open={showTransactionSuccessModal} onOpenChange={setShowTransactionSuccessModal}>
                    <DialogContent>
                        <DialogTitle>Success!</DialogTitle>
                        <DialogDescription>
                            Transaction has been {pendingTransactionAction === 'add' ? 'added' : pendingTransactionAction === 'edit' ? 'updated' : 'deleted'} successfully.
                        </DialogDescription>
                        <DialogFooter>
                            <Button onClick={handleTransactionSuccess}>
                                OK
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
