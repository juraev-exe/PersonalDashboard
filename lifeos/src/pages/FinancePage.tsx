// ============================================
// LifeOS — Finance Page (Income & Expense Tracker)
// ============================================

import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '../stores/financeStore';
import type { Transaction } from '../stores/financeStore';
import { Plus, Trash2, ArrowUpDown, TrendingUp, TrendingDown, DollarSign, Calendar, Tag, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other'];
const EXPENSE_CATEGORIES = ['Food', 'Rent & Bills', 'Utilities', 'Travel/Transit', 'Subscribed Services', 'Shopping', 'Entertainment', 'Other'];

const COLORS = [
  '#3fb950', // green
  '#58a6ff', // blue
  '#ff7b72', // coral/red
  '#d29922', // gold
  '#a371f7', // purple
  '#ffc069', // orange
  '#56d364', // lime
  '#7ee787', // light green
];

export default function FinancePage() {
  const transactions = useFinanceStore((s) => s.transactions);
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Filtering states
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(newType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    await addTransaction({
      type,
      amount: Number(amount),
      category,
      description,
      date,
    });

    setIsModalOpen(false);
    // Reset form
    setAmount('');
    setDescription('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
  };

  // Financial calculations
  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const balance = totalIncome - totalExpense;

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return [...transactions]
      .filter((t) => {
        const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, search, filterType, filterCategory]);

  // Chart data (Expense breakdown)
  const chartData = useMemo(() => {
    const expenseData: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        expenseData[t.category] = (expenseData[t.category] || 0) + t.amount;
      });

    return Object.keys(expenseData).map((cat) => ({
      name: cat,
      value: expenseData[cat],
    }));
  }, [transactions]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.03em' }}>Finance Tracker</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Monitor income, log expenses, and maintain financial health.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ gap: '6px' }}>
          <Plus size={18} /> Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--color-accent)' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Net Balance</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: balance >= 0 ? 'var(--color-text-primary)' : 'var(--color-rose)' }}>
              ${balance.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Income Card */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--color-success)' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(63, 185, 80, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Total Income</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-success)' }}>
              +${totalIncome.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Expense Card */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid var(--color-rose)' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(248, 81, 73, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-rose)' }}>
            <TrendingDown size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Total Expenses</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-rose)' }}>
              -${totalExpense.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Left Side: Transactions List */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Transaction History</h3>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{filteredTransactions.length} items</span>
          </div>

          {/* Filters Bar */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ flex: 1, minWidth: '150px', height: '36px', padding: '0 12px', fontSize: 13 }}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="input"
              style={{ width: '110px', height: '36px', fontSize: 13 }}
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input"
              style={{ width: '130px', height: '36px', fontSize: 13 }}
            >
              <option value="all">All Categories</option>
              {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredTransactions.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                No matching transactions logged.
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filteredTransactions.map((t) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: t.type === 'income' ? 'rgba(63, 185, 80, 0.1)' : 'rgba(248, 81, 73, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: t.type === 'income' ? 'var(--color-success)' : 'var(--color-rose)',
                        flexShrink: 0,
                      }}>
                        {t.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {t.description || t.category}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', fontSize: 11, color: 'var(--color-text-muted)' }}>
                          <span>{t.category}</span>
                          <span>•</span>
                          <span>{t.date}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: t.type === 'income' ? 'var(--color-success)' : 'var(--color-rose)' }}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ color: 'var(--color-text-muted)', width: 28, height: 28 }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Right Side: Charts / Category Breakdown */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Expense Distribution</h3>

          {chartData.length === 0 ? (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: 'var(--color-text-muted)', fontSize: 13 }}>
              No expenses recorded to calculate distribution.
            </div>
          ) : (
            <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', minHeight: '320px' }}>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends details */}
              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: 12 }}>
                {chartData.map((item, index) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{item.name}:</span>
                    <span style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>${item.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Log Transaction (+2 XP)</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Type Tab Selector */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'var(--color-bg-secondary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('expense')}
                    style={{
                      padding: '8px 0',
                      borderRadius: 'var(--radius-sm)',
                      background: type === 'expense' ? 'var(--color-rose)' : 'transparent',
                      color: type === 'expense' ? '#ffffff' : 'var(--color-text-secondary)',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('income')}
                    style={{
                      padding: '8px 0',
                      borderRadius: 'var(--radius-sm)',
                      background: type === 'income' ? 'var(--color-success)' : 'transparent',
                      color: type === 'income' ? '#ffffff' : 'var(--color-text-secondary)',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    Income
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  {/* Amount */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="input"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="input"
                    >
                      {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  {/* Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="input"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Description</label>
                    <input
                      type="text"
                      placeholder="E.g., Groceries, Uber, Salary..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: type === 'income' ? 'var(--color-success)' : 'var(--color-rose)' }}>Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
