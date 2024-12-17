import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as client from './client';
import { testConnection } from './client';
import { FaTrash, FaEdit, FaDollarSign, FaCalendarAlt, FaInfoCircle, FaLink,FaPlus, FaWallet, FaMapMarkerAlt, FaBed } from 'react-icons/fa';

function TravelList() {
    const [travels, setTravels] = useState<any[]>([]);
    const navigate = useNavigate();

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

    const TravelSection = ({ title, trips, destination }: { title: string, trips: any[], destination: string }) => (
        <div className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>{title}</h2>
                <Link
                    to="/travel/new"
                    state={{ defaultDestination: destination }}
                    className="btn btn-primary"
                >
                    <FaPlus/>
                </Link>
            </div>
            <div className="travel-list">
                {trips.map((travel) => (
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
                                <div className="d-flex justify-content-between align-items-start">
                                    <h5 
                                        className="card-title mb-0" 
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
                                    </h5>

                                    <div className="d-flex align-items-center" style={{ gap: '25px', fontSize: '1.2rem' }}>
                                        {travel.url && (
                                            <div className="text-muted">
                                                <FaLink />
                                            </div>
                                        )}

                                        {(travel.startDate || travel.endDate) && (
    <div className="text-muted">
        <FaCalendarAlt />
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
)}

                                        {travel.budget > 0 && (
                                            <div className="text-muted">
                                                <FaDollarSign />
                                                {travel.budget}
                                            </div>
                                        )}

                                        <div className="d-flex">
                                            <button
                                                onClick={() => {
                                                    navigate(`/travel/edit/${travel._id}`, {
                                                        state: {
                                                            travel,
                                                            editMode: true,
                                                            defaultDestination: travel.destination,
                                                            title: travel.title,
                                                            startDate: travel.startDate,
                                                            endDate: travel.endDate,
                                                            budget: travel.budget,
                                                            description: travel.description,
                                                            url: travel.url
                                                        }
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
                                                style={{
                                                    padding: '8px',
                                                    fontSize: '1.2rem'
                                                }}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
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
                ))}

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
