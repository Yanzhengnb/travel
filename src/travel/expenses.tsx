import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as client from './client';
import { FaTrash, FaEdit, FaUserFriends, FaDollarSign, FaBed, FaMapMarkerAlt, FaWallet } from 'react-icons/fa';

interface Expense {
    _id: string;
    date: string;
    amount: number;
    currency: 'USD' | 'MXN';
    description: string;
    payer: string;
    participants: string[];
}

function Expenses() {
    const location = useLocation();
    const { state } = location;
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [newExpense, setNewExpense] = useState<Partial<Expense>>({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        currency: 'USD',
        description: '',
        payer: '',
        participants: []
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string>('');
    const [showSettlement, setShowSettlement] = useState(false);

    const exchangeRate = 17.5;
    const people = ['nini', 'wanwan', 'lyz', 'ZQ'];
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };
    const convertCurrency = (amount: number, from: string, to: string) => {
        if (from === to) return amount;
        return from === 'USD' ? amount * exchangeRate : amount / exchangeRate;
    };

    const handleCurrencyChange = (newCurrency: 'USD' | 'MXN') => {
        const currentAmount = newExpense.amount || 0;
        const currentCurrency = newExpense.currency || 'USD';
        let newAmount = 0;
        if (currentCurrency === 'MXN') {
            newAmount = currentAmount / exchangeRate;
        }
        else{   
            newAmount = currentAmount;
            
}    

        setNewExpense({
            ...newExpense,
            currency: newCurrency,
            amount: Number(newAmount.toFixed(2))
        });
    };

    const fetchExpenses = async () => {
        const response = await client.findAllExpenses();
        setExpenses(response);
    };

    useEffect(() => {
        fetchExpenses();
    }, []);
    useEffect(() => {
        if (state) {
            setNewExpense({
                amount: state.amount,
                description: state.description,
                date: state.date
            });
        }
    }, [state]);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newExpense.currency === 'MXN' && newExpense.amount) {
            newExpense.amount = Number((newExpense.amount / exchangeRate).toFixed(2));
        }
        newExpense.currency = 'USD';
        if (isEditing) {
            await client.updateExpense(editingId, newExpense);
        } else {
            await client.createExpense(newExpense);
        }
        setNewExpense({
            date: new Date().toISOString().split('T')[0],
            amount: 0,
            currency: 'USD',
            description: '',
            payer: '',
            participants: []
        });
        setIsEditing(false);
        setEditingId('');
        fetchExpenses();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('要删除吗？')) {
            await client.deleteExpense(id);
            fetchExpenses();
        }
    };

    const handleEdit = (expense: Expense) => {
        const formattedDate = new Date(expense.date).toISOString().split('T')[0];
        
        setNewExpense({
            ...expense,
            date: formattedDate
        });
        setIsEditing(true);
        setEditingId(expense._id);
    };

    const calculateSettlement = () => {
        const settlements: { [key: string]: number } = {};
        const totalByPerson: { [key: string]: number } = {};
        let totalAmount = 0;

        people.forEach(person => {
            totalByPerson[person] = 0;
            settlements[person] = 0;
        });

        expenses.forEach(expense => {
            const amount = expense.currency === 'MXN' 
                ? expense.amount / exchangeRate 
                : expense.amount;
            
            totalByPerson[expense.payer] += amount;
            totalAmount += amount;
            
            const perPerson = amount / expense.participants.length;
            expense.participants.forEach(participant => {
                settlements[participant] -= perPerson;
            });
            settlements[expense.payer] += amount;
        });

        const finalSettlements = Object.entries(settlements)
            .map(([person, amount]) => ({
                person,
                amount: Number(amount.toFixed(2)),
                totalPaid: Number(totalByPerson[person].toFixed(2))
            }))
            .filter(s => Math.abs(s.amount) > 0.01)
            .sort((a, b) => b.amount - a.amount);

        return {
            finalSettlements,
            totalAmount: Number(totalAmount.toFixed(2))
        };
    };

    return (
        <div className="d-flex">

<div className="sidebar bg-light" style={{
                width: '250px',
                minHeight: '100vh',
                borderRight: '1px solid #dee2e6',
                padding: '20px 0'
            }}>
                <ul className="nav flex-column">
                    <br /><br /><br />

                    <li className="nav-item">
                        <Link className="nav-link" to="/TravelList" style={{ fontSize: '1.2rem', padding: '15px 20px' }}>
                            <FaMapMarkerAlt className="me-3 center-text" />安排
                        </Link>
                    </li>
                    <br />
                    <li className="nav-item">
                        <Link className="nav-link" to="/expenses" style={{ fontSize: '1.2rem', padding: '15px 20px' }}>
                            <FaWallet className="me-3 center-block" />消费
                        </Link>
                    </li>
                </ul>
            </div>

            <div className="flex-grow-1 p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>消费记录</h1>
                    
                </div>

                {showSettlement && (
                    <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">结账明细</h5>
                                    <button 
                                        type="button" 
                                        className="btn-close"
                                        onClick={() => setShowSettlement(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    {(() => {
                                        const { finalSettlements, totalAmount } = calculateSettlement();
                                        return (
                                            <>
                                                <div className="mb-3">
                                                    <strong>总支出：</strong> ${totalAmount}
                                                </div>
                                                <div className="mb-3">
                                                    <strong>每人支付情况：</strong>
                                                    {finalSettlements.map(({person, totalPaid}) => (
                                                        <div key={person}>
                                                            {person}: ${totalPaid}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div>
                                                    <strong>转账明细：</strong>
                                                    {finalSettlements
                                                        .filter(s => s.amount < 0)
                                                        .map(settlement => {
                                                            const receiver = finalSettlements.find(s => 
                                                                s.amount > 0 && s.amount >= Math.abs(settlement.amount)
                                                            );
                                                            if (receiver) {
                                                                return (
                                                                    <div 
                                                                        key={settlement.person} 
                                                                        className="alert alert-info"
                                                                    >
                                                                        {settlement.person} 需要转给 {receiver.person}: $
                                                                        {Math.abs(settlement.amount).toFixed(2)}
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary"
                                        onClick={() => setShowSettlement(false)}
                                    >
                                        关闭
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="row g-3">
                        <div className="col-md-2">
                            <input
                                type="date"
                                className="form-control"
                                value={newExpense.date}
                                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-2">
                            <div className="input-group">
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="金额"
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                                    required

                                    step="0.01"
                                    style={{
                                        width: '45%',
                                        WebkitAppearance: 'none',
                                    }}
                                />
                                <select
                                    className="form-select"
                                    value={newExpense.currency}
                                    onChange={(e) => handleCurrencyChange(e.target.value as 'USD' | 'MXN')}
                                    style={{
                                        width: '55%',
                                    }}
                                >
                                    <option value="USD">USD</option>
                                    <option value="MXN">MXN</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="描述"
                                value={newExpense.description}
                                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-2">
                            <select
                                className="form-select"
                                value={newExpense.payer}
                                onChange={(e) => setNewExpense({ ...newExpense, payer: e.target.value })}
                                required
                            >
                                <option value="">选择付款人</option>
                                {people.map(person => (
                                    <option key={person} value={person}>{person}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <div className="card">
                                <div className="card-body p-2">
                                    {people.map(person => (
                                        <div key={person} className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id={`participant-${person}`}
                                                checked={newExpense.participants?.includes(person)}
                                                onChange={(e) => {
                                                    const currentParticipants = newExpense.participants || [];
                                                    if (e.target.checked) {
                                                        setNewExpense({
                                                            ...newExpense,
                                                            participants: [...currentParticipants, person]
                                                        });
                                                    } else {
                                                        setNewExpense({
                                                            ...newExpense,
                                                            participants: currentParticipants.filter(p => p !== person)
                                                        });
                                                    }
                                                }}
                                            />
                                            <label className="form-check-label" htmlFor={`participant-${person}`}>
                                                {person}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-1">
                            <button type="submit" className="btn btn-primary w-100">
                                {isEditing ? '更新' : '添加'}
                            </button>
                        </div>
                    </div>
                </form>

                <div className="expenses-list">
                    {expenses.map((expense) => (
                        <div key={expense._id} className="card mb-3">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="card-title">{expense.description}</h5>
                                        <p className="card-text">
                                            <FaUserFriends className="me-2" />
                                            付款人: {expense.payer}
                                        </p>
                                        <p className="card-text">
                                            <small className="text-muted">
                                                参与者: {expense.participants.join(', ')}
                                            </small>
                                        </p>
                                    </div>
                                    <div className="text-end">
                                        <h4>
                                            <FaDollarSign />
                                            {expense.amount} {expense.currency}
                                            {expense.currency === 'MXN' && (
                                                <small className="text-muted ms-2">
                                                    (≈ ${(expense.amount / exchangeRate).toFixed(2)} USD)
                                                </small>
                                            )}
                                        </h4>
                                        <small className="text-muted">
                                            {formatDate(expense.date)}
                                        </small>
                                        <div className="mt-2">
                                            <button
                                                onClick={() => handleEdit(expense)}
                                                className="btn btn-link text-primary me-2"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(expense._id)}
                                                className="btn btn-link text-danger"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button 
                        className="btn btn-success"
                        onClick={() => setShowSettlement(true)}
                    >
                        结账
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Expenses;
