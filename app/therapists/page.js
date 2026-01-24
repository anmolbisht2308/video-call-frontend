'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, X, Search, ChevronDown } from 'lucide-react';
import TherapistCard from '../../components/TherapistCard';
import styles from './page.module.css';

export default function TherapistsPage() {
    const [therapists, setTherapists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        gender: '',
        category: '',
        minPrice: '',
        maxPrice: '',
    });
    const [showFilters, setShowFilters] = useState(false); // Mobile toggle
    const router = useRouter();

    useEffect(() => {
        fetchTherapists();
    }, [filters]);

    const fetchTherapists = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await fetch(`http://localhost:5000/api/therapists?${query}`);
            const data = await res.json();
            setTherapists(data);
        } catch (error) {
            console.error('Error fetching therapists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value === prev[key] ? '' : value }));
    };

    const handleBook = (id) => {
        router.push(`/book/${id}`); // Or wherever booking happens
    };

    return (
        <div className={styles.container}>
            {/* Mobile Filter Toggle */}
            <button
                className={styles.mobileFilterToggle}
                onClick={() => setShowFilters(!showFilters)}
            >
                <Filter size={20} /> Filters
            </button>

            {/* Sidebar Filters */}
            <aside className={`${styles.sidebar} ${showFilters ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <h2>Filters</h2>
                    <button className={styles.closeSidebar} onClick={() => setShowFilters(false)}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.filterSection}>
                    <h3>Gender</h3>
                    <div className={styles.options}>
                        {['M', 'F', 'Other'].map(gender => (
                            <label key={gender} className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={filters.gender === gender}
                                    onChange={() => handleFilterChange('gender', gender)}
                                />
                                <span className={styles.checkmark}></span>
                                {gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : 'Other'}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Dynamic Categories could go here, for now hardcoded common ones or just generic */}

                <div className={styles.filterSection}>
                    <h3>Price Range</h3>
                    <div className={styles.priceInputs}>
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            className={styles.input}
                        />
                        <span>-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            className={styles.input}
                        />
                    </div>
                </div>

                <button className={styles.resetButton} onClick={() => setFilters({ gender: '', category: '', minPrice: '', maxPrice: '' })}>
                    Reset Filters
                </button>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                <div className={styles.header}>
                    <h1>Find your Therapist</h1>
                    <p>{therapists.length} specialists available</p>
                </div>

                {loading ? (
                    <div className={styles.loader}>Loading...</div>
                ) : (
                    <div className={styles.grid}>
                        {therapists.length > 0 ? (
                            therapists.map(therapist => (
                                <TherapistCard
                                    key={therapist._id}
                                    therapist={therapist}
                                    onBook={handleBook}
                                />
                            ))
                        ) : (
                            <div className={styles.noResults}>
                                <Search size={48} />
                                <h3>No therapists found</h3>
                                <p>Try adjusting your filters</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
