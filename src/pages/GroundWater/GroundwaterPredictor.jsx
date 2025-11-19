import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GroundwaterPredictor = () => {
  const [formData, setFormData] = useState({
    state: "",
    district: "",
    tehsil: "",
    village: "",
    year: ""
  });
  const [options, setOptions] = useState({
    states: [],
    districts: [],
    tehsils: [],
    villages: []
  });
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState({
    states: false,
    districts: false,
    tehsils: false,
    villages: false
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch all states on component mount
  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    setLoadingOptions(prev => ({ ...prev, states: true }));
    try {
      const response = await fetch('/api/states');
      if (!response.ok) throw new Error('Failed to fetch states');
      const states = await response.json();
      setOptions(prev => ({ ...prev, states }));
    } catch (err) {
      setError('Failed to load states');
    } finally {
      setLoadingOptions(prev => ({ ...prev, states: false }));
    }
  };

  const fetchDistricts = async (state) => {
    if (!state) return;
    setLoadingOptions(prev => ({ ...prev, districts: true }));
    try {
      const response = await fetch(`/api/districts/${encodeURIComponent(state)}`);
      if (!response.ok) throw new Error('Failed to fetch districts');
      const districts = await response.json();
      setOptions(prev => ({ ...prev, districts }));
    } catch (err) {
      setError('Failed to load districts');
    } finally {
      setLoadingOptions(prev => ({ ...prev, districts: false }));
    }
  };

  const fetchTehsils = async (state, district) => {
    if (!state || !district) return;
    setLoadingOptions(prev => ({ ...prev, tehsils: true }));
    try {
      const response = await fetch(`/api/tehsils/${encodeURIComponent(state)}/${encodeURIComponent(district)}`);
      if (!response.ok) throw new Error('Failed to fetch tehsils');
      const tehsils = await response.json();
      setOptions(prev => ({ ...prev, tehsils }));
    } catch (err) {
      setError('Failed to load tehsils');
    } finally {
      setLoadingOptions(prev => ({ ...prev, tehsils: false }));
    }
  };

  const fetchVillages = async (state, district, tehsil) => {
    if (!state || !district || !tehsil) return;
    setLoadingOptions(prev => ({ ...prev, villages: true }));
    try {
      const response = await fetch(`/api/villages/${encodeURIComponent(state)}/${encodeURIComponent(district)}/${encodeURIComponent(tehsil)}`);
      if (!response.ok) throw new Error('Failed to fetch villages');
      const villages = await response.json();
      setOptions(prev => ({ ...prev, villages }));
    } catch (err) {
      setError('Failed to load villages');
    } finally {
      setLoadingOptions(prev => ({ ...prev, villages: false }));
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset dependent fields when parent field changes
      ...(name === 'state' && { district: '', tehsil: '', village: '' }),
      ...(name === 'district' && { tehsil: '', village: '' }),
      ...(name === 'tehsil' && { village: '' })
    }));

    // Fetch dependent data when parent field changes
    if (name === 'state' && value) {
      setOptions(prev => ({ ...prev, districts: [], tehsils: [], villages: [] }));
      await fetchDistricts(value);
    } else if (name === 'district' && value && formData.state) {
      setOptions(prev => ({ ...prev, tehsils: [], villages: [] }));
      await fetchTehsils(formData.state, value);
    } else if (name === 'tehsil' && value && formData.state && formData.district) {
      setOptions(prev => ({ ...prev, villages: [] }));
      await fetchVillages(formData.state, formData.district, value);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Navigate to trend results page with all predictions
      navigate('/groundwater/result', { 
        state: { 
          predictions: data,  // This contains multiple years data
          formData: formData 
        } 
      });
    } catch (err) {
      setError(err.message || 'Prediction failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Groundwater Level Predictor
        </h1>
        
        <form onSubmit={handlePredict} className="space-y-4 mb-6">
          {/* State Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select State</option>
              {options.states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {loadingOptions.states && (
              <p className="text-sm text-gray-500 mt-1">Loading states...</p>
            )}
          </div>

          {/* District Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District
            </label>
            <select
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              required
              disabled={!formData.state || loadingOptions.districts}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select District</option>
              {options.districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            {loadingOptions.districts && (
              <p className="text-sm text-gray-500 mt-1">Loading districts...</p>
            )}
          </div>

          {/* Tehsil Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tehsil
            </label>
            <select
              name="tehsil"
              value={formData.tehsil}
              onChange={handleInputChange}
              required
              disabled={!formData.district || loadingOptions.tehsils}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select Tehsil</option>
              {options.tehsils.map((tehsil) => (
                <option key={tehsil} value={tehsil}>
                  {tehsil}
                </option>
              ))}
            </select>
            {loadingOptions.tehsils && (
              <p className="text-sm text-gray-500 mt-1">Loading tehsils...</p>
            )}
          </div>

          {/* Village Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Village
            </label>
            <select
              name="village"
              value={formData.village}
              onChange={handleInputChange}
              required
              disabled={!formData.tehsil || loadingOptions.villages}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select Village</option>
              {options.villages.map((village) => (
                <option key={village} value={village}>
                  {village}
                </option>
              ))}
            </select>
            {loadingOptions.villages && (
              <p className="text-sm text-gray-500 mt-1">Loading villages...</p>
            )}
          </div>

          {/* Year Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year (2024-2100)
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              required
              min="2024"
              max="2100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter year (2024-2100)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Will show predictions for 3 years before and after this year
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Predicting...
              </span>
            ) : (
              'Predict Groundwater Level'
            )}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <strong className="font-medium">Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroundwaterPredictor;