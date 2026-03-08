'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../lib/context/language-context';
import { useSchemesData } from '../../lib/hooks/use-schemes-data';
import { SchemeData } from '../../lib/services/schemes-data.service';

const CATEGORIES = [
  'Education',
  'Health',
  'Agriculture',
  'Housing',
  'Employment',
  'Social Welfare',
  'Financial Assistance',
  'Other',
];

const STATES = [
  'All India',
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Delhi',
  'Gujarat',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
];

export default function SchemesPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [filteredSchemes, setFilteredSchemes] = useState<SchemeData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const SCHEMES_PER_PAGE = 12;
  
  // Use ONLY JSON data - single source of truth
  const { schemes, isLoading, error } = useSchemesData();

  useEffect(() => {
    // Apply filters to ALL schemes from JSON
    if (schemes.length > 0) {
      // Display ALL schemes (no limit)
      let filtered = schemes;

      if (searchQuery) {
        const lowerSearch = searchQuery.toLowerCase();
        filtered = filtered.filter(s =>
          s.scheme_name?.toLowerCase().includes(lowerSearch) ||
          s.short_description?.toLowerCase().includes(lowerSearch) ||
          s.tags?.some((tag: string) => tag.toLowerCase().includes(lowerSearch))
        );
      }

      if (selectedCategory) {
        filtered = filtered.filter(s => 
          s.category?.toLowerCase() === selectedCategory.toLowerCase()
        );
      }

      if (selectedState && selectedState !== 'All India') {
        filtered = filtered.filter(s =>
          s.geographic_criteria?.toLowerCase().includes(selectedState.toLowerCase()) ||
          s.geographic_criteria?.toLowerCase() === 'all india'
        );
      }

      setFilteredSchemes(filtered);
    } else {
      setFilteredSchemes([]);
    }
  }, [schemes, searchQuery, selectedCategory, selectedState]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedState('');
    setCurrentPage(1);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredSchemes.length / SCHEMES_PER_PAGE);
  const startIndex = (currentPage - 1) * SCHEMES_PER_PAGE;
  const endIndex = startIndex + SCHEMES_PER_PAGE;
  const paginatedSchemes = filteredSchemes.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedState]);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #dbeafe 0%, #eff6ff 40%, #e0f2fe 70%, #f0fdf4 100%)' }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={() => router.push('/home')} 
            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center gap-2"
          >
            ← {t('home')}
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {t('allSchemes')}
          </h1>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchSchemes')}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white shadow-sm transition-all appearance-none cursor-pointer"
              >
                <option value="">{t('filterByCategory')}</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* State Filter */}
            <div>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white shadow-sm transition-all appearance-none cursor-pointer"
              >
                <option value="">{t('filterByState')}</option>
                {STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedCategory || selectedState) && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-600">
                {language === 'hi' ? 'सक्रिय फ़िल्टर:' : 'Active filters:'}
              </span>
              {searchQuery && (
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {searchQuery}
                </span>
              )}
              {selectedCategory && (
                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {selectedCategory}
                </span>
              )}
              {selectedState && (
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {selectedState}
                </span>
              )}
              <button
                onClick={handleClearFilters}
                className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                {t('cancel')} ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Count */}
        {!isLoading && (
          <div className="mb-6 flex items-center justify-between">
            <div className="text-gray-700 font-medium">
              {language === 'hi' 
                ? `${filteredSchemes.length} योजनाएं मिलीं` 
                : `${filteredSchemes.length} schemes found`}
              {totalPages > 1 && (
                <span className="text-gray-500 ml-2">
                  ({language === 'hi' ? 'पृष्ठ' : 'Page'} {currentPage} {language === 'hi' ? 'का' : 'of'} {totalPages})
                </span>
              )}
            </div>
            {totalPages > 1 && (
              <div className="text-sm text-gray-600">
                {language === 'hi' 
                  ? `${startIndex + 1}-${Math.min(endIndex, filteredSchemes.length)} दिखा रहे हैं`
                  : `Showing ${startIndex + 1}-${Math.min(endIndex, filteredSchemes.length)}`}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium">{t('error')}</p>
            <p className="text-red-600 text-sm mt-2">{error}</p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && filteredSchemes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-600 mb-2">{t('noResults')}</p>
            <p className="text-gray-500">
              {language === 'hi' 
                ? 'अपनी खोज या फ़िल्टर बदलने का प्रयास करें' 
                : 'Try changing your search or filters'}
            </p>
          </div>
        )}

        {/* Schemes Grid */}
        {!isLoading && !error && paginatedSchemes.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedSchemes.map((scheme) => (
              <div 
                key={scheme.scheme_id} 
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border border-gray-100 hover:border-blue-200 hover:-translate-y-1"
                onClick={() => {
                  console.log('[Card Click] Navigating to scheme:', scheme.scheme_id);
                  router.push(`/schemes/${scheme.scheme_id}`);
                }}
              >
                {/* Category Badge */}
                <div className="mb-3">
                  <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                    {scheme.category}
                  </span>
                </div>

                {/* Scheme Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                  {language === 'hi' && scheme.scheme_name_hi 
                    ? scheme.scheme_name_hi
                    : scheme.scheme_name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                  {scheme.short_description}
                </p>

                {/* Details */}
                <div className="space-y-2 text-sm border-t border-gray-100 pt-4 mb-4">
                  {scheme.geographic_criteria && scheme.geographic_criteria !== 'All India' && (
                    <div className="flex items-center text-gray-700">
                      <span className="mr-2">📍</span>
                      <span className="font-medium">{scheme.geographic_criteria}</span>
                    </div>
                  )}
                  {scheme.financial_assistance && (
                    <div className="flex items-center text-green-700 font-semibold">
                      <span className="mr-2">💰</span>
                      <span>{scheme.financial_assistance}</span>
                    </div>
                  )}
                  {scheme.benefit_type && (
                    <div className="flex items-center text-gray-700">
                      <span className="mr-2">🎁</span>
                      <span className="text-xs">{scheme.benefit_type}</span>
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('[View Details] Button clicked for scheme:', scheme.scheme_id);
                    console.log('[View Details] Target URL:', `/schemes/${scheme.scheme_id}`);
                    router.push(`/schemes/${scheme.scheme_id}`);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-semibold shadow-sm hover:shadow-md"
                >
                  {t('viewDetails')} →
                </button>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                }`}
              >
                ← {language === 'hi' ? 'पिछला' : 'Previous'}
              </button>

              {/* Page Numbers */}
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  // Show first page, last page, current page, and pages around current
                  const showPage = 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1);
                  
                  const showEllipsis = 
                    (page === currentPage - 2 && currentPage > 3) ||
                    (page === currentPage + 2 && currentPage < totalPages - 2);

                  if (showEllipsis) {
                    return (
                      <span key={page} className="px-3 py-2 text-gray-400">
                        ...
                      </span>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-all ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                          : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                }`}
              >
                {language === 'hi' ? 'अगला' : 'Next'} →
              </button>
            </div>
          )}
        </>
        )}
      </main>
    </div>
  );
}
