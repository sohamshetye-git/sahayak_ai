import { useState } from 'react';
import { Search, Filter, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { schemes, categories } from '../data/schemes';
import { motion } from 'motion/react';

export default function ExploreSchemesPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = schemes.filter((s) => {
    const matchCat = activeCategory === 'All' || s.category === activeCategory;
    const matchQ = !query || s.name.toLowerCase().includes(query.toLowerCase()) || s.description.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl text-gray-900 mb-1">Explore Government Schemes</h1>
        <p className="text-sm text-gray-500">Browse and find schemes that match your needs</p>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search schemes..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white text-gray-700 placeholder-gray-400"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors">
          <Filter size={15} />
          Filter
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              activeCategory === cat
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Scheme Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((scheme, i) => (
          <motion.div
            key={scheme.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/scheme/${scheme.id}`)}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: scheme.color + '20' }}
              >
                {scheme.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: scheme.color + '20', color: scheme.color }}
                >
                  {scheme.category}
                </span>
                <h3 className="text-sm text-gray-900 mt-1 leading-tight">{scheme.name}</h3>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">{scheme.description}</p>

            <div
              className="text-sm mb-3 px-3 py-2 rounded-lg"
              style={{ backgroundColor: scheme.color + '15', color: scheme.color }}
            >
              {scheme.benefit}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-orange-500">📅 {scheme.deadline}</span>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/scheme/${scheme.id}`); }}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
              >
                View Details <ChevronRight size={12} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>No schemes found matching your search.</p>
        </div>
      )}
    </div>
  );
}
