import React from 'react';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-800 text-gray-300 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">AutoKosova</h3>
                        <p className="text-sm">
                            Your trusted car marketplace and rental platform in Kosovo.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/" className="hover:text-white transition">Browse Cars</a></li>
                            <li><a href="/about" className="hover:text-white transition">About Us</a></li>
                            <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
                            <li><a href="/faq" className="hover:text-white transition">FAQ</a></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/help" className="hover:text-white transition">Help Center</a></li>
                            <li><a href="/terms" className="hover:text-white transition">Terms of Service</a></li>
                            <li><a href="/privacy" className="hover:text-white transition">Privacy Policy</a></li>
                            <li><a href="/cookies" className="hover:text-white transition">Cookie Policy</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
                        <ul className="space-y-2 text-sm">
                            <li>📧 <a href="mailto:info@autokosova.com" className="hover:text-white transition">info@autokosova.com</a></li>
                            <li>📞 <a href="tel:+38349123456" className="hover:text-white transition">+383 49 123 456</a></li>
                            <li>📍 Prishtina, Kosovo</li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center text-sm">
                        <p>&copy; {currentYear} AutoKosova. All rights reserved.</p>
                        <div className="flex gap-4 mt-4 md:mt-0">
                            <a href="#" className="hover:text-white transition">Facebook</a>
                            <a href="#" className="hover:text-white transition">Twitter</a>
                            <a href="#" className="hover:text-white transition">Instagram</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
