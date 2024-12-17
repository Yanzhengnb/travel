
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as client from './client';
import { FaBed, FaBus, FaGamepad, FaUtensils } from 'react-icons/fa';

function TravelEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const travelData = location.state?.travel || {};

  const defaultDestination = location.state?.defaultDestination || '';
    const [currency, setCurrency] = useState('USD'); // USD 或 MXN
  const [amount, setAmount] = useState(travelData.budget?.toString() || '');
  const PESO_TO_USD = 0.0171; 

  const [travel, setTravel] = useState({
    title: travelData.title || '',
    destination: travelData.destination ||defaultDestination|| '',
    startDate: travelData.startDate || '',
    endDate: travelData.endDate || '',
    budget: travelData.budget || 0,
    description: travelData.description || '',
    activities: travelData.activities || [],
    url: travelData.url || '',
    address: travelData.address || '',
    tags: [] as string[]
  });
  const TAG_CONFIG = {
    '吃喝': { icon: FaUtensils, color: '#e74c3c' },
    '玩乐': { icon: FaGamepad, color: '#3498db' },
    '住宿': { icon: FaBed, color: '#2ecc71' },
    '交通': { icon: FaBus, color: '#f1c40f' }
};
  const convertToUSD = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 0;
    return currency === 'USD' ? numValue : numValue * PESO_TO_USD;
  };

  const handleBudgetChange = (value: string) => {
    setAmount(value);
    setTravel({ 
      ...travel, 
      budget: convertToUSD(value)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (travelData._id) {
      // 如果有 _id，说明是更新现有记录
      await client.updateTravel(travelData._id, travel);
    } else {
      // 如果没有 _id，说明是创建新记录
      await client.createTravel(travel);
    }
    navigate('/TravelList');
  };

  return (
    <div className="container mt-4">
      <h2><div className="mb-3">
        <label className="form-label">{travel.destination}</label>
        
    </div></h2>
      <form onSubmit={handleSubmit}>


        
        <div className="mb-3">
          <label className="form-label">干啥（required）</label>
          <input
            type="text"
            className="form-control"
            value={travel.title}
            onChange={(e) => setTravel({ ...travel, title: e.target.value })}
            required
          />
        </div>
        <div className="row mb-3">
          <div className="col">
            <label className="form-label">开始日期</label>
            <input
              type="datetime-local"
              className="form-control"
              value={travel.startDate}
              onChange={(e) => setTravel({ ...travel, startDate: e.target.value })}
             
            />
          </div>
          <div className="col">
            <label className="form-label">结束日期</label>
            <input
              type="datetime-local"
              className="form-control"
              value={travel.endDate}
              onChange={(e) => setTravel({ ...travel, endDate: e.target.value })}
              
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">预算</label>
          <div className="input-group">
            <input
              type="number"
              className="form-control"
              value={amount}
              onChange={(e) => handleBudgetChange(e.target.value)}
            />
            <select 
              className="form-select" 
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                handleBudgetChange(amount); // 重新计算转换后的金额
              }}
            >
              <option value="USD">美元 (USD)</option>
              <option value="MXN">墨西哥比索 (MXN)</option>
            </select>
          </div>
          {currency === 'MXN' && amount && (
            <small className="text-muted">
              约合 {(parseFloat(amount) * PESO_TO_USD).toFixed(2)} 美元
            </small>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Tips</label>
          <textarea
            className="form-control"
            rows={3}
            value={travel.description}
            onChange={(e) => setTravel({ ...travel, description: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">攻略/官网？（http://www.example.com）</label>
          <input
            type="url"
            className="form-control"
            value={travel.url}
            onChange={(e) => setTravel({ ...travel, url: e.target.value })}
            placeholder="ctrl+v"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">地址</label>
          <input
            type="text"
            className="form-control"
            value={travel.address || ''}
            onChange={(e) => setTravel({ ...travel, address: e.target.value })}
            placeholder="具体地址"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">标签</label>
          <div className="d-flex gap-2 flex-wrap">
            {Object.keys(TAG_CONFIG).map((tag) => (
              <div 
                key={tag}
                className="form-check"
                style={{ minWidth: '100px' }}
              >
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`tag-${tag}`}
                  checked={travel.tags.includes(tag)}
                  onChange={(e) => {
                    const newTags = e.target.checked
                      ? [...travel.tags, tag]
                      : travel.tags.filter(t => t !== tag);
                    setTravel({ ...travel, tags: newTags });
                  }}
                />
                <label 
                  className="form-check-label" 
                  htmlFor={`tag-${tag}`}
                >
                  {tag}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <button type="submit" className="btn btn-primary me-2">
            保存
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/TravelList')}
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

export default TravelEditor;
