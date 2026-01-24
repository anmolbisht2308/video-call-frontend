import styles from './TherapistCard.module.css';
import { Star, CheckCircle } from 'lucide-react';

export default function TherapistCard({ therapist, onBook }) {
    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <img src={therapist.image} alt={therapist.name} className={styles.image} />
                {therapist.expert && (
                    <div className={styles.expertBadge}>
                        <CheckCircle size={14} className={styles.icon} /> Expert
                    </div>
                )}
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <h3 className={styles.name}>{therapist.name}</h3>
                    <span className={styles.rating}>
                        <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
                        <span className={styles.ratingValue}>
                            {(therapist.stars.reduce((a, b) => a + b, 0) / therapist.stars.length || 5).toFixed(1)}
                        </span>
                    </span>
                </div>

                <p className={styles.title}>{therapist.title}</p>

                <div className={styles.tags}>
                    {therapist.specialization.slice(0, 3).map((spec, i) => (
                        <span key={i} className={styles.tag}>{spec}</span>
                    ))}
                    {therapist.specialization.length > 3 && (
                        <span className={styles.tag}>+{therapist.specialization.length - 3} more</span>
                    )}
                </div>

                <div className={styles.meta}>
                    <p className={styles.experience}>{therapist.yoe} Yrs Exp</p>
                    <p className={styles.language}>{therapist.languages_known.join(', ')}</p>
                </div>

                <div className={styles.footer}>
                    <div className={styles.priceContainer}>
                        {therapist.discounted_price ? (
                            <>
                                <span className={styles.originalPrice}>₹{therapist.price}</span>
                                <span className={styles.price}>₹{therapist.discounted_price}</span>
                            </>
                        ) : (
                            <span className={styles.price}>₹{therapist.price}</span>
                        )}
                        <span className={styles.perSession}>/ session</span>
                    </div>

                    <button className={styles.bookButton} onClick={() => onBook(therapist._id)}>
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
}
