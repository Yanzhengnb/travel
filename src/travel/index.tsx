import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as client from './client';
import { FaTrash, FaEdit, FaDollarSign, FaCalendarAlt, FaInfoCircle, FaLink, FaWallet, FaMapMarkerAlt, FaBed, FaPlus, FaGamepad, FaBus, FaUtensils } from 'react-icons/fa';

function TravelList() {
    const [travels, setTravels] = useState<any[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const navigate = useNavigate();
    const TAG_CONFIG = {
        '吃喝': { icon: FaUtensils, color: '#e74c3c' },
        '玩乐': { icon: FaGamepad, color: '#3498db' },
        '住宿': { icon: FaBed, color: '#2ecc71' },
        '交通': { icon: FaBus, color: '#f1c40f' }
    };
    const fetchTravels = async () => {
        const response = await client.findAllTravels();
        const sortedTravels = response.sort((a: any, b: any) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        setTravels(sortedTravels);
    };
    const handleDelete = async (id: string) => {
        if (window.confirm('确定删除？')) {
            await client.deleteTravel(id);
            fetchTravels();
        }
    };
    useEffect(() => {
        fetchTravels();
    }, []);
    const TestConnection = () => {
        const [testResult, setTestResult] = useState('');

        const handleTest = async () => {
            try {
                const result = await client.testConnection();
                setTestResult(JSON.stringify(result, null, 2));
            } catch (error) {
                setTestResult('Error: ' + error);
            }
        };

        return (
            <div>
                <button onClick={handleTest}>
                    测试连接
                </button>
                {testResult && (
                    <pre>{testResult}</pre>
                )}
            </div>
        );
    };
    const tampaTrips = travels.filter(t => t.destination.toLowerCase().includes('tampa'));
    const mexicoTrips = travels.filter(t => t.destination.toLowerCase().includes('mexico'));

    const filteredTravels = (trips: any[]) => {
        if (selectedTags.length === 0) return trips;
        return trips.filter(trip =>
            trip.tags?.some((tag: string) => selectedTags.includes(tag))
        );
    };

    const TagFilters = () => (
        <div className="mb-4">
            <h5 className="mb-3">按标签筛选</h5>
            <div className="d-flex gap-2 flex-wrap">
                {Object.entries(TAG_CONFIG).map(([tag, config]) => {
                    const TagIcon = config.icon;
                    const isSelected = selectedTags.includes(tag);

                    return (
                        <button
                            key={tag}
                            className={`btn ${isSelected ? 'btn-primary' : 'btn-outline-primary'}`}
                            style={{
                                backgroundColor: isSelected ? config.color : 'white',
                                borderColor: config.color,
                                color: isSelected ? 'white' : config.color,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'all 0.3s ease'
                            }}
                            onClick={() => {
                                setSelectedTags(prev =>
                                    isSelected
                                        ? prev.filter(t => t !== tag)
                                        : [...prev, tag]
                                );
                            }}
                        >
                            <TagIcon size={14} />
                            {tag}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const TravelSection = ({ title, trips, destination }: { title: string, trips: any[], destination: string }) => (
        <div className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>{title}</h2>
                <Link
                    to="/travel/new"
                    state={{ defaultDestination: destination }}
                    className="btn btn-primary"
                >
                    <FaPlus />
                </Link>
            </div>
            <div className="travel-list">
                {filteredTravels(trips).length > 0 ? (
                    filteredTravels(trips).map((travel) => (
                        <div className="mb-3" key={travel._id} style={{ width: '100%' }}>
                            <div
                                className="card"
                                style={{
                                    cursor: travel.url ? 'pointer' : 'default',
                                    transition: 'transform 0.2s',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                    fontSize: '1.1rem',
                                    margin: '15px 0'
                                }}

                                onMouseOver={(e) => {
                                    if (travel.url) {
                                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    (e.currentTarget as HTMLElement).style.transform = 'none';
                                }}
                            >
                                <div className="card-body" style={{ padding: '20px' }}>
                                    <div className="d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div>
                                                <h5 
                                                    className="card-title mb-2" 
                                                    style={{ 
                                                        fontSize: '1.4rem',
                                                        cursor: travel.url ? 'pointer' : 'default' 
                                                    }}
                                                    onClick={() => {
                                                        if (travel.url) {
                                                            window.open(travel.url, '_blank');
                                                        }
                                                    }}
                                                >
                                                    {travel.title}
                                                    {travel.url && <FaLink className="ms-2" style={{ fontSize: '1rem' }} />}
                                                </h5>
                                                
                                                <div className="d-flex gap-2">
                                                    {travel.tags?.map((tag: string) => {
                                                        const tagConfig = TAG_CONFIG[tag as keyof typeof TAG_CONFIG];
                                                        if (!tagConfig) return null;
                                                        
                                                        const TagIcon = tagConfig.icon;
                                                        return (
                                                            <span 
                                                                key={tag}
                                                                className="badge"
                                                                style={{
                                                                    backgroundColor: tagConfig.color,
                                                                    color: 'white',
                                                                    padding: '5px 10px',
                                                                    borderRadius: '15px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '5px',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                            >
                                                                <TagIcon size={14} />
                                                                {tag}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="d-flex">
                                                <button
                                                    onClick={() => {
                                                        navigate(`/travel/edit/${travel._id}`, {
                                                            state: { travel }
                                                        });
                                                    }}
                                                    className="btn btn-link text-primary me-2"
                                                    style={{ padding: '4px' }}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(travel._id)}
                                                    className="btn btn-link text-danger"
                                                    style={{ padding: '4px' }}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center mt-3 pt-3" 
                                             style={{ borderTop: '1px solid #eee' }}>
                                            <div className="text-muted" style={{ fontSize: '1.1rem' }}>
                                                <FaCalendarAlt className="me-2" />
                                                {travel.startDate && (
                                                    <span>
                                                        {new Date(travel.startDate).toISOString().slice(0, 16).replace('T', ' ')}
                                                    </span>
                                                )}
                                                {travel.endDate && (
                                                    <span>
                                                        {travel.startDate ? ' - ' : ''}
                                                        {new Date(travel.endDate).toISOString().slice(0, 16).replace('T', ' ')}
                                                    </span>
                                                )}
                                            </div>

                                            {travel.budget > 0 && (
                                                <div 
                                                    className="text-muted"
                                                    style={{ 
                                                        cursor: 'pointer',
                                                        fontSize: '1.1rem'
                                                    }}
                                                    onClick={() => {
                                                        navigate('/expenses', {
                                                            state: {
                                                                amount: travel.budget,
                                                                description: travel.title,
                                                                date: travel.startDate
                                                            }
                                                        });
                                                    }}
                                                >
                                                    <FaDollarSign className="me-1" />
                                                    {travel.budget}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {travel.description && (
                                <div className="mt-3 text-muted" style={{
                                    borderTop: '1px solid #eee',
                                    paddingTop: '12px',
                                    fontSize: '1.1rem'
                                }}>
                                    <FaInfoCircle className="me-2" />
                                    {travel.description}
                                </div>
                            )}
                            {travel.address && (
                                <div className="mt-3" style={{
                                    borderTop: '1px solid #eee',
                                    paddingTop: '12px'
                                }}>
                                    <a
                                        href={`maps://?q=${encodeURIComponent(travel.address)}`}
                                        className="text-primary"
                                        style={{
                                            textDecoration: 'none',
                                            fontSize: '1.1rem',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <FaMapMarkerAlt className="me-2" />
                                        {travel.address}
                                    </a>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="alert alert-info">
                        没有符合所选标签的旅行计划
                    </div>
                )}
            </div>
        </div>
    );

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
                <TagFilters />

                <TravelSection
                    title="Tampa"
                    trips={tampaTrips}
                    destination="Tampa"
                />

                <TravelSection
                    title="Mexico"
                    trips={mexicoTrips}
                    destination="Mexico"
                />
            </div>
        </div>
    );
}
export default TravelList;
