'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Briefcase, BookOpen, Clock, DollarSign, Star, Save, ArrowRight, Upload, Activity, CheckCircle, AlertCircle } from 'lucide-react';

export default function Profile() {
    const { user, loading } = useAuth();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false); // True if profile exists
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        name: '',
        title: '',
        phone_number: '',
        category: '',
        therapist_gender: 'M',
        education: '',
        yoe: '',
        specialization: '',
        languages_known: '',
        thoughts_on_counselling: '',
        therapy_approach: '',
        about: '',
        image: '',
        price: '',
        discounted_price: '',
        expert: false,
        availability: {},
        availability_overrides: {}
    });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user && user.role === 'therapist') {
            fetchProfile();
        } else if (user && user.role !== 'therapist') {
            router.push('/');
        }
    }, [user, loading, router]);

    const fetchProfile = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/therapists/profile/me', {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setIsEditing(true);
                setFormData({
                    ...data,
                    education: data.education.join(', '),
                    specialization: data.specialization.join(', '),
                    languages_known: data.languages_known.join(', ')
                });
            } else {
                // Profile doesn't exist, we are in "Create" mode
                setIsEditing(false);
                setFormData(prev => ({ ...prev, name: user.username, email: user.email }));
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        // Transform arrays
        const payload = {
            ...formData,
            education: formData.education.split(',').map(s => s.trim()).filter(Boolean),
            specialization: formData.specialization.split(',').map(s => s.trim()).filter(Boolean),
            languages_known: formData.languages_known.split(',').map(s => s.trim()).filter(Boolean),
            yoe: Number(formData.yoe),
            price: Number(formData.price),
            discounted_price: Number(formData.discounted_price)
        };

        const url = isEditing
            ? 'http://localhost:5000/api/therapists/profile/me'
            : 'http://localhost:5000/api/therapists';

        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to save profile');
            }

            const data = await res.json();
            setIsEditing(true);
            setMessage({ type: 'success', text: isEditing ? 'Profile updated successfully!' : 'Profile created successfully!' });

            // Re-map for form state
            setFormData({
                ...data,
                education: data.education.join(', '),
                specialization: data.specialization.join(', '),
                languages_known: data.languages_known.join(', ')
            });

            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            setMessage({ type: 'error', text: error.message });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                <Activity className="animate-spin mr-2" /> Loading Profile...
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-6rem)] p-6 md:p-12 max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
                    {isEditing ? 'Manage Your Profile' : 'Create Your Profile'}
                </h1>
                <p className="text-muted-foreground text-lg">
                    {isEditing
                        ? 'Update your professional details to attract more clients.'
                        : 'Fill in your details to get listed on our platform.'}
                </p>
            </motion.div>

            {/* Notification Banner */}
            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mb-8 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                    >
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info Section */}
                <Section title="Basic Information" icon={<User size={20} />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Check your Name in Profile" name="name" value={formData.name} onChange={handleChange} placeholder="Dr. Jane Doe" icon={<User size={16} />} disabled={true} />
                        <Input label="Professional Title" name="title" value={formData.title} onChange={handleChange} placeholder="Clinical Psychologist" icon={<Briefcase size={16} />} required />
                        <Input label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="+1 234 567 890" icon={<Phone size={16} />} />

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Gender</label>
                            <div className="relative">
                                <select
                                    name="therapist_gender"
                                    value={formData.therapist_gender}
                                    onChange={handleChange}
                                    className="w-full bg-background border border-border rounded-xl pl-4 pr-10 py-3 text-foreground outline-none focus:border-primary transition-all appearance-none cursor-pointer"
                                >
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <Input label="Profile Image URL" name="image" value={formData.image} onChange={handleChange} placeholder="https://example.com/photo.jpg" icon={<Upload size={16} />} required />
                        {formData.image && (
                            <div className="md:col-span-2 flex justify-center mt-4">
                                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-border shadow-xl">
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        )}
                    </div>
                </Section>

                {/* Professional Details Section */}
                <Section title="Professional Details" icon={<BookOpen size={20} />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Category" name="category" value={formData.category} onChange={handleChange} placeholder="Psychology, Coaching..." icon={<Briefcase size={16} />} />
                        <Input label="Years of Experience" name="yoe" type="number" value={formData.yoe} onChange={handleChange} placeholder="5" icon={<Clock size={16} />} required />

                        <div className="md:col-span-2">
                            <Input label="Education (comma separated)" name="education" value={formData.education} onChange={handleChange} placeholder="PhD in Psychology, MA in Counseling" icon={<BookOpen size={16} />} required />
                        </div>

                        <div className="md:col-span-2">
                            <Input label="Specializations (comma separated)" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="Anxiety, Depression, Trauma" icon={<Star size={16} />} required />
                        </div>

                        <div className="md:col-span-2">
                            <Input label="Languages Known (comma separated)" name="languages_known" value={formData.languages_known} onChange={handleChange} placeholder="English, Spanish, Hindi" icon={<Activity size={16} />} required />
                        </div>
                    </div>
                </Section>

                {/* Pricing Section */}
                <Section title="Pricing & Services" icon={<DollarSign size={20} />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Price per Session (₹)" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="1500" icon={<DollarSign size={16} />} required />
                        <Input label="Discounted Price (₹)" name="discounted_price" type="number" value={formData.discounted_price} onChange={handleChange} placeholder="1200" icon={<DollarSign size={16} />} />
                    </div>
                </Section>

                {/* Bio & Approach Section */}
                <Section title="About & Approach" icon={<Activity size={20} />}>
                    <div className="space-y-6">
                        <TextArea label="About You" name="about" value={formData.about} onChange={handleChange} placeholder="Tell us about your background and passion..." required />
                        <TextArea label="Therapy Approach" name="therapy_approach" value={formData.therapy_approach} onChange={handleChange} placeholder="How do you conduct your sessions?" required />
                        <TextArea label="Thoughts on Counselling" name="thoughts_on_counselling" value={formData.thoughts_on_counselling} onChange={handleChange} placeholder="What is your philosophy?" required />
                    </div>
                </Section>

                {/* Availability Section */}
                <Section title="Weekly Availability" icon={<Clock size={20} />}>
                    <AvailabilityEditor
                        value={{
                            weekly: formData.availability,
                            overrides: formData.availability_overrides
                        }}
                        onChange={({ weekly, overrides }) => setFormData(prev => ({
                            ...prev,
                            availability: weekly,
                            availability_overrides: overrides
                        }))}
                    />
                </Section>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Activity className="animate-spin" /> : <Save size={20} />}
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
}

// Reusable Components
import AvailabilityEditor from '@/components/AvailabilityEditor';

function Section({ title, icon, children }) {
    return (
        <div className="glass p-8 rounded-3xl border border-border/50">
            <div className="flex items-center gap-3 mb-8 border-b border-border/50 pb-4">
                <div className="p-2 bg-secondary rounded-lg text-primary">
                    {icon}
                </div>
                <h2 className="text-xl font-bold text-foreground">{title}</h2>
            </div>
            {children}
        </div>
    );
}

function Input({ label, name, value, onChange, placeholder, type = "text", icon, required, disabled }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground ml-1 flex items-center gap-1">
                {label} {required && <span className="text-destructive">*</span>}
            </label>
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`w-full bg-background border border-border rounded-xl ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3 text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                />
            </div>
        </div>
    );
}

function TextArea({ label, name, value, onChange, placeholder, required }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground ml-1 flex items-center gap-1">
                {label} {required && <span className="text-destructive">*</span>}
            </label>
            <textarea
                name={name}
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                rows={4}
                className="w-full bg-background border border-border rounded-xl p-4 text-foreground placeholder-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none"
            />
        </div>
    );
}

// Icon helper
function MessageSquareIcon({ size }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
    )
}
