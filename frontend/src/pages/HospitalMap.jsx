import { useEffect } from 'react';

/**
 * HospitalMap Component
 * Integrates the MEDIVISION Hospital Finder Map module
 * Displays an interactive map for finding nearby hospitals, clinics, and pharmacies
 */
export default function HospitalMap() {
    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white py-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2">🗺️ Hospital Finder Map</h1>
                    <p className="text-blue-100 text-lg">
                        Find nearby hospitals, clinics, and pharmacies in Pune
                    </p>
                </div>
            </div>

            {/* Map Container */}
            <div className="w-full h-screen">
                <iframe
                    src="/map-module/index.html"
                    className="w-full h-full border-0"
                    title="MEDIVISION Hospital Finder Map"
                    allow="geolocation"
                    style={{ borderRadius: '0' }}
                />
            </div>

            {/* Info Section at Bottom */}
            <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl mb-2">🏥</div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                                Find Hospitals
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Locate nearby hospitals with detailed information
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl mb-2">📍</div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                                Your Location
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Get your current position on the map instantly
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl mb-2">🔍</div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                                Smart Search
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Search by location, hospital name, or area
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
